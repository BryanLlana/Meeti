import { request, response } from 'express'

import Grupo from '../models/Grupo.js'

const mostrarPanelAdministracion = async (req = request, res = response) => {
  const grupos = await Grupo.findAll({ where: { usuarioId: req.usuario.id } })

  res.render('administracion', {
    nombrePagina: 'Panel de Administración',
    grupos
  })
}

export {
  mostrarPanelAdministracion
}
