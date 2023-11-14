const UserService = require('../services/UserService');
const AuthService = require('../services/AuthService');

class GuestController {

    /**
     * Return currently authenticated user
     *
     * @param ctx
     * @returns {Promise<Object>}
     */
    static async getUser(ctx) {
        const inviteCode = ctx.params.id;
        const User = await UserService.getHost(inviteCode);
        if (!User) return false;
        const token = await AuthService.getToken(User._id);
        ctx.body = {
            _id: User._id,
            email: User.email,
            username: User.username,
            decks: User.decks,
            message: "",
            token: token,
            eula: User.eula,
            role: User.role,
            backgrounds: User.backgrounds,
            tutorial: User.tutorial,
            inviteCode: User.inviteCode,
            guest: true,
            multipleAllowed: User.multipleAllowed
        };
    }

}

module.exports = GuestController;
