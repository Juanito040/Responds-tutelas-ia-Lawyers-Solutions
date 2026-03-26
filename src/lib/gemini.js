// Cliente IA — Groq con Llama 3.3 70B para contestaciones de tutela
import Groq from "groq-sdk";

const SYSTEM_PROMPT = `Eres un abogado litigante colombiano con 20 años de experiencia en derecho constitucional y acciones de tutela. Has representado a entidades públicas, EPS, empresas privadas y funcionarios en miles de tutelas ante todos los niveles de la jurisdicción.

DOMINAS con precisión:
- El Decreto 2591 de 1991 (procedimiento de tutela): plazos, requisitos, procedencia
- La Constitución Política de Colombia (artículos 11, 13, 16, 29, 44, 48, 49, 86, 229)
- Jurisprudencia vinculante de la Corte Constitucional (sentencias T-, SU-, C-)
- Ley 1751 de 2015 (Ley Estatutaria de Salud)
- Ley 100 de 1993 y sus reformas (sistema de seguridad social)
- Ley 1437 de 2011 (CPACA — Código de Procedimiento Administrativo)
- Ley 80 de 1993 (contratos estatales, cuando aplica)
- Código General del Proceso (pruebas, términos)
- Reglas del MIPRES para prescripción de medicamentos y procedimientos

ANÁLISIS PREVIO OBLIGATORIO — ANTES DE REDACTAR CUALQUIER CONTESTACIÓN:
Antes de escribir una sola línea, identifica mentalmente:
1. ¿Qué derechos fundamentales alega el accionante que fueron vulnerados?
2. ¿Cuál es el argumento central del accionante? ¿Es un caso de hecho superado, de improcedencia, de vía de hecho o de incumplimiento real?
3. ¿Existe alguna causal de improcedencia aplicable? (subsidiariedad, inmediatez, falta de legitimación, extemporaneidad)
4. ¿Qué hechos se admiten, cuáles se niegan y cuáles no constan? Define esto ANTES de escribir la sección III.
5. ¿Cuál es la teoría del caso del accionado? Elige UNA y mantenla en todo el escrito.
Solo después de responder estas cinco preguntas, redacta la contestación.

ESTILO DE REDACCIÓN — LÉXICO Y ESTRUCTURA FORENSE COLOMBIANA:

CONECTORES JURÍDICOS — usa estos con naturalidad y variedad (no siempre el mismo):
  Introductorios:   "Cabe precisar que", "Ha de señalarse que", "Procede indicar que", "Es menester advertir que", "Conviene recordar que", "Sobre el particular"
  De desarrollo:    "En ese orden de ideas", "De conformidad con", "A la luz de", "En efecto", "Dicho lo anterior", "Como quiera que", "De suerte que", "Valga decir"
  De consecuencia:  "Se impone concluir que", "Resulta forzoso señalar que", "No queda duda de que", "Con base en lo expuesto", "De lo anterior se sigue que"
  De contraste:     "Sin embargo", "No obstante lo anterior", "A pesar de lo alegado", "Contrario a lo sostenido por el accionante"
  Técnicos latinos: "Prima facie", "In extenso", "Sub examine", "A fortiori", "Mutatis mutandis" (úsalos con moderación, solo donde aporten precisión)

ESTRUCTURA INTERNA DE CADA PÁRRAFO JURÍDICO — sigue siempre este orden de tres pasos:
  1. PREMISA: enuncia la regla jurídica o precedente aplicable ("La Corte Constitucional ha establecido que...")
  2. SUBSUNCIÓN: aplica la regla a los hechos del caso ("En el asunto sub examine, se verifica que...")
  3. CONSECUENCIA: extrae la conclusión jurídica ("Por lo tanto, no se configura vulneración alguna del derecho...")

VOCABULARIO TÉCNICO ESPECÍFICO — usa estos términos donde correspondan:
  Tutela general:     "carencia actual de objeto", "daño consumado", "perjuicio irremediable", "mecanismo subsidiario y residual", "amenaza o vulneración inminente"
  Tutela judicial:    "causal específica de procedibilidad", "defecto sustantivo / fáctico / orgánico / procedimental", "violación directa de la Constitución", "juez natural", "cosa juzgada", "autonomía e independencia judicial"
  Argumentación:      "a quo", "ad quem", "no prospera el cargo", "no hay lugar al amparo solicitado", "deviene improcedente", "carece de sustento fáctico y jurídico"

CITAS JURISPRUDENCIALES — formato obligatorio:
  Usa SIEMPRE este formato exacto. NO inventes el texto de la sentencia — solo el número, año y M.P. que conoces con certeza. El extracto lo deja el abogado:
  "La Corte Constitucional, en Sentencia [número] ([año], M.P. [nombre]), señaló: [COMPLETAR: extracto del ratio decidendi]. Este precedente resulta plenamente aplicable al caso sub examine, por cuanto [explica tú mismo la conexión con los hechos del caso]."
  REGLA: el argumento que conecta la sentencia con el caso SÍ lo redactas tú. El texto literal de la sentencia NUNCA lo inventes — déjalo como [COMPLETAR: extracto de Sentencia X].

TONO Y PERSONALIDAD DEL ESCRITO:
- Firmeza institucional: el escrito defiende una posición con convicción, sin arrogancia
- Respeto al despacho: siempre "respetuosamente", "con todo comedimiento"
- Precisión quirúrgica: cada afirmación va respaldada con norma, hecho o sentencia
- Sin frases vacías: nunca "es claro que", "resulta evidente que" sin desarrollarlo — el juez quiere el argumento, no la conclusión sola

REGLAS DE ORO — ERRORES QUE DEBES EVITAR SIEMPRE:
1. CONSISTENCIA: Elige UNA teoría del caso y mantenla de principio a fin. Jamás digas "no hubo vulneración" y luego ofrezcas remediarla — eso es una contradicción que el juez aprovechará para conceder la tutela.
2. COHERENCIA en hechos: Responde cada hecho de forma alineada con tu teoría central. Si afirmas hecho superado, todos los hechos deben responder en ese sentido.
3. ARGUMENTOS VEDADOS en tutelas de salud: (a) Agotamiento previo de PQRS — la Corte lo rechaza siempre en salud; (b) "Demoras administrativas" o "falta de agenda" — equivalen a admitir incumplimiento; (c) "Problemas con el prestador" — la EPS no puede trasladar su ineficiencia al usuario.
4. ESTRATEGIA: La contestación más fuerte en salud es siempre el HECHO SUPERADO — demostrar que el servicio ya fue autorizado o prestado. Si no aplica, defender que se actúa dentro del término legal con datos concretos.

REGLAS DE IDENTIFICACIÓN DEL ACCIONADO:
1. Si el accionado es un JUZGADO o DESPACHO JUDICIAL: JAMÁS incluyas NIT — los juzgados no son personas jurídicas con NIT, pertenecen a la Rama Judicial y se identifican únicamente por su denominación oficial (ej: "Juzgado Veintidós Civil Municipal en Oralidad de Cali"). La facultad para contestar la tutela proviene del Art. 19 del Decreto 2591 de 1991, NUNCA del Código General del Proceso.
2. Si el accionado es una EPS, empresa o entidad con NIT real conocido: úsalo. Si no lo conoces, NO lo inventes — escribe únicamente el nombre de la entidad.
3. Si el accionado es una persona natural: usa el número de cédula si está en los datos; si no, omítelo.

MANEJO DE DATOS FALTANTES — REGLA CRÍTICA:
Cuando un dato específico no esté disponible en la información del caso (dirección, NIT, número de autorización, fecha de cita, número de historia clínica, T.P. del apoderado, etc.), NO lo inventes. En su lugar, usa este formato de placeholder exacto:
  [COMPLETAR: descripción del dato requerido]
Ejemplos correctos:
  - "Me notifico en la dirección [COMPLETAR: dirección de notificación del accionado]"
  - "Apoderado Judicial de [nombre accionado], T.P. No. [COMPLETAR: tarjeta profesional del abogado]"
  - "Autorización No. [COMPLETAR: número de autorización del procedimiento]"
Esto permite que el abogado revisor complete los datos reales antes de radicar. NUNCA sustituyas un placeholder con datos inventados que el abogado no podrá verificar.`;

function getClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY no configurada en .env");
  return new Groq({ apiKey });
}

// ─── LISTAS DE DETECCIÓN ──────────────────────────────────────────────────────

// Nombres de EPS colombianas (sin importar si el abogado escribe "EPS X" o solo "X")
const EPS_NOMBRES = [
  "eps", "coomeva", "sanitas", "colsanitas", "compensar", "famisanar",
  "medimás", "medimas", "nueva eps", "cafesalud", "coosalud", "sura",
  "aliansalud", "convida", "emssanar", "mallamas", "ecoopsos",
  "mutual ser", "pijaos salud", "capital salud", "savia salud",
  "salud mia", "cajacopi", "asmet salud", "ambuq", "salud total",
  "cruz blanca", "humana vivir", "comparta", "coosalud", "comfenalco",
  "comfama", "saludvida", "cosmitet", "capresoca", "anas wayuu",
];

// Nombres y palabras clave de entidades públicas colombianas
const ENTIDAD_PUBLICA_NOMBRES = [
  "alcald", "gobernac", "ministerio", "secretar", "icbf", "sena",
  "uariv", "unidad para las víctimas", "invias", "superintend",
  "procuradur", "defensor", "registradur", "dane", "ani", "adres",
  "dps", "prosperidad social", "colpensiones", "fonvivienda",
  "caja de vivienda", "instituto nacional", "agencia nacional",
  "fondo nacional", "banco agrario", "finagro", "artesanías",
  "icanh", "inpec", "uspec", "ideam", "igac", "fiscalía",
  "contraloría", "personería", "concejo", "asamblea departamental",
  "junta de acción", "empresa de servicios públicos",
  "empresa social del estado", "ese ", "hospital público",
];

// ─── DETECCIÓN CENTRALIZADA ───────────────────────────────────────────────────

/**
 * Detecta si el accionado es un juzgado o despacho judicial.
 */
function esJuzgadoODespacho(accionado = "") {
  const texto = accionado.toLowerCase();
  return (
    texto.includes("juzgado") ||
    texto.includes("tribunal") ||
    texto.includes("despacho") ||
    texto.includes("sala de") ||
    texto.includes("corte ") ||
    texto.includes("consejo de estado") ||
    texto.includes("rama judicial")
  );
}

/**
 * Determina el tipo de caso a partir del enum explícito del usuario y keywords de respaldo.
 * El tipoTutela seleccionado por el usuario tiene prioridad sobre el análisis de keywords.
 * @returns {"JUZGADO"|"SALUD"|"LABORAL"|"DEBIDO_PROCESO"|"ENTIDAD_PUBLICA"|"GENERAL"}
 */
function getTipoCaso(caso) {
  const tipoEnum  = caso.tipoTutela?.toUpperCase() ?? "";
  const accionado = caso.accionado?.toLowerCase() ?? "";
  const hechos    = (caso.hechos ?? "").toLowerCase();

  // 1. Juzgado — siempre primero (caso más específico, independiente del tipoTutela)
  if (esJuzgadoODespacho(caso.accionado)) return "JUZGADO";

  // 2. tipoTutela explícito del formulario tiene prioridad sobre keywords
  if (tipoEnum === "SALUD")                            return "SALUD";
  if (tipoEnum === "PENSION" || tipoEnum === "TRABAJO") return "LABORAL";
  if (tipoEnum === "DEBIDO_PROCESO")                   return "DEBIDO_PROCESO";

  // 3. Para VIVIENDA, EDUCACION, IGUALDAD, INTIMIDAD, OTRO: usar keywords del accionado/hechos
  const esEPS =
    EPS_NOMBRES.some(n => accionado.includes(n)) ||
    EPS_NOMBRES.some(n => hechos.includes(n))    ||
    hechos.includes("médic") || hechos.includes("medic") ||
    hechos.includes("cirugía") || hechos.includes("medicamento") ||
    hechos.includes("procedimiento") || hechos.includes("hospitaliz");

  if (esEPS) return "SALUD";

  const esLaboral =
    hechos.includes("pensión")  || hechos.includes("pension") ||
    hechos.includes("colpensiones") || hechos.includes("despido") ||
    hechos.includes("salario")  || hechos.includes("contrato de trabajo") ||
    hechos.includes("cesantías") || hechos.includes("prima de servicios");

  if (esLaboral) return "LABORAL";

  const esEntidadPublica =
    ENTIDAD_PUBLICA_NOMBRES.some(n => accionado.includes(n));

  if (esEntidadPublica) return "ENTIDAD_PUBLICA";

  return "GENERAL";
}

// ─── SECCIÓN AUTO ADMISORIO (condicional) ─────────────────────────────────────

/**
 * Devuelve la instrucción de respuesta al auto si el caso tiene auto cargado.
 * Se inserta en cada plantilla justo antes de las PRETENSIONES.
 */
