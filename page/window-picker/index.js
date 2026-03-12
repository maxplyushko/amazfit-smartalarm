import { createWidget, widget } from '@zos/ui'
import { loadConfig, saveConfig } from '../../utils/storage'
import { addPickerConfirm } from '../../utils/picker-confirm'

const WINDOW_OPTIONS = [5, 10, 15, 20, 25, 30, 35, 40, 45]

let selectedWindow = 30

function persistWindow() {
  const config = loadConfig()
  config.wakeWindowMinutes = selectedWindow
  saveConfig(config)
}

Page({
  onInit() {
    const config = loadConfig()
    selectedWindow = config.wakeWindowMinutes
  },

  build() {
    const initIdx = WINDOW_OPTIONS.indexOf(selectedWindow)

    createWidget(widget.WIDGET_PICKER, {
      title: 'Wake Window',
      nb_of_columns: 1,
      data_config: [
        {
          data_array: WINDOW_OPTIONS,
          init_val_index: initIdx >= 0 ? initIdx : 5,
          support_loop: true,
          unit: 'min',
          font_size: 24,
          select_font_size: 40,
          unit_font_size: 18,
          col_width: 120
        }
      ],
      picker_cb: function (picker, eventType, colIndex, selIndex) {
        selectedWindow = WINDOW_OPTIONS[selIndex]
        persistWindow()
      }
    })

    addPickerConfirm(persistWindow)
  },

  onDestroy() {
    persistWindow()
  }
})
