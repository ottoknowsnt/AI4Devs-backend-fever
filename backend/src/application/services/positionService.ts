import { prisma } from '../../infrastructure/database/prismaClient';

export const getCandidatesByPositionId = async (positionId: number) => {
  try {
    // Verificar que la posición existe
    const position = await prisma.position.findUnique({
      where: { id: positionId },
    });

    if (!position) {
      throw new Error('Posición no encontrada');
    }

    // Obtener todas las aplicaciones para esta posición
    // incluyendo el candidato, la fase actual de la entrevista, y todas las entrevistas
    const applications = await prisma.application.findMany({
      where: { positionId },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        interviewStep: true,
        interviews: {
          select: {
            score: true,
          },
        },
      },
    });

    // Transformar los datos para devolver la información requerida
    return applications.map((application) => {
      // Calcular la puntuación media de las entrevistas
      const scores = application.interviews
        .filter((interview) => interview.score !== null)
        .map((interview) => interview.score as number);

      const averageScore =
        scores.length > 0
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length
          : null;

      return {
        candidateId: application.candidateId,
        fullName:
          `${application.candidate.firstName} ${application.candidate.lastName || ''}`.trim(),
        email: application.candidate.email,
        currentInterviewStep: {
          id: application.interviewStep.id,
          name: application.interviewStep.name,
          orderIndex: application.interviewStep.orderIndex,
        },
        averageScore: averageScore ? parseFloat(averageScore.toFixed(2)) : null,
        interviewCount: application.interviews.length,
        applicationDate: application.applicationDate,
      };
    });
  } catch (error) {
    console.error('Error en getCandidatesByPositionId:', error);
    throw error;
  }
};
