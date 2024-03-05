const mongoose = require('mongoose');
const {Schema} = mongoose;

const UserSchema = new Schema({
    companyname: {
        type: String,
      },
      Businesstype: {
        type: String,
      },
      CurrencyType: {
        type: String,
      },
      FirstName: {
        type: String,
      },
      LastName: {
        type: String,
      },
      password:{
          type:String,
      },
      email: {
        type: String,
      },
      address: {
        type: String,
      },
      companyImageUrl: {
          type: String // Store the file path of the profile image
      },
      resetPasswordToken: String,
});

module.exports = mongoose.model('user',UserSchema)