import { request, response } from 'express'
import { check, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import multer from 'multer'
import shortid from 'shortid'
import * as url from 'url'
import fs from 'fs'

import Usuario from '../models/Usuario.js'
import { emailRegistro } from '../helpers/email.js'
import generarJwt from '../helpers/generarJwt.js'

const mostrarFormularioCrearCuenta = (req = request, res = response) => {
  res.render('crear-cuenta', {
    nombrePagina: 'Crea Tu Cuenta'
  })
}

const crearNuevaCuenta = async (req = request, res = response) => {
  const { email, nombre, password } = req.body

  await check('email').isEmail().withMessage('El email no es válido').run(req)
  await check('nombre').notEmpty().withMessage('El nombre no puede estar vacío').run(req)
  await check('password').notEmpty().withMessage('El password no puede estar vacío').run(req)
  await check('password2').equals(password).withMessage('Los passwords no son iguales').run(req)

  const errores = validationResult(req).array().map(error => error.msg)

  if (errores.length > 0) {
    req.flash('error', errores)
    return res.redirect('/crear-cuenta')
  }

  //* Verificar si email existe
  const usuarioObtenido = await Usuario.findOne({ where: { email } })

  if (usuarioObtenido) {
    req.flash('error', ['Este email ya existe'])
    return res.redirect('/crear-cuenta')
  }

  //* Registrar en base de datos
  try {
    await Usuario.create({ email, nombre, password })

    //* Enviar email de confirmación
    await emailRegistro({ nombre, email })

    req.flash('exito', ['Hemos enviado un E-mail, confirma tu cuenta'])
    return res.redirect('/iniciar-sesion')
  } catch (error) {
    console.log(error)
  }
}

const mostrarConfirmarCuenta = async (req = request, res = response) => {
  const { email } = req.params

  //* Verificar si existe email
  const usuarioObtenido = await Usuario.findOne({ where: { email } })

  if (!usuarioObtenido) {
    req.flash('error', ['No existe esta cuenta'])
    return res.redirect('/crear-cuenta')
  }

  //* Si existe, confirmar suscripción
  usuarioObtenido.activo = 1
  await usuarioObtenido.save()

  req.flash('exito', 'La cuenta se ha confirmado, ya puede iniciar sesión')
  res.redirect('/iniciar-sesion')
}

const mostrarFormularioInicarSesion = (req = request, res = response) => {
  res.render('iniciar-sesion', {
    nombrePagina: 'Iniciar Sesión'
  })
}

const iniciarSesion = async (req = request, res = response) => {
  const { email, password } = req.body

  await check('email').isEmail().withMessage('El email no es válido').run(req)
  await check('password').notEmpty().withMessage('El password no puede estar vacío').run(req)

  const errores = validationResult(req).array().map(error => error.msg)

  if (errores.length > 0) {
    req.flash('error', errores)
    return res.redirect('/iniciar-sesion')
  }

  const usuarioObtenido = await Usuario.findOne({ where: { email } })

  //* Verificar si email existe
  if (!usuarioObtenido) {
    req.flash('error', ['El email no ha sido registrado'])
    return res.redirect('/iniciar-sesion')
  }

  //* Verificar confirmacion
  if (!usuarioObtenido.activo) {
    req.flash('error', ['La cuenta no ha sido confirmada'])
    return res.redirect('/iniciar-sesion')
  }

  //* Verificar password
  if (!usuarioObtenido.validarPassword(password)) {
    req.flash('error', ['El password es incorrecto'])
    return res.redirect('/iniciar-sesion')
  }

  const { id, nombre } = usuarioObtenido
  const token = generarJwt({ id, nombre })

  return res.cookie('_token', token, {
    httpOnly: true
  }).redirect('/administracion')
}

const mostrarFormEditarPerfil = async (req = request, res = response) => {
  const usuario = await Usuario.findByPk(req.usuario.id)

  res.render('editar-perfil', {
    nombrePagina: 'Editar Perfil',
    usuario
  })
}

const editarPerfil = async (req = request, res = response) => {
  await check('nombre').notEmpty().withMessage('El nombre no puede estar vacío').run(req)
  await check('email').notEmpty().withMessage('El email no puede estar vacío').run(req)

  const errores = validationResult(req).array().map(error => error.msg)

  if (errores.length > 0) {
    req.flash('error', errores)
    return res.redirect('/editar-perfil')
  }

  const { nombre, descripcion, email } = req.body
  const usuario = await Usuario.findByPk(req.usuario.id)

  usuario.nombre = nombre
  usuario.descripcion = descripcion
  usuario.email = email

  await usuario.save()
  req.flash('exito', ['Perfil editado correctamente'])
  res.redirect('/administracion')
}

const mostrarFormPassword = async (req = request, res = response) => {
  res.render('cambiar-password', {
    nombrePagina: 'Cambiar Password'
  })
}

const modificarPassword = async (req = request, res = response) => {
  const usuario = await Usuario.findByPk(req.usuario.id)
  let { passwordAnterior, passwordNuevo } = req.body

  //* Verificar el password anterior
  if (!usuario.validarPassword(passwordAnterior)) {
    req.flash('error', ['El password actual es incorrecto'])
    return res.redirect('/cambiar-password')
  }

  //* Si el password es correcto, hashear el nuevo
  const salt = bcrypt.genSaltSync(10)
  passwordNuevo = bcrypt.hashSync(passwordNuevo, salt)
  console.log(passwordNuevo)

  //* Guardar en la base de datos
  usuario.password = passwordNuevo
  await usuario.save()
  req.flash('exito', ['Password modificado correctamente, vuelve a iniciar sesión'])
  res.redirect('/iniciar-sesion')
}

const mostrarFormImagenPerfil = async (req = request, res = response) => {
  const usuario = await Usuario.findByPk(req.usuario.id)

  res.render('imagen-perfil', {
    nombrePagina: 'Subir Imagen Perfil',
    usuario
  })
}

//* Subir imagenes
const configuracionMulter = {
  limits: { fileSize: 200000 }, // * Tamaño maximo 200KB
  storage: multer.diskStorage({
    destination: (req, file, next) => {
      const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
      next(null, __dirname + '/../public/uploads/perfiles/')
    },
    filename: (req, file, next) => {
      const extension = file.mimetype.split('/')[1]
      next(null, `${shortid.generate()}.${extension}`)
    }
  }),
  fileFilter (req, file, next) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      return next(null, true)
    } else {
      return next(new Error('Formato no válido'), false)
    }
  }
}

