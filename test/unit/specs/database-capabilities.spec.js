import Vue from 'vue'
import Vuex from 'vuex'
import ElementUI from 'element-ui'
import ApiModal from '@/components/ApiModal.vue'
import Editor from '@/view/imgmodules/imgeditor.vue'
import Preview from '@/view/imgmodules/preview.vue'
import moduledata from '@/store/module/moduledata'
import moduledefault from '@/store/module/moduledefault'
import { getIps, getMetrics, getTopMetrics } from '@/apis/module'
import { defaultQuery } from '@/dataSources/dpm/catalog'
import { analysisOptions, defaultWidgetQuery, widgetQueryIssue } from '@/dataSources/dpm/capabilities'
import { buildDpmUrl, readDpmUrl, getParam } from '@/dataSources/dpm/query'
import { executeDpm } from '@/dataSources/dpm/execute'
import { prepareDpmWidgetResult, showDpmWidgetError } from '@/dataSources/dpm/charts'

jest.mock('@/apis/module', () => ({ getIps: jest.fn(), getMetrics: jest.fn(), getTopMetrics: jest.fn(), getObjects: jest.fn() }))
Vue.use(Vuex)
Vue.use(ElementUI)
const flush = () => new Promise(resolve => setTimeout(resolve, 0))
const base = 'https://dpm.example.test/webservice/NetInside'
const nodeRows = [{ selection: 'DB_NODE_ID=orders', group: { label: '数据库', argument: 'Orders' }, metricValues: [] }]

function mount (widget, query = defaultWidgetQuery('Database', 'topValues', widget)) {
  const store = new Vuex.Store({ actions: { ajax: (context, { params }) => Promise.resolve(params.url.includes('nop-dpm-v1=') ? nodeRows : []) } })
  const vm = new (Vue.extend(ApiModal))({ store, propsData: { api: buildDpmUrl(base, query, 100, 200), imgtype: widget, type: query.view === 'timeseries' ? 'timeValues' : 'topValues' } })
  vm.$route = { name: 'imgeditor' }
  vm.$mount()
  return vm
}

function component (factory) {
  const context = { moduledata, imgmodules: [], modules: { radio: 1 }, scrollLeft: 0, scrollTop: 0, $nextTick: () => {} }
  Editor.methods[factory].call(context, { clientX: 110, clientY: 140 })
  const item = context.imgmodules[0]
  item.chart = { clear: jest.fn(), setOption: jest.fn() }
  return item
}

describe('database analysis capability rules', () => {
  it('keeps all nine analysis options visible while object and widget constraints change', () => {
    for (const widget of ['biaoge', 'zongxiangzhuzhuangtu', 'hengxiangzhuzhuangtu', 'mianjitu', 'zhexiantu', 'jinduhuantu',
      'yibiaopan', 'meiguitu', 'bingtu', 'shixinbingtu', 'hengxiangduidiezhuzhuangtu', 'zongxiangduidiezhuzhuangtu']) {
      const options = analysisOptions(widget)
      expect(options).toHaveLength(9)
      expect(options.filter(option => option.disabled).every(option => option.reason)).toBe(true)
      expect(options.find(option => option.id === 'related').disabled).toBe(true)
    }
    expect(analysisOptions('hengxiangzhuzhuangtu', 'DatabaseClient').find(option => option.id === 'related').disabled).toBe(false)
    expect(analysisOptions('biaoge').find(option => option.id === 'statements').reason).toContain('验收')
    expect(analysisOptions('zhexiantu').find(option => option.id === 'timeseries').disabled).toBe(false)
  })

  it('rejects unsupported legacy pie and mixed stack configurations before sending requests', async () => {
    const request = jest.fn()
    const oldPie = Object.assign(defaultQuery(), { metrics: ['AVG_FINAL_RESP_TIME'] })
    await expect(executeDpm(buildDpmUrl(base, oldPie, 100, 200), request, 'bingtu')).rejects.toThrow('平均值')
    const oldStack = Object.assign(defaultQuery(), { metrics: ['QUERY_COUNT', 'ROWS_AFFECTED'] })
    await expect(executeDpm(buildDpmUrl(base, oldStack, 100, 200), request, 'zongxiangduidiezhuzhuangtu')).rejects.toThrow('单系列')
    expect(request).not.toHaveBeenCalled()
  })

  it('rejects curves with different units without disabling same-unit response curves', () => {
    const query = Object.assign(defaultWidgetQuery('Database', 'timeValues', 'zhexiantu'), { selection: 'orders', metrics: ['FinalRespTime', 'TransactionRate'] })
    expect(widgetQueryIssue(query)).toContain('单位不同')
    query.metrics = ['FinalRespTime', 'FirstRespTime']
    expect(widgetQueryIssue(query)).toBe('')
  })

  it('validates composition response values and does not replace missing values with zero', async () => {
    const query = defaultWidgetQuery('Database', 'topValues', 'bingtu')
    for (const value of ['', '-1']) {
      const request = () => Promise.resolve({ status: 200, data: 'Group,Transactions (#)\nOrders,' + value })
      await expect(executeDpm(buildDpmUrl(base, query, 100, 200), request)).rejects.toThrow(value === '' ? '缺失值' : '非负')
    }
    const rows = await executeDpm(buildDpmUrl(base, query, 100, 200), () => Promise.resolve({ status: 200, data: 'Group,Transactions (#)\nOrders,0' }))
    expect(rows.data[0].metricValues[0].value).toBe(0)
  })
  it('keeps node discovery independent from composition metric restrictions', async () => {
    const query = Object.assign(defaultWidgetQuery('Database', 'topValues', 'bingtu'), {
      view: 'nodes', metrics: ['QUERY_COUNT', 'AVG_FINAL_RESP_TIME'] })
    const rows = await executeDpm(buildDpmUrl(base, query, 100, 200), () => Promise.resolve({ status: 200,
      data: 'Group,Transactions (#),Average Response Time (Final Response) (sec),Id\nOrders,,0.2,DB_NODE_ID=orders' }))
    expect(rows.data[0].selection).toBe('DB_NODE_ID=orders')
    expect(rows.data[0].metricValues[0].value).toBe(null)
  })
})

