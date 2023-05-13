/**
 *  configuración modulos(middlewares) de la pipeline
 */
const express = require('express')
const viewEngine = require('express-handlebars')            
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')


module.exports = (serverExpress)=>{
    serverExpress.use(cookieParser())
    serverExpress.use(express.urlencoded( {extended: true} ))
    serverExpress.use(express.json())
    //-------- configuracion SESSION (cookie) -----------------
    serverExpress.use(session(
        {
            secret: process.env.SECRET_KEY_SESSIONS_ID,
            resave: false,
            saveUninitialized: false,
            cookie: {
                path: '/',
                httpOnly: true,
                secure: false,
                maxAge: 360000,
        }
    }))
    //-------- configuracion view-engine con HANDLEBARS ----------------------
    serverExpress.set('views', __dirname + '/../views')
    serverExpress.engine('hbs', viewEngine.create(
        {
            extname: 'hbs',
            defaultLayout: '__Layout',
            layoutsDir: __dirname + '/../views/shared/Layouts',
            partialsDir: __dirname + '/../views/shared/Partials',
            helpers: {
                split: (cadena, separador, posicion) => cadena.split(separador)[posicion],
                operacion: (valor1, operdor, valor2) => {
                    switch (operador) {
                        case '+':
                            return valor1 + valor2
                        case '-':
                            return valor1 - valor2
                        case '*':
                            return valor1 * valor2
                        case '/':
                            return valor1 / valor2
                    }
                }
            }                                                                          
        }
    ).engine)

    serverExpress.use('/public', express.static('public', { index:false, maxAge:'1d' } ))     
}