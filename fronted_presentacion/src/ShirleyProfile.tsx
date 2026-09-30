import shirleyImage from '../../images/shirley.jpg'
import tashaImage from '../../images/tasha.png'
import BubbleShooter from './BubbleShooter'
import './ShirleyProfile.css'

const interests = [
  { icon: '💻', title: 'Programar', description: 'Me encanta la lógica de programación, crear sistemas dinámicos y aprender nuevos lenguajes e infraestructura de software.' },
  { icon: '🍓', title: 'Fresas', description: 'Mi fruta favorita por excelencia. ¡Cualquier postre con fresas me alegra el día completamente!' },
  { icon: '🎧', title: 'Música', description: 'La mejor compañía al momento de programar o concentrarme. La música marca el ritmo de mis jornadas de estudio.' },
  { icon: '🍳', title: 'Cocinar', description: 'Disfruto mucho preparar recetas deliciosas en mis tiempos libres, experimentando como en el código pero con ingredientes.' },
  { icon: '🐶', title: 'Perritos', description: 'Amante total de las mascotas. Un buen momento jugando con perritos es la mejor forma de recargar energía.' },
  { icon: '🎓', title: '4to semestre · UTA', description: 'Formándome como futura Ingeniera en Software en la Universidad Técnica de Ambato con constancia y disciplina.' },
]

function ShirleyProfile() {
  return (
    <div className="shirley-profile">
      <header className="shirley-nav">
        <a href="/fronted_presentacion/" className="shirley-nav__back"><span aria-hidden="true">←</span> Volver al equipo</a>
        <span className="shirley-nav__team">Los Backyardigans <span aria-hidden="true">/</span> Perfil</span>
      </header>

      <main className="shirley-main">
        <section className="shirley-hero" aria-labelledby="shirley-title">
          <div className="shirley-hero__copy">
            <p className="shirley-kicker">Integrante · Tasha</p>
            <h1 id="shirley-title">Hola, <span>soy Shirley</span></h1>
            <p className="shirley-role">Apasionada por el desarrollo de software</p>
            <p className="shirley-bio">Estudiante de <strong>Ingeniería de Software</strong>, actualmente cursando el <strong>4to semestre</strong>. Me apasiona la tecnología, resolver problemas con código y descubrir nuevas formas de crear soluciones eficientes.</p>
            <a href="#shirley-game" className="shirley-play"><span aria-hidden="true">🎮</span> Jugar Bubble Shooter</a>
          </div>

          <aside className="shirley-portrait" aria-label="Perfil de Shirley Amaguaña">
            <div className="shirley-portrait__images">
              <img className="shirley-portrait__photo" src={shirleyImage} alt="Shirley Amaguaña" />
              <img className="shirley-portrait__mascot" src={tashaImage} alt="Tasha, personaje favorito de Shirley" />
            </div>
            <h2>Shirley Amaguaña</h2>
            <p>Ingeniería de Software</p>
            <dl className="shirley-stats">
              <div><dt>Edad</dt><dd>19</dd></div>
              <div><dt>Semestre</dt><dd>4to</dd></div>
            </dl>
            <span className="shirley-portrait__tag">Mi personaje favorito · Tasha</span>
          </aside>
        </section>

        <section className="shirley-about" aria-labelledby="shirley-about-title">
          <header className="shirley-section-heading">
            <p className="shirley-kicker">Sobre mí</p>
            <h2 id="shirley-about-title">Un poco de mi historia y lo que me apasiona</h2>
            <p>Uniendo mi vida en el código y mis pasiones del día a día.</p>
          </header>
          <div className="shirley-interests">
            {interests.map((interest) => (
              <article className="shirley-interest" key={interest.title}>
                <span className="shirley-interest__icon" aria-hidden="true">{interest.icon}</span>
                <h3>{interest.title}</h3>
                <p>{interest.description}</p>
              </article>
            ))}
          </div>
        </section>

        <BubbleShooter />
      </main>

      <footer className="shirley-footer">Página personal · Shirley Amaguaña · UTA</footer>
    </div>
  )
}

export default ShirleyProfile