describe('database analysis selection through the existing modal', () => {
  let vm
  beforeEach(() => {
    getIps.mockResolvedValue({ data: [{ ip: 'dpm.example.test', location: 1, alias: 'DPM' }] })
    getMetrics.mockResolvedValue({ data: [] })
    getTopMetrics.mockResolvedValue({ data: [] })
  })
  afterEach(() => { if (vm) { vm.$destroy(); vm.$el.remove() } })

  it('selects a command grouping in a bar chart and preserves node, time, and request template', async () => {
    const initial = Object.assign(defaultWidgetQuery('Database', 'topValues', 'zongxiangzhuzhuangtu'), { selection: 'DB_NODE_ID=orders', timeMode: 'fixed' })
    vm = mount('zongxiangzhuzhuangtu', initial)
    await vm.openApi()
    await flush()
    const fields = vm.$refs.databaseFields
    fields.changeView('commands')
    await flush()
    expect(vm.databaseQuery.selection).toBe(initial.selection)
    expect(vm.databaseQuery.timeMode).toBe('fixed')
    expect(vm.databaseQuery.metrics).toEqual(['AVG_FINAL_RESP_TIME'])
    const api = vm.generateApiUrl()
    expect(readDpmUrl(api).config.widget).toBe('zongxiangzhuzhuangtu')
    expect(getParam(api, 'label')).toBe('CommandsData')
    expect(getParam(api, 'visibleColumns')).toBe('FINAL_RESP_TIME,DB_INSTANCE,QUERY_TEXT')
    expect(getParam(api, 'start')).toBe('100')
    const emitted = jest.fn()
    vm.$on('postParams', emitted)
    vm.submitForm('formData')
    await flush()
    expect(readDpmUrl(emitted.mock.calls[0][0]).config.view).toBe('commands')
  })

  it('does not apply a disabled analysis choice', async () => {
    vm = mount('hengxiangzhuzhuangtu')
    await vm.openApi()
    await flush()
    const fields = vm.$refs.databaseFields
    fields.changeView('slow')
    await flush()
    expect(vm.databaseQuery.view).toBe('summary')
    expect(fields.views.find(option => option.id === 'slow').reason).toContain('记录排名')
  })

  it('keeps an invalid old average pie visible with a warning and requires reselection', async () => {
    const initial = Object.assign(defaultQuery(), { metrics: ['AVG_FINAL_RESP_TIME'] })
    vm = mount('bingtu', initial)
    await vm.openApi()
    await flush()
    const fields = vm.$refs.databaseFields
    expect(vm.databaseQuery.metrics).toEqual(['AVG_FINAL_RESP_TIME'])
    expect(fields.configurationError).toContain('平均值')
    expect(fields.groups.reduce((all, group) => all.concat(group.value), []).find(metric => metric.value === 'AVG_FINAL_RESP_TIME').disabled).toBe(true)
    expect(fields.$el.querySelector('.el-alert--warning').textContent).toContain('当前配置不适配')
    expect(() => fields.validate()).toThrow('平均值')
    fields.changeView('summary')
    await flush()
    expect(vm.databaseQuery.metrics).toEqual(['QUERY_COUNT'])
    expect(fields.configurationError).toBe('')
  })
})

