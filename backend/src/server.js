import express from 'express'

const app = express()
const port = Number(process.env.PORT) || 3000

app.disable('x-powered-by')
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.get('/api/members/edwin', (_request, response) => {
  response.json({
    name: 'Edwin Caraguay',
    mascot: 'Tyrone',
    age: 20,
    role: 'Manejo y Configuración de Software',
    course: 'Ingeniería de Software',
    location: 'Loja, Ecuador',
    email: 'ecaraguay7405@uta.edu.ec',
    phone: '+593 983 192 516',
    summary: 'Me interesa la administración de sistemas, automatización y seguridad básica.',
    about: 'Soy estudiante de Ingeniería de Software. Me apasionan la tecnología, la programación y el desarrollo de aplicaciones. También disfruto el deporte, la música y aprender herramientas que complementen mi crecimiento profesional.',
    interests: ['Linux', 'Shell', 'Redes', 'DevOps'],
    hobbies: [
      { title: 'Guitarra', description: 'Toco guitarra en mis ratos libres.' },
      { title: 'Videojuegos', description: 'Me gusta jugar y aprender diseño de juegos.' },
      { title: 'Entretenimiento', description: 'Películas y series para desconectar.' },
    ],
  })
})

app.use('/api', (_request, response) => {
  response.status(404).json({ error: 'Ruta de API no encontrada.' })
})

app.listen(port, '127.0.0.1', () => {
  console.log(`API disponible en http://127.0.0.1:${port}`)
})