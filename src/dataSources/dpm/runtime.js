import { FIELDS, RUNTIME_FIELDS } from './catalog'
import { isDpmUrl, readDpmUrl, buildDpmUrl } from './query'

const names = { 'SQL Statement': 'SQL 语句',
  'Query Command': '查询命令',
  'Query Return Code': '查询返回码',
  'Query Band': '查询标签',
  'Port Band': '端口标签',
  'DB User': '数据库用户',
  'DB Type': '数据库类型',
  'DB Instance': '数据库实例',
  'Client User': '客户端用户',
  'Client Address': '客户端地址',
  Application: '应用',
  'DB Server': '数据库服务器' }

export function isDpmRuntimeTable (item) {
  if (!item || item.type !== 'biaoge' || !item.config || !item.config.datas || item.config.datastype !== 'api' || !isDpmUrl(item.config.api)) return false
  try { return readDpmUrl(item.config.api).config.view === 'raw' } catch (error) { return false }
}

export function runtimeConfiguration (query) {
  const config = Object.assign({}, query, { view: 'raw', widget: 'biaoge', singleNode: false, metrics: RUNTIME_FIELDS.slice() })
  delete config.rawSelection
  return config
}

export function runtimeUrl (api, start, end, selector) {
  const saved = readDpmUrl(api)
  const query = runtimeConfiguration(saved.config)
  if (selector != null) query.rawSelection = selector
  const fixed = query.timeMode === 'fixed'
  return buildDpmUrl(saved.baseUrl, query, fixed ? saved.start : start, fixed ? saved.end : end)
}

export function runtimeColumns (rows) {
  return RUNTIME_FIELDS.map(id => {
    const field = FIELDS.find(field => field.id === id)
    const metric = rows.length && rows[0].metricValues.find(value => value.metric.id === id)
    const unit = metric ? metric.unit : ''
    return { id, name: field.name + (unit ? '[' + unit + ']' : '') }
  })
}

export function runtimeNodes (rows, prefix = 'root', depth = 0, ancestors = [], sortMetric = 'AVG_FINAL_RESP_TIME') {
  const nodes = rows.map((row, index) => ({ key: prefix + '/' + index,
    label: names[row.group.argument] || row.group.argument || row.group.label,
    selector: row.selection || '',
    depth,
    ancestors,
    values: RUNTIME_FIELDS.reduce((values, id) => {
      const item = row.metricValues.find(item => item.metric.id === id)
      values[id] = item ? item.value : null
      return values
    }, {}),
    canExpand: !!row.selection && !ancestors.includes(row.selection),
    expanded: false,
    loading: false,
    loaded: false,
    error: '',
    children: [] }))
  if (depth) {
    nodes.sort((a, b) => {
      if (a.values[sortMetric] === null && b.values[sortMetric] !== null) return 1
      if (b.values[sortMetric] === null && a.values[sortMetric] !== null) return -1
      return a.values[sortMetric] === null ? 0 : b.values[sortMetric] - a.values[sortMetric]
    })
  }
  return nodes
}

export function visibleRuntimeRows (nodes) {
  return nodes.reduce((rows, node) => rows.concat([node], node.expanded ? visibleRuntimeRows(node.children) : []), [])
}

export function expandedRuntimePaths (nodes) {
  return nodes.filter(node => node.expanded).map(node => ({ selector: node.selector, children: expandedRuntimePaths(node.children) }))
}

export function refreshDpmRuntimeTable (context, item) {
  const ref = context.$refs && context.$refs['runtime-' + item.id]
  const table = Array.isArray(ref) ? ref[0] : ref
  if (table && !table.loading && table.queryContext === table.activeContext) table.reload()
}
