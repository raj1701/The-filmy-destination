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
                    // var date =  results[0].recently_added;
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
    var userid = parseInt(req.cookies.userid);
    db.query("INSERT INTO user_watched values(?,?); ",[userid,title], async (error,results) => {
        if(error){
            console.log(error);
        }
        else console.log("success");
    });
    db.query("UPDATE movies set popularity=popularity+1 where title = ?;",[title], async (error,results) => {
        if(error){
            console.log(error);
        }
        else console.log("Success")
    });
    db.query("SELECT * FROM celebs join movieassociations on celebs.id=movieassociations.celebid join movies on movies.id=movieassociations.movieid where title = ? ",[title], async (error,results) => {
        if(error){
            console.log(error);
            res.send("Some error");
        }
        else {
            db.query("SELECT * FROM movies where title = ? ",[title], async (error,movie) => {
                 if(error){
                     console.log(error);
                     res.send("Some error");
                 }
                 else{
                     res.render('contentpage',{
                         results : results,
                         movie : movie
                     });
                 }
            });

        }
    });
})

router.get('/person',(req,res) => {
    let name=req.query.name;
    db.query("select * from celebs where name= ? ",[name],async(error,person) => {
        if(error){
            console.log(error);
            res.send("Some error");
        }
        else{
            res.render('personpage',{
                person : person
            });
        }
    })
})

router.get('/contentpage', (req,res) => {
    res.render('contentpage');
})

router.get('/personpage', (req,res) => {
    res.render('personpage');
})

router.get('/feedback', (req,res) => {
    res.render('feedback');
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

router.post('/feedback_submit', (req,res) => {
    var userid = parseInt(req.cookies.userid);
    var feedback = req.body.feedback;
    db.query("INSERT INTO feedback values (?,?);",[userid,feedback], async (error,results) => {
        if(error){
            console.log(error);
            res.send("Some error");
        }
        else {
            console.log(results);
            res.render('feedback',{
                message : "Feedback submitted successfully"
            })
        }
    });
})

router.get('/profile', (req,res) => {
    var userid = parseInt(req.cookies.userid);
    db.query("SELECT * FROM feedback where userid = ?;",[userid], async (error,results) =>{
        if(error){
            console.log(error);
            res.send("Some error");
        }
        else {
            db.query("SELECT * FROM movies natural join user_watched join user on user.id=user_watched.userid where userid=?",[userid], async (error,results_watched) => {
                if(error){
                    console.log(error);
                    res.send(error);
                }
                else {
                    res.render('profilepage',{
                        results : results,
                        results_watched : results_watched
                    });
                }
            });
        }
    });
})

module.exports = router;