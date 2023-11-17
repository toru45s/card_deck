const CouponsService = require('../services/CouponService');
const UserService = require('../services/UserService');
const DeckService = require('../services/DeckService');

class CouponController {
    
    /**
     * Return all coupons
     *
     * @param ctx
     * @returns {Promise<Object>}
     */

    static async getAllCoupons(ctx) {
       // console.log(ctx.request.query)
        let sortby = ctx.query.sortby ? ctx.query.sortby : 'created_at';
        let sorttype = ctx.query.sorttype ? ctx.query.sorttype : -1;
        console.log('getAllCoupons');
        const coupons = await CouponsService.getCoupons(sortby,sorttype);
        console.log('coupons',coupons);
        ctx.body = coupons;
    }


        /**
     * Return coupon by id
     *
     * @param ctx
     * @returns {Promise<Object>}
     */

    static async getCouponbyid(ctx) {
        const {id} = ctx.request.body;
        if(!id){
            const value ={
                status:0,
                message: 'Missing required fields',
            };
            ctx.body = value;
            return false;
            //ctx.throw(400, "Missing required fields");
        }
        const coupon = await CouponsService.getCouponbyid(id);
          const value = {
                status:1,
                message: 'Coupon found',
                data: coupon
            };
            ctx.body = value;
    }



        /**
     * Return add coupon
     *
     * @param ctx
     * @returns {Promise<Object>}
     */

    static async addCoupon(ctx) {
        console.log('addCoupon');
        const {code,codeName,reduction,number_of_coupons,expiry_date,status,deck_id,deck_name,start_date,code_type,subscription_length} = ctx.request.body;
       // console.log(ctx.request.body);
        if(!code || !codeName || !reduction || !expiry_date || !number_of_coupons || !status || !start_date || !code_type){
            const value ={
                status:0,
                message: 'Missing required fields',
            };
            ctx.body = value;
            return false;
            //
        }
        if (code_type != 'alldeck') {
            if (!deck_id || !deck_name) {
                const value ={
                    status:0,
                    message: 'Missing required fields',
                };
                ctx.body = value;
                return false;
                //ctx.throw(400, "Missing required fields");
        }
        }
        const couponduplicate = await CouponsService.getCouponbycode(code);
        if (couponduplicate) {
            const value ={
                status:0,
                message: 'Coupon already exists',
            };
            ctx.body = value;
            
        }else{
        const couponInstance = await CouponsService.addCoupon(code,codeName,reduction,number_of_coupons,expiry_date,status,deck_id,deck_name,start_date,code_type,subscription_length);
        const value ={
            status:1,
            message: 'Coupon added successfully',
            data: couponInstance
        };
        ctx.body = value;
        }
    }

            /**
     * Return use coupon by user
     *
     * @param ctx
     * @returns {Promise<Object>}
     */

