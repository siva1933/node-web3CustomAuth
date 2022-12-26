
const express = require('express');
const app = express();

app.use('/', (req,res)=>{
  res.json({
    message:"Server Up and Running"
  })
});

app.listen(process.env.PORT || 8080)