const Sequelize = require('sequelize')
const Op = Sequelize.Op

let DB = function (opts = {}) {
  let o = {
    logging: false,
    pool: {
      max: 10,
      min: 0,
      idle: 30000
    },
    dialectOptions: {
      supportBigNumbers: true,
      bigNumberStrings: true
    },
    define: {
      charset: 'utf8mb4',
      dialectOptions: {
        collate: 'utf8mb4_unicode_ci'
      }
    },
    operatorsAliases: false
  }

  return new Sequelize(opts.db, o)
}

let sequelize = DB({db:'mysql://root:123@localhost/test'})
sequelize
  .sync()
  .then(() => {
    console.log('ready')
  })

const model = sequelize.define('topic', {
  title: {type: Sequelize.STRING},
  content: {type: Sequelize.STRING}
}, {
  tableName: 'topic',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'delTime'
})

module.exports = model


