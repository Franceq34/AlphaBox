// Converti de l'hexadecimal en string 
const hex_to_ascii = function (str1) {
    var hex = str1.toString();
    var str = '';
    for (var n = 0; n < hex.length; n += 2) {
        str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    return str;

}

// Converti du decimal en string
const dec_to_ascii = function (str1) {
    var hex = str1.toString();
    var str = '';
    for (var n = 0; n < hex.length; n += 2) {
        str += String.fromCharCode(parseInt(hex.substr(n, 2)));
    }
    return str;
}

const replaceAt = function (str, index, replacement) {
    return str.substr(0, index) + replacement + str.substr(index + replacement.length);
}

const formatDate = function(d) {
    return d.getDate() + "/" + d.getMonth() + "/" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
}

/**
     * Les bytes sont parfois transmit dans le mauvais sens, cette fonction
     * les inverses pour les mettre dans le bon ordre
     * Le dernier se retrouve en premier, l'avant dernier en deuxieme etc ...
     * @param {string} hex 
     */
const reverseBytes = function(revBytes) {
    let byte = ""
    for (let i = revBytes.length - 2; i >= 0; i = i - 2) {
        byte += revBytes.substr(i, 2)
    }
    return byte;
}

module.exports = { hex_to_ascii, dec_to_ascii, replaceAt, reverseBytes, formatDate };