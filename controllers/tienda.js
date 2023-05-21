const logger = require('winston')
const Materia = require('../models/materias')
const Libro = require('../models/libro')

module.exports = {
    getLibros: async (req, res) => {
       try {
           const idMateria = req.params.idmateria
           const libros = await Libro.find({'idMateria': idMateria}).lean()
                        
            const tuplasDeTresLibros = []
            for (const pos = 0; pos < libros.length; pos = pos + 3) {
                const tresLibros = libros.slice(pos, pos + 3)
                tuplasDeTresLibros.push(tresLibros)               
            }

            const idMateriaPadre = '0'
            const listaMaterias = await _devolverMaterias({materiaId: idMateriaPadre})

            res.status(200).render('Tienda/Libros.hbs', { 
                listaMaterias: listaMaterias,
                listaLibros: tuplasDeTresLibros,
                cliente: req.session.cliente   
            })

        } catch (err) {
           logger.error('Error al recuperar libros o materias', err)
        }       
    },
    getMostrarLibro: async (req, res) => {
        try {
            const libroId = req.params.id
            const libro = await Libro.findById({_id: libroId}).lean()

            const idMateriPadre = '0' 
            const listaMaterias = await _devolverMaterias({materiaId: idMateriPadre})

            res.status(200).render('Tienda/MostrarLibro.hbs', { listaMaterias: listaMaterias, unlibro: libro })
        } catch (err) {
            logger.error('Error al recuperar libros ', err)
        }
    }
}

async function _devolverMaterias({materiaId}){
    return Materia.find({IdMateriaPadre: materiaId}).lean()
}