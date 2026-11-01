// Acepta números o textos numéricos, siempre que sean enteros positivos
function idValido(valor) {
    return Number.isInteger(Number(valor)) && Number(valor) > 0;
}

module.exports = { idValido };