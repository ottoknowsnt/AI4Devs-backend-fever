import { Router } from 'express';
import { getCandidatesByPosition } from '../presentation/controllers/positionController';

const router = Router();

// Endpoint para obtener todos los candidatos por posición
router.get('/:id/candidates', getCandidatesByPosition);

export default router;