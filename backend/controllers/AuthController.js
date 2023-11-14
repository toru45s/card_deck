const AuthService = require('../services/AuthService');
const UserService = require('../services/UserService');
const sendpulse = require("sendpulse-api");
const crypto = require('crypto');
const axios = require('axios');

//please rework this mess
class AuthController {

    /**
     * Create a new user and authenticate them
     *
     * @param ctx
     * @returns {Promise<Object>}
     */
    static async register(ctx) {
        try {
            const hash = await AuthService.hashPassword(ctx.request.body.password);
            const newUser = await UserService.register(ctx.request.body.username, ctx.request.body.email, ctx.request.body.language, hash);
            const token = await AuthService.getToken(newUser._id);

            const email = {
                "template" : {
                    "id": 596813,
                    "variables": {
                        "username": newUser.username,
                        "email": newUser.email,
                        "language": newUser.language
                    }
                },
                "subject" : "DIGI CARD THERAPY | Registration",
                "from" : {
                    "name" : "Adam Leighton",
                    "email" : "info@cardtherapy.online"
                },
                "to" : [
                    {
                        "name" : newUser.username,
                        "email" : newUser.email
                    },
                ],
            }
            sendpulse.init(process.env.SENDPULSE_API_KEY, process.env.SENDPULSE_API_SECRET,"/tmp/",function() {
                sendpulse.smtpSendMail((data) => {
                    // console.log(data)
                }, email);
            });

            ctx.body = {
                _id: newUser._id,
                email: newUser.email,
                username: newUser.username,
                decks: newUser.decks,
                message: newUser.message,
                token: token,
                eula: newUser.eula,
                role: newUser.role,
                backgrounds: newUser.backgrounds,
                tutorial: newUser.tutorial,
                inviteCode: newUser.inviteCode
            };
            axios.post('https://events.sendpulse.com/events/id/04d2b91dcc9e4b6ddcf3a2621caa3573/7504019', {
                "email": newUser.email,
                "phone": "+123456789",
                "reg_date": new Date(),
                "Language": newUser.language,
                "USERNAME": newUser.username
            });
        } catch (err) {
            console.log(err);
            ctx.throw(403, {error: err});
        }
    }

    /**
     * Authenticate the user
     *
     * @param ctx
     * @returns {Promise<Object>}
     */
    static async login(ctx) {
        try {
            const user = await UserService.getUserByName(ctx.request.body.username);
            if (!user) {
                ctx.throw(500, "User with that name doesn't exist");
            } else {
                const comparison = await AuthService.comparePassword(ctx.request.body.password, user.password);

                if (comparison) {
                    const token = await AuthService.getToken(user._id);

                    let decks = user.decks;
                    if (user.role !== 1 || new Date(user.trialUntil) < new Date()) {
                        decks = decks.filter(x => new Date(x.subscribedUntil) >= new Date());
                    }

                    user.trialEnded = user.role === 1 && new Date(user.trialUntil) < new Date() && !user.trialEnded;

                    ctx.body = {
                        _id: user._id,
                        email: user.email,
                        username: user.username,
                        decks: decks,
                        message: user.message,
                        token: token,
                        eula: user.eula,
                        role: user.role,
                        backgrounds: user.backgrounds,
                        tutorial: user.tutorial,
                        inviteCode: user.inviteCode,
                        trialEnded: user.trialEnded,
                        multipleAllowed: user.multipleAllowed,
                        fullSubscription: user.fullSubscription || false,
                    };
                } else {
                    ctx.throw(403, "Wrong password");
                }
            }
        } catch (err) {
            console.log(err);
            ctx.throw(403, {error: err});
        }
    }

    /**
     * Authenticate the user
     *
     * @param ctx
     * @returns {Promise<Object>}
     */
    static async tokenLogin(ctx) {
        try {
            const token = ctx.get('x-access-token') || ctx.get('authorization');
            const userId = AuthService.decodeToken(token).id;
            const user = await UserService.getUserById(userId);
            let decks = user.decks;
            if (user.role !== 1 || new Date(user.trialUntil) < new Date()) {
                decks = decks.filter(x => new Date(x.subscribedUntil) >= new Date());
            }

            user.trialEnded = user.role === 1 && new Date(user.trialUntil) < new Date() && !user.trialEnded;

            if (!user) {
                ctx.throw(500, "No user associated with this token");
            } else {
                const token = await AuthService.getToken(user._id);

                ctx.body = {
                    _id: user._id,
                    email: user.email,
                    username: user.username,
                    decks: decks,
                    message: user.message,
                    token: token,
                    eula: user.eula,
                    role: user.role,
                    backgrounds: user.backgrounds,
                    tutorial: user.tutorial,
                    inviteCode: user.inviteCode,
                    trialEnded: user.trialEnded,
                    multipleAllowed: user.multipleAllowed,
                    fullSubscription: user.fullSubscription || false,
                };
            }
        } catch (err) {
            console.log(err);
            ctx.throw(403, 'Auth token expired');
        }
    }

