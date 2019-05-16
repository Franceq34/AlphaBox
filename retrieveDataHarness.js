const { jumpsFromHarnessData } = require('./decoupe.js');
const { retrieveData } = require('./writeSerial');
//const buffer = new Buffer.from("3c20303030384e4f4d4252455f4427454e52454749535452454d454e54533d31343e3c1330303038230000f21d900009000e7f0691eef93c1330303038230100741e8a0009000e7f0691eef93c13303030382302008021840009000e7f0691eef93c1330303038230300b321860009000e7f0691eef93c1330303038230400db21880009000e7f0691eef93c1330303038230500892602010b00c97d0691eef93c13303030382306009e263c010900c97d0691eef93c1330303038230700282942010a00c97d0691eef93c1330303038230800b92902020900c97d0691eef93c1330303038230900353042040900c97d0691eef93c1330303038230a00f80102030900c97d0691eef93c1330303038230b005602fe010900c97d0691eef93c1330303038230c00092782000b0006480691eef93c1330303038230d00c72a88000e0006480691eef9", 'hex');
//console.log(jumpsFromHarnessData(buffer))

const getJumpsAlphaNumber = async function (number) {
    return await retrieveData(number).then(bufferHarness => {
        let hexBuffData = (new Buffer.from(bufferHarness, 'hex'));
        return jumpsFromHarnessData(hexBuffData);
    });
}

// getJumpsAlphaNumber(8).then( res => {
//     console.log(res)
// });

module.exports = { getJumpsAlphaNumber }