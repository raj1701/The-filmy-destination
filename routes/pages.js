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
    db.query('SELECT * FROM movies order by release_date desc limit 8', async (error,results_latest) => {
        if(error){
            console.log(error);
            res.send("Some error")
        }
        else{
            for(i in results_latest){
                results_latest[i].rating_100=results_latest[i].rating*10;
            }
            // var date =  results[0].recently_added;
            res.render('landingpage',{
                results_latest : results_latest
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
    db.query("SELECT * FROM movies where title like ? limit 8",[search_parameter], async (error,results) => {
        if(error){
            console.log(error);
            res.send("Some error");
        }
        else {
            console.log(results);
            for(i in results){
                results[i].rating_100=results[i].rating*10;
            }
            res.render('landingpage',{
                results : results,
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
    db.query("SELECT distinct * FROM feedback where userid = ? limit 4;",[userid], async (error,results) =>{
        if(error){
            console.log(error);
            res.send("Some error");
        }
        else {
            db.query("SELECT distinct * FROM movies natural join user_watched join user on user.id=user_watched.userid where userid=? limit 8",[userid], async (error,results_watched) => {
                if(error){
                    console.log(error);
                    res.send(error);
                }

                else {
                    for(i in results_watched){
                        results_watched[i].rating_100=results_watched[i].rating*10;
                    }
                    res.render('profilepage',{

                        results : results,
                        results_watched : results_watched
                    });
                }
            });
        }
    });
})


router.get('/genre', (req,res) => {
    db.query("Select distinct genre from movies ;",[],async (error,results) => {
        if(error)
        {
            console.log(error);
            res.send(error);
        }
        else{
            res.render('select_genre',{
                results : results
            })
        }
    })
})

router.post('/genre_select', (req,res) => {
    var genre= '%'+req.body.genre+'%';
    console.log(genre);
    db.query("SELECT * FROM movies where genre like ? order by popularity desc limit 8; ",[genre], async (error,results_genre) => {
        if(error){
            console.log(error);
            res.send(error);
        }
        else{
            //console.log(results_genre);
            for(i in results_genre){
                results_genre[i].rating_100=results_genre[i].rating*10;
            }
            res.render('landingpage',{
                results_genre : results_genre,
                genre : req.body.genre
            })
        }
    })
})

router.get('/celeb_star', (req,res) => {
    res.render('select_celeb');
})

router.post('/celeb_select', (req,res) => {
    var celeb= '%'+req.body.celeb+'%';
    db.query("SELECT * FROM movies where id in (select movies.id from movies join movieassociations on movies.id=movieassociations.movieid join celebs on celebs.id=movieassociations.celebid where name like ? ) limit 8; ",[celeb], async (error,results_celeb) => {
        if(error){
            console.log(error);
            res.send(error);
        }
        else{
            console.log(results_celeb);
            for(i in results_celeb){
                results_celeb[i].rating_100=results_celeb[i].rating*10;
            }
            res.render('landingpage',{
                results_celeb : results_celeb,
                celeb : req.body.celeb
            })
        }
    })
})

router.get('/rating', (req,res) => {
    db.query("SELECT * FROM movies order by rating desc limit 8;",[], async (error,results_rating) => {
        if(error){
            console.log(error);
            res.send(error);
        }
        else{
            console.log(results_rating);
            for(i in results_rating){
                results_rating[i].rating_100=results_rating[i].rating*10;
            }
            res.render('landingpage',{
                results_rating : results_rating
            })
        }
    });
})

router.get('/popularity', (req,res) => {
    db.query("SELECT * FROM movies order by popularity desc limit 8;",[], async (error,results_popularity) => {
        if(error){
            console.log(error);
            res.send(error);
        }
        else{
            console.log(results_popularity);
            for(i in results_popularity){
                results_popularity[i].rating_100=results_popularity[i].rating*10;
            }
            res.render('landingpage',{
                results_popularity : results_popularity
            })
        }
    })
})

router.get('/coming_soon', (req,res) => {
    db.query("SELECT * FROM movies where release_date > '2020-01-01' order by release_date desc limit 8",[], async (error,results_coming_soon) => {
        if(error){
            console.log(error);
            res.send(error);
        }
        else{
            console.log(results_coming_soon);
            for(i in results_coming_soon){
                results_coming_soon[i].rating_100=results_coming_soon[i].rating*10;
            }
            res.render('landingpage',{
                results_coming_soon : results_coming_soon
            })
        }
    })
})

module.exports = router;