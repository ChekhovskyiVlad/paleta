const bcrypt = require("bcrypt")
const sql = require("../../config/db")
const { signAcessToken, signRefreshToken, verifyRefreshToken, sha256 } = require("./tokens.service")
const { findUserByEmail, createUser } = require("./users.service")

function normalizeEmail(email) {
    return (email || "").trim().toLowerCase();
}

async function issueTokensForUser(userId) {
    // creating history of refresh tokens(temp)

    const tokenRow = await sql`
    insert into public.refresh_tokens(user_id,token_hash)
    values(${userId}, ${"temp"})
    returning id
    `;

    const tokenId = tokenRow[0].userId
    const refreshToken = signRefreshToken(userId, tokenId)
    const refreshHash = sha256(refreshToken)

    await sql`
    update publi.refresh_tokens
    set token_hash = ${refreshHash}
    where id = ${tokenId}
    `
    const acessToken = signAcessToken(userId)
    return { acessToken, refreshToken }
}


async function signUp({ email, password }) {
    const cleanEmail = normalizeEmail(email)
    if (!cleanEmail || !password) {
        const err = new Error("Missing fields")
        err.status = 400
        throw err;
    }
    if (password.lenght < 8) {
        const err = new Error("Password must be at least 8 symbols")
        err.status - 400
        throw err;
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await createUser(cleanEmail, passwordHash)

    const tokens = await issueTokensForUser(user.id)
    return { user: { id: user.id, email: user.email }, ...tokens }

}


async function login({ email, password }) {
    const cleanEmail = normalizeEmail(email)

    if (!cleanEmail || !password) {
        const err = new Error("missing failed")
        err.status = 400
        throw err
    }
    const user = await findUserByEmail(cleanEmail)
    if (!user) {
        const err = new Error("Invalid credentials")
        err.status = 401
        throw err
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
        const err = new Error("Invalid credentials")
        err.status = 401
        throw err
    }
    const tokens = await issueTokensForUser(user.id)
    return { user: { id: user.id, email: user.email }, ...tokens }
}



async function refresh({ refreshToken }) {
    if (!refreshToken) {
        const err = new Error("refreshToken required");
        err.status = 400;
        throw err;
    }

    let payload;
    try {
        payload = verifyRefreshToken(refreshToken); // { uid, tid }
    } catch {
        const err = new Error("Invalid refresh token");
        err.status = 401;
        throw err;
    }

    const refreshHash = sha256(refreshToken);

    const rows = await sql`
    select id, user_id, token_hash, revoked_at
    from public.refresh_tokens
    where id = ${payload.tid}
    limit 1
  `;
    const row = rows[0];
    if (!row || row.revoked_at || row.user_id !== payload.uid || row.token_hash !== refreshHash) {
        const err = new Error("Invalid refresh token");
        err.status = 401;
        throw err;
    }

    const accessToken = signAccessToken(payload.uid);
    return { accessToken };
}

async function logout({ refreshToken }) {
    if (!refreshToken) {
        const err = new Error("refreshToken required");
        err.status = 400;
        throw err;
    }

    let payload;
    try {
        payload = verifyRefreshToken(refreshToken);
    } catch {
        const err = new Error("Invalid refresh token");
        err.status = 401;
        throw err;
    }

    await sql`
    update public.refresh_tokens
    set revoked_at = now()
    where id = ${payload.tid} and user_id = ${payload.uid}
  `;

    return { ok: true };
}

module.exports = { signup, login, refresh, logout };