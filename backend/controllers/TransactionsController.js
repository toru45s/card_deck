const TransactionService = require('../services/TransactionService');
const UserService = require('../services/UserService');

class TransactionsController {

    /**
     * Initiate a transaction
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async startTransaction(ctx) {
        const userId = ctx.decode.id;
        const productId = ctx.request.body.product_id;
        const planId = ctx.request.body.plan_id;
        const subscriptionId = ctx.request.body.subscription_id;
        const price = ctx.request.body.price;
        const interval = ctx.request.body.interval;
        const couponId = ctx.request.body.coupon_id?ctx.request.body.coupon_id:null;
        const User = await UserService.getUserById(userId);

       // console.log('startTransaction', ctx.request.body);

        ctx.body = await TransactionService.initiateTransaction(User, productId, planId, subscriptionId, price, interval,couponId);
    }

    static async getUserTransactions(ctx) {
        const userId = ctx.decode.id;

        ctx.body = await TransactionService.getUserTransactions(userId);
    }

    static async getLatestUserTransaction(ctx) {
        const userId = ctx.decode.id;

        ctx.body = await TransactionService.getLatestUserTransaction(userId);
    }

}

module.exports = TransactionsController;
