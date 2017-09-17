import * as util from '../lib/util.js'

describe('Testing utility functions', () => {
  test('Testing promisify()', () => {

  })

  test('Testing securityWarning()', () => {
    let spy = jest.spyOn(console, 'error')
    util.securityWarning('Testing', 'Testing to make sure securityWarning console.errors', {test: 'test', one: 'two'}, 'util.test.js', {tester: 'jest'})

    expect(spy).toHaveBeenCalled()
  })

  test('Testing btoa()', () => {
    let b64Check = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/
    let encoded = util.btoa('test string')
    expect(b64Check.test(encoded)).toEqual(true)
  })

  test('Testing atob()', () => {
    let encoded = 'dGVzdCBzdHJpbmc=' // 'test string'
    let decoded = util.atob(encoded)
    expect(decoded).toEqual('test string')
  })
})
