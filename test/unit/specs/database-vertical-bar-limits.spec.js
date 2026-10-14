import Vue from 'vue'
import Vuex from 'vuex'
import ElementUI from 'element-ui'
import ApiModal from '@/components/ApiModal.vue'
import { getIps, getMetrics, getTopMetrics } from '@/apis/module'
import Editor from '@/view/imgmodules/imgeditor.vue'
import Preview from '@/view/imgmodules/preview.vue'
import moduledata from '@/store/module/moduledata'
import { defaultWidgetQuery, widgetMetricLimit } from '@/dataSources/dpm/capabilities'
import { buildDpmUrl, readDpmUrl } from '@/dataSources/dpm/query'
import { executeDpm } from '@/dataSources/dpm/execute'

jest.mock('@/apis/module', () => ({ getIps: jest.fn(), getMetrics: jest.fn(), getTopMetrics: jest.fn(), getObjects: jest.fn() }))
Vue.use(Vuex)
Vue.use(ElementUI)
const base = 'https://dpm.example.test/webservice/NetInside'
const flush = () => new Promise(resolve => setTimeout(resolve, 0))
const legacyQuery = () => Object.assign(defaultWidgetQuery('Database', 'topValues', 'zongxiangzhuzhuangtu'), { widget: '', metrics: ['QUERY_COUNT', 'AVG_FINAL_RESP_TIME'], timeMode: 'fixed' })
const legacyUrl = () => buildDpmUrl(base, legacyQuery(), 100, 200)

describe('database vertical bar metric count matches the network bar', () => {
  it('limits both network and database ordinary bars to one metric', () => {
    for (const widget of ['zongxiangzhuzhuangtu', 'hengxiangzhuzhuangtu']) {
      const network = ApiModal.methods.getMetricsLimit.call({ isDatabase: false, imgtype: widget, formData: { groupType1: '' } })
      const database = ApiModal.methods.getMetricsLimit.call({ isDatabase: true, imgtype: widget })
      expect(network).toBe(1)
      expect(database).toBe(network)
      expect(widgetMetricLimit(widget)).toBe(1)
    }
  })
  it('rejects old multi-metric settings before sending a database request', async () => {
    const request = jest.fn()
    const url = legacyUrl()
    await expect(executeDpm(url, request, 'zongxiangzhuzhuangtu')).rejects.toThrow('一个数据库指标')
    expect(request).not.toHaveBeenCalled()
    expect(readDpmUrl(url).config.metrics).toEqual(['QUERY_COUNT', 'AVG_FINAL_RESP_TIME'])
  })
  for (const page of [Editor, Preview]) {
    it(page.name + ' replaces a stale multi-series chart with a clear error', async () => {
      const creator = { moduledata, imgmodules: [], modules: { radio: 1 }, scrollLeft: 0, scrollTop: 0, $nextTick: () => {} }
      Editor.methods.moduleZongxiangzhuzhuangtu.call(creator, { clientX: 110, clientY: 140 })
      const item = creator.imgmodules[0]
      item.config.api = legacyUrl()
      item.chart = { clear: jest.fn(), setOption: jest.fn() }
      const context = { imgmodules: [item], start: 300, end: 400, $nextTick: callback => callback && callback(), ajax: jest.fn() }
      context.ajaxs = page.methods.ajaxs.bind(context)
      page.methods.reZongxiangzhuzhuangtu.call(context, '', item.id)
      await flush()
      expect(context.ajax).not.toHaveBeenCalled()
      expect(item.config.dpmError).toContain('一个数据库指标')
      expect(item.config.widgets.series).toEqual([])
      expect(item.chart.clear).toHaveBeenCalled()
    })
  }
  it('keeps legacy selections visible, blocks submission, and allows explicit removal', async () => {
    getIps.mockResolvedValue({ data: [{ ip: 'dpm.example.test', location: 1, alias: 'DPM' }] })
    getMetrics.mockResolvedValue({ data: [] })
    getTopMetrics.mockResolvedValue({ data: [] })
    const store = new Vuex.Store({ actions: { ajax: () => Promise.resolve([]) } })
    const vm = new (Vue.extend(ApiModal))({ store, propsData: { api: legacyUrl(), imgtype: 'zongxiangzhuzhuangtu', type: 'topValues' } })
    vm.$route = { name: 'imgeditor' }
    vm.$mount()
    try {
      await vm.openApi(); await flush()
      const fields = vm.$refs.databaseFields
      expect(fields.effectiveMetricLimit).toBe(1)
      expect(vm.databaseQuery.metrics).toEqual(['QUERY_COUNT', 'AVG_FINAL_RESP_TIME'])
      expect(fields.configurationError).toContain('一个数据库指标')
      const emitted = jest.fn()
      vm.$on('postParams', emitted)
      vm.submitForm('formData'); await flush()
      expect(emitted).not.toHaveBeenCalled()
      const form = fields.$children.find(child => child.label === '数据库指标')
      const select = form.$children.find(child => child.$options.name === 'ElSelect')
      expect(select.multipleLimit).toBe(1)
      select.handleOptionSelect(select.options.find(option => option.value === 'AVG_FINAL_RESP_TIME'))
      await flush()
      expect(vm.databaseQuery.metrics).toEqual(['QUERY_COUNT'])
      expect(fields.configurationError).toBe('')
      fields.validate()
      vm.submitForm('formData'); await flush()
      expect(readDpmUrl(emitted.mock.calls[0][0]).config.metrics).toEqual(['QUERY_COUNT'])
    } finally { vm.$destroy(); vm.$el.remove() }
  })
})
