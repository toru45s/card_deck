const NotesModel = require('../models/Notes');
const mongoose = require('mongoose');

class NotesService {

    static async getAllNotes(){
        const Coupons  = await NotesModel.find();
        return Coupons;
    }

    // add notes
    static async addNotes(title,description){
        const Notes = new NotesModel({
            title: title,
            description: description,
            status: 1
        });
        const NotesInstance = await Notes.save().then((result) => {
            return result;
        }).catch((err) => {
            console.log(err);
        });

        return NotesInstance;
    }

    // update notes
    static async updateNotes(title,description,id){
        const NotesInstance = await NotesModel.findByIdAndUpdate(id, {
            title: title,
            description: description,
            status: 1
        }, { new: true }).then((result) => {
            return result;
        }).catch((err) => {
            console.log(err);
        });

        return NotesInstance;
    }

    
}

module.exports = NotesService;