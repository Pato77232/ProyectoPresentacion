# Proyecto Presentación Grupal - Los Backyardigans

## Descripción

Sitio web de presentación del grupo "Los Backyardigans", desarrollado como proyecto de la materia Manejo y Configuración de Software de la Universidad Técnica de Ambato.

El proyecto incluye:
- Una página principal con la presentación del equipo.
- Una página personal por integrante con su biografía, gustos y un minijuego en JavaScript.
- Un frontend en React y un backend en Node.js.

## Integrantes

| Nombre | Personaje | Minijuego | GitHub |
|---|---|---|---|
| Edwin Caraguay | El Proyectado | Script del juego | https://github.com/Pato77232 |
| Shirley Amaguaña | Tasha | Bubble Shooter | https://github.com/shirley6126 |
| Leslie Coello | La Pulga | Juego de lógica | https://github.com/LeslieCoello |
| David Cuenca | Programador Profesional | Moto Extreme 2D | https://github.com/David22x |
| Pablo Toapanta | El Líder | Tetris | https://github.com/PabloToapanta |

## Tecnologías utilizadas

- Sitio original: HTML5, CSS3, JavaScript
- Frontend nuevo: React, Vite, TypeScript
- Backend: Node.js
- Control de versiones: Git y GitHub (GitFlow)

## Estructura del repositorio
/
├── index.html # Página principal
├── css/ # Estilos del sitio original
├── script/ # JavaScript del sitio original
├── images/ # Imágenes y recursos gráficos
├── integrantes/ # Páginas personales (HTML)
├── fronted_presentation/ # Frontend nuevo en React + Vite
├── backend/ # Backend en Node.js
├── .gitignore
├── README.md
└── CONTRIBUTING.md

## Requisitos

- Node.js 18 o superior
- npm 9 o superior
- Navegador web moderno

## Cómo ejecutar el proyecto

### Sitio HTML original

1. Clona el repositorio:
git clone https://github.com/Pato77232/ProyectoPresentacion.git

2. Abre `index.html` en el navegador.

### Frontend React 
cd fronted_presentation
npm install
npm run dev

### Backend Node.js
cd backend
npm install
npm run start

## Estado del proyecto por versiones

| Versión | Contenido | Tecnologías |
|---|---|---|
| v1.0.0 | Página principal y páginas personales | HTML, CSS, JS |
| v2.0.0 | Minijuegos de cada integrante | HTML, CSS, JS |
| v3.0.0 | React + Node.js | React, Vite, TypeScript, Node.js |

## Resumen de GitFlow

El proyecto usa el modelo GitFlow:
- `main`: código estable en producción.
- `develop`: rama de integración.
- `feature/*`: nuevas funcionalidades.
- `release/*`: preparación de versiones.
- `hotfix/*`: correcciones urgentes.

