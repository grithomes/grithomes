require('dotenv').config();
const express = require('express')
const app = express()
const port = process.env.PORT || 3001
const mongoDB = require("./db")
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
var path = require('path');
const { job } = require('./cron');
mongoDB();

// Set maximum payload size limit
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Start the cron job
job.start();

app.use((req, res, next) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [
    "https://grithomes.vercel.app",
    "https://www.grit.homes",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5175"
  ];
  if (allowedOrigins.indexOf(req.headers.origin) !== -1) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin, X-Requested-With, Accept");
  }

  next();
});



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
app.use('/api', require("./Routes/InventoryRoute"));
app.use('/api', require("./Routes/NotesRoute"));
app.use('/api', require("./Routes/JobRoute"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
