const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');


const gamesRoutes = require('./routes/games')
const timeToBeatRoutes = require('./routes/timeToBeat')
const listRoutes = require('./routes/listRoute')

const app = express()
app.use(express.json())
app.use(bodyParser.json())


app.use(cors())
app.use(morgan('dev'))


mongoose.set('strictQuery', true)

mongoose.connect('mongodb+srv://myplaylogdev:motarukibda123@myplaylog.qofddhp.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((err) => console.log('Connexion à MongoDB échouée !'));


app.get('/ping', (req, res) => {
    res.send('pong');
  });


app.use('/api/games', gamesRoutes)
app.use('/api/timeToBeat', timeToBeatRoutes)
app.use('/api/lists', listRoutes)



module.exports = app    
