const express = require('express')                           
const mongoose = require('mongoose')
const configServer  = require('./config_server/middleware')  
const routingServer = require('./config_server/routingMAIN')
require('dotenv').config()

const app = express()  
configapp(app)    
routingapp(app)   
app.listen(3000)    

mongoose.connect(process.env.MONGO_URI, (err, datos) => {
    if (!err) {
        console.log('Conexion a Mongo OK')
    } else {
        console.log('Error en la conexion a Mongo: ', err)
    }
})
