import { clearWokenFlag } from '../utils/storage'

AppService({
  onInit() {
    clearWokenFlag()
  }
})
