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
    let lean = opts.lean || optsList.lean || null
    let ext = opts.ext || optsList.ext || null
    let plain = true
    optsList.plain === false && (plain = false)
    opts.plain === false && (plain = false)
    let distinct = opts.distinct || optsList.distinct || null
    let transaction = opts.transaction

    let o = {
      where: conditions,
      include: include,
      order: order
    }
    lean && (o.raw = true)
    fields && (o.attributes = fields)
    transaction && (o.transaction = transaction)
    distinct && (o.distinct = distinct)

    ext && (Object.assign(o, ext))

    let error
    try {
      if (page || rows) {
        page = Number(page) || 1
        rows = Number(rows) || 10
        o.offset = (page - 1) * rows
        o.limit = rows
        doc = await dao.findAndCountAll(o)
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
    } catch (e) {
      console.log(e)
      error = e
      doc = e
    }

    if (plain !== false && doc.rows) {
      let rows = []
      doc.rows.forEach(item => {
        rows.push(item.get({plain: true}))
      })
      doc.rows = rows
    }
    let ret = doc
    doc = await dao.emit('list', opts, doc)
    if (doc !== undefined) return doc
    if (error) throw error
    if (ret) return ret
  }

  const get = async function (opts) {
    let doc = await dao.emit('before_get', opts)
    if (doc !== undefined) return doc

    let id = opts.params.id
    let optsGet = _.cloneDeep(routes.opts.get)
    let conditions = opts.conditions || optsGet.conditions || {}
    let include = opts.include || optsGet.include || null
    let order = opts.order || optsGet.order || null
    let fields = opts.fields || optsGet.fields || null
    let lean = opts.lean || optsGet.lean || null
    let ext = opts.ext || optsGet.ext || null
    let plain = true
    optsGet.plain === false && (plain = false)
    opts.plain === false && (plain = false)
    let transaction = opts.transaction

    conditions = {id, ...conditions}

    let o = {
      where: conditions,
      include: include,
      order: order
    }
    lean && (o.raw = true)
    fields && (o.attributes = fields)
    transaction && (o.transaction = transaction)

    ext && (Object.assign(o, ext))

    let error
    try {
      doc = await dao.findOne(o)
    } catch (e) {
      console.log(e)
      error = e
      doc = e
    }

    if (plain !== false && doc) doc = doc.get({plain: true})
    let ret = doc
    doc = await dao.emit('get', opts, doc)
    if (doc !== undefined) return doc
    if (error) throw error
    if (ret) return ret
  }

  const create = async function (opts) {
    let doc = await dao.emit('before_create', opts)
    if (doc !== undefined) return doc

    let transaction = opts.transaction

    let data = opts.data
    let error
    try {
      doc = await dao.create(data, {transaction})
    } catch (e) {
      error = e
      doc = e
    }

    let ret = doc
    doc = await dao.emit('create', opts, doc)
    if (doc !== undefined) return doc
    if (error) throw error

    if (ret) {
      let plain = true
      opts.plain === false && (plain = false)
      plain && (ret = ret.get({plain: true}))
      return ret
    }
  }

  const update = async function (opts) {
    let doc = await dao.emit('before_update', opts)
    if (doc !== undefined) return doc

    let transaction = opts.transaction

    let id = opts.params.id
    let data = opts.data
    let error
    try {
      doc = await dao.update(data, {where: {id: id}, transaction})
    } catch (e) {
      console.log(e)
      error = e
      doc = e
    }

    let ret = doc
    doc = await dao.emit('update', opts, doc)
    if (doc !== undefined) return doc
    if (error) throw error
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

    let error
    try {
      doc = await dao.destroy({where: {id: {[Op.in]: id}}, transaction})
    } catch (e) {
      console.log(e)
      error = e
      doc = e
    }

    let ret = doc
    doc = await dao.emit('remove', opts, doc)
    if (doc !== undefined) return doc
    if (error) throw error
    if (ret !== undefined) return {ret: ret}
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
