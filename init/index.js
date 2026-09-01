const mongoose = require("mongoose");

const initData = require("./data.js");
const Listing = require("../Models/listing.js");

// Connecting to MongoDB Atlas

main()
    .then(() => {
        console.log("Connection Formed...");
        initDB();
    })
    .catch((err) => {
        console.log(err);
    });


async function main() {

    await mongoose.connect(
        "mongodb+srv://YOUR_USERNAME:YOUR_NEW_PASSWORD@cluster0.srq3uao.mongodb.net/wanderlust?retryWrites=true&w=majority&appName=Cluster0"
    );

}


// Initialize Database

const initDB = async () => {

    // Delete existing listings
    await Listing.deleteMany({});

    // Add owner to every listing
    const listingsWithData = initData.data.map((obj) => ({
        ...obj,

        owner: new mongoose.Types.ObjectId(
            "6a958d69a2578cc2cd389aa9"
        ),
    }));

    // Insert all listings
    await Listing.insertMany(listingsWithData);

    console.log("Data was initialized successfully..");

    // Close connection
    await mongoose.connection.close();
};