import { useEffect, useState } from 'react'
import davidImage from '../../images/fotoDavid.jpeg'
import austinImage from '../../images/Austin.png'
import MotoExtreme from './MotoExtreme'
import './DavidProfile.css'

type DavidProfileData = {
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
  | { attempt: number; status: 'success'; data: DavidProfileData }
  | { attempt: number; status: 'error' }

function DavidProfile() {
  const [attempt, setAttempt] = useState(0)
  const [loadState, setLoadState] = useState<ProfileLoadState>({ attempt: -1, status: 'loading' })
  const loading = loadState.attempt !== attempt || loadState.status === 'loading'
  const profile = loadState.attempt === attempt && loadState.status === 'success' ? loadState.data : null
  const error = loadState.attempt === attempt && loadState.status === 'error'

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/members/david', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo cargar el perfil.')
        return response.json() as Promise<DavidProfileData>
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
    <div className="david-profile">
      <div id="orbField" className="orb-field" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
        <div className="bg-grid" />
      </div>

      <nav className="site-nav">
        <div className="container nav-inner">
          <a href="/fronted_presentacion/index.html" className="nav-back"><span className="nav-back-arrow" aria-hidden="true">←</span> Volver al equipo</a>
          <span className="nav-team">Backyardigans</span>
        </div>
      </nav>

      {loading && <p className="david-feedback" role="status">Cargando perfil...</p>}
      {error && (
        <div className="david-feedback" role="alert">
          <p>No fue posible conectar con el backend de David.</p>
          <button type="button" onClick={() => setAttempt((current) => current + 1)}>Reintentar</button>
        </div>
      )}

      {profile && (
        <main>
          <section className="section hero" id="inicio">
            <div className="container hero-grid">
              <div className="hero-text">
                <p className="badge">🦘 ¡Hola! Disponible para nuevos proyectos y aprendizaje</p>
                <h1 className="hero-title">Hola, soy<br /><span className="text-gradient">{profile.name}</span></h1>
                <p className="hero-typed"><span className="hero-typed-dash">—</span><span id="typed" /><span className="caret" id="caret" /></p>
                <p className="hero-desc">Estudiante de Ingeniería de Software, interesado por aprender muchas cosas, amante de la tecnología y la computación.</p>
                <div className="hero-actions">
                  <a href="#proyecto" className="btn btn-primary shine-btn"><span className="btn-emoji">🏍️</span> Jugar Moto Extreme</a>
                  <div className="socials">
                    <a href="https://github.com/David22x" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="social-btn">🐙</a>
                    <a href="https://www.linkedin.com/in/david-cuenca-9884083b5/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="social-btn">💼</a>
                    <a href="https://www.instagram.com/cuenca4786/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-btn">📷</a>
                    <a href={`mailto:${profile.email}`} aria-label="Correo" className="social-btn">✉️</a>
                  </div>
                </div>
              </div>

              <div className="hero-visual">
                <div className="avatar-card glass">
                  <div className="avatar-glow" />
                  <div className="avatar-frame"><img src={davidImage} alt={`Foto de ${profile.name}`} /></div>
                  <h2 className="avatar-name">{profile.name}</h2>
                  <p className="avatar-role">{profile.course}</p>
                  <div className="avatar-stats">
                    <div><strong>{profile.age}</strong><span>Años</span></div>
                    <div><strong>4°</strong><span>Semestre</span></div>
                    <div><strong>∞</strong><span>Curiosidad</span></div>
                  </div>
                  <div className="mascot-wrap">
                    <img src={austinImage} alt={`${profile.mascot}, mascota que representa a David`} className="mascot" />
                    <span className="mascot-tag">Mi representación 🟣</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="sobre-mi" className="section">
            <div className="container">
              <header className="section-head">
                <p className="eyebrow">Sobre mí</p>
                <h2>Un poco de mi historia</h2>
                <p>Datos, contacto y hobbies.</p>
              </header>

              <div className="bento-grid">
                <article className="card glass card-span-2">
                  <div className="card-title"><span className="card-icon icon-blue">👤</span><h3>¿Quién soy?</h3></div>
                  <p>{profile.about}</p>
                  <p>Estoy interesado en aprender nuevas tecnologías y herramientas que me permitan crecer profesionalmente y aportar a la sociedad con mis conocimientos.</p>
                  <div className="chips">{profile.interests.map((interest) => <span className="chip chip-blue" key={interest}>{interest}</span>)}</div>
                </article>

                <article className="card glass">
                  <div className="card-title"><span className="card-icon icon-purple">🧾</span><h3>Datos personales</h3></div>
                  <ul className="info-list">
                    <li><span className="li-icon icon-pink">🎂</span><div><span className="li-label">Edad</span><span className="li-value">{profile.age} años</span></div></li>
                    <li><span className="li-icon icon-blue">🎓</span><div><span className="li-label">Carrera</span><span className="li-value">{profile.course}</span></div></li>
                    <li><span className="li-icon icon-green">📍</span><div><span className="li-label">Ubicación</span><span className="li-value">{profile.location}</span></div></li>
                    <li><span className="li-icon icon-orange">🏛️</span><div><span className="li-label">Universidad</span><span className="li-value">UTA · FISEI</span></div></li>
                  </ul>
                </article>

                <article className="card glass">
                  <div className="card-title"><span className="card-icon icon-orange">📬</span><h3>Contacto</h3></div>
                  <ul className="info-list">
                    <li><span className="li-icon icon-blue">✉️</span><div><span className="li-label">Correo</span><a href={`mailto:${profile.email}`} className="li-value li-link">{profile.email}</a></div></li>
                    <li><span className="li-icon icon-green">📞</span><div><span className="li-label">Teléfono</span><a href={`tel:${profile.phone.replaceAll(' ', '')}`} className="li-value li-link">{profile.phone}</a></div></li>
                    <li><span className="li-icon icon-pink">🌐</span><div><span className="li-label">Idiomas</span><span className="li-value">Español (nativo) · Inglés (técnico)</span></div></li>
                  </ul>
                </article>

                <article className="card glass card-span-2">
                  <div className="card-title"><span className="card-icon icon-green">💜</span><h3>Hobbies</h3></div>
                  <div className="philosophy-grid">
                    {profile.hobbies.map((hobby) => (
                      <div className="mini-card glass" key={hobby.title}>
                        <span className="mini-icon icon-blue" aria-hidden="true">✦</span>
                        <p className="mini-title">{hobby.title}</p>
                        <p className="mini-text">{hobby.description}</p>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            </div>
          </section>

          <MotoExtreme />
        </main>
      )}

      <footer>
        <div className="container footer-inner">
          <p className="footer-made">Hecho con <span className="footer-heart">💜</span> por <span className="footer-name">{profile?.name ?? 'David Cuenca'}</span></p>
          <p className="footer-copy">© 2026 · Ingeniería de Software · UTA</p>
          <a href="#inicio" className="to-top" aria-label="Volver arriba">↑</a>
        </div>
      </footer>
    </div>
  )
}

export default DavidProfile
