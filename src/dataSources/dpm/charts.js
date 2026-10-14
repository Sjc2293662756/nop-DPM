import { readDpmUrl, isDpmUrl, buildDpmUrl } from './query'
import { FIELDS } from './catalog'
import { describeDpmError } from './errors'
import { isCompositionWidget, isStackWidget } from './capabilities'

const escapeHtml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const verticalBarRequests = new WeakMap()

export function resetDpmVerticalBar (item) {
  verticalBarRequests.delete(item)
  const data = item.config.params.moduledatas
  if (data.dpmBar) {
    data.dpmBar = false
    data.unit = ''
    data.dpmBarMessage = ''
    item.config.dpmError = ''
  }
}

// Both pages use this path so time refreshes, units and missing values agree.
export async function refreshDpmVerticalBar (context, item, options, createChart) {
  const api = item.config.api
  const request = {}
  verticalBarRequests.set(item, request)
  const current = () => verticalBarRequests.get(item) === request && item.config.api === api &&
    item.config.datas && item.config.datastype === 'api'
  const data = item.config.params.moduledatas
  const draw = () => {
    item.config.widgets = options(item.config.params)
    context.$nextTick(() => {
      if (!current() || !item.config.chart) return
      if (!item.chart) item.chart = createChart()
      item.chart.clear()
      item.chart.setOption(item.config.widgets, { lazyUpdate: true })
    })
  }
  try {
    const saved = readDpmUrl(api)
    const fixed = saved.config.timeMode === 'fixed'
    const url = buildDpmUrl(saved.baseUrl, Object.assign({}, saved.config, { widget: item.type }),
      fixed ? saved.start : context.start, fixed ? saved.end : context.end)
    // Apply component state only after the request is still current. The shared
    // ajaxs handler therefore receives no componentId for this guarded path.
    const rows = await context.ajaxs({ url, widget: item.type })
    if (!current()) return
    prepareDpmWidgetResult(item, url, rows)
    const field = FIELDS.find(field => field.id === saved.config.metrics[0])
    const first = rows.length ? rows[0].metricValues[0] : null
    const sorted = rows.map((row, index) => ({ index, label: row.group.argument || row.group.label, value: row.metricValues[0].value }))
      .sort((a, b) => {
        if (a.value === null && b.value !== null) return 1
        if (b.value === null && a.value !== null) return -1
        return (a.value === null ? 0 : b.value - a.value) || a.index - b.index
      })
    const missing = sorted.filter(row => row.value === null).length
    Object.assign(data, { dpmBar: true,
      x: sorted.map(row => row.label),
      y: [sorted.map(row => row.value)],
      label: [first ? first.metric.label : field.name],
      unit: first ? first.unit : '',
      dpmBarMessage: !sorted.length ? '当前时间范围无数据库统计数据'
        : missing === sorted.length ? '所选指标全部缺失'
          : missing ? '部分分类指标缺失（' + missing + '）'
            : sorted.every(row => row.value === 0) ? '所选指标全部为 0' : '' })
    item.config.widgetdata = JSON.stringify({ x: data.x, y: data.y, label: data.label }, null, 2)
    draw()
  } catch (error) {
    if (!current()) return
    item.config.dpmError = describeDpmError(error)
    Object.assign(data, { dpmBar: true, x: [], y: [], label: [], unit: '', dpmBarMessage: '数据库数据加载失败：' + item.config.dpmError })
    draw()
  }
}

export function dpmVerticalBarOptions (option, data) {
  if (!data.dpmBar) return option
  const name = data.label[0] || ''
  option.yAxis.name = name + (data.unit ? '（' + data.unit + '）' : '')
  option.yAxis.nameTextStyle = { color: '#ddd', fontSize: 12, align: 'left' }
  option.series.forEach(series => { series.unit = data.unit })
  option.tooltip.formatter = items => items.length ? escapeHtml(items[0].name) + '<br/>' + items.map(item =>
    escapeHtml(item.seriesName) + '：' + (item.data == null ? '—（缺失）' : escapeHtml(item.data) + escapeHtml(data.unit))).join('<br/>') : ''
  if (data.dpmBarMessage) {
    option.graphic = { type: 'text',
      left: 'center',
      top: data.dpmBarMessage.startsWith('部分') ? 5 : 'middle',
      style: { text: data.dpmBarMessage, fill: '#ccc', fontSize: 13 } }
  }
  return option
}