function seccionRespuestaAuto(caso) {
  if (!caso.autoJuzgado) return "";
  return `
═══════════════════════════════════════════
CUMPLIMIENTO DEL AUTO ADMISORIO DEL JUZGADO
═══════════════════════════════════════════
En atención al auto admisorio proferido por el Despacho, con todo comedimiento me permito dar respuesta a cada uno de los requerimientos formulados:

[Lee el auto transcrito arriba. Responde NUMERADA y PUNTUALMENTE cada requerimiento que el juez formuló. No omitas ninguno ni los agrupes — uno por uno. Formato obligatorio:

Requerimiento 1 — [Reproduce brevemente qué solicitó el juez en el punto 1]:
[Respuesta directa y sustantiva. Si aportas documentos: "Se adjunta como Prueba N°X: [descripción del documento]."]

Requerimiento 2 — [Reproduce brevemente qué solicitó el juez en el punto 2]:
[Respuesta directa y sustantiva...]

...continúa hasta cubrir TODOS los puntos del auto.

Los documentos referenciados aquí deben aparecer también listados en la sección de PRUEBAS.]
═══════════════════════════════════════════
`;
}

// ─── CONTEXTO ESTRATÉGICO ─────────────────────────────────────────────────────

/**
 * Devuelve el contexto estratégico y jurisprudencia clave según el tipo de caso.
 */
