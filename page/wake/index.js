import { createWidget, widget, align, text_style } from '@zos/ui'
import { Vibrator, VIBRATOR_SCENE_NOTIFICATION } from '@zos/sensor'
import { back } from '@zos/router'

const W = 466

Page({
  state: {
    vibrator: null,
    vibInterval: null
  },

  build() {
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
  },

  _startVibrationLoop() {
    this.state.vibrator = new Vibrator()

    this.state.vibrator.setMode(VIBRATOR_SCENE_NOTIFICATION)
    this.state.vibrator.start()

    this.state.vibInterval = setInterval(() => {
      this.state.vibrator.start()
    }, 1500)
  },

  _dismiss() {
    this._stopVibration()
    back()
  },

  _stopVibration() {
    if (this.state.vibInterval) {
      clearInterval(this.state.vibInterval)
      this.state.vibInterval = null
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
