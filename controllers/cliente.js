const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const emailSevice = require('../models/email-service')
const Cliente = require('../models/cliente')
const Credenciales = require('../models/credenciales')
const Direccion = require('../models/direccion')
const Provincia = require('../models/provincia')
const Municipio = require('../models/municipio')
const Pedido = require('../models/pedido')
const Libro = require('../models/libro')
const {URL, RENDER_PATH, ERROR_MESSAGE} = require('../models/enums')
const { DataNotFoundError } = require('../errors/custom')

const GASTOS_ENVIO = 3

module.exports = { 
    getRegistro: async (req, res) => {                
        const provincias = await _findProvincias()

        if (!provincias) {
            throw new DataNotFoundError('Error al recuperar las provincias')
        }

        res.status(200).render(RENDER_PATH.REGISTRO, { layout: null, listaProvincias: provincias })  
    },
    postRegistro: async (req, res) => { 
        const { nombre, apellidos, nif, telefono, username, email, password, calle, cp, codProvincia, codMunicipio } = req.body
        const clienteId = new mongoose.Types.ObjectId
        const direccionId = new mongoose.Types.ObjectId
        const credenciaslesId = new mongoose.Types.ObjectId

        try {
            const provincia = await Provincia.findOne({ codProvincia }).select('_id').lean()
            const municipio = await Municipio.findOne({ codProvincia, codMunicipio }).select('_id').lean()
            
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

            const saltRounds = 10
            const salt = await bcrypt.genSalt(saltRounds)
            const hash = await bcrypt.hash(password, salt)
    
            const insertCredenciales = Credenciales({ 
                _id: credenciaslesId,
                username, 
                email,
                hash,
            }).save() 
    
            const insertDirecciones = Direccion({
                _id: direccionId,
                clienteId,
                calle,
                cp,
                provincia: provincia._id,
                municipio: municipio._id, 
                esPrincipal: true,
            }).save() 
    
            // resolvemos las querys
            Promise
                .all([ insertCliente, insertCredenciales, insertDirecciones ])  
                .then(async () => { 
                    await _emailActivacionCuenta({ email, nombre })
    
                    res.status(200).render(RENDER_PATH.REGISTRO_OK, { layout: null }) 
                }) 
                .catch(async (err) => { 
                    const provincias = await _findProvincias()

                    res.status(400).render(RENDER_PATH.REGISTRO, { layout: null, listaProvincias: provincias, mensajeError: ERROR_MESSAGE.REGISTRO })
                })

        } catch (err) {
            res.status(500).render(RENDER_PATH.REGISTRO, { layout: null, mensajeError: ERROR_MESSAGE.SERVER })
        }
    },
    getActivarCuenta: async (req, res) => {
        const email = req.params.email

        try {
            const credenciales = await _findCredenciales({ email })

            if (credenciales) {
                await Cliente.findOneAndUpdate(
                    { 'credenciales': credenciales._id }, 
                    { 'cuentaActiva': true },
                    { new: true } 
                )

                res.redirect(URL.LOGIN)
            } else {
                res.status(400).render(RENDER_PATH.REGISTRO_OK, { layout: null, mensajeError: ERROR_MESSAGE.ACTIVAR })
            }
        } catch (err) {
            res.status(500).render(RENDER_PATH.REGISTRO_OK, { layout: null, mensajeError: ERROR_MESSAGE.SERVER })
        }
    },
    getLogin: (req, res) => {
        res.status(200).render(RENDER_PATH.LOGIN, { layout: null })
    },
    postLogin: async (req, res) => {          
        const { password, email } = req.body
        
        try {
            let view, mensajeError
            const credenciales = await _findCredenciales({ email })
            const isValidPassword = await bcrypt.compare(password, credenciales.hash)
            
            if (isValidPassword) {
                const cliente = await Cliente
                    .findOne({ credenciales: credenciales._id }) 
                    .populate([ 
                        { path: 'credenciales', model: Credenciales },
                        { path: 'direcciones',  model: Direccion, populate: [
                            { path: 'provincia', model: Provincia },
                            { path: 'municipio', model: Municipio }
                        ]},
                        { path: 'historicoPedidos', model: Pedido, populate: { path: 'articulos.libroItem', model: Libro } }
                    ])
                    .lean()   

                const cuentaActiva = cliente.cuentaActiva

                if (cuentaActiva) {
                    const newPedido = new Pedido({
                        gastosEnvio: GASTOS_ENVIO,
                        subtotal: 0,
                        total: 0,
                        estado: 'pendiente',
                        cliente: cliente._id,
                        articulos: [] 
                    })

                    cliente.pedidoActual = newPedido    

                    // creamos prop. cliente en la session y añadimos datos cliente
                    req.session.cliente = cliente   

                    res.redirect(URL.TIENDA)    
                } else {
                    view = RENDER_PATH.REGISTRO_OK
                    mensajeError = ERROR_MESSAGE.ACTIVAR
                }
            } else {
                view = RENDER_PATH.LOGIN
                mensajeError = ERROR_MESSAGE.LOGIN
            }

            res.status(400).render(view, { layout: null, mensajeError })
        } catch (err) {
            res.status(500).render(RENDER_PATH.LOGIN, { layout: null, mensajeError: ERROR_MESSAGE.SERVER })
        }   
    },
    getForgotPassword: (req, res) => {
        res.status(200).render(RENDER_PATH.FORGOT_PASSWORD, { layout: null })
    },
    postForgotPassword: async (req, res) => {
        try {
            const email = req.body.email
            const credenciales = await _findCredenciales({ email })
        
            if (credenciales) {
                const username  = credenciales.username
                const credsId   = credenciales._id
                const sessionId = req.session.id

                _emailCambioPassword({ email, name: username, credsId, sessionId })
                
                res.redirect(URL.LOGIN)
            } else {
                res.status(400).render(RENDER_PATH.FORGOT_PASSWORD, { layout: null, mensajeError: ERROR_MESSAGE.CHECK_EMAIL })
            }
        } catch (err) {
            res.status(500).render(RENDER_PATH.LOGIN, { layout: null, mensajeError: ERROR_MESSAGE.SERVER })
        }
    },
    getCambioPassword: async (req, res) => {
        const sessionId      = req.query.id
        const credencialesId = req.query.credsid
        const id             = req.session.id

        if (sessionId === id) {
                req.session.credsId = credencialesId

                res.status(200).render(RENDER_PATH.PASSWORD, { layout: null })
        } else {
            res.status(500).send()
        }
    },
    postCambioPassword: async (req, res) => {
        const password       = req.body.password
        const credencialesId = req.session.credsId 

        try {
            const saltRounds = 10
            const salt = await bcrypt.genSalt(saltRounds)
            const hash = await bcrypt.hash(password, salt)

            await Credenciales.updateOne(
                { _id: credencialesId },
                { $set: { hash: hash } }
            )

            res.redirect(URL.LOGIN)
        } catch (err) {
            res.status(500).send()
        }
    },
    getPanelInicio: (req, res) => {
        const cliente = req.cliente
        const opcionesPanel = req.opcionesPanelPerfil
    
        res.status(200).render(RENDER_PATH.PANEL, { cliente, opcionesPanel })
    },
    getMiPerfil: (req, res) => {
        /** 
         * usamos un middleware en routingCliente.js para comprobar si existe session en rutas
         * Cliente/Panel/*, en el se añaden las prop "cliente", "opcionesPanelPerfil" a la request
         */ 
        const cliente = req.cliente
        const opcionesPanel = req.opcionesPanelPerfil

        res.status(200).render(RENDER_PATH.PERFIL, { cliente, opcionesPanel })
    },
    postMiPerfil: async (req, res) => {
        const cliente = req.cliente // session
        const opcionesPanel = req.opcionesPanelPerfil
        
        for (const prop in req.body) {
            if (prop === 'email' || prop === 'login') {
                cliente.credenciales[prop] = req.body[prop]
            }
            cliente[prop] = req.body[prop]
        }
        
        const clienteId = cliente._id
        const credencialesId = cliente.credenciales._id
        const email = cliente.credenciales.email
        const login = cliente.credenciales.login

        const updateCliente      = Cliente.updateOne({ _id: clienteId }, cliente)
        const updateCredenciales = Credenciales.updateOne({ _id: credencialesId }, { login, email })         
                            
        Promise
            .all([ updateCliente, updateCredenciales ]) 
            .then(() => { 
                //actualizamos session
                req.session.cliente = cliente
                
                res.status(200).render(RENDER_PATH.PANEL, { cliente, opcionesPanel })
            })
            .catch((err) => {
                res.status(400).render(RENDER_PATH.PERFIL, { cliente, opcionesPanel, mensajeError: ERROR_MESSAGE.PERFIL })
            })
    }
} 

