const mongoose = require('mongoose')

const Schema = mongoose.Schema

const schemaDefine = {
  name: { type: String, unique: true, sparse: true, index: true },
  value: { type: Number, default: 0 }
}
const defaultSchema = new Schema(schemaDefine)

module.exports = function (opts = {}) {
  const {
    schema = defaultSchema,
    modelName = 'sequence'
  } = opts

  const model = mongoose.model(modelName, schema)

  async function next (name, { inc = 1 } = {}) {
    const doc = await model.findOneAndUpdate({ name }, { $inc: { value: inc } }, { new: true, upsert: true })
    return doc.value
  }

  async function reset (name, { value = 0 } = {}) {
    const doc = await model.findOneAndUpdate({ name }, { value }, { new: true, upsert: true })
    return doc.value
  }

  Object.assign(model, { next, reset })

  return model
}