function getContextoEstrategico(caso) {
  const tipo = getTipoCaso(caso);

  // ── JUZGADO ───────────────────────────────────────────────────────────────
  if (tipo === "JUZGADO") {
    return `
CONTEXTO ESTRATÉGICO — JUZGADO / DESPACHO JUDICIAL COMO ACCIONADO:

⚠️ ATENCIÓN: Este es un caso de tutela contra providencia judicial. La Corte Constitucional ha establecido una doctrina muy restrictiva para su procedencia (C-590 de 2005). La estrategia defensiva principal es la IMPROCEDENCIA.

TEORÍA DEL CASO: La tutela es improcedente porque no se configura ninguna causal específica de procedencia contra providencias judiciales establecida en la Sentencia C-590 de 2005.

ARGUMENTOS EN ORDEN DE FORTALEZA:

ARGUMENTO 1 — SUBSIDIARIEDAD REFORZADA (el más sólido):
  La tutela contra providencias judiciales es absolutamente excepcional. Solo procede cuando se han agotado TODOS los recursos ordinarios y extraordinarios disponibles (apelación, casación, revisión) y subsiste una vulneración grave de derechos fundamentales. Si el accionante tenía recursos disponibles y no los usó, o si ya existe un fallo en firme sin que se hayan agotado los recursos, la tutela es improcedente.
  → Base: C-590/2005, SU-961/1999, T-001/1992.

ARGUMENTO 2 — AUSENCIA DE VÍA DE HECHO (el más frecuente):
  La providencia se fundamentó en el ordenamiento jurídico vigente, con respaldo probatorio y normativo suficiente. No se configura ninguno de los defectos que harían procedente la tutela: (a) defecto sustantivo — la norma aplicada es válida y pertinente; (b) defecto fáctico — las pruebas fueron valoradas conforme a las reglas de la sana crítica; (c) defecto orgánico — el despacho tenía plena competencia; (d) defecto procedimental — se observaron las formas propias del proceso.
  → Base: C-590/2005, T-1031/2001, T-774/2004.

ARGUMENTO 3 — INMEDIATEZ:
  Si la providencia fue proferida con anterioridad considerable a la interposición de la tutela, argumentar que se superó el plazo razonable. La Corte ha señalado que, en principio, 6 meses sin justificación hace extemporánea la tutela.
  → Base: SU-961/1999, T-594/2008.

ARGUMENTO 4 — AUTONOMÍA E INDEPENDENCIA JUDICIAL:
  El juez tiene autonomía interpretativa dentro del marco constitucional y legal. Las discrepancias hermenéuticas o el simple desacuerdo con la decisión no constituyen vía de hecho. El juez de tutela no es una tercera instancia.
  → Base: T-285/2014, SU-298/2015.

MARCO NORMATIVO:
- Constitución Política, Art. 86 (tutela), Art. 228 (autonomía judicial), Art. 229 (acceso a la justicia)
- Decreto 2591 de 1991, Arts. 6, 19, 25, 26
- Código General del Proceso (normas del proceso de origen, si aplica)

JURISPRUDENCIA CLAVE:
  * C-590 de 2005 (M.P. Jaime Córdoba Triviño) — SENTENCIA ESTRUCTURAL: establece las 8 causales específicas de procedencia de tutela contra providencias judiciales. Citar este precedente es OBLIGATORIO.
  * SU-961 de 1999 (M.P. Vladimiro Naranjo Mesa) — inmediatez como requisito de procedibilidad
  * T-1031 de 2001 (M.P. Eduardo Montealegre) — tipología de defectos que configuran vía de hecho
  * T-774 de 2004 (M.P. Manuel José Cepeda) — el juez de tutela no es tercera instancia
  * SU-298 de 2015 (M.P. Gloria Stella Ortiz) — autonomía judicial e interpretación razonable`;
  }

  // ── SALUD (EPS/IPS) ───────────────────────────────────────────────────────
  if (tipo === "SALUD") {
    return `
CONTEXTO ESTRATÉGICO — CASO DE SALUD (EPS/IPS):

⚠️ ERRORES FATALES QUE DEBES EVITAR (la Corte Constitucional los rechaza de plano):
1. NUNCA menciones "demoras administrativas", "falta de agenda" o "problemas con el prestador" como justificación. La Corte ha dicho REPETIDAMENTE que la EPS no puede trasladar sus problemas contractuales o administrativos al usuario. Mencionarlo equivale a admitir el incumplimiento.
2. NUNCA argumentes que el accionante debió agotar PQRS antes de interponer tutela. En materia de salud, la Corte ha establecido que NO es requisito previo cuando está en riesgo la salud (T-597 de 1993, T-170 de 2002, SU-508 de 2020). El juez ignorará este argumento.
3. NUNCA combines "no hubo vulneración" con "me comprometo a hacerlo en X días". Eso es una contradicción que el juez leerá como: la EPS reconoce que debe actuar. Elige UNA estrategia y defiéndela con consistencia.
4. NUNCA respondas "no consta" a un hecho y luego lo admitas indirectamente. Cada hecho se responde de forma coherente con el resto del escrito.

ESTRATEGIA CORRECTA — elige la que mejor se ajusta a los hechos:

ESTRATEGIA A — "HECHO SUPERADO" (la más efectiva si los servicios ya fueron autorizados o están en curso):
  Argumentar que los procedimientos YA fueron autorizados mediante orden número [X], programados para el [fecha concreta], con el prestador [nombre]. Si el medicamento fue entregado, indicarlo con fecha. El juez declarará la tutela improcedente por hecho superado (Decreto 2591/1991, art. 26). Esta estrategia gana el 70% de los casos.
  → Usa este argumento: "Los servicios ordenados por el médico tratante fueron autorizados y se encuentran programados, razón por la cual no existe actualmente vulneración de derecho fundamental alguno, configurándose el hecho superado previsto en el artículo 26 del Decreto 2591 de 1991."

ESTRATEGIA B — "PROCESO EN TÉRMINO" (si los servicios están siendo gestionados dentro de plazos legales):
  Demostrar que la EPS tramita la autorización dentro del término legal (Resolución 3512 de 2019: 5 días hábiles para procedimientos ambulatorios, 1 día para urgencias). Citar que no se ha vencido el término y que el derecho no ha sido vulnerado sino que está en proceso.
  → Usar: "La EPS actúa dentro del término legal establecido en la Resolución 3512 de 2019, sin que se configure mora o vulneración de derechos."

ESTRATEGIA C — "IMPROCEDENCIA POR FALTA DE URGENCIA" (si los síntomas no son de riesgo vital inminente):
  Argumentar que la tutela requiere amenaza real e inminente (Decreto 2591/1991, art. 6), y que los hechos no acreditan una urgencia que haga ineficaz la vía administrativa ordinaria. NO usar PQRS — usar en cambio: la remisión médica está siendo tramitada por la vía ordinaria sin que haya urgencia que justifique la vía constitucional.

MARCO NORMATIVO:
- Ley 1751 de 2015, Arts. 2, 6, 8, 11, 15, 17
- Ley 100 de 1993, Arts. 153, 177, 178
- Resolución 3512 de 2019 (tiempos de espera para citas y procedimientos)
- Resolución 2292 de 2021 (Plan de Beneficios en Salud — PBS)
- Decreto 780 de 2016 (sector salud)
- Decreto 2591 de 1991, Art. 26 (hecho superado)

JURISPRUDENCIA CLAVE:
  * T-760 de 2008 (M.P. Manuel José Cepeda) — derecho a la salud: disponibilidad, accesibilidad, calidad, oportunidad
  * T-683 de 2013 (M.P. Luis Ernesto Vargas) — continuidad e integralidad en la prestación
  * T-121 de 2015 (M.P. Jorge Ignacio Pretelt) — autorización de procedimientos: plazos y responsabilidad de la EPS
  * T-394 de 2016 (M.P. Gloria Stella Ortiz) — PBS y medicamentos no incluidos
  * SU-508 de 2020 (M.P. Cristina Pardo) — unificación: la EPS no puede trasladar su incapacidad organizacional al usuario
  * T-414 de 2022 (M.P. Diana Fajardo) — hecho superado en tutelas de salud: requisitos y efectos`;
  }

  // ── LABORAL / PENSIONAL ───────────────────────────────────────────────────
  if (tipo === "LABORAL") {
    return `
CONTEXTO ESTRATÉGICO — CASO LABORAL / PENSIONAL:
- Marco normativo: Ley 100 de 1993; Ley 797 de 2003; Decreto 758 de 1990; Acto Legislativo 01 de 2005
- Jurisprudencia CLAVE:
  * T-426 de 1992 (M.P. Eduardo Cifuentes) — mínimo vital y pensiones
  * SU-442 de 2016 (M.P. María Victoria Calle) — unificación en materia pensional
  * T-615 de 2016 (M.P. Alberto Rojas) — reconocimiento pensión de vejez
  * T-369 de 2019 (M.P. Diana Fajardo) — sujetos de especial protección
- Argumento central: la tutela no es el mecanismo idóneo para reclamaciones pensionales (jurisdicción ordinaria laboral), salvo perjuicio irremediable`;
  }

  // ── DEBIDO PROCESO ────────────────────────────────────────────────────────
  if (tipo === "DEBIDO_PROCESO") {
    return `
CONTEXTO ESTRATÉGICO — TUTELA POR DEBIDO PROCESO:

El artículo 29 de la Constitución garantiza el debido proceso en toda actuación judicial o administrativa. Sin embargo, la tutela es SUBSIDIARIA — solo procede si se agotaron los recursos ordinarios o si existe perjuicio irremediable.

ARGUMENTOS EN ORDEN DE FORTALEZA:

ARGUMENTO 1 — SUBSIDIARIEDAD / EXISTENCIA DE RECURSOS ORDINARIOS:
  Para actuaciones administrativas: el accionante cuenta con los recursos de reposición y apelación ante la entidad (Ley 1437 de 2011, Arts. 74-77), y con las acciones contencioso-administrativas (nulidad, nulidad y restablecimiento). La tutela no puede desplazar estos mecanismos.
  Para actuaciones disciplinarias: los recursos ante la misma entidad y la acción de nulidad ante la jurisdicción contencioso-administrativa son los mecanismos idóneos.
  → Base: T-001/1992, SU-961/1999, C-590/2005.

ARGUMENTO 2 — CUMPLIMIENTO DEL DEBIDO PROCESO:
  Demostrar que se respetaron: (a) el derecho a ser oído antes de la decisión, (b) la posibilidad de ejercer el derecho de defensa, (c) la motivación del acto o decisión, (d) la notificación en debida forma, (e) la posibilidad de impugnar la decisión.
  → Si TODOS estos elementos estuvieron presentes, no hay vulneración del Art. 29 CP.

ARGUMENTO 3 — AUSENCIA DE PERJUICIO IRREMEDIABLE:
  Si el accionante no demostró que el daño es: (i) inminente, (ii) grave, (iii) urgente de atender y (iv) no susceptible de ser reparado, la tutela es improcedente como mecanismo transitorio.
  → Base: T-225 de 1993 (M.P. Vladimiro Naranjo) — criterios del perjuicio irremediable.

ARGUMENTO 4 — LEGALIDAD DEL ACTO / DECISIÓN:
  El acto o decisión cuestionada tiene fundamento legal explícito, fue adoptado por la autoridad competente, siguió el procedimiento establecido en la ley y fue debidamente motivado y notificado.

MARCO NORMATIVO:
- Constitución Política, Art. 29 (debido proceso), Art. 86 (tutela), Art. 209 (función administrativa)
- Ley 1437 de 2011, Arts. 3, 42-45 (principios y procedimiento administrativo), Arts. 74-77 (recursos)
- Ley 734 de 2002 (Código Disciplinario Único — si es caso disciplinario)
- Ley 1952 de 2019 (nuevo Código General Disciplinario — si aplica)
- Decreto 2591 de 1991, Arts. 6, 8

JURISPRUDENCIA CLAVE:
  * T-1110 de 2005 (M.P. Humberto Sierra Porto) — elementos del debido proceso administrativo
  * T-796 de 2011 (M.P. Juan Carlos Henao) — debido proceso en actuaciones administrativas: notificación y defensa
  * SU-712 de 2013 (M.P. Jorge Ignacio Pretelt) — debido proceso disciplinario: garantías mínimas
  * T-145 de 2017 (M.P. Gloria Stella Ortiz) — debido proceso en actos administrativos: motivación y notificación
  * T-465 de 2020 (M.P. Diana Fajardo) — derecho a la defensa y al contradictorio en sede administrativa`;
  }

  // ── ENTIDAD PÚBLICA ───────────────────────────────────────────────────────
  if (tipo === "ENTIDAD_PUBLICA") {
    return `
CONTEXTO ESTRATÉGICO — ENTIDAD PÚBLICA:
- Marco normativo: Constitución Art. 2, 23, 86; Ley 1437 de 2011 (CPACA); Ley 489 de 1998
- Jurisprudencia CLAVE:
  * T-001 de 1992 (M.P. José Gregorio Hernández) — primera tutela, subsidiariedad
  * SU-961 de 1999 (M.P. Vladimiro Naranjo) — inmediatez de la tutela
  * T-743 de 2013 (M.P. Luis Ernesto Vargas) — agotamiento de recursos
  * C-590 de 2005 (M.P. Jaime Córdoba) — subsidiariedad y otros medios de defensa
- Argumento central: existencia de otro medio de defensa judicial (acción de nulidad, acción de reparación directa, derecho de petición) que hace improcedente la tutela`;
  }

  // ── GENERAL ───────────────────────────────────────────────────────────────
  return `
CONTEXTO ESTRATÉGICO — CASO GENERAL:
- Marco normativo: Constitución Art. 86, 87, 88; Decreto 2591 de 1991; Decreto 306 de 1992
- Jurisprudencia CLAVE:
  * T-001 de 1992 — subsidiariedad de la tutela
  * SU-961 de 1999 — inmediatez (tutela extemporánea)
  * T-743 de 2013 — agotamiento de otros medios
  * C-590 de 2005 — causales de improcedencia
- Evalúa si aplica alguna de estas causales de improcedencia: falta de legitimación, ausencia de vulneración inminente, existencia de otro mecanismo idóneo, extemporaneidad`;
}

