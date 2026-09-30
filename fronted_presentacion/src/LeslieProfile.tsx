import { useEffect, useState } from 'react'
import leslieImage from '../../images/leslie.png'
import './LeslieProfile.css'

interface LeslieProfileData {
  name: string
  mascot: string
  age: number
  role: string
  course: string
  location?: string
  email?: string
  phone?: string
  summary: string
  about: string
  interests: string[]
  hobbies: { title: string; description: string }[]
}

function LeslieProfile() {
  const [attempt, setAttempt] = useState(0)
  const [profile, setProfile] = useState<LeslieProfileData | null>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/members/leslie', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo cargar el perfil.')
        return response.json() as Promise<LeslieProfileData>
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setProfile(data)
          setStatus('success')
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus('error')
      })

    return () => controller.abort()
  }, [attempt])

  const handleRetry = () => {
    setStatus('loading')
    setAttempt((current) => current + 1)
  }

  return (
    <div className="leslie-page">
      <nav className="leslie-nav" aria-label="Navegación del perfil">
        <a href="/" className="leslie-back">
          <span aria-hidden="true">←</span> Volver al equipo
        </a>
        <span>LOS BACKYARDIGANS <span aria-hidden="true">/</span> PERFIL</span>
      </nav>

      {status === 'loading' && <p className="leslie-feedback" role="status">Cargando perfil...</p>}

      {status === 'error' && (
        <div className="leslie-feedback" role="alert">
          <p>No fue posible cargar el perfil de Leslie.</p>
          <button type="button" onClick={handleRetry}>
            Reintentar
          </button>
        </div>
      )}

      {status === 'success' && profile && (
        <main>
          <section className="leslie-hero">
            <div className="leslie-hero__copy">
              <p className="leslie-kicker">Integrante · {profile.mascot}</p>
              <h1>Hola, soy<br /><span>{profile.name}</span></h1>
              <p className="leslie-lead">{profile.role}. {profile.summary}</p>
              <a className="leslie-play-link" href="#leslie-about">Conoce más sobre mí ↓</a>
            </div>
            <figure className="leslie-portrait">
              <img src={leslieImage} alt={`Foto de ${profile.name}`} />
              <figcaption>{profile.mascot}</figcaption>
            </figure>
          </section>

          <section className="leslie-about" id="leslie-about" aria-labelledby="leslie-about-title">
            <div>
              <p className="leslie-kicker">Sobre mí</p>
              <h2 id="leslie-about-title">Un poco sobre quien soy.</h2>
              <p>{profile.about}</p>
              <div className="leslie-interests" aria-label="Intereses">
                {profile.interests.map((interest) => <span key={interest}>{interest}</span>)}
              </div>
            </div>

            <dl className="leslie-facts">
              <div><dt>Edad</dt><dd>{profile.age} años</dd></div>
              <div><dt>Carrera</dt><dd>{profile.course}</dd></div>
              {profile.location && <div><dt>Origen</dt><dd>{profile.location}</dd></div>}
              {(profile.email || profile.phone) && <div>
                <dt>Contacto</dt>
                <dd>
                  {profile.email && <a href={`mailto:${profile.email}`}>{profile.email}</a>}
                  {profile.phone && <a href={`tel:${profile.phone.replaceAll(' ', '')}`}>{profile.phone}</a>}
                </dd>
              </div>}
            </dl>
          </section>

          <section className="leslie-hobbies" aria-labelledby="leslie-hobbies-title">
            <p className="leslie-kicker">Fuera del teclado</p>
            <h2 id="leslie-hobbies-title">También me gusta</h2>
            <div className="leslie-hobbies__list">
              {profile.hobbies.map((hobby, index) => (
                <article key={hobby.title}>
                  <span aria-hidden="true">0{index + 1}</span>
                  <h3>{hobby.title}</h3>
                  <p>{hobby.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="leslie-hobbies">
            <p className="leslie-kicker">Feria de juegos</p>
            <a className="leslie-play-link" href="/integrantes/Leslie.html#gameArea">Abrir los minijuegos</a>
          </section>
        </main>
      )}

      <footer className="leslie-footer">
        <span>Hecho con cuidado por {profile?.name ?? 'Leslie'}</span>
        <a href="#perfil-leslie">Volver arriba ↑</a>
      </footer>
    </div>
  )
}

export default LeslieProfile