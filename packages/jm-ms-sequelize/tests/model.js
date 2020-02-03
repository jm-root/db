const Sequelize = require('sequelize')

let DB = function (opts = {}) {
  let o = {
    logging: false,
    pool: {
      max: 10,
      min: 0,
      idle: 30000
    },
    dialectOptions: {
      supportBigNumbers: true
    },
    define: {
      charset: 'utf8mb4',
      dialectOptions: {
        collate: 'utf8mb4_unicode_ci'
      }
    }
  }

  return new Sequelize(opts.db, o)
}

let sequelize = DB({ db: 'mysql://root:123@localhost/test' })
let Query = sequelize.dialect.Query
Query.prototype.__formatError__ = Query.prototype.formatError
Query.prototype.formatError = function (err) {
  try {
    return this.__formatError__(err)
  } catch (e) {
    return err
  }
}
sequelize
  .sync()
  .then(() => {
    console.log('ready')
  })

const model = sequelize.define('topic', {
  title: { type: Sequelize.STRING, allowNull: false, unique: true },
  content: { type: Sequelize.STRING }
}, {
  tableName: 'topic',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'delTime'
})

module.exports = model
