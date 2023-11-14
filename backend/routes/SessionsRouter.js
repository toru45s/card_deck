const Router = require('koa-router');
const router = new Router();
const SessionsController = require('../controllers/SessionsController');

router.get('/getSessions', SessionsController.getSessions);
router.post('/sessionSave', SessionsController.sessionSave);
router.post('/sessionLoad', SessionsController.sessionLoad);

module.exports = router.routes();