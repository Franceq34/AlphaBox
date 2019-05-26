
const express = require('express');
const app = express();
const request = require('request')
const { getJumpsAlphaNumber } = require('./retrieveDataHarness');
const { jumpsFromHarnessData } = require('./decoupe.js');
const { serial } = require('./writeSerial');

const url = "http://localhost:3333"
const time = 3 * 60 * 1000
const idFarmer = 59

function activeConnection() {
	request.post(url + '/box/activeConnection', {
		json: {
			num: idFarmer
		}
	}, (error, res, body) => {
		if (error) {
			console.error(error)
			return
		}
		console.log(`statusCode: ${res.statusCode}`)
	})
}

function sendDataHarness(dataHarness, callback) {

	request.post(url + '/box/sendDataHarness', {
		json: dataHarness
	}, 
	(error, res, body) => {
		if (error) {
			console.error(error)
			return
		}
		console.log(`Statut de l'envoi: ${res.statusCode}, message : ${res.statusMessage}`)
	
		callback()
	})

}

/**
 * Retrieve numbers of harness of a farmer
 * @param {number} idFarm
 * @param {function} callback 
 */
function getAlphasFromFarmer(idFarm, callback) {
	return request.get(url + '/tup/getAllAlphaTupFromFarmer/' + idFarm, {},
	 (error, res, body) => {
		if (error) {
			console.error(error)
			return
		} 
		callback(res.body)
	})
}


const retrieveJumpsAlpha = async function (number) {
    return await serial.retrieveData(number).then(bufferHarness => {
        let hexBuffData = (new Buffer.from(bufferHarness, 'hex'));
        return jumpsFromHarnessData(hexBuffData);
    });
}


function boucle() {
	activeConnection()
	let numAlpha = 8;
	retrieveJumpsAlpha(numAlpha).then(jumps => {
		let bodyToSent = {data : jumps, idFarmer: idFarmer };
		sendDataHarness(bodyToSent, () => {
			// Recommence indéfiniment

			setTimeout(boucle, time);
		});
	})
}
boucle();


