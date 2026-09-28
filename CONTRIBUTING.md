# Guía de Contribución

## Flujo de trabajo (GitFlow)
- `main`: Código en producción (solo merges desde `release` o `hotfix`).
- `develop`: Rama de integración. Aquí llegan los features.
- `feature/*`: Ramas para nuevas funcionalidades. Se crean desde `develop`.
- `release/*`: Preparación de versiones.
- `hotfix/*`: Correcciones urgentes en `main`.

## Reglas para Pull Requests
1. Todo cambio debe ir en una rama `feature/nombre-tarea`.
2. Crear PR hacia `develop` (nunca a `main` directamente).
3. Se requiere al menos **1 revisión aprobatoria** de otro integrante.
4. El revisor debe dejar al menos **1 comentario constructivo**.
5. Una vez aprobado, el autor hace el merge y borra la rama.

## Convención de commits
Usar prefijos:
- `feat:` nueva funcionalidad
- `fix:` corrección de error
- `docs:` documentación
- `style:` formato/estilos
- `refactor:` refactorización

Ejemplo: `feat: agregar juego interactivo en página de integrante 1`


