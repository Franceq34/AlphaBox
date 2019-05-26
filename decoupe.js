const { Jump } = require("./jump");

const jumpsFromHarnessData = function (buffer) {
    // < 0006NOMBRE_D'ENREGISTREMENTS=32> 34 caractères.
    const entete = buffer.slice(0, 34)

    // un jump prend 42 caractères.
    let jumps = []

    for (var i = 34; i < buffer.length; i = i + 21) {
        let bufJump = buffer.slice(i, i + 21)
        
        jumps.push(new Jump(bufJump));
    }

    return jumps
}

module.exports = { jumpsFromHarnessData }

