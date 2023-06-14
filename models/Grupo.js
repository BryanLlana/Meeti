import { DataTypes } from 'sequelize'
import db from '../config/db.js'
import { v4 } from 'uuid'

import Categoria from './Categoria.js'
import Usuario from './Usuario.js'

const Grupo = db.define('grupos', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: v4()
  },
  nombre: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  sitioWeb: DataTypes.TEXT,
  imagen: DataTypes.TEXT
})

Grupo.belongsTo(Usuario)
Grupo.belongsTo(Categoria)

export default Grupo
