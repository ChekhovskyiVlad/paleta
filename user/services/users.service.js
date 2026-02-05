const sql = require("../../config/db")


async function findUserByEmail(email) {
    const rows = await sql`
    select id, email,password_hash
    from public.users
    where email = ${email}
    limit 1
    `
    return rows[0] || null
}

async function createUser(email, password_hash) {
    const rows = await sql`
    insert into public.users(email,password_hash)
    values(${email},${password_hash})
    returning id,email,created_at
    `
    return rows[0]
}


module.exports = {
    findUserByEmail,
    createUser
}
