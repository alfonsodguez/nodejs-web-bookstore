$('#inputProvincia').change(function(evt) {
    $('#inputLocalidad > option').each((index, option) => {
        if (option.value != 0 ) { 
            option.remove()
        }
    })            
    const codPro = evt.target.value
    if (codPro != 0) {
        $('#inputLocalidad').prop("disabled", false)

        const url = 'http://localhost:3000/api/getMunicipios/' + $(this).val()
        fetch(url, { method: 'get' }) 
            .then(bodyMunicipios => bodyMunicipios.json()) 
            .then(municipios => municipios.forEach(municipio => { 
                //construimos tags option
                $('#inputLocalidad').append(`<option value=${municipio.codMun}>${municipio.nombreMunicipio}</option>`)
            })) 
            .catch(error => console.log('error munis', error))
    }           
})