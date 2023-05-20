const express = require('express')                           
const mongoose = require('mongoose')
const config = require('./config_server/middleware')  
const routing = require('./config_server/routingMAIN')
require('dotenv').config()

const app = express()  
config(app)    
routing(app)   
app.listen(3000)    

mongoose.connect(process.env.MONGO_URI, (err, data) => {
    if (!err) {
        console.log('Conexion a Mongo OK')
    } else {
        console.log('Error en la conexion a Mongo: ', err)
    }
})
