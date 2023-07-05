/**
 *  modulo de enrutamiento del servidor express 
 */
const routeCliente = require('./routingCliente')  
const routeREST = require('./routingREST')         
const routeTienda = require('./routingTienda')    
const routePedido = require('./routingPedido')    
const routeHome = require('./routingHome')

module.exports = (app) => {  
    app.use('/',        routeHome)
    app.use('/Cliente', routeCliente)    
    app.use('/Tienda',  routeTienda)
    app.use('/Pedido',  routePedido)
    app.use('/api',     routeREST) 
}