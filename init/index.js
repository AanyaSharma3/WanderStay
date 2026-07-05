const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const axios = require("axios");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderstay";

main().then(()=>{
    console.log("Connected to DB");
}).catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(MONGO_URL);
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const initDB = async () =>{
 try{
    await Listing.deleteMany({});
    const updatedData = initData.data.map((obj)=>({...obj,owner:"6a43a16a5cd3fb94732a313f"}));
    
    for (let listing of updatedData) {
            if (listing.location) {
                console.log(`Fetching coordinates for: "${listing.title}" (${listing.location})`);
                
                try {
                    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
                        params: { q: listing.location, format: 'json', limit: 1 },
                        headers: { 'User-Agent': 'WanderstaySeedData' }
                    });

                    let coordinates = [75.8577, 22.7196]; // Backup Default (Indore)

                    if (response.data && response.data.length > 0) {
                        const lat = parseFloat(response.data[0].lat);
                        const lon = parseFloat(response.data[0].lon);
                        coordinates = [lon, lat]; // GeoJSON standard format [Lng, Lat]
                        console.log(`-> Found: ${coordinates}`);
                    } else {
                        console.log(`-> Location not found, using default backup.`);
                    }

                    // Strict GeoJSON format object injection
                    listing.geometry = {
                        type: "Point",
                        coordinates: coordinates
                    };

                } catch (apiErr) {
                    console.error(`Error fetching for ${listing.title}:`, apiErr.message);
                    listing.geometry = { type: "Point", coordinates: [75.8577, 22.7196] };
                }

                // 1 second rukaenge taaki OpenStreetMap block na kare
                await delay(1000);
            }
        }
    
    await Listing.insertMany(updatedData);
    console.log("data was initialized");
 }catch(err){
    console.log("Initialization Error:", err);
 }
}

initDB();
