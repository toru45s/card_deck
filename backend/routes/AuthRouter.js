const Router = require('koa-router');
const router = new Router();
const AuthController = require('../controllers/AuthController');

router.post('/login', AuthController.login);
router.get('/tokenLogin', AuthController.tokenLogin);
router.post('/register', AuthController.register);
router.post('/resetPassword', AuthController.resetPassword);
router.post('/updatePassword', AuthController.updatePassword);
router.post('/socialLogin', AuthController.socialLogin);

module.exports = router.routes();