import moment from 'moment'
import Editor from '@/view/imgmodules/imgeditor.vue'
import Preview from '@/view/imgmodules/preview.vue'
import moduledata from '@/store/module/moduledata'
import moduledefault from '@/store/module/moduledefault'
import { normalizeSeries, combineSeries, normalizeTable } from '@/dataSources/dpm/normalize'
import { defaultQuery } from '@/dataSources/dpm/catalog'
import { buildDpmUrl } from '@/dataSources/dpm/query'

const flush = () => new Promise(resolve => setTimeout(resolve, 0))
const base = 'https://dpm.example.test/webservice/NetInside'

function component (factory) {
  const context = { moduledata, imgmodules: [], modules: { radio: 1 }, scrollLeft: 0, scrollTop: 0, $nextTick: () => {} }
  Editor.methods[factory].call(context, { clientX: 110, clientY: 140 })
  const item = context.imgmodules[0]
  item.chart = { clear: jest.fn(), setOption: jest.fn() }
  return item
}

function renderingContext (item, data) {
  return {
    imgmodules: [item],
    start: 100,
    end: 200,
    $route: { path: '/imgeditor' },
    $moment: moment,
    $set: (object, key, value) => { object[key] = value },
    $nextTick: callback => callback && callback(),
    ajaxs: () => Promise.resolve(data)
  }
}

