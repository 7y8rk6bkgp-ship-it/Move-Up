import type { Achievement, Exercise, RoutineTemplate } from './types'

// Deterministic ids so seeding is idempotent across reinstalls.
export const defaultExercises: Exercise[] = [
  // Empuje - pecho / hombros / triceps
  { id: 'ex-press-banca', name: 'Press de banca', muscleGroup: 'pecho', secondaryMuscles: ['triceps', 'hombros'], pattern: 'empuje', isCustom: false },
  { id: 'ex-press-banca-inclinado', name: 'Press inclinado con barra', muscleGroup: 'pecho', secondaryMuscles: ['hombros', 'triceps'], pattern: 'empuje', isCustom: false },
  { id: 'ex-press-mancuernas', name: 'Press con mancuernas', muscleGroup: 'pecho', secondaryMuscles: ['triceps', 'hombros'], pattern: 'empuje', isCustom: false },
  { id: 'ex-aperturas', name: 'Aperturas con mancuernas', muscleGroup: 'pecho', secondaryMuscles: [], pattern: 'empuje', isCustom: false },
  { id: 'ex-fondos', name: 'Fondos en paralelas', muscleGroup: 'pecho', secondaryMuscles: ['triceps', 'hombros'], pattern: 'empuje', isCustom: false },
  { id: 'ex-press-militar', name: 'Press militar', muscleGroup: 'hombros', secondaryMuscles: ['triceps'], pattern: 'empuje', isCustom: false },
  { id: 'ex-press-mancuernas-hombro', name: 'Press de hombro con mancuernas', muscleGroup: 'hombros', secondaryMuscles: ['triceps'], pattern: 'empuje', isCustom: false },
  { id: 'ex-elevaciones-laterales', name: 'Elevaciones laterales', muscleGroup: 'hombros', secondaryMuscles: [], pattern: 'empuje', isCustom: false },
  { id: 'ex-elevaciones-frontales', name: 'Elevaciones frontales', muscleGroup: 'hombros', secondaryMuscles: [], pattern: 'empuje', isCustom: false },
  { id: 'ex-press-frances', name: 'Press francés', muscleGroup: 'triceps', secondaryMuscles: [], pattern: 'empuje', isCustom: false },
  { id: 'ex-extension-triceps-polea', name: 'Extensión de tríceps en polea', muscleGroup: 'triceps', secondaryMuscles: [], pattern: 'empuje', isCustom: false },
  { id: 'ex-fondos-triceps', name: 'Fondos en banco', muscleGroup: 'triceps', secondaryMuscles: ['pecho'], pattern: 'empuje', isCustom: false },

  // Tirón - espalda / biceps / trapecios
  { id: 'ex-dominadas', name: 'Dominadas', muscleGroup: 'espalda', secondaryMuscles: ['biceps'], pattern: 'tiron', isCustom: false },
  { id: 'ex-remo-barra', name: 'Remo con barra', muscleGroup: 'espalda', secondaryMuscles: ['biceps'], pattern: 'tiron', isCustom: false },
  { id: 'ex-remo-mancuerna', name: 'Remo con mancuerna a una mano', muscleGroup: 'espalda', secondaryMuscles: ['biceps'], pattern: 'tiron', isCustom: false },
  { id: 'ex-jalon-pecho', name: 'Jalón al pecho', muscleGroup: 'espalda', secondaryMuscles: ['biceps'], pattern: 'tiron', isCustom: false },
  { id: 'ex-remo-polea', name: 'Remo en polea baja', muscleGroup: 'espalda', secondaryMuscles: ['biceps'], pattern: 'tiron', isCustom: false },
  { id: 'ex-peso-muerto', name: 'Peso muerto', muscleGroup: 'espalda', secondaryMuscles: ['isquiotibiales', 'gluteos'], pattern: 'tiron', isCustom: false },
  { id: 'ex-curl-barra', name: 'Curl de bíceps con barra', muscleGroup: 'biceps', secondaryMuscles: [], pattern: 'tiron', isCustom: false },
  { id: 'ex-curl-mancuerna', name: 'Curl de bíceps con mancuernas', muscleGroup: 'biceps', secondaryMuscles: [], pattern: 'tiron', isCustom: false },
  { id: 'ex-curl-martillo', name: 'Curl martillo', muscleGroup: 'biceps', secondaryMuscles: ['antebrazos'], pattern: 'tiron', isCustom: false },
  { id: 'ex-encogimientos', name: 'Encogimientos de hombros', muscleGroup: 'trapecios', secondaryMuscles: [], pattern: 'tiron', isCustom: false },
  { id: 'ex-face-pull', name: 'Face pull', muscleGroup: 'hombros', secondaryMuscles: ['trapecios'], pattern: 'tiron', isCustom: false },

  // Pierna
  { id: 'ex-sentadilla', name: 'Sentadilla con barra', muscleGroup: 'cuadriceps', secondaryMuscles: ['gluteos'], pattern: 'pierna', isCustom: false },
  { id: 'ex-sentadilla-frontal', name: 'Sentadilla frontal', muscleGroup: 'cuadriceps', secondaryMuscles: ['gluteos'], pattern: 'pierna', isCustom: false },
  { id: 'ex-prensa', name: 'Prensa de piernas', muscleGroup: 'cuadriceps', secondaryMuscles: ['gluteos'], pattern: 'pierna', isCustom: false },
  { id: 'ex-zancadas', name: 'Zancadas', muscleGroup: 'cuadriceps', secondaryMuscles: ['gluteos'], pattern: 'pierna', isCustom: false },
  { id: 'ex-extension-cuadriceps', name: 'Extensión de cuádriceps', muscleGroup: 'cuadriceps', secondaryMuscles: [], pattern: 'pierna', isCustom: false },
  { id: 'ex-peso-muerto-rumano', name: 'Peso muerto rumano', muscleGroup: 'isquiotibiales', secondaryMuscles: ['gluteos'], pattern: 'pierna', isCustom: false },
  { id: 'ex-curl-femoral', name: 'Curl femoral', muscleGroup: 'isquiotibiales', secondaryMuscles: [], pattern: 'pierna', isCustom: false },
  { id: 'ex-hip-thrust', name: 'Hip thrust', muscleGroup: 'gluteos', secondaryMuscles: ['isquiotibiales'], pattern: 'pierna', isCustom: false },
  { id: 'ex-elevacion-talones', name: 'Elevación de talones (gemelos)', muscleGroup: 'gemelos', secondaryMuscles: [], pattern: 'pierna', isCustom: false },

  // Core
  { id: 'ex-plancha', name: 'Plancha', muscleGroup: 'abdomen', secondaryMuscles: [], pattern: 'core', isCustom: false },
  { id: 'ex-crunch', name: 'Crunch abdominal', muscleGroup: 'abdomen', secondaryMuscles: [], pattern: 'core', isCustom: false },
  { id: 'ex-elevacion-piernas', name: 'Elevación de piernas colgado', muscleGroup: 'abdomen', secondaryMuscles: [], pattern: 'core', isCustom: false },
  { id: 'ex-rueda-abdominal', name: 'Rueda abdominal', muscleGroup: 'abdomen', secondaryMuscles: ['hombros'], pattern: 'core', isCustom: false },
]

