/**
 *  modulo de enrutamiento del servidor express 
 */
const routeCliente =  require('./routingCliente');  
const routeREST = require('./routingREST');         
const routeTienda = require('./routingTienda');    
const routePedido = require('./routingPedido');    

module.exports = (servidorExpress) => {  
    servidorExpress.use('/Cliente', routeCliente);    
    servidorExpress.use('/Tienda', routeTienda);
    servidorExpress.use('/Pedido', routePedido)
    servidorExpress.use('/api', routeREST); 
}