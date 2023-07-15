/**
 *  modulo de enrutamiento del servidor express 
 */
const routeCliente = require('./routing-cliente')  
const routeREST    = require('./routing-REST')         
const routeTienda  = require('./routing-tienda')    
const routePedido  = require('./routing-pedido')    
const routeHome    = require('./routing-home')

module.exports = (app) => {  
    app.use('/',        routeHome)
    app.use('/Cliente', routeCliente)    
    app.use('/Tienda',  routeTienda)
    app.use('/Pedido',  routePedido)
    app.use('/api',     routeREST) 
}