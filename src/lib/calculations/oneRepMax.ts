/**
 * Estimated 1-rep max using the Epley formula.
 * For reps <= 1 the weight itself is the estimate (formula is unstable near 1 rep).
 */
export function epley1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0
  if (reps === 1) return weightKg
  return weightKg * (1 + reps / 30)
}

/** Weight that would give the target rep count at the given estimated 1RM. */
export function weightForReps(oneRepMaxKg: number, reps: number): number {
  if (reps <= 1) return oneRepMaxKg
  return oneRepMaxKg / (1 + reps / 30)
}
