$('a[id*="botonMas-"]').click((ev) => {
    const id = ev.target.id.replace('botonMas-', '')
    const url = 'http://localhost:3000/Pedido/RestarCantidadPedido/' + _id
    $(`a[id*="botonMenos-${id}"]`).attr('href', url) 
})