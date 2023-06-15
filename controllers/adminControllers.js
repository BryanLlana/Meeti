import { request, response } from 'express'
import moment from 'moment'
import sequelize from 'sequelize'

import Grupo from '../models/Grupo.js'
import Meeti from '../models/Meeti.js'

const Op = sequelize.Op

const mostrarPanelAdministracion = async (req = request, res = response) => {
  const [meetis, anteriores, grupos] = await Promise.all([
    Meeti.findAll({ where: { usuarioId: req.usuario.id, fecha: { [Op.gte]: moment(new Date()).format('YYYY-MM-DD') } } }),
    Meeti.findAll({ where: { usuarioId: req.usuario.id, fecha: { [Op.lt]: moment(new Date()).format('YYYY-MM-DD') } } }),
    Grupo.findAll({ where: { usuarioId: req.usuario.id } })
  ])

  res.render('administracion', {
    nombrePagina: 'Panel de Administración',
    grupos,
    meetis,
    anteriores,
    moment
  })
}

export {
  mostrarPanelAdministracion
}
