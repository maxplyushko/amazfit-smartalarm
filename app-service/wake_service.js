import { Sleep } from '@zos/sensor'
import { notify } from '@zos/notification'

AppService({
  onInit(params) {
    if (!params) return

    const [isLastStr] = String(params).split(':')
    const isLast = isLastStr === '1'

    let shouldWake = false

    try {
      const sleep = new Sleep()
      sleep.updateInfo()

      const stageConstants = sleep.getStageConstantObj()
      const stages = sleep.getStage()

      const now = new Date()
      const currentMinutes = now.getHours() * 60 + now.getMinutes()

      if (!stages || stages.length === 0) {
        shouldWake = isLast
      } else {
        let currentStage = stageConstants.DEEP_STAGE
        for (const s of stages) {
          if (currentMinutes >= s.start && currentMinutes < s.stop) {
            currentStage = s.model
            break
          }
        }

        const isLightOrWake =
          currentStage === stageConstants.LIGHT_STAGE || currentStage === stageConstants.WAKE_STAGE
        shouldWake = isLightOrWake || isLast
      }

      if (shouldWake) {
        notify({
          title: 'Smart Alarm',
          content: 'Time to wake up!',
          vibrate: 5,
          actions: [
            {
              text: 'Wake Up',
              file: 'page/wake/index',
              param: ''
            }
          ]
        })
      }
    } catch (e) {
      if (isLast) {
        notify({
          title: 'Smart Alarm',
          content: 'Time to wake up!',
          vibrate: 5,
          actions: [
            {
              text: 'Wake Up',
              file: 'page/wake/index',
              param: ''
            }
          ]
        })
      }
    }
  }
})
