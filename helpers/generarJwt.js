import jwt from 'jsonwebtoken'

const generarJwt = data => {
  return jwt.sign({
    id: data.id,
    nombre: data.nombre
  }, process.env.SECRET, {
    expiresIn: '1d'
  })
}

export default generarJwt
