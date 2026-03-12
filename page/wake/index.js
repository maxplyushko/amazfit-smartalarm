import { createWidget, widget, align, text_style } from '@zos/ui'
import { Vibrator, VIBRATOR_SCENE_NOTIFICATION } from '@zos/sensor'
import { back } from '@zos/router'
import { setPageBrightTime } from '@zos/display'
import { markWoken } from '../../utils/storage'

const W = 466

function getVibrationPattern(urgency) {
  if (urgency < 40) return { onMs: 200, offMs: 3000 }
  if (urgency < 70) return { onMs: 400, offMs: 2000 }
  if (urgency < 90) return { onMs: 600, offMs: 1200 }
  return { onMs: 800, offMs: 800 }
}

Page({
  state: {
    vibrator: null,
    vibInterval: null,
    urgency: 50,
    escalationTimer: null
  },

  onInit(param) {
    const parsed = Number.parseInt(param, 10)
    if (!Number.isNaN(parsed)) {
      this.state.urgency = Math.max(0, Math.min(parsed, 100))
    }
  },

  build() {
    markWoken()
    setPageBrightTime({ brightTime: 120000 })

    createWidget(widget.TEXT, {
      x: 0,
      y: 140,
      w: W,
      h: 60,
      color: 0xffffff,
      text_size: 32,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text_style: text_style.NONE,
      text: 'Good morning!'
    })

    createWidget(widget.TEXT, {
      x: 0,
      y: 210,
      w: W,
      h: 40,
      color: 0x999999,
      text_size: 20,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text_style: text_style.NONE,
      text: 'Time to wake up'
    })

    createWidget(widget.BUTTON, {
      x: (W - 200) / 2,
      y: 300,
      w: 200,
      h: 60,
      text: 'Dismiss',
      text_size: 24,
      color: 0xffffff,
      normal_color: 0xcc3333,
      press_color: 0xff5555,
      radius: 30,
      click_func: () => this._dismiss()
    })

    this._startVibrationLoop()
    this._startEscalation()
  },

  _startVibrationLoop() {
    this.state.vibrator = new Vibrator()
    this.state.vibrator.setMode(VIBRATOR_SCENE_NOTIFICATION)
    this._applyPattern()
  },

  _applyPattern() {
    this._clearInterval()
    const { offMs } = getVibrationPattern(this.state.urgency)
    this.state.vibrator.start()
    this.state.vibInterval = setInterval(() => {
      this.state.vibrator.start()
    }, offMs)
  },

  _startEscalation() {
    this.state.escalationTimer = setInterval(() => {
      if (this.state.urgency < 100) {
        this.state.urgency = Math.min(this.state.urgency + 10, 100)
        this._applyPattern()
      }
    }, 15000)
  },

  _dismiss() {
    this._stopVibration()
    back()
  },

  _clearInterval() {
    if (this.state.vibInterval) {
      clearInterval(this.state.vibInterval)
      this.state.vibInterval = null
    }
  },

  _stopVibration() {
    this._clearInterval()
    if (this.state.escalationTimer) {
      clearInterval(this.state.escalationTimer)
      this.state.escalationTimer = null
    }
    if (this.state.vibrator) {
      this.state.vibrator.stop()
      this.state.vibrator = null
    }
  },

  onDestroy() {
    this._stopVibration()
  }
})
