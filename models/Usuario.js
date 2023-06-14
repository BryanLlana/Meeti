import { DataTypes } from 'sequelize'
import db from '../config/db.js'
import bcrypt from 'bcrypt'

const Usuario = db.define('usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: DataTypes.STRING(60),
  img: DataTypes.STRING(60),
  email: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(60),
    allowNull: false
  },
  activo: {
    type: DataTypes.INTEGER(1),
    defaultValue: 0
  },
  tokenPassword: DataTypes.STRING,
  expiraToken: DataTypes.DATE
}, {
  hooks: {
    beforeCreate (usuario) {
      const salt = bcrypt.genSaltSync(10)
      usuario.password = bcrypt.hashSync(usuario.password, salt)
    }
  },
  scopes: {
    eliminarPassword: {
      attributes: {
        exclude: ['password', 'tokenPassword', 'activo', 'createdAt', 'updatedAt', 'expiraToken']
      }
    }
  }
})

//* Método para comparar los password
Usuario.prototype.validarPassword = function (password) {
  return bcrypt.compareSync(password, this.password)
}

export default Usuario
