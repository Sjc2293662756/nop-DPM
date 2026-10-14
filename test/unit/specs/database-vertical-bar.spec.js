import Vue from 'vue'
import Vuex from 'vuex'
import ElementUI from 'element-ui'
import ApiModal from '@/components/ApiModal.vue'
import { getIps, getMetrics, getTopMetrics } from '@/apis/module'
import { VIEWS } from '@/dataSources/dpm/catalog'
import Editor from '@/view/imgmodules/imgeditor.vue'
import Preview from '@/view/imgmodules/preview.vue'
import moduledata from '@/store/module/moduledata'
import { defaultWidgetQuery } from '@/dataSources/dpm/capabilities'
import { buildDpmUrl, getParam, readDpmUrl } from '@/dataSources/dpm/query'
import { normalizeTable } from '@/dataSources/dpm/normalize'

const base = 'https://dpm.example.test/webservice/NetInside'
const flush = () => new Promise(resolve => setTimeout(resolve, 0))
jest.mock('@/apis/module', () => ({ getIps: jest.fn(), getMetrics: jest.fn(), getTopMetrics: jest.fn(), getObjects: jest.fn() }))
Vue.use(Vuex)
Vue.use(ElementUI)

function setup (page, csv, overrides = {}) {
  const creator = { moduledata, imgmodules: [], modules: { radio: 1 }, scrollLeft: 0, scrollTop: 0, $nextTick: () => {} }
  Editor.methods.moduleZongxiangzhuzhuangtu.call(creator, { clientX: 110, clientY: 140 })
  const item = creator.imgmodules[0]
  item.chart = { clear: jest.fn(), setOption: jest.fn() }
  const query = Object.assign(defaultWidgetQuery('Database', 'topValues', item.type), { timeMode: 'fixed' }, overrides)
  item.config.api = buildDpmUrl(base, query, 100, 200)
  const rows = normalizeTable(csv, query)
  const context = { imgmodules: [item], start: 300, end: 400, $nextTick: callback => callback && callback(), ajax: jest.fn(() => Promise.resolve(rows)) }
  context.ajaxs = page.methods.ajaxs.bind(context)
  return { item, query, context, rows }
}

