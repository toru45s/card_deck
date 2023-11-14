const AuthService = require('../services/AuthService');
const UserService = require('../services/UserService');
const DeckService = require('../services/DeckService');
const InfoService = require('../services/InfoService');
const OptionModel = require('../models/Option');
const nodemailer = require("nodemailer");
const sendpulse = require("sendpulse-api");
const fs = require('fs');

class UsersController {

    /**
     * Return multiple users
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async getUsers(ctx) {
        const range = (ctx.query.range) ? JSON.parse(ctx.query.range) : [0, 1000];
        const offset = (typeof range[0] !== "undefined") ? range[0] : 0;
        const limit = (typeof range[1] !== "undefined") ? range[1] + 1 : 10;
        const filter = ctx.query.filter;
        const users = await UserService.getUsers((ctx.query.sort) ? JSON.parse(ctx.query.sort) : [], offset, limit, JSON.parse(filter));
        const totalUsers = await UserService.countUsers();

        ctx.set('Content-Range', 'users ' + offset + '-' + limit + '/' + totalUsers);
        ctx.body = users;
    }

    /**
     * Return a single users
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async getUser(ctx) {
        const userId = ctx.params.id;

        ctx.body = await UserService.getUserById(userId);
    }

    /**
     * Return currently authenticated user
     *
     * @param ctx
     * @returns {Promise<Object>}
     */
    static async getAuthenticatedUser(ctx) {
        const User = await UserService.getUserById(ctx.decode.id);
        if (User.decks.length) {
            for (const deck of User.decks) {
                deck.cards = await CardService.getDeckCards(deck._id);
                deck.backgrounds = await BackgroundService.getDeckBackgrounds(deck._id);
            }
        }

        ctx.body = User;
    }

