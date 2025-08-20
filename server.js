
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
    //skickar med en tom array för att inte skicka med några errors när formuläret inte skickats
    res.render("form", {
        errors: [],
        code: "",
        coursename: "",
        progression: "",
        syllabus: ""
    });
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

    let errors = [];

    //felmeddelanden 
    if ( code === "" || coursename === "" || progression === "" || syllabus === "" ) {
        errors.push("Vänligen fyll i alla fält");
    }
    
    if ( !["A", "a", "B", "b"].includes(progression) ) {
        errors.push("Vänligen skriv in ett a eller ett b");
    } 
    




    //hantera sidan på olika sätt beroende på om errors förekommer eller inte
    if (errors.length > 0) {
        res.render("form", { 
            errors: errors,
            code: code,
            coursename: coursename,
            progression: progression,
            syllabus: syllabus
        });
    } else {
        //SQL-fråga
        await client.query(`INSERT INTO courses(code, coursename, progression, syllabus) VALUES($1, $2, $3, $4)`,
        [code, coursename, progression, syllabus]
        );
        res.redirect("/form");
    }; 
});

//allt som vi tar emot i formuläret ska vi skicka till hemsidan
//förelänging 01:15:26


//ta bort kurs
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


///https://www.youtube.com/watch?v=fuBa1C2CyCI&t=187s   25:10 + fråga leChat