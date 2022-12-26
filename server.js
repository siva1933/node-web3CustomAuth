
const express = require('express');
const rsaPemToJwk = require('./rsa-pem-to-jwk');
const app = express();
const fs = require("fs");
// openssl genrsa -out privateKey.pem 512
var privateKey = fs.readFileSync("./privateKet.pem");
// openssl rsa -in privateKey.pem -pubout -out publicKey.pem
var publicKey = fs.readFileSync("./publicKey.pem");

app.use('/', (req, res) => {
  let private = rsaPemToJwk(privateKey.toString(), undefined, 'private')
  let public = rsaPemToJwk(publicKey.toString(), undefined, 'public')
  res.json({
    message: "Server Up and Running",
    keys:[public,private]
  })
});

app.listen(process.env.PORT || 8080)