const URL = {
    LOGIN:   "http://localhost:3000/Cliente/Login",
    TIENDA:  "http://localhost:3000/Tienda/Libros/0",
    ACTIVAR: 'http://localhost:3000/Cliente/ActivarCuenta/',
}

const RENDER_PATH = {
    REGISTRO:       'Cliente/Registro.hbs',
    REGISTRO_OK:    'Cliente/RegistroOK.hbs',
    LOGIN:          'Cliente/Login.hbs',
    CHECK_EMAIL:    'Cliente/CompruebaEmail.hbs',
    PASSWORD:       'Cliente/Password.hbs',
    PANEL:          'Cliente/PanelInicio.hbs',
    PERFIL:         'Cliente/MiPerfil.hbs',
    LIBROS:         'Tienda/Libros.hbs',
    DETALLES_LIBRO: 'Tienda/MostrarLibros.hbs',
}

const ERROR_MESSAGE= {
    SERVER:      'Error interno del servidor',
    LOGIN:       'Email o contraseña incorrectas, vuelva a intentarlo',
    ACTIVAR:     'Error al activar la cuenta',
    REGISTRO:    'Error en el registro',
    PROVINCIAS:  'Error al recuperar las provincias',
    CHECK_EMAIL: 'Error al validar el email',
    PERFIL:      'Error al actualizar los datos personales',
}

module.exports = {
    URL,
    RENDER_PATH,
    ERROR_MESSAGE
}