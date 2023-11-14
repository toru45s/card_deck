const Router = require('koa-router');
const router = new Router();
const PaypalController = require('../controllers/PaypalController');

router.post('/paypal', PaypalController.webhooks);

module.exports = router.routes();