const TransactionModel = require('../models/Transaction');
const UserService = require('../services/UserService');
const DeckService = require('../services/DeckService');
const mongoose = require('mongoose');

class TransactionService {

    static async initiateTransaction(User, productId, planId, subscriptionId, price, interval, couponId) {
        const ObjectId = mongoose.Types.ObjectId;
        const transactionInstance = new TransactionModel({
            user_id: User._id,
            price: price,
            product_id: productId,
            plan_id: planId,
            subscription_id: subscriptionId,
            status: 0,
            interval: interval,
            coupon_id: ObjectId (couponId),
            coupon_status: couponId?'pending': null
        });

        await transactionInstance.save();

        return transactionInstance;
    }

    static async getUserTransactions(userId) {
        return await TransactionModel.find({user_id: userId, status: 1});
    }

    static async getLatestUserTransaction(userId) {
        const latestTransaction = await TransactionModel.find({user_id: userId});
        return latestTransaction[0] || {};
    }

    static async subscribe(subscriptionId) {
        const Transaction = await TransactionModel.findOne({ subscription_id: subscriptionId });

        if (!Transaction) {
            console.log(`Transaction for subscription ${subscriptionId} not found`);
            return null;
        }

        Transaction.status = 1;
        Transaction.save();

        return Transaction;
    }

    static async changeTransactionCoupon(subscriptionId, status) {
        const Transaction = await TransactionModel.findOne({ subscription_id: subscriptionId });
        Transaction.coupon_status = status;
        Transaction.save();
        return Transaction;
    }

    static async unsubscribe(subscriptionId) {
        const Transaction = await TransactionModel.findOne({ subscription_id: subscriptionId });

        Transaction.status = 0;
        Transaction.save();

        return Transaction;
    }

    static async findTransactionBySubscriptionId(subscriptionId) {
        return await TransactionModel.findOne({ subscription_id: subscriptionId });
    }

    static async isUserSubscribedToDeck(userId, deckId) {
        const Transaction = await TransactionModel.findOne({ user_id: userId, product_id: deckId, status: 1 });

        return (Transaction) ? Transaction.subscription_id : false;
    }

    static async recurringPayment(subscriptionId, date) {
        const ObjectID = require('mongodb').ObjectID;
        const Transaction = await TransactionModel.findOne({ subscription_id: subscriptionId });

        if (!Transaction) { return false; }

        const User = await UserService.getUserById(new ObjectID(Transaction.user_id));
        if (User && User.role === 1) {
            User.role = 2; // elevate to the Paid role if the user is still Trial
            await User.save();
        }

        // enable the purchased deck for the user
        const transactionDate = new Date(date);
        if (Transaction.product_id === "all") {
            User.fullSubscription = transactionDate.setFullYear(transactionDate.getFullYear() + 1);
            User.save();
        } else {
            const deckIndex = User.decks.findIndex(x => x._id == Transaction.product_id);
            const paidUntil = (Transaction.interval === 'YEAR') ? transactionDate.setFullYear(transactionDate.getFullYear() + 1) : transactionDate.setMonth(transactionDate.getMonth() + 1);

            if (deckIndex >= 0) {
                User.decks[deckIndex].subscribedUntil = paidUntil;
                User.markModified('decks');

                await User.save();
            } else {
                const Deck = await DeckService.getDeckById(new ObjectID(Transaction.product_id));
                Deck.subscribedUntil = paidUntil;

                await DeckService.addDeck(User, Deck);
            }
        }

        return User;

    }

}

module.exports = TransactionService;
