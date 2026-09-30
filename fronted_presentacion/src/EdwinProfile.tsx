import { useEffect, useState } from 'react'
import edwinImage from '../../images/EdwinFoto.jpeg'
import tyroneImage from '../../images/Tyrone.jpg'
import ChessGame from './ChessGame'
import './EdwinProfile.css'

interface EdwinProfileData {
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
  | { attempt: number; status: 'success'; data: EdwinProfileData }
  | { attempt: number; status: 'error' }

function EdwinProfile() {
  const [attempt, setAttempt] = useState(0)
  const [loadState, setLoadState] = useState<ProfileLoadState>({ attempt: -1, status: 'loading' })
  const loading = loadState.attempt !== attempt || loadState.status === 'loading'
  const profile = loadState.attempt === attempt && loadState.status === 'success' ? loadState.data : null
  const error = loadState.attempt === attempt && loadState.status === 'error'

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/members/edwin', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo cargar el perfil.')
        return response.json() as Promise<EdwinProfileData>
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
    <div className="edwin-page">
      <nav className="edwin-nav" aria-label="Navegación del perfil">
        <a href="/fronted_presentacion/" className="edwin-back"><span aria-hidden="true">←</span> Volver al equipo</a>
        <span>LOS BACKYARDIGANS <span aria-hidden="true">/</span> PERFIL</span>
      </nav>

      {loading && <p className="edwin-feedback" role="status">Cargando perfil...</p>}
      {error && (
        <div className="edwin-feedback" role="alert">
          <p>No fue posible conectar con el backend de Edwin.</p>
          <button type="button" onClick={() => setAttempt((current) => current + 1)}>Reintentar</button>
        </div>
      )}

      {profile && (
        <main>
          <section className="edwin-hero">
            <div className="edwin-hero__copy">
              <p className="edwin-kicker">Integrante · {profile.mascot}</p>
              <h1>Hola, soy<br /><span>{profile.name}</span></h1>
              <p className="edwin-lead">{profile.role}. {profile.summary}</p>
              <a className="edwin-play-link" href="#edwin-chess"><span aria-hidden="true">♟</span> Jugar ajedrez</a>
            </div>
            <figure className="edwin-portrait">
              <img src={edwinImage} alt={`Foto de ${profile.name}`} />
              <figcaption><img src={tyroneImage} alt="" /> {profile.mascot}</figcaption>
            </figure>
          </section>

          <section className="edwin-about" aria-labelledby="edwin-about-title">
            <div className="edwin-about__intro">
              <p className="edwin-kicker">Sobre mí</p>
              <h2 id="edwin-about-title">Tecnología con curiosidad y propósito.</h2>
              <p>{profile.about}</p>
              <div className="edwin-interests" aria-label="Intereses">
                {profile.interests.map((interest) => <span key={interest}>{interest}</span>)}
              </div>
            </div>
            <dl className="edwin-facts">
              <div><dt>Edad</dt><dd>{profile.age} años</dd></div>
              <div><dt>Carrera</dt><dd>{profile.course}</dd></div>
              <div><dt>Origen</dt><dd>{profile.location}</dd></div>
              <div><dt>Contacto</dt><dd><a href={`mailto:${profile.email}`}>{profile.email}</a><a href={`tel:${profile.phone.replaceAll(' ', '')}`}>{profile.phone}</a></dd></div>
            </dl>
          </section>

          <section className="edwin-hobbies" aria-labelledby="edwin-hobbies-title">
            <header>
              <p className="edwin-kicker">Fuera del teclado</p>
              <h2 id="edwin-hobbies-title">También me gusta</h2>
            </header>
            <div className="edwin-hobbies__list">
              {profile.hobbies.map((hobby, index) => (
                <article key={hobby.title}>
                  <span aria-hidden="true">0{index + 1}</span>
                  <h3>{hobby.title}</h3>
                  <p>{hobby.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="edwin-chess" id="edwin-chess" aria-labelledby="edwin-chess-title">
            <header className="edwin-chess__heading">
              <p className="edwin-kicker">Mini-juego</p>
              <h2 id="edwin-chess-title">Ajedrez</h2>
              <p>Selecciona una pieza y luego su destino.</p>
            </header>
            <ChessGame />
          </section>
        </main>
      )}

      <footer className="edwin-footer">
        <span>Hecho con cuidado por {profile?.name ?? 'Edwin Caraguay'}</span>
        <a href="#perfil-edwin">Volver arriba ↑</a>
      </footer>
    </div>
  )
}

export default EdwinProfile