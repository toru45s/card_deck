const NotesService = require('../services/NotesService');
const UserService = require('../services/UserService');
const DeckService = require('../services/DeckService');

class NotesController {
    
    /**
     * Return all Notes
     *
     * @param ctx
     * @returns {Promise<Object>}
     */

        static async getAllNotes(ctx) {
            // console.log('getAllNotes');
            const coupons = await NotesService.getAllNotes();
            ctx.body = coupons;
        }

        /**
     * Return add Notes
     *
     * @param ctx
     * @returns {Promise<Object>}
     */

    static async addNotes(ctx) {
        console.log('addNotes');
        const {title,description} = ctx.request.body;
        if(!title || !description ){
            ctx.throw(400, "Error: Missing required fields");
        }
        
        const notesInstance = await NotesService.addNotes(title,description);
        ctx.body = notesInstance;
    }

            /**
     * Return update Notes
     *
     * @param ctx
     * @returns {Promise<Object>}
     */

    static async updateNotes(ctx) {
        console.log('updateNotes');
        const {title,description,id} = ctx.request.body;
        if(!title || !description || !id){
            ctx.throw(400, "Error: Missing required fields");
        }
        
        const notesInstance = await NotesService.updateNotes(title,description,id);
        ctx.body = notesInstance;
    }

    }


module.exports = NotesController;