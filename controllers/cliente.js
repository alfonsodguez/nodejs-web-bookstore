const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const logger = require('winston')
const emailSevice = require('./email-service')
const Cliente = require('../models/cliente')
const Credenciales = require('../models/credenciales')
const Direccion = require('../models/direccion')
const Provincia = require('../models/provincia')
const Municipio = require('../models/municipio')
const Pedido = require('../models/pedido')
const Libro = require('../models/libro')

const URL = {
    LOGIN:  "http://localhost:3000/Cliente/Login",
    LIBROS: "http://localhost:3000/Tienda/Libros/0"
}

module.exports = { 
    getRegistro: async (req, res) => {                
        try {
            const provincias = await _findProvincias()

            res.status(200).render('Cliente/Registro.hbs', { layout: null, listaProvincias: provincias })
        } catch (err) {
            logger.error('Error al recuperar las provincias ', err)
        }                  
    },
    postRegistro: async (req, res) => { 
        const {nombre, apellidos, nif, telefono, username, email, password, calle, cp, codPro, codMun} = req.body
        const direccionId = new mongoose.Types.ObjectId
        const clienteId = new mongoose.Types.ObjectId
        const credenciaslesId = new mongoose.Types.ObjectId

        const provincia = await Provincia.findOne({ codPro: codPro }).select('_id').lean()
        const municipio = await Municipio.findOne({ codPro: codPro, codMun: codMun }).select('_id').lean()

        const insertCliente = Cliente({ 
            _id: clienteId,
            nombre,
            apellidos,
            nif,
            cuentaActiva: false,
            telefono,
            credenciales: credenciaslesId,
            direcciones: [ direccionId ],  
            historicoPedidos: [], 
            imagenAvatar: ''
        }).save()

        const salt = 10
        const hash = bcrypt.hashSync(password, salt)

        const insertCredenciales = Credenciales({ 
            _id: credenciaslesId,
            username, 
            email,
            hash,
        }).save() 

        const insertDirecciones = Direccion({
            _id: direccionId,
            calle,
            cp,
            provincia: provincia._id,
            municipio: municipio._id, 
            esprincipal: true,
            clienteid: clienteId
        }).save() 

        // resolvemos las querys
        Promise.all([insertCliente, insertCredenciales, insertDirecciones])  
            .then(async () => { 
                await _emailConfirmacionRegistro({email, nombre})

                res.status(200).render('Cliente/RegistroOK.hbs', { layout: null }) 
            }) 
            .catch(async (err) => { 
                const provincias = await _findProvincias()

                res.status(200).render('Cliente/Registro.hbs', { layout: null, listaProvincias: provincias, mensajeError: 'Error interno del servidor...' })
            })
    },
    getLogin: (req, res) => {
        res.status(200).render('Cliente/Login.hbs', { layout: null })
    },
    postLogin: async (req, res) => {          
        try {
            const {password, email} = req.body
            const credenciales = await _findCredenciales({email})
            const isValidPassword = bcrypt.compareSync(password, credenciales.hash)

            if (isValidPassword) {
                const cliente = await Cliente
                    .findOne({ credenciales: credenciales._id }) 
                    .populate([ 
                        { path: 'credenciales', model: Credenciales },
                        { path: 'direccion',  model: Direccion, populate: [
                            { path: 'provincia', model: Provincia },
                            { path: 'municipio', model: Municipio }
                        ]},
                        { path: 'historicoPedidos', model: Pedido, populate: { path: 'elementosPedido.libroItem', model: Libro } }
                    ])
                    .lean()                                                                                 

                const newPedido = new Pedido({
                    _id: new mongoose.Types.ObjectId, 
                    gastosEnvio: 0.5,
                    subTotalPedido: 0,
                    totalPedido: 0,
                    estadoPedido: 'pendiente',
                    fechaPedido: Date.now(),
                    clientePedido: cliente._id,
                    elementosPedido: [] 
                })

                cliente.pedidoActual = newPedido    

                //creamos prop. cliente en la session y añadimos datos cliente
                req.session.cliente = cliente   

                res.redirect(URL.LIBROS)
            }
            res.status(200).render('Cliente/Login.hbs', { layout: null, mensajeErrorCustom: "Email o contraseña incorrectas, vuelve a intentarlo" })
        } catch (err) {
            res.status(200).render('Cliente/Login.hbs', { layout: null, mensajeError: 'Error en el server...' })
        }   
    },
    getActivarCuenta: async (req, res) => {
        try {
            const email = req.params.email
            const credenciales = await _findCredenciales({email})

            await Cliente.findOneAndUpdate(
                { 'credenciales': credenciales._id }, 
                { 'cuentaActiva': true },
                { new: true } 
            )

            res.redirect(URL.LOGIN)
        } catch (err) {
            res.status(200).render('Cliente/Registro.hbs', { layout: null, mensajeError: 'Error interno del servidor, intentelo de nuevo mas tarde...' })
        }
    },
    getComprobarEmail: (req, res) => {
        res.status(200).render('Cliente/CompruebaEmail.hbs', { layout: null })
    },
    postComprobarEmail: async (req, res) => {
        try {
            const email = req.body.email
            const credenciales = await _findCredenciales({email})

            if (credenciales != null) {
                // envio correo para poder cambiar la password
                res.redirect(URL.LOGIN)
            }     
            res.status(200).render('Cliente/CompruebaEmail.hbs', { layout: null, mensajeError: "Fallo en la conexion con el servidor,intentelo mas tarde..." })
        } catch (err) {
            res.status(200).render('Cliente/Registro.hbs', { layout: null, mensajeError: 'Error interno del servidor, intentelo de nuevo mas tarde...' })
        }
    },
    getCambioPassword: (req, res) => {
        res.status(200).render('Cliente/Password.hbs', { layout: null })
    },
    postCambioPassword: async (req, res) => {

    },
    getMiPerfil: (req, res) => {
        /** 
         * usamos un middleware en routingCliente.js para comprobar si existe constiable de session 
         * en rutas Cliente/Panel/*, en el se añaden las prop "cliente", "opcionesPanelPerfil" a la request
         */ 
        res.status(200).render('Cliente/MiPerfil.hbs', { cliente: req.cliente,  opcionesPanel: req.opcionesPanelPerfil })
    },
    postMiPerfil: async (req, res) => {
        // actualizamos datos cliente y session 
        for (const prop in req.body) {
            req.cliente[prop] = req.body[prop]
        }

        const {email, login} = req.body
        const cliente = req.cliente
        cliente.credenciales.email = email
        cliente.credenciales.login = login

        const updateCliente      = Cliente.updateOne({ _id: cliente._id }, cliente)
        const updateCredenciales = Credenciales.updateOne({ _id: cliente.credenciales._id }, { login, email })         
                            
        Promise
            .all([ updateCliente, updateCredenciales ]) 
            .then(() => {
                //actualizamos session
                req.session.cliente = cliente
                
                res.status(200).render('Cliente/PanelInicio.hbs', { cliente: cliente, opcionesPanel: req.opcionesPanelPerfil })
            })
            .catch((err) => {
                res.status(200).render('Cliente/PanelInicio.hbs',{
                    cliente: cliente, 
                    opcionesPanel: req.opcionesPanelPerfil, 
                    mensajeError: 'Error interno en el servidor, intentelo de nuevo mas tarde...' 
                })
            })
    },
    getPanelInicio: (req, res) => {
        res.status(200).render('Cliente/PanelInicio.hbs', { cliente: req.cliente, opcionesPanel: req.opcionesPanelPerfil })
    }
} 

async function _findProvincias() {
    return Provincia.find().sort({nombreProvincia: 1}).lean()  // utilizar lean ya que handlebas no admite propiedades de mongoose
}

async function _findCredenciales({email}) {
    return Credenciales.findOne({email}).select('_id').lean()
}

async function _emailConfirmacionRegistro({email, nombre}) {
    const cuerpoEmail = { 
        "Messages": [{
            "From": {
                "Email": "admin.agapea@gmail.com",
                "Name": "Agapea.com"
            },
            "To": [{
                "Email": email,
                "Name": nombre
             }],
            "Subject": "Bienvenido al portal Agapea.com",
            "TextPart": "Se ha registrado correctamente, active su cuenta para poder comenzar a comprar.",
            "HTMLPart": "<h3><strong>Se ha registrado correctamente en Agapea.com</strong></h3>" + `<br>Pulsa <a href="http://localhost:3000/Cliente/ActiconstCuenta/${email}">aqui </a>para acticonst su cuenta`
        }] 
    }

    try {
        await emailSevice.sendEmail({mensaje: cuerpoEmail})
    } catch (err) {
        logger.error('Fallo al enviar el email de confirmacion de registro', err)
    }
}