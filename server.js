
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
    //Läs ut data från databasen
    client.query("SELECT * FROM courses", (error, addedCourse) => {
        if(error) {
            console.log("Fel vid utläsning av data");
        } else {
            res.render("index", {
                courses: addedCourse.rows

            });
        }
    })
    // //sortera kurserna
    // const sortButtonEl = document.getElementById("sortButton");

    // sortButtonEl.addEventListener("click", sortCourses());

    // function sortCourses() {
    //     client.query(`SELECT * FROM courses ORDER BY coursename DESC`);
    // }
});

// varken form-sidan eller about-sidan fungerade, men något på Stack Overflow nämnde att det kunde fungera om man tog bort piloperatorn (det funakde)
app.get("/form", function async(req, res) {
    res.render("form");
});

app.get("/about", function(req, res) {
    res.render("about");
});

//skicka formulärets data
app.post("/form", async(req, res) => {
    
    //Lägg till kurs
    const code = req.body.code;
    const coursename = req.body.coursename;
    const progression = req.body.progression;
    const syllabus = req.body.syllabus;

    //SQL-fråga
    const addedCourse = await client.query(`INSERT INTO courses(code, coursename, progression, syllabus) VALUES($1, $2, $3, $4)`,
        [code, coursename, progression, syllabus]
    );

    //Felmeddelanden
    //Hämtar variabler
    // const enterFieldEl = document.getElementById("enterField");
    // const addCourseButtonEl = document.getElementById("addCourseButton");
    // //om användare lämnat ett fält tomt
    // if (code <= 0 || coursename <= 0 || progression <= 0 || syllabus <= 0) {

    //     errorCodeEl.innerHTML = "Vänligen fyll i alla fält";
    //     addCourseButtonEl.disable = true;

    // } else if(code > 0 || coursename > 0 || progression > 0 || syllabus > 0) {

    //     addCourseButtonEl.disable = false;
    // }



    res.redirect("/form");

}) //allt som vi tar emot i formuläret ska vi skicka till hemsidan
//förelänging 01:15:26

app.post("/delete", async(req, res) => {
    //hämta id:t till den kurs som ska raders
    const id = req.body.deleteItemId;

    try {
        //ta bort kursen från databasen
        await client.query(`DELETE FROM courses WHERE id = $1`,
            [id]
        ); 
    } catch (error) {
            console.log("Fel vid radering av data");
    }
    
    //låt användaren komma tillbaka till startsidan
    res.redirect("/");
});

//Starta servern
app.listen(process.env.PORT, () => {
    console.log("Servern startad på: " + process.env.PORT);
});