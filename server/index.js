const express = require('express')
const app = express()
const port = 3001
const mongoDB = require("./db")
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
var path = require('path');
mongoDB();

// Set maximum payload size limit
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use((req,res,next)=>{
  res.setHeader("Access-Control-Allow-Origin","https://mycabinets.vercel.app");
  // res.setHeader("Access-Control-Allow-Origin","http://localhost:3000");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
})


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use(express.json())
app.use('/api', require("./Routes/CreateUser"));
// app.use('/api', require("./Routes/Createcategory"));
app.use('/api', require("./Routes/DisplayData"));
app.use('/api', require("./Routes/OrderData"));
app.use('/api', require("./Routes/TestApi"));
app.use('/api', require("./Routes/ForgotPassword"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})