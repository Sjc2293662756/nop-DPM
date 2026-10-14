import Vue from 'vue'
import Vuex from 'vuex'
import ElementUI from 'element-ui'
import RuntimeTable from '@/components/DatabaseRuntimeTable.vue'
import ApiModal from '@/components/ApiModal.vue'
import Editor from '@/view/imgmodules/imgeditor.vue'
import Preview from '@/view/imgmodules/preview.vue'
import { getIps, getMetrics, getTopMetrics } from '@/apis/module'
import { defaultWidgetQuery, analysisOptions } from '@/dataSources/dpm/capabilities'
import { RUNTIME_FIELDS, RUNTIME_SORTS } from '@/dataSources/dpm/catalog'
import { buildDpmUrl, getParam, readDpmUrl } from '@/dataSources/dpm/query'
import { normalizeTable } from '@/dataSources/dpm/normalize'
import { runtimeUrl, runtimeNodes, visibleRuntimeRows, isDpmRuntimeTable } from '@/dataSources/dpm/runtime'

jest.mock('@/apis/module', () => ({ getIps: jest.fn(), getMetrics: jest.fn(), getTopMetrics: jest.fn(), getObjects: jest.fn() }))
for (const image of [1, 3, 13, 15, 16, 17, 18, 19, 21, 22, 23, 24, 26, 29, 30, 40, 41, 42, 43, 44]) {
  jest.doMock('@/assets/imgs/' + image + '.png', () => 'asset.png')
}
Vue.use(Vuex)
Vue.use(ElementUI)
const base = 'https://dpm.example.test/webservice/NetInside'
const flush = () => new Promise(resolve => setTimeout(resolve, 0))
const rootSelector = 'DB_NODE_ID=node AND DIM=command'
const childSelector = 'opaque%25&selector=child'
const headers = ['Group', ...RUNTIME_FIELDS.map(id => RUNTIME_SORTS[id])]
function query (overrides = {}) {
  return Object.assign(defaultWidgetQuery('Database', 'topValues', 'biaoge'), { view: 'raw', selection: 'node', metrics: RUNTIME_FIELDS, timeMode: 'fixed' }, overrides)
}
function rows (entries) {
  return normalizeTable({ columnIds: headers, rows: entries.map(entry => ({ id: entry[0], values: { Group: entry[1], ...RUNTIME_FIELDS.reduce((all, id, index) => { all[RUNTIME_SORTS[id]] = entry[index + 2]; return all }, {}) } })) }, query())
}
const roots = () => rows([[rootSelector, 'Query Command']])
function item (config = query()) {
  return { id: 'runtime', type: 'biaoge', style: { height: '300px' }, config: { datas: true, datastype: 'api', api: buildDpmUrl(base, config, 100, 200), widgets: {} } }
}
function mount (action) {
  const store = new Vuex.Store({ actions: { ajax: action } })
  const state = new Vue({ data: { current: item() } })
  const vm = new (Vue.extend(RuntimeTable))({ store, propsData: { item: state.current, start: 300, end: 400 } })
  vm._testState = state
  vm.$mount()
  return vm
}

