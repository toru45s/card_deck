const Router = require('koa-router');
const router = new Router();
const NotesController = require('../controllers/Notes');

router.get('/getAllNotes',NotesController.getAllNotes);
router.post('/addNote',NotesController.addNotes);
router.post('/updateNote',NotesController.updateNotes);

module.exports = router.routes();