    static async useCoupon(ctx) {
        console.log('useCoupon');
        const {code,user_id,deck_id,plan_type,code_type} = ctx.request.body;
        // console.log(ctx.request.body);
        
        if(!code || !user_id || !plan_type || !code_type){
            const value ={
                status:0,
                message: 'Missing required fields',
            };
            ctx.body = value;

           // ctx.throw(400, "Missing required fields");
        }
        if (code_type != 'alldeck') {
            if (!deck_id) {
                const value ={
                    status:0,
                    message: 'Missing required fields',
                };
                ctx.body = value;
                //ctx.throw(400, "Missing required fields");
        }
        }
      
        if(plan_type != 'yearly'){
            const value ={
                status:0,
                message: 'Coupon is only for yearly plan',
            };
            ctx.body = value;
            return false;
           // ctx.throw(400, "Coupon is only for yearly plan");
        }
        const couponInstance = await CouponsService.getCouponbycode(code);
        const couponCount = await CouponsService.getTransactionbycode(couponInstance._id)
        // console.log('fgyf',couponCount);
        if(couponInstance == null){
            const value ={
                status:0,
                message: 'Coupon not found',
            };
            ctx.body = value;
            return false;
            //ctx.throw(400, "Coupon not found");
        }
        if(couponInstance.status == 'inactive'){
            const value ={
                status:0,
                message: 'Coupon is inactive',
            };
            ctx.body = value;
            return false;
            //ctx.throw(400, "Coupon is inactive");
        }
        if(couponInstance.expiry_date < new Date()){
            const value ={
                status:0,
                message: 'Coupon is expired',
            };
            ctx.body = value;
            return false;
            //ctx.throw(400, "Coupon is expired");
        }
        if (couponInstance.start_date > new Date()) {
            const value ={
                status:0,
                message: 'invalid coupon',
            };
            ctx.body = value;
            return false;
           // ctx.throw(400, "Coupon is not active yet");
        }
        if(couponInstance.number_of_coupons <= couponCount){
            const value ={
                status:0,
                message: 'invalid coupon',
            };
            ctx.body = value;
            return false;
           // ctx.throw(400, "Coupon is expired");
        }
        //////////////////////////
        if (code_type == 'alldeck') {
        if (couponInstance.code_type != 'alldeck' && couponInstance.code == code) {
            const value ={
                status:0,
                message: 'Coupon is not for all decks',
            };
            ctx.body = value;
            return false;
           // ctx.throw(400, "Coupon is not for all decks");
        }
    }
        //console.log('Nsr checks', couponInstance);
        if (code_type == 'singledeck') {
        // console.log(couponInstance);
        if(couponInstance.deck_id != deck_id){
            const value ={
                status:0,
                message: 'Coupon is not for this deck.',
            };
            ctx.body = value;
            return false;
           // ctx.throw(400, "Coupon is not for this deck");
        }
        const theDeck = await DeckService.getDeckById(deck_id?.toString());
        if(!theDeck){
            const value ={
                status:0,
                message: 'Deck not found.',
            };
            ctx.body = value;
            return false;
           // ctx.throw(400, "Deck not found");
        }
      //  console.log(theDeck.price_year);
        const prasntageprice = (theDeck.price_year/100)*couponInstance.reduction;
        const finalprice = theDeck.price_year - prasntageprice;
        const value ={
            status:1,
            coupon_id: couponInstance.id,
            finalprice: finalprice.toFixed(2),
            percentage: couponInstance.reduction,
            subscription_length: couponInstance.subscription_length,

        };
        ctx.body = value;
    }
    else if(code_type == 'alldeck'){
        const prasntageprice = (79.9/100)*couponInstance.reduction;
        const finalprice = 79.9 - prasntageprice;
        const value ={
            status:1,
            coupon_id: couponInstance.id,
            finalprice: finalprice.toFixed(2),
            percentage: couponInstance.reduction,
            subscription_length: couponInstance.subscription_length,
        };
        ctx.body = value;
    }
    else{
        const value ={
            status:0,
            message: 'Coupon is not for all decks',
        };
        ctx.body = value;
    }
    }

                /**
     * Return edit coupon
     *
     * @param ctx
     * @returns {Promise<Object>}
     */

    static async editCoupon(ctx) {
        console.log('editCoupon123');
        const {id,code,codeName,reduction,number_of_coupons,expiry_date,status,deck_id,deck_name,start_date,code_type,subscription_length} = ctx.request.body;
        if(!id || !code || !code_type || !expiry_date || !reduction || !start_date || !status){
            const value ={
                status:0,
                message: 'Missing required fields',
            };
            ctx.body = value;
            return false;
              // ctx.throw(400, "Missing required fields");
        }
        if (code_type != 'alldeck') {
            if (!deck_id) {
                const value ={
                    status:0,
                    message: 'Missing required fields',
                };
                ctx.body = value;
                //ctx.throw(400, "Missing required fields");
        }
    }
       
        const couponInstance = await CouponsService.getCouponbyid(id);
        if(couponInstance == null){
            const value ={
                status:0,
                message: 'Coupon not found',
            };
            ctx.body = value;
            return false;
              // ctx.throw(400, "Coupon not found");
        }else
        if(couponInstance.code != code){
            const couponInstance1 = await CouponsService.getCouponbycode(code);
            if(couponInstance1 != null){
                const value ={
                    status:0,
                    message: 'Coupon code already exists',
                };
                ctx.body = value;
                return false;
            }
        }
                    // ctx.throw(400, "Coupon code already exists");
        const couponInstanceEdit = await CouponsService.editCoupon(id,code,codeName,reduction,number_of_coupons,expiry_date,status,deck_id,deck_name,start_date,code_type,subscription_length);
        const value ={
            status:1,
            message: 'Coupon updated successfully',
          
        };
        ctx.body = value;
    }
    

            /**
     * Return delete coupon
     *
     * @param ctx
     * @returns {Promise<Object>}
     */

    static async deleteCoupon(ctx) {
        console.log('deleteCoupon');
        const {code} = ctx.request.body;
        if(!code){
            const value ={
                status:0,
                message: 'Missing required fields',
            };
            ctx.body = value;
            return false;
           // ctx.throw(400, "Missing required fields");
        }
        const couponInstance = await CouponsService.getCouponbyid(code);
        if(couponInstance == null){
            const value ={
                status:0,
                message: 'Coupon not found',
            };
            ctx.body = value;
            return false;
           // ctx.throw(400, "Coupon not found");
        }
        const couponInstanceDelete = await CouponsService.deleteCoupon(code);
        const value ={
            status:1,
            message: 'Coupon deleted successfully',
            data: couponInstanceDelete
        };
        ctx.body = value;
    }

    }
    


module.exports = CouponController;