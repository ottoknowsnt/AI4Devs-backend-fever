import { Request, Response } from 'express';
import {
  addCandidate as addCandidateService,
  findCandidateById,
  advanceCandidateToNextStage,
} from '../../application/services/candidateService';

export const addCandidateController = async (req: Request, res: Response) => {
  try {
    const candidateData = req.body;
    const candidate = await addCandidateService(candidateData);
    res
      .status(201)
      .json({ message: 'Candidate added successfully', data: candidate });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res
        .status(400)
        .json({ message: 'Error adding candidate', error: error.message });
    } else {
      res
        .status(400)
        .json({ message: 'Error adding candidate', error: 'Unknown error' });
    }
  }
};

export const getCandidateById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    const candidate = await findCandidateById(id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateCandidateToNextStage = async (
  req: Request,
  res: Response,
) => {
  try {
    const candidateId = parseInt(req.params.id);

    if (isNaN(candidateId)) {
      return res.status(400).json({ error: 'ID de candidato inválido' });
    }

    const result = await advanceCandidateToNextStage(candidateId);

    if (result.success) {
      return res.status(200).json({
        message: 'Candidato avanzado a la siguiente fase exitosamente',
        data: result.data,
      });
    } else {
      return res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error al actualizar la fase del candidato:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export { addCandidateService as addCandidate };
