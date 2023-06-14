import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const emailRegistro = async (datos) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  })

  const { nombre, email } = datos

  await transport.sendMail({
    from: 'Meeti.com',
    to: email,
    subject: 'Confirma tu cuenta en Meeti.com',
    text: 'Confirma tu cuenta en Meeti.com',
    html: `
            <p>Hola ${nombre}, comprueba tu cuenta en Meeti.com</p>
            <p>Tu cuenta ya esta lista, solo debes confirmarla en el siguiente enlace: <a href= "${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/confirmar-cuenta/${email}">Confirmar Cuenta</a></p>
            <p>Si tu no creaste la cuenta, puede ignorar el mensaje</p>
        `
  })
}

export {
  emailRegistro
}
