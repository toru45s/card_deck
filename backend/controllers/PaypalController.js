// const { default: def } = require('ajv/dist/vocabularies/applicator/additionalItems');
const TransactionService = require('../services/TransactionService');
const UserService = require('../services/UserService');
const axios = require('axios');

class PaypalController {

    /**
     * Listen on webhooks
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async webhooks(ctx) {
        const event = ctx.request.body;
        // console.log(event.event_type);
        switch (event.event_type) {

            case 'BILLING.SUBSCRIPTION.ACTIVATED':
                await TransactionService.subscribe(event.resource.id);
            break;

            case 'BILLING.SUBSCRIPTION.CANCELLED':
                await TransactionService.unsubscribe(event.resource.id);
                break;
            case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
            case 'BILLING.SUBSCRIPTION.SUSPENDED':
                const transaction = await TransactionService.findTransactionBySubscriptionId(event.resource.id);
                const User = await UserService.getUserById(transaction.user_id);
                if (transaction.coupon_id) {
                    await TransactionService.changeTransactionCoupon(event.resource.id, 'failed')
                }
                axios.post('https://events.sendpulse.com/events/id/9b86fcacf3b14859fd3ca68c00b13988/7504019', {
                        "email": User.email,
                        "phone": "+123456789",
                        "language": User.language,
                        "name": User.username
                    });
                break;

            case 'PAYMENT.SALE.COMPLETED':
                if (event.resource.state === 'completed') {
                    const subscriptionId = event.resource.billing_agreement_id;
                    const transactionDate = event.resource.create_time;
                
                    await TransactionService.recurringPayment(subscriptionId, transactionDate);
                    
                    const transaction = await TransactionService.findTransactionBySubscriptionId(subscriptionId);
                    if (transaction?.coupon_id) {
                        await TransactionService.changeTransactionCoupon(subscriptionId, 'applied');
                    }
                }
            break;

            default:
                console.log('Webhook received and not processed with type ' + event.event_type);
                break;

        }

        ctx.body = {success: true};
    }

}

module.exports = PaypalController;
