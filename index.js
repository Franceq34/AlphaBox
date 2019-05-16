
const express = require('express');
const app = express();
const request = require('request')

function activeConnection(){
	request.post('http://localhost:3333/box/activeConnection', {
	  json: {
		  num: 59
		}
	}, (error, res, body) => {
	  if (error) {
	    console.error(error)
	    return
	  }
	  console.log(`statusCode: ${res.statusCode}`)
	  console.log(body)
	})
}

function sendDataHarness(){

	request.post('http://localhost:3333/box/sendDataHarness', {
	  json: {
		  idFarmer: 59,
			data: [
				{
					numHarness:19,
					numEwe: 91,
					date: "2019-07-02T11:22:33.000"
				}
			]
		}
	}, (error, res, body) => {
	  if (error) {
	    console.error(error)
	    return
	  }
	  console.log(`Statut de l'envoi: ${res.statusCode}`)
	})

}


function getAlphasFromFarmer(idFarm){

	request.get('http://localhost:3333/tup/getAllAlphaTupFromFarmer/'+idFarm, {
	}, (error, res, body) => {
	  if (error) {
	    console.error(error)
	    return
	  }
	  console.log(`Statut de l'envoi: ${res.statusCode}`)
	console.log(res.body)
	return res.body
	})

}
function boucle(){
	//activeConnection()
	//sendDataHarness()
	//getAlphasFromFarmer(59)
	setTimeout(boucle, 10000);
}
 
boucle();