const upload = multer(configuracionMulter).single('imagen')

const subirImagen = (req = request, res = response, next) => {
  upload(req, res, function (error) {
    if (error) {
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          req.flash('error', 'El archivo es muy grande')
        } else {
          req.flash('error', error.message)
        }
      } else if (error.hasOwnProperty('message')) {
        req.flash('error', error.message)
      }
      return res.redirect('back')
    } else {
      next()
    }
  })
}

const subirImagenPerfil = async (req = request, res = response) => {
  const usuario = await Usuario.findByPk(req.usuario.id)

  //* Si hay imagen anterior y nueva, borrar la anterior
  if (req.file && usuario.img) {
    const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
    const imagenAnteriorPath = __dirname + `/../public/uploads/perfiles/${usuario.img}`

    //* Eliminar archivo
    fs.unlinkSync(imagenAnteriorPath, (error) => {
      return console.log(error)
    })
  }

  //* Si hay imagen nueva
  if (req.file) {
    usuario.img = req.file.filename
  }

  await usuario.save()
  req.flash('exito', 'Imagen subida correctamente')
  res.redirect('/administracion')
}

export {
  mostrarFormularioCrearCuenta,
  crearNuevaCuenta,
  mostrarConfirmarCuenta,
  mostrarFormularioInicarSesion,
  iniciarSesion,
  mostrarFormEditarPerfil,
  editarPerfil,
  mostrarFormPassword,
  modificarPassword,
  mostrarFormImagenPerfil,
  subirImagen,
  subirImagenPerfil
}
