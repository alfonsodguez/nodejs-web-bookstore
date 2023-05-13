const express = require('express')                           
const mongoose = require('mongoose')
const configServer  = require('./config_server/middleware')  
const routingServer = require('./config_server/routingMAIN')
require('dotenv').config()

const server = express()  
configServer(server)    
routingServer(server)   
server.listen(3000)    

mongoose.connect(process.env.MONGO, (err, datos) => {
    if (!err) {
        console.log('...conectados al servidor MONGODB: AgapeaDB, al puerto 27017...')
    } else {
        console.log('Error en la conexion a MongoDB: ', err)
    }
})
