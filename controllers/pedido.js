const fs = require('fs')
const pdfDocument = require('pdfkit-table')
const Libro = require('../models/libro')
const Pedido = require('../models/pedido')
const Cliente = require('../models/cliente')
const emailSevice = require('../models/email-service')
const {URL, RENDER_PATH, ERROR_MESSAGE} = require('../models/enums')
const {SessionNotFoundError} = require('../errors/custom')

module.exports = {
    addLibroPedido: async (req, res, next) => { 
        try {       
            //recuperar session y añadir libro expandido al pedido
            const libroId = req.params.id
            const session = req.session.cliente

            if (!session) {
                throw new SessionNotFoundError(ERROR_MESSAGE.SESSION)
            }

            const pedido = new Pedido(session.cliente.pedidoActual)
            const libro = pedido.articulos.find((libro) => String(libro.libroItem._id) === String(libroId))
    
            if (libro) {
                libro.cantidadItem += 1
            } else {
                pedido.articulos.push({ libroItem: libroId, cantidadItem: 1 })
            }

            await _renderizarMostrarPedido({pedido, req, res})
        } catch (err) {
            next(err)
        }
    },
    sumarCantidadPedido: async (req, res) => {
        const libroId = req.params.id
        const pedido = new Pedido(req.session.cliente.pedidoActual)
        const pos = pedido.articulos.findIndex(libro => String(libro.libroItem._id) === String(libroId))

        if (pos != -1) {
            pedido.articulos[pos].cantidadItem += 1
        }

        await _renderizarMostrarPedido({pedido, req, res})
    },
    restarCantidadPedido: async (req, res) => {
        const libroId = req.params.id
        const pedido = new Pedido(req.session.cliente.pedidoActual)
        const pos = pedido.articulos.findIndex(libro => String(libro.libroItem._id) === String(libroId))

        if (pos != -1) {
            const cantidad = pedido.articulos[pos].cantidadItem

            if (cantidad > 1) {
                pedido.articulos[pos].cantidadItem -= 1
            } else {
                pedido.articulos = _eliminarLibroPedido({pedido, libroId})
            }
        }
        await _renderizarMostrarPedido({pedido,req, res})
    },
    eliminarLibroPedido: async (req, res) => {
        const libroId = req.params.id
        const pedido = new Pedido(req.session.cliente.pedidoActual)

        pedido.articulos = _eliminarLibroPedido({pedido, libroId})
            
        if (pedido.articulos.length > 0) {
            await _renderizarMostrarPedido({pedido, req, res})            
        } else {
            //actualizar datos pedido
            pedido.CalcularTotalPedido()
    
            //actualizar session 
            req.session.cliente.pedidoActual = pedido
    
            res.redirect(URL.TIENDA)      
        }
    },
    finalizarPedido: async (req, res) => {
        const cliente = req.session.cliente
        const pedido = {
            ...cliente.pedidoActual,
            estado: 'en curso',
            fecha: Date.now()
        }
        cliente.historicoPedidos.push(pedido._id)
        
        const insertPedido = Pedido(pedido).save()
        const updateCliente = Cliente.updateOne(
            { _id: cliente._id },
            { $push: { historicoPedidos: pedido._id } } 
        )

        Promise
            .all([ insertPedido, updateCliente ])
            .then(async () => {                
                _crearFacturaPDF({pedido})
                await _emailEnvioPdf({cliente})

                res.status(200).render(RENDER_PATH.FINALIZAR_PEDIDO)
            })
            .catch((err) => {
                console.log('Error al guardar pedido y datos cliente', err)
                next(err)
            })
    }
}

function _eliminarLibroPedido({pedido, libroId}) {
    const articulosActualizado = pedido.articulos.filter(libro => String(libro.libroItem._id) != String(libroId))
    
    return articulosActualizado
}

async function _renderizarMostrarPedido({pedido, req, res}) {
    try {
        await pedido.CalcularTotalPedido()
        pedido.articulos = await Libro.populate(pedido.articulos, { path: 'libroItem' })
    
        //actualizamos session 
        req.session.cliente.pedidoActual = pedido      
    
        res.status(200).render(RENDER_PATH.DETALLES_PEDIDO, { layout: null, pedido: pedido.toObject() }) 
    } catch (err) {
       next(err)
    }
}

function _crearFacturaPDF({pedido}) {
    const factura   = new pdfDocument()
    const pdfPath   = __dirname + '/../pdf/factura-' + pedido._id.toString() + '.pdf'
    const imagePath = __dirname + '/../public/images/cabecera.png'
    const cabecera  = 'RESUMEN DE LA CESTA'
    const separador = '_'
    
    factura.pipe(fs.createWriteStream(pdfPath))
    factura.image(imagePath, { align: 'center' })
    factura.fontSize(20).text(cabecera)
    factura.fontSize(20).text(separador.repeat(cabecera.length))
    
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

    factura.table(tablaItemsPedido, { width: 500 })
    factura.fontSize(10).text(separador.repeat(30))
    factura.fontSize(10).text('Subtotal Pedido: ' + pedido.subtotal + ' €')
    factura.fontSize(10).text('Gastos de Envio: ' + pedido.gastosEnvio + ' €')
    factura.fontSize(10).text('TOTAL PEDIDO: ' + pedido.total + ' €')
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
                    <p><strong>Direccion de envio: </strong></p>
                    <p> Calle: ${direccionPpal.calle}, CP: ${direccionPpal.cp} </p>
                    <p> Localidad: ${direccionPpal.municipio.nombre}  Provincia: ${direccionPpal.provincia.nombre} </p>
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
        console.log('Error en envio del pdf al email ', err)
    }
}

