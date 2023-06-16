import { request, response } from 'express'
import { check, validationResult } from 'express-validator'

import Grupo from '../models/Grupo.js'
import Meeti from '../models/Meeti.js'

const mostrarFormNuevoMeeti = async (req = request, res = response) => {
  const grupos = await Grupo.findAll({ where: { usuarioId: req.usuario.id } })

  res.render('nuevo-meeti', {
    nombrePagina: 'Crear Nuevo Meeti',
    grupos
  })
}

const crearMeeti = async (req = request, res = response) => {
  await check('grupo').notEmpty().withMessage('Tiene que seleccionar un grupo').run(req)
  await check('titulo').notEmpty().withMessage('El título no puede estar vacío').run(req)
  await check('invitado').notEmpty().withMessage('Tiene que agregar un invitado').run(req)
  await check('fecha').notEmpty().withMessage('La fecha no puede estar vacía').run(req)
  await check('hora').notEmpty().withMessage('La hora no puede estar vacío').run(req)
  await check('descripcion').notEmpty().withMessage('La descripción no puede estar vacío').run(req)
  await check('direccion').notEmpty().withMessage('La dirección no puede estar vacío').run(req)
  await check('ciudad').notEmpty().withMessage('La ciudad no puede estar vacío').run(req)
  await check('estado').notEmpty().withMessage('El estado no puede estar vacío').run(req)
  await check('pais').notEmpty().withMessage('El país no puede estar vacío').run(req)
  await check('lat').notEmpty().withMessage('La latitud no puede estar vacío').run(req)
  await check('lng').notEmpty().withMessage('La longitud no puede estar vacío').run(req)

  const errores = validationResult(req).array().map(error => error.msg)

  if (errores.length > 0) {
    req.flash('error', errores)
    return res.redirect('/nuevo-meeti')
  }

  const meeti = req.body
  meeti.grupoId = req.body.grupo
  meeti.usuarioId = req.usuario.id

  //* Almacena la ubicacion con un point
  const point = { type: 'Point', coordinates: [parseFloat(req.body.lat), parseFloat(req.body.lng)] }
  meeti.ubicacion = point

  if (meeti.cupo === '') {
    meeti.cupo = 0
  }

  try {
    await Meeti.create(meeti)
    req.flash('exito', ['El meeti fue creado correctamente'])
    return res.redirect('/administracion')
  } catch (error) {
    console.log(error)
    req.flash('error', error.message)
    res.redirect('/nuevo-meeti')
  }
}

const mostrarFormEditarMeeti = async (req = request, res = response) => {
  const [grupos, meeti] = await Promise.all([
    Grupo.findAll({ where: { usuarioId: req.usuario.id } }),
    Meeti.findByPk(req.params.id)
  ])

  if (!grupos || !meeti) {
    req.flash('error', ['Operación no válida'])
    return res.redirect('/administracion')
  }

  res.render('editar-meeti', {
    nombrePagina: `Editar Meeti: ${meeti.titulo}`,
    grupos,
    meeti
  })
}

const editarMeeti = async (req = request, res = response) => {
  const meeti = await Meeti.findOne({ where: { id: req.params.id, usuarioId: req.usuario.id } })

  if (!meeti) {
    req.flash('error', ['Operación no válida'])
    return res.redirect('/administracion')
  }

  await check('grupo').notEmpty().withMessage('Tiene que seleccionar un grupo').run(req)
  await check('titulo').notEmpty().withMessage('El título no puede estar vacío').run(req)
  await check('invitado').notEmpty().withMessage('Tiene que agregar un invitado').run(req)
  await check('fecha').notEmpty().withMessage('La fecha no puede estar vacía').run(req)
  await check('hora').notEmpty().withMessage('La hora no puede estar vacío').run(req)
  await check('descripcion').notEmpty().withMessage('La descripción no puede estar vacío').run(req)
  await check('direccion').notEmpty().withMessage('La dirección no puede estar vacío').run(req)
  await check('ciudad').notEmpty().withMessage('La ciudad no puede estar vacío').run(req)
  await check('estado').notEmpty().withMessage('El estado no puede estar vacío').run(req)
  await check('pais').notEmpty().withMessage('El país no puede estar vacío').run(req)
  await check('lat').notEmpty().withMessage('La latitud no puede estar vacío').run(req)
  await check('lng').notEmpty().withMessage('La longitud no puede estar vacío').run(req)

  const errores = validationResult(req).array().map(error => error.msg)
  console.log(errores)

  if (errores.length > 0) {
    req.flash('error', errores)
    return res.redirect(`/editar-meeti/${meeti.id}`)
  }

  meeti.grupoId = req.body.grupo
  meeti.titulo = req.body.titulo
  meeti.invitado = req.body.invitado
  meeti.fecha = req.body.fecha
  meeti.hora = req.body.hora
  meeti.cupo = req.body.cupo
  meeti.descripcion = req.body.descripcion
  meeti.direccion = req.body.direccion
  meeti.ciudad = req.body.ciudad
  meeti.estado = req.body.estado
  meeti.pais = req.body.pais

  //* Almacena la ubicacion con un point
  const point = { type: 'Point', coordinates: [parseFloat(req.body.lat), parseFloat(req.body.lng)] }
  meeti.ubicacion = point

  await meeti.save()
  req.flash('exito', ['Cambios guardados correctamente'])
  res.redirect('/administracion')
}

const mostrarFormEliminarMeeti = async (req = request, res = response) => {
  const meeti = await Meeti.findOne({ where: { id: req.params.id, usuarioId: req.usuario.id } })

  if (!meeti) {
    req.flash('error', ['Operación no válida'])
    return res.redirect('/administracion')
  }

  res.render('eliminar-meeti', {
    nombrePagina: `Eliminar Meeti: ${meeti.titulo}`
  })
}

const eliminarMeeti = async (req = request, res = response) => {
  await Meeti.destroy({ where: { id: req.params.id } })
  req.flash('exito', ['Meeti eliminado correctamente'])
  res.redirect('/administracion')
}

export {
  mostrarFormNuevoMeeti,
  crearMeeti,
  mostrarFormEditarMeeti,
  editarMeeti,
  mostrarFormEliminarMeeti,
  eliminarMeeti
}
