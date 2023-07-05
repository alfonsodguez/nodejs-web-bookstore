const Bluebird = require('bluebird')
const Materia = require('../models/materias')
const Libro = require('../models/libro')

const RENDER_PATH = {
    LIBROS: 'Tienda/Libros.hbs',
    DETALLES_LIBRO: 'Tienda/MostrarLibros.hbs'
}
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
                        
            const tuplasDeTresLibros = []
            for (const pos=0; pos<libros.length; pos=pos+3) {

                const tresLibros = libros.slice(pos, pos + 3)
                
                tuplasDeTresLibros.push(tresLibros)               
            }

            res.status(200).render(RENDER_PATH.LIBROS, { listaMaterias, listaLibros: tuplasDeTresLibros, cliente })
        } catch (err) {
            console.log('Error al recuperar libros o materias', err)
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

            res.status(200).render(RENDER_PATH.DETALLES_LIBRO, { listaMaterias, libro })
        } catch (err) {
            console.log('Error al recuperar libros ', err)
            res.status(500).send()
        }
    }
}

async function _devolverMaterias() {
    return Materia.find({ idMateriaPadre: DEFAULT_ID_MATERIA }).lean()
}