# Sistema de Estacionamiento Medido

Plataforma full-stack para gestionar estacionamiento medido con tres roles:

- **Conductor:** administra vehículos, inicia/finaliza sesiones de estacionamiento (pospago), carga saldo con Mercado Pago y consulta/paga multas.
- **Inspector:** verifica patentes, labra multas y consulta multas existentes.
- **Administrador:** dibuja zonas en un mapa, define precios, horario de cobro e inspectores.

**Demo:** _(link de Vercel)_ · **API:** _(link de Render)_

## Stack

| Capa | Tecnologías |
|---|---|
| Frontend | React 18, TypeScript, Vite, React Router, Leaflet, PWA |
| Backend | Node.js, Express, TypeScript, Prisma |
| Base de datos | MySQL |
| Autenticación | Clerk (roles propios en BD) |
| Pagos | Mercado Pago (checkout, webhook con firma HMAC, reconciliación) |

## Arquitectura

Backend en capas: `routes → controllers → services → repositories (Prisma)`, con `adapters` para servicios externos (Mercado Pago). Las operaciones de saldo y pagos corren en transacciones. Un job cierra automáticamente las sesiones al terminar el horario de cobro.

## Correr en local

```bash
# Backend
cd backend-estacionamiento
cp .env.example .env      # completar valores
npm install
npx prisma migrate deploy
npm run dev               # http://localhost:3000

# Frontend
cd frontend-estacionamiento
# .env: VITE_CLERK_PUBLISHABLE_KEY=pk_test_...  (VITE_API_URL opcional en local)
npm install
npm run dev               # http://localhost:5173
```

Con `MP_MODO_SIMULADO=true` los pagos se aprueban sin contactar a Mercado Pago.

## Deploy

1. **Base de datos:** MySQL gestionado (Aiven / Railway / TiDB Cloud). Copiar la `DATABASE_URL`.
2. **Backend (Render):** New → Blueprint → elegir este repo (usa [render.yaml](render.yaml)). Completar las variables marcadas en el dashboard. Las migraciones corren solas en cada deploy.
3. **Frontend (Vercel):** importar el repo con *Root Directory* `frontend-estacionamiento`. Variables: `VITE_API_URL=https://<api>.onrender.com/api` y `VITE_CLERK_PUBLISHABLE_KEY`.
4. En Render, setear `FRONTEND_URL` y `MP_BACK_URL` con la URL de Vercel (CORS y retorno de pagos).
5. En Clerk, agregar la URL de Vercel a los dominios permitidos.

> El plan gratuito de Render duerme la API tras inactividad; la primera request puede tardar ~50 s.
