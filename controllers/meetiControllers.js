import { request, response } from 'express'

import Grupo from '../models/Grupo.js'

const mostrarFormNuevoMeeti = async (req = request, res = response) => {
  const grupos = await Grupo.findAll({ where: { usuarioId: req.usuario.id } })

  res.render('nuevo-meeti', {
    nombrePagina: 'Crear Nuevo Meeti',
    grupos
  })
}

export {
  mostrarFormNuevoMeeti
}
