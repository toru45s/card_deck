const CouponModel = require('../models/Coupons');
const TransactionModel = require('../models/Transaction');
const mongoose = require('mongoose');

class CouponService {

    static async getCoupons(sortby,sorttype){
        let sort = {};
        const key =sortby;
        const value = parseInt(sorttype);
        sort[key] = value;
        const Coupons = await CouponModel.aggregate([
            {
                $lookup: {
                  from:'transactions', // collection name in db,
                  let: { "coupon_id": "_id" },
                  pipeline: [
                    { $match: { status: 1 } }
                  ],
                  as: 'transactions'
                }
            },
            {
                $sort:sort,
            },
        ])
        return Coupons;
    }
    //get coupon by code
    static async getCouponbycode(code){
        return await CouponModel.findOne({ code: code });
    }

    static async getTransactionbycode(coupon_id){
        return await TransactionModel.countDocuments({ coupon_id: coupon_id, coupon_status: 'applied' })
    }
    //get coupon by id
    static async getCouponbyid(id){
        const CouponInstance = await CouponModel.findOne({ _id: id });
        return CouponInstance;
    }
    //add coupon
    static async addCoupon(code,codeName,reduction,number_of_coupons,expiry_date,status,deck_id,deck_name,start_date,code_type){
        const exdateNow = new Date(`${expiry_date}`);
        const stdateNow = new Date(`${start_date}`);

        const Coupons = new CouponModel({
            code: code,
            codeName: codeName,
            reduction: reduction,
            used_count:0,
            number_of_coupons: number_of_coupons,
            expiry_date: exdateNow,
            status: status,
            deck_id: deck_id,
            deck_name: deck_name,
            start_date: stdateNow,
            code_type: code_type
        });
        const CouponInstance = await Coupons.save().then((result) => {
            return result;
        }).catch((err) => {
            console.log(err);
        });

        return CouponInstance;
    }

    // edit coupon
    static async editCoupon(id,code,codeName,reduction,number_of_coupons,expiry_date,status,deck_id,deck_name,start_date,code_type){

        const exdateNow = new Date(`${expiry_date}`);
        const stdateNow = new Date(`${start_date}`);
        const Coupons ={
            code: code,
            codeName: codeName,
            reduction: reduction,
            used_count:0,
            number_of_coupons: number_of_coupons,
            expiry_date: exdateNow,
            status: status,
            deck_id: deck_id,
            deck_name: deck_name,
            start_date: stdateNow,
            code_type: code_type
        };
        const CouponInstance = await CouponModel.updateOne({
            _id: id
        },{$set: Coupons}).then((result) => {
            return result;
        }).catch((err) => {
            console.log(err,"123");
        });
    }
    //delete coupon
    static async deleteCoupon(id){
        const Coupons = await CouponModel.findByIdAndDelete(id);
        return Coupons;
    }
    
}

module.exports = CouponService;