    /**
     * Authenticate the social user
     *
     * INSECURE. IMPROVE LATER
     *
     * @param ctx
     * @returns {Promise<Object>}
     */
    static async socialLogin(ctx) {
        try {
            const socialId = ctx.request.body.socialId;
            const email = ctx.request.body.email;
            const user = await UserService.getUserBySocialId(socialId);

            if (!user) {
                const emailUser = await UserService.getUserByEmail(email);
                if (!emailUser) {
                    const hash = await AuthService.hashPassword(email);
                    const newUser = await UserService.register(email, email, ctx.request.body.language, hash);
                    const token = await AuthService.getToken(newUser._id);

                    ctx.body = {
                        _id: newUser._id,
                        email: newUser.email,
                        username: newUser.username,
                        decks: newUser.decks,
                        message: newUser.message,
                        token: token,
                        eula: newUser.eula,
                        role: newUser.role,
                        backgrounds: newUser.backgrounds,
                        tutorial: newUser.tutorial,
                        inviteCode: newUser.inviteCode,
                        trialEnded: newUser.trialEnded,
                        multipleAllowed: newUser.multipleAllowed
                    };
                    axios.post('https://events.sendpulse.com/events/id/04d2b91dcc9e4b6ddcf3a2621caa3573/7504019', {
                        "email": newUser.email,
                        "phone": "+123456789",
                        "reg_date": new Date(),
                        "Language": newUser.language,
                        "USERNAME": newUser.username
                    });
                } else {
                    const token = await AuthService.getToken(emailUser._id);
                    let emailDecks = emailUser.decks;
                    if (emailUser.role !== 1 || new Date(emailUser.trialUntil) < new Date()) {
                        emailDecks = emailDecks.filter(x => new Date(x.subscribedUntil) >= new Date());
                    }

                    emailUser.trialEnded = emailUser.role === 1 && new Date(emailUser.trialUntil) < new Date() && !emailUser.trialEnded;

                    ctx.body = {
                        _id: emailUser._id,
                        email: emailUser.email,
                        username: emailUser.username,
                        decks: emailDecks,
                        message: emailUser.message,
                        token: token,
                        eula: emailUser.eula,
                        role: emailUser.role,
                        backgrounds: emailUser.backgrounds,
                        tutorial: emailUser.tutorial,
                        inviteCode: emailUser.inviteCode,
                        trialEnded: emailUser.trialEnded,
                        multipleAllowed: emailUser.multipleAllowed,
                        fullSubscription: emailUser.fullSubscription || false,
                    };
                }
            } else {
                let decks = user.decks;
                if (user.role !== 1 || new Date(user.trialUntil) < new Date()) {
                    decks = decks.filter(x => new Date(x.subscribedUntil) >= new Date());
                }
                const token = await AuthService.getToken(user._id);

                ctx.body = {
                    _id: user._id,
                    email: user.email,
                    username: user.username,
                    decks: decks,
                    message: user.message,
                    token: token,
                    eula: user.eula,
                    role: user.role,
                    backgrounds: user.backgrounds,
                    tutorial: user.tutorial,
                    inviteCode: user.inviteCode,
                    trialEnded: user.trialEnded,
                    multipleAllowed: user.multipleAllowed,
                    fullSubscription: user.fullSubscription || false,
                };
            }
        } catch (err) {
            console.log(err);
            ctx.throw(403, 'Auth token expired');
        }
    }

    /**
     * Reset the password
     *
     * @param ctx
     * @returns {Promise<Object>}
     */
    static async resetPassword(ctx) {
        try {
            const User = await UserService.getUserByEmail(ctx.request.body.email);
            if (!User) {
                ctx.throw(404, "No user associated with this Email");
            } else {
                const resetToken = crypto.randomBytes(32).toString('hex');
                User.resetToken = resetToken;
                User.save();

                const email = {
                    "template" : {
                        "id": 596822,
                        "variables": {
                            "username": User.username,
                            "email": User.email,
                            "language": User.language,
                            "link": process.env.REACT_APP_DOMAIN + "/reset_password/" + User.resetToken
                        }
                    },
                    "subject" : "DIGI CARD THERAPY | Reset password",
                    "from" : {
                        "name" : "Adam Leighton",
                        "email" : "info@cardtherapy.online"
                    },
                    "to" : [
                        {
                            "name" : User.username,
                            "email" : User.email
                        },
                    ],
                }
                sendpulse.init(process.env.SENDPULSE_API_KEY, process.env.SENDPULSE_API_SECRET,"/tmp/",function() {
                    sendpulse.smtpSendMail((data) => {
                        //console.log(data)
                    }, email);
                });

                ctx.body = {success: true};
            }
        } catch (err) {
            console.log(err);
            ctx.throw(404, 'User not found');
        }
    }

    /**
     * Update the password
     *
     * @param ctx
     * @returns {Promise<Object>}
     */
    static async updatePassword(ctx) {
        try {
            const User = await UserService.getUserByResetToken(ctx.request.body.reset_token);
            if (!User) {
                ctx.throw(403, "Token expired");
            } else {
                const hash = await AuthService.hashPassword(ctx.request.body.password);
                User.password = hash;
                User.resetToken = null;
                User.save();

                ctx.body = {success: true};
            }
        } catch (err) {
            console.log(err);
            ctx.throw(403, 'Token expired');
        }
    }

}

module.exports = AuthController;
