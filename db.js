const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

const connectDB = async () => {
    mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
    }).then(() => {
        console.log("Conexão com o MongoDB Atlas bem-sucedida!");
    }).catch((error) => {
        console.error("Erro ao conectar ao MongoDB Atlas:", error);
    });
};

module.exports = connectDB;
