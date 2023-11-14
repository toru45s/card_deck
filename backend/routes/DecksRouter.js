const Router = require('koa-router');
const router = new Router();
const DecksController = require('../controllers/DecksController');

router.get('/getAllDecks', DecksController.getAllDecks);
router.get('/getDecks', DecksController.getPlayableDecks);
router.post('/saveCardForm', DecksController.saveCardForm);
router.post('/addDeck', DecksController.addDeck);
router.post('/removeDeck', DecksController.removeDeck);

module.exports = router.routes();
