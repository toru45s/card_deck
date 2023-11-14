const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;

class AuthService {

    /**
     * Bcrypt encode the password
     *
     * @param password
     * @returns {Promise<String>}
     */
    static async hashPassword(password) {
        return await bcrypt.hash(password, saltRounds);
    }

    /**
     * Bcrypt compare the password and hash
     *
     * @param password
     * @param hash
     * @returns {Promise<Bool>}
     */
    static async comparePassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }

    /**
     * Generate JsonWebToken from user id
     *
     * @param userId
     * @returns {Promise<String>}
     */
    static async getToken(userId) {
        return await jwt.sign(
            { id: userId },
            process.env.JWT_SECRET,
            {expiresIn: "24h"}
        )
    }

    /**
     * Retrieve data from JsonWebToken
     *
     * @param token
     * @returns {Promise<Object>}
     */
    static decodeToken(token) {
       // console.log("token",token);
        return jwt.verify(token, process.env.JWT_SECRET);
    }

}

module.exports = AuthService;