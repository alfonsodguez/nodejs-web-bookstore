 //añadimos handler al evento onchange del input de tipo file...
 $('#selectorImagen').change(function(ev) { 
    const fichSeleccionado = ev.target.files[0]  
    const reader = new FileReader()  

    reader.addEventListener('load', function(evt) {
        $('#imagenUsuario').attr('src', evt.target.result)  
        $('#botonUploadImagen').removeAttr('disabled')
        $('#botonUploadImagen').click(function(evento) {   
            $(evento.target).attr('disabled', '')

            //creamos obj formdata: permite manda datos en formato multipart/form-data
            const datos = new FormData()
            datos.append('imagen', fichSeleccionado) 

            $.ajax({
                method:'post', 
                url: "http://localhost:3000/api/uploadImagen", 
                data: datos, 
                contentType: false, 
                processData: false                                                  
            })
            .always(function() { 
                $('#botonUploadImagen').removeAttr('disabled')
            })
        })
    })
    reader.readAsDataURL(fichSeleccionado)
})