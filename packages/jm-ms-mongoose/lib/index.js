const _ = require('lodash')
const event = require('jm-event')
const MS = require('jm-ms-core')
const ms = new MS()

module.exports = function (dao, opts = {}) {
  let router = ms.router(opts)
  event.enableEvent(dao, {
    force: true,
    async: true
  })

  opts.list || (opts.list = {})
  opts.get || (opts.get = {})

  dao.routes || (dao.routes = {})
  let routes = dao.routes

  routes.opts = opts

  const list = async function (opts) {
    let doc = await dao.emit('before_list', opts)
    if (doc !== undefined) return doc

    let optsList = _.cloneDeep(routes.opts.list)
    let populations = opts.populations || optsList.populations || null
    let page = opts.data.page
    let rows = opts.data.rows
    let conditions = opts.conditions || optsList.conditions || null
    let options = opts.options || optsList.options || {}
    let fields = opts.fields || optsList.fields || null
    let sidx = opts.data.sidx
    let sord = opts.data.sord
    let lean = true
    if (opts.lean === false) {
      lean = false
    } else if (optsList.lean === false) {
      lean = false
    }
    if (sidx) {
      options.sort = []
      let o = {}
      o[sidx] = -1
      if (sord === 'asc') {
        o[sidx] = 1
      }
      options.sort.push(o)
    }

    doc = await dao.find2({
      populations: populations,
      conditions: conditions,
      fields: fields,
      options: options,
      lean: lean,
      page: page,
      rows: rows
    })
    if (page || rows) {
    } else {
      doc = {rows: doc}
    }

    let ret = doc
    doc = await dao.emit('list', opts, doc)
    if (doc !== undefined) return doc
    if (ret) return ret
  }

  const get = async function (opts) {
    let doc = await dao.emit('before_get', opts)
    if (doc !== undefined) return doc

    let id = opts.params.id
    let optsGet = _.cloneDeep(routes.opts.get)
    let populations = opts.populations || optsGet.populations || null
    let options = opts.options || optsGet.options || {}
    let fields = opts.fields || optsGet.fields || null
    let lean = true
    if (opts.lean === false) {
      lean = false
    } else if (optsGet.lean === false) {
      lean = false
    }
    doc = await dao.findById2(
      id,
      {
        populations: populations,
        fields: fields,
        options: options,
        lean: lean
      }
    )

    let ret = doc
    doc = await dao.emit('get', opts, doc)
    if (doc !== undefined) return doc
    if (ret) return ret
  }

  const create = async function (opts) {
    let doc = await dao.emit('before_create', opts)
    if (doc !== undefined) return doc

    let data = opts.data
    doc = await dao.create(data)

    let ret = doc
    doc = await dao.emit('create', opts, doc)
    if (doc !== undefined) return doc
    if (ret) return ret
  }

  const update = async function (opts) {
    let doc = await dao.emit('before_update', opts)
    if (doc !== undefined) return doc

    let id = opts.params.id
    let data = opts.data
    doc = await dao.update({_id: id}, data)

    let ret = doc
    doc = await dao.emit('update', opts, doc)
    if (doc !== undefined) return doc
    doc = ret
    if (doc) {
      if (doc.ok) doc = {ret: doc.n, modified: doc.nModified}
      return doc
    }
  }

  const remove = async function (opts) {
    let doc = await dao.emit('before_remove', opts)
    if (doc !== undefined) return doc

    let id = opts.params.id || opts.data.id
    if (id instanceof Array) {
    } else {
      id = id.split(',')
    }
    doc = await dao.remove({_id: {$in: id}})

    let ret = doc
    doc = await dao.emit('remove', opts, doc)
    if (doc !== undefined) return doc
    doc = ret
    if (doc) {
      if (doc.result && doc.result.ok) doc = {ret: doc.result.n}
      return doc
    }
  }

  router.use(opts => {
    opts.data || (opts.data = {})
  })

  if (opts.enable_router_save) {
    let save = async function (opts) {
      let data = opts.data
      if (data._id) {
        opts.params.id = data._id
        delete data['_id']
      }

      let doc = null
      if (opts.params.id) {
        doc = await update(opts)
      } else {
        doc = await create(opts)
      }
      if (doc) return doc
    }
    router.post('/save', save)
  }

  router
    .add('/', 'get', list)
    .add('/', 'put', create)
    .add('/', 'post', create)
    .add('/', 'delete', remove)
    .add('/:id', 'get', get)
    .add('/:id', 'post', update)
    .add('/:id', 'put', update)
    .add('/:id', 'delete', remove)

  return router
}
