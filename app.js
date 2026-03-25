import router from '@zos/router'

App({
  onCreate() {
    let params = this.getParam()
    if (typeof params === 'string' && params.length > 0) {
      try { params = JSON.parse(params) } catch (e) { params = {} }
    }
    const hasAlarmPayload =
      params?.url === 'page/wake/index' || (params?.urgency != null && !params?.url)
    if (hasAlarmPayload) {
      const payload = typeof params === 'object' ? params : { urgency: String(params) }
      if (!payload.url) payload.url = 'page/wake/index'
      router.replace({ url: 'page/wake/index', params: JSON.stringify(payload) })
    } else if (params?.url) {
      router.replace({ url: params.url, params: JSON.stringify(params) })
    } else {
      router.replace({ url: 'page/config/index' })
    }
  }
})
