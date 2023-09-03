const express=  require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const User =  require('./models/user');
// mongoose.connect('mongodb://localhost:27017/signUpDemo', { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => {
//         console.log("MONGO CONNECTION OPEN!!!")
//     })
//     .catch(err => {
//         console.log("OH NO MONGO CONNECTION ERROR!!!!")
//         console.log(err)
//     })
require('dotenv').config();


const dbUrl = process.env.DB_URL

console.log( dbUrl)

mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
      .then(() => {
          console.log("MONGO CONNECTION OPEN!!!")
      })
      .catch(err => {
          console.log("OH NO MONGO CONNECTION ERROR!!!!")
          console.log(err)
      })

      
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))

app.use(express.urlencoded({extended:true}))

app.use(session({ secret: 'notagoodsecret' }))

const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/login')
    }
    next();
}
app.get('/',(req,res)=>{
    res.send('This is the home page');

})
app.get('/register',(req,res)=>{
    res.render('register');

})
app.post('/register',async (req,res)=>{
    // res.render('register');
    // res.send(req.body)
    const {password,username} = req.body;
    // const hash = await bcrypt.hash(password,12);
    const user = new User({ username,password})
    await user.save();
    req.session.user_id = user._id;
    // req.session.user._id  = user._id;
    // res.send(user);
    res.redirect('/');
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const foundUser = await User.findAndValidate(username, password);
    if (foundUser) {
        req.session.user_id = foundUser._id;
        res.redirect('/secret');
    }
    else {
        res.redirect('/login')
    }
})
app.post('/logout', (req, res) => {
    req.session.user_id = null;
    // req.session.destroy();
    res.redirect('/login');
})

app.get('/secret',(req,res)=>{
    res.render('secret');

})

app.get('/topsecret', requireLogin, (req, res) => {
    res.send("TOP SECRET!!!")
})

app.listen(3000,()=>{
    console.log('Server on 3000');

})