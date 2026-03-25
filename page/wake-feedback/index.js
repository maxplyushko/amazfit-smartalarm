import { createWidget, widget, align, text_style } from '@zos/ui'
import { home } from '@zos/router'
import { setPageBrightTime } from '@zos/display'
import { saveFeedback } from '../../utils/wake-feedback'

const W = 466
const ITEM_H = 80
const ITEM_SPACE = 12

const OPTIONS = [
  { label: 'Great', rating: 'great', color: 0x2d8a4e, textColor: 0xffffff },
  { label: 'Okay', rating: 'okay', color: 0x555555, textColor: 0xffffff },
  { label: 'Groggy', rating: 'groggy', color: 0x8a442d, textColor: 0xffffff },
  { label: 'Skip', rating: null, color: 0x333333, textColor: 0x999999 }
]

Page({
  state: {
    context: null
  },

  onInit(param) {
    if (typeof param === 'string' && param.length > 0) {
      try {
        this.state.context = JSON.parse(param)
      } catch (e) {
        this.state.context = null
      }
    }
  },

  build() {
    const self = this
    setPageBrightTime({ brightTime: 120000 })

    createWidget(widget.TEXT, {
      x: 0,
      y: 100,
      w: W,
      h: 44,
      color: 0xffffff,
      text_size: 24,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text_style: text_style.NONE,
      text: 'How do you feel?'
    })

    const dataArray = OPTIONS.map((o) => ({ label: o.label }))
    const itemConfig = OPTIONS.map((o, i) => ({
      type_id: i + 1,
      item_height: ITEM_H,
      item_bg_color: o.color,
      item_bg_radius: 16,
      text_view: [
        {
          x: 80,
          y: 0,
          w: W - 160,
          h: ITEM_H,
          key: 'label',
          color: o.textColor,
          text_size: 28,
          action: true
        }
      ],
      text_view_count: 1
    }))
    const dataTypeConfig = OPTIONS.map((_, i) => ({
      start: i,
      end: i,
      type_id: i + 1
    }))

    createWidget(widget.SCROLL_LIST, {
      x: 0,
      y: 160,
      w: W,
      h: 280,
      item_space: ITEM_SPACE,
      snap_to_center: true,
      item_config: itemConfig,
      item_config_count: itemConfig.length,
      data_array: dataArray,
      data_count: dataArray.length,
      data_type_config: dataTypeConfig,
      data_type_config_count: dataTypeConfig.length,
      item_click_func: (list, index, data_key) => {
        self._submit(OPTIONS[index].rating)
      }
    })
  },

  _submit(rating) {
    const ctx = this.state.context
    if (ctx && rating) {
      saveFeedback({
        stage: ctx.stage,
        progress: ctx.progress,
        hrTrend: ctx.hrTrend,
        reason: ctx.reason,
        rating
      })
    }
    home()
  }
})
