$('#inputProvincia').change(function(evt) {
    $('#inputLocalidad > option').each((index, elem) => {
        if (elem.value != 0 ) { 
            elem.remove()
        }
    })            
    if (evt.target.value != 0) {
        $('#inputLocalidad').prop("disabled", false)

        const url = 'http://localhost:3000/api/getMunicipios/' + $(this).val()
        fetch(url, { method: 'get' }) 
            .then(bodyMunicipios => bodyMunicipios.json()) 
            .then(municipios => municipios.forEach(municipio => { 
                //construimos tags option
                $('#inputLocalidad').append(`<option value=${municipio.codMun}>${municipio.NombreMunicipio}</option>`)
            })) 
            .catch(error => console.log('error munis', error))
    }           
})