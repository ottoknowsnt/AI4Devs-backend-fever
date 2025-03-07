# Plugin utilizado

Copilot con Claude 3.7 Sonnet Thinking

# Prompts utilizados

## PUT /candidates/:id/stage

```
Eres un desarrollador backend senior que trabaja en LTI, una startup que quiere desarrollar el ATS (Applicant-Tracking System) del futuro.

Tu misión es añadir nuevos endpoints para obtener o modificar información concreta de los candidatos. En el archivo `README.md` encontrarás la estructura básica del proyecto y las tecnologías utilizadas, y en el archivo `CODING_GUIDELINES.md` encontrarás las convenciones de código que debes seguir.

Para empezar, se te requiere implementar un endpoint que permita actualizar la fase actual del proceso de entrevista en la que se encuentra un candidato específico. El endpoint deberá seguir la siguiente estructura: `PUT /candidates/:id/stage`, donde `:id` es el identificador del candidato y la petición no contendrá cuerpo.

Antes de implementar el código, detalla los pasos que seguirás para implementar este endpoint y los archivos que crearás o modificarás, y realiza cualquier pregunta que consideres necesaria para completar la tarea.
```

Se tuvieron que aclarar algunas dudas antes de empezar a implementar el código:

```
Aquí te dejo las respuestas a las preguntas:

1. y 2. Consideremos que un candidato solo puede tener una aplicación activa, y por tanto seleccionemos la más reciente, no hace falta especificar el id entonces.
3. y 4. Exacto, el endpoint deberá avanzar automáticamente a la siguiente fase. Puedes observar como `InterviewStep` tiene un campo `orderIndex` que define el orden de estas dentro de un `InterviewFlow`.

¿Tienes alguna otra pregunta antes de empezar a implementar el código?
```

Se estaba utilizando un cliente de Prisma que no estaba implementando, por lo que se pidió que se implementara:

```
prismaClient todavía no está implementado en `/infrastructure/database/prismaClient`. ¿Podrías implementarlo?
```

## GET /positions/:id/candidates

```
¡Perfecto! Ahora necesitamos un endpoint que recoja todos los candidatos en proceso para una determinada posición, es decir, todas las aplicaciones para un determinado `positionID`. El endpoint deberá seguir la siguiente estructura: `GET /positions/:id/candidates` y deberá proporcionar la siguiente información básica:

- Nombre completo del candidato (de la tabla candidate).
- `current_interview_step`: en qué fase del proceso está el candidato (de la tabla application).
- La puntuación media del candidato. Recuerda que cada entrevista (`Interview`) realizada por el candidato tiene un `score`

Como siempre, antes de implementar el código, detalla los pasos que seguirás para implementar este endpoint y los archivos que crearás o modificarás, y realiza cualquier pregunta que consideres necesaria para completar la tarea.
```
