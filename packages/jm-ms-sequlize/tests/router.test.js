const $ = require('./service')

let router = null
beforeAll(async () => {
  router = $.router
})

let id = null
describe('router', async () => {

  test('list', async () => {
    let doc = await router.get('/')
    console.log(doc)
    expect(doc).toBeTruthy()
  })

  test('create', async () => {
    let doc = await router.post(
      '/',
      {
        title: '标题',
        content: '内容'
      })
    id = doc.id
    console.log(doc.get({plain: true}))
    expect(doc).toBeTruthy()
  })

  test('list', async () => {
    let doc = await router.get('/', {
        page: 1,
        rows: 10
      })
    console.log(doc)
    expect(doc).toBeTruthy()
  })

  test('get', async () => {
    let doc = await router.get(`/${id}`)
    console.log(doc)
    expect(doc).toBeTruthy()
  })

  test('update', async () => {
    let doc = await router.post(`/${id}`, {
      content: '内容更新'
    })
    console.log(doc)
    doc = await router.get(`/${id}`)
    console.log(doc)
    expect(doc).toBeTruthy()
  })

  test('get event', async () => {
    $.on('before_get', async (opts) => {
      // 拦截数据处理
      opts.data.newfield = '拦截新增字段'
    }).on('get', async (opts, doc) => {
      return opts.data
    })
    let doc = await router.get(`/${id}`)
    console.log(doc)
    expect(doc).toBeTruthy()
  })

  test('delete', async () => {
    let doc = await router.delete(`/${id}`)
    console.log(doc)
    expect(doc).toBeTruthy()
  })
})
