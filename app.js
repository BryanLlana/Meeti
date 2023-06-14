import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import * as url from 'url'
import expressEjsLayouts from 'express-ejs-layouts'
import flash from 'connect-flash'
import session from 'express-session'
import cookieParser from 'cookie-parser'

import usuarioRoutes from './routes/indexRoutes.js'
//* Importando los modelos o tablas de base de datos
import db from './config/db.js'
import {} from './models/Usuario.js'
import {} from './models/Categoria.js'
import {} from './models/Grupo.js'
dotenv.config()

//* Generar tablas
db.sync().then(() => {
  console.log('Base de datos conectada')
}).catch((error) => {
  console.log(error)
})

//* Aplicación principal
const app = express()

//* Habilitar lectura de formularios
app.use(express.urlencoded({ extended: true }))

//* Habilitar cookies
app.use(cookieParser())

//* Habilitar ejs como template engine
app.use(expressEjsLayouts)
app.set('view engine', 'ejs')

//* Ubicación de las vistas
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
app.set('views', path.join(__dirname, './views'))

//* Habilitar archivos estáticos
app.use(express.static('public'))

//* Habilitar session
app.use(session({
  secret: process.env.SECRET,
  key: process.env.KEY,
  resave: false,
  saveUninitialized: false
}))

//* Habilitar flash (Nos sirve para enviar alertas)
app.use(flash())

//* Middleware
app.use((req, res, next) => {
  res.locals.alertas = req.flash()
  const fecha = new Date()
  res.locals.year = fecha.getFullYear()
  next()
})

//* Routing
app.use('/', usuarioRoutes)

//* Puerto del servidor
app.listen(process.env.PORT, () => {
  console.log(`Ejecutando servidor en el puerto ${process.env.PORT}`)
})
