import Vue from 'vue'

export const PLATFORM_LOGIN_ENTRY = '/NetInside/'

export const platformSession = new Vue({
  data: { status: 'unknown', message: '' }
})

export function isPlatformLoginResponse (response) {
  if (!response) return false
  if (response.status === 401) return true
  const responseUrl = response.request && response.request.responseURL
  if (responseUrl && /\/NetInside\/(?:login\.(?:jsp|asp)|LoginError)(?:[;/?#]|$)/i.test(responseUrl)) return true
  if (typeof response.data !== 'string') return false
  const requestUrl = response.config && response.config.url
  // A remote datasource's login page is not a NOP platform login failure.
  if (requestUrl && /datasource\.asp\?m=proxy(?:&|$)/i.test(requestUrl)) return false
  return /^\s*(?:<!doctype\s+html|<html\b|<body\b|<form\b)/i.test(response.data) &&
    /<form\b[^>]*action\s*=\s*["'][^"']*(?:login\.asp|j_security_check)/i.test(response.data)
}

export function requirePlatformLogin () {
  platformSession.status = 'required'
  platformSession.message = '平台登录会话未建立或已过期，请登录后检查连接。'
  const error = new Error(platformSession.message)
  error.code = 'PLATFORM_LOGIN_REQUIRED'
  return error
}

export function markPlatformConnected () {
  const changed = platformSession.status !== 'connected'
  platformSession.status = 'connected'
  platformSession.message = '平台已连接，可以继续使用编辑器。'
  if (changed) platformSession.$emit('authenticated')
}

export function observePlatformResponse (response) {
  const url = response.config && response.config.url
  if (url && /(?:^|\/)NetInside\/admin\/datasource\.asp\?m=listJson(?:&|$)/i.test(url) && Array.isArray(response.data)) markPlatformConnected()
}