// ─── PLANTILLAS DE SECCIONES ──────────────────────────────────────────────────

/**
 * Devuelve la plantilla de secciones adecuada según el tipo de caso.
 * Incluye sección de respuesta al auto admisorio cuando aplica.
 */
function getPlantillaSecciones(caso) {
  const tipo      = getTipoCaso(caso);
  const autoSec   = seccionRespuestaAuto(caso);

  // ── PLANTILLA 1: TUTELA CONTRA PROVIDENCIA JUDICIAL ──────────────────────
  if (tipo === "JUZGADO") {
    return `
I. IDENTIFICACIÓN Y CALIDAD EN QUE SE ACTÚA
[Denominación oficial del despacho accionado, SIN NIT. Señala que actúas en ejercicio de las facultades del artículo 19 del Decreto 2591 de 1991 y el artículo 86 de la Constitución. NO cites el CGP como fundamento.]

II. ANTECEDENTES RELEVANTES DEL PROCESO JUDICIAL
[Narra de forma objetiva y ordenada el contexto del proceso que dio origen a la providencia cuestionada: tipo de proceso, partes, pretensiones, etapas surtidas, decisión proferida y recursos interpuestos. Sé fiel a los hechos narrados por el accionante, sin valorarlos aún.]

III. IMPROCEDENCIA GENERAL DE LA ACCIÓN DE TUTELA
[Desarrolla el principio de subsidiariedad (Art. 86 CP, Decreto 2591/1991 Art. 6): la tutela es mecanismo excepcional. Argumenta con firmeza que el accionante contaba con recursos ordinarios (apelación, casación, revisión) y no los agotó, o que pretende reabrir un debate ya resuelto por el juez natural. Concluye que la tutela deviene improcedente.]

IV. INCUMPLIMIENTO DE LOS REQUISITOS GENERALES DE PROCEDIBILIDAD (C-590 DE 2005)
[Analiza UNO POR UNO los 6 requisitos generales que la Corte exige para que una tutela contra providencia judicial sea siquiera admisible. Para CADA requisito, señala si se cumple o no, y argumenta por qué NO se cumple en este caso:

1. RELEVANCIA CONSTITUCIONAL: ¿El asunto involucra realmente un derecho fundamental o es un simple desacuerdo con la valoración jurídica del juez?
2. AGOTAMIENTO DE RECURSOS: ¿Se agotaron todos los medios ordinarios y extraordinarios de defensa disponibles?
3. INMEDIATEZ: ¿Se interpuso la tutela dentro de un plazo razonable desde la providencia cuestionada? (Criterio: 6 meses sin justificación = extemporánea)
4. IRREGULARIDAD PROCESAL CON INCIDENCIA DIRECTA: Si alega defecto procedimental, ¿tuvo incidencia directa y determinante en la decisión?
5. IDENTIFICACIÓN RAZONABLE DE LOS HECHOS: ¿El accionante identificó con precisión los hechos que generaron la supuesta vulneración y los argumentó en el proceso ordinario?
6. NO ES TUTELA CONTRA TUTELA: ¿La providencia cuestionada es una sentencia ordinaria (no una decisión de tutela)?

Concluye que al no cumplirse los requisitos, la tutela es improcedente sin necesidad de analizar el fondo.]

V. INEXISTENCIA DE DEFECTOS CONSTITUCIONALES — RESPUESTA A LOS CARGOS DEL ACCIONANTE
[Responde DIRECTAMENTE y UNO POR UNO cada cargo o argumento que el accionante formula. Para cada uno, explica por qué NO configura defecto constitucional:

- DEFECTO SUSTANTIVO: ¿Se aplicó una norma inaplicable, inexistente o inconstitucional? Demuestra que la norma aplicada es válida y pertinente al caso.
- DEFECTO FÁCTICO: ¿Se ignoraron pruebas determinantes o se valoraron de forma arbitraria? Demuestra que la valoración probatoria fue razonada y conforme a la sana crítica.
- DEFECTO ORGÁNICO: ¿El despacho carecía de competencia? Demuestra que el juez tenía plena competencia para conocer el asunto.
- DEFECTO PROCEDIMENTAL: ¿Se vulneraron las formas propias del proceso? Demuestra que se siguió el trámite legal correspondiente.
- VIOLACIÓN DIRECTA DE LA CONSTITUCIÓN: ¿La decisión desconoció un mandato constitucional de forma directa? Demuestra que la providencia se ajusta al ordenamiento constitucional.

Si el accionante no especifica el tipo de defecto, identifícalo tú y demuestra que no se configura.]

VI. AUTONOMÍA E INDEPENDENCIA JUDICIAL
[Argumenta que los jueces tienen autonomía para interpretar la ley y valorar las pruebas (Art. 228 CP). La simple discrepancia hermenéutica o el desacuerdo con la decisión no constituyen vía de hecho. El juez de tutela no es una tercera instancia. Cita jurisprudencia relevante.]

VII. ANÁLISIS JURÍDICO DE LA PROVIDENCIA CUESTIONADA
[Explica el razonamiento jurídico de la decisión cuestionada: cuál fue el problema jurídico que resolvió, qué normas aplicó, cómo valoró las pruebas y a qué conclusión llegó. Demuestra que la decisión: (a) tiene motivación suficiente, (b) no es arbitraria ni caprichosa, (c) se ajusta razonablemente al derecho, (d) corresponde al ejercicio legítimo de la autonomía judicial.]
${autoSec}
VIII. PRETENSIONES
Solicito respetuosamente al Despacho:
PRIMERA: Declarar IMPROCEDENTE la acción de tutela de la referencia, por no cumplir los requisitos generales de procedibilidad establecidos en la Sentencia C-590 de 2005.
SEGUNDA: Subsidiariamente, NEGAR el amparo solicitado, por no configurarse vulneración de derechos fundamentales ni defecto constitucional alguno en la providencia cuestionada.

IX. PRUEBAS
[Relaciona: expediente del proceso original, providencia cuestionada, constancias de notificación, recursos interpuestos. Nómbralos como "Prueba N°1: Se aportará..."]

X. NOTIFICACIONES
Me notifico en la dirección [COMPLETAR: dirección de notificación del accionado], de la ciudad de [COMPLETAR: ciudad].

Atentamente,

[COMPLETAR: nombre completo del apoderado]
Apoderado Judicial de ${caso.accionado}
T.P. No. [COMPLETAR: número de tarjeta profesional]`;
  }

  // ── PLANTILLA 2: EPS / SALUD ──────────────────────────────────────────────
  if (tipo === "SALUD") {
    return `
I. IDENTIFICACIÓN Y CALIDAD EN QUE ACTÚA
[Nombre de la EPS, NIT si es conocido (no lo inventes), función como aseguradora en salud, calidad en que responde. Fundamento: Art. 19 Decreto 2591 de 1991.]

II. CONSIDERACIONES PREVIAS
[Si aplica causal de improcedencia (extemporaneidad, falta de legitimación), desarróllala brevemente. Si no aplica, omite esta sección o indícalo en una línea.]

III. RESPUESTA A LOS HECHOS
[Responde CADA hecho numerado del accionante: ADMITIDO / NEGADO / NO CONSTA. Nunca admitas un hecho sin matizarlo. Cada respuesta debe ser coherente con la estrategia central (hecho superado o proceso en término).]

IV. FUNDAMENTOS DE DERECHO
[Mínimo 4 normas con artículo específico: Ley 1751 de 2015 Arts. 2, 6, 11, 17; Ley 100 de 1993 Arts. 153, 177, 178; Resolución 3512 de 2019 (tiempos de espera); Decreto 780 de 2016. Explica la relevancia de cada norma para el caso.]

V. ANÁLISIS JURISPRUDENCIAL
[Cita mínimo 3 sentencias en formato: "La Corte Constitucional, en Sentencia X (año, M.P. Y), señaló: [COMPLETAR: extracto]. Este precedente resulta aplicable por cuanto [conecta con los hechos]."]

VI. ARGUMENTOS DE FONDO — ESTRATEGIA PRINCIPAL
[Desarrolla la estrategia elegida con contundencia:
- Si HECHO SUPERADO: los servicios ya fueron autorizados/prestados. No existe vulneración actual. Aplica Art. 26 Decreto 2591/1991.
- Si PROCESO EN TÉRMINO: la EPS tramita dentro del plazo legal (Resolución 3512/2019). No hay mora ni vulneración.
Sé específico: menciona qué fue autorizado, cuándo, con qué prestador (usa [COMPLETAR:] si no tienes los datos exactos).]
${autoSec}
VII. PRETENSIONES
Solicito respetuosamente al Despacho:
[PRIMERA: Declarar improcedente / negar el amparo — según la estrategia.
SEGUNDA (si aplica): Declarar hecho superado conforme al Art. 26 del Decreto 2591 de 1991.]

VIII. PRUEBAS
[Autorización del servicio, historia clínica, registro de programación de cita/procedimiento, afiliación del accionante. Nómbralos como "Prueba N°1: Se aportará..."]

IX. NOTIFICACIONES
Me notifico en la dirección [COMPLETAR: dirección de notificación de la EPS], de la ciudad de [COMPLETAR: ciudad].

Atentamente,

[COMPLETAR: nombre completo del apoderado]
Apoderado Judicial de ${caso.accionado}
T.P. No. [COMPLETAR: número de tarjeta profesional]`;
  }

  // ── PLANTILLA 3: LABORAL / PENSIONAL ─────────────────────────────────────
  if (tipo === "LABORAL") {
    return `
I. IDENTIFICACIÓN Y CALIDAD EN QUE ACTÚA
[Nombre de la entidad, NIT si es conocido, función en el sistema pensional/laboral, calidad en que responde. Fundamento: Art. 19 Decreto 2591 de 1991.]

II. IMPROCEDENCIA POR EXISTENCIA DE MECANISMO IDÓNEO
[Argumento central: la jurisdicción ordinaria laboral es el mecanismo idóneo para reclamaciones pensionales y laborales. La tutela es subsidiaria (Art. 86 CP) y no puede reemplazar el proceso laboral ordinario, salvo perjuicio irremediable. Analiza si el accionante demostró perjuicio irremediable — en la mayoría de casos no lo hace.]

III. RESPUESTA A LOS HECHOS
[Responde CADA hecho numerado: ADMITIDO / NEGADO / NO CONSTA. Mantén coherencia con la teoría de improcedencia.]

IV. FUNDAMENTOS DE DERECHO
[Ley 100 de 1993; Ley 797 de 2003; Acto Legislativo 01 de 2005; Art. 86 CP (subsidiariedad); Decreto 2591/1991 Art. 6 (causales de improcedencia). Explica relevancia de cada norma.]

V. ANÁLISIS JURISPRUDENCIAL
[Cita mínimo 3 sentencias en formato: "La Corte Constitucional, en Sentencia X (año, M.P. Y), señaló: [COMPLETAR: extracto]. Este precedente resulta aplicable por cuanto [conecta con los hechos]."]

VI. ARGUMENTOS DE FONDO
[Desarrolla: (1) existencia de acción ordinaria laboral eficaz; (2) ausencia de perjuicio irremediable demostrado; (3) si aplica: cumplimiento de la entidad con la normativa vigente y los requisitos del caso. Si hay un proceso laboral en curso, menciónalo.]
${autoSec}
VII. PRETENSIONES
Solicito respetuosamente al Despacho:
PRIMERA: Declarar IMPROCEDENTE la acción de tutela por existir mecanismo ordinario de defensa judicial idóneo y eficaz.
SEGUNDA: Subsidiariamente, NEGAR el amparo por ausencia de perjuicio irremediable y vulneración de derechos fundamentales.

VIII. PRUEBAS
[Historia laboral, resoluciones de reconocimiento o negación, documentos del proceso ordinario si existe. Nómbralos como "Prueba N°1: Se aportará..."]

IX. NOTIFICACIONES
Me notifico en la dirección [COMPLETAR: dirección de notificación], de la ciudad de [COMPLETAR: ciudad].

Atentamente,

[COMPLETAR: nombre completo del apoderado]
Apoderado Judicial de ${caso.accionado}
T.P. No. [COMPLETAR: número de tarjeta profesional]`;
  }

  // ── PLANTILLA 4: DEBIDO PROCESO ───────────────────────────────────────────
  if (tipo === "DEBIDO_PROCESO") {
    return `
I. IDENTIFICACIÓN Y CALIDAD EN QUE ACTÚA
[Nombre completo de la entidad o persona accionada, NIT o cédula si es conocido, función que cumple, calidad en que responde. Fundamento: Art. 19 Decreto 2591 de 1991.]

II. IMPROCEDENCIA POR SUBSIDIARIEDAD
[Argumento central: existen recursos ordinarios idóneos para controvertir la decisión o actuación cuestionada:
- Si es acto administrativo: recursos de reposición/apelación (Ley 1437/2011, Arts. 74-77) y acción de nulidad o nulidad y restablecimiento ante la jurisdicción contencioso-administrativa.
- Si es actuación disciplinaria: recursos ante la misma entidad y acción de nulidad.
- Si es acto judicial: aplica subsidiariedad reforzada (ver argumentos de tutela contra providencia).
Analiza si hay perjuicio irremediable que justifique la tutela como mecanismo transitorio.]

III. RESPUESTA A LOS HECHOS
[Responde CADA hecho numerado: ADMITIDO / NEGADO / NO CONSTA. Sé preciso: señala qué elementos del procedimiento sí se cumplieron. Mantén coherencia con la teoría de cumplimiento del debido proceso.]

IV. FUNDAMENTOS DE DERECHO
[Constitución Art. 29 (debido proceso), Art. 86 (subsidiariedad), Art. 209 (función administrativa); Ley 1437 de 2011, Arts. 3, 42-45, 74-77; Ley 734 de 2002 o Ley 1952 de 2019 (si es disciplinario); Decreto 2591 de 1991, Arts. 6, 8. Explica la relevancia de cada norma.]

V. ANÁLISIS JURISPRUDENCIAL
[Cita mínimo 3 sentencias en formato: "La Corte Constitucional, en Sentencia X (año, M.P. Y), señaló: [COMPLETAR: extracto]. Este precedente resulta aplicable por cuanto [conecta con los hechos]."]

VI. ARGUMENTOS DE FONDO — CUMPLIMIENTO DEL DEBIDO PROCESO
[Demuestra que la actuación cuestionada respetó todos los elementos del Art. 29 CP:
1. LEGALIDAD: la actuación tiene fundamento en norma legal expresa y la autoridad era competente.
2. DERECHO A SER OÍDO: el accionante tuvo oportunidad de presentar descargos/alegaciones antes de la decisión.
3. DERECHO DE DEFENSA: se le garantizó la asistencia de apoderado y la posibilidad de solicitar y practicar pruebas.
4. MOTIVACIÓN: la decisión fue motivada con los fundamentos fácticos y jurídicos correspondientes.
5. NOTIFICACIÓN: la decisión fue notificada en debida forma según la ley.
6. IMPUGNACIÓN: se le informaron los recursos disponibles y el término para interponerlos.
Sé específico: menciona cuándo se citó, cómo se notificó, qué recursos se le indicaron.]
${autoSec}
VII. PRETENSIONES
Solicito respetuosamente al Despacho:
PRIMERA: Declarar IMPROCEDENTE la acción de tutela por existir mecanismos ordinarios de defensa idóneos y eficaces.
SEGUNDA: Subsidiariamente, NEGAR el amparo solicitado por no configurarse vulneración del derecho al debido proceso.

VIII. PRUEBAS
[Actos o decisiones cuestionadas, constancias de notificación, actas de descargos o audiencias, comunicaciones con el accionante. Nómbralos como "Prueba N°1: Se aportará..."]

IX. NOTIFICACIONES
Me notifico en la dirección [COMPLETAR: dirección de notificación del accionado], de la ciudad de [COMPLETAR: ciudad].

Atentamente,

[COMPLETAR: nombre completo del apoderado]
Apoderado Judicial de ${caso.accionado}
T.P. No. [COMPLETAR: número de tarjeta profesional]`;
  }

  // ── PLANTILLA 5: ENTIDAD PÚBLICA ──────────────────────────────────────────
  if (tipo === "ENTIDAD_PUBLICA") {
    return `
I. IDENTIFICACIÓN Y CALIDAD EN QUE ACTÚA
[Nombre completo de la entidad pública, NIT si es conocido, función institucional, calidad en que responde. Fundamento: Art. 19 Decreto 2591 de 1991.]

II. IMPROCEDENCIA POR SUBSIDIARIEDAD
[Argumento central: existen otros mecanismos de defensa judicial idóneos (acción de nulidad y restablecimiento del derecho, acción de reparación directa, derecho de petición, acción popular, según corresponda). La tutela no puede desplazar estos mecanismos ordinarios. Analiza si hay perjuicio irremediable que justifique la tutela como mecanismo transitorio.]

III. RESPUESTA A LOS HECHOS
[Responde CADA hecho numerado: ADMITIDO / NEGADO / NO CONSTA. Incluye argumento o aclaración en cada respuesta. Mantén coherencia con la teoría de improcedencia o defensa de fondo.]

IV. FUNDAMENTOS DE DERECHO
[Constitución Art. 2, 23, 86, 90; Ley 1437 de 2011 (CPACA); Ley 489 de 1998; Decreto 2591/1991 Arts. 6, 19. Explica la relevancia de cada norma para el caso concreto.]

V. ANÁLISIS JURISPRUDENCIAL
[Cita mínimo 3 sentencias en formato: "La Corte Constitucional, en Sentencia X (año, M.P. Y), señaló: [COMPLETAR: extracto]. Este precedente resulta aplicable por cuanto [conecta con los hechos]."]

VI. ARGUMENTOS DE FONDO
[Desarrolla: (1) la entidad actuó en ejercicio de sus funciones legales; (2) existe otro mecanismo idóneo para resolver la pretensión; (3) no se demostró vulneración de derecho fundamental. Si la entidad adoptó alguna medida en favor del accionante, menciónala.]
${autoSec}
VII. PRETENSIONES
Solicito respetuosamente al Despacho:
PRIMERA: Declarar IMPROCEDENTE la acción de tutela por existencia de otros mecanismos idóneos de defensa judicial.
SEGUNDA: Subsidiariamente, NEGAR el amparo solicitado por ausencia de vulneración de derechos fundamentales.

VIII. PRUEBAS
[Actos administrativos relevantes, comunicaciones con el accionante, documentos que acrediten la actuación legal de la entidad. Nómbralos como "Prueba N°1: Se aportará..."]

IX. NOTIFICACIONES
Me notifico en la dirección [COMPLETAR: dirección de notificación de la entidad], de la ciudad de [COMPLETAR: ciudad].

Atentamente,

[COMPLETAR: nombre completo del apoderado]
Apoderado Judicial de ${caso.accionado}
T.P. No. [COMPLETAR: número de tarjeta profesional]`;
  }

  // ── PLANTILLA 6: CASO GENERAL ─────────────────────────────────────────────
  return `
I. IDENTIFICACIÓN Y CALIDAD EN QUE ACTÚA
[Quién es el accionado, NIT si es persona jurídica conocida (no lo inventes), qué función cumple, en qué calidad responde. Fundamento: Art. 19 Decreto 2591 de 1991.]

II. CONSIDERACIONES PREVIAS — IMPROCEDENCIA / EXCEPCIONES
[Analiza si aplica alguna causal: subsidiariedad, inmediatez, falta de legitimación, ausencia de vulneración inminente. Si aplica alguna, desarróllala con jurisprudencia. Si no aplica ninguna, indícalo brevemente y pasa al fondo.]

III. RESPUESTA A LOS HECHOS
[Responde CADA hecho numerado: ADMITIDO / NEGADO / NO CONSTA. No admitas hechos sin matizarlos. Cada respuesta debe incluir argumento o aclaración, coherente con la teoría del caso.]

IV. FUNDAMENTOS DE DERECHO
[Mínimo 4 normas con artículo específico y su relevancia concreta para el caso: Constitución Arts. aplicables; Decreto 2591/1991; normas sustantivas del área del derecho involucrada.]

V. ANÁLISIS JURISPRUDENCIAL
[Cita mínimo 3 sentencias en formato: "La Corte Constitucional, en Sentencia X (año, M.P. Y), señaló: [COMPLETAR: extracto]. Este precedente resulta aplicable por cuanto [conecta con los hechos]."]

VI. ARGUMENTOS DE FONDO
[El núcleo defensivo: por qué el accionado NO ha vulnerado los derechos invocados. Argumenta con normas, hechos y jurisprudencia. Sé específico y contundente.]
${autoSec}
VII. PRETENSIONES
Solicito respetuosamente al Despacho:
PRIMERA: NEGAR el amparo solicitado por ausencia de vulneración de derechos fundamentales.
[Agrega pretensiones adicionales según el caso.]

VIII. PRUEBAS
[Documentos relevantes según el tipo de caso. Nómbralos como "Prueba N°1: Se aportará..."]

IX. NOTIFICACIONES
Me notifico en la dirección [COMPLETAR: dirección de notificación del accionado], de la ciudad de [COMPLETAR: ciudad].

Atentamente,

[COMPLETAR: nombre completo del apoderado]
Apoderado Judicial de ${caso.accionado}
T.P. No. [COMPLETAR: número de tarjeta profesional]`;
}

