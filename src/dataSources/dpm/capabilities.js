import { VIEWS, FIELDS, CURVES, defaultQuery } from './catalog'

const BARS = ['zongxiangzhuzhuangtu', 'hengxiangzhuzhuangtu']
const PIES = ['meiguitu', 'bingtu', 'shixinbingtu']
const STACKS = ['hengxiangduidiezhuzhuangtu', 'zongxiangduidiezhuzhuangtu']
const TRENDS = ['zhexiantu', 'mianjitu']
const SCALARS = ['jinduhuantu', 'yibiaopan', 'shuzitu', 'danhangwenben']
const GROUPED = ['summary', 'related', 'instances', 'applications', 'commands', 'raw']
const TOTALS = ['QUERY_COUNT', 'BYTES_RETURNED', 'PACKETS_RETURNED', 'ROWS_AFFECTED']
const RATES = ['QUERY_COUNT_RATE', 'BYTES_RETURNED_RATE', 'PACKETS_RETURNED_RATE', 'ROWS_AFFECTED_RATE']
const VIEW_ORDER = ['summary', 'related', 'instances', 'applications', 'commands', 'raw', 'slow', 'statements', 'timeseries']

export function isCompositionWidget (widget) { return PIES.includes(widget) }
export function isStackWidget (widget) { return STACKS.includes(widget) }

export function analysisOptions (widget, objectType = 'Database', currentView = 'summary') {
  return VIEW_ORDER.map(id => {
    const view = id === 'timeseries' ? { id, name: '趋势分析' } : VIEWS.find(view => view.id === id)
    let reason = ''
    if (widget === 'tupian') reason = '图片使用图片资源，不查询数据库指标。'
    else if (id === 'related' && objectType !== 'DatabaseClient') reason = '该分析仅适用于数据库客户端。'
    else if (id === 'statements') reason = '语句明细尚未通过数据源验收，本版暂不开放。'
    else if (id === 'raw' && widget && widget !== 'biaoge') reason = '运行统计是多维度下钻树表，请使用表格查看；各维度不能混合作为图表分类。'
    else if (TRENDS.includes(widget) || (!widget && currentView === 'timeseries')) {
      if (id !== 'timeseries') reason = '该结果不是时间序列，请使用柱状图或表格查看。'
    } else if (widget === 'biaoge') {
      if (id === 'timeseries') reason = '趋势表格适配尚未完成，可使用折线图查看。'
    } else if (BARS.includes(widget) || STACKS.includes(widget)) {
      if (id === 'timeseries') reason = '本版柱状图按分类比较数值，趋势请使用折线图。'
      else if (!GROUPED.includes(id)) reason = '慢事务记录排名尚未适配，请使用表格查看。'
    } else if (PIES.includes(widget)) {
      if (id === 'raw') reason = '运行分组的可加性尚未确认，本版暂不开放占比。'
      else if (['related', 'instances', 'applications', 'commands'].includes(id)) reason = '该分析主要返回平均值和速率，速率占比口径尚未确认。'
      else if (id !== 'summary') reason = '该结果不适合直接求构成占比，请使用表格或趋势图。'
    } else if (id !== 'summary') {
      reason = id === 'timeseries' ? '单值组件尚未定义趋势取值方式，请使用趋势图。' : '本版尚未提供具体分组或明细记录的单值选择。'
    }
    return { id, name: view.name, disabled: !!reason, reason }
  })
}

export function widgetMetricLimit (widget, fallback = 0) {
  return BARS.concat(PIES, STACKS, SCALARS).includes(widget) ? 1 : fallback
}

export function metricIssue (query, metricId, widget = query.widget) {
  if (!widget || query.view === 'nodes' || widget === 'biaoge') return ''
  if (query.view === 'timeseries') return ''
  const field = FIELDS.find(field => field.id === metricId)
  if (!field || field.type !== 'number') return '该组件需要数值指标，文本和时间仅适合表格展示。'
  if (PIES.includes(widget)) {
    if (RATES.includes(metricId)) return '速率占比口径尚未确认，本版暂不开放。'
    if (!TOTALS.includes(metricId)) return '平均值不适合直接求占比，请使用柱状图比较。'
  }
  return ''
}

export function widgetQueryIssue (query, widget = query.widget) {
  if (!widget || query.view === 'nodes') return ''
  const option = analysisOptions(widget, query.objectType, query.view).find(option => option.id === query.view)
  if (!option) return '不支持的数据库分析内容。'
  if (option.disabled) return option.reason
  if (!Array.isArray(query.metrics)) return ''
  if (widgetMetricLimit(widget) && query.metrics.length > 1) {
    return STACKS.includes(widget) ? '本版堆叠图采用单系列统计，请只选择一个指标；不同业务量不能直接堆叠。' : '当前组件只支持一个数据库指标。'
  }
  for (const id of query.metrics) {
    const reason = metricIssue(query, id, widget)
    if (reason) return reason
  }
  if (TRENDS.includes(widget) && query.view === 'timeseries') {
    const units = query.metrics.map(id => CURVES.find(curve => curve.id === id)).filter(Boolean).map(curve => curve.unit)
    if (new Set(units).size > 1) return '响应时间和事务速率单位不同，本版请分别配置图表。'
  }
  return ''
}

export function assertWidgetQuery (query, widget = query.widget) {
  const reason = widgetQueryIssue(query, widget)
  if (reason) {
    const error = new Error(reason)
    error.code = 'DPM_WIDGET_UNSUPPORTED'
    throw error
  }
}

export function defaultWidgetMetrics (query, widget) {
  if (query.view === 'timeseries') return [widget === 'mianjitu' ? 'TransactionRate' : 'FinalRespTime']
  const view = VIEWS.find(view => view.id === query.view) || VIEWS[0]
  if (query.view === 'summary') {
    if (widget === 'biaoge') return view.defaults.slice()
    if (SCALARS.includes(widget)) return ['AVG_FINAL_RESP_TIME']
    return ['QUERY_COUNT']
  }
  return (view.defaults || view.fields).filter(id => !metricIssue(query, id, widget)).slice(0, widgetMetricLimit(widget) || undefined)
}

export function defaultWidgetQuery (objectType, mode, widget) {
  const query = Object.assign(defaultQuery(objectType, mode, widget), { widget, widgetPolicyVersion: 1 })
  query.metrics = defaultWidgetMetrics(query, widget)
  if (STACKS.includes(widget)) query.stackMode = 'single'
  return query
}
