require('dotenv').config()
const io = require('socket.io-client');
const express = require('express');
const app = express();
const request = require('request');
const { jumpsFromHarnessData } = require('./decoupe.js');
const { serial } = require('./writeSerial');

const time = 4000

// Données à récupérer dans le serveur, en dur pour les tests
const idFarmer = 59
const numAlpha = 8

const url = process.env.BASE_URL
const socket = io(url);

// Met à jour la dernière connexion de la box au serveur
function activeConnection() {
	request.post(url + '/box/activeConnection', {
		json: {
			num: idFarmer
		}
	}, (error, res) => {
		if (error) {
			console.error(error)
			return
		}
		socket.emit('BOX_CONNECTED_TO_SERVER');
		console.log(`BOX_CONNECTED_TO_SERVER : statusCode: ${res.statusCode}`)
	})
}

// Les données récupérées sur les harnais sont envoyées au serveur.
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

// Permet de récupérer les numéros des alpha à récupérer dans l'élevage (Pas encore utilisé, les num des harnais sont en durs)
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
	// Retrieve data from harness
	return await serial.retrieveData(number, antenna)
		.then(bufferHarness => {
			let hexBuffData = (new Buffer.from(bufferHarness, 'hex'));
			return jumpsFromHarnessData(hexBuffData);
		})
}

function boucle() {
	activeConnection();
	retrieveJumpsAlpha(numAlpha)
		.then(jumps => {
			let bodyToSent = { data: jumps, idFarmer: idFarmer };

			sendDataHarness(bodyToSent, () => {
				// Recommence indéfiniment
				setTimeout(boucle, time);
			});
		})
		.catch(err => {
			console.log("Error retrieve jumps", err)
			return err;
		});
}

// Récupère les données du harnais 8 en boucle.
async function main() {
	antenna = await serial.openPortAntenna();
	boucle();
}

main();
