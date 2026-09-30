# Los Backyardigans

Aplicación de presentación del equipo de Ingeniería de Software de la UTA. La portada, los perfiles y los cinco minijuegos de Leslie están desarrollados con React, TypeScript y Vite; Express sirve los datos de perfil y registra los resultados de la feria.

## Requisitos

- Node.js `^20.19.0` o `>=22.12.0` (requisito de Vite 8)
- npm

## Desarrollo

Instala dependencias en cada aplicación:

```bash
npm --prefix backend install
npm --prefix fronted_presentacion install
```

Inicia el API y el frontend en terminales separadas:

```bash
npm --prefix backend run dev
npm --prefix fronted_presentacion run dev
```

Abre la URL indicada por Vite, normalmente `http://localhost:5173/`. El frontend reenvía `/api` al servidor Node en `http://127.0.0.1:3000`.

## Verificación de release

```bash
npm --prefix backend run check
npm --prefix fronted_presentacion run lint
npm --prefix fronted_presentacion run build
```

La salida de producción queda en `fronted_presentacion/dist` e incluye únicamente la aplicación React.

## Versión 3.0.0

Release mayor de la migración a React y Node.js: perfiles React, cinco minijuegos React para Leslie, API de perfiles y resultados, build unificado y retiro de páginas y recursos sustituidos.

## Integrantes

- Shirley Amaguaña (Tasha)
- Edwin Caraguay (Tyrone)
- Leslie Coello (Uniqua)
- David Cuenca (Austin)
- Pablo Toapanta (Pablo)

Proyecto académico - Universidad Técnica de Ambato.
