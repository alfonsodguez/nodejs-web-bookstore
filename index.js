const express = require('express');                           
const mongoose = require('mongoose');
const configServer  = require('./config_server/middleware');  
const routingServer = require('./config_server/routingMAIN'); 

const server = express();  
configServer(server);    
routingServer(server);   
server.listen(3000);    

mongoose.connect(process.env.connectionStringMongoDB, (err, datos) => {
    if (!err) {
        console.log('...conectados al servidor MONGODB: AgapeaDB, al puerto 27017...');
    } else {
        console.log('ERROR EN CONEXION MONGODB: ', err);
    }
});
