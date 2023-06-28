const mailjet = require('node-mailjet')

async function sendEmail({mensaje}) {
    await mailjet
        .connect(process.env.API_KEY_MAILJET, process.env.SECRET_KEY_MAILJET)
        .post("send", {'version': 'v3.1'})
        .request(mensaje)
}