describe('database chart repair at editor and preview call sites', () => {
  it('keeps all duplicate timestamps and values while aligning independent curves', () => {
    const first = normalizeSeries('Group,Time (seconds),Average Response Time (Final Response) (sec)\na,100,1\na,100,2\na,160,0', 'FinalRespTime')
    const rate = normalizeSeries('Group,Time (seconds),Average Transaction Rate (#/min)\na,100,3\na,120,4', 'TransactionRate')
    const result = combineSeries(first.concat(rate), 100, 200)
    expect(result.timestamps).toEqual([100, 100, 120, 160])
    expect(result.metricValues[0].values).toEqual([1, 2, null, 0])
    expect(result.metricValues[1].values).toEqual([3, null, 4, null])
    expect(result.metricValues[0].points).toEqual([[100, 1], [100, 2], [160, 0]])
  })

  for (const page of [Editor, Preview]) {
    for (const chart of [
      { factory: 'moduleHengxiangzhuzhuangtu', render: 'reHengxiangzhuzhuangtu', horizontal: true },
      { factory: 'moduleZongxiangzhuzhuangtu', render: 'reZongxiangzhuzhuangtu', horizontal: false }
    ]) {
      it(page.name + ' ' + chart.render + ' preserves zero-valued database nodes', async () => {
        const item = component(chart.factory)
        const query = Object.assign(defaultQuery('Database', 'topValues'), { metrics: ['QUERY_COUNT'] })
        item.config.api = buildDpmUrl(base, query, 100, 200)
        const rows = normalizeTable('Group,Transactions (#)\nZero node,0\nActive node,5', query)
        page.methods[chart.render].call(renderingContext(item, rows), '', item.id)
        await flush()
        const definition = chart.horizontal ? item.config.widgets.yAxis : item.config.widgets.xAxis
        const axis = Array.isArray(definition) ? definition[0] : definition
        expect(axis.data).toContain('Zero node')
        expect(item.config.widgets.series[0].data).toContain(0)
      })
    }
    for (const chart of [
      { factory: 'moduleZhexiantu', render: 'reZhexiantu' },
      { factory: 'moduleMianjitu', render: 'reMianjitu' }
    ]) {
      it(page.name + ' ' + chart.render + ' displays a single zero point with its real timestamp', async () => {
        const item = component(chart.factory)
        const query = Object.assign(defaultQuery('Database', 'timeValues'), { selection: 'orders' })
        item.config.api = buildDpmUrl(base, query, 100, 200)
        const data = combineSeries(normalizeSeries('Group,Time (seconds),Average Response Time (Final Response) (sec)\na,120,0', 'FinalRespTime'), 100, 200)
        page.methods[chart.render].call(renderingContext(item, data), '', item.id)
        await flush()
        expect(item.config.widgets.xAxis[0].type).toBe('time')
        expect(item.config.widgets.series[0].data).toEqual([[120000, 0]])
        expect(item.config.widgets.series[0].showSymbol).toBe(true)
        expect(item.chart.setOption).toHaveBeenCalled()
      })
    }
    for (const chart of [
      { factory: 'moduleJinDuhuantu', render: 'reJinduhuantu', ring: true },
      { factory: 'moduleYibiaopan', render: 'reYibiaopan', ring: false }
    ]) {
      it(page.name + ' ' + chart.render + ' carries database units and accommodates values above 100', async () => {
        const item = component(chart.factory)
        const query = Object.assign(defaultQuery('Database', 'averageValues'), { selection: 'orders' })
        item.config.api = buildDpmUrl(base, query, 100, 200)
        const data = normalizeTable('Group,Transactions (#)\nOrders,250', query)
        page.methods[chart.render].call(renderingContext(item, data), '', item.id)
        await flush()
        const series = item.config.widgets.series[0]
        expect(item.config.params.dpm).toBe(true)
        expect(item.config.params.unit).toBe('个')
        expect(series.data[0].value).toBe(250)
        if (chart.ring) {
          expect(series.label.normal.formatter).toContain('250个')
          expect(series.label.normal.formatter).not.toContain('%')
          expect(series.data[1].value).toBeGreaterThanOrEqual(0)
        } else {
          expect(series.max).toBeGreaterThanOrEqual(250)
          expect(series.detail.formatter).toContain('个')
        }
      })
    }
  }

  it('keeps the existing percentage ring behavior for non-database components', () => {
    const params = component('moduleJinDuhuantu').config.params
    params.value = 40
    expect(moduledefault.Jinduhuantu(params).series[0].label.normal.formatter).toContain('40%')
    expect(moduledefault.Jinduhuantu(params).series[0].data[1].value).toBe(60)
  })
  it('resets the database time axis and original points when switching to static data', () => {
    const item = component('moduleZhexiantu')
    item.config.datastype = 'default'
    item.config.params.moduledatas.dpm = true
    item.config.params.moduledatas.points = [[[120, 9]]]
    Editor.methods.reZhexiantu.call(renderingContext(item, null), '', item.id)
    expect(item.config.widgets.xAxis[0].type).toBe('category')
    expect(item.config.widgets.series[0].data).toEqual(item.config.params.moduledatas.y[0])
  })
  it('restores the original percentage ring on a switch to static data', () => {
    const item = component('moduleJinDuhuantu')
    item.config.datastype = 'default'
    item.config.params.dpm = true
    item.config.params.unit = '秒'
    Editor.methods.reJinduhuantu.call(renderingContext(item, null), '', item.id)
    expect(item.config.widgets.series[0].label.normal.formatter).toContain('%')
    expect(item.config.params.dpm).toBe(false)
  })

  it('shows an explicit empty state rather than a blank axis for a valid empty trend', () => {
    const item = component('moduleZhexiantu')
    Object.assign(item.config.params.moduledatas, { dpm: true, x: [], y: [], points: [], label: [], unit: [] })
    const option = moduledefault.Zhexiantu(item.config.params)
    expect(option.graphic.style.text).toContain('无数据库趋势数据')
    expect(option.series).toEqual([])
  })

  it('persists a chosen maximum and rejects invalid ranges', () => {
    const query = Object.assign(defaultQuery('Database', 'averageValues'), { selection: 'orders', rangeMax: 500 })
    const url = buildDpmUrl(base, query, 100, 200)
    expect(url).toContain('#nop-dpm-v1=')
    expect(() => buildDpmUrl(base, Object.assign({}, query, { rangeMax: 0 }), 100, 200)).toThrow('量程')
    const item = component('moduleYibiaopan')
    item.config.params.dpm = true
    item.config.params.dpmMax = 500
    item.config.params.value = 250
    expect(moduledefault.Yibiaopan(item.config.params).series[0].max).toBe(500)
  })
})
