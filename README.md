# Sistema de Estacionamiento Medido

Plataforma full-stack para gestionar estacionamiento medido con tres roles:

- **Conductor:** administra vehículos, inicia/finaliza sesiones de estacionamiento (pospago), carga saldo con Mercado Pago y consulta/paga multas.
- **Inspector:** verifica patentes, labra multas y consulta multas existentes.
- **Administrador:** dibuja zonas en un mapa, define precios, horario de cobro e inspectores.

**Demo:** https://arquitectura-y-dis-grupo-1.vercel.app · **API:** https://estacionamiento-api-yk8i.onrender.com/api/health

## Probar la demo

> La API corre en el plan gratuito de Render: la primera carga puede tardar ~50 s.

**Usuarios de la app**

| Rol | Email | Contraseña |
|---|---|---|
| Conductor | `conductor.demo+clerk_test@gmail.com` | `conductor123` |
| Inspector | `inspector.demo+clerk_test@gmail.com` | `inspector123` |

Si la app pide un código de verificación, ingresar `424242` (emails de prueba de Clerk, no se envía ningún mail).

**Pagos (sandbox de Mercado Pago, no se cobra dinero real).** Al cargar saldo o pagar una multa, iniciar sesión en Mercado Pago con el comprador de prueba:

| Dato | Valor |
|---|---|
| Usuario | `TESTUSER3697755268080454926` |
| Contraseña | `IPJHlJ3vru` |
| Código de verificación | `565532` |

Alternativa: pagar como invitado con la tarjeta de prueba Mastercard `5031 7557 3453 0604`, venc. `11/30`, CVV `123`, titular `APRO`, DNI `12345678`.

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
2. **Backend (Render):** New → Blueprint → elegir este repo (usa [render.yaml](render.yaml)). Completar las variables marcadas en el dashboard. Las migraciones corren solas en cada build.
3. **Frontend (Vercel):** importar el repo con *Root Directory* `frontend-estacionamiento`. Variables: `VITE_API_URL=https://<api>.onrender.com/api` y `VITE_CLERK_PUBLISHABLE_KEY`.
4. En Render, setear `FRONTEND_URL` y `MP_BACK_URL` con la URL de Vercel (CORS y retorno de pagos).
5. En Clerk, agregar la URL de Vercel a los dominios permitidos.

> El plan gratuito de Render duerme la API tras inactividad; la primera request puede tardar ~50 s.
