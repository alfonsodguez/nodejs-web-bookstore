$('a[id*="botonMenos-"]').click((ev) => {
    const id = ev.target.id.replace('botonMenos-', '')
    $(`label[id="ID-${id}"]`).text() == 1 ? $(ev.target).attr('href', 'javascript:void(0)') : true
})