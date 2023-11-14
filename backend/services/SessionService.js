const mongoose = require('mongoose');

class SessionService {

    /**
     * Delete Session by name
     *
     * @param id
     * @returns {Promise<Object>}
     */
    static async deleteSession(User, clientName, name) {
        if (!User.sessions) {
            return true;
        }

        const sessionIndex = await User.sessions.findIndex(x => x.name === name && x.clientName === clientName);
        if (sessionIndex < 0) {
            return true;
        }
        User.sessions.splice(sessionIndex, 1);

        return await User.save();
    }

    static async getUserSessions(User) {
        return await User.sessions;
    }

    /**
     * Retrieve the Session by name
     *
     * @param user
     * @param id
     * @returns {Promise<Object>}
     */
    static async loadSession(User, id) {
        const session = await User.sessions.id(id);
        return session;
    }

    /**
     * Save a session for User
     *
     * @param User
     * @param name
     * @param decks
     * @returns {Object}
     */
    static async saveSession(User, clientName, name, decks) {
        if (await this.deleteSession(User, clientName, name)) {
            const session = {
                _id: mongoose.Types.ObjectId(),
                clientName: clientName,
                name: name,
                decks: decks
            };
            User.sessions.push(session);

            await User.save();

            return session;
        } else {
            return false;
        }
    }

}

module.exports = SessionService;
