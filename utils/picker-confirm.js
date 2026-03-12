import { createWidget, widget, event, prop } from '@zos/ui'
import { back } from '@zos/router'

const W = 466
const BTN_SIZE = 66
const BTN_Y = W - BTN_SIZE - 24
const HIGHLIGHT_SIZE = BTN_SIZE + 16

export function addPickerConfirm(onConfirm) {
  createWidget(widget.FILL_RECT, {
    x: 0, y: BTN_Y - 4, w: W, h: W - BTN_Y + 4,
    color: 0x222222, radius: 0
  })

  var highlight = createWidget(widget.CIRCLE, {
    center_x: W / 2,
    center_y: BTN_Y + BTN_SIZE / 2,
    radius: HIGHLIGHT_SIZE / 2,
    color: 0x333333,
    alpha: 0
  })

  createWidget(widget.IMG, {
    x: (W - BTN_SIZE) / 2,
    y: BTN_Y,
    w: BTN_SIZE,
    h: BTN_SIZE,
    src: 'confirm.png',
    auto_scale: true
  })

  var tap = createWidget(widget.IMG, {
    x: 0, y: BTN_Y - 4, w: W, h: W - BTN_Y + 4
  })
  tap.addEventListener(event.CLICK_DOWN, function () {
    highlight.setProperty(prop.MORE, {
      center_x: W / 2,
      center_y: BTN_Y + BTN_SIZE / 2,
      radius: HIGHLIGHT_SIZE / 2,
      color: 0x333333,
      alpha: 200
    })
  })
  tap.addEventListener(event.CLICK_UP, function () {
    highlight.setProperty(prop.MORE, {
      center_x: W / 2,
      center_y: BTN_Y + BTN_SIZE / 2,
      radius: HIGHLIGHT_SIZE / 2,
      color: 0x333333,
      alpha: 0
    })
    if (onConfirm) onConfirm()
    back()
  })
}