// ─── GENERACIÓN ───────────────────────────────────────────────────────────────

/**
 * Genera la contestación jurídica de una tutela usando Groq (Llama 3.3 70B).
 * @param {Object} caso - Datos del caso extraídos de la BD
 * @returns {Promise<{contenido: string, tokensUsados: number}>}
 */
export async function generarContestacion(caso, intentos = 3) {
  const prompt = buildPrompt(caso);

  for (let intento = 1; intento <= intentos; intento++) {
    try {
      const client = getClient();
      const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user",   content: prompt },
        ],
        temperature: 0.25,
        max_tokens:  8192,
      });

      const contenido    = completion.choices[0]?.message?.content ?? "";
      const tokensUsados = completion.usage?.total_tokens ?? 0;
      return { contenido, tokensUsados };

    } catch (error) {
      const isRateLimit    = error.status === 429;
      const esUltimoIntento = intento === intentos;

      if (isRateLimit && !esUltimoIntento) {
        const segundos = Math.pow(2, intento) * 5; // 10s, 20s
        console.warn(`[Groq] Rate limit — esperando ${segundos}s (intento ${intento}/${intentos})`);
        await new Promise((r) => setTimeout(r, segundos * 1000));
        continue;
      }

      throw error;
    }
  }
}

/**
 * Construye el prompt jurídico especializado para tutelas colombianas.
 */
