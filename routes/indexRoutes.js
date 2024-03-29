import express from 'express'

import protegerRuta from '../middlewares/protegerRuta.js'
import { mostrarPaginaPrincipal } from '../controllers/homeControllers.js'
import {
  crearNuevaCuenta,
  editarPerfil,
  iniciarSesion,
  modificarPassword,
  mostrarConfirmarCuenta,
  mostrarFormEditarPerfil,
  mostrarFormImagenPerfil,
  mostrarFormPassword,
  mostrarFormularioCrearCuenta,
  mostrarFormularioInicarSesion,
  subirImagen as subirImagenUsuario,
  subirImagenPerfil,
  cerrarSesion
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
import {
  crearMeeti,
  editarMeeti,
  eliminarMeeti,
  mostrarFormEditarMeeti,
  mostrarFormEliminarMeeti,
  mostrarFormNuevoMeeti
} from '../controllers/meetiControllers.js'

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

//* Cerrar sesion
router.post('/cerrar-sesion', protegerRuta, cerrarSesion)

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
router.post('/nuevo-meeti', protegerRuta, crearMeeti)
router.get('/editar-meeti/:id', protegerRuta, mostrarFormEditarMeeti)
router.post('/editar-meeti/:id', protegerRuta, editarMeeti)
router.get('/eliminar-meeti/:id', protegerRuta, mostrarFormEliminarMeeti)
router.post('/eliminar-meeti/:id', protegerRuta, eliminarMeeti)

//* Perfil
router.get('/editar-perfil', protegerRuta, mostrarFormEditarPerfil)
router.post('/editar-perfil', protegerRuta, editarPerfil)

//* Password
router.get('/cambiar-password', protegerRuta, mostrarFormPassword)
router.post('/cambiar-password', protegerRuta, modificarPassword)

//* Imagen Perfil
router.get('/imagen-perfil', protegerRuta, mostrarFormImagenPerfil)
router.post('/imagen-perfil', protegerRuta, subirImagenUsuario, subirImagenPerfil)

export default router
