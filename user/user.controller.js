const service = require('./user.service')

async function createUser(req, res, next) {
    try {
        const user = await service.createUser(req.body)
        res.status(201).json(user)
    } catch (e) {
        next(e)
    }
}


module.exports = createUser