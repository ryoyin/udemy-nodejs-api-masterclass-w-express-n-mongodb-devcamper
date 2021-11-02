const mongoose = require('mongoose')

const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
        // useFindAndModify: false
    })

    console.log(`MongoDB Conencted: ${conn.connection.host}`.cyan)
}

module.exports = connectDB