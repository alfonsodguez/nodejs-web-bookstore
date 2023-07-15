const Bluebird  = require('bluebird')
const Materia   = require('../models/materia')
const Libro     = require('../models/libro')
const { RENDER_PATH, ERROR_MESSAGE } = require('../models/enums')
const { DataNotFoundError } = require('../errors/custom')

const DEFAULT_ID_MATERIA = 0

module.exports = {
    getLibros: async (req, res) => {
        const cliente = req.session.cliente
        const idMateria = req.params.idmateria
        
        const [libros, materias] = await Bluebird.all([
            Libro.find({ idMateria }).lean(),
            _devolverMaterias()
        ])

        if (!libros) { 
            throw new DataNotFoundError(ERROR_MESSAGE.LIBROS)
        }

        if (!materias) {
            throw new DataNotFoundError(ERROR_MESSAGE.MATERIAS)
        }

        const tuplasDeTresLibros = []
        for (let pos=0; pos<libros.length; pos=pos+3) {

            const tresLibros = libros.slice(pos, pos + 3)
                
            tuplasDeTresLibros.push(tresLibros)               
        }

        res.status(200).render(RENDER_PATH.LIBROS, { listaMaterias: materias, listaLibros: tuplasDeTresLibros, cliente })      
    },
    getMostrarLibro: async (req, res) => {
        const libroId = req.params.id

        const [libro, materias] = await Bluebird.all([
            Libro.findById(libroId).lean(),
            _devolverMaterias()
        ])

        if (!libro) { 
            throw new DataNotFoundError(ERROR_MESSAGE.LIBRO)
        }

        if (!materias) {
            throw new DataNotFoundError(ERROR_MESSAGE.MATERIAS)
        }

        res.status(200).render(RENDER_PATH.DETALLES_LIBRO, { listaMaterias: materias, libro })
    }
}

async function _devolverMaterias() {
    return Materia.find({ idMateriaPadre: DEFAULT_ID_MATERIA }).lean()
}