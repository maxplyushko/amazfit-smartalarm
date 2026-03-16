import { Sleep, HeartRate } from '@zos/sensor'

/**
 * Progressive wake strategy thresholds.
 * As window progress increases, more sleep stages become acceptable for waking.
 *
 * 0.00-0.20  Earliest     — only WAKE (already awake)
 * 0.20-0.55  Conservative — adds LIGHT
 * 0.55-0.70  Normal       — adds REM
 * 0.70-0.90  Aggressive   — anything except DEEP
 * 0.90-1.00  Forced       — wake regardless
 */
const PHASE_LIGHT_MIN = 0.2
const PHASE_CONSERVATIVE = 0.55
const PHASE_NORMAL = 0.7
const PHASE_AGGRESSIVE = 0.9

const TRANSITION_BONUS = 0.08
const MIN_TIME_IN_STAGE = 3
const MIN_WAKE_DURATION = 2

function getCurrentMinutes() {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

function stageSpans(stage, minutes) {
  let { start, stop } = stage
  if (stop < start) {
    return minutes >= start || minutes < stop
  }
  return minutes >= start && minutes < stop
}

function findCurrentStage(stages, currentMinutes) {
  for (const s of stages) {
    if (stageSpans(s, currentMinutes)) {
      return { model: s.model, start: s.start, stop: s.stop, exact: true }
    }
  }

  let nearest = null
  let minGap = Infinity
  for (const s of stages) {
    const gap = currentMinutes - s.stop
    const adjustedGap = gap < 0 ? gap + 1440 : gap
    if (adjustedGap < minGap) {
      minGap = adjustedGap
      nearest = s
    }
  }

  if (nearest && minGap <= 10) {
    return { model: nearest.model, start: nearest.start, stop: nearest.stop, exact: false }
  }

  return null
}

function findPreviousStage(stages, currentMinutes) {
  let best = null
  let bestGap = Infinity
  for (const s of stages) {
    if (stageSpans(s, currentMinutes)) continue
    const gap = currentMinutes - s.stop
    const adjusted = gap < 0 ? gap + 1440 : gap
    if (adjusted < bestGap && adjusted <= 15) {
      bestGap = adjusted
      best = s
    }
  }
  return best ? best.model : null
}

function detectTrend(stages, constants, currentMinutes) {
  const WEIGHT = { [constants.WAKE_STAGE]: 4, [constants.LIGHT_STAGE]: 3, [constants.REM_STAGE]: 2, [constants.DEEP_STAGE]: 1 }

  const recent = stages
    .filter((s) => {
      const diff = currentMinutes - s.stop
      const adjusted = diff < 0 ? diff + 1440 : diff
      return adjusted <= 30 && adjusted >= 0
    })
    .sort((a, b) => a.start - b.start)
    .slice(-3)

  if (recent.length < 2) return 0

  let ascending = 0
  for (let i = 1; i < recent.length; i++) {
    const prev = WEIGHT[recent[i - 1].model] || 1
    const curr = WEIGHT[recent[i].model] || 1
    ascending += curr - prev
  }

  return ascending > 0 ? 1 : ascending < 0 ? -1 : 0
}

const HR_WINDOW = 10
const HR_MIN_SAMPLES = 6
const HR_FLAT_THRESHOLD = 2

function detectHRTrend() {
  try {
    const hr = new HeartRate()
    const today = hr.getToday()

    if (!today || today.length < HR_MIN_SAMPLES) return 0

    const recent = today.filter((v) => v > 0).slice(-HR_WINDOW)
    if (recent.length < HR_MIN_SAMPLES) return 0

    const mid = Math.floor(recent.length / 2)
    const firstHalf = recent.slice(0, mid)
    const secondHalf = recent.slice(mid)

    const avg = (arr) => arr.reduce((sum, v) => sum + v, 0) / arr.length
    const delta = avg(secondHalf) - avg(firstHalf)

    if (delta > HR_FLAT_THRESHOLD) return 1
    if (delta < -HR_FLAT_THRESHOLD) return -1
    return 0
  } catch (e) {
    return 0
  }
}

export function evaluateWake(progress, isLast) {
  if (isLast || progress >= 1) return { shouldWake: true, reason: 'deadline' }

  try {
    const sleep = new Sleep()
    sleep.updateInfo()

    const constants = sleep.getStageConstantObj()
    const stages = sleep.getStage()
    const currentMinutes = getCurrentMinutes()

    if (!stages || stages.length === 0) {
      if (progress >= PHASE_AGGRESSIVE) return { shouldWake: true, reason: 'no_data_late_window' }
      return { shouldWake: false, reason: 'no_data' }
    }

    const resolved = findCurrentStage(stages, currentMinutes)

    if (!resolved) {
      if (progress >= PHASE_NORMAL) return { shouldWake: true, reason: 'gap_stage_mid_window' }
      return { shouldWake: false, reason: 'gap_stage_early' }
    }

    const stage = resolved.model
    const isLight = stage === constants.LIGHT_STAGE
    const isWake = stage === constants.WAKE_STAGE
    const isREM = stage === constants.REM_STAGE
    const isDeep = stage === constants.DEEP_STAGE
    const stageTrend = detectTrend(stages, constants, currentMinutes)
    const hrTrend = detectHRTrend()
    const previousStage = findPreviousStage(stages, currentMinutes)
    const fromDeeper = isLight && (previousStage === constants.REM_STAGE || previousStage === constants.DEEP_STAGE)
    const stageTrendBonus = stageTrend > 0 ? 0.05 : 0
    const hrTrendBonus = hrTrend > 0 ? 0.05 : hrTrend < 0 ? -0.03 : 0
    const transitionBonus = fromDeeper ? TRANSITION_BONUS : 0
    const effectiveProgress = Math.min(Math.max(progress + stageTrendBonus + hrTrendBonus + transitionBonus, 0), 1)

    const minutesInStage = currentMinutes - resolved.start
    const adjustedMinutesInStage = minutesInStage < 0 ? minutesInStage + 1440 : minutesInStage

    if (isWake && (adjustedMinutesInStage >= MIN_WAKE_DURATION || effectiveProgress >= 0.10)) {
      return { shouldWake: true, reason: 'awake' }
    }

    const stableLightSleep = adjustedMinutesInStage >= MIN_TIME_IN_STAGE

    if (isLight && effectiveProgress >= PHASE_LIGHT_MIN && stableLightSleep) {
      return { shouldWake: true, reason: 'light_sleep' }
    }

    if (isREM && effectiveProgress >= PHASE_CONSERVATIVE) {
      return { shouldWake: true, reason: 'rem_acceptable' }
    }

    if (!isDeep && effectiveProgress >= PHASE_NORMAL) {
      return { shouldWake: true, reason: 'non_deep_normal_phase' }
    }

    if (isDeep && effectiveProgress >= PHASE_AGGRESSIVE) {
      return { shouldWake: true, reason: 'deep_but_urgent' }
    }

    return { shouldWake: false, reason: 'waiting_for_lighter_stage' }
  } catch (e) {
    if (progress >= PHASE_AGGRESSIVE) return { shouldWake: true, reason: 'error_late_window' }
    return { shouldWake: false, reason: 'error' }
  }
}
