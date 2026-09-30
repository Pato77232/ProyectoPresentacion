# Guía de Contribución

Este documento describe cómo colaborar en el repositorio del proyecto "Los Backyardigans" siguiendo el modelo GitFlow.

## Cómo empezar

1. Clona el repositorio:
git clone https://github.com/Pato77232/ProyectoPresentacion.git
cd ProyectoPresentacion

2. Cambia a `develop` y actualízala:
git checkout develop
git pull origin develop

## Ramas GitFlow

| Rama | Propósito | Nombres sugeridos |
|---|---|---|
| `main` | Código estable en producción. | — |
| `develop` | Integración de features revisados. | — |
| `feature/*` | Nueva funcionalidad o página. | `feature/estructura-seccion-<nombre>-html-css` |
| `release/*` | Preparación de una versión. | `release/3.0.0` |
| `hotfix/*` | Corrección urgente sobre `main`. | `hotfix/error-tipografico` |
## Flujo de trabajo (GitFlow)
- `main`: Código en producción (solo merges desde `release` o `hotfix`).
- `develop`: Rama de integración. Aquí llegan los features.
- `feature/*`: Ramas para nuevas funcionalidades. Se crean desde `develop`.
- `release/*`: Preparación de versiones.
- `hotfix/*`: Correcciones urgentes. Se crean desde `main`, se integran primero a `main` y luego se incorporan también en `develop`.

## Reglas para Pull Requests
1. Para nuevas funcionalidades, usar una rama `feature/nombre-tarea` y crear el PR hacia `develop`; las ramas `release/*` y `hotfix/*` se integran mediante PR hacia `main` según el flujo indicado.
2. Se requiere al menos **1 revisión aprobatoria** de otro integrante.
3. El revisor debe dejar al menos **1 comentario constructivo**.
4. Una vez aprobado, el autor hace el merge y borra la rama.

## Convención de commits

Formato: `tipo(alcance): descripción`

| Tipo | Uso | Ejemplo |
|---|---|---|
| `feat` | Nueva funcionalidad | `feat(integrantes): agrega estructura html de shirley` |
| `fix` | Corrección de error | `fix(index): rutas de integrantes corregidas` |
| `docs` | Documentación | `docs(gitignore): agrega reglas para node` |
| `style` | Estilos (CSS) | `style: aplica estilos al minijuego` |

Reglas del título:
- Verbo en imperativo (agrega, corrige, actualiza).
- Todo en minúsculas tras los dos puntos.
- Máximo 50 caracteres.
- Sin punto final.

## Flujo paso a paso

1. Actualiza `develop`:
git checkout develop
git pull origin develop

2. Crea tu rama:
git checkout -b feature/nombre-tarea

3. Trabaja y haz commits pequeños:
git status
git add <archivo>
git commit -m "feat(alcance): descripción"

4. Sube la rama:
git push -u origin feature/nombre-tarea

5. Abre un Pull Request hacia `develop` con:
- Título: `feat: descripción breve`
- Descripción: qué se hizo y cómo probarlo.
- Etiquetas: `feature`, `frontend` o `minijuego` según corresponda.
- Revisores: al menos 1 compañero.
6. Atiende la revisión: si hay comentarios, haz nuevos commits en la misma rama.
7. Cuando tengas la aprobación, haz merge en `develop` y borra la rama.

## Reglas de Pull Request

- Todo cambio entra por PR hacia `develop`. Nunca a `main` directamente.
- Se requiere al menos 1 aprobación de otro integrante.
- El revisor debe dejar al menos 1 comentario constructivo.
- El PR debe tener descripción, etiquetas y revisores asignados.
- Una vez aprobado, el autor hace el merge y borra la rama.

## Guía de revisión de código

Como revisor, verifica:
- Que el código funcione (probar localmente).
- Que las rutas de archivos sean correctas.
- Que no haya errores en la consola del navegador.
- Que los commits sigan la convención.
- Deja comentarios constructivos: sugerencias, mejoras o aprobaciones.

## Qué NO se sube al repositorio

Gracias al `.gitignore`, no se suben:
- `node_modules/` (se regenera con `npm install`).
- `dist/`, `build/` (se regeneran al compilar).
- `.env` (contiene claves y contraseñas).
- Cachés de herramientas (`.cache/`, `coverage/`).
- Configuración de editores (`.vscode/`, `.idea/`).

## Versionado semántico (SemVer)

El proyecto usa el formato `MAYOR.MENOR.PARCHE`:
- MAYOR: cambios incompatibles (1.0.0 → 2.0.0).
- MENOR: nuevas funcionalidades compatibles (1.0.0 → 1.1.0).
- PARCHE: correcciones de errores (1.0.0 → 1.0.1).

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


