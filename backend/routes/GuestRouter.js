const Router = require('koa-router');
const router = new Router();
const GuestController = require('../controllers/GuestController');
const InfoController = require('../controllers/InfoController');

router.get('/join/:id', GuestController.getUser);
router.get('/getInterfaceInfo', InfoController.getInterfaceInfo);
router.get('/getTotalDeckPrice', InfoController.getTotalDeckPrice);

module.exports = router.routes();
