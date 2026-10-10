import { Router } from 'express';
import { FinanzasController } from '../controllers/controller-finanzas';
import { exigirAutenticacion, exigirRoles } from '../middlewares/seguridad';

export const peticionFinanzas = Router();

peticionFinanzas.post(
  '/webhooks/mercadopago',
  FinanzasController.recibirWebhookMercadoPago
);

// Mercado Pago exige una URL de retorno https: vuelve al backend y este redirige al frontend.
peticionFinanzas.get('/retorno', (_req, res) => {
  const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontend}/conductor`);
});

peticionFinanzas.use(exigirAutenticacion);
peticionFinanzas.use(exigirRoles('CONDUCTOR'));
peticionFinanzas.get('/saldo', FinanzasController.obtenerSaldo);
peticionFinanzas.post('/cargas', FinanzasController.cargarSaldo);
peticionFinanzas.get('/multas', FinanzasController.listarMultas);
peticionFinanzas.post('/multas/:id/pagar', FinanzasController.pagarMulta);
