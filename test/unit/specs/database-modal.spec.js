import Vue from 'vue'
import Vuex from 'vuex'
import ElementUI from 'element-ui'
import ApiModal from '@/components/ApiModal.vue'
import { getIps, getMetrics, getTopMetrics } from '@/apis/module'
import { defaultQuery } from '@/dataSources/dpm/catalog'
import { buildDpmUrl, readDpmUrl, isDpmUrl } from '@/dataSources/dpm/query'
import { executeDpm } from '@/dataSources/dpm/execute'
import { changeURLArg } from '@/lib/common'

jest.mock('@/apis/module', () => ({ getIps: jest.fn(), getMetrics: jest.fn(), getTopMetrics: jest.fn(), getObjects: jest.fn() }))

Vue.use(Vuex)
Vue.use(ElementUI)
const flush = () => new Promise(resolve => setTimeout(resolve, 0))
const base = 'https://dpm.example.test/webservice/NetInside'
const metrics = [{ name: '网络流量', value: [{ value: 'TPIO', name: '吞吐量' }] }]

function mountModal (api = '', widget = 'biaoge', type = 'topValues', action) {
  const ajax = action || jest.fn((context, { params }) => {
    if (isDpmUrl(params.url)) return executeDpm(params.url, () => Promise.resolve({ data: 'Group,Transactions (#),Average Response Time (Final Response) (sec),Id\nOrders,12,0.25,DB_NODE_ID=orders', status: 200 })).then(result => result.data)
    return Promise.resolve([{ key: 'IPAddress', label: 'IP地址', children: [], hasArgument: true }])
  })
  const store = new Vuex.Store({ actions: { ajax } })
  const Modal = Vue.extend(ApiModal)
  const vm = new Modal({ store, propsData: { api, imgtype: widget, type } })
  vm.$route = { name: 'imgeditor' }
  vm.$mount()
  return vm
}