describe('vertical database bars at the real editor and preview call sites', () => {
  for (const page of [Editor, Preview]) {
    it(page.name + ' sorts values with zero and missing labels, preserves precision and explains units', async () => {
      const { item, context } = setup(page, 'Group,Average Response Time (Final Response) (sec)\nMissing,\nZero,0\nTiny,0.00024\nLarge,0.4', { metrics: ['AVG_FINAL_RESP_TIME'] })
      page.methods.reZongxiangzhuzhuangtu.call(context, '', item.id)
      await flush()
      const option = item.config.widgets
      expect(option.xAxis.data).toEqual(['Large', 'Tiny', 'Zero', 'Missing'])
      expect(option.series[0].data).toEqual([0.4, 0.00024, 0, null])
      expect(option.yAxis.name).toBe('平均最终响应时间（秒）')
      expect(option.series[0].unit).toBe('秒')
      expect(option.tooltip.formatter([{ name: 'Missing', seriesName: '平均最终响应时间', data: null }])).toContain('缺失')
      expect(option.tooltip.formatter([{ name: 'Zero', seriesName: '平均最终响应时间', data: 0 }])).toContain('0秒')
    })
    it(page.name + ' distinguishes empty, all-zero and all-missing results', async () => {
      for (const scenario of [
        { csv: 'Group,Transactions (#)', message: '无数据库统计数据' },
        { csv: 'Group,Transactions (#)\nA,0\nB,0', message: '全部为 0' },
        { csv: 'Group,Transactions (#)\nA,\nB,', message: '全部缺失' }
      ]) {
        const { item, context } = setup(page, scenario.csv)
        page.methods.reZongxiangzhuzhuangtu.call(context, '', item.id)
        await flush()
        expect(item.config.widgets.graphic.style.text).toContain(scenario.message)
      }
    })
    it(page.name + ' refreshes dashboard time but keeps fixed time', async () => {
      for (const mode of ['dashboard', 'fixed']) {
        const { item, context } = setup(page, 'Group,Transactions (#)\nA,0', { timeMode: mode })
        page.methods.reZongxiangzhuzhuangtu.call(context, '', item.id)
        await flush()
        const params = context.ajax.mock.calls[0][0].params
        expect(params.widget).toBe('zongxiangzhuzhuangtu')
        expect(getParam(params.url, 'start')).toBe(mode === 'fixed' ? '100' : '300')
        expect(getParam(params.url, 'end')).toBe(mode === 'fixed' ? '200' : '400')
      }
    })
    it(page.name + ' restores static chart semantics after database data', async () => {
      const { item, context } = setup(page, 'Group,Transactions (#)\nZero,0')
      page.methods.reZongxiangzhuzhuangtu.call(context, '', item.id)
      await flush()
      item.config.datastype = 'default'
      item.config.widgetdata = JSON.stringify({ x: ['Static'], y: [[5]], label: ['静态值'] })
      page.methods.reZongxiangzhuzhuangtu.call(context, '', item.id)
      expect(item.config.widgets.yAxis.name).toBeUndefined()
      expect(item.config.widgets.graphic).toBeUndefined()
      expect(item.config.widgets.tooltip.formatter([{ name: 'Static', seriesName: '静态值', data: 5 }])).not.toContain('个')
    })
    it(page.name + ' preserves duplicate category records without aggregating averages', async () => {
      const { item, context } = setup(page, 'Group,Average Response Time (Final Response) (sec)\nSame,0.2\nSame,0.3', { metrics: ['AVG_FINAL_RESP_TIME'] })
      page.methods.reZongxiangzhuzhuangtu.call(context, '', item.id)
      await flush()
      expect(item.config.widgets.xAxis.data).toEqual(['Same', 'Same'])
      expect(item.config.widgets.series[0].data).toEqual([0.3, 0.2])
    })
    it(page.name + ' ignores an earlier response after the node selection changes', async () => {
      const { item, query, context, rows } = setup(page, 'Group,Transactions (#)\nOld,1')
      let finishOld
      context.ajax.mockImplementationOnce(() => new Promise(resolve => { finishOld = resolve }))
      page.methods.reZongxiangzhuzhuangtu.call(context, '', item.id)
      item.config.api = buildDpmUrl(base, Object.assign({}, query, { selection: 'DB_NODE_ID=new' }), 100, 200)
      context.ajax.mockResolvedValueOnce(normalizeTable('Group,Transactions (#)\nNew,2', query))
      page.methods.reZongxiangzhuzhuangtu.call(context, '', item.id)
      await flush()
      finishOld(rows)
      await flush()
      expect(item.config.widgets.xAxis.data).toEqual(['New'])
      expect(item.config.widgets.series[0].data).toEqual([2])
    })
    it(page.name + ' replaces previous data on failure and recovers on retry', async () => {
      const { item, context } = setup(page, 'Group,Transactions (#)\nOld,1')
      page.methods.reZongxiangzhuzhuangtu.call(context, '', item.id)
      await flush()
      context.ajax.mockRejectedValueOnce(new Error('请求失败'))
      page.methods.reZongxiangzhuzhuangtu.call(context, '', item.id)
      await flush()
      expect(item.config.widgets.series).toEqual([])
      expect(item.config.widgets.graphic.style.text).toContain('请求失败')
      expect(item.chart.clear).toHaveBeenCalled()
      page.methods.reZongxiangzhuzhuangtu.call(context, '', item.id)
      await flush()
      expect(item.config.dpmError).toBe('')
      expect(item.config.widgets.series[0].data).toEqual([1])
      expect(item.config.widgets.graphic).toBeUndefined()
    })
    it(page.name + ' keeps late results from replacing a static chart', async () => {
      const { item, context, rows } = setup(page, 'Group,Transactions (#)\nOld,1')
      let finishOld
      context.ajax.mockImplementationOnce(() => new Promise(resolve => { finishOld = resolve }))
      page.methods.reZongxiangzhuzhuangtu.call(context, '', item.id)
      item.config.datastype = 'default'
      item.config.widgetdata = JSON.stringify({ x: ['Static'], y: [[5]] })
      page.methods.reZongxiangzhuzhuangtu.call(context, '', item.id)
      finishOld(rows)
      await flush()
      expect(item.config.widgets.xAxis.data).toEqual(['Static'])
      expect(item.config.widgets.series[0].data).toEqual([5])
    })
    it(page.name + ' converts msec once and escapes categories in the tooltip', async () => {
      const { item, context } = setup(page, 'Group,Average Response Time (Final Response) (msec)\n&lt;img src=x&gt;,0.24', { metrics: ['AVG_FINAL_RESP_TIME'] })
      page.methods.reZongxiangzhuzhuangtu.call(context, '', item.id)
      await flush()
      expect(item.config.widgets.series[0].data).toEqual([0.00024])
      const tooltip = item.config.widgets.tooltip.formatter([{ name: item.config.widgets.xAxis.data[0], seriesName: '平均最终响应时间', data: 0.00024 }])
      expect(tooltip).toContain('&lt;img src=x&gt;')
      expect(tooltip).not.toContain('<img')
    })
  }
})
describe('vertical database bar configuration reopening', () => {
  let vm
  beforeEach(() => {
    jest.clearAllMocks()
    getIps.mockResolvedValue({ data: [{ ip: 'dpm.example.test', location: 1, alias: 'DPM' }] })
    getMetrics.mockResolvedValue({ data: [] })
    getTopMetrics.mockResolvedValue({ data: [] })
  })
  afterEach(() => { if (vm) { vm.$destroy(); vm.$el.remove() } })
  for (const objectType of ['Database', 'DatabaseClient']) {
    for (const view of VIEWS.filter(view => ['summary', 'instances', 'applications', 'commands'].includes(view.id) || (objectType === 'DatabaseClient' && view.id === 'related'))) {
      it('reopens ' + objectType + ' ' + view.id + ' without changing metric, node, time or limit', async () => {
        const query = Object.assign(defaultWidgetQuery(objectType, 'topValues', 'zongxiangzhuzhuangtu'), {
          view: view.id,
          selection: objectType === 'DatabaseClient' ? 'CLIENT_NODE_ID=client' : 'DB_NODE_ID=orders',
          metrics: [view.fields[view.fields.length - 1]],
          limit: 25,
          timeMode: 'fixed' })
        const store = new Vuex.Store({ actions: { ajax: () => Promise.resolve([]) } })
        vm = new (Vue.extend(ApiModal))({ store, propsData: { api: buildDpmUrl(base, query, 100, 200), imgtype: query.widget, type: 'topValues' } })
        vm.$route = { name: 'imgeditor' }
        vm.$mount()
        await vm.openApi()
        await flush()
        const fields = vm.$refs.databaseFields
        expect(fields.effectiveMetricLimit).toBe(1)
        expect(fields.views).toHaveLength(9)
        fields.validate()
        const url = vm.generateApiUrl()
        const restored = readDpmUrl(url).config
        expect(restored.view).toBe(query.view)
        expect(restored.objectType).toBe(query.objectType)
        expect(restored.metrics).toEqual(query.metrics)
        expect(restored.selection).toBe(query.selection)
        expect(restored.limit).toBe(25)
        expect(restored.timeMode).toBe('fixed')
        expect(getParam(url, 'start')).toBe('100')
        expect(getParam(url, 'end')).toBe('200')
        expect(getMetrics).not.toHaveBeenCalled()
        expect(getTopMetrics).not.toHaveBeenCalled()
      })
    }
  }
})
