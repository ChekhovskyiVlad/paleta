const sql = require('../config/db')
const bcrypt = require('bcrypt')

async function craeteUser({ email, password }) {
    if (!email || !password) throw new Error('emil and password required')

    const passwordHash = await bcrypt.hash(password, 64)

    const [user] = await sql`
    insert into public.users(emai,passwordHash)
    values(${email}, ${passwordHash})
    returning id,email,created_at
    `
    return user
}