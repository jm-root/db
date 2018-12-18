const service = require('./model')
const $ = require('../lib')

service.router = $(service, {
  list: {
    fields: ['title', 'content']
  },
  get: {
    fields: null
  }
})
module.exports = service
