import { request, response } from 'express'
import { check, validationResult } from 'express-validator'
import multer from 'multer'
import shortid from 'shortid'
import * as url from 'url'
import fs from 'fs'

import Categoria from '../models/Categoria.js'
import Grupo from '../models/Grupo.js'

const mostrarFormularioGrupo = async (req = request, res = response) => {
  const categorias = await Categoria.findAll()

  res.render('nuevo-grupo', {
    nombrePagina: 'Crea Nuevo Grupo',
    categorias
  })
}

//* Subir imagenes
const configuracionMulter = {
  limits: { fileSize: 200000 }, // * Tamaño maximo 200KB
  storage: multer.diskStorage({
    destination: (req, file, next) => {
      const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
      next(null, __dirname + '/../public/uploads/grupos/')
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

//* Crear nuevo grupo
const crearNuevoGrupo = async (req = request, res = response) => {
  const { nombre, descripcion, categoria: categoriaId, sitioWeb } = req.body
  const { id: usuarioId } = req.usuario
  const imagen = req.file?.filename ?? ''

  await check('nombre').notEmpty().withMessage('El nombre no puede estar vacío').run(req)
  await check('descripcion').notEmpty().withMessage('La descripción no puede estar vacío').run(req)
  await check('categoria').notEmpty().withMessage('La categoría no puede estar vacío').run(req)

  const errores = validationResult(req).array().map(error => error.msg)

  if (errores.length > 0) {
    req.flash('error', errores)
    return res.redirect('/nuevo-grupo')
  }

  try {
    await Grupo.create({ nombre, descripcion, sitioWeb, imagen, categoriaId, usuarioId })
    req.flash('exito', ['Se ha creado el grupo correctamente'])
    return res.redirect('/administracion')
  } catch (error) {
    console.log(error)
    req.flash('error', error.message)
    return res.redirect('/nuevo-grupo')
  }
}

const mostrarFormEditarGrupo = async (req = request, res = response) => {
  const [grupoObtenido, categorias] = await Promise.all([
    Grupo.findOne({ where: { id: req.params.id, usuarioId: req.usuario.id } }),
    Categoria.findAll()
  ])

  if (!grupoObtenido) {
    req.flash('error', ['Operación no válida'])
    return res.redirect('/administracion')
  }

  res.render('editar-grupo', {
    nombrePagina: `Editar Grupo: ${grupoObtenido.nombre}`,
    grupo: grupoObtenido,
    categorias
  })
}

const editarGrupo = async (req = request, res = response) => {
  const grupoObtenido = await Grupo.findOne({ where: { id: req.params.id, usuarioId: req.usuario.id } })

  if (!grupoObtenido) {
    req.flash('error', ['Operación no válida'])
    return res.redirect('/administracion')
  }

  const { nombre, descripcion, categoria: categoriaId, sitioWeb } = req.body

  grupoObtenido.nombre = nombre
  grupoObtenido.descripcion = descripcion
  grupoObtenido.categoriaId = categoriaId
  grupoObtenido.sitioWeb = sitioWeb

  await grupoObtenido.save()
  req.flash('exito', 'Cambios Guardados Correctamente')
  return res.redirect('/administracion')
}

const mostrarFormImagenGrupo = async (req = request, res = response) => {
  const grupoObtenido = await Grupo.findOne({ where: { id: req.params.id, usuarioId: req.usuario.id } })

  if (!grupoObtenido) {
    req.flash('error', ['Operación no válida'])
    return res.redirect('/administracion')
  }

  res.render('imagen-grupo', {
    nombrePagina: `Editar Imagen Grupo: ${grupoObtenido.nombre}`,
    grupo: grupoObtenido
  })
}

const modificarImagen = async (req = request, res = response) => {
  const grupoObtenido = await Grupo.findOne({ where: { id: req.params.id, usuarioId: req.usuario.id } })

  if (!grupoObtenido) {
    req.flash('error', ['Operación no válida'])
    return res.redirect('/administracion')
  }

  //* Si hay imagen anterior y nueva, borrar la anterior
  if (req.file && grupoObtenido.imagen) {
    const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
    const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupoObtenido.imagen}`

    //* Eliminar archivo
    fs.unlinkSync(imagenAnteriorPath, (error) => {
      return console.log(error)
    })
  }

  //* Si hay imagen nueva
  if (req.file) {
    grupoObtenido.imagen = req.file.filename
  }

  await grupoObtenido.save()
  req.flash('exito', 'Imagen subida correctamente')
  res.redirect('/administracion')
}

const mostrarFormEliminarGrupo = async (req = request, res = response) => {
  const grupoObtenido = await Grupo.findOne({ where: { id: req.params.id, usuarioId: req.usuario.id } })

  if (!grupoObtenido) {
    req.flash('error', ['Operación no válida'])
    return res.redirect('/administracion')
  }

  res.render('eliminar-grupo', {
    nombrePagina: `Eliminar Grupo: ${grupoObtenido.nombre}`
  })
}

const eliminarGrupo = async (req = request, res = response) => {
  const grupoObtenido = await Grupo.findOne({ where: { id: req.params.id, usuarioId: req.usuario.id } })

  if (!grupoObtenido) {
    req.flash('error', ['Operación no válida'])
    return res.redirect('/administracion')
  }

  if (grupoObtenido.imagen) {
    const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
    const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupoObtenido.imagen}`

    //* Eliminar archivo
    fs.unlinkSync(imagenAnteriorPath, (error) => {
      return console.log(error)
    })
  }

  await Grupo.destroy({ where: { id: req.params.id } })
  req.flash('exito', ['Grupo Eliminado'])
  res.redirect('/administracion')
}

export {
  mostrarFormularioGrupo,
  subirImagen,
  crearNuevoGrupo,
  mostrarFormEditarGrupo,
  editarGrupo,
  mostrarFormImagenGrupo,
  modificarImagen,
  mostrarFormEliminarGrupo,
  eliminarGrupo
}
