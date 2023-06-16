import { request, response } from 'express'
import { check, validationResult } from 'express-validator'

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

export {
  mostrarFormularioCrearCuenta,
  crearNuevaCuenta,
  mostrarConfirmarCuenta,
  mostrarFormularioInicarSesion,
  iniciarSesion,
  mostrarFormEditarPerfil,
  editarPerfil
}
