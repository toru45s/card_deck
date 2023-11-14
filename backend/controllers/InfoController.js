const InfoService = require('../services/InfoService');
const OptionModel = require('../models/Option');
const { exec } = require("child_process");

class InfoController {

    static async dashboardInfo(ctx) {
        const revenue = await InfoService.getMonthlyRevenue();
        const connections = await InfoService.getMaxConcurrentConnections();

        ctx.body = {
            revenue: revenue,
            connections: connections,
            admin_email: await OptionModel.findOne({key: "admin_email"}),
            interface_info_en: await OptionModel.findOne({key: "interface_info_en"}),
            interface_info_il: await OptionModel.findOne({key: "interface_info_il"}),
            interface_info_spa: await OptionModel.findOne({key: "interface_info_spa"}),
            interface_info_zh: await OptionModel.findOne({key: "interface_info_zh"}),
            interface_info_ukr: await OptionModel.findOne({key: "interface_info_ukr"}),
            interface_info_pl: await OptionModel.findOne({key: "interface_info_pl"}),
            interface_info_cz: await OptionModel.findOne({key: "interface_info_cz"}),
            trial_ended_en: await OptionModel.findOne({key: "trial_ended_en"}),
            trial_ended_il: await OptionModel.findOne({key: "trial_ended_il"}),
            trial_ended_spa: await OptionModel.findOne({key: "trial_ended_spa"}),
            trial_ended_zh: await OptionModel.findOne({key: "trial_ended_zh"}),
            trial_ended_ukr: await OptionModel.findOne({key: "trial_ended_ukr"}),
            trial_ended_cz: await OptionModel.findOne({key: "trial_ended_cz"}),
            trial_ended_pl: await OptionModel.findOne({key: "trial_ended_pl"}),
            decks_total_price: await OptionModel.findOne({key: "decks_total_price"})
        }
    }

    static async getInterfaceInfo(ctx) {
        const lang = ctx.query.lang;

        ctx.body = await OptionModel.findOne({key: "interface_info_"+lang});
    }

    static async getTrialEndedText(ctx) {
        ctx.body = {
            trial_ended_en: await OptionModel.findOne({key: "trial_ended_en"}),
            trial_ended_il: await OptionModel.findOne({key: "trial_ended_il"}),
            trial_ended_spa: await OptionModel.findOne({key: "trial_ended_spa"}),
            trial_ended_zh: await OptionModel.findOne({key: "trial_ended_zh"}),
            trial_ended_ukr: await OptionModel.findOne({key: "trial_ended_ukr"}),
            trial_ended_cz: await OptionModel.findOne({key: "trial_ended_cz"}),
            trial_ended_pl: await OptionModel.findOne({key: "trial_ended_pl"})
        }
    }

    static async getTotalDeckPrice(ctx) {
        const lang = ctx.query.lang;

        ctx.body = await OptionModel.findOne({key: "decks_total_price"});
    }

    static async sendNotification(ctx) {
        const role = ctx.request.body.role;
        const enMessage = ctx.request.body.message_en;
        const ilMessage = ctx.request.body.message_il;
        const spaMessage = ctx.request.body.message_spa;
        const zhMessage = ctx.request.body.message_zh;
        const ukrMessage = ctx.request.body.message_ukr;
        const plMessage = ctx.request.body.message_pl;
        const czMessage = ctx.request.body.message_cz;

        if (InfoService.sendUserNotification(role, {message_en: enMessage, message_il: ilMessage, message_spa: spaMessage, message_zh: zhMessage, message_ukr: ukrMessage, message_pl: plMessage, message_cz: czMessage })) {
            ctx.body = {success: true};
        }
    }

    static async recompile(ctx) {
        exec('npm run build');

        ctx.body = {success: true};
    }

