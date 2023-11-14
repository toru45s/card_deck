const UserService = require('../services/UserService');
const DeckService = require('../services/DeckService');
const CardService = require('../services/CardService');
const TransactionService = require('../services/TransactionService');
const BackgroundService = require('../services/BackgroundService');
const fs = require('fs');

class DecksController {

    /**
     * Return all decks
     *
     * @param ctx
     * @returns {Promise<Object>}
     */
    static async getAllDecks(ctx) {
        const decks = await DeckService.getAllDecks();
        const User = await UserService.getUserById(ctx.decode.id);
        for (const deck of decks){
            deck.cards = await CardService.getDeckCards(deck._id);
            deck.backgrounds = await BackgroundService.getDeckBackgrounds(deck._id);
            deck.subscribed = await TransactionService.isUserSubscribedToDeck(ctx.decode.id, deck._id);
            deck.playable = await DeckService.isDeckFree(deck) || await DeckService.isDeckPlayable(User, deck._id);
            deck.played = await DeckService.isDeckPlayed(User, deck._id);
        }

        ctx.body = decks;
    }

    /**
     * Save the card form
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async saveCardForm(ctx) {
        const userId = ctx.decode.id;
        const User = await UserService.getUserById(userId);
        const cardId = ctx.request.body.cardId;
        User.decks?.map((deck) => {
            const card = deck.cards.find(x => x._id.toString() === cardId);

            if (card) {
                card.form = ctx.request.body.form;
                User.markModified('decks');
                User.save();
            }

            ctx.body = {success: true};
            return true;
        });
    }

    /**
     * Return decks that the user is subscribed to
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async getPlayableDecks(ctx) {
        const userId = ctx.decode.id;
        const User = await UserService.getUserById(userId);
        let decks = [];

        if ((new Date(User.trialUntil) >= new Date()) || (User.fullSubscription && new Date(User.fullSubscription) >= new Date())) {
            decks = await DeckService.getAllDecks();
        } else {
            const freeDecks = await DeckService.getFreeDecks();
            decks = User.decks.filter(x => new Date(x.subscribedUntil) >= new Date());

            freeDecks.forEach((freeDeck) => {
                if (!decks.find(x => freeDeck._id.equals(x._id))) decks.push(freeDeck);
            });
        }

        if (decks.length > 0) {
            for (const deck of decks) {
                const theDeck = await DeckService.getDeckById(deck._id?.toString());
                deck.forms = theDeck?.forms || deck.forms;
                deck.image = theDeck?.image || deck.image;
                deck.price = theDeck?.price || deck.price;
                deck.price_year = theDeck?.price_year || deck.price_year;
                deck.order = theDeck?.order || deck.order;
                deck.name = theDeck?.name || deck.name;
                if (!deck.cards || deck.cards.length <= 0) {
                    deck.cards = await CardService.getDeckCards(deck._id);
                }
                if (!deck.backgrounds || deck.backgrounds.length <= 0) {
                    deck.backgrounds = await BackgroundService.getDeckBackgrounds(deck._id);
                }
                deck.subscribed = await TransactionService.isUserSubscribedToDeck(ctx.decode.id, deck._id);
            }
        }

        ctx.body = decks;
    }

    /**
     * Return multiple decks
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async getDecks(ctx) {
        let range = ctx.query.range;
        if (range && range.length > 0) {
            range = JSON.parse(ctx.query.range);
        }
        const offset = (typeof range !== "undefined" && typeof range[0] !== "undefined") ? range[0] : 0;
        const limit = (typeof range !== "undefined" && typeof range[1] !== "undefined") ? range[1] + 1 : 10;
        const sort = (typeof ctx.query.sort !== "undefined") ? JSON.parse(ctx.query.sort) : {};
        const decks = await DeckService.getDecks(sort, offset, limit);
        const totalDecks = await DeckService.countDecks();

        ctx.set('Content-Range', 'decks ' + offset + '-' + limit + '/' + totalDecks);
        ctx.body = decks;
    }

    static async getUserDeck(ctx) {
        const userId = ctx.query.user_id;
        const deckId = ctx.params.id;
        let deck = {};

        if (userId && deckId) {
            const User = await UserService.getUserById(userId);
            deck = await DeckService.getUserDeck(User, deckId);
            deck.user_id = User._id;
        }

        ctx.body = deck;
    }

    static async updateUserDeck(ctx) {
        const userId = ctx.request.body.user_id;
        const Deck = ctx.request.body;
        const User = await UserService.getUserById(userId);

        ctx.body = await DeckService.updateUserDeck(User, Deck);
    }

    static async getUserDecks(ctx) {
        const filter = JSON.parse(ctx.query.filter);
        const userId = filter.user_id;

        const User = await UserService.getUserById(userId);

        User.decks.map(deck => {deck.user_id = User._id; return deck;});

        ctx.set('Content-Range', 'decks 0-100/' + User.decks.length);
        ctx.body = User.decks;
    }

    /**
     * Return a single deck
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async getDeck(ctx) {
        const deckId = ctx.params.id;

        ctx.body = await DeckService.getDeckById(deckId);
    }

    /**
     * Create deck
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async createDeck(ctx) {
        const order = ctx.request.body.order;
        const name = ctx.request.body.name;
        const description_en = ctx.request.body.description_en;
        const description_il = ctx.request.body.description_il;
        const description_spa = ctx.request.body.description_spa;
        const description_zh = ctx.request.body.description_zh;
        const description_ukr = ctx.request.body.description_ukr;
        const description_pl = ctx.request.body.description_pl;
        const description_cz = ctx.request.body.description_cz;
        const short_description_en = ctx.request.body.short_description_en;
        const short_description_il = ctx.request.body.short_description_il;
        const short_description_spa = ctx.request.body.short_description_spa;
        const short_description_zh = ctx.request.body.short_description_zh;
        const short_description_ukr = ctx.request.body.short_description_ukr;
        const short_description_pl = ctx.request.body.short_description_pl;
        const short_description_cz = ctx.request.body.short_description_cz;
        const price = ctx.request.body.price;
        const price_year = ctx.request.body.price_year;
        const keywords = ctx.request.body.keywords;
        const languages = ctx.request.body.languages;
        const forms = ctx.request.body.forms;
        const blob = ctx.request.body.image;
        let filename = '/uploads/back.jpg';
        if (blob) {
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

        ctx.body = await DeckService.createDeck(order, name, short_description_en, short_description_il, short_description_spa, short_description_zh, short_description_ukr, short_description_pl, short_description_cz, description_en, description_il, description_spa, description_zh, description_ukr, description_pl, description_cz, price, price_year, filename, keywords, languages, forms);
    }

    /**
     * Update deck
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async updateDeck(ctx) {
        const deckId = ctx.params.id;
        const Deck = await DeckService.getDeckById(deckId);

        const blob = ctx.request.body.image;
        let filename = Deck.image;
        if (blob && blob !== Deck.image) {
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

        ctx.body = await DeckService.updateDeck(
            Deck,
            ctx.request.body.order,
            ctx.request.body.name,
            ctx.request.body.short_description_en,
            ctx.request.body.short_description_il,
            ctx.request.body.short_description_spa,
            ctx.request.body.short_description_zh,
            ctx.request.body.short_description_ukr,
            ctx.request.body.short_description_pl,
            ctx.request.body.short_description_cz,
            ctx.request.body.description_en,
            ctx.request.body.description_il,
            ctx.request.body.description_spa,
            ctx.request.body.description_zh,
            ctx.request.body.description_ukr,
            ctx.request.body.description_pl,
            ctx.request.body.description_cz,
            ctx.request.body.price,
            ctx.request.body.price_year,
            filename,
            ctx.request.body.keywords,
            ctx.request.body.languages,
            ctx.request.body.forms
        );
    }

    /**
     * Delete deck
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async deleteDeck(ctx) {
        const deckId = ctx.params.id;
        const deleteDecks = [];
        deleteDecks.push(deckId);

        ctx.body = await DeckService.deleteDecks(deleteDecks);
    }

    /**
     * Delete multiple decks
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async deleteDecks(ctx) {
        const decks = JSON.parse(ctx.query.filter).id;
        const deleteDecks = [];
        decks.forEach(function(deckId){
            deleteDecks.push(deckId);
        });

        ctx.body = await DeckService.deleteDecks(deleteDecks);
    }

    /**
     * Remove a particular Deck from the User
     * @param ctx
     * @returns {Promise<void>}
     */
    static async removeDeck(ctx) {
        const userId = ctx.decode.id;
        const User = await UserService.getUserById(userId);

        if (await DeckService.removeDeck(User, ctx.request.body.id)) {
            ctx.body = {success: true};
        }
    }

