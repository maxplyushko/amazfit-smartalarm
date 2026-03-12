import { set, cancel, getAllAlarms, REPEAT_DAY } from '@zos/alarm'
import { loadConfig } from './storage'

const WAKE_SERVICE_PATH = 'app-service/wake_service'
const CHECKPOINT_INTERVAL_MINUTES = 5

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

  const alarmIds = []
  let checkpoint = new Date(windowStart)

  while (checkpoint <= targetTime) {
    const checkpointIndex = Math.floor(
      (checkpoint - windowStart) / (CHECKPOINT_INTERVAL_MINUTES * 60 * 1000)
    )
    const isLast = checkpoint.getTime() >= targetTime.getTime()

    const nextDate = getTomorrowDate(checkpoint.getHours(), checkpoint.getMinutes())
    const timeUTC = toUTCTimestamp(nextDate)

    const id = set({
      url: WAKE_SERVICE_PATH,
      time: timeUTC,
      param: `${checkpointIndex}:${isLast ? '1' : '0'}`,
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
  const config = loadConfig()
  return scheduleAlarms(config)
}
