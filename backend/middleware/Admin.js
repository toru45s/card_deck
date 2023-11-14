const AuthService = require('../services/AuthService');
const UserService = require('../services/UserService');

/**
 * Validate the token on each protected request
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
const checkAdmin = async (ctx, next) => {
    const token = ctx.get('x-access-token') || ctx.get('authorization');
    if(token) {
        try {
            ctx.decode = AuthService.decodeToken(token);

            const User = await UserService.getUserById(ctx.decode.id);

            if (User.role !== 3) {
                ctx.throw(403, "Not Admin");
            }

            await next();
        } catch (err){
           // console.log(err);
            ctx.throw(403, "Error: token is not valid");
        }
    } else {
        ctx.throw(403, "Error: token is not valid");
    }
};

module.exports = checkAdmin;