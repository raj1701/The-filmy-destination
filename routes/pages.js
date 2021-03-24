const express = require("express");
const mysql = require("mysql");
const router = express.Router();

const db = mysql.createConnection({
    host : 'localhost',
    user : process.env.USER,
    password : process.env.PASSWORD,
    database: process.env.DATABASE
});

db.connect((err) => {
    if (err) {console.log(err); return;}
    console.log('Connected!');
});

router.get('/', (req,res) => {
    res.render('index');
});

router.get('/register', (req,res) => {
    res.render('register');
});

router.get('/login', (req,res) => {
    res.render('login');
});

router.get('/landingpage', (req,res) => {
    db.query('SELECT * FROM movies order by popularity desc limit 4', async (error,results) => {
        console.log(results);
        console.log(results[0].link);
        if(error){
            console.log(error);
            res.send("Some error");
        }
        else {
            db.query('SELECT * FROM movies order by release_date desc limit 4', async (error,results_latest) => {
                if(error){
                    console.log(error);
                    res.send("Some error")
                }
                else{
                    res.render('landingpage',{
                        results : results,
                        results_latest : results_latest
                    });
                }
            });

        }
        
    });
    

})

// router.get('/contentpage', (req,res) => {
//     res.render('contentpage');
// })

router.get('/content', (req,res) => {
    let title = req.query.title;
    db.query("UPDATE movies set popularity=popularity+1 where title = ?;",[title], async (error,results) => {
        if(error){
            console.log(error);
        }
        else console.log("Success")
    });
    db.query("SELECT name FROM celebs join movieassociations on celebs.id=movieassociations.celebid join movies on movies.id=movieassociations.movieid where title = ? ",[title], async (error,results) => {
        if(error){
            console.log(error);
            res.send("Some error");
        }
        

        else {
            console.log(results);
            res.render('contentpage',{
                results : results,
                title : title,
                link:results[0].link
            });
        }
    });
})

router.get('/contentpage', (req,res) => {
    res.render('contentpage');
})

router.post('/search', (req,res) => {
    let search_parameter = '%'+req.body.search_parameter+'%';
    db.query("SELECT * FROM movies where title like ? limit 4",[search_parameter], async (error,results) => {
        if(error){
            console.log(error);
            res.send("Some error");
        }
        else {
            console.log(results);
            var results_latest=null;
            res.render('landingpage',{
                results : results,
                results_latest : results_latest
            });
        }
    });
})


module.exports = router;