const DeckModel = require('../models/Deck');
const mongoose = require('mongoose');
const CardService = require('../services/CardService');
const BackgroundService = require('../services/BackgroundService');

class DeckService {

    static async getDecks(sort, offset, limit){
        const sorter = {};
        if (sort) {
            sorter[sort[0]] = sort[1];
        }
        const decks = await DeckModel.find().sort(sorter).skip(offset).limit(limit);

        return decks;
    }

    static async getAllDecks() {
        return await DeckModel.find().sort({order: 1});
    }

    static async getFreeDecks() {
        return await DeckModel.find({price: 0, price_year: 0}).sort({order: 1});
    }

    static async countDecks(){
        return await DeckModel.countDocuments();
    }

    /**
     * Retrieve the Deck by id
     *
     * @param id
     * @returns {Promise<Object>}
     */
    static async getDeckById(id) {
        return await DeckModel.findOne({ _id: id });
    }

    /**
     * Create a new Deck
     *
     * @param name
     * @param description
     * @returns {Promise<Object>}
     */
    static async createDeck(order, name, short_description_en, short_description_il, short_description_spa, short_description_zh, short_description_ukr, short_description_pl, short_description_cz, description_en, description_il, description_spa, description_zh, description_ukr, description_pl, description_cz, price, price_year, back, keywords, languages, forms) {
        const deckInstance = new DeckModel({
            order: order,
            name: name,
            cards: [],
            backgrounds: [],
            image: back,
            short_description_en: short_description_en,
            short_description_il: short_description_il,
            short_description_spa: short_description_spa,
            short_description_zh: short_description_zh,
            short_description_ukr: short_description_ukr,
            short_description_pl: short_description_pl,
            short_description_cz: short_description_cz,
            description_en: description_en,
            description_il: description_il,
            description_spa: description_spa,
            description_zh: description_zh,
            description_cz: description_cz,
            price: price,
            price_year: price_year,
            keywords: keywords,
            languages: languages,
            forms: forms
        });

        await deckInstance.save();

        return deckInstance;
    }

    /**
     * Update Deck
     *
     * @returns {Promise<Object>}
     */
    static async updateDeck(Deck, order, name, short_description_en, short_description_il, short_description_spa, short_description_zh, short_description_ukr, short_description_pl, short_description_cz, description_en, description_il, description_spa, description_zh, description_ukr, description_pl, description_cz, price, price_year, back, keywords, languages, forms) {
        Deck.order = order;
        Deck.name = name;
        Deck.short_description_en = short_description_en;
        Deck.short_description_il = short_description_il;
        Deck.short_description_spa = short_description_spa;
        Deck.short_description_zh = short_description_zh;
        Deck.short_description_ukr = short_description_ukr;
        Deck.short_description_pl = short_description_pl;
        Deck.short_description_cz = short_description_cz;
        Deck.description_en = description_en;
        Deck.description_il = description_il;
        Deck.description_spa = description_spa;
        Deck.description_zh = description_zh;
        Deck.description_ukr = description_ukr;
        Deck.description_pl = description_pl;
        Deck.description_cz = description_cz;
        Deck.price = price;
        Deck.price_year = price_year;
        Deck.image = back;
        Deck.keywords = keywords;
        Deck.languages = languages;
        Deck.forms = forms;

        Deck.save();

        return Deck;
    }

    /**
     * Delete multiple decks
     *
     * @param Array ids
     * @returns {Promise<void>}
     */
    static async deleteDecks(ids) {
        const $this = this;
        const deletedDecks = [];
        ids.forEach(async function(id){
            deletedDecks.push(await $this.getDeckById(id));
            await DeckModel.deleteOne({ _id: id });
        });

        return deletedDecks;
    }

    static async getCards(Deck) {
        return Deck.cards;
    }

    static async getDeck(id) {
        const decks = await this.getDecks();
        let targetDeck = {};
        decks.forEach(function(deck){
           if (deck.id === id) {
               targetDeck = deck;
           }
        });

        return targetDeck;
    }

    static async removeDeck(User, deckId) {
        const deckIndex = User.decks.findIndex(x => x._id == deckId);
        User.decks.splice(deckIndex, 1);

        return await User.save();
    }

    static async getUserDeck(User, deckId) {
        const deck = User.decks.find(x => x._id == deckId);

        return deck;
    }

    static async userDeckPlayed(User, deckId) {
        const deckIndex = User.decks.findIndex(x => x._id == deckId);
        if (deckIndex < 0) return false;
        User.decks[deckIndex].played = true;
        User.markModified('decks');

        return await User.save();
    }

    static async addDeck(User, Deck) {
        Deck.cards = await CardService.getDeckCards(Deck._id);
        Deck.backgrounds = await BackgroundService.getDeckBackgrounds(Deck._id);
        User.decks.push(Deck);

        await User.save();

        return Deck;
    }

    static async updateUserDeck(User, Deck) {
        const deckIndex = User.decks.findIndex(x => x._id == Deck._id);
        User.decks[deckIndex] = Deck;
        User.markModified('decks');

        await User.save();

        return Deck;
    }

    static async isDeckPlayable(User, DeckId) {
        if ((new Date(User.trialUntil) >= new Date()) || (User.fullSubscription && new Date(User.fullSubscription) >= new Date())) {
            return true;
        } else {
            const deck = User.decks.find(x => x._id.toString() == DeckId.toString());
            if (!deck) {
                return null;
            }
            return (new Date(deck.subscribedUntil) >= new Date());
        }
    }

    static async isDeckFree(Deck) {
        return Deck.price <= 0 && Deck.price_year <= 0;
    }

    static async isDeckPlayed(User, DeckId) {
        const deck = User.decks.find(x => x._id.toString() == DeckId.toString());
        if (!deck) {
            return false;
        }
        return deck.played;
    }
}

module.exports = DeckService;
