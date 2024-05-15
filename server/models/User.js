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
      User2FirstName: {
        type: String,
      },
      User2LastName: {
        type: String,
      },
      User2email: {
        type: String,
      },
      User1_Mobile_Number: {
        type: String,
      },
      User2_Mobile_Number: {
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
      gstNumber: {
        type: String, // GST number field
      },
      TaxName: {
        type: String, // GST number field
        default: 'GST',
      },
      resetPasswordToken: String,
});

module.exports = mongoose.model('user',UserSchema)