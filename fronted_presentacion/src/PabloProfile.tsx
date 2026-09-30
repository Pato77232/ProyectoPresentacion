import { useEffect, useState } from 'react'
import pabloImage from '../../images/pabloFoto.jpeg'
import mascotImage from '../../images/pablo.png'
import TetrisGame from './TetrisGame'
import './PabloProfile.css'

interface PabloProfileData {
  name: string
  mascot: string
  age: number
  role: string
  course: string
  location: string
  email: string
  phone: string
  summary: string
  about: string
  interests: string[]
  hobbies: { title: string; description: string }[]
}

type ProfileLoadState =
  | { attempt: number; status: 'loading' }
  | { attempt: number; status: 'success'; data: PabloProfileData }
  | { attempt: number; status: 'error' }

function PabloProfile() {
  const [attempt, setAttempt] = useState(0)
  const [loadState, setLoadState] = useState<ProfileLoadState>({ attempt: -1, status: 'loading' })
  const loading = loadState.attempt !== attempt || loadState.status === 'loading'
  const profile = loadState.attempt === attempt && loadState.status === 'success' ? loadState.data : null
  const error = loadState.attempt === attempt && loadState.status === 'error'

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/members/pablo', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo cargar el perfil.')
        return response.json() as Promise<PabloProfileData>
      })
      .then((data) => {
        if (!controller.signal.aborted) setLoadState({ attempt, status: 'success', data })
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadState({ attempt, status: 'error' })
      })

    return () => controller.abort()
  }, [attempt])

  return (
    <div className="pablo-page">
      <nav className="pablo-nav" aria-label="Navegación del perfil">
        <a href="/fronted_presentacion/" className="pablo-back"><span aria-hidden="true">←</span> Volver al equipo</a>
        <span>LOS BACKYARDIGANS <span aria-hidden="true">/</span> PERFIL</span>
      </nav>

      {loading && <p className="pablo-feedback" role="status">Cargando perfil...</p>}
      {error && (
        <div className="pablo-feedback" role="alert">
          <p>No fue posible cargar el perfil de Pablo.</p>
          <button type="button" onClick={() => setAttempt((current) => current + 1)}>Reintentar</button>
        </div>
      )}

      {profile && (
        <main>
          <section className="pablo-hero" aria-labelledby="pablo-title">
            <div className="pablo-hero__copy">
              <p className="pablo-kicker">Integrante · {profile.mascot}</p>
              <h1 id="pablo-title">Hola, soy<br /><span>{profile.name}</span></h1>
              <p className="pablo-lead">{profile.role}. {profile.summary}</p>
              <a className="pablo-play-link" href="#pablo-tetris"><span aria-hidden="true">▦</span> Jugar Tetris</a>
            </div>
            <figure className="pablo-portrait">
              <img className="pablo-portrait__photo" src={pabloImage} alt={`Foto de ${profile.name}`} />
              <figcaption><img src={mascotImage} alt="" /> {profile.mascot}</figcaption>
            </figure>
          </section>

          <section className="pablo-about" aria-labelledby="pablo-about-title">
            <div className="pablo-about__intro">
              <p className="pablo-kicker">Sobre mí</p>
              <h2 id="pablo-about-title">Curiosidad para entender. Creatividad para construir.</h2>
              <p>{profile.about}</p>
              <div className="pablo-interests" aria-label="Intereses">
                {profile.interests.map((interest) => <span key={interest}>{interest}</span>)}
              </div>
            </div>
            <dl className="pablo-facts">
              <div><dt>Edad</dt><dd>{profile.age} años</dd></div>
              <div><dt>Carrera</dt><dd>{profile.course}</dd></div>
              <div><dt>Ubicación</dt><dd>{profile.location}</dd></div>
              <div><dt>Contacto</dt><dd><a href={`mailto:${profile.email}`}>{profile.email}</a><a href={`tel:${profile.phone.replaceAll(' ', '')}`}>{profile.phone}</a></dd></div>
            </dl>
          </section>

          <section className="pablo-hobbies" aria-labelledby="pablo-hobbies-title">
            <header>
              <p className="pablo-kicker">Fuera del teclado</p>
              <h2 id="pablo-hobbies-title">También me gusta</h2>
            </header>
            <div className="pablo-hobbies__list">
              {profile.hobbies.map((hobby, index) => (
                <article key={hobby.title}>
                  <span aria-hidden="true">0{index + 1}</span>
                  <h3>{hobby.title}</h3>
                  <p>{hobby.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="pablo-tetris" id="pablo-tetris" aria-labelledby="pablo-tetris-title">
            <header className="pablo-tetris__heading">
              <p className="pablo-kicker">Mini-juego</p>
              <h2 id="pablo-tetris-title">Tetris</h2>
              <p>Completa líneas, suma puntos y supera tu mejor nivel.</p>
            </header>
            <TetrisGame />
          </section>
        </main>
      )}

      <footer className="pablo-footer">
        <span>Hecho con cuidado por {profile?.name ?? 'Pablo Toapanta'}</span>
        <a href="#perfil-pablo">Volver arriba ↑</a>
      </footer>
    </div>
  )
}

export default PabloProfile