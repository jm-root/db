const _ = require('lodash')
const MS = require('jm-ms-core')
const dao = require('./dao')
const ms = new MS()

module.exports = function (model, opts = {}) {
  dao(model)
  let router = ms.router(opts)

  opts.list || (opts.list = {})
  opts.get || (opts.get = {})

  const defaultOpts = opts

  const list = async function (opts = {}) {
    let doc = await model.emit('before_list', opts)
    if (doc !== undefined) return doc

    let optsList = _.cloneDeep(defaultOpts.list)
    let {
      conditions = optsList.conditions || null,
      populations = optsList.populations || null,
      options = optsList.options || {},
      fields = optsList.fields || null,
      data: { page, rows, sorter },
      lean = true
    } = opts

    sorter && (options.sort = sorter.replace(',', ' '))
    doc = await model.find2({
      populations,
      conditions,
      fields,
      options,
      lean,
      page,
      rows
    })
    if (page || rows) {
    } else {
      doc = { rows: doc }
    }

    let ret = doc
    doc = await model.emit('list', opts, doc)
    if (doc !== undefined) return doc
    if (ret) return ret
  }

  const get = async function (opts = {}) {
    let doc = await model.emit('before_get', opts)
    if (doc !== undefined) return doc

    let { id } = opts.params
    let optsGet = _.cloneDeep(defaultOpts.get)
    let {
      populations = optsGet.populations || null,
      options = optsGet.options || {},
      fields = optsGet.fields || null,
      lean = true
    } = opts

    doc = await model.findById2(
      id,
      {
        populations,
        fields,
        options,
        lean
      }
    )

    let ret = doc
    doc = await model.emit('get', opts, doc)
    if (doc !== undefined) return doc
    if (ret) return ret
  }

  const create = async function (opts) {
    let doc = await model.emit('before_create', opts)
    if (doc !== undefined) return doc

    let data = opts.data
    doc = await model.create(data)

    let ret = doc
    doc = await model.emit('create', opts, doc)
    if (doc !== undefined) return doc
    if (ret) return ret
  }

  const update = async function (opts) {
    let doc = await model.emit('before_update', opts)
    if (doc !== undefined) return doc

    let id = opts.params.id
    let data = opts.data
    doc = await model.updateOne({ _id: id }, data)

    let ret = doc
    doc = await model.emit('update', opts, doc)
    if (doc !== undefined) return doc
    doc = ret
    if (doc) {
      if (doc.ok) doc = { ret: doc.n, modified: doc.nModified }
      return doc
    }
  }

  const remove = async function (opts) {
    let doc = await model.emit('before_remove', opts)
    if (doc !== undefined) return doc

    let id = opts.params.id || opts.data.id
    if (id instanceof Array) {
    } else {
      id = id.split(',')
    }
    doc = await model.deleteMany({ _id: { $in: id } })

    let ret = doc
    doc = await model.emit('remove', opts, doc)
    if (doc !== undefined) return doc
    doc = ret
    if (doc) {
      if (doc.result && doc.result.ok) doc = { ret: doc.result.n }
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
