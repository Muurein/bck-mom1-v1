//så vi kan använda .env-filen
const { Client } = require("pg");
require("dotenv").config();

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


//skapa tabell
//name gick inte att använda (gav felmeddelande) så uppdaterade det till coursename
client.query(`
    DROP TABLE IF EXISTS courses;
    CREATE TABLE courses(
        id SERIAL PRIMARY KEY,
        code VARCHAR(15) NOT NULL,
        coursename VARCHAR(100) NOT NULL,
        progression VARCHAR(1) NOT NULL,
        syllabus VARCHAR(300) NOT NULL
    )
`);

// client.query(`
//     CREATE TABLE guestbook(
//         id SERIAL PRIMARY KEY,
//         message TEXT NOT NULL,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     )
// `);