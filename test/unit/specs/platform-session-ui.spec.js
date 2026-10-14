import Vue from 'vue'
import ElementUI from 'element-ui'
import PlatformSession from '@/components/PlatformSession.vue'
import { getIps } from '@/apis/module'
import { platformSession, requirePlatformLogin } from '@/lib/platform-session'

jest.mock('@/apis/module', () => ({ getIps: jest.fn() }))
Vue.use(ElementUI)
const flush = () => new Promise(resolve => setTimeout(resolve, 0))

describe('platform connection UI', () => {
  let vm
  beforeEach(() => {
    jest.clearAllMocks()
    platformSession.status = 'unknown'
    platformSession.message = ''
    const Component = Vue.extend(PlatformSession)
    vm = new Component().$mount()
  })
  afterEach(() => { vm.$destroy(); vm.$el.remove() })

  it('provides the original platform login in a separate tab', async () => {
    requirePlatformLogin()
    await flush()
    const link = document.querySelector('.platform-session-actions a')
    expect(link.getAttribute('href')).toBe('/NetInside/')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(vm.dialogVisible).toBe(true)
  })
  it('checks the session automatically when returning from the login tab', async () => {
    vm.awaitingLogin = true
    vm.dialogVisible = true
    getIps.mockResolvedValue({ data: [] })
    vm.onFocus()
    await flush()
    expect(getIps).toHaveBeenCalledTimes(1)
    expect(platformSession.status).toBe('connected')
    expect(vm.awaitingLogin).toBe(false)
    expect(vm.dialogVisible).toBe(false)
  })
  it('does not report a malformed datasource response as connected', async () => {
    getIps.mockResolvedValue({ data: '<html>unavailable</html>' })
    await vm.checkConnection(false)
    expect(platformSession.status).toBe('error')
  })
  it('shows an expired-session prompt while retaining the editing page', async () => {
    getIps.mockRejectedValue(requirePlatformLogin())
    await vm.checkConnection(false)
    await flush()
    expect(vm.dialogVisible).toBe(true)
    expect(platformSession.status).toBe('required')
  })
})
