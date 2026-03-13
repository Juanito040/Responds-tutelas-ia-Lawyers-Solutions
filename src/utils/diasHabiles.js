// Cálculo de días hábiles colombianos
// Excluye fines de semana y festivos de Colombia

// Festivos fijos (mes es 0-indexed)
const FESTIVOS_FIJOS = [
  { mes: 0,  dia: 1  }, // Año Nuevo
  { mes: 4,  dia: 1  }, // Día del Trabajo
  { mes: 6,  dia: 20 }, // Independencia de Colombia
  { mes: 7,  dia: 7  }, // Batalla de Boyacá
  { mes: 11, dia: 8  }, // Inmaculada Concepción
  { mes: 11, dia: 25 }, // Navidad
];

// Festivos que se trasladan al siguiente lunes (Ley Emiliani)
const FESTIVOS_LUNES = [
  { mes: 0,  dia: 6  }, // Reyes Magos
  { mes: 2,  dia: 19 }, // San José
  { mes: 5,  dia: 29 }, // San Pedro y San Pablo
  { mes: 7,  dia: 15 }, // Asunción de la Virgen
  { mes: 9,  dia: 12 }, // Día de la Raza
  { mes: 10, dia: 1  }, // Todos los Santos
  { mes: 10, dia: 11 }, // Independencia de Cartagena
];

function getSiguienteLunes(fecha) {
  const d = new Date(fecha);
  const diaSemana = d.getDay();
  if (diaSemana === 1) return d;
  const diff = diaSemana === 0 ? 1 : 8 - diaSemana;
  d.setDate(d.getDate() + diff);
  return d;
}

function esFestivo(fecha, anio) {
  const mes = fecha.getMonth();
  const dia = fecha.getDate();

  for (const f of FESTIVOS_FIJOS) {
    if (f.mes === mes && f.dia === dia) return true;
  }

  for (const f of FESTIVOS_LUNES) {
    const base = new Date(anio, f.mes, f.dia);
    const lunes = getSiguienteLunes(base);
    if (lunes.getMonth() === mes && lunes.getDate() === dia) return true;
  }

  return false;
}

/**
 * Calcula la fecha límite sumando N días hábiles a partir de una fecha.
 * @param {Date} fechaInicio - Fecha de notificación de la tutela
 * @param {number} diasHabiles - Días hábiles a sumar (default: 10)
 * @returns {Date} - Fecha límite de contestación
 */
export function calcularFechaLimite(fechaInicio, diasHabiles = 10) {
  const fecha = new Date(fechaInicio);
  let contados = 0;
  const anio = fecha.getFullYear();

  while (contados < diasHabiles) {
    fecha.setDate(fecha.getDate() + 1);
    const diaSemana = fecha.getDay();
    const esFinde = diaSemana === 0 || diaSemana === 6;

    if (!esFinde && !esFestivo(fecha, fecha.getFullYear())) {
      contados++;
    }
  }

  return fecha;
}

/**
 * Calcula los días hábiles restantes hasta una fecha límite.
 * @param {Date} fechaLimite
 * @returns {number} - Días hábiles restantes (negativo si ya venció)
 */
export function calcularDiasRestantes(fechaLimite) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const limite = new Date(fechaLimite);
  limite.setHours(0, 0, 0, 0);

  if (hoy >= limite) return 0;

  let dias = 0;
  const cursor = new Date(hoy);

  while (cursor < limite) {
    cursor.setDate(cursor.getDate() + 1);
    const diaSemana = cursor.getDay();
    const esFinde = diaSemana === 0 || diaSemana === 6;
    if (!esFinde && !esFestivo(cursor, cursor.getFullYear())) {
      dias++;
    }
  }

  return dias;
}

/**
 * Retorna clase CSS según urgencia de días restantes.
 */
export function getUrgenciaClass(diasRestantes) {
  if (diasRestantes <= 0)  return "badge-expired";
  if (diasRestantes <= 3)  return "badge-urgent";
  if (diasRestantes <= 5)  return "badge-pending";
  return "badge-progress";
}

export function getUrgenciaLabel(diasRestantes) {
  if (diasRestantes <= 0)  return "VENCIDA";
  if (diasRestantes <= 3)  return `${diasRestantes} día${diasRestantes === 1 ? "" : "s"} — URGENTE`;
  return `${diasRestantes} días hábiles`;
}
