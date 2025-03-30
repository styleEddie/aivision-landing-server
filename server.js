require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const ejs = require('ejs');

const app = express();
app.use(express.json());
app.use(cors());

// Configurar la vista de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configurar el transportador de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Ruta para manejar los envíos del formulario
app.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    replyTo: email, // Correo que recibirá los mensajes
    subject: `Nuevo mensaje de ${name}`,
    html: await renderEmailTemplate(name, email, message),
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Correo enviado correctamente' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    res.status(500).json({ success: false, message: 'Error al enviar el correo' });
  }
});

// Función para renderizar la plantilla de correo
const renderEmailTemplate = (name, email, message) => {
  return new Promise((resolve, reject) => {
    ejs.renderFile(path.join(__dirname, 'views', 'email.ejs'), { name, email, message }, (err, html) => {
      if (err) {
        reject(err);
      } else {
        resolve(html);
      }
    });
  });
};

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});