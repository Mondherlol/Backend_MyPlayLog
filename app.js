const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const session= require('express-session')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const bodyParser = require('body-parser');


require('dotenv').config()
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

const gamesRoutes = require('./routes/games')
const timeToBeatRoutes = require('./routes/timeToBeat')
const userRoutes = require('./routes/userRoute2')
const listRoutes = require('./routes/listRoute')


const app = express()
app.use(express.json())
app.use(bodyParser.json())

app.use(session({
  secret: 'secretcode',
  resave:true, 
  saveUninitialized:true,
}))

app.use(cookieParser("secretcode"))
app.use(passport.initialize())
app.use(passport.session())

require("./auth/passportConfig")(passport)

app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.1.253:3000', "http://192.168.1.162:3000", "http://192-168-1-253.nip.io:3000", "http://185-129-38-53.nip.io:3000", "http://141.95.162.17:3000","http://141-95-162-17.nip.io:3000"],
  credentials:true,
}))



app.use(morgan('dev'))



app.get('/ping', (req, res) => {
    res.send('pong');
  });



app.use('/api/user', userRoutes)
app.use('/api/games', gamesRoutes)
app.use('/api/timeToBeat', timeToBeatRoutes)
app.use('/api/lists', listRoutes)



module.exports = app    
