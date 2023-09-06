
const express = require('express');
// const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const rsaPemToJwk = require('./rsa-pem-to-jwk');
// const cors = require('cors');
const app = express();
const fs = require("fs");
// openssl genrsa -out privateKey.pem 512
var privateKey = fs.readFileSync("./privateKey.pem");
// openssl rsa -in privateKey.pem -pubout -out publicKey.pem
var publicKey = fs.readFileSync("./publicKey.pem");
// app.use(cors())

const allowCrossDomain = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', '*');
  // intercept OPTIONS method
  if (req.method == 'OPTIONS') {
    res.send(200);
  } else {
    next();
  }
};

app.use(allowCrossDomain);

app.use(express.json());


app.get('/', (req, res) => {
  let private = rsaPemToJwk(privateKey.toString(), undefined, 'private')
  let public = rsaPemToJwk(publicKey.toString(), undefined, 'public')
  res.json({
    message: "Server Up and Running",
    keys: [public, private]
  })
});

app.listen(process.env.PORT || 8080)