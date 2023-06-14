import jwt from 'jsonwebtoken'
import Usuario from '../models/Usuario.js'
import { request, response } from 'express'
import dotenv from 'dotenv'
dotenv.config()

const protegerRuta = async (req = request, res = response, next) => {
  const { _token } = req.cookies

  if (!_token) {
    return res.redirect('/iniciar-sesion')
  }

  try {
    const decoded = jwt.verify(_token, process.env.SECRET)
    const usuarioObtenido = await Usuario.scope('eliminarPassword').findOne({ where: { id: decoded.id } })

    if (usuarioObtenido) {
      req.usuario = usuarioObtenido
      return next()
    } else {
      return res.redirect('iniciar-sesion')
    }
  } catch (error) {
    return res.clearCookie('_token').redirect('/iniciar-sesion')
  }
}

export default protegerRuta
