# Guía de Contribución

## Flujo de trabajo (GitFlow)
- `main`: Código en producción (solo merges desde `release` o `hotfix`).
- `develop`: Rama de integración. Aquí llegan los features.
- `feature/*`: Ramas para nuevas funcionalidades. Se crean desde `develop`.
- `release/*`: Preparación de versiones.
- `hotfix/*`: Correcciones urgentes. Se crean desde `main`, se integran primero a `main` y luego se incorporan también en `develop`.

## Reglas para Pull Requests
1. Para nuevas funcionalidades, usar una rama `feature/nombre-tarea` y crear el PR hacia `develop`; las ramas `release/*` y `hotfix/*` se integran mediante PR hacia `main` según el flujo indicado.
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

## Hotfix urgente
1. Actualizar `main` y crear una rama para el arreglo:
	```bash
	git switch main
	git pull origin main
	git switch -c hotfix/descripcion-breve
	```
2. Hacer la corrección mínima, ejecutar las pruebas disponibles y registrar el cambio con `fix: descripción breve`.
3. Publicar la rama y abrir un PR hacia `main`:
	```bash
	git push -u origin hotfix/descripcion-breve
	```
4. Tras la aprobación y el merge a `main`, llevar ese arreglo a `develop` para que no se pierda en el siguiente release:
	```bash
	git switch develop
	git pull origin develop
	git merge origin/main
	git push origin develop
	```
5. Eliminar la rama `hotfix/*` después de integrar ambos PR/merges.

No desarrollar funcionalidades nuevas dentro de una rama `hotfix/*`; deben ir en `feature/*` desde `develop`.