    /**
     * Add a particular Deck to the User
     * @param ctx
     * @returns {Promise<void>}
     */
    static async attachDeck(ctx) {
        const userId = ctx.request.body.user_id;
        const User = await UserService.getUserById(userId);
        const Deck = await DeckService.getDeckById(ctx.request.body.deck_id);
        Deck.subscribedUntil = (typeof ctx.request.body.subscribedUntil !== "undefined") ? ctx.request.body.subscribedUntil : Date.now();

        ctx.body = await DeckService.addDeck(User, Deck);
    }

    /**
     * Remove a particular Deck from User
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async detachDeck(ctx) {
        const filter = JSON.parse(ctx.query.filter);
        const userId = filter.user_id;
        const deckId = ctx.params.id;
        const User = await UserService.getUserById(userId);

        if (await DeckService.removeDeck(User, deckId)) {
            ctx.body = User.decks;
        }
    }

    /**
     * Add a particular Deck to the User
     * @param ctx
     * @returns {Promise<void>}
     */
    static async addDeck(ctx) {
        const userId = ctx.decode.id;
        const User = await UserService.getUserById(userId);
        const Deck = await DeckService.getDeckById(ctx.request.body.id);

        ctx.body = await DeckService.addDeck(User, Deck);
    }

}

module.exports = DecksController;
