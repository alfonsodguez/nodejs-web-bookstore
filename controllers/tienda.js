const Bluebird = require('bluebird')
const Materia = require('../models/materia')
const Libro = require('../models/libro')
const {RENDER_PATH, ERROR_MESSAGE} = require('../models/enums')

const DEFAULT_ID_MATERIA = 0

module.exports = {
    getLibros: async (req, res) => {
       try {
            const cliente = req.session.cliente
            const idMateria = req.params.idmateria
            
            const [libros, listaMaterias] = await Bluebird.all([
                Libro.find({ idMateria }).lean(),
                _devolverMaterias()
            ])

            if (!libros || !listaMaterias) {
                throw new Error(ERROR_MESSAGE.LIBRO)
            }

            const tuplasDeTresLibros = []
            for (let pos=0; pos<libros.length; pos=pos+3) {

                const tresLibros = libros.slice(pos, pos + 3)
                 
                tuplasDeTresLibros.push(tresLibros)               
            }

            res.status(200).render(RENDER_PATH.LIBROS, { listaMaterias, listaLibros: tuplasDeTresLibros, cliente })
        } catch (err) {
            res.status(500).send()
        }       
    },
    getMostrarLibro: async (req, res) => {
        try {
            const libroId = req.params.id

            const [libro, listaMaterias] = await Bluebird.all([
                Libro.findById(libroId).lean(),
                _devolverMaterias()
            ])

            if (!libro || !listaMaterias) {
                throw new Error(ERROR_MESSAGE.LIBRO)
            }

            res.status(200).render(RENDER_PATH.DETALLES_LIBRO, { listaMaterias, libro })
        } catch (err) {
            res.status(500).send()
        }
    }
}

async function _devolverMaterias() {
    return Materia.find({ idMateriaPadre: DEFAULT_ID_MATERIA }).lean()
}