
//så vi kan använda .env-filen
const { Client } = require("pg");
const express = require("express");
require("dotenv").config();

//starta applikation
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded( { extended: true } )); //behövs för att läsa in och ta emot all typ av formulär-data

//Ansluter till databasen
const client = new Client ({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    //måste vara med i ej-betal-versionen eftersom man inte har tillgång till krypterad kod
    ssl: {
        rejectUnauthorized: false,
    },
});

client.connect((error) => {
    if(error) {
        console.log("Anslutningsfel: " + error);
    } else {
        console.log("Ansluten till databasen");
    }
});


//Routing
//Startisda
app.get("/", async(req, res) => {
    res.render("index");
});

app.get("form", async(req, res) => {
    res.render("form");
})

app.get("about", (req, res) => {
    res.render("about");
});


//Starta servern
app.listen(process.env.PORT, () => {
    console.log("Servern startad på: " + process.env.PORT);
});