export const defaultTemplates: RoutineTemplate[] = [
  {
    id: 'tpl-push',
    name: 'Push',
    isCustom: false,
    exerciseIds: [
      'ex-press-banca',
      'ex-press-militar',
      'ex-press-banca-inclinado',
      'ex-elevaciones-laterales',
      'ex-press-frances',
    ],
  },
  {
    id: 'tpl-pull',
    name: 'Pull',
    isCustom: false,
    exerciseIds: [
      'ex-dominadas',
      'ex-remo-barra',
      'ex-jalon-pecho',
      'ex-curl-barra',
      'ex-face-pull',
    ],
  },
  {
    id: 'tpl-pierna',
    name: 'Pierna',
    isCustom: false,
    exerciseIds: [
      'ex-sentadilla',
      'ex-peso-muerto-rumano',
      'ex-prensa',
      'ex-curl-femoral',
      'ex-elevacion-talones',
    ],
  },
  {
    id: 'tpl-full-body',
    name: 'Full Body',
    isCustom: false,
    exerciseIds: [
      'ex-sentadilla',
      'ex-press-banca',
      'ex-remo-barra',
      'ex-press-militar',
      'ex-plancha',
    ],
  },
]

export const defaultAchievements: Achievement[] = [
  { id: 'ach-racha-3', category: 'consistencia', name: 'Encendiendo motores', description: 'Entrena 3 días seguidos', targetValue: 3, icon: '🔥' },
  { id: 'ach-racha-7', category: 'consistencia', name: 'Semana perfecta', description: 'Entrena 7 días seguidos', targetValue: 7, icon: '🔥' },
  { id: 'ach-racha-30', category: 'consistencia', name: 'Imparable', description: 'Entrena 30 días seguidos', targetValue: 30, icon: '🚀' },
  { id: 'ach-sesiones-10', category: 'consistencia', name: 'Primeros pasos', description: 'Completa 10 sesiones', targetValue: 10, icon: '🏁' },
  { id: 'ach-sesiones-50', category: 'consistencia', name: 'Rutina de hierro', description: 'Completa 50 sesiones', targetValue: 50, icon: '🏋️' },
  { id: 'ach-sesiones-100', category: 'consistencia', name: 'Veterano', description: 'Completa 100 sesiones', targetValue: 100, icon: '🎖️' },
  { id: 'ach-pr-1', category: 'fuerza', name: 'Nuevo límite', description: 'Consigue tu primer récord personal', targetValue: 1, icon: '💪' },
  { id: 'ach-pr-10', category: 'fuerza', name: 'Rompe-récords', description: 'Consigue 10 récords personales', targetValue: 10, icon: '💥' },
  { id: 'ach-pr-25', category: 'fuerza', name: 'Leyenda local', description: 'Consigue 25 récords personales', targetValue: 25, icon: '👑' },
  { id: 'ach-volumen-10000', category: 'volumen', name: 'Diez toneladas', description: 'Acumula 10,000 kg de volumen total', targetValue: 10000, icon: '📦' },
  { id: 'ach-volumen-100000', category: 'volumen', name: 'Cien toneladas', description: 'Acumula 100,000 kg de volumen total', targetValue: 100000, icon: '🏔️' },
  { id: 'ach-volumen-1000000', category: 'volumen', name: 'Un millón', description: 'Acumula 1,000,000 kg de volumen total', targetValue: 1000000, icon: '🌋' },
  { id: 'ach-ejercicios-10', category: 'exploracion', name: 'Curioso', description: 'Registra 10 ejercicios distintos', targetValue: 10, icon: '🧭' },
  { id: 'ach-ejercicios-25', category: 'exploracion', name: 'Explorador', description: 'Registra 25 ejercicios distintos', targetValue: 25, icon: '🗺️' },
  { id: 'ach-musculos-8', category: 'exploracion', name: 'Cuerpo completo', description: 'Entrena 8 grupos musculares distintos', targetValue: 8, icon: '🫀' },
]