function buildPrompt(caso) {
  const contexto  = getContextoEstrategico(caso);
  const plantilla = getPlantillaSecciones(caso);

  // Fecha real del servidor en formato jurídico colombiano
  const fechaHoy = new Date().toLocaleDateString("es-CO", {
    day: "numeric", month: "long", year: "numeric",
  });

  const seccionAuto = caso.autoJuzgado
    ? `
═══════════════════════════════════════════
AUTO ADMISORIO DEL JUZGADO (TEXTO COMPLETO)
═══════════════════════════════════════════
Lee con atención este documento oficial. Responde ESPECÍFICAMENTE cada punto, pregunta o requerimiento que el juez formule. Si el juez solicita información concreta, inclúyela en la sección CUMPLIMIENTO DEL AUTO ADMISORIO.

${caso.autoJuzgado}
═══════════════════════════════════════════
FIN DEL AUTO
═══════════════════════════════════════════
`
    : "";

  return `Redacta la CONTESTACIÓN COMPLETA de la siguiente acción de tutela, como si fueras el apoderado judicial del accionado. El documento debe estar listo para radicar ante el despacho judicial hoy mismo.

═══════════════════════════════════════════
DATOS DEL CASO
═══════════════════════════════════════════
Radicado:   ${caso.radicado || "Sin especificar"}
Despacho:   ${caso.juzgado  || "Sin especificar"}
Juez(a):    ${caso.juez     || "Sin especificar"}
Accionante: ${caso.accionante}
Accionado:  ${caso.accionado} ← TÚ REPRESENTAS A ESTE
Tipo:       ${caso.tipoTutela}

HECHOS NARRADOS POR EL ACCIONANTE (léelos con atención — cada uno debe ser respondido):
${caso.hechos}

DERECHOS INVOCADOS:
${caso.derechosInvocados}
${seccionAuto}
${contexto}

═══════════════════════════════════════════
INSTRUCCIONES DE REDACCIÓN
═══════════════════════════════════════════
Produce el escrito completo con esta estructura. Usa el encabezado formal primero:

[COMPLETAR: ciudad], ${fechaHoy}

Señor(a) Juez(a)
${caso.juez    || "[COMPLETAR: nombre del juez]"}
${caso.juzgado || "[COMPLETAR: nombre del juzgado]"}
E.S.D.

Ref.: CONTESTACIÓN ACCIÓN DE TUTELA
Radicado: ${caso.radicado || "[COMPLETAR: número de radicado]"}
Accionante: ${caso.accionante}
Accionado: ${caso.accionado}

Luego desarrolla cada sección según la plantilla:
${plantilla}`;
}
