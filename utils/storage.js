import { readFileSync, writeFileSync } from '@zos/fs'

const CONFIG_PATH = 'config.json'

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
