const Router = require('koa-router');
const router = new Router();
const PaypalController = require('../controllers/PaypalController');

router.post('/paypal', PaypalController.webhooks);
router.post('/freeTransaction', PaypalController.freeTransaction);

module.exports = router.routes();