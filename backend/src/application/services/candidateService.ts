import { Candidate } from '../../domain/models/Candidate';
import { validateCandidateData } from '../validator';
import { Education } from '../../domain/models/Education';
import { WorkExperience } from '../../domain/models/WorkExperience';
import { Resume } from '../../domain/models/Resume';
import { prisma } from '../../infrastructure/database/prismaClient';

export const addCandidate = async (candidateData: any) => {
  try {
    validateCandidateData(candidateData); // Validar los datos del candidato
  } catch (error: any) {
    throw new Error(error);
  }

  const candidate = new Candidate(candidateData); // Crear una instancia del modelo Candidate
  try {
    const savedCandidate = await candidate.save(); // Guardar el candidato en la base de datos
    const candidateId = savedCandidate.id; // Obtener el ID del candidato guardado

    // Guardar la educación del candidato
    if (candidateData.educations) {
      for (const education of candidateData.educations) {
        const educationModel = new Education(education);
        educationModel.candidateId = candidateId;
        await educationModel.save();
        candidate.education.push(educationModel);
      }
    }

    // Guardar la experiencia laboral del candidato
    if (candidateData.workExperiences) {
      for (const experience of candidateData.workExperiences) {
        const experienceModel = new WorkExperience(experience);
        experienceModel.candidateId = candidateId;
        await experienceModel.save();
        candidate.workExperience.push(experienceModel);
      }
    }

    // Guardar los archivos de CV
    if (candidateData.cv && Object.keys(candidateData.cv).length > 0) {
      const resumeModel = new Resume(candidateData.cv);
      resumeModel.candidateId = candidateId;
      await resumeModel.save();
      candidate.resumes.push(resumeModel);
    }
    return savedCandidate;
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Unique constraint failed on the fields: (`email`)
      throw new Error('The email already exists in the database');
    } else {
      throw error;
    }
  }
};

export const findCandidateById = async (
  id: number,
): Promise<Candidate | null> => {
  try {
    const candidate = await Candidate.findOne(id); // Cambio aquí: pasar directamente el id
    return candidate;
  } catch (error) {
    console.error('Error al buscar el candidato:', error);
    throw new Error('Error al recuperar el candidato');
  }
};

export const advanceCandidateToNextStage = async (candidateId: number) => {
  try {
    // Verificar que el candidato existe
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      return { success: false, error: 'Candidato no encontrado' };
    }

    // Obtener la aplicación más reciente del candidato
    const latestApplication = await prisma.application.findFirst({
      where: { candidateId },
      orderBy: { applicationDate: 'desc' },
      include: {
        interviewStep: {
          include: {
            interviewFlow: true,
          },
        },
      },
    });

    if (!latestApplication) {
      return { success: false, error: 'El candidato no tiene aplicaciones' };
    }

    // Obtener el flujo de entrevista actual
    const currentInterviewFlowId =
      latestApplication.interviewStep.interviewFlowId;

    // Obtener todas las fases del mismo flujo de entrevista ordenadas por orderIndex
    const interviewSteps = await prisma.interviewStep.findMany({
      where: { interviewFlowId: currentInterviewFlowId },
      orderBy: { orderIndex: 'asc' },
    });

    // Encontrar el índice de la fase actual
    const currentStepIndex = interviewSteps.findIndex(
      (step) => step.id === latestApplication.currentInterviewStep,
    );

    if (currentStepIndex === -1) {
      return {
        success: false,
        error: 'Fase actual no encontrada en el flujo de entrevista',
      };
    }

    // Verificar si hay una siguiente fase
    if (currentStepIndex + 1 >= interviewSteps.length) {
      return {
        success: false,
        error: 'El candidato ya está en la última fase del proceso',
      };
    }

    // Obtener la siguiente fase
    const nextStep = interviewSteps[currentStepIndex + 1];

    // Actualizar la aplicación con la nueva fase
    const updatedApplication = await prisma.application.update({
      where: { id: latestApplication.id },
      data: { currentInterviewStep: nextStep.id },
      include: {
        position: true,
        interviewStep: true,
      },
    });

    return {
      success: true,
      data: {
        application: updatedApplication,
        previousStep: interviewSteps[currentStepIndex].name,
        currentStep: nextStep.name,
      },
    };
  } catch (error) {
    console.error('Error al avanzar el candidato a la siguiente fase:', error);
    throw new Error('Error al avanzar el candidato a la siguiente fase');
  }
};
