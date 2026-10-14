import Preview from '@/view/imgmodules/preview.vue'
import { defaultQuery } from '@/dataSources/dpm/catalog'
import { buildDpmUrl } from '@/dataSources/dpm/query'
import { normalizeTable } from '@/dataSources/dpm/normalize'

const flush = () => new Promise(resolve => setTimeout(resolve, 0))
const base = 'https://dpm.example.test/webservice/NetInside'

describe('database preview lifecycle', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    delete window.startTimeUnix
    delete window.endTimeUnix
    delete window.getNewDate
    window.onresize = null
    window.oncontextmenu = null
    document.onmouseup = null
  })

  it('initially loads the current last hour instead of the old fixed test date', () => {
    jest.spyOn(Date, 'now').mockReturnValue(10000000)
    const context = {
      $route: { query: {} },
      modules: {},
      $nextTick: callback => callback(),
      moduleContent: jest.fn(),
      showtime: jest.fn()
    }
    context.updateTimeRange = Preview.methods.updateTimeRange.bind(context)
    Preview.mounted.call(context)
    expect(context.start).toBe('6400')
    expect(context.end).toBe('10000')
    expect(context.moduleContent).toHaveBeenCalledTimes(1)
  })

  it('refreshes standalone time while respecting an explicit parent interval', () => {
    const now = jest.spyOn(Date, 'now').mockReturnValue(10000000)
    const context = { $route: { path: '/preview' }, reBiaoge: jest.fn() }
    context.updateTimeRange = Preview.methods.updateTimeRange.bind(context)
    Preview.methods.autoGetData.call(context, 'biaoge', 'table1')
    expect(context.end).toBe('10000')
    now.mockReturnValue(10100000)
    Preview.methods.autoGetData.call(context, 'biaoge', 'table1')
    expect(context.end).toBe('10100')
    window.startTimeUnix = 100
    window.endTimeUnix = 200
    Preview.methods.autoGetData.call(context, 'biaoge', 'table1')
    expect(context.start).toBe('100')
    expect(context.end).toBe('200')
  })

  it('renders missing database cells without falsely applying a less-than threshold', async () => {
    const query = Object.assign(defaultQuery('Database', 'topValues', 'biaoge'), { metrics: ['QUERY_COUNT'] })
    const table = {
      id: 'table1',
      style: {},
      config: {
        datas: true,
        datastype: 'api',
        api: buildDpmUrl(base, query, 100, 200),
        widgets: { x: [], y: [] },
        threshold: [{ category: 'QUERY_COUNT', symbol: '<', Minor: 1 }]
      }
    }
    const context = {
      imgmodules: [table],
      start: 100,
      end: 200,
      $set: (object, key, value) => { object[key] = value },
      $nextTick: callback => callback(),
      ajaxs: () => Promise.resolve(normalizeTable('Group,QUERY_COUNT\nmissing,\nzero,0', query))
    }
    Preview.methods.reBiaoge.call(context, '', 'table1')
    await flush()
    expect(table.config.widgets.y[0].key1).toBe(null)
    expect(table.config.widgets.y[0].bg1).toBeUndefined()
    expect(table.config.widgets.y[1].key1).toBe(0)
    expect(table.config.widgets.y[1].bg1).toBe('Minor')
  })
})
