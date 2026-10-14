import { FIELDS, CURVES, VIEWS } from './catalog'

export function parseCsv (text) {
  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  const input = String(text).replace(/^\uFEFF/, '')
  for (let i = 0; i < input.length; i++) {
    const ch = input[i]
    if (ch === '"') {
      if (quoted && input[i + 1] === '"') { cell += '"'; i++ } else if (quoted || cell === '') { quoted = !quoted } else { cell += ch }
    } else if (!quoted && (ch === ',' || ch === '\n' || ch === '\r')) {
      row.push(cell); cell = ''
      if (ch !== ',') {
        if (ch === '\r' && input[i + 1] === '\n') i++
        if (row.some(value => value !== '')) rows.push(row)
        row = []
      }
    } else { cell += ch }
  }
  if (quoted) throw new Error('数据库 CSV 引号未闭合')
  row.push(cell)
  if (row.some(value => value !== '')) rows.push(row)
  return rows
}

export function readTable (payload) {
  let data = payload
  if (typeof data === 'string') {
    const text = data.replace(/^\uFEFF/, '').trim()
    if (!text) {
      const error = new Error('数据库接口返回空响应，请检查数据源和代理')
      error.code = 'DPM_EMPTY_RESPONSE'
      throw error
    }
    if (/^\s*</.test(text)) throw new Error('数据库接口返回了网页，请检查数据源权限和接口地址')
    if (/^[{[]/.test(text)) {
      try { data = JSON.parse(text) } catch (error) { throw new Error('数据库 JSON 响应格式无效') }
    } else {
      const csv = parseCsv(text)
      if (!csv.length || csv[0].length < 2) throw new Error('数据库接口未返回有效的数据表')
      const headers = csv[0]
      if (new Set(headers).size !== headers.length) throw new Error('数据库响应存在重复列名')
      return { headers,
        rows: csv.slice(1).map(values => {
          if (values.length !== headers.length) throw new Error('数据库 CSV 列数与表头不一致')
          return headers.reduce((row, key, i) => { row[key] = values[i]; return row }, {})
        }) }
    }
  }
  if (!data || !Array.isArray(data.columnIds) || !Array.isArray(data.rows)) throw new Error('数据库接口未返回 columnIds / rows 数据表')
  if (data.columnIds.some(key => typeof key !== 'string')) throw new Error('数据库列定义格式不受支持')
  return { headers: data.columnIds,
    rows: data.rows.map(row => {
      if (!row || !row.values || Array.isArray(row.values) || typeof row.values !== 'object') throw new Error('数据库数据行格式不受支持')
      return Object.assign({}, row.values, row.id != null && row.values.Id == null ? { Id: row.id } : {})
    }) }
}

const UNIT_SUFFIX = /\s*(?:\[([^\]]+)\]|\((sec|msec|seconds?|ms|s|#|#\/min|#\/sec|kbytes|bytes|kbytes\/min|bytes\/sec|pkts|pkts\/min|rows|rows\/min)\))\s*$/i
function headerName (key) { return key.replace(UNIT_SUFFIX, '').trim().replace(/\s+/g, ' ').toLowerCase() }

export function findColumn (headers, field) {
  return headers.find(key => key === field.id) || headers.find(key => headerName(key) === field.id.toLowerCase()) ||
    headers.find(key => field.aliases.some(alias => headerName(key) === alias.toLowerCase()))
}

function numeric (value) {
  if (value == null || /^(?:|null|nan|n\/a|--|-)$/.test(String(value).trim().toLowerCase())) return null
  let text = String(value).trim()
  if (/^[+-]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(text)) text = text.replace(/,/g, '')
  const number = Number(text)
  if (!Number.isFinite(number)) throw new Error('数据库数值字段包含非数值内容')
  return number
}

function unitInfo (header) {
  const suffix = header.match(UNIT_SUFFIX)
  const raw = suffix ? (suffix[1] || suffix[2]).toLowerCase() : ''
  if (['msec', 'ms'].includes(raw)) return { unit: '秒', scale: 0.001 }
  const names = { sec: '秒', s: '秒', second: '秒', seconds: '秒', '#': '个', '#/min': '次/分钟', '#/sec': '次/秒', kbytes: 'KB', bytes: 'B', 'kbytes/min': 'KB/分钟', 'bytes/sec': 'B/秒', pkts: '包', 'pkts/min': '包/分钟', rows: '行', 'rows/min': '行/分钟' }
  return { unit: names[raw] || (suffix ? (suffix[1] || suffix[2]) : ''), scale: 1 }
}

function metricValue (field, column, value) {
  const info = unitInfo(column || '')
  let parsed = field.type === 'number' ? numeric(value) : (value == null ? '' : String(value))
  if (field.type === 'number' && parsed !== null) parsed *= info.scale
  return {
    metric: { id: field.id, label: field.name, unit: field.type === 'number' ? info.unit : '', dpm: true, valueType: field.type },
    // Values are normalized once here, never by the old msec/kb/sec branches.
    unit: field.type === 'number' ? info.unit : '',
    value: parsed
  }
}

function plainLabel (value, runtime = false) {
  const tags = runtime ? /<\/?(?:a|span|div|font|b|br|i|strong|em)(?=\s*(?:>|\/>|[a-z-]+\s*=))[^>]*>/gi : /<[^>]*>/g
  const label = String(value == null ? '' : value).replace(tags, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  return runtime ? label.replace(/&quot;/g, '"').replace(/&#39;/g, "'") : label
}

export function normalizeTable (payload, query) {
  const table = readTable(payload)
  const fields = query.metrics.map(id => FIELDS.find(field => field.id === id))
  const columns = fields.map(field => findColumn(table.headers, field))
  if (table.rows.length) {
    const missing = fields.filter((field, i) => !columns[i])
    if (missing.length) throw new Error('数据库响应缺少字段：' + missing.map(field => field.name).join('、'))
  }
  const view = VIEWS.find(view => view.id === query.view)
  const groupColumn = (view && table.headers.find(key => key === view.label)) ||
    table.headers.find(key => /^(?:group|db server|client address|db client)$/i.test(key))
  const groupLabel = view && view.id !== 'summary' ? (view.groupLabel || view.name) : (query.objectType === 'DatabaseClient' ? '数据库客户端' : '数据库')
  return table.rows.map((row, index) => {
    const id = row.Id == null ? row.ID : row.Id
    const label = plainLabel(groupColumn ? row[groupColumn] : (id || query.selection || index + 1), query.view === 'raw')
    return {
      group: { label: groupLabel, argument: label },
      selection: id == null ? '' : String(id),
      metricValues: fields.map((field, i) => metricValue(field, columns[i], row[columns[i]]))
    }
  })
}

export function normalizeSeries (payload, curveId) {
  const table = readTable(payload)
  const curve = CURVES.find(item => item.id === curveId)
  const timeColumn = findColumn(table.headers, FIELDS.find(item => item.id === 'QUERY_END_TIME'))
  const metric = FIELDS.find(item => item.id === curve.field)
  const valueColumn = findColumn(table.headers, metric) || table.headers.find(key => headerName(key) === headerName(curve.label))
  if (!timeColumn || !valueColumn) throw new Error('数据库趋势响应缺少时间或指标列：' + curve.name)
  const groupColumn = table.headers.find(key => /^group$/i.test(key))
  const series = []
  table.rows.forEach(row => {
    const timestamp = numeric(row[timeColumn])
    if (timestamp === null) throw new Error('数据库趋势包含空时间戳')
    const group = groupColumn ? plainLabel(row[groupColumn]) : ''
    let item = series.find(item => item.group === group)
    if (!item) { item = { group, curve, points: new Map(), unit: '' }; series.push(item) }
    const point = metricValue(metric, valueColumn, row[valueColumn])
    item.unit = point.unit || curve.unit
    if (!item.points.has(timestamp)) item.points.set(timestamp, [])
    item.points.get(timestamp).push(point.value)
  })
  return series
}

export function combineSeries (series, start, end) {
  // Align by timestamp and occurrence without discarding or aggregating samples.
  const counts = new Map()
  series.forEach(item => item.points.forEach((values, time) => counts.set(time, Math.max(counts.get(time) || 0, values.length))))
  const slots = Array.from(counts.keys()).sort((a, b) => a - b).reduce((all, time) =>
    all.concat(Array.from({ length: counts.get(time) }, (_, occurrence) => ({ time, occurrence }))), [])
  const timestamps = slots.map(slot => slot.time)
  return {
    provider: 'dpm',
    timestamps,
    interval: { start: Number(start), end: Number(end) },
    metricValues: series.map(item => ({
      metric: { id: item.curve.id, label: item.curve.name + (item.group ? ' · ' + item.group : ''), unit: item.unit, dpm: true },
      unit: item.unit,
      values: slots.map(({ time, occurrence }) => item.points.has(time) && occurrence < item.points.get(time).length ? item.points.get(time)[occurrence] : null),
      // Plot each curve's actual samples; alignment placeholders are not samples.
      points: Array.from(item.points.keys()).sort((a, b) => a - b).reduce((all, time) => all.concat(item.points.get(time).map(value => [time, value])), [])
    }))
  }
}

export function dpmChartData (result, formatTime) {
  return {
    dpm: true,
    x: result.timestamps.map(formatTime),
    y: result.metricValues.map(item => item.values),
    label: result.metricValues.map(item => item.metric.label),
    unit: result.metricValues.map(item => item.unit),
    points: result.metricValues.map(item => item.points || result.timestamps.map((time, index) => [time, item.values[index]]))
  }
}

export function canEvaluateThreshold (item) {
  return !item.metric.dpm || (item.metric.valueType === 'number' && typeof item.value === 'number' && Number.isFinite(item.value))
}
