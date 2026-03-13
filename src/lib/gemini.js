// Cliente Gemini 1.5 Flash — motor de IA para contestaciones de tutela
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature:     0.3,  // bajo para respuestas más precisas y formales
    topP:            0.8,
    maxOutputTokens: 8192,
  },
});

/**
 * Genera la contestación jurídica de una tutela usando Gemini.
 * @param {Object} caso - Datos del caso extraídos de la BD
 * @returns {Promise<{contenido: string, tokensUsados: number}>}
 */
export async function generarContestacion(caso) {
  const prompt = buildPrompt(caso);

  const result = await geminiModel.generateContent(prompt);
  const response = result.response;
  const contenido = response.text();
  const tokensUsados = response.usageMetadata?.totalTokenCount ?? 0;

  return { contenido, tokensUsados };
}

/**
 * Construye el prompt jurídico especializado para tutelas colombianas.
 */
function buildPrompt(caso) {
  return `Eres un abogado experto en derecho constitucional colombiano con amplia experiencia en acciones de tutela.
Redactas contestaciones formales, precisas y con fundamento jurídico sólido.

Genera la contestación formal para la siguiente acción de tutela.
El documento debe estar escrito en español jurídico formal colombiano.

---
DATOS DEL CASO:
- Accionante: ${caso.accionante}
- Accionado (tu representado): ${caso.accionado}
- Tipo de tutela: ${caso.tipoTutela}
- Juez: ${caso.juez || "Sin especificar"}
- Juzgado: ${caso.juzgado || "Sin especificar"}
- Radicado: ${caso.radicado || "Sin especificar"}

HECHOS NARRADOS POR EL ACCIONANTE:
${caso.hechos}

DERECHOS FUNDAMENTALES INVOCADOS:
${caso.derechosInvocados}
---

ESTRUCTURA OBLIGATORIA DEL DOCUMENTO:

1. ENCABEZADO FORMAL
   (Señor Juez, ciudad, datos del caso)

2. IDENTIFICACIÓN DEL ACCIONADO
   (Quién responde y en qué calidad)

3. EXCEPCIONES PREVIAS
   (Si aplican: falta de legitimación, cosa juzgada, improcedencia, etc.)

4. RESPUESTA A LOS HECHOS
   (Pronunciarse sobre cada hecho: admitido, negado o no consta)

5. ARGUMENTOS DE DERECHO
   (Fundamentos legales y constitucionales para la defensa)

6. JURISPRUDENCIA APLICABLE
   (Citar sentencias relevantes de la Corte Constitucional: T-, SU-, C-)

7. PRETENSIONES
   (Solicitudes concretas al juzgado)

8. PRUEBAS SOLICITADAS
   (Si aplica)

9. NOTIFICACIONES
   (Dirección para notificaciones)

Redacta el documento completo con el formato de un escrito judicial colombiano profesional.`;
}