describe('widget context and group rendering in editor and preview', () => {
  for (const page of [Editor, Preview]) {
    for (const chart of [
      { factory: 'moduleHengxiangduidiezhuzhuangtu', render: 'reHengxiangduidiezhuzhuangtu' },
      { factory: 'moduleZongxiangduidiezhuzhuangtu', render: 'reZongxiangduidiezhuzhuangtu' }
    ]) {
      it(page.name + ' ' + chart.render + ' preserves zero categories and database precision in single-series mode', async () => {
        const item = component(chart.factory)
        const query = Object.assign(defaultWidgetQuery('Database', 'topValues', item.type), {
          view: 'commands', selection: 'orders', metrics: ['AVG_FINAL_RESP_TIME'], timeMode: 'fixed' })
        item.config.api = buildDpmUrl(base, query, 100, 200)
        const jobs = []
        const context = { imgmodules: [item],
          start: 100,
          end: 200,
          $nextTick: callback => callback && callback(),
          ajax: ({ params }) => {
            const job = executeDpm(params.url, () => Promise.resolve({ status: 200,
              data: { columnIds: ['Query Command', 'Average Response Time (Final Response) (sec)'],
                rows: [{ values: { 'Query Command': 'Zero', 'Average Response Time (Final Response) (sec)': 0 } },
                  { values: { 'Query Command': 'Tiny', 'Average Response Time (Final Response) (sec)': 0.00024 } }] } }), params.widget).then(response => response.data)
            jobs.push(job)
            return job
          } }
        context.ajaxs = page.methods.ajaxs.bind(context)
        page.methods[chart.render].call(context, '', item.id)
        await Promise.all(jobs)
        await flush()
        const values = item.config.widgets.series[0].data
        expect(values.slice().sort((a, b) => a - b)).toEqual([0, 0.00024])
        const definition = item.type.includes('hengxiang') ? item.config.widgets.yAxis : item.config.widgets.xAxis
        const axis = Array.isArray(definition) ? definition[0] : definition
        expect(axis.data[values.indexOf(0)]).toBe('Zero')
        expect(axis.data[values.indexOf(0.00024)]).toBe('Tiny')
        expect(item.config.widgets.series[0].stack).toBeUndefined()
      })
    }
    it(page.name + ' routes an instance grouping using the actual bar widget and renders its labels and values', async () => {
      const item = component('moduleHengxiangzhuzhuangtu')
      const query = Object.assign(defaultWidgetQuery('Database', 'topValues', item.type), {
        view: 'instances', selection: 'orders', metrics: ['AVG_FINAL_RESP_TIME'], timeMode: 'fixed' })
      item.config.api = buildDpmUrl(base, query, 100, 200)
      const jobs = []
      const context = { imgmodules: [item],
        start: 100,
        end: 200,
        $nextTick: callback => callback && callback(),
        ajax: jest.fn(({ params }) => {
          const job = executeDpm(params.url, url => {
            expect(getParam(url, 'label')).toBe('InstancesData')
            return Promise.resolve({ status: 200,
              data: { columnIds: ['DB Instance', 'Average Response Time (Final Response) (sec)'],
                rows: [{ values: { 'DB Instance': 'Instance A', 'Average Response Time (Final Response) (sec)': 0.25 } },
                  { values: { 'DB Instance': 'Instance B', 'Average Response Time (Final Response) (sec)': 0 } }] } })
          }, params.widget).then(response => response.data)
          jobs.push(job)
          return job
        }) }
      context.ajaxs = page.methods.ajaxs.bind(context)
      page.methods.reHengxiangzhuzhuangtu.call(context, '', item.id)
      await Promise.all(jobs)
      await flush()
      expect(context.ajax.mock.calls[0][0].params.widget).toBe(item.type)
      expect(item.config.widgets.yAxis.data).toEqual(['Instance B', 'Instance A'])
      expect(item.config.widgets.series[0].data).toEqual([0, 0.25])
    })
  }

  it('labels a zero composition explicitly and does not fabricate equal shares', () => {
    const item = component('moduleBingtu')
    const query = defaultWidgetQuery('Database', 'topValues', item.type)
    const rows = [{ metricValues: [{ metric: { label: '查询数' }, value: 0 }] }]
    prepareDpmWidgetResult(item, buildDpmUrl(base, query, 100, 200), rows)
    Object.assign(item.config.params.moduledatas, { x: ['Zero node'], y: [0], unit: '个' })
    const option = moduledefault.Bingtu(item.config.params)
    expect(option.series).toEqual([])
    expect(option.graphic.style.text).toContain('总量为 0')
    expect(option.title.text).toContain('本次返回 1 个节点')
  })

  it('renders a stack widget as a declared single series without an additive stack', () => {
    const item = component('moduleZongxiangduidiezhuzhuangtu')
    const query = defaultWidgetQuery('Database', 'topValues', item.type)
    prepareDpmWidgetResult(item, buildDpmUrl(base, query, 100, 200), [{ metricValues: [{ metric: { label: '查询数' }, value: 3 }] }])
    Object.assign(item.config.params.moduledatas, { x: ['Orders'], y: [[3]], label: ['查询数'] })
    const option = moduledefault.Zongxiangduidiezhuzhuangtu(item.config.params)
    expect(option.series).toHaveLength(1)
    expect(option.series[0].stack).toBeUndefined()
    expect(option.title.text).toContain('单系列统计')
  })
  it('clears a stale chart when a composition response is invalid', () => {
    const item = component('moduleBingtu')
    showDpmWidgetError(item, { code: 'DPM_COMPOSITION_INVALID', message: '缺失值不能补为 0' })
    expect(item.chart.clear).toHaveBeenCalled()
    expect(item.chart.setOption.mock.calls[0][0].graphic.style.text).toContain('构成数据不可用')
  })
})
