const express = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");

dotenv.config({path : './.env'});

const app = express();

const db = mysql.createConnection({
    host : 'localhost',
    user : process.env.USER,
    password : process.env.PASSWORD,
    database: process.env.DATABASE
});

const publicDirectory = path.join(__dirname,'./public');
app.use(express.static(publicDirectory));
//Parsing form data
app.use(express.urlencoded({extended:false}));
//Parse Json body
app.use(express.json());
app.use(cookieParser());

app.set('view engine', 'hbs');


db.connect((err) => {
    if (err) {console.log(err); return;}
    console.log('Connected!');
});

// db.query('select * from actor',(err,rows)=>{
//     if(err) throw err;
//     console.log("Output: ");
//     rows.forEach((row) => {
//       console.log(`${row.actor_id} is ${row.first_name}`);
//     });
// });

app.use('/',require('./routes/pages'));
app.use('/auth',require('./routes/auth'));

app.listen(5000, () =>{
    console.log("Server started at port 5000");
});
