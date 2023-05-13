const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const logger = require('winston')
const emailSevice = require('./email_service')
const Cliente = require('../models/cliente')
const Credenciales = require('../models/credenciales')
const Direccion = require('../models/direccion')
const Provincias = require('../models/provincias')
const Municipios = require('../models/municipios')
const Pedido = require('../models/pedidos')
const Libro = require('../models/libro')

module.exports = { 
    getRegistro: async (req, res) => {                
        try {
            const provincias = await Provincias.find().sort({ NombreProvincia: 'asc' }).lean()   // utilizar lean ya que handlebas no admite la prop _id

            res.status(200).render('Cliente/Registro.hbs', { layout: null, listaProvincias: provincias })
        } catch (err) {
            logger.error('Error al recuperar las provincias ', err)
        }                  
    },
    postRegistro: async (req, res) => { 
        const {nombre, apellidos, nif, login, email, password, calle, cp, codPro, codMun} = req.body
        const direccionId = new mongoose.Types.ObjectId
        const clienteId = new mongoose.Types.ObjectId
        const credenciaslesId = new mongoose.Types.ObjectId

        const provincia = await Provincias.findOne({ codPro: codPro }).lean()
        const municipio = await Municipios.findOne({ codPro: codPro, codMun: codMun }).lean()

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
        const insertCredenciales = Credenciales({ 
            _id: credenciaslesId,
            login, 
            email,
            hashpassword: bcrypt.hashSync(password, salt),
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
            .then(async (results) => { 
                await _emailConfirmacionRegistro({email, nombre})

                res.status(200).render('Cliente/RegistroOK.hbs', { layout: null }) 
            }) 
            .catch(async (err) => { 
                const provincias = await _devolverProvincias()

                res.status(200).render('Cliente/Registro.hbs', { layout: null, listaProvincias: provincias, mensajeError: 'Error interno del servidor...' })
            })
    },
    getLogin: (req, res) => {
        res.status(200).render('Cliente/Login.hbs', { layout: null })
    },
    postLogin: async (req, res) => {          
        try {
            const {password, email} = req.body
            const credenciales = await Credenciales.findOne({ email }).lean()
            const isValidPassword = bcrypt.compareSync(password, credenciales.hashpassword)

            if (isValidPassword) {
                const cliente = await Cliente
                    .findOne({credenciales: credenciales._id}) 
                    .populate([ 
                        { path: 'credenciales', model: Credenciales },
                        { path: 'direcciones', model: Direccion, populate: [
                            { path: 'provincia', model: Provincias },
                            { path: 'municipio', model: Municipios }
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

                res.redirect("http://localhost:3000/Tienda/Libros/0")
            }
            else {
                res.status(200).render('Cliente/Login.hbs', { layout: null, mensErrPersonalizado: "Email o contraseña incorrectas, vuelve a intentarlo"})
            }
        } catch (err) {
            res.status(200).render('Cliente/Login.hbs', { layout: null, mensajeError: 'Error en el server...' })
        }   
    },
    activarCuentaget: async (req, res) => {
        try {
            const email = req.params.email
            const credenciales = await Credenciales.findOne({ email })
            const cliente = await Cliente.findOneAndUpdate(
                { 'credenciales': credenciales._id }, 
                { 'cuentaActiva': true },
                { new: true } 
            )

            res.redirect("http://localhost:3000/Cliente/Login")
        } catch (err) {
            res.status(200).render('Cliente/Registro.hbs', { layout: null, mensajeError: 'Error interno del servidor, intentelo de nuevo mas tarde...'})
        }
    },
    comprobarEmailget: (req, res) => {
        res.status(200).render('Cliente/CompruebaEmail.hbs', { layout: null })
    },
    comprobarEmailpost: async (req, res) => {
        try {
            const email = req.body.email
            const credenciales = await Credenciales.findOne({ email }).lean()

            if (credenciales != null) {
                // envio correo para poder cambiar la password
                
                res.redirect("http://localhost:3000/Cliente/Login")
            } else {    
                res.status(200).render('Cliente/CompruebaEmail.hbs',{ 
                    layout: null,
                    mensajeError: "Fallo en la conexion con el servidor,intentelo mas tarde..." 
                })
            }
        } catch (err) {
            res.status(200).render('Cliente/Registro.hbs', { layout: null, mensajeError: 'Error interno del servidor, intentelo de nuevo mas tarde...' })
        }
    },
    cambioPasswordget: (req, res) => {
        res.status(200).render('Cliente/Password.hbs', { layout: null })
    },
    cambioPasswordpost: async (req, res) => {

    },
    miPerfilget: (req, res) => {
        /** 
         * usamos un middleware en routingCliente.js para comprobar si existe constiable de session 
         * en rutas Cliente/Panel/*, en el se añaden las prop "cliente", "listaOpcCliene" a la request
         */ 
        res.status(200).render('Cliente/MiPerfil.hbs', {
            cliente: req.cliente, 
            listaOpcCliente: req.opPanelCliente 
        })

    },
    miPerfilpost: async (req, res) => {
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
            .then((results) => {
                //actualizamos session
                req.session.cliente = cliente
                
                res.status(200).render('Cliente/PanelInicio.hbs', {
                    cliente: cliente, 
                    listaOpcCliente: req.opPanelCliente 
                })
            })
            .catch((err)=>{
                res.status(200).render('Cliente/PanelInicio.hbs',{
                    cliente: cliente, 
                    listaOpcCliente: req.opPanelCliente, 
                    mensajesError: 'Wrror interno en el servidor, intentelo de nuevo mas tarde...' 
                })
            })
    },
    panelInicio: (req, res) => {
        res.status(200).render('Cliente/PanelInicio.hbs', { cliente: req.cliente, listaOpcCliente: req.opcPanelCliente })
    }
} 

async function _devolverProvincias(){
    return Provincias.find().sort({NombreProvincia: 'asc'}).lean() 
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
        logger.err('Fallo al enviar el email de confirmacion de registro')
    }
}