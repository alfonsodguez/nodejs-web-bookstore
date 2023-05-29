const cajaPassword = document.getElementById("pass2")
cajaPassword.addEventListener('keydown', () => {
    setTimeout(() => {
        const pass1 = document.getElementById("pass").value
        const pass2 = document.getElementById("pass2").value
        const passError = document.getElementById("passText")
        const btn = document.getElementById("botonSubmit")

        if (pass1 != pass2) {
            passError.innerText = "Las contrasenas deben ser iguales"
        } else {
            passError.innerText = ""
            btn.disabled = false
        }
    }, 1000)
})