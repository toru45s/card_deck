const fs = require('fs');
const en = require('../../src/translations/en.json');
const il = require('../../src/translations/il.json');
const spa = require('../../src/translations/spa.json');
const zh = require('../../src/translations/zh.json');
const ukr = require('../../src/translations/ukr.json');
const pl = require('../../src/translations/pl.json');
const cz = require('../../src/translations/cz.json');
const {exec} = require('child_process');

class TranslationsController {

    /**
     * Get translation files
     *
     * @param ctx
     * @returns {Promise<void>}
     */
    static async getTranslations(ctx) {
        console.log("getTranslations",__dirname);

        ctx.body = [
            {lang: "EN", file: JSON.parse(fs.readFileSync(process.env.ROOT_PATH + "/src/translations/en.json"))},
            {lang: "IL", file: JSON.parse(fs.readFileSync(process.env.ROOT_PATH + "/src/translations/il.json"))},
            {lang: "SPA", file: JSON.parse(fs.readFileSync(process.env.ROOT_PATH + "/src/translations/spa.json"))},
            {lang: "ZH", file: JSON.parse(fs.readFileSync(process.env.ROOT_PATH + "/src/translations/zh.json"))},
            {lang: "UKR", file: JSON.parse(fs.readFileSync(process.env.ROOT_PATH + "/src/translations/ukr.json"))},
            {lang: "PL", file: JSON.parse(fs.readFileSync(process.env.ROOT_PATH + "/src/translations/pl.json"))},
            {lang: "CZ", file: JSON.parse(fs.readFileSync(process.env.ROOT_PATH + "/src/translations/cz.json"))}
        ];
    }

    static async updateTranslations(ctx) {
        const lang = ctx.request.body.lang.toLowerCase();
        const file = JSON.stringify(ctx.request.body.file, null, 2);

        fs.writeFile(process.env.ROOT_PATH + "/src/translations/" + lang + ".json", file, function writeJSON(err) {
            if (err) return console.log(err);
        });

        ctx.body = {success: true};
    }

}

module.exports = TranslationsController;
