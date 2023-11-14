const Router = require('koa-router');
const router = new Router();
const UsersController = require('../controllers/UsersController');
const InfoController = require('../controllers/InfoController');

router.get('/getUser', UsersController.getAuthenticatedUser);
router.post('/updateUser', UsersController.updateAuthenticatedUser);
router.post('/invite', UsersController.invite);
router.get('/startNewSession', UsersController.startNewSession);
router.get('/receiveNotification', UsersController.receiveNotification);
router.get('/trialEndedConfirm', UsersController.trialEndedConfirm);
router.get('/getTrialEndedText', InfoController.getTrialEndedText);
router.post('/suggestion', UsersController.suggestion);
router.post('/rememberLanguage', UsersController.rememberLanguage);
router.post('/updateTutorialStep', UsersController.updateTutorialStep);
router.post('/uploadUserBackground', UsersController.uploadBackground);
router.post('/deleteUserBackground', UsersController.deleteBackground);
router.post('/userDeckPlayed', UsersController.userDeckPlayed);
router.post('/multipleAllowed', UsersController.updateMultipleAllowed);

module.exports = router.routes();
