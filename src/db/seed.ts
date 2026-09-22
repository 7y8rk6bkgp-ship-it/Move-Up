import { db } from './db'
import { defaultAchievements, defaultExercises, defaultTemplates } from './seedData'

export async function ensureSeeded(): Promise<void> {
  await db.transaction(
    'rw',
    db.exercises,
    db.templates,
    db.achievements,
    db.settings,
    async () => {
      const [exerciseCount, templateCount, achievementCount, settings] = await Promise.all([
        db.exercises.count(),
        db.templates.count(),
        db.achievements.count(),
        db.settings.get('app'),
      ])

      if (exerciseCount === 0) {
        await db.exercises.bulkAdd(defaultExercises)
      }
      if (templateCount === 0) {
        await db.templates.bulkAdd(defaultTemplates)
      }
      if (achievementCount === 0) {
        await db.achievements.bulkAdd(defaultAchievements)
      }
      if (!settings) {
        await db.settings.put({ id: 'app', unit: 'kg', restTimerSeconds: 90 })
      }
    },
  )
}
