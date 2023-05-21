/**
 *  configuración modulos(middlewares) de la pipeline
 */
const express = require('express')
const viewEngine = require('express-handlebars')            
const cookieParser = require('cookie-parser')
const session = require('express-session')

module.exports = (app) => {
    app.use(cookieParser())
    app.use(express.urlencoded( {extended: true} ))
    app.use(express.json())
    //-------- configuracion SESSION (cookie) -----------------
    app.use(session(
        {
            secret: process.env.SECRET_SESSION_ID,
            resave: false,
            saveUninitialized: false,
            cookie: {
                path: '/',
                httpOnly: true,
                secure: false,
                maxAge: 360000,
        }
    }))
    //-------- configuracion view-engine handlebars ----------------------
    app.set('views', __dirname + '/../views')
    app.engine('hbs', viewEngine.create(
        {
            extname: 'hbs',
            defaultLayout: '__Layout',
            layoutsPath: __dirname + '/../views/shared/Layouts',
            partialsPath: __dirname + '/../views/shared/Partials',
            helpers: {
                split: (cadena, separador, posicion) => cadena.split(separador)[posicion],
                operacion: (valor1, operador, valor2) => {
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

    app.use('/public', express.static('public', { index:false, maxAge:'1d' } ))     
}
