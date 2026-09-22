import Dexie, { type EntityTable } from 'dexie'
import type {
  Achievement,
  AchievementProgress,
  AppSettings,
  BodyWeightLog,
  Exercise,
  PersonalRecord,
  PrEvent,
  RoutineTemplate,
  SetEntry,
  WorkoutSession,
} from './types'

export class MoveUpDatabase extends Dexie {
  exercises!: EntityTable<Exercise, 'id'>
  sessions!: EntityTable<WorkoutSession, 'id'>
  sets!: EntityTable<SetEntry, 'id'>
  bodyWeightLogs!: EntityTable<BodyWeightLog, 'id'>
  templates!: EntityTable<RoutineTemplate, 'id'>
  settings!: EntityTable<AppSettings, 'id'>
  achievements!: EntityTable<Achievement, 'id'>
  achievementProgress!: EntityTable<AchievementProgress, 'achievementId'>
  personalRecords!: EntityTable<PersonalRecord, 'exerciseId'>
  prEvents!: EntityTable<PrEvent, 'id'>

  constructor() {
    super('move-up')

    this.version(1).stores({
      exercises: 'id, muscleGroup, pattern, isCustom, archivedAt',
      sessions: 'id, date',
      sets: 'id, sessionId, exerciseId, [sessionId+exerciseOrder], createdAt',
      bodyWeightLogs: 'id, date',
      templates: 'id, name',
      settings: 'id',
      achievements: 'id, category',
      achievementProgress: 'achievementId',
      personalRecords: 'exerciseId',
      prEvents: 'id, exerciseId, date',
    })
  }
}

export const db = new MoveUpDatabase()
