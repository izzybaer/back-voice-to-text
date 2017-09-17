import * as util from '../lib/util.js'

describe('Testing utility functions', () => {
  test('Testing promisify()', () => {

  })

  test('Testing securityWarning()', () => {
    let spy = jest.spyOn(console, 'error')
    util.securityWarning('Testing', 'Testing to make sure securityWarning console.errors', {test: 'test', one: 'two'}, 'util.test.js', {tester: 'jest'})

    expect(spy).toHaveBeenCalled()

    spy.mockReset()
    spy.mockRestore()
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

  test('Testing devLog()', () => {
    let originalDebug = process.env.DEBUG
    let spy = jest.spyOn(console, 'log')

    process.env.DEBUG = 'false'
    util.devLog('This should not console.log')

    process.env.DEBUG = 'true'
    util.devLog('This should console.log')
    expect(spy).toHaveBeenCalledTimes(1)

    process.env.DEBUG = originalDebug // So the actual env DEBUG doesn't get messed with

    spy.mockReset()
    spy.mockRestore()
  })

  test('Testing devLogError()', () => {
    let originalDebug = process.env.DEBUG
    let spy = jest.spyOn(console, 'error')

    expect(spy).toHaveBeenCalledTimes(0)

    process.env.DEBUG = 'false'
    util.devLogError('This should not console.error')

    process.env.DEBUG = 'true'
    util.devLogError('This should console.error')
    expect(spy).toHaveBeenCalledTimes(1)

    process.env.DEBUG = originalDebug

    spy.mockReset()
    spy.mockRestore()
  })
})
