const URL = {
    LOGIN:           "http://localhost:3000/Cliente/Login",
    TIENDA:          "http://localhost:3000/Tienda/Libros/0",
    ACTIVAR_CUENTA:  'http://localhost:3000/Cliente/ActivarCuenta/',
    CAMBIO_PASSWORD: 'http://localhost:3000/Cliente/CambioPassword?id='
}

const RENDER_PATH = {
    REGISTRO:         'Cliente/Registro.hbs',
    REGISTRO_OK:      'Cliente/RegistroOK.hbs',
    LOGIN:            'Cliente/Login.hbs',
    FORGOT_PASSWORD:  'Cliente/ForgotPassword.hbs',
    PASSWORD:         'Cliente/Password.hbs',
    PANEL:            'Cliente/PanelInicio.hbs',
    PERFIL:           'Cliente/MiPerfil.hbs',
    LIBROS:           'Tienda/Libros.hbs',
    DETALLES_LIBRO:   'Tienda/MostrarLibros.hbs',
    DETALLES_PEDIDO:  'Pedido/MostrarPedido.hbs',
    FINALIZAR_PEDIDO: 'Pedido/FinalizarPedido.hbs'
}

const ERROR_MESSAGE= {
    SERVER:          'Error interno del servidor',
    LOGIN:           'Email o contraseña incorrectas',
    ACTIVAR:         'Error al activar la cuenta',
    REGISTRO:        'Error en el registro',
    PROVINCIAS:      'Error al recuperar las provincias',
    PROVINCIA:       'Error: provincia no encontrada',
    MUNICIPIOS:      'Error al recuperar los municipios',
    MUNICIPIO:       'Error: municipio no encontrado',
    CHECK_EMAIL:     'Error al validar el email',
    PERFIL:          'Error al actualizar los datos personales',
    LIBROS:          'Error al recuperar los libros',
    LIBRO:           'Error al recuperar el libro',
    MATERIAS:        'Error al recuperar las materias',
    CREDENCIALES:    'Credenciales no validas',
    SESSION:         'Session requerida',
    CUENTA_INACTIVA: 'CUENTA_INACTIVA',
    CLIENTE:         'Error: cliente no encontrado',
}

module.exports = {
    URL,
    RENDER_PATH,
    ERROR_MESSAGE
}