    /**
     * Update currently authenticated user
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async updateAuthenticatedUser(ctx) {
        const User = await UserService.getUserById(ctx.decode.id);
        const updatedUser = await UserService.updateUser(User, ctx.request.body.email, ctx.request.body.username, User.role, User.trialUntil, ctx.request.body.eula);
        const token = await AuthService.getToken(updatedUser._id);

        ctx.body = {
            _id: updatedUser._id,
            email: updatedUser.email,
            username: updatedUser.username,
            decks: updatedUser.decks,
            message: updatedUser.message,
            token: token,
            eula: updatedUser.eula,
            role: updatedUser.role,
            backgrounds: updatedUser.backgrounds,
            tutorial: updatedUser.tutorial
        };
    }

    /**
     * Create user
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async createUser(ctx) {
        const username = ctx.request.body.username;
        const hash = await AuthService.hashPassword(ctx.request.body.password);
        const role = ctx.request.body.role;
        const email = ctx.request.body.email;

        ctx.body = await UserService.createUser(email, username, hash, role);
    }

    /**
     * Update user
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async updateUser(ctx) {
        const userId = ctx.params.id;
        const User = await UserService.getUserById(userId);
        const trialUntil = (typeof ctx.request.body.trialUntil !== "undefined") ? ctx.request.body.trialUntil : User.trialUntil;

        ctx.body = await UserService.updateUser(User, ctx.request.body.email, ctx.request.body.username, ctx.request.body.role, trialUntil, User.eula);
    }

    /**
     * Delete user
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async deleteUser(ctx) {
        const userId = ctx.params.id;
        const deleteUsers = [];
        deleteUsers.push(userId);

        ctx.body = await UserService.deleteUsers(deleteUsers);
    }

    /**
     * Delete multiple users
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async deleteUsers(ctx) {
        const users = JSON.parse(ctx.query.filter).id;
        const deleteUsers = [];
        users.forEach(function(userId){
            deleteUsers.push(userId);
        });

        ctx.body = await UserService.deleteUsers(deleteUsers);
    }

    /**
     * Invite a guest to User's session
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async invite(ctx) {
        const User = await UserService.getUserById(ctx.decode.id);
        const inviteCode = (User.inviteCode) ? User.inviteCode : User._id;

        const email = {
            "template" : {
                "id": 596824,
                "variables": {
                    "username": User.username,
                    "email": User.email,
                    "language": User.language,
                    "link": process.env.REACT_APP_DOMAIN+"/join/"+inviteCode
                }
            },
            "subject" : "DIGI CARD THERAPY | Invitation",
            "from" : {
                "name" : "Adam Leighton",
                "email" : "info@cardtherapy.online"
            },
            "to" : [
                {
                    "email" : ctx.request.body.email
                },
            ],
        }
        sendpulse.init(process.env.SENDPULSE_API_KEY, process.env.SENDPULSE_API_SECRET,"/tmp/",function() {
            sendpulse.smtpSendMail((data) => {console.log(data)}, email);
        });

        ctx.body = {success: true};
    }

    static async startNewSession(ctx) {
        const User = await UserService.getUserById(ctx.decode.id);
        const newCode = await UserService.updateInviteCode(User);

        ctx.body = {inviteCode: newCode};
    }

    static async updateMultipleAllowed(ctx) {
        const multipleAllowed = ctx.request.body.multipleAllowed;
        const User = await UserService.getUserById(ctx.decode.id);
        await UserService.updateMultipleAllowed(User, multipleAllowed);

        ctx.body = {success: true};
    }

    /**
     * Send an email to Admin
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async suggestion(ctx) {
        const userId = ctx.decode.id;
        const User = await UserService.getUserById(userId);
        let transporter = nodemailer.createTransport({
            host: "smtp.titan.email",
            secure: true,
            port: 465,
            auth: {
                user: process.env.SMTP_GMAIL_USER,
                pass: process.env.SMTP_GMAIL_PASSWORD
            },
        });
        const admin_email = await OptionModel.findOne({key: "admin_email"});

        if (admin_email) {
            let info = await transporter.sendMail({
                from: "admin@cardtherapy.online", // sender address
                to: admin_email.value, // list of receivers
                subject: "Suggestion from " + User.email, // Subject line
                html: ctx.request.body.value, // html body
            });

            ctx.body = {success: true};
        }
    }

    static async receiveNotification(ctx) {
        const userId = ctx.decode.id;
        const User = await UserService.getUserById(userId);

        if (InfoService.removeUserNotification(User)) {
            ctx.body = {success: true};
        }
    }

    static async trialEndedConfirm(ctx) {
        const userId = ctx.decode.id;
        const User = await UserService.getUserById(userId);
        UserService.setTrialConfirm(User, true);

        ctx.body = {success: true};
    }

    static async rememberLanguage(ctx) {
        const userId = ctx.decode.id;
        const User = await UserService.getUserById(userId);
        const language = ctx.request.body.language;

        UserService.setUserLanguage(User, language);

        ctx.body = {success: true};
    }

    static async updateTutorialStep(ctx) {
        const userId = ctx.decode.id;
        const User = await UserService.getUserById(userId);
        const step = ctx.request.body.step;

        UserService.setUserTutorial(User, step);

        ctx.body = {success: true};
    }

    static async uploadBackground(ctx) {
        const userId = ctx.decode.id;
        const User = await UserService.getUserById(userId);
        const image = ctx.request.files.background;
        if (image.type === 'image/jpeg' || image.type === 'image/png') {
            const filename = Date.now() + '.jpg';

            fs.writeFile(process.env.ROOT_PATH + "/" + process.env.REACT_APP_PUBLIC + "/uploads/" + filename, fs.readFileSync(image.path), function (err) {
                if (err) {
                    console.log("err", err);
                }
            });

            if (typeof process.env.REACT_APP_BUILD !== "undefined") {
                fs.writeFile(process.env.ROOT_PATH + "/" + process.env.REACT_APP_BUILD + "/uploads/" + filename, fs.readFileSync(image.path), function (err) {
                    if (err) {
                        console.log("err", err);
                    }
                });
            }

            ctx.body = await UserService.createBackground(User, '/uploads/' + filename);
        }
    }

    static async deleteBackground(ctx) {
        const userId = ctx.decode.id;
        const User = await UserService.getUserById(userId);
        const filename = ctx.request.body.background;
        const filePath = process.env.ROOT_PATH + "/" + process.env.REACT_APP_PUBLIC + filename;

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        ctx.body = await UserService.deleteBackground(User, filename);
    }

    static async userDeckPlayed(ctx) {
        const userId = ctx.decode.id;
        const User = await UserService.getUserById(userId);
        const deckId = ctx.request.body.deckId;
        await DeckService.userDeckPlayed(User, deckId);

        ctx.body = {success: true};
    }

}

module.exports = UsersController;
