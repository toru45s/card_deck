const Router = require('koa-router');
const router = new Router();
const TransactionsController = require('../controllers/TransactionsController');

router.get('/getUserTransactions', TransactionsController.getUserTransactions);
router.get('/getLatestUserTransaction', TransactionsController.getLatestUserTransaction);
router.post('/startTransaction', TransactionsController.startTransaction);

module.exports = router.routes();
