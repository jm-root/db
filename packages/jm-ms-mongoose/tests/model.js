const jm = require('jm-dao')
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var schemaDefine = {
  title: {type: String},
  content: {type: String},
  tags: [{type: String}],
  orderOptions: [{ // 附加订单选项
    name: String, // 选项名称
    options: [{
      name: String,
      price: {type: Number, default: 0},
      isDefault: {type: Boolean, default: false}
    }]
  }],
  isHtml: {type: Boolean, default: false},
  crtime: {type: Date},
  ext: Schema.Types.Mixed
}

var schema = new Schema(schemaDefine)
var dbUri = 'mongodb://localhost/test'
jm.db.connect(dbUri)

var model = jm.dao(
  {
    modelName: 'product',
    schema: schema
  }
)

module.exports = model
