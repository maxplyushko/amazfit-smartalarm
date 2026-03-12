import { readFileSync, writeFileSync } from '@zos/fs'

const CONFIG_PATH = 'config.json'
const WAKE_STATE_PATH = 'wake_state.json'

const DEFAULT_CONFIG = {
  enabled: false,
  hour: 7,
  minute: 0,
  wakeWindowMinutes: 30
}

export function loadConfig() {
  try {
    const data = readFileSync({
      path: CONFIG_PATH,
      options: { encoding: 'utf8' }
    })
    return { ...DEFAULT_CONFIG, ...JSON.parse(data) }
  } catch (e) {
    return { ...DEFAULT_CONFIG }
  }
}

export function saveConfig(config) {
  writeFileSync({
    path: CONFIG_PATH,
    data: JSON.stringify(config),
    options: { encoding: 'utf8' }
  })
}

export function markWoken() {
  const now = new Date()
  writeFileSync({
    path: WAKE_STATE_PATH,
    data: JSON.stringify({ wokenAt: now.getTime(), date: now.toDateString() }),
    options: { encoding: 'utf8' }
  })
}

export function isAlreadyWoken() {
  try {
    const data = readFileSync({
      path: WAKE_STATE_PATH,
      options: { encoding: 'utf8' }
    })
    const state = JSON.parse(data)
    return state.date === new Date().toDateString()
  } catch (e) {
    return false
  }
}

export function clearWokenFlag() {
  try {
    writeFileSync({
      path: WAKE_STATE_PATH,
      data: JSON.stringify({}),
      options: { encoding: 'utf8' }
    })
  } catch (e) {
    // ignore
  }
}
