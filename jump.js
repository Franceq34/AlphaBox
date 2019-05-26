const { formatDate, dec_to_ascii, replaceAt, reverseBytes } = require('./utils');

const { hexaVeeToDate, inverseStringBuffer } = require('./calculDate');

const Jump = class Jump { 
    /**
     * 
     * @param {Buffer} buffer 
     * le buffer doit avoir cette forme
     * 3c 13 30 30 30 38 23 04 00 72 dc 4e 4d 09 00 d7 7b 06 91 ee f9 
     * <  CR 0  0  0  8  #  4  0  |   date  | 0.5   | num brebis |
     *  0-1 : marque le début d'une ligne
     *  2-5 : num du harnais en décimal
     *  6 : séparation
     *  7 : num de la ligne en hexadecimal
     *  8 : séparation
     *  9-12 : date à l'envers en timestamp unix avec du retard en hexadecimal
     *  13-14 : TODO
     *  14-18 : num de la brebis à l'envers, "ee" à changer en 2e en hexadecimal
     *  19 : fin de la ligne
     */
    constructor(b) {
        let sBuffer = b.toString('hex');

        // Numéro de harnais
        let numHarnessString = dec_to_ascii(b[2]) + dec_to_ascii(b[3]) + dec_to_ascii(b[4]) + dec_to_ascii(b[5])
        this.numHarness = parseInt(numHarnessString, 10)
        
        // Numéro de la ligne
        this.numRecord = b[7];

        // Récupération du num de la brebis
        let hexNumEwe = sBuffer.substr(30, 10)
        this.numEwe = this.toNumEwe(hexNumEwe);

        // Récupération de la date timestamp
        let invHexDate = sBuffer.substr(18, 8);
        let hexDate = inverseStringBuffer(invHexDate);
        this.date = hexaVeeToDate(hexDate);
    }

    toNumEwe(revHexNumEwe) {
        // Prob dans le num de la brebis, le "e" est en fait un 2
        // TO-DO marche surement pas avec d'autres num qui ne sont pas 2
        revHexNumEwe = replaceAt(revHexNumEwe, 8, '2')
        let hexNumEwe = reverseBytes(revHexNumEwe);
        return parseInt(hexNumEwe, 16);
    }

}

module.exports = { Jump };