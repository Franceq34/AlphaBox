
const express = require('express');
const app = express();
const request = require('request')
const { getJumpsAlphaNumber } = require('./retrieveDataHarness');

const url = "http://localhost:3333"
const time = 3 * 60 * 1000

function activeConnection() {
	request.post(url + '/box/activeConnection', {
		json: {
			num: 59
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

function boucle() {
	activeConnection()
	// getAlphasFromFarmer(59, res => {
	// 	console.log(res);
	// });
	let numAlpha = 8;
	//let jumps = {data : [{"numHarness":8,"numRecord":0,"numEwe":200001617678,"date":"2020-02-08T00:55:50.000Z"}], idFarmer:"89"}
	getJumpsAlphaNumber(numAlpha).then(jumps => {
		let bodyToSent = {data : jumps, idFarmer:59};
		sendDataHarness(bodyToSent, () => {
			// Recommence indéfiniment

			setTimeout(boucle, time);
		});
	})
}
boucle();


