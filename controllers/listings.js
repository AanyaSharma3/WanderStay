const Listing = require("../models/listing.js");
const axios = require('axios');

module.exports.index = async (req,res,next)=>{
    const allListings = await Listing.find({});
    //console.log(allListings[0]);
    res.render("listings/index",{allListings});
}

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req,res,next)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show",{listing});
}

module.exports.createListing = async (req,res,next)=>{
    //let {title,description,price,image,location,country}=req.body;
    try{
        let url = req.file.path;
        let filename = req.file.filename;
        const newListing=new Listing(req.body.listing);        
        newListing.owner = req.user._id;
        newListing.image = {url,filename};

        const address = req.body.listing.location;
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: address,
                format: 'json',
                limit: 1
            },
            headers: {
                'User-Agent': 'WanderstayApp' // API block na ho isliye app name dena zaroori hai
            }
        });
        let coordinates = [75.8577, 22.7196];
        if (response.data && response.data.length > 0) {
            const lat = parseFloat(response.data[0].lat);
            const lon = parseFloat(response.data[0].lon);
            coordinates = [lon, lat]; // GeoJSON standard format: [Longitude, Latitude]
        }
        newListing.geometry = {
            type: "Point",
            coordinates: coordinates
        };

        await newListing.save();
        req.flash("success","New Listing created!");
        res.redirect("/listings");
    }catch (err) {
        console.error("Geocoding Error:", err);
        next(err);
    }
}

module.exports.renderEditForm = async (req,res,next)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
}

module.exports.updateListing = async (req,res,next)=>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
   
    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url,filename};
    await listing.save();
    }

    req.flash("success"," Listing Updated!");
    res.redirect(`/listings/${id}`);
}

module.exports.deleteListing = async (req,res,next)=>{
    let {id} = req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success"," Listing Deleted!");
    res.redirect("/listings");
}

