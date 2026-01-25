require('dotenv').config()
const postgres = require('postgres')


if (!process.env.DATABASE_URL) {
    throw new Error('database is not set')
}


const connectionString = process.env.DATABASE_URL
const sql = postgres(connectionString, {
    ssl: 'require',
    max: 10
})

module.exports = sql