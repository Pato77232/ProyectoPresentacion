import { useEffect, useState } from 'react'
import heroImage from '../../images/backyardigans.jpg'
import davidImage from '../../images/fotoDavid.jpeg'
import edwinImage from '../../images/EdwinFoto.jpeg'
import leslieImage from '../../images/leslie.png'
import pabloImage from '../../images/pabloFoto.jpeg'
import shirleyImage from '../../images/shirley.jpg'
import EdwinProfile from './EdwinProfile'
import PabloProfile from './PabloProfile'
import LeslieProfile from './LeslieProfile';
import './App.css'

const members = [
  { id: 'shirley', name: 'Shirley Amaguaña', alias: 'Tasha', role: 'La Diseñadora', image: shirleyImage, profile: '/integrantes/shirley.html' },
  { id: 'edwin', name: 'Edwin Caraguay', alias: 'Tyrone', role: 'El Proyectado', image: edwinImage, profile: '#perfil-edwin' },
  { id: 'leslie', name: 'Leslie Coello', alias: 'Uniqua', role: 'La Pulga', image: leslieImage, profile: '/integrantes/Leslie.html' },
  { id: 'david', name: 'David Cuenca', alias: 'Austin', role: 'Programador Profesional', image: davidImage, profile: '/integrantes/David.html' },
  { id: 'pablo', name: 'Pablo Toapanta', alias: 'Pablo', role: 'El Líder', image: pabloImage, profile: '#perfil-pablo' },
]

function getProfileRoute() {
  const hash = window.location.hash
  return hash === '#perfil-edwin' || hash === '#perfil-pablo' ? hash.slice(1) : ''
}

function App() {
  const [profileRoute, setProfileRoute] = useState(getProfileRoute)

  useEffect(() => {
    const updateRoute = () => {
      const route = getProfileRoute()
      if (route || !window.location.hash) setProfileRoute(route)
    }
    window.addEventListener('hashchange', updateRoute)
    return () => window.removeEventListener('hashchange', updateRoute)
  }, [])

  useEffect(() => {
    if (profileRoute === 'perfil-edwin' || profileRoute === 'perfil-pablo') return

    const rows = document.querySelectorAll<HTMLElement>('.member-row')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.18 })

    rows.forEach((row) => observer.observe(row))
    return () => observer.disconnect()
  }, [profileRoute])

  if (profileRoute === 'perfil-edwin') return <EdwinProfile />
  if (profileRoute === 'perfil-pablo') return <PabloProfile />
  if (profileRoute === 'perfil-leslie') return <LeslieProfile />

  return (
    <>
      <header className="topbar">
        <a className="topbar__brand" href="#inicio">Los Backyardigans</a>
        <a className="topbar__link" href="#integrantes">Conoce al equipo <span aria-hidden="true">↓</span></a>
      </header>

      <main>
        <section className="hero" id="inicio" style={{ backgroundImage: `linear-gradient(180deg, rgba(17, 39, 40, .12) 5%, rgba(17, 39, 40, .16) 44%, rgba(17, 39, 40, .92) 100%), url("${heroImage}")` }}>
          <div className="hero__content">
            <p className="hero__eyebrow">Proyecto universitario · UTA</p>
            <h1>Los Backyardigans</h1>
            <p className="hero__subtitle">Manejo y Configuración de Software</p>
            <nav className="hero__members" aria-label="Integrantes del equipo">
              {members.map((member) => (
                <a className={`hero-member hero-member--${member.id}`} href={`#integrante-${member.id}`} key={member.id}>
                  {member.name.split(' ')[0]} <span>{member.name.split(' ').slice(1).join(' ')}</span>
                </a>
              ))}
            </nav>
          </div>
          <a className="scroll-hint" href="#integrantes"><span aria-hidden="true">↓</span> Nuestro equipo</a>
        </section>

        <section className="members" id="integrantes" aria-labelledby="members-title">
          <header className="members__heading">
            <p className="section-kicker">Cinco integrantes · Un mismo equipo</p>
            <h2 id="members-title">Nuestro equipo</h2>
          </header>

          {members.map((member, index) => (
            <article className={`member-row member-row--${member.id}`} id={`integrante-${member.id}`} key={member.id}>
              <div className="member-row__inner">
                <div className="member-row__copy">
                  <p className="member-row__eyebrow">Integrante 0{index + 1} <span>· {member.alias}</span></p>
                  <h3>{member.name}</h3>
                  <p className="member-row__role">{member.role}</p>
                  <a className="member-row__link" href={member.profile}>Conocer perfil <span aria-hidden="true">↗</span></a>
                </div>
                <div className="member-row__portrait">
                  <img src={member.image} alt={`Retrato de ${member.name}`} loading="lazy" />
                  <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>

      <footer className="footer">
        <p>Manejo y Configuración de Software · UTA · 2026</p>
        <a href="#inicio">Volver arriba ↑</a>
      </footer>
    </>
  )
}

export default App
