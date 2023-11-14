const mongoose = require("mongoose");

const connectDB = () => {
    mongoose
        .connect(process.env.MONGO_URL, {
            useFindAndModify: false,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        })
        .then(() => console.log("Connected to MongoDB"))
        .catch(e => console.log(`Error: ${e}`));
};

module.exports = connectDB;
