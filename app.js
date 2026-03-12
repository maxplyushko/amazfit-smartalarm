import router from '@zos/router'

App({
  onCreate() {
    const params = this.getParam()
    if (params?.url) {
      router.replace({ url: params.url, params: params })
    } else {
      router.replace({ url: 'page/config/index' })
    }
  }
})
