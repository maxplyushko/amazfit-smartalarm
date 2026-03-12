import router from '@zos/router'

App({
  onCreate() {
    let params = this.getParam()
    if (typeof params === 'string' && params.length > 0) {
      try { params = JSON.parse(params) } catch (e) { params = {} }
    }
    if (params?.url) {
      router.replace({ url: params.url, params: params.urgency || '' })
    } else {
      router.replace({ url: 'page/config/index' })
    }
  }
})
