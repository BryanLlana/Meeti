import { DataTypes } from 'sequelize'
import db from '../config/db.js'
import { v4 } from 'uuid'
import slug from 'slug'
import shortid from 'shortid'

import Usuario from '../models/Usuario.js'
import Grupo from '../models/Grupo.js'

const Meeti = db.define('meeti', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: true,
    defaultValue: v4()
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: DataTypes.STRING,
  invitado: DataTypes.STRING,
  cupo: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora: {
    type: DataTypes.TIME,
    allowNull: false
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ciudad: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pais: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ubicacion: DataTypes.GEOMETRY('POINT')
}, {
  hooks: {
    beforeCreate (meeti) {
      const url = slug(meeti.titulo).toLowerCase()
      meeti.slug = `${url}-${shortid.generate()}`
    }
  }
})

Meeti.belongsTo(Usuario)
Meeti.belongsTo(Grupo)

export default Meeti