describe('runtime tree contracts and display', () => {
  it('keeps comparison symbols in runtime text while removing response display markup', () => {
    const result = rows([['a', 'value < 3 and other > 1'], ['b', '<span class="label">a &lt; b</span>']])
    expect(result[0].group.argument).toBe('value < 3 and other > 1')
    expect(result[1].group.argument).toBe('a < b')
  })
  it('enables runtime statistics only on tables and keeps all analyses visible', () => {
    expect(analysisOptions('biaoge').find(option => option.id === 'raw').disabled).toBe(false)
    for (const widget of ['zongxiangzhuzhuangtu', 'hengxiangzhuzhuangtu', 'zongxiangduidiezhuzhuangtu', 'bingtu', 'yibiaopan', 'zhexiantu']) {
      const options = analysisOptions(widget)
      expect(options).toHaveLength(9)
      expect(options.find(option => option.id === 'raw').reason).toContain('树表')
    }
  })
  it('uses default columns and the exact server selector without a second node prefix or decode', () => {
    const url = runtimeUrl(item().config.api, 300, 400, childSelector)
    expect(getParam(url, 'selection')).toBe(childSelector)
    expect(getParam(url, 'visibleColumns')).toBe(RUNTIME_FIELDS.join(','))
    expect(getParam(url, 'start')).toBe('100')
    expect(getParam(url, 'end')).toBe('200')
    expect(getParam(url, 'topMetric')).toBe(RUNTIME_SORTS.AVG_FINAL_RESP_TIME)
    expect(readDpmUrl(item().config.api).config.rawSelection).toBeUndefined()
  })
  it('keeps root order, zero values, duplicate names and stable sibling sort', () => {
    const root = runtimeNodes(rows([['a', 'DB User'], ['b', 'Query Command']]))
    expect(root.map(node => node.label)).toEqual(['数据库用户', '查询命令'])
    const children = runtimeNodes(rows([['first', 'same', 0], ['second', 'same', 0.24], ['third', 'missing', null]]), 'root/0', 1)
    expect(children.map(node => node.selector)).toEqual(['second', 'first', 'third'])
    root[0].children = children; root[0].expanded = true
    expect(visibleRuntimeRows(root).map(node => node.label)).toEqual(['数据库用户', 'same', 'same', 'missing', '查询命令'])
    expect(children[1].values.AVG_FINAL_RESP_TIME).toBe(0)
    expect(new Set(children.map(node => node.key)).size).toBe(3)
  })
  it('does not create an expansion selector from a display label and stops selector cycles', () => {
    const node = runtimeNodes(rows([['', 'Query Command']]))[0]
    expect(node.canExpand).toBe(false)
    const cycle = runtimeNodes(roots(), 'root/0', 1, [rootSelector])[0]
    expect(cycle.canExpand).toBe(false)
  })
  it('uses one shared component and prevents flat-table root queries at both page entry points', () => {
    for (const page of [Editor, Preview]) {
      expect(page.components.DatabaseRuntimeTable).toBe(RuntimeTable)
      const current = item()
      const context = { imgmodules: [current], ajaxs: jest.fn() }
      page.methods.reBiaoge.call(context, '', current.id)
      expect(context.ajaxs).not.toHaveBeenCalled()
      const table = { loading: false, queryContext: 'same', activeContext: 'same', reload: jest.fn() }
      context.$refs = { ['runtime-' + current.id]: [table] }
      page.methods.reBiaoge.call(context, '', current.id)
      expect(table.reload).toHaveBeenCalledTimes(1)
      table.loading = true
      page.methods.reBiaoge.call(context, '', current.id)
      expect(table.reload).toHaveBeenCalledTimes(1)
      expect(isDpmRuntimeTable(current)).toBe(true)
      current.config.datastype = 'default'
      expect(isDpmRuntimeTable(current)).toBe(false)
    }
  })
})

describe('runtime tree component lifecycle', () => {
  let vm
  afterEach(() => { if (vm) { vm.$destroy(); vm.$el.remove(); vm._testState.$destroy() } })
  it('loads two levels on expansion, preserves selectors and caches a collapsed branch', async () => {
    const action = jest.fn((context, { params }) => {
      const selection = getParam(params.url, 'selection')
      if (selection === 'DB_NODE_ID=node') return Promise.resolve(roots())
      if (selection === rootSelector) return Promise.resolve(rows([[childSelector, 'select', 0.2, 0.1, 3, 1, 2], ['leaf', 'update', 0, 0, 0, 0, 0]]))
      if (selection === childSelector) return Promise.resolve(rows([['', 'detail', 0.3, 0.1, 4, 1, 2]]))
      throw new Error('unexpected selector')
    })
    vm = mount(action); await flush()
    expect(vm.$el.textContent).toContain('查询命令')
    expect(vm.$el.textContent).toContain('—')
    vm.toggle(vm.rows[0]); await flush()
    vm.toggle(vm.rows[0].children[0]); await flush()
    expect(vm.visibleRows.map(row => row.label)).toEqual(['查询命令', 'select', 'detail', 'update'])
    vm.toggle(vm.rows[0]); vm.toggle(vm.rows[0]); await flush()
    expect(action).toHaveBeenCalledTimes(3)
    expect(vm.item.config.api).not.toContain(childSelector)
  })
  it('shows child failure and permits retry, then treats an empty result as valid', async () => {
    const action = jest.fn().mockImplementationOnce(() => Promise.resolve(roots())).mockImplementationOnce(() => Promise.reject(new Error('temporary failure'))).mockImplementationOnce(() => Promise.resolve([]))
    vm = mount(action); await flush()
    vm.toggle(vm.rows[0]); await flush()
    expect(vm.rows[0].error).toContain('temporary failure')
    expect(vm.$el.textContent).toContain('重试')
    await vm.loadChildren(vm.rows[0]); await flush()
    expect(vm.rows[0].error).toBe('')
    expect(vm.$el.textContent).toContain('暂无下级记录')
  })
  it('refreshes the statistics of expanded branches without collapsing their position', async () => {
    let value = 0.2
    const action = jest.fn((context, { params }) => Promise.resolve(getParam(params.url, 'selection') === 'DB_NODE_ID=node'
      ? roots() : rows([['leaf', 'select', value, 0, 1, 0, 0]])))
    vm = mount(action); await flush()
    await vm.loadChildren(vm.rows[0]); await flush()
    value = 0.4
    await vm.reload(); await flush()
    expect(vm.rows[0].expanded).toBe(true)
    expect(vm.rows[0].children[0].values.AVG_FINAL_RESP_TIME).toBe(0.4)
    expect(action).toHaveBeenCalledTimes(4)
  })
  it('ignores a late child response after the database configuration changes', async () => {
    let finishOld
    const action = jest.fn().mockImplementationOnce(() => Promise.resolve(roots())).mockImplementationOnce(() => new Promise(resolve => { finishOld = resolve })).mockImplementationOnce(() => Promise.resolve(rows([['new', 'DB Instance']])))
    vm = mount(action); await flush()
    const oldRoot = vm.rows[0]
    vm.toggle(oldRoot); await flush()
    vm.item.config.api = buildDpmUrl(base, query({ selection: 'new' }), 100, 200)
    await flush()
    finishOld(rows([['old', 'old child', 1]])); await flush()
    expect(vm.visibleRows.map(row => row.label)).toEqual(['数据库实例'])
    expect(oldRoot.children).toEqual([])
  })
  it('follows page time, but does not refresh a fixed historical tree on page time changes', async () => {
    const action = jest.fn(() => Promise.resolve(roots()))
    vm = mount(action); await flush()
    vm.$props.start = 500; vm.$props.end = 600; await flush()
    expect(action).toHaveBeenCalledTimes(1)
    vm.item.config.api = buildDpmUrl(base, query({ timeMode: 'dashboard' }), 100, 200); await flush()
    const url = action.mock.calls[action.mock.calls.length - 1][1].params.url
    expect(getParam(url, 'start')).toBe('500')
    expect(getParam(url, 'end')).toBe('600')
  })
})