describe('database configuration UI', () => {
  let vm
  beforeEach(() => {
    jest.clearAllMocks()
    getIps.mockResolvedValue({ data: [{ ip: 'dpm.example.test', location: 1, alias: 'DPM' }] })
    getMetrics.mockResolvedValue({ data: metrics })
    getTopMetrics.mockResolvedValue({ data: metrics })
  })
  afterEach(() => { if (vm) { vm.$destroy(); vm.$el.remove() } })

  it('switches database objects to local metrics and requests database nodes', async () => {
    vm = mountModal()
    await vm.openApi()
    vm.formData.ip = 'dpm.example.test'
    await vm.getObj()
    expect(vm.formData.objects[0].groupTypeArr.map(item => item.key)).toContain('Database')
    vm.formData.objects[0].groupType = 'Database'
    vm.handleObjectChange(vm.formData.objects[0], 0)
    await flush()
    await flush()
    expect(vm.isDatabase).toBe(true)
    expect(vm.formData.metrics).toEqual(['QUERY_COUNT', 'AVG_FINAL_RESP_TIME'])
    expect(vm.$refs.databaseFields.nodes).toEqual([{ label: 'Orders', value: 'DB_NODE_ID=orders' }])
    expect(vm.storageData).toEqual([])
    expect(readDpmUrl(vm.generateApiUrl()).config.metrics).not.toContain('TPIO')
  })
  it('shows an empty-result hint rather than a loading failure for a valid empty JSON dataset', async () => {
    const query = defaultQuery('Database', 'topValues', 'biaoge')
    vm = mountModal(buildDpmUrl(base, query, 100, 200), 'biaoge', 'topValues', (context, { params }) => {
      if (isDpmUrl(params.url)) return executeDpm(params.url, () => Promise.resolve({ data: { columnIds: ['DB Server', 'Transactions (#)', 'Average Response Time (Final Response) (sec)'], rows: [] }, status: 200 })).then(result => result.data)
      return Promise.resolve([])
    })
    await vm.openApi()
    await flush()
    expect(vm.$refs.databaseFields.error).toBe('')
    expect(vm.$refs.databaseFields.nodes).toEqual([])
    expect(vm.$el.querySelector('.database-fields .el-alert--info').textContent).toContain('未返回活跃数据库节点')
  })

  it('reopens a saved database configuration without loading backend metric catalogs', async () => {
    const config = Object.assign(defaultQuery('Database', 'topValues', 'biaoge'), { selection: 'DB_NODE_ID=orders', metrics: ['AVG_FIRST_RESP_TIME'], limit: 20 })
    vm = mountModal(buildDpmUrl(base, config, 100, 200))
    await vm.openApi()
    await flush()
    expect(vm.databaseQuery).toMatchObject(config)
    expect(vm.databaseQuery.widget).toBe('biaoge')
    expect(vm.formData.metrics).toEqual(['AVG_FIRST_RESP_TIME'])
    expect(getMetrics).not.toHaveBeenCalled()
    expect(getTopMetrics).not.toHaveBeenCalled()
    expect(vm.$refs.databaseFields.value.selection).toBe('DB_NODE_ID=orders')
  })
  it('round trips a selected custom date range through saving, preview refresh and reopening', async () => {
    vm = mountModal(buildDpmUrl(base, defaultQuery('Database', 'topValues', 'biaoge'), 100, 200))
    await vm.openApi()
    vm.handleDatabaseTimeMode('fixed')
    vm.databaseTimeRange = [new Date(1756971300000), new Date(1756974900000)]
    const saved = vm.generateApiUrl()
    const refreshed = changeURLArg(saved, [{ key: 'start', value: 1920000000 }, { key: 'end', value: 1920003600 }])
    await flush()
    vm.$destroy()
    vm = mountModal(refreshed)
    await vm.openApi()
    await flush()
    expect(vm.databaseQuery.timeMode).toBe('fixed')
    expect(vm.start).toBe('1756971300')
    expect(vm.end).toBe('1756974900')
  })
  it('activates the custom range picker through the actual radio input', async () => {
    vm = mountModal(buildDpmUrl(base, defaultQuery('Database', 'topValues', 'biaoge'), 100, 200))
    await vm.openApi()
    await flush()
    const radio = vm.$el.querySelector('.el-radio__original[value="fixed"]')
    expect(radio).not.toBeNull()
    radio.click()
    await flush()
    expect(vm.databaseQuery.timeMode).toBe('fixed')
    expect(vm.$el.querySelector('.el-date-editor--datetimerange')).not.toBeNull()
  })

  it('saves a usable URL through the existing postParams event', async () => {
    vm = mountModal(buildDpmUrl(base, defaultQuery('Database', 'topValues', 'biaoge'), 100, 200))
    await vm.openApi()
    await flush()
    const emitted = jest.fn()
    vm.$on('postParams', emitted)
    vm.submitForm('formData')
    await flush()
    expect(emitted).toHaveBeenCalledTimes(1)
    expect(readDpmUrl(emitted.mock.calls[0][0]).config.objectType).toBe('Database')
  })

  it('keeps database objects available if the generic groups service is unavailable', async () => {
    vm = mountModal('', 'biaoge', 'topValues', () => Promise.reject(new Error('groups unsupported')))
    vm.formData.ip = 'dpm.example.test'
    await vm.getObj()
    expect(vm.formData.objects[0].groupTypeArr.map(item => item.key)).toContain('Database')
  })

  it('restores network metrics and sorting options after leaving a database object', async () => {
    vm = mountModal(buildDpmUrl(base, defaultQuery('Database', 'topValues', 'biaoge'), 100, 200), 'biaoge', 'topValues', (context, { params }) => {
      if (params.url.includes('type=topValues')) return Promise.resolve([])
      if (isDpmUrl(params.url)) return Promise.resolve([])
      return Promise.resolve([{ key: 'IPAddress', label: 'IP地址', children: [], hasArgument: true }])
    })
    await vm.openApi()
    vm.formData.objects[0].groupType = 'IPAddress'
    vm.handleObjectChange(vm.formData.objects[0], 0)
    await flush()
    expect(vm.formData.metrics).toEqual(['TPIO'])
    expect(vm.metricsOption2).toEqual(metrics)
    expect(vm.topMetricsOption2).toEqual(metrics[0].value)
  })

  it('does not apply a stale object response after switching data sources', async () => {
    let resolveFirst
    vm = mountModal('', 'biaoge', 'topValues', (context, { params }) => {
      if (params.url.includes('first.example')) return new Promise(resolve => { resolveFirst = resolve })
      return Promise.resolve([{ key: 'SecondObject', label: 'second', children: [] }])
    })
    vm.formData.ip = 'first.example'
    const first = vm.getObj()
    vm.formData.ip = 'second.example'
    await vm.getObj()
    resolveFirst([{ key: 'FirstObject', label: 'first', children: [] }])
    await first
    const keys = vm.formData.objects[0].groupTypeArr.map(item => item.key)
    expect(keys).toContain('SecondObject')
    expect(keys).not.toContain('FirstObject')
  })

  it('keeps database metrics and topology thresholds when a previous local metric request finishes', async () => {
    vm = mountModal('', '', 'averageValues')
    vm.$route = { name: 'networkEditor' }
    await vm.openApi()
    vm.formData.ip = 'local.example.test'
    vm.location = 0
    vm.formData.groupType1 = 'topdata'
    let finishLocal
    vm.localAjaxs = jest.fn(() => new Promise(resolve => { finishLocal = resolve }))
    const pending = vm.handleDataTypeChange()

    vm.formData.ip = 'dpm.example.test'
    await vm.getObj()
    vm.formData.objects[0].groupType = 'Database'
    vm.handleObjectChange(vm.formData.objects[0], 0)
    await flush()
    finishLocal([{ name: 'CPU占用', value: [{ value: 'cpu_time', name: 'CPU时间' }] }])
    await pending
    await flush()

    expect(vm.formData.metrics).toEqual(['QUERY_COUNT'])
    expect(vm.databaseQuery.metrics).toEqual(['QUERY_COUNT'])
    expect(vm.allMetrics[0].name).toBe('数据库访问')
    expect(vm.thresholdArr.map(item => item.category)).toEqual(['QUERY_COUNT'])
  })

  it('stops a previous local type change after its user list finishes on another source', async () => {
    vm = mountModal()
    await vm.openApi()
    vm.formData.ip = 'local.example.test'
    vm.location = 0
    vm.formData.groupType1 = 'UserDB'
    let finishLocal
    vm.localAjaxs = jest.fn(() => new Promise(resolve => { finishLocal = resolve }))
    const pending = vm.handleDataTypeChange()

    vm.formData.ip = 'dpm.example.test'
    await vm.getObj()
    vm.formData.objects[0].groupType = 'Database'
    vm.handleObjectChange(vm.formData.objects[0], 0)
    await flush()
    finishLocal([{ group: { argument: 'old-user' } }])
    await pending
    await flush()

    expect(vm.localAjaxs).toHaveBeenCalledTimes(1)
    expect(vm.groupArgument2Arr).toEqual([])
    expect(vm.formData.metrics).toEqual(['QUERY_COUNT', 'AVG_FINAL_RESP_TIME'])
  })

  it('ignores local catalogs from a closed form even when the same source is selected again', async () => {
    vm = mountModal()
    await vm.openApi()
    vm.formData.ip = 'local.example.test'
    vm.location = 0
    vm.formData.groupType1 = 'topdata'
    let finishLocal
    const response = new Promise(resolve => { finishLocal = resolve })
    vm.localAjaxs = jest.fn(() => response)
    const pending = Promise.all([vm.getLocalMetrics(), vm.getLocalUserList(), vm.getServiceIpList(), vm.getDataTypeList()])

    vm.resetForm()
    vm.initForm()
    vm.formData.ip = 'local.example.test'
    vm.location = 0
    vm.formData.groupType1 = 'topdata'
    vm.allMetrics = [{ name: 'current metrics' }]
    vm.groupArgument1Arr = [{ value: 'current-server' }]
    vm.groupArgument2Arr = [{ value: 'current-user' }]
    vm.localTypeOption = [{ value: 'current-type' }]
    finishLocal([{ name: 'old metrics', group: { argument: 'old' }, label: 'old', key: 'old' }])
    await pending

    expect(vm.allMetrics).toEqual([{ name: 'current metrics' }])
    expect(vm.groupArgument1Arr).toEqual([{ value: 'current-server' }])
    expect(vm.groupArgument2Arr).toEqual([{ value: 'current-user' }])
    expect(vm.localTypeOption).toEqual([{ value: 'current-type' }])
  })

  it('ignores remote metrics from an earlier opening of the same source', async () => {
    vm = mountModal()
    await vm.openApi()
    vm.formData.ip = 'dpm.example.test'
    let finishMetrics
    getMetrics.mockReset()
    getMetrics.mockImplementation(() => new Promise(resolve => { finishMetrics = resolve }))
    const pending = vm.getMetricsFun()
    vm.resetForm()
    vm.initForm()
    vm.formData.ip = 'dpm.example.test'
    const currentMetrics = [{ name: '网络流量', value: [{ value: 'TPIO', name: 'current' }] }]
    getMetrics.mockReset()
    getMetrics.mockResolvedValue({ data: currentMetrics })
    await vm.getMetricsFun()
    finishMetrics({ data: [{ name: 'old metrics', value: [] }] })
    await pending
    expect(vm.allMetrics).toEqual(currentMetrics)
  })
})
