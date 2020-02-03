const mongoose = require('mongoose')
const dbUri = 'mongodb://root:123@localhost/test?authSource=admin'
mongoose.connect(dbUri, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})

const service = require('../lib')()

module.exports = service
