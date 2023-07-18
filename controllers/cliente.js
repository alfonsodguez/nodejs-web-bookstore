const bcrypt       = require('bcrypt')
const mongoose     = require('mongoose')
const emailSevice  = require('../models/email-service')
const Cliente      = require('../models/cliente')
const Credenciales = require('../models/credenciales')
const Direccion    = require('../models/direccion')
const Provincia    = require('../models/provincia')
const Municipio    = require('../models/municipio')
const Pedido       = require('../models/pedido')
const Libro        = require('../models/libro')
const cache        = require('../lib/cache')
const { URL, RENDER_PATH, ERROR_MESSAGE } = require('../models/enums')
const { DataNotFoundError, InvalidPasswordError, CuentaInactivaError, InvalidEmailError } = require('../errors/custom')

const GASTOS_ENVIO = 3

module.exports = { 
    getRegistro: async (req, res) => {                
        const provincias = await _findProvincias()

        if (!provincias) {
            throw new DataNotFoundError(ERROR_MESSAGE.PROVINCIAS)
        }

        res.status(200).render(RENDER_PATH.REGISTRO, { layout: null, listaProvincias: provincias })  
    },
    postRegistro: async (req, res) => { 
        const { nombre, apellidos, nif, telefono, username, email, password, calle, cp, codProvincia, codMunicipio } = req.body
        const clienteId       = new mongoose.Types.ObjectId
        const direccionId     = new mongoose.Types.ObjectId
        const credenciaslesId = new mongoose.Types.ObjectId

        const provincia = await Provincia.findOne({ codProvincia }).select('_id').lean()
        const municipio = await Municipio.findOne({ codProvincia, codMunicipio }).select('_id').lean()
        
        if (!provincia) {
            throw new DataNotFoundError(ERROR_MESSAGE.PROVINCIA)
        }

        if (!municipio) {
            throw new DataNotFoundError(ERROR_MESSAGE.MUNICIPIO)
        }
        
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
    },
    getActivarCuenta: async (req, res) => {
        const email = req.params.email

        const credenciales = await _findCredenciales({ email })

        if (!credenciales) {
            throw new DataNotFoundError(ERROR_MESSAGE.ACTIVAR)
        }
        
        await Cliente.findOneAndUpdate(
            { 'credenciales': credenciales._id }, 
            { 'cuentaActiva': true },
            { new: true } 
        )

        res.redirect(URL.LOGIN)
    },
    getLogin: (req, res) => {
        res.status(200).render(RENDER_PATH.LOGIN, { layout: null })
    },
    postLogin: async (req, res) => {          
        const { password, email } = req.body
        
        let view, mensajeError
        const credenciales = await _findCredenciales({ email })
        const isValidPassword = await bcrypt.compare(password, credenciales.hash)

        if (!isValidPassword && !credenciales) {
            throw new InvalidPasswordError(ERROR_MESSAGE.LOGIN)
        }

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

        if (!cliente) {
            throw new DataNotFoundError(ERROR_MESSAGE.CLIENTE)
        }

        const cuentaActiva = cliente?.cuentaActiva

        if (!cuentaActiva) {
            throw new CuentaInactivaError(ERROR_MESSAGE.CUENTA_INACTIVA, email)
        }

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
    },
    getForgotPassword: (req, res) => {
        res.status(200).render(RENDER_PATH.FORGOT_PASSWORD, { layout: null })
    },
    postForgotPassword: async (req, res) => {
        const email = req.body.email
        const credenciales = await _findCredenciales({ email })
    
        if (credenciales) {
            throw new InvalidEmailError(ERROR_MESSAGE.CHECK_EMAIL)
        }

        const username  = credenciales.username
        const credsId   = credenciales._id
        const sessionId = req.session.id

        _emailCambioPassword({ email, name: username, credsId, sessionId })
            
        res.redirect(URL.LOGIN)
    },
    getCambioPassword: async (req, res) => {
        const sessionId      = req.query.id
        const credencialesId = req.query.credsid
        const id             = req.session.id

        if (sessionId != id) {
            throw new Error()
        }

        req.session.credsId = credencialesId

        res.status(200).render(RENDER_PATH.PASSWORD, { layout: null })
    },
    postCambioPassword: async (req, res) => {
        const password       = req.body.password
        const credencialesId = req.session.credsId 

        const saltRounds = 10
        const salt = await bcrypt.genSalt(saltRounds)
        const hash = await bcrypt.hash(password, salt)

        await Credenciales.updateOne(
            { _id: credencialesId },
            { $set: { hash: hash } }
        )

        res.redirect(URL.LOGIN)
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
        const cliente       = req.cliente // session
        const opcionesPanel = req.opcionesPanelPerfil
        
        for (const prop in req.body) {
            if (prop === 'email' || prop === 'login') {
                cliente.credenciales[prop] = req.body[prop]
            }
            cliente[prop] = req.body[prop]
        }
        
        const clienteId      = cliente._id
        const credencialesId = cliente.credenciales._id
        const email          = cliente.credenciales.email
        const login          = cliente.credenciales.login

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
    const key = 'prov'
    let provincias = cache.get(key)

    if (!provincias) {
        provincias = await Provincia.find().sort({ nombre: 1 }).lean()  // utilizar lean ya que handlebas no admite propiedades de mongoose

        cache.set(key, provincias)
    }

    return provincias
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
