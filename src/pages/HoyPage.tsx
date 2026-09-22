import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/db'
import { ActiveWorkoutView } from '@/modules/registro/ActiveWorkoutView'
import { StartWorkoutView } from '@/modules/registro/StartWorkoutView'
import { useActiveSessionStore } from '@/store/useActiveSessionStore'

export function HoyPage() {
  const activeSessionId = useActiveSessionStore((s) => s.activeSessionId)
  const session = useLiveQuery(
    () => (activeSessionId ? db.sessions.get(activeSessionId) : undefined),
    [activeSessionId],
  )

  if (activeSessionId && session && !session.endedAt) {
    return <ActiveWorkoutView session={session} />
  }

  return <StartWorkoutView />
}