export function dpmTrendOptions (option, data) {
  if (!data.dpm) return option
  option.xAxis[0].type = 'time'
  delete option.xAxis[0].data
  option.series.forEach((series, index) => {
    series.data = (data.points[index] || []).map(([time, value]) => [time * 1000, value])
    const singlePoint = series.data.filter(point => point[1] !== null).length === 1
    series.showSymbol = singlePoint
    if (singlePoint) { series.symbol = 'circle'; series.symbolSize = Math.max(4, Number(series.symbolSize) || 4) }
  })
  if (!option.series.some(series => series.data.some(point => point[1] !== null))) {
    option.graphic = { type: 'text',
      left: 'center',
      top: 'middle',
      style: { text: '当前时间范围无数据库趋势数据', fill: '#ccc', fontSize: 14 } }
  }
  option.tooltip.formatter = items => {
    if (!items.length) return ''
    const time = items[0].value[0]
    return new Date(time).toLocaleString('zh-CN', { hour12: false }) + '<br/>' + items.map(item =>
      escapeHtml(item.seriesName) + '：' + (item.value[1] === null ? '—' : item.value[1]) + escapeHtml(data.unit[item.seriesIndex] || '')).join('<br/>')
  }
  return option
}

export function setDpmScalar (params, rows, api) {
  const item = rows && rows[0] && rows[0].metricValues[0]
  params.dpm = !!(item && item.metric.dpm)
  if (!params.dpm) return
  params.value = item.value
  params.unit = item.unit || ''
  const query = readDpmUrl(api).config
  params.dpmMax = query.rangeMax || null
}

export function dpmScalarMaximum (params) {
  if (Number(params.dpmMax) > 0) return Number(params.dpmMax)
  const value = Math.abs(Number(params.value))
  if (value <= 1) return 1
  const step = Math.pow(10, Math.floor(Math.log10(value)))
  return Math.ceil(value / step) * step
}

export function prepareDpmWidgetResult (item, api, rows) {
  if (item) item.config.dpmError = ''
  const data = item && item.config.params && item.config.params.moduledatas
  if (!data) return
  const dpm = isDpmUrl(api)
  data.dpmComposition = dpm && isCompositionWidget(item.type)
  data.dpmStackSingle = dpm && isStackWidget(item.type)
  data.dpmMetricLabel = dpm && Array.isArray(rows) && rows.length && rows[0].metricValues && rows[0].metricValues.length ? rows[0].metricValues[0].metric.label : ''
}

export function showDpmWidgetError (item, error) {
  if (!['DPM_WIDGET_UNSUPPORTED', 'DPM_COMPOSITION_INVALID'].includes(error.code) || !item) return
  item.config.dpmError = error.message
  if (item.chart) {
    item.chart.clear()
    item.chart.setOption({ graphic: { type: 'text',
      left: 'center',
      top: 'middle',
      style: { text: error.code === 'DPM_COMPOSITION_INVALID' ? '构成数据不可用，请检查返回值和查询范围' : '当前配置不适配，请打开“编辑数据”重新选择', fill: '#ccc', fontSize: 13 } } })
  }
}

function caption (text) { return { text, left: 'center', top: 2, textStyle: { color: '#ddd', fontSize: 12, fontWeight: 'normal' } } }

export function dpmCompositionOptions (option, data) {
  if (!data.dpmComposition) return option
  option.title = caption('本次返回 ' + data.x.length + ' 个节点的' + data.dpmMetricLabel + '构成')
  option.tooltip.formatter = '本次返回节点中：<br/>{b}：{c}' + escapeHtml(data.unit || '') + '（{d}%）'
  const message = !data.y.length ? '当前时间范围无构成数据' : data.y.every(value => Number(value) === 0) ? '所选指标总量为 0' : ''
  if (message) {
    option.series = []
    option.graphic = { type: 'text', left: 'center', top: 'middle', style: { text: message, fill: '#ccc', fontSize: 14 } }
  }
  return option
}

export function dpmStackOptions (option, data) {
  if (!data.dpmStackSingle) return option
  option.series.forEach(series => { delete series.stack })
  option.title = caption('单系列统计 · ' + data.dpmMetricLabel)
  return option
}
