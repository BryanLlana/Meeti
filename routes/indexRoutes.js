import express from 'express'

import protegerRuta from '../middlewares/protegerRuta.js'
import { mostrarPaginaPrincipal } from '../controllers/homeControllers.js'
import {
  crearNuevaCuenta,
  iniciarSesion,
  mostrarConfirmarCuenta,
  mostrarFormularioCrearCuenta,
  mostrarFormularioInicarSesion
} from '../controllers/usuariosControllers.js'
import { mostrarPanelAdministracion } from '../controllers/adminControllers.js'
import {
  crearNuevoGrupo,
  editarGrupo,
  eliminarGrupo,
  modificarImagen,
  mostrarFormEditarGrupo,
  mostrarFormEliminarGrupo,
  mostrarFormImagenGrupo,
  mostrarFormularioGrupo,
  subirImagen
} from '../controllers/gruposControllers.js'
import { mostrarFormNuevoMeeti } from '../controllers/meetiControllers.js'

const router = express.Router()

router.get('/', mostrarPaginaPrincipal)

//* Funcionamiento registro
router.get('/crear-cuenta', mostrarFormularioCrearCuenta)
router.post('/crear-cuenta', crearNuevaCuenta)

//* Funcionamiento confirmar cuenta
router.get('/confirmar-cuenta/:email', mostrarConfirmarCuenta)

//* Funcionamiento autenticación
router.get('/iniciar-sesion', mostrarFormularioInicarSesion)
router.post('/iniciar-sesion', iniciarSesion)

//* Panel de administración
router.get('/administracion', protegerRuta, mostrarPanelAdministracion)

//* Nuevos grupos
router.get('/nuevo-grupo', protegerRuta, mostrarFormularioGrupo)
router.post('/nuevo-grupo', protegerRuta, subirImagen, crearNuevoGrupo)
router.get('/editar-grupo/:id', protegerRuta, mostrarFormEditarGrupo)
router.post('/editar-grupo/:id', protegerRuta, editarGrupo)
router.get('/imagen-grupo/:id', protegerRuta, mostrarFormImagenGrupo)
router.post('/imagen-grupo/:id', protegerRuta, subirImagen, modificarImagen)
router.get('/eliminar-grupo/:id', protegerRuta, mostrarFormEliminarGrupo)
router.post('/eliminar-grupo/:id', protegerRuta, eliminarGrupo)

//* Nuevos meetis
router.get('/nuevo-meeti', protegerRuta, mostrarFormNuevoMeeti)

export default router
