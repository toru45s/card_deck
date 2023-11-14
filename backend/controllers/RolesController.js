
class RolesController {

    /**
     * Return roles
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async getRoles(ctx) {
        const filter = JSON.parse(ctx.query.filter);
        const offset = 0;
        const limit = 1000;
        const roles = [
            {
                _id: 1,
                name: 'trial'
            },
            {
                _id: 2,
                name: 'paid'
            },
            {
                _id: 3,
                name: 'admin'
            }
        ];

        ctx.set('Content-Range', 'roles ' + offset + '-' + limit + '/' + roles.length);
        ctx.body = roles;
    }

}

module.exports = RolesController;