    static async saveOptions(ctx) {
        const adminEmail = ctx.request.body.admin_email;
        const decksTotalPrice = ctx.request.body.decks_total_price;
        const interfaceInfoEN = ctx.request.body.interface_info_en;
        const interfaceInfoIL = ctx.request.body.interface_info_il;
        const interfaceInfoSPA = ctx.request.body.interface_info_spa;
        const interfaceInfoZH = ctx.request.body.interface_info_zh;
        const interfaceInfoUKR = ctx.request.body.interface_info_ukr;
        const interfaceInfoPL = ctx.request.body.interface_info_pl;
        const interfaceInfoCZ = ctx.request.body.interface_info_cz;
        const adminEmailOption = await OptionModel.findOne({key: "admin_email"});
        const interfaceInfoOptionEN = await OptionModel.findOne({key: "interface_info_en"});
        const interfaceInfoOptionIL = await OptionModel.findOne({key: "interface_info_il"});
        const interfaceInfoOptionSPA = await OptionModel.findOne({key: "interface_info_spa"});
        const interfaceInfoOptionZH = await OptionModel.findOne({key: "interface_info_zh"});
        const interfaceInfoOptionUKR = await OptionModel.findOne({key: "interface_info_ukr"});
        const interfaceInfoOptionPL = await OptionModel.findOne({key: "interface_info_pl"});
        const interfaceInfoOptionCZ = await OptionModel.findOne({key: "interface_info_cz"});
        const TrialEndedEN = ctx.request.body.trial_ended_en;
        const TrialEndedIL = ctx.request.body.trial_ended_il;
        const TrialEndedSPA = ctx.request.body.trial_ended_spa;
        const TrialEndedZH = ctx.request.body.trial_ended_zh;
        const TrialEndedUKR = ctx.request.body.trial_ended_ukr;
        const TrialEndedPL = ctx.request.body.trial_ended_pl;
        const TrialEndedCZ = ctx.request.body.trial_ended_cz;
        const trialEndedOptionEN = await OptionModel.findOne({key: "trial_ended_en"});
        const trialEndedOptionIL = await OptionModel.findOne({key: "trial_ended_il"});
        const trialEndedOptionSPA = await OptionModel.findOne({key: "trial_ended_spa"});
        const trialEndedOptionZH = await OptionModel.findOne({key: "trial_ended_zh"});
        const trialEndedOptionUKR = await OptionModel.findOne({key: "trial_ended_ukr"});
        const trialEndedOptionPL = await OptionModel.findOne({key: "trial_ended_pl"});
        const trialEndedOptionCZ = await OptionModel.findOne({key: "trial_ended_cz"});
        const decksTotalPriceOption = await OptionModel.findOne({key: "decks_total_price"});

        if (adminEmailOption) {
            adminEmailOption.value = adminEmail;
            adminEmailOption.save();
        } else {
            const newAdminEmailOption = new OptionModel({
                key: "admin_email",
                value: adminEmail
            });
            newAdminEmailOption.save();
        }

        if (decksTotalPriceOption) {
            decksTotalPriceOption.value = decksTotalPrice;
            decksTotalPriceOption.save();
        } else {
            const newDecksTotalPriceOption = new OptionModel({
                key: "decks_total_price",
                value: decksTotalPrice
            });
            newDecksTotalPriceOption.save();
        }

        if (interfaceInfoOptionEN) {
            interfaceInfoOptionEN.value = interfaceInfoEN;
            interfaceInfoOptionEN.save();
        } else {
            const newInterfaceInfoOption = new OptionModel({
                key: "interface_info_en",
                value: interfaceInfoEN
            });
            newInterfaceInfoOption.save();
        }

        if (interfaceInfoOptionIL) {
            interfaceInfoOptionIL.value = interfaceInfoIL;
            interfaceInfoOptionIL.save();
        } else {
            const newInterfaceInfoOption = new OptionModel({
                key: "interface_info_il",
                value: interfaceInfoIL
            });
            newInterfaceInfoOption.save();
        }

        if (interfaceInfoOptionSPA) {
            interfaceInfoOptionSPA.value = interfaceInfoSPA;
            interfaceInfoOptionSPA.save();
        } else {
            const newInterfaceInfoOption = new OptionModel({
                key: "interface_info_spa",
                value: interfaceInfoSPA
            });
            newInterfaceInfoOption.save();
        }

        if (interfaceInfoOptionZH) {
            interfaceInfoOptionZH.value = interfaceInfoZH;
            interfaceInfoOptionZH.save();
        } else {
            const newInterfaceInfoOption = new OptionModel({
                key: "interface_info_zh",
                value: interfaceInfoZH
            });
            newInterfaceInfoOption.save();
        }

        if (interfaceInfoOptionUKR) {
            interfaceInfoOptionUKR.value = interfaceInfoUKR;
            interfaceInfoOptionUKR.save();
        } else {
            const newInterfaceInfoOption = new OptionModel({
                key: "interface_info_ukr",
                value: interfaceInfoUKR
            });
            newInterfaceInfoOption.save();
        }

        if (interfaceInfoOptionPL) {
            interfaceInfoOptionPL.value = interfaceInfoPL;
            interfaceInfoOptionPL.save();
        } else {
            const newInterfaceInfoOption = new OptionModel({
                key: "interface_info_pl",
                value: interfaceInfoPL
            });
            newInterfaceInfoOption.save();
        }

        if (interfaceInfoOptionCZ) {
            interfaceInfoOptionCZ.value = interfaceInfoCZ;
            interfaceInfoOptionCZ.save();
        } else {
            const newInterfaceInfoOption = new OptionModel({
                key: "interface_info_cz",
                value: interfaceInfoCZ
            });
            newInterfaceInfoOption.save();
        }

        if (trialEndedOptionEN) {
            trialEndedOptionEN.value = TrialEndedEN;
            trialEndedOptionEN.save();
        } else {
            const newTrialEndedOption = new OptionModel({
                key: "trial_ended_en",
                value: TrialEndedEN
            });
            newTrialEndedOption.save();
        }

        if (trialEndedOptionIL) {
            trialEndedOptionIL.value = TrialEndedIL;
            trialEndedOptionIL.save();
        } else {
            const newTrialEndedOption = new OptionModel({
                key: "trial_ended_il",
                value: TrialEndedIL
            });
            newTrialEndedOption.save();
        }

        if (trialEndedOptionSPA) {
            trialEndedOptionSPA.value = TrialEndedSPA;
            trialEndedOptionSPA.save();
        } else {
            const newTrialEndedOption = new OptionModel({
                key: "trial_ended_spa",
                value: TrialEndedSPA
            });
            newTrialEndedOption.save();
        }

        if (trialEndedOptionZH) {
            trialEndedOptionZH.value = TrialEndedZH;
            trialEndedOptionZH.save();
        } else {
            const newTrialEndedOption = new OptionModel({
                key: "trial_ended_zh",
                value: TrialEndedZH
            });
            newTrialEndedOption.save();
        }

        if (trialEndedOptionUKR) {
            trialEndedOptionUKR.value = TrialEndedUKR;
            trialEndedOptionUKR.save();
        } else {
            const newTrialEndedOption = new OptionModel({
                key: "trial_ended_ukr",
                value: TrialEndedUKR
            });
            newTrialEndedOption.save();
        }

        if (trialEndedOptionPL) {
            trialEndedOptionPL.value = TrialEndedPL;
            trialEndedOptionPL.save();
        } else {
            const newTrialEndedOption = new OptionModel({
                key: "trial_ended_pl",
                value: TrialEndedPL
            });
            newTrialEndedOption.save();
        }

        if (trialEndedOptionCZ) {
            trialEndedOptionCZ.value = TrialEndedCZ;
            trialEndedOptionCZ.save();
        } else {
            const newTrialEndedOption = new OptionModel({
                key: "trial_ended_cz",
                value: TrialEndedCZ
            });
            newTrialEndedOption.save();
        }


        ctx.body = {success: true};
    }

}

module.exports = InfoController;
