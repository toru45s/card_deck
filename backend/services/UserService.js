const UserModel = require('../models/User');
const CardService = require('../services/CardService');
const BackgroundService = require('../services/BackgroundService');

class UserService {

    static async getUsers(sort, offset, limit, filter){
        const sorter = {};
        if (sort) {
            sorter[sort[0]] = sort[1];
        }
        const users = await UserModel.find(filter).sort(sorter).skip(offset).limit(limit);

        return users;
    }

    static async countUsers(){
        return await UserModel.countDocuments();
    }

    /**
     * Retrieve the User by id
     *
     * @param id
     * @returns {Promise<Object>}
     */
    static async getUserById(id) {
        return await UserModel.findOne({ _id: id });
    }

    static async getHost(inviteCode) {
        let User = await UserModel.findOne({ inviteCode: inviteCode });

        if (!User) {
            const codelessUser = await UserModel.findOne({ _id: inviteCode });
            if (!codelessUser.inviteCode) User = codelessUser;
        }

        return User;
    }

    /**
     * Retrieve the User by social id
     *
     * @param id
     * @returns {Promise<Object>}
     */
    static async getUserBySocialId(id) {
        return await UserModel.findOne({ socialId: id });
    }

    /**
     * Retrieve the User by Email
     *
     * @param email
     * @returns {Promise<Object>}
     */
    static async getUserByEmail(email) {
        return await UserModel.findOne({ email: email });
    }

    /**
     * Retrieve the User by Password Reset Token
     *
     * @param token
     * @returns {Promise<Object>}
     */
    static async getUserByResetToken(token) {
        return await UserModel.findOne({ resetToken: token });
    }

    /**
     * Retrieve the User by username
     *
     * @param username
     * @returns {Promise<Object>}
     */
    static async getUserByName(username) {
        const User = await UserModel.findOne({ username: username });
        if (User && User.decks.length) {
            for (const deck of User.decks) {
                deck.cards = await CardService.getDeckCards(deck._id);
                deck.backgrounds = await BackgroundService.getDeckBackgrounds(deck._id);
            }
        }

        return User;
    }

    /**
     * Create a new User
     *
     * @param username
     * @param hash
     * @returns {Promise<Object>}
     */
    static async createUser(email, username, hash, role) {
        const userInstance = new UserModel({
            email: email,
            username: username,
            password: hash,
            role: role,
            decks: []
        });

        await userInstance.save();

        return userInstance;
    }

    /**
     * Update User
     *
     * @returns {Promise<Object>}
     */
    static async updateUser(User, email, username, role, trialUntil, eula) {
        if (typeof email !== "undefined") User.email = email;
        if (typeof username !== "undefined") User.username = username;
        if (typeof role !== "undefined") User.role = role;
        if (typeof trialUntil !== "undefined") User.trialUntil = trialUntil;
        if (typeof eula !== "undefined") User.eula = eula;

        User.save();

        return User;
    }

    static async updateInviteCode(User) {
        const newCode = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
        User.inviteCode = newCode;

        User.save();

        return newCode;
    }

    static async updateMultipleAllowed(User, bool) {
        User.multipleAllowed = !!bool;

        User.save();

        return User;
    }

    /**
     * Update User Language
     *
     * @returns {Promise<Object>}
     */
    static async setUserLanguage(User, language) {
        User.language = language;

        User.save();

        return User;
    }
    /**
     * Update User TrialEnded
     *
     * @returns {Promise<Object>}
     */
    static async setTrialConfirm(User, bool) {
        User.trialEnded = bool;

        User.save();

        return User;
    }

    /**
     * Update User Tutorial step
     *
     * @returns {Promise<Object>}
     */
    static async setUserTutorial(User, step) {
        User.tutorial = step;

        User.save();

        return User;
    }

    /**
     * Attach background to User
     *
     * @param User
     * @param background
     * @returns {Promise<*>}
     */
    static async createBackground(User, background) {
        User.backgrounds.push(background);

        User.save();

        return User.backgrounds;
    }

    /**
     * Detach background from User
     *
     * @param User
     * @param background
     * @returns {Promise<*>}
     */
    static async deleteBackground(User, background) {
        User.backgrounds = User.backgrounds.filter(userBackground => userBackground != background);

        User.save();

        return User.backgrounds;
    }

    /**
     * Create a new User from username, email and password hash
     *
     * @param username
     * @param email
     * @param hash
     * @returns {Promise<Object>}
     */
    static async register(username, email, language, hash) {
        const dateNow = new Date();
        dateNow.setDate(dateNow.getDate() + 7);
        const userInstance = new UserModel({
            username: username,
            email: email,
            password: hash,
            language: language,
            decks: [],
            trialUntil: dateNow
        });

        return await userInstance.save();
    }

    /**
     * Delete multiple users
     *
     * @param Array ids
     * @returns {Promise<void>}
     */
    static async deleteUsers(ids) {
        const $this = this;
        const deletedUsers = [];
        ids.forEach(async function(id){
            deletedUsers.push(await $this.getUserById(id));
            await UserModel.deleteOne({ _id: id });
        });

        return deletedUsers;
    }

}

module.exports = UserService;
