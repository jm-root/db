const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schemaDefine = {
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
  crtime: {type: Date, default: Date.now},
  ext: Schema.Types.Mixed
}

const schema = new Schema(schemaDefine)
const dbUri = 'mongodb://localhost/test'
mongoose.connect(dbUri, {useNewUrlParser: true})
const model = mongoose.model('product', schema)

module.exports = model
