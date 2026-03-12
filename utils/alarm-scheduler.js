import { set, cancel, getAllAlarms, REPEAT_DAY } from '@zos/alarm'
import { loadConfig, clearWokenFlag } from './storage'

const WAKE_SERVICE_PATH = 'app-service/wake_service'
const CHECKPOINT_INTERVAL_MINUTES = 2

function getTomorrowDate(hour, minute) {
  const now = new Date()
  const target = new Date(now)
  target.setHours(hour, minute, 0, 0)
  if (target <= now) {
    target.setDate(target.getDate() + 1)
  }
  return target
}

function toUTCTimestamp(date) {
  return Math.floor(date.getTime() / 1000)
}

export function scheduleAlarms(config) {
  if (!config.enabled) return []

  const { hour, minute, wakeWindowMinutes } = config
  const targetTime = new Date()
  targetTime.setHours(hour, minute, 0, 0)

  const windowStart = new Date(targetTime)
  windowStart.setMinutes(windowStart.getMinutes() - wakeWindowMinutes)

  const windowDurationMs = wakeWindowMinutes * 60 * 1000
  const alarmIds = []
  let checkpoint = new Date(windowStart)

  while (checkpoint <= targetTime) {
    const elapsedMs = checkpoint - windowStart
    const progress = windowDurationMs > 0 ? Math.min(elapsedMs / windowDurationMs, 1) : 1
    const isLast = checkpoint.getTime() >= targetTime.getTime()

    const nextDate = getTomorrowDate(checkpoint.getHours(), checkpoint.getMinutes())
    const timeUTC = toUTCTimestamp(nextDate)

    const id = set({
      url: WAKE_SERVICE_PATH,
      time: timeUTC,
      param: `${progress.toFixed(2)}:${isLast ? '1' : '0'}`,
      store: true,
      repeat_type: REPEAT_DAY
    })

    if (id > 0) {
      alarmIds.push(id)
    }

    if (isLast) break

    checkpoint.setMinutes(checkpoint.getMinutes() + CHECKPOINT_INTERVAL_MINUTES)
  }

  return alarmIds
}

export function cancelAllAlarms() {
  const alarms = getAllAlarms()
  if (alarms && Array.isArray(alarms)) {
    alarms.forEach((id) => {
      if (id) cancel(id)
    })
  }
}

export function applyAlarmConfig() {
  cancelAllAlarms()
  clearWokenFlag()
  const config = loadConfig()
  return scheduleAlarms(config)
}
