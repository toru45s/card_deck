const BackgroundModel = require('../models/Background');
const mongoose = require('mongoose');

class BackgroundService {

    static async getAllBackgrounds() {
        return await BackgroundModel.find();
    }

    static async getDeckBackgrounds(deckId) {
        return await BackgroundModel.find({deck_id: deckId}).sort([['order', 1]]);
    }

    static async getBackgroundById(bgId) {
        return await BackgroundModel.findById(bgId);
    }

    /**
     * Create a Background
     *
     * @returns {Promise<Object>}
     */
    static async createBackground(deckId, image, order, comboId) {
        const bgInstance = new BackgroundModel({
            image: image,
            deck_id: deckId,
            order: order,
            combo_id: comboId
        });

        await bgInstance.save();

        return bgInstance;
    }

    /**
     * Update a Background
     *
     * @returns {Promise<Object>}
     */
    static async updateBackground(bg, image, deck_id, order, comboId) {
        bg.image = image;
        bg.deck_id = deck_id;
        bg.order = order;
        bg.combo_id = comboId;

        await bg.save();

        return bg;
    }

    /**
     * Delete multiple backgrounds
     *
     * @param Array ids
     * @returns {Promise<void>}
     */
    static async deleteBackgrounds(ids) {
        const $this = this;
        const deletedBgs = [];
        ids.forEach(async function(id){
            deletedBgs.push(await $this.getBackgroundById(id));
            await BackgroundModel.deleteOne({ _id: id });
        });

        return deletedBgs;
    }

}

module.exports = BackgroundService;