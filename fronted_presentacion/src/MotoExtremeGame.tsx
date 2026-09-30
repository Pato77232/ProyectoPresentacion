import { useEffect, useState } from 'react'
import motoExtremeScript from '../../script/David.js?url'

function MotoExtremeGame() {
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'module'
    script.src = `${motoExtremeScript}?instance=${Date.now()}`
    script.async = true
    script.onerror = () => setLoadError(true)
    document.body.appendChild(script)

    return () => {
      script.onerror = null
      window.dispatchEvent(new Event('david-profile-cleanup'))
      script.remove()
    }
  }, [])

  return (
    <section id="proyecto" className="section" aria-labelledby="moto-title">
      <div className="container">
        <header className="section-head">
          <h2 id="moto-title">Minijuego: Moto Extreme 2D</h2>
          <p>Una plataforma de moto en 2D con obstáculos, saltos y niveles progresivos.</p>
        </header>

        <div className="game-wrap-outer">
          <div className="game-board glass">
            <header className="game-hud" aria-label="Estado de la partida">
              <div className="hud-item hud-level"><span>Nivel</span><b id="levelValue">1</b></div>
              <div className="hud-item hud-distance"><span>Distancia</span><b id="distanceValue">0 m</b></div>
              <div className="hud-item hud-score"><span>Puntos</span><b id="scoreValue">0</b></div>
              <div className="hud-item hud-lives"><span>Vidas</span><b id="livesValue">♥ ♥ ♥</b></div>
              <div className="hud-item hud-record"><span>Récord</span><b id="recordValue">0 m</b></div>
              <button id="pauseBtn" className="icon-btn" type="button" aria-label="Pausar">Ⅱ</button>
            </header>

            <div className="game-canvas-holder">
              <canvas id="gameCanvas" width="1280" height="720" aria-label="Pista de Moto Extreme" />

              <div id="startScreen" className="game-overlay">
                <div className="game-panel">
                  <p className="tetris-label">Arcade · 2D · Física</p>
                  <p className="overlay-title">Moto Extreme</p>
                  <p className="overlay-sub">Domina las rampas, esquiva obstáculos y llega lo más lejos posible.</p>
                  <button id="startBtn" className="btn btn-primary" type="button">▶ Jugar ahora</button>
                  <p className="controls-hint"><kbd>→</kbd> acelerar · <kbd>←</kbd> frenar · <kbd>↑</kbd><kbd>↓</kbd> girar · <kbd>Espacio</kbd> saltar</p>
                </div>
              </div>

              <div id="pauseScreen" className="game-overlay hidden">
                <div className="game-panel">
                  <p className="overlay-title">Pausa</p>
                  <p className="overlay-sub">¿Listo para continuar?</p>
                  <button id="resumeBtn" className="btn btn-primary" type="button">▶ Continuar</button>
                  <button id="restartBtn" className="btn btn-ghost" type="button">Reiniciar</button>
                </div>
              </div>

              <div id="gameOverScreen" className="game-overlay hidden">
                <div className="game-panel">
                  <p className="overlay-title" id="gameOverTitle">Game over</p>
                  <div id="newRecordBadge" className="record-badge hidden">🏆 ¡Nuevo récord!</div>
                  <div className="result-grid">
                    <div><span>Puntos</span><strong id="finalScore">0</strong></div>
                    <div><span>Distancia</span><strong id="finalDistance">0 m</strong></div>
                    <div><span>Nivel</span><strong id="finalLevel">1</strong></div>
                  </div>
                  <button id="retryBtn" className="btn btn-primary" type="button">Volver a intentar</button>
                </div>
              </div>

              <div className="mobile-controls" aria-label="Controles táctiles">
                <button type="button" data-key="ArrowLeft" aria-label="Frenar">←</button>
                <button type="button" data-key="ArrowUp" aria-label="Girar hacia arriba">↗</button>
                <button type="button" data-key="Space" aria-label="Saltar">●</button>
                <button type="button" data-key="ArrowDown" aria-label="Girar hacia abajo">↙</button>
                <button type="button" data-key="ArrowRight" aria-label="Acelerar">→</button>
              </div>
            </div>

            <p className="controls-hint"><kbd>←</kbd> <kbd>→</kbd> mover · <kbd>↑</kbd> <kbd>↓</kbd> girar · <kbd>Espacio</kbd> saltar · <kbd>ESC</kbd> pausa</p>
            {loadError && <p role="alert">No fue posible cargar Moto Extreme. Recarga el perfil para intentarlo de nuevo.</p>}
          </div>
        </div>
      </div>
    </section>
  )
}

export default MotoExtremeGame
