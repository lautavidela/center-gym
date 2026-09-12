# MTGym — Monitoreá tu gym

Gestión de socios, cuotas, asistencias e ingresos para gimnasios. Producto web
con panel de administración y consulta pública de cuotas por DNI.

Social público:

- Home de producto → `/`
- Consultá tu cuota → `/mi-cuota` (búsqueda por DNI)

Panel de administración (acceso protegido, sin enlace público):

- `/admin` — Dashboard
- `/admin/asistencias` — Registro de asistencias
- `/admin/clientes` — Socios
- `/admin/ingresos` — Ingresos por mes
- `/admin/planes` — Planes de membresía
- `/admin/vencimientos` — Vencimientos
- `/admin/migracion` — Importación de datos

## Local

```bash
npm install
npm run db:setup   # genera Prisma, aplica migraciones y corre el seed
npm run dev        # http://localhost:3000
```

Requiere `DATABASE_URL` (runtime) y `DIRECT_URL` (migraciones) en `.env`, y
`SESSION_SECRET` para las sesiones del panel.

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — migraciones + build de producción
- `npm run lint` — ESLint
- `npm run db:migrate` — nueva migración local
- `npm run db:seed` — datos de ejemplo

## Stack

Next.js (App Router), Prisma + PostgreSQL (Neon), sesiones con iron-session,
Tailwind CSS. Desplegado en Vercel.