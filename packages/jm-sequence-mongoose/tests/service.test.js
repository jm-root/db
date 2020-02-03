const service = require('./service')

beforeAll(async () => {})

const name = 'test_sequence'

describe('sequence', async () => {
  test('next', async () => {
    let ret = await service.reset(name, { value: 100 })
    expect(ret === 100).toBeTruthy()

    ret = await service.next(name)
    expect(ret === 101).toBeTruthy()

    let ret2 = await service.next(name, { inc: 200 })
    expect(ret2 - ret === 200).toBeTruthy()

    await service.reset(name, { value: -1 })
    ret = await service.next(name)
    expect(ret === 0).toBeTruthy()
  })
})
