function requireUser(req,res,next){

    if(!req.session.user){
        return 401
    }

    const users = readUsers()

    const user = users.find(
        u => u.username === req.session.user.username
    )

    if(!user){
        return error
    }

    req.user = user

    next()
}

function requireAdmin(req,res,next){

    if(req.user.role !== "admin"){

        return 403
    }

    next()
}


module.exports = {
    requireUser,
    requireAdmin
}