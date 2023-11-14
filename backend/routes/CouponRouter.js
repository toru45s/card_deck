const Router = require('koa-router');
const router = new Router();
const CouponController = require('../controllers/CouponController');

router.get('/getAllCoupon',CouponController.getAllCoupons);
router.post('/addCoupon',CouponController.addCoupon);
router.post('/useCoupon',CouponController.useCoupon);
router.post('/deleteCoupon',CouponController.deleteCoupon);
router.post('/editCoupon',CouponController.editCoupon);
router.post('/getCouponbyid',CouponController.getCouponbyid);


module.exports = router.routes();