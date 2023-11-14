const UserService = require('../services/UserService');
const SessionService = require('../services/SessionService');

class SessionsController {

    static async getSessions(ctx) {
        const userId = ctx.decode.id;
        const User = await UserService.getUserById(userId);
        const sessions = await SessionService.getUserSessions(User);

        ctx.body = sessions;
    }

    /**
     * Get the session
     * @param ctx
     * @returns {Promise<void>}
     */
    static async sessionLoad(ctx) {
        const userId = ctx.decode.id;
        const User = await UserService.getUserById(userId);

        ctx.body = await SessionService.loadSession(User, ctx.request.body.id);
    }

    /**
     * Save the session
     * @param ctx
     * @returns {Promise<void>}
     */
    static async sessionSave(ctx) {
        const userId = ctx.decode.id;
        const User = await UserService.getUserById(userId);

        ctx.body = await SessionService.saveSession(User, ctx.request.body.clientName, ctx.request.body.name, ctx.request.body.decks);
    }

}

module.exports = SessionsController;