describe('runtime table configuration without metric selection', () => {
  it('reopens old display metrics and submits default columns, sorting, search and quantity', async () => {
    getIps.mockResolvedValue({ data: [{ ip: 'dpm.example.test', location: 1, alias: 'DPM' }] })
    getMetrics.mockResolvedValue({ data: [] }); getTopMetrics.mockResolvedValue({ data: [] })
    const config = query({ metrics: ['QUERY_COUNT'], rawSortMetric: 'QUERY_COUNT_RATE', rawSearch: 'keyword', limit: 5 })
    const store = new Vuex.Store({ actions: { ajax: () => Promise.resolve([]) } })
    const vm = new (Vue.extend(ApiModal))({ store, propsData: { api: buildDpmUrl(base, config, 100, 200), imgtype: 'biaoge', type: 'topValues' } })
    vm.$route = { name: 'imgeditor' }; vm.$mount()
    try {
      await vm.openApi(); await flush()
      const fields = vm.$refs.databaseFields
      expect(fields.runtimeMode).toBe(true)
      expect(fields.$el.textContent).toContain('无需选择指标')
      expect(fields.$children.some(child => child.label === '数据库指标')).toBe(false)
      fields.validate()
      const url = vm.generateApiUrl()
      expect(readDpmUrl(url).config.metrics).toEqual(RUNTIME_FIELDS)
      expect(getParam(url, 'topMetric')).toBe(RUNTIME_SORTS.QUERY_COUNT_RATE)
      expect(getParam(url, 'search')).toBe('keyword')
      expect(getParam(url, 'top')).toBe('5')
    } finally { vm.$destroy(); vm.$el.remove() }
  })
})

