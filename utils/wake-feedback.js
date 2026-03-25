import { readFileSync, writeFileSync } from '@zos/fs'

const FEEDBACK_PATH = 'wake_feedback.json'
const MAX_ENTRIES = 30
const MIN_ENTRIES_FOR_ADJUSTMENT = 5
const MAX_ADJUSTMENT = 0.1

const DEFAULT_THRESHOLDS = {
  light_min: 0.1,
  conservative: 0.55,
  normal: 0.7,
  aggressive: 0.9
}

const REASON_TO_THRESHOLD = {
  light_sleep: 'light_min',
  rem_acceptable: 'conservative',
  non_deep_normal_phase: 'normal',
  gap_stage_mid_window: 'normal',
  deep_but_urgent: 'aggressive',
  no_data_late_window: 'aggressive',
  error_late_window: 'aggressive'
}

export function saveFeedback(entry) {
  try {
    let data = { entries: [] }
    try {
      const raw = readFileSync({ path: FEEDBACK_PATH, options: { encoding: 'utf8' } })
      data = JSON.parse(raw)
    } catch (e) {
      // start fresh
    }
    data.entries = data.entries || []
    data.entries.push({ ...entry, timestamp: Date.now() })
    if (data.entries.length > MAX_ENTRIES) {
      data.entries = data.entries.slice(-MAX_ENTRIES)
    }
    writeFileSync({
      path: FEEDBACK_PATH,
      data: JSON.stringify(data),
      options: { encoding: 'utf8' }
    })
  } catch (e) {
    // ignore
  }
}

export function getThresholdOverrides() {
  try {
    const raw = readFileSync({ path: FEEDBACK_PATH, options: { encoding: 'utf8' } })
    const data = JSON.parse(raw)
    const entries = data.entries || []

    const overrides = { ...DEFAULT_THRESHOLDS }

    for (const [reason, key] of Object.entries(REASON_TO_THRESHOLD)) {
      const forReason = entries.filter((e) => e.reason === reason && e.rating != null)
      if (forReason.length < MIN_ENTRIES_FOR_ADJUSTMENT) continue

      const avg =
        forReason.reduce((sum, e) => sum + (e.rating === 'great' ? 1 : e.rating === 'okay' ? 0 : -1), 0) /
        forReason.length

      const base = DEFAULT_THRESHOLDS[key]
      if (avg < -0.3) {
        overrides[key] = Math.min(base + MAX_ADJUSTMENT, 1)
      } else if (avg > 0.3) {
        overrides[key] = Math.max(base - MAX_ADJUSTMENT, 0)
      }
    }

    return overrides
  } catch (e) {
    return { ...DEFAULT_THRESHOLDS }
  }
}
