var assert = require('assert');
const expect = require('chai').expect;
const { serial } = require('../writeSerial');
const { retrieveJumpsAlpha } = require('../retrieveDataHarness');

let antenna = null;
describe('Test connection antenna by serial port', async function (done) {
    antenna = serial.openPortAntenna();
    
    // it('should connect and works', async function () {
    //     await tryTurnOn(antenna)
    //     .then(response => {
    //         expect(response).to.be.a('null');
    //     })
    //     .catch( err => {
    //         expect(err).to.be.a('null');
    //     });
        
    // });

    // it('should write on the serial port', async function () {
    //     const response = await serial.sendOrder("Test send order", antenna);
    //     expect(response).to.be.true;
    // });

    it('should send order multiple times', async function () {
        serial.sendOrderMultipleTimes("order", antenna);
    });

    it('should retrieve jumps from alpha', async function() {

    });
});

async function tryTurnOn(antenna) {
    return new Promise(function (resolve, reject) {
        antenna.on('error', function (err) {
            console.log("Erreur ouverture port : ", err);
            reject(err)
        });

        // Si pas d'erreurs dans la seconde, renvoie ok
        setTimeout(() => {
            resolve(null);
        }, 1000);
    });
}
