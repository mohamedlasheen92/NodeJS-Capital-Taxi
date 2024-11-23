const mongoose = require('mongoose');

const dbConnection = () =>
  mongoose.connect(process.env.MONGO_URI)
    .then((value) => console.log(`Connected to MongoDB: ${value.connection.name} | ${value.connection.host} | ${value.connection.port}`))


module.exports = dbConnection;