require('dotenv').config()
const io = require('socket.io-client');
const express = require('express');
const app = express();
const request = require('request');
const { jumpsFromHarnessData } = require('./decoupe.js');
const { serial } = require('./writeSerial');
const time = 4000
const idFarmer = 59
const numAlpha = 8

const url = process.env.BASE_URL
console.log(url)
const socket = io(url);

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
		socket.emit('BOX_CONNECTED_TO_SERVER');
		console.log(`BOX_CONNECTED_TO_SERVER : statusCode: ${res.statusCode}`)
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
			socket.emit('NEW_JUMPS_ON_SERVER');
			console.log(`NEW_JUMPS_ON_SERVER : statusCode: ${res.statusCode}`)
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

let antenna = null;

const retrieveJumpsAlpha = async function (number) {
	
	return await serial.retrieveData(number, antenna).then(bufferHarness => {
		if (bufferHarness != null) {
			let hexBuffData = (new Buffer.from(bufferHarness, 'hex'));
			return jumpsFromHarnessData(hexBuffData);
		} else {
			return JSON.parse("{}");
		}
		
	});
}

function boucle() {
	activeConnection()

	retrieveJumpsAlpha(numAlpha).then(jumps => {
		let bodyToSent = { data: jumps, idFarmer: idFarmer };
		console.log("a récupéré data", bodyToSent);

		sendDataHarness(bodyToSent, () => {
			// Recommence indéfiniment
			setTimeout(boucle, time);
		});
	});
}
async function main () {
	antenna = await serial.openPortAntenna();
	boucle();
}
main()