describe('runtime controls inside the editor selection frame', () => {
  let editor
  afterEach(() => {
    document.onmousemove = null; document.onmouseup = null
    if (editor) { editor.$destroy(); editor.$el.remove() }
  })
  function mountEditor (action) {
    const store = new Vuex.Store({ actions: { ajax: action } })
    const stub = { render: h => h('div') }
    editor = new (Vue.extend({
      ...Editor,
      created: [],
      mounted: [],
      data () { return { ...Editor.data.call(this), start: 300, end: 400 } },
      components: { ...Editor.components, apiModal: stub, thresholdSettings: stub, 'photoshop-picker': stub, Slider: stub, RadioGroup: stub, Radio: stub }
    }))({ store, beforeCreate () { this.$route = { query: {} } } })
    const current = item()
    current.style = { ...current.style, position: 'absolute', width: '900px', left: '27px', top: '28px', border: '1px solid transparent', background: '', animation: '', 'border-radius': '0px', 'z-index': 1 }
    current.config.widgets = { xStyle: {}, headerStyle: {}, x: [], y: [] }
    current.selects = false
    editor.imgmodules = [current]
    editor.$mount(); document.body.appendChild(editor.$el)
    return current
  }
  it('selects on a real button press without starting a drag or losing the subsequent click', async () => {
    const action = jest.fn((context, { params }) => Promise.resolve(getParam(params.url, 'selection') === 'DB_NODE_ID=node'
      ? roots() : rows([['leaf', 'select', 0.2, 0.1, 3, 1, 2]])))
    const current = mountEditor(action); await flush()
    const button = editor.$el.querySelector('.el-table__fixed .runtime-name button')
    button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await Vue.nextTick()
    expect(current.selects).toBe(true)
    expect(editor.$el.querySelector('#zoom-container').classList.contains('runtime-interactive-selection')).toBe(true)
    expect(document.onmousemove).toBeNull()
    button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
    button.click(); await flush()
    const tree = editor.$refs['runtime-runtime'][0]
    expect(tree.rows[0].expanded).toBe(true)
    expect(tree.rows[0].children).toHaveLength(1)
    expect(editor.zooms.show).toBe(true)
    expect(current.style.left).toBe('27px')
    button.click(); await flush()
    expect(tree.rows[0].expanded).toBe(false)
    expect(action).toHaveBeenCalledTimes(2)
  })
  it('keeps title dragging, resizing, and the ordinary overlay for other widgets and group selection', async () => {
    const current = mountEditor(() => Promise.resolve(roots())); await flush()
    const title = editor.$el.querySelector('.runtime-drag-handle')
    title.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100, clientY: 100 }))
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 120, clientY: 110 }))
    expect(current.style.left).toBe('47px')
    expect(current.style.top).toBe('38px')
    document.onmousemove = null; document.onmouseup = null
    expect(editor.runtimeSelectionInteractive).toBe(true)
    await Vue.nextTick()
    editor.$el.querySelector('.handle-right').dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 900 }))
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 920 }))
    expect(parseFloat(current.style.width)).toBeCloseTo(920)
    document.onmousemove = null; document.onmouseup = null
    const other = { ...current, style: { ...current.style }, id: 'other', type: 'qukuaizujian', selects: true }
    editor.imgmodules.push(other)
    expect(editor.runtimeSelectionInteractive).toBe(false)
    await Vue.nextTick()
    editor.$el.querySelector('.item-border').dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100, clientY: 100 }))
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 110, clientY: 100 }))
    expect(current.style.left).toBe('57px')
    expect(other.style.left).toBe('57px')
    document.onmousemove = null; document.onmouseup = null
    current.selects = false
    expect(editor.runtimeSelectionInteractive).toBe(false)
  })
  it('moves from table cells and toolbar space while keeping controls and scrollbars interactive', async () => {
    const current = mountEditor(() => Promise.resolve(roots())); await flush()
    for (const selector of ['.el-table__fixed .runtime-label', '.runtime-toolbar']) {
      editor.$el.querySelector(selector).dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100, clientY: 100 }))
      expect(document.onmousemove).not.toBeNull()
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 110, clientY: 105 }))
      document.onmousemove = null; document.onmouseup = null
    }
    expect(current.style.left).toBe('47px')
    expect(current.style.top).toBe('38px')
    for (const selector of ['.runtime-toolbar button', '.el-table__body-wrapper', '.el-table__header-wrapper th']) {
      editor.$el.querySelector(selector).dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
      expect(document.onmousemove).toBeNull()
    }
  })
  it('opens the existing right-click menu and preserves delete confirmation and cancellation', async () => {
    const current = mountEditor(() => Promise.resolve(roots())); await flush()
    const target = editor.$el.querySelector('.el-table__fixed .runtime-label')
    target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 2 }))
    expect(document.onmousemove).toBeNull()
    const contextMenu = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2, clientX: 200, clientY: 250 })
    target.dispatchEvent(contextMenu); await Vue.nextTick()
    expect(contextMenu.defaultPrevented).toBe(true)
    expect(current.selects).toBe(true)
    expect(editor.$el.querySelector('#view-menu').style.display).not.toBe('none')
    const remove = Array.from(editor.$el.querySelectorAll('#view-menu li')).find(e => e.textContent === '删除')
    remove.click(); await Vue.nextTick()
    expect(editor.$el.querySelector('.message-confirm').style.display).not.toBe('none')
    const confirm = editor.$el.querySelectorAll('.message-confirm .confirm span')
    confirm[1].click(); await Vue.nextTick()
    expect(current.style.display).not.toBe('none')
    expect(editor.message.style.display).toBe('none')
    target.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }))
    remove.click(); confirm[0].click(); await Vue.nextTick()
    expect(current.style.display).toBe('none')
    expect(editor.zooms.show).toBe(false)
  })
})
