const DeckService = require('../services/DeckService');
const CardService = require('../services/CardService');
const fs = require('fs');

class CardsController {

    /**
     * Return multiple cards from the deck
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async getCards(ctx) {
        const filter = JSON.parse(ctx.query.filter);
        const offset = 0;
        const limit = 1000;
        const Deck = await DeckService.getDeckById(filter.deck_id);
        const cards = (Deck) ? await CardService.getDeckCards(filter.deck_id) : [];

        ctx.set('Content-Range', 'cards ' + offset + '-' + limit + '/' + cards.length);
        ctx.body = cards;
    }

    /**
     * Return a single card
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async getCard(ctx) {
        const cardId = ctx.params.id;
        const card = await CardService.getCardById(cardId);

        ctx.body = card;
    }

    /**
     * Create card
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async createCard(ctx) {
        const deckId = ctx.request.body.deck_id;
        const images = ctx.request.body.images;
        const form   = ctx.request.body.form;
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

            await CardService.createCard(deckId, '/uploads/' + filename, form);
        }

        ctx.body = {success: true};
    }

    /**
     * Update card
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async updateCard(ctx) {
        const cardId = ctx.params.id;
        const Card = await CardService.getCardById(cardId);

        const blob = ctx.request.body.image;
        const form = ctx.request.body.form;
        let filename = Card.image;
        if (blob && blob !== Card.image) {
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

        ctx.body = await CardService.updateCard(Card, filename, ctx.request.body.deck_id, form);
    }

    /**
     * Delete card
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async deleteCard(ctx) {
        const cardId = ctx.params.id;
        const deleteCards = [];
        deleteCards.push(cardId);

        ctx.body = await CardService.deleteCards(deleteCards);
    }

    /**
     * Delete multiple cards
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async deleteCards(ctx) {
        const cards = JSON.parse(ctx.query.filter).id;
        const deleteCards = [];
        cards.forEach(function(cardId){
            deleteCards.push(cardId);
        });

        ctx.body = await CardService.deleteCards(deleteCards);
    }

    /**
     * Remove a particular Card from the Deck
     * @param ctx
     * @returns {Promise<void>}
     */
    static async removeCard(ctx) {
        const deckId = ctx.decode.deck_id;
        const Deck = await DeckService.getDeckById(deckId);

        if (await DeckService.removeCard(Deck, ctx.request.body.id)) {
            ctx.body = {success: true};
        }
    }

    /**
     * Add a particular Card to the Deck
     * @param ctx
     * @returns {Promise<void>}
     */
    static async addCard(ctx) {
        const cardId = ctx.decode.id;
        const Card = await CardService.getCardById(cardId);
        const Deck = await DeckService.getDeck(ctx.request.body.deck_id);

        ctx.body = await DeckService.addCard(Deck, Card);
    }

}

module.exports = CardsController;
