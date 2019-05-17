const io = require('socket.io-client');
const express = require('express');
const app = express();
const request = require('request');
const { getJumpsAlphaNumber } = require('./retrieveDataHarness');

const url = "http://localhost:3333"
const time = 10000

const socket = io(url);

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
	let bodyToSent = {
		idFarmer: 59,
		data: [{
			numHarness: 19,
			numEwe: 91,
			date: "2020-09-15T15:53:00"
		},
		{
			numHarness: 19,
			numEwe: 92,
			date: "2020-09-15T15:53:00"
		},
		{
			numHarness: 19,
			numEwe: 93,
			date: "2020-09-15T15:53:00"
		},
		{
			numHarness: 19,
			numEwe: 92,
			date: "2020-09-15T15:53:00"
		},
		{
			numHarness: 19,
			numEwe: 93,
			date: "2020-09-15T15:53:00"
		}]
	}
	sendDataHarness(bodyToSent, () => {
			setTimeout(boucle, time);
		});
	 getAlphasFromFarmer(59, res => {
	 	console.log(res);
	});
	let numAlpha = 8;
	//let jumps = {data : [{"numHarness":8,"numRecord":0,"numEwe":200001617678,"date":"2020-02-08T00:55:50.000Z"}], idFarmer:"89"}
	//getJumpsAlphaNumber(numAlpha).then(jumps => {
	//	let bodyToSent = {data : jumps, idFarmer:59};
	//	sendDataHarness(bodyToSent, () => {
	//		// Recommence indéfiniment
	//		setTimeout(boucle, time);
	//	});
	//})
}
boucle();


