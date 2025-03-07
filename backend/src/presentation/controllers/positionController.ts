import { Request, Response } from 'express';
import { getCandidatesByPositionId } from '../../application/services/positionService';

export const getCandidatesByPosition = async (req: Request, res: Response) => {
  try {
    const positionId = parseInt(req.params.id);
    
    if (isNaN(positionId)) {
      return res.status(400).json({ error: 'ID de posición inválido' });
    }
    
    const candidates = await getCandidatesByPositionId(positionId);
    
    if (!candidates.length) {
      return res.status(404).json({
        message: 'No se encontraron candidatos para esta posición'
      });
    }
    
    return res.status(200).json({
      message: 'Candidatos obtenidos correctamente',
      data: candidates
    });
  } catch (error) {
    console.error('Error al obtener candidatos por posición:', error);
    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};