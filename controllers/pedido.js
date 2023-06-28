const fs = require('fs')
const pdfDocument = require('pdfkit-table')
const logger = require('winston')
const Libro = require('../models/libro')
const Pedido = require('../models/pedidos')
const Cliente = require('../models/cliente')
const emailSevice = require('../models/email-service')

module.exports = {
    addLibroPedido: async (req, res) => {
        try {           
            const libroId = req.params.id
            //recuperar session y añadir libro expandido al pedido
            const pedido = new Pedido(req.session.cliente.pedidoActual) 

            const libro = pedido.articulos.find((libro) => libro.libroItem === libroId)
            if (libro != null) {
                libro.cantidadItem += 1
            }
            else {
                pedido.articulos.push({ libroItem: libroId, cantidadItem: 1 })
            }

            await _renderizarMostrarPedido({pedido, req, res})
        } catch (err) {
            logger.error('Error interno del servidor ', err)
        }
    },
    sumarCantidadPedido: async (req, res) => {
        const libroId = req.params.id
        const pedido = new Pedido(req.session.cliente.pedidoActual)  

        pedido.articulos.forEach(libro => {
            if (libro.libroItem === libroId ) {
                libro.cantidadItem += 1 
            }
        })

        await _renderizarMostrarPedido({pedido, req, res})
    },
    restarCantidadPedido: async (req, res) => {
        const libroId = req.params.id
        const pedido = new Pedido(req.session.cliente.pedidoActual)

        const indexLibro = pedido.articulos.findIndex(libro => libro.libroItem === libroId)

        if (indexLibro != -1) {
            const cantidad = pedido.articulos[indexLibro].cantidadItem

            if (cantidad > 1) {
                pedido.articulos[indexLibro].cantidadItem -= 1
            }
            else {
                _eliminarLibroPedido({pedido, libroId})
            }
        }
        await _renderizarMostrarPedido(pedido,req, res)
    },
    eliminarLibroPedido: async (req, res) => {
        const libroId = req.params.id
        const pedido = new Pedido(req.session.cliente.pedidoActual)

        _eliminarLibroPedido({pedido, libroId})
            
        if(pedido.articulos.length > 0){
            await _renderizarMostrarPedido(pedido, req, res)            
        }
        else{
            //actualizar datos pedido
            pedido.CalcularTotalPedido()

            //actualizar session 
            req.session.cliente.pedidoActual = pedido

            res.status(200).redirect('/Tienda/Libros/0')
        }
    },
    finalizarPedido: async (req, res) => {
        try {
            const pedido = new Pedido(req.session.cliente.pedidoActual)
            pedido.estadoPedido = 'en curso'
            const insertPedido = await Pedido(pedido).save()  

            const cliente = new Cliente(req.session.cliente)
            cliente.historicoPedidos.push(insertPedido._id)

            const updateCliente = await Cliente.updateOne(
                { _id: cliente._id }, 
                { historicoPedidos: cliente.historicoPedidos } 
            )
            
            if (updateCliente === 1) {
                //expandimos pedido para generar factura....
                const itemsExpanded = await Libro.populate(pedido.articulos, { path: 'libroItem' })
                pedido.articulos= itemsExpanded
            
                _crearFacturaPDF({pedido})
                await _emailEnvioPdf({cliente})

                res.status(200).redirect('/Tienda/Libros/0')
            }
        } catch (err) {
            logger.error('Error al realizar al actualizar las colecciones pedido, cliente', err)
        }
    }
}

function _eliminarLibroPedido({pedido, libroId}) {
    const borrarLibro = pedido.articulos.filter(libro => libro.libroItem != libroId)
    
    pedido.articulos = borrarLibro
}

async function _renderizarMostrarPedido({pedido, req, res}) {
    await pedido.CalcularTotalPedido()
    pedido.articulos = await Libro.populate(pedido.articulos, { path: 'libroItem' })

    //actualizamos session 
    req.session.cliente.pedidoActual = pedido           

    res.status(200).render('Pedido/MostrarPedido.hbs', { layout: null, pedido: pedido.toObject() }) 
}

function _crearFacturaPDF({pedido}) {
    const factura   = new pdfDocument()
    const pdfPath   = __dirname + '/../pdf/factura-' + pedido._id.toString() + '.pdf'
    const imagePath = __dirname + '/../public/images/cabecera.png'
    const cabecera  = 'RESUMEN DE LA CESTA'
    const separador = '________________________'
    
    factura.pipe(fs.createWriteStream(pdfPath))
    factura.image(imagePath, { align: 'center' })
    factura.fontSize(20).text(cabecera)
    factura.fontSize(20).text(separador)
    
    const filas = pedido.articulos.map(itemPedido => {
        return [
            itemPedido.libroItem.titulo,
            itemPedido.libroItem.precio,
            itemPedido.cantidadItem,
            (itemPedido.libroItem.precio * itemPedido.cantidadItem)
        ]
    })

    const tablaItemsPedido = {
        headers: ["Titulo del Libro", "Precio del Libro", "Cantidad de libros", "Subtotal Libro"],
        rows: filas
    }

    factura.table(tablaItemsPedido, { width: 300 })
    factura.fontSize(20).text(separador)
    factura.fontSize(20).text('Subtotal Pedido: ' + pedido.subtotal + ' €')
    factura.fontSize(18).text('Gastos de Envio: ' + pedido.GastosDeEnvio + ' €')
    factura.fontSize(20).text('TOTAL PEDIDO: ' + pedido.totalPedido + ' €')
    factura.end()
}

async function _emailEnvioPdf({cliente}) {
    const pedidoId = cliente.pedidoActual._id.toString()
    const direccionPpal = cliente.direcciones.find((direccion) => direccion.esPrincipal === true)
    const pdfPath = '/pdf/factura-' + pedidoId + '.pdf'

    // pasar el contendio del fichero .pdf a base64 para poderse mandar por email
    const datos = fs.readFileSync(process.cwd() + pdfPath)
    const adjuntoBase64 = datos.toString('base64')
    const cuerpoEmail = {
        "Messages": [{
            "From": {
                "Email": "admin@agapea.com",
                "Name": "admin"
            },
            "To": [{
                "Email": cliente.credenciales.email,
                "Name": cliente.nombre + ',' + cliente.apellidos
            }],
            "Subject": "Pedido realizado correctamente en Agapea.com",
            "TextPart": "",
            "HTMLPart": ` 
                <div><h3><strong>Pedido Finalizado con id: ${pedidoId}</strong></h3></div>
                <hr/>
                <div>
                    <p> Estimado ${cliente.nombre}: </p>
                    <p> Muchas gracias por realizar el pedido en nuestra web. Los datos de su pedido van a ser procesados para su envio.</p>
                    <p> Para conocer el estado de su envio acceda a Panel del Cliente --> Mis Pedidos. Tambien podra realizar modificaciones sobre el mismo si lo desea. </p>
                </div>
                <hr/>
                <div>
                    <p><strong>Direccion de envio: ${direccionPpal}</strong></p>
                    <p> Calle: .... , CP: ... </p>
                    <p> Localidad: ...  Provincia: .... </p>
                </div>
            `,
            "Attachments": [{
                "ContentType": "text/plain",
                "Filename": `factura-${pedidoId}.pdf`,
                "Base64Content": adjuntoBase64
            }]
        }]
    }

    try {
        await emailSevice.sendEmail({mensaje: cuerpoEmail})
    } catch (err) {
        logger.error('Error en envio del pdf al email ', err)
    }
}

