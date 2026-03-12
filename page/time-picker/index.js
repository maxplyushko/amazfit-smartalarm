import { createWidget, widget } from '@zos/ui'
import { loadConfig, saveConfig } from '../../utils/storage'
import { addPickerConfirm } from '../../utils/picker-confirm'

let selectedHour = 7
let selectedMinute = 0

function persistTime() {
  const config = loadConfig()
  config.hour = selectedHour
  config.minute = selectedMinute
  saveConfig(config)
}

Page({
  onInit() {
    const config = loadConfig()
    selectedHour = config.hour
    selectedMinute = config.minute
  },

  build() {
    const hours = new Array(24).fill(0).map((_, i) => i)
    const minutes = new Array(12).fill(0).map((_, i) => i * 5)

    createWidget(widget.WIDGET_PICKER, {
      title: 'Alarm Time',
      nb_of_columns: 2,
      data_config: [
        {
          data_array: hours,
          init_val_index: selectedHour,
          support_loop: true,
          unit: 'h',
          connector: ':',
          font_size: 24,
          select_font_size: 40,
          unit_font_size: 18,
          connector_font_size: 24,
          col_width: 90
        },
        {
          data_array: minutes,
          init_val_index: minutes.indexOf(selectedMinute),
          support_loop: true,
          unit: 'm',
          font_size: 24,
          select_font_size: 40,
          unit_font_size: 18,
          col_width: 90
        }
      ],
      picker_cb: function (picker, eventType, colIndex, selIndex) {
        if (colIndex === 0) {
          selectedHour = hours[selIndex]
        } else if (colIndex === 1) {
          selectedMinute = minutes[selIndex]
        }
        persistTime()
      }
    })

    addPickerConfirm(persistTime)
  },

  onDestroy() {
    persistTime()
  }
})
