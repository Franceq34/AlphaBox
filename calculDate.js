
/**
 * Transform an dsplit buffer date in hexadecimal and do the convertion to int
 * @param {Buffer} buffer 
 */
function splitBuffer(buffer) {
    
    let strBuff = buffer.toString('hex');
    let tabSplit = [];
    tabSplit.push(parseInt(strBuff.substr(0, 2), 16));
    tabSplit.push(parseInt(strBuff.substr(2, 2), 16));
    tabSplit.push(parseInt(strBuff.substr(4, 1), 16));
    tabSplit.push(parseInt(strBuff.substr(5, 3), 16));
    return tabSplit
}

/**
 * Le buffer est transmis à l'envers. TODO enlever de jump et le mettre
 * dans la fonction hexaVeeToDate
 */
function inverseStringBuffer(buffer) {
    return buffer.substr(6, 2) + buffer.substr(4, 2) + buffer.substr(2, 2) + buffer.substr(0, 2)
}

function toMinsSecs(val) {
    // Toutes les minutes, 4 secondes en trop à cause d'un arrondi en hexadecimal
    let minutes = Math.trunc(val / 64)

    // Récupère la valeur décimal pour les secondes et multiplie par 64 (minutes bizarres renvoyées par l'alpha)
    // Les valeurs supérieures à 60 ne sont jamais envoyées, elles sont sautées par l'alpha
    let secondes = val - minutes * 64

    return [minutes, secondes];
}

function toHours(pile1, pile2) {
    // Début de la journée valeur de h : 0 à partir de 16h, retourne à 0 car hexa décimal
    // Pour savoir si on est après ou avant 16h, suffit de voir si la pile 2 est pair ou impair 
    // Début de la journée la pile 2 est paire (revient à 0 même si encore de la place pour les heures )
    // A 16h, ajout de 1 dans la pile 2  donc devient impair
    if (pile1 % 2 === 0) {
        return pile2;
    } else {
        return 16 + pile2;
    }

}
/**
 * Compute the number of day since the start of the year
 * @param {number} pile0 
 * @param {number} pile1 
 * @returns {number} number of days since the start of the year
 */

function toMonth(pile0, pile1) {
    // la pile 1 represente les mois modulo 32 * 2 
    //( 2 pour mettre 2* 16h dans une journée et 32 pour avoir la place pour mettre tout les mois, même les plus longs)
    // la pile0 peut accueillir les jours de 4 mois différents, tout les 4  mois la pile 0 recommenceà 0.
    return Math.trunc(pile1 / 64) + (pile0 % 4) * 4 - 1
}

function nbDaySinceDebMonth(pile1) {
    // Les jours de mois sont sur 32 * 2
    // Pour le 00 de la pile 1 on a 1 d'écart par rapport au reste de l'année qui est bon
    // Décalage de 1 observé pour février et mars (dû à janvier ?)
    if (pile1 % 2 == 0) {
        return (pile1 % 64) / 2
    } else {
        return ((pile1 - 1) % 64) / 2
    }
}


function toYears(pile0) {
    // La date commence à l'année 2000
    let years = Math.trunc(pile0 / 4);
    return years + 2000;
}


const hoursJetLag = 2;

const hexaVeeToDate = function (buffer) {
    let splittedBuffer = splitBuffer(buffer);
    let [minutes, secondes] = toMinsSecs(splittedBuffer[3])
    let heures = toHours(splittedBuffer[1], splittedBuffer[2]);
    let month = toMonth(splittedBuffer[0], splittedBuffer[1])
    let date = nbDaySinceDebMonth(splittedBuffer[1]);
    let years = toYears(splittedBuffer[0])


    let firstDate = new Date("2000-01-01T00:00:00.000Z")
    firstDate.setHours(hoursJetLag)
    firstDate.setFullYear(years)
    firstDate.setMonth(month);
    firstDate.setDate(date)
    firstDate.setHours(heures)
    firstDate.setMinutes(minutes)
    firstDate.setSeconds(secondes)
    return new Date(firstDate)
}
let date = new Date()
console.log(date.getFullYear());

module.exports = { hexaVeeToDate, 
    toMinsSecs, 
    splitBuffer, 
    toHours, 
    toMonth, 
    nbDaySinceDebMonth, 
    inverseStringBuffer,
    toYears };

