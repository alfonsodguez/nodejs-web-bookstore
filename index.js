const express = require('express')                           
const mongoose = require('mongoose')
const middleware = require('./middlewares/config')
const routing = require('./config/main')
require('dotenv').config()

const app = express()  
middleware(app)    
routing(app)   
app.listen(3000)    

mongoose.connect(process.env.MONGO_URI, (err, data) => {
    if (!err) {
        console.log('Conexion a Mongo OK')
    } else {
        console.log('Error en la conexion a Mongo', err)
    }
})
