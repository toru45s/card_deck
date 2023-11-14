const Router = require('koa-router');
const router = new Router();
const UsersController = require('../controllers/UsersController');
const DecksController = require('../controllers/DecksController');
const CardsController = require('../controllers/CardsController');
const BackgroundsController = require('../controllers/BackgroundsController');
const TranslationsController = require('../controllers/TranslationsController');
const RolesController = require('../controllers/RolesController');
const InfoController = require('../controllers/InfoController');

router.get('/users', UsersController.getUsers);
router.get('/users/:id', UsersController.getUser);
router.post('/users', UsersController.createUser);
router.put('/users/:id', UsersController.updateUser);
router.delete('/users/:id', UsersController.deleteUser);
router.delete('/users', UsersController.deleteUsers);

router.get('/decks', DecksController.getDecks);
router.get('/decks/:id', DecksController.getDeck);
router.post('/decks', DecksController.createDeck);
router.put('/decks/:id', DecksController.updateDeck);
router.delete('/decks/:id', DecksController.deleteDeck);
router.delete('/decks', DecksController.deleteDecks);

router.get('/userdeck', DecksController.getUserDecks);
router.get('/userdeck/:id', DecksController.getUserDeck);
router.put('/userdeck/:id', DecksController.updateUserDeck);
router.post('/userdeck', DecksController.attachDeck);
router.delete('/userdeck/:id', DecksController.detachDeck);

router.get('/cards', CardsController.getCards);
router.get('/cards/:id', CardsController.getCard);
router.post('/cards', CardsController.createCard);
router.put('/cards/:id', CardsController.updateCard);
router.delete('/cards/:id', CardsController.deleteCard);
router.delete('/cards', CardsController.deleteCards);

router.get('/backgrounds', BackgroundsController.getBackgrounds);
router.get('/backgrounds/:id', BackgroundsController.getBackground);
router.post('/backgrounds', BackgroundsController.createBackground);
router.put('/backgrounds/:id', BackgroundsController.updateBackground);
router.delete('/backgrounds/:id', BackgroundsController.deleteBackground);
router.delete('/backgrounds', BackgroundsController.deleteBackgrounds);

router.get('/getTranslations', TranslationsController.getTranslations);
router.post('/updateTranslations', TranslationsController.updateTranslations);

router.get('/roles', RolesController.getRoles);
router.get('/getDashInfo', InfoController.dashboardInfo);
router.post('/saveOptions', InfoController.saveOptions);
router.post('/usercom', InfoController.sendNotification);

router.get('/recompile', InfoController.recompile);


module.exports = router.routes();
