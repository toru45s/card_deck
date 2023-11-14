const DeckService = require('../services/DeckService');
const BackgroundService = require('../services/BackgroundService');
const fs = require('fs');

class BackgroundsController {

    /**
     * Return multiple backgrounds from the deck
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async getBackgrounds(ctx) {
        const filter = JSON.parse(ctx.query.filter);
        const offset = 0;
        const limit = 1000;
        let bgs = [];
        if (filter.deck_id) {
            const Deck = await DeckService.getDeckById(filter.deck_id);
            bgs = (Deck) ? await BackgroundService.getDeckBackgrounds(filter.deck_id) : [];
        } else {
            bgs = await BackgroundService.getAllBackgrounds();
        }

        ctx.set('Content-Range', 'backgrounds ' + offset + '-' + limit + '/' + bgs.length);
        ctx.body = bgs;
    }

    /**
     * Return a single background
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async getBackground(ctx) {
        const cardId = ctx.params.id;
        const bg = await BackgroundService.getBackgroundById(cardId);

        ctx.body = bg;
    }

    /**
     * Create background
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async createBackground(ctx) {
        const deckId = ctx.request.body.deck_id;
        const images = ctx.request.body.images;
        const order = ctx.request.body.order;
        const comboId = ctx.request.body.combo_id;

        for (const blob of images) {
            const image = blob.split(';base64,').pop();
            const filename = Date.now() + Math.random().toString(36).substring(7) + '.jpg';

            fs.writeFile(process.env.ROOT_PATH + "/" + process.env.REACT_APP_PUBLIC + "/uploads/" + filename, new Buffer(image, 'base64'), function (err) {
                if (err) {
                    console.log("err", err);
                }
            });

            if (typeof process.env.REACT_APP_BUILD !== "undefined") {
                fs.writeFile(process.env.ROOT_PATH + "/" + process.env.REACT_APP_BUILD + "/uploads/" + filename, new Buffer(image, 'base64'), function (err) {
                    if (err) {
                        console.log("err", err);
                    }
                });
            }

            ctx.body = await BackgroundService.createBackground(deckId, '/uploads/' + filename, order, comboId);
        }
    }

    /**
     * Update background
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async updateBackground(ctx) {
        const cardId = ctx.params.id;
        const bg = await BackgroundService.getBackgroundById(cardId);

        const blob = ctx.request.body.image;
        const order = ctx.request.body.order;
        const comboId = ctx.request.body.combo_id;

        let filename = bg.image;
        if (blob && blob !== bg.image) {
            const image = blob.split(';base64,').pop();
            filename = '/uploads/' + Date.now() + '.jpg';

            fs.writeFile(process.env.ROOT_PATH + "/" + process.env.REACT_APP_PUBLIC + filename, new Buffer(image, 'base64'), function (err) {
                if (err) {
                    console.log("err", err);
                }
            });

            if (typeof process.env.REACT_APP_BUILD !== "undefined") {
                fs.writeFile(process.env.ROOT_PATH + "/" + process.env.REACT_APP_BUILD + filename, new Buffer(image, 'base64'), function (err) {
                    if (err) {
                        console.log("err", err);
                    }
                });
            }
        }

        ctx.body = await BackgroundService.updateBackground(bg, filename, ctx.request.body.deck_id, order, comboId);
    }

    /**
     * Delete background
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async deleteBackground(ctx) {
        const bgId = ctx.params.id;
        const deleteBgs = [];
        deleteBgs.push(bgId);

        ctx.body = await BackgroundService.deleteBackgrounds(deleteBgs);
    }

    /**
     * Delete multiple backgrounds
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async deleteBackgrounds(ctx) {
        const bgs = JSON.parse(ctx.query.filter).id;
        const deleteBgs = [];
        bgs.forEach(function(bgId){
            deleteBgs.push(bgId);
        });

        ctx.body = await BackgroundService.deleteBackgrounds(deleteBgs);
    }

}

module.exports = BackgroundsController;
