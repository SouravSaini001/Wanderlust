const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../Models/listing.js');

// connecting to database 
main()
    .then(() => {
        console.log("Connection Formed...")
    })
    .catch((err) => {
        console.log(err);
    })

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const initDB = async() => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj,owner: "68dd466dbf2cfa7f278b93c8"}));
    await Listing.insertMany(initData.data);
    console.log("Data was initalized successfully..")
}

initDB();
