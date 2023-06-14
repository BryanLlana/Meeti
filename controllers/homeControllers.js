import { request, response } from 'express'

const mostrarPaginaPrincipal = (req = request, res = response) => {
  res.render('home', {
    nombrePagina: 'Inicio'
  })
}

export {
  mostrarPaginaPrincipal
}
