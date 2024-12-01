const mongoose = require('mongoose');
require('dotenv').config();


// const uri = 'mongodb://localhost:27017/chx-note';
const uri = process.env.MONGO_URI;

// const connectDB = async () => {
//     try {
//         await mongoose.connect(mongoURI);
//         console.log('MongoDB connected.');
//     } catch (error) {
//         console.error('Error connecting to MongoDB:', error);
//         process.exit(1);
//     }
// };

const connectDB = async () => {
    mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000
    }).then(() => {
        console.log("Conexão com o MongoDB Atlas bem-sucedida!");
    }).catch((error) => {
        console.error("Erro ao conectar ao MongoDB Atlas:", error);
    });
};

module.exports = connectDB;