async function _findProvincias() {
    return Provincia.find().sort({ nombre: 1 }).lean()  // utilizar lean ya que handlebas no admite propiedades de mongoose
}

async function _findCredenciales({email}) {
    return Credenciales.findOne({ email }).lean()
}

async function _emailActivacionCuenta({email, nombre}) {
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
            "HTMLPart": "<h3><strong>Se ha registrado correctamente en Agapea.com</strong></h3>" + `<br>Pulsa <a href="${URL.ACTIVAR_CUENTA}${email}">aqui </a>para activar su cuenta`        
           }] 
    }

    try {
        await emailSevice.sendEmail({mensaje: cuerpoEmail})
    } catch (err) {
        console.log('Fallo al enviar email de confirmación de registro', err)
    }
}

async function _emailCambioPassword({email, nombre, credsId, sessionId}) {
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
            "TextPart": "Accede al enlace para poder cambiar su contraseña.",
            "HTMLPart": "<h3><strong>Accede al enlace para poder cambiar su contraseña.</strong></h3>" + `<br>Pulsa <a href="${URL.CAMBIO_PASSWORD}${sessionId}&credsid=${credsId}">aqui </a>`
        }] 
    }

    try {
        await emailSevice.sendEmail({mensaje: cuerpoEmail})
    } catch (err) {
        console.log('Fallo al enviar email de cambio de contraseña', err)
    }
}
