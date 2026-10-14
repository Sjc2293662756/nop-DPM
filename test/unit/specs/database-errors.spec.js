import { describeDpmError } from '@/dataSources/dpm/errors'
import { normalizeTable } from '@/dataSources/dpm/normalize'
import { defaultQuery } from '@/dataSources/dpm/catalog'

describe('database query failure classification', () => {
  it('distinguishes an empty HTTP response from a valid dataset with no rows', () => {
    let emptyError
    try { normalizeTable('', defaultQuery()) } catch (error) { emptyError = error }
    expect(emptyError.code).toBe('DPM_EMPTY_RESPONSE')
    expect(describeDpmError(emptyError)).toContain('未返回可解析')
    expect(normalizeTable('Group,QUERY_COUNT\n', defaultQuery())).toEqual([])
  })
  it('does not describe a rejected time or unsupported query as an empty database', () => {
    expect(describeDpmError({ response: { status: 400 } })).toContain('查询被拒绝')
  })
  it('keeps authentication, permissions, missing endpoints and timeouts distinct', () => {
    expect(describeDpmError({ code: 'PLATFORM_LOGIN_REQUIRED' })).toContain('登录会话')
    expect(describeDpmError({ response: { status: 403 } })).toContain('权限不足')
    expect(describeDpmError({ response: { status: 404 } })).toContain('接口未找到')
    expect(describeDpmError({ code: 'ECONNABORTED' })).toContain('超时')
  })
})
