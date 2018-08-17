const service = require('./model')
const $ = require('../lib')

service.router = $(service, {
  list: {
    fields: {
      title: 1
    }
  },
  get: {
    fields: {
      title: 1,
      tags: 1
    }
  }
})
module.exports = service
