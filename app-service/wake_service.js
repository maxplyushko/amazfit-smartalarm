import { set } from '@zos/alarm'
import { notify } from '@zos/notification'
import { evaluateWake } from '../utils/sleep-evaluator'
import { isAlreadyWoken } from '../utils/storage'
import { applyAlarmConfig } from '../utils/alarm-scheduler'

function triggerWake(progress) {
  const urgency = Math.round(Math.min(progress, 1) * 100)
  const param = JSON.stringify({ url: 'page/wake/index', urgency: String(urgency) })

  const id = set({
    url: 'page/wake/index',
    delay: 1,
    param: param,
    store: false
  })

  if (id > 0) return

  notify({
    title: 'Smart Alarm',
    content: 'Time to wake up!',
    vibrate: 5,
    actions: [
      {
        text: 'Wake Up',
        file: 'page/wake/index',
        param: String(urgency)
      }
    ]
  })
}

AppService({
  onInit(params) {
    if (!params) return

    const parts = String(params).split(':')
    const progress = Number.parseFloat(parts[0]) || 0
    const isLast = parts[1] === '1'

    if (isAlreadyWoken()) return

    const result = evaluateWake(progress, isLast)

    if (result.shouldWake) {
      applyAlarmConfig()
      triggerWake(progress)
    }
  }
})
