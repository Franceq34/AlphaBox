const { Jump } = require("./jump");

const jumpsFromHarnessData = function (buffer) {
    // find first char
    let firstChar = getIndexStartJump(buffer);
    // console.log(buffer);
    if (firstChar != null) {
        const entete = buffer.slice(0, firstChar)
        // un jump prend 42 caractères.
        let jumps = []

        // Cut and create jumps
        for (var i = firstChar; i < buffer.length; i = i + 21) {
            let bufJump = buffer.slice(i, i + 21)
            jumps.push(new Jump(bufJump));
        }

        return jumps

    } else {
        return []
    }

}

/**
 * return index of the first char of the first jump
 * @param {*} buffer 
 */
function getIndexStartJump(buffer) {
    for (let i = 0; i < buffer.length; i++) {
        if (buffer[i] == 60 && buffer[i + 1] == 19) {
            return i
        }
    }
    return null
}

module.exports = { jumpsFromHarnessData }

