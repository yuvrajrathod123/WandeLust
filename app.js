const express = require("express");
const mongoose = require("mongoose");
const app = express();


main()
.then((res)=>{
    console.log("connection successful");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

app.get("/", (req, res)=>{
    res.send("hiii i am root ");
})

app.listen(8080, ()=>{
    console.log("server is listening on port 8080");
})