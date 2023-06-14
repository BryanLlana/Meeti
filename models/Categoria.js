import { DataTypes } from 'sequelize'
import db from '../config/db.js'

const Categoria = db.define('categorias', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: DataTypes.TEXT
})

export default Categoria
