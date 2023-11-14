const admin = require("../middleware/Admin");
const auth = require("../middleware/Auth");

module.exports = (router) => {
    router.use(require('./AuthRouter'));
    router.use(require('./GuestRouter'));
    router.use(require('./PaypalRouter'));
    router.use(auth, require('./TransactionsRouter'));
    router.use(auth, require('./UsersRouter'));
    router.use(auth, require('./DecksRouter'));
    router.use(auth, require('./SessionsRouter'));
     router.use(auth,require('./CouponRouter'));
    router.use(admin, require('./AdminRouter'));
};