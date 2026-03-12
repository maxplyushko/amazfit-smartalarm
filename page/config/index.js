import { createWidget, widget, align, text_style, prop } from '@zos/ui'
import { push } from '@zos/router'
import { loadConfig, saveConfig } from '../../utils/storage'
import { applyAlarmConfig } from '../../utils/alarm-scheduler'
import { addPickerConfirm } from '../../utils/picker-confirm'

const W = 466
const BLOCK_W = 300
const BLOCK_H = 60
const BLOCK_X = (W - BLOCK_W) / 2

function pad(n) {
  return n < 10 ? '0' + n : '' + n
}

Page({
  state: {
    hour: 7,
    minute: 0,
    wakeWindow: 30,
    enabled: false,
    _toggleBtn: null,
    _toggleBtnY: 0
  },

  onInit() {
    const config = loadConfig()
    this.state.hour = config.hour
    this.state.minute = config.minute
    this.state.wakeWindow = config.wakeWindowMinutes
    this.state.enabled = config.enabled
  },

  build() {
    let y = 30

    y = this._buildTimeBlock(y)
    y = this._buildWindowBlock(y + 16)
    this._buildToggle(y + 16)

    const self = this
    addPickerConfirm(function () {
      saveConfig({
        enabled: self.state.enabled,
        hour: self.state.hour,
        minute: self.state.minute,
        wakeWindowMinutes: self.state.wakeWindow
      })
      applyAlarmConfig()
    })
  },

  _buildTimeBlock(y) {
    createWidget(widget.TEXT, {
      x: BLOCK_X, y: y, w: BLOCK_W, h: 32,
      color: 0x999999, text_size: 18,
      align_h: align.CENTER_H, align_v: align.CENTER_V,
      text_style: text_style.NONE, text: 'Set time'
    })

    y += 36

    createWidget(widget.BUTTON, {
      x: BLOCK_X, y: y, w: BLOCK_W, h: BLOCK_H,
      text: pad(this.state.hour) + ':' + pad(this.state.minute),
      text_size: 32, color: 0xffffff,
      normal_color: 0x222222, press_color: 0x333333, radius: 16,
      click_func: () => push({ url: 'page/time-picker/index' })
    })

    return y + BLOCK_H
  },

  _buildWindowBlock(y) {
    createWidget(widget.TEXT, {
      x: BLOCK_X, y: y, w: BLOCK_W, h: 32,
      color: 0x999999, text_size: 18,
      align_h: align.CENTER_H, align_v: align.CENTER_V,
      text_style: text_style.NONE, text: 'Wake window'
    })

    y += 36

    createWidget(widget.BUTTON, {
      x: BLOCK_X, y: y, w: BLOCK_W, h: BLOCK_H,
      text: this.state.wakeWindow + ' min',
      text_size: 32, color: 0xffffff,
      normal_color: 0x222222, press_color: 0x333333, radius: 16,
      click_func: () => push({ url: 'page/window-picker/index' })
    })

    return y + BLOCK_H
  },

  _buildToggle(y) {
    createWidget(widget.TEXT, {
      x: BLOCK_X, y: y, w: BLOCK_W, h: 32,
      color: 0x999999, text_size: 18,
      align_h: align.CENTER_H, align_v: align.CENTER_V,
      text_style: text_style.NONE, text: 'Alarm'
    })

    y += 36
    this.state._toggleBtnY = y

    this.state._toggleBtn = createWidget(widget.BUTTON, {
      x: BLOCK_X, y: y, w: BLOCK_W, h: BLOCK_H,
      text: this.state.enabled ? 'ON' : 'OFF',
      text_size: 28, color: 0xffffff,
      normal_color: this.state.enabled ? 0x2d8a4e : 0x444444,
      press_color: this.state.enabled ? 0x3aad62 : 0x555555,
      radius: 16,
      click_func: () => this._toggleEnabled()
    })

    return y + BLOCK_H
  },

  _toggleEnabled() {
    this.state.enabled = !this.state.enabled
    const on = this.state.enabled
    this.state._toggleBtn.setProperty(prop.MORE, {
      x: BLOCK_X, y: this.state._toggleBtnY, w: BLOCK_W, h: BLOCK_H,
      text: on ? 'ON' : 'OFF',
      color: 0xffffff,
      normal_color: on ? 0x2d8a4e : 0x444444,
      press_color: on ? 0x3aad62 : 0x555555
    })
  }
})
