const TransactionModel = require('../models/Transaction');
const UserModel = require('../models/User');
const mongoose = require('mongoose');

class InfoService {

    static async getMaxConcurrentConnections() {
        return 79;
    }

    static async getMonthlyRevenue() {
        const mongoSucks = await TransactionModel.find({ status: 1 }); //aggregation with $gte/$lte no longer works, mongo is pathetic
        return mongoSucks
            .filter(transaction => new Date(transaction.created_at).getTime() >= new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime())
            .reduce((acc, transaction) => acc + transaction.price, 0);
    }

    static async sendUserNotification(role, messages) {
        const Users = await UserModel.find({ role: role });

        if (!Users.length) {
            return false;
        }

        Users.forEach(function(User){
           User.message = messages["message_"+User.language];
           User.save();
        });

        return true;
    }

    static async removeUserNotification(User) {
        User.message = '';

        return User.save();
    }

}

module.exports = InfoService;
