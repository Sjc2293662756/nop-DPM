import Vue from 'vue'
import ApiModal from '@/components/ApiModal.vue'

const devConfig = require('../../../config/dev.env')

describe('database query time selection', () => {
  let vm, previousEnvironment, previousStart, previousEnd, previousEnabled
  beforeEach(() => {
    previousEnvironment = process.env.NODE_ENV
    previousStart = process.env.VUE_APP_TEST_START_TIME
    previousEnd = process.env.VUE_APP_TEST_END_TIME
    previousEnabled = process.env.VUE_APP_TEST_TIME_ENABLED
    process.env.NODE_ENV = 'development'
    process.env.VUE_APP_TEST_START_TIME = '1756971300'
    process.env.VUE_APP_TEST_END_TIME = '1756974900'
    process.env.VUE_APP_TEST_TIME_ENABLED = 'true'
    jest.spyOn(Date, 'now').mockReturnValue(1920000000000)
  })
  afterEach(() => {
    if (vm) vm.$destroy()
    jest.restoreAllMocks()
    process.env.NODE_ENV = previousEnvironment
    if (previousStart == null) delete process.env.VUE_APP_TEST_START_TIME
    else process.env.VUE_APP_TEST_START_TIME = previousStart
    if (previousEnd == null) delete process.env.VUE_APP_TEST_END_TIME
    else process.env.VUE_APP_TEST_END_TIME = previousEnd
    if (previousEnabled == null) delete process.env.VUE_APP_TEST_TIME_ENABLED
    else process.env.VUE_APP_TEST_TIME_ENABLED = previousEnabled
    delete window.startTimeUnix
    delete window.endTimeUnix
  })

  function createModal (propsData = {}) {
    const Component = Vue.extend(ApiModal)
    vm = new Component({ propsData })
    return vm
  }

  it('does not ship a historical test interval as the development default', () => {
    expect(Object.prototype.hasOwnProperty.call(devConfig, 'VUE_APP_TEST_START_TIME')).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(devConfig, 'VUE_APP_TEST_END_TIME')).toBe(false)
  })
  it('prioritizes the explicitly selected component interval over a debug interval', () => {
    createModal({ startTime: 100, endTime: 200 }).updateTimeRange()
    expect(vm.start).toBe('100')
    expect(vm.end).toBe('200')
  })
  it('prioritizes the dashboard interval over a debug interval', () => {
    window.startTimeUnix = 300
    window.endTimeUnix = 400
    createModal().updateTimeRange()
    expect(vm.start).toBe('300')
    expect(vm.end).toBe('400')
  })
  it('defaults to the latest hour when no explicit interval was supplied', () => {
    delete process.env.VUE_APP_TEST_START_TIME
    delete process.env.VUE_APP_TEST_END_TIME
    createModal().updateTimeRange()
    expect(vm.start).toBe('1919996400')
    expect(vm.end).toBe('1920000000')
  })
  it('still supports an explicitly configured replay interval', () => {
    createModal().updateTimeRange()
    expect(vm.start).toBe('1756971300')
    expect(vm.end).toBe('1756974900')
  })
  it('ignores leftover historical debug times unless replay was explicitly enabled', () => {
    delete process.env.VUE_APP_TEST_TIME_ENABLED
    createModal().updateTimeRange()
    expect(vm.start).toBe('1919996400')
    expect(vm.end).toBe('1920000000')
  })
})
