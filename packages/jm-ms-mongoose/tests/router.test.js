const $ = require('./service')

let router = null
beforeAll(async () => {
  router = $.router
})

let id = null
describe('router', async () => {
  test('create', async () => {
    let doc = await router.post(
      '/',
      {
        title: 'productTitle',
        tags: ['product', 'new', 'test']
      })
    id = doc.id
    console.log(doc)
    expect(doc).toBeTruthy()
  })

  test('list', async () => {
    let doc = await router.get(
      '/',
      {
        page: 1,
        rows: 10,
        sorter: '-crtime, _id'
      })
    console.log(doc)
    expect(doc).toBeTruthy()
  })

  test('get', async () => {
    let doc = await router.get(`/${id}`)
    console.log(doc)
    expect(doc).toBeTruthy()
  })

  test('get event', async () => {
    $.on('before_get', async (opts) => {
      // 拦截并输出结果
      return {}
    })
      .on('get', async (opts, doc) => {
        return {ret: '123'}
      })
    let doc = await router.get(`/5b51919baf78383a8cfd7ec8`)
    console.log(doc)
    expect(doc).toBeTruthy()
  })

  test('update', async () => {
    let doc = await router.post(`/${id}`, {
      title: 'productTitle2',
      tags: ['product']
    })
    console.log(doc)
    expect(doc).toBeTruthy()
  })

  test('delete', async () => {
    let doc = await router.delete(`/${id}`)
    console.log(doc)
    expect(doc).toBeTruthy()
  })
})
