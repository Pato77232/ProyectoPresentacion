import express from 'express'

const app = express()
const port = Number(process.env.PORT) || 3000
const leslieScores = []

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

app.get('/api/members/david', (_request, response) => {
  response.json({
    name: 'David Cuenca',
    mascot: 'Austin',
    age: 19,
    role: 'Estudiante de Ingeniería de Software',
    course: 'Ingeniería de Software',
    location: 'Ambato, Ecuador',
    email: 'dcuenca2872@uta.edu.ec',
    phone: '+593 992 952 521',
    summary: 'Interesado en aprender, la tecnología y la computación.',
    about: 'Me gusta la tecnología y todo lo relacionado con la programación. Disfruto aprender cosas nuevas, mantenerme activo y ejercitar mi mente. Busco aprender herramientas que me permitan crecer profesionalmente y aportar a la sociedad.',
    interests: ['Desarrollo web', 'JavaScript', 'Videojuegos 2D', 'Lógica de programación', 'Trabajo en equipo'],
    hobbies: [
      { title: 'Deporte', description: 'Mantener mi cuerpo y mi mente en forma.' },
      { title: 'Entretenimiento', description: 'Disfruto de las películas y las series.' },
      { title: 'Programación', description: 'Mantengo mi mente activa y aprendiendo constantemente.' },
    ],
  })
})

app.get('/api/members/leslie', (_request, response) => {
  response.json({
    name: 'Leslie Coello',
    mascot: 'Uniqua',
    age: 20,
    role: 'Estudiante de Ingeniería en Software',
    course: 'Ingeniería en Software · 4to semestre',
    summary: 'Me encantan la lógica, programar proyectos y el desarrollo web.',
    about: 'Estudio Ingeniería en Software y disfruto aprender, crear proyectos y expresarme a través de la música, el canto y el baile.',
    interests: ['Desarrollo web', 'Programación', 'Canto', 'Baile', 'Pasta'],
    hobbies: [
      { title: 'Cantar y bailar', description: 'Disfruto expresarme con la música, el canto y el baile.' },
      { title: 'La pasta', description: 'Es mi comida favorita.' },
      { title: 'Ir a la iglesia', description: 'Es una parte importante de mi vida.' },
    ],
  })
})

app.get('/api/members/leslie/scores', (_request, response) => {
  response.json({ scores: leslieScores.slice(-20).reverse() })
})

app.post('/api/members/leslie/scores', (request, response) => {
  const { game, score, tickets } = request.body ?? {}
  if (typeof game !== 'string' || !Number.isFinite(score) || !Number.isFinite(tickets) || score < 0 || tickets < 0) {
    response.status(400).json({ error: 'Resultado de juego inválido.' })
    return
  }

  const result = { game, score, tickets, createdAt: new Date().toISOString() }
  leslieScores.push(result)
  response.status(201).json(result)
})

app.get('/api/members/pablo', (_request, response) => {
  response.json({
    name: 'Pablo Toapanta',
    mascot: 'Pablo',
    age: 19,
    role: 'Desarrollador en formación',
    course: 'Ingeniería de Software · 4to semestre',
    location: 'Ambato, Ecuador',
    email: 'ptoapanta1032@uta.edu.ec',
    phone: '+593 987 476 259',
    summary: 'Me apasionan las ciencias de la computación, la tecnología y el aprendizaje continuo.',
    about: 'Estudio Ingeniería de Software y disfruto entender cómo funcionan las cosas por dentro para construir soluciones con lógica y creatividad. Mi objetivo es fortalecer mis bases en informática y contribuir con proyectos que importen.',
    interests: ['Ciencias de la Computación', 'Redes', 'Bases de Datos', 'Desarrollo Web', 'Metodologías Ágiles'],
    hobbies: [
      { title: 'Videojuegos', description: 'Me gusta explorar mundos virtuales, desde RPG hasta retos competitivos.' },
      { title: 'Deporte', description: 'Mantenerme activo me ayuda a cultivar energía y disciplina.' },
      { title: 'Aprender', description: 'Siempre hay una nueva herramienta, idea o tecnología por descubrir.' },
    ],
  })
})

app.use('/api', (_request, response) => {
  response.status(404).json({ error: 'Ruta de API no encontrada.' })
})

app.listen(port, '127.0.0.1', () => {
  console.log(`API disponible en http://127.0.0.1:${port}`)
})
