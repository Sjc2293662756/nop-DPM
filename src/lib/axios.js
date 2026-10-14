import axios from 'axios'
import { isPlatformLoginResponse, requirePlatformLogin, observePlatformResponse } from './platform-session'

class HttpRequest {
  constructor (baseUrl = '') {
    this.baseUrl = baseUrl
    this.queue = {}
  }

  getInsideConfig () {
    return {
      baseURL: this.baseUrl,
      headers: { 'Content-Type': 'application/json' }
    }
  }

  destroy (url) {
    delete this.queue[url]
  }

  interceptors (instance, url) {
    instance.interceptors.request.use(config => {
      // The browser manages same-origin cookies, including HttpOnly sessions.
      this.queue[url] = true
      return config
    })
    instance.interceptors.response.use(response => {
      this.destroy(url)
      if (isPlatformLoginResponse(response)) return Promise.reject(requirePlatformLogin())
      observePlatformResponse(response)
      return { data: response.data, status: response.status }
    }, error => {
      this.destroy(url)
      if (isPlatformLoginResponse(error.response)) return Promise.reject(requirePlatformLogin())
      return Promise.reject(error)
    })
  }

  request (options) {
    const instance = axios.create()
    const defaults = this.getInsideConfig()
    const config = Object.assign({}, defaults, options, {
      headers: Object.assign({}, defaults.headers, options.headers)
    })
    // Cookie is a browser-controlled header, not a frontend credential.
    delete config.headers.Cookie
    delete config.headers.cookie
    this.interceptors(instance, config.url)
    return instance(config)
  }
}

export default HttpRequest
