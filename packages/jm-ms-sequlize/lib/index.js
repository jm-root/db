const Sequelize = require('sequelize')
const Op = Sequelize.Op
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
    let page = opts.data.page
    let rows = opts.data.rows
    let conditions = opts.conditions || optsList.conditions || null
    let include = opts.include || optsList.include || null
    let order = opts.order || optsList.order || null
    let fields = opts.fields || optsList.fields || null
    let transaction = opts.transaction
    let lean = true
    if (opts.lean === false) {
      lean = false
    } else if (optsList.lean === false) {
      lean = false
    }

    let o = {
      where: conditions,
      include: include,
      order: order,
      raw: lean
    }

    fields && (o.attributes = fields)
    transaction && (o.transaction = transaction)

    if (page || rows) {
      let page = Number(opts.page) || 1
      let rows = Number(opts.rows) || 10
      o.offset = (page - 1) * rows
      o.limit = rows
      doc = await dao.findAndCount(o)
      let total = doc.count
      let pages = Math.ceil(total / rows)
      doc = {
        page: page,
        pages: pages,
        total: total,
        rows: doc.rows
      }
    } else {
      doc = await dao.findAll(o)
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
    let conditions = opts.conditions || optsGet.conditions || null
    let include = opts.include || optsGet.include || null
    let order = opts.order || optsGet.order || null
    let fields = opts.fields || optsGet.fields || null
    let transaction = opts.transaction
    let lean = true
    if (opts.lean === false) {
      lean = false
    } else if (optsGet.lean === false) {
      lean = false
    }

    doc = await dao.findById(id, {
      where: conditions,
      attributes: fields,
      include: include,
      order: order,
      raw: lean,
      transaction: transaction
    })

    let ret = doc
    doc = await dao.emit('get', opts, doc)
    if (doc !== undefined) return doc
    if (ret) return ret
  }

  const create = async function (opts) {
    let doc = await dao.emit('before_create', opts)
    if (doc !== undefined) return doc

    let transaction = opts.transaction

    let data = opts.data
    doc = await dao.create(data, {transaction})

    let ret = doc
    doc = await dao.emit('create', opts, doc)
    if (doc !== undefined) return doc
    if (ret) return ret
  }

  const update = async function (opts) {
    let doc = await dao.emit('before_update', opts)
    if (doc !== undefined) return doc

    let transaction = opts.transaction

    let id = opts.params.id
    let data = opts.data
    doc = await dao.update(data, {where: {id: id}, transaction})

    let ret = doc
    doc = await dao.emit('update', opts, doc)
    if (doc !== undefined) return doc
    if (ret) return {ret: ret[0]}
  }

  const remove = async function (opts) {
    let doc = await dao.emit('before_remove', opts)
    if (doc !== undefined) return doc

    let transaction = opts.transaction

    let id = opts.params.id || opts.data.id
    if (id instanceof Array) {
    } else {
      id = id.split(',')
    }
    doc = await dao.destroy({where: {id: {[Op.in]: id}}, transaction})

    let ret = doc
    doc = await dao.emit('remove', opts, doc)
    if (doc !== undefined) return doc
    if (ret) return {ret: ret}
  }

  router.use(opts => {
    opts.data || (opts.data = {})
  })

  if (opts.enable_router_save) {
    let save = async function (opts) {
      let data = opts.data
      if (data.id) {
        opts.params.id = data.id
        delete data['id']
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
