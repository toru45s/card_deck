const CardModel = require('../models/Card');
const mongoose = require('mongoose');

class CardService {

    static async getDeckCards(deckId) {
        return await CardModel.find({deck_id: deckId});
    }

    static async getCardById(cardId) {
        return await CardModel.findById(cardId);
    }

    /**
     * Create a Card
     *
     * @returns {Promise<Object>}
     */
    static async createCard(deckId, image, form) {
        const cardInstance = new CardModel({
            image: image,
            deck_id: deckId,
            form: form
        });

        await cardInstance.save();

        return cardInstance;
    }

    /**
     * Update a Card
     *
     * @returns {Promise<Object>}
     */
    static async updateCard(Card, image, deck_id, form) {
        Card.image = image;
        Card.deck_id = deck_id;
        Card.form = form;

        await Card.save();

        return Card;
    }

    /**
     * Delete multiple cards
     *
     * @param Array ids
     * @returns {Promise<void>}
     */
    static async deleteCards(ids) {
        const $this = this;
        const deletedCards = [];
        ids.forEach(async function(id){
            deletedCards.push(await $this.getCardById(id));
            await CardModel.deleteOne({ _id: id });
        });

        return deletedCards;
    }

}

module.exports = CardService;
