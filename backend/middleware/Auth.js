const AuthService = require('../services/AuthService');

/**
 * Validate the token on each protected request
 *
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
const checkToken = async (ctx, next) => {
    const token = ctx.get('x-access-token') || ctx.get('authorization');
   // console.log("token",token); 
    if(token) {
        try {
            ctx.decode = AuthService.decodeToken(token);

            await next();
        } catch (err){
            console.log(err);
            ctx.throw(403, "Error: token is not valid");
        }
    } else {
        ctx.throw(403, "Error: token is not valid");
    }
};

module.exports = checkToken;