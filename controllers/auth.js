const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
    host : 'localhost',
    user : process.env.USER,
    password : process.env.PASSWORD,
    database: process.env.DATABASE
});


exports.login = async (req,res) => {
    try {
        const {username,password} = req.body;
        if(!username || !password){
            return res.status(400).render('login',{
                message: 'Please provide email and password'
            });
        }
        db.query('SELECT * FROM user WHERE username=?',[username], async (error,results) =>{
            console.log(results);
            if(error){
                console.log(error);
            }
            if(!results || !(await bcrypt.compare(password,results[0].password))){
                res.status(401).render('login',{
                    message:'Username and password do not match'
                });
            }
            else {
                const id = results[0].id;
                const token = jwt.sign({id},process.env.JWT_SECRET,{
                    expiresIn : process.env.JWT_EXPIRES_IN
                    
                })
                console.log("The token is"+token);
                const cookieOptions = {
                    expires : new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES *24*60*60*1000
                    ),
                    httpOnly: true
                }
                res.cookie('jwt', token , cookieOptions );
                res.status(200).redirect("/landingpage");
            }
        });

    } catch (error) {
        console.log(error);
    }

}


exports.register = (req,res) => {
    console.log(req.body);
    // res.json({

    // });
    // const username = req.body.username;
    // const password = req.body.password;
    // const password_confirm = req.body.password_confirm;

    const {username,password,password_confirm} = req.body;
    db.query('SELECT username FROM user where username= ?',[username], async (error,results) => {
        if(error){
            console.log(error);
        }
        if(results.length > 0){
            return res.render('register', {
                message: 'Username already in use. Please select another username'
            });
        }
        else if(password!==password_confirm){
            return res.render('register', {
                message: 'Password do not match'
            });
        }


        let hashedPassword = await bcrypt.hash(password,8);
        console.log(hashedPassword);

        db.query('INSERT INTO user SET ?',{username:username,password:hashedPassword }, (error,results) => {
            if(error){
                console.log(error);
            } 
            else{
                console.log(results);
                return res.render('register', {
                    message: 'User registered'
                });
            }
        });


    });
    //res.send("Form Submitted");
}

exports.logout = (req,res,next) => {
    // console.log(req);
    // if(req.cookies.token){
    //   res.clearCookie('token');
    //   return res.render('login', {
    //     message: 'Logged out'
    // });
    // }
    // else{
    //     console.log("could not logout");
    //     // return res.redirect('/landingpage');
        // return res.render('login', {
        //     message: 'Logged out'
        // });
    // }
    //req.logout();
    // console.log(req.session);
    // req.session = null;
    
    return res.render('login', {
        message: 'Logged out'
    });
};