const jwt = require('jsonwebtoken')
const crypto = require('crypto')

function signAcessToken(userId) {
    return jwt.sign({ uid: userId }, process.env.JWT_ACESS_SECRET, {
        expiresIn: process.env.ACESS_TTL || "15m"
    })
}

function signRefreshToken(userId, tokenId) {
    return jwt.sign({ uid: userId, tid: tokenId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.REFRESH_TTL || "30d",
    })
}

function verifyAcessToken(token) {
    return jwt.verify(token, process.env.JWT_ACESS_SECRET)
}

function verifyRefreshToken(token) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET)
}

function sha256(str) {
    return crypto.createHash("sha256").update(str).digest("hex")
}


module.exports = {
    signAcessToken,
    signRefreshToken,
    verifyAcessToken,
    verifyRefreshToken,
    sha256
}