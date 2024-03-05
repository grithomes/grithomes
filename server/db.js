const mongoose = require('mongoose');
// const mongoURI = 'mongodb+srv://katariaesha02:esha00046@cluster0.swwooje.mongodb.net/gofoomern?retryWrites=true&w=majority';
// const mongoURI = 'mongodb+srv://bablubhown:mycabinets@cluster0.evzfn2i.mongodb.net/cabinets?retryWrites=true&w=majority';
const mongoURI = 'mongodb+srv://bablubhown:mycabinets@cluster0.iyza0fm.mongodb.net/cabinets?retryWrites=true&w=majority&appName=Cluster0';
const mongoDB = async() => {
    mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true},async (err, result) => {
    if(err) console.log('Some Error -- ', err)
        else { 
             const fetch_data = await mongoose.connection.db.collection("users");
    console.log(fetch_data,"connect");
        }
    })
    // await mongoose.connect(mongoURI, {useNewUrlParser: true }, async (err, result) => {
    //     if(err) console.log('---', err)
    //     else {
            // console.log("connected"); 
            // const fetch_data = await mongoose.connection.db.collection("food_item");
            // fetch_data.find({}).toArray(async function(err , data){
            //     const food_catgory = await mongoose.connection.db.collection("food_category");
            //     food_catgory.find({}).toArray(function(err , catData){
            //         console.log( global.food_catgory = catData, "Cat DATA global")
            //     if(err) console.log(err);
            //     else 
            //     {
            //         global.food_item = data;
            //         global.food_catgory = catData;
            //     }
            //     })
            // })
    //     }
    // });
}


module.exports = mongoDB;