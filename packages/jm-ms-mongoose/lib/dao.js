const event = require('jm-event')

module.exports = function (model) {
  event.enableEvent(model, {
    force: true,
    async: true
  })

  /*
   opts
   {
   conditions:?,
   fileds:?,
   options:?,
   populations:?,
   }
   */
  model.findOne2 = async function (opts = {}) {
    const {conditions = {}, fields = null, populations = null, options = null, lean} = opts
    var q = this.findOne(conditions, fields, options)
    lean && q.lean()
    populations && q.populate(populations)
    return q
  }

  model.findById2 = async function (id, opts = {}) {
    opts.conditions = {_id: id}
    return this.findOne2(opts)
  }

  /*
   opts
   {
   page:?,
   rows:?,
   conditions:?,
   fileds:?,
   options:?,
   populations:?,
   }
   */

  model.find2 = async function (opts = {}) {
    let {conditions = {}, fields = null, populations = null, options = {}, page, rows, lean} = opts

    if (page || rows) {
      page || (page = 1)
      rows || (rows = 10)
      page = Number(page)
      rows = Number(rows)
      options.skip = (page - 1) * rows
      options.limit = rows

      const count = await model.countDocuments(conditions)
      let data = {
        page: page,
        total: count,
        pages: 0,
        rows: []
      }
      if (!count) {
        return data
      } else {
        const q = model.find(conditions, fields, options)
        lean && q.lean()
        populations && q.populate(populations)
        const doc = await q.exec()
        data.pages = Math.ceil(count / rows)
        data.rows = doc
        return data
      }
    } else {
      const q = model.find(conditions, fields, options)
      lean && q.lean()
      populations && q.populate(populations)
      return q
    }
  }

  return model
}
