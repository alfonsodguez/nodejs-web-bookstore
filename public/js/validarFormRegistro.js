const cajaEmail = document.getElementById('inputEmail')
const cajaPassword = document.getElementById('inputPassword')
const cajasTexto = document.getElementsByTagName('input') 

cajaEmail.addEventListener('blur', validarEmail)
cajaPassword.addEventListener('blur', validarPassword)
Array.from(cajasTexto).forEach(caja => caja.addEventListener('blur', validarCampos))

function validarEmail(ev) {
    let success = true
    if (ev.target.value === '') {
        success = false
    }

    const reEmail = /^.*@.*\.(com|es|uk|it|org)$/
    if (reEmail.test(ev.target.value) === false) {
        success = false
    }

    if (!success) {
        //borramas etiqueta span en caso de que exista 
        if(ev.target.nextElementSibling != null){
            ev.target.nextElementSibling.remove()
        }					
        //añadimos etiqueta span
        const textoError = document.createElement('span')
        textoError.textContent = '* Campo obligatorio'
        textoError.setAttribute('style', 'color: red')
        ev.target.after(textoError)
    }
    else if (success) {
        //campo bien validado
        //eliminamos etiqueta span si existe
        if (ev.target.nextElementSibling != null) {
            ev.target.nextElementSibling.remove()
        }														
    }
}

function validarPassword(ev) {
    let validated = true
    
    const isWhitespace = /^(?=.*\s)/
    if (isWhitespace.test(ev.target.value)) {
        console.log("La contraseña no debe contener espacios en blanco.")
        validated = false
    }

    const isContainsUppercase = /^(?=.*[A-Z])/
    if (!isContainsUppercase.test(ev.target.value)) {
        console.log("La contraseña debe tener al menos un caracter en mayuscula.")
        validated = false
    }

    const isContainsLowercase = /^(?=.*[a-z])/
    if (!isContainsLowercase.test(ev.target.value)) {
        console.log("La contraseña debe tener al menos un carácter en minúscula.")
        validated = false
    }

    const isContainsNumber = /^(?=.*[0-9])/
    if (!isContainsNumber.test(ev.target.value)) {
        console.log("La contraseña debe contener al menos un dígito.")
        validated = false
    }

    const isContainsSymbol = /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:"'<>,.?/_₹])/
    if (!isContainsSymbol.test(ev.target.value)) {
        console.log("La contraseña debe contener al menos un símbolo especial.")
        validated = false
    }

    const isValidLength = /^.{8,16}$/
    if (!isValidLength.test(ev.target.value)) {
        console.log("La contraseña debe tener entre 8 y 16 caracteres.")
        validated = false
    }
    
    if (validated === false) {
        //si existe etiqueta span la borramos 
        if(ev.target.nextElementSibling != null){
            ev.target.nextElementSibling.remove()
        }		
        //añadimos etiqueta span
        const textoError = document.createElement('span')
        textoError.textContent= '* Password incorrecta'
        textoError.setAttribute('style', 'color: red')
        ev.target.after(textoError)
    }
    //comprobamos que no hay etiqueta span
    else if (validated) {
        //si existe etiqueta span la borramos 
        if(ev.target.nextElementSibling != null){
            ev.target.nextElementSibling.remove()
        }							
    }
}

function validarCampos(ev) {
    if (ev.target.getAttribute('type') === 'text') {
        //comprobamos si tiene texto 
        if (ev.target.value === "") {
            //comprobamos si existe etiqueta span
            if (ev.target.nextElementSibling != null) {
                ev.target.nextElementSibling.remove()
            }
            const textoError = document.createElement('span')
            textoError.textContent = '* Campo Obligatorio'
            textoError.setAttribute('style', 'color: red')
            ev.target.after(textoError)
        }
        else if (ev.target.nextElementSibling != null) {
            //el campo esta bien validado 
            ev.target.nextElementSibling.remove()
        }
    }               
    //compruebo el numero de campos validados 
    const numIncorrect = Array
        .from(cajasTexto)
        .filter(input => input.value.toString().length === 0)
        .length

    //etiquetas de span hay
    if (numIncorrect > 0) {
        //deshabilitamos boton
        document.getElementById('botonSubmit').disabled = true
    }
    else {
        //habilitamos boton
        document.getElementById('botonSubmit').disabled = false
    }
}