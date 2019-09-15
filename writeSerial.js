// Module qui permet d'utiliser un port sérial (utilisation de l'antenne)
const SerialPort = require('serialport');

// Nb de fois que l'information est transmise à l'alpha
const NB_TIMES_MAX_EMIT = 35

// Temps entre deux émissions de l'information
const timeBetweenEmit = 1000

// Temps entre deux écoutes pour la récupération des données envoyées par l'alpha
const timeBetweenListen = 1000

// Temps qui permet d'attendre la fin de la réponse du harnais Alpha
const timeWaitEndResponse = 3000

// L'antenne doit être connectée sur un port usb (l'antenne doit être la seul à utiliser les ports USB)
const portUsb = '/dev/ttyUSB0';


// Global variable fort monitoring
let receive = null;
let buffer = "";
let nbTimeEmit = 0;
let continuListen = true;

/**
 * Open the serial port to deal with radio antenna
 */
const openPortAntenna = async function () {

    // OUVERTURE DU PORT SERIAL
    // Il ne doit y avoir que l'antenne de branchée sur les ports usb
    const port = new SerialPort(portUsb, {
        baudRate: 57600
    });

    // Listen entry data
    port.on('data', function (data) {
        buffer += data.toString('hex');
        console.log("Arrivé buffer", buffer + '\n');
        receive = Date.now();
    });

    // Listen entry data
    port.on('error', function (err) {
        console.log("Erreur antenne", err);
    });

    port.on('close', function (event) {
        console.log("Connection closed", event);
        continuListen = false;
    });

    port.on('open', function () {
        console.log("Connection open");
    });

    return new Promise((resolve, reject) => {
        port.open(() => {
            resolve(port);
        })
    });
}

// Envoie un ordre à envoyer à l'antenne, retourne la réponse de l'alpha
const sendOrderAndWaitResponse = async function (order, antenna) {
    sendOrderMultipleTimes(order, antenna);

    // start wait the response, resolved when the response is full
    // Met en route l'antenne
    return new Promise ( async (resolve, reject) => {
        return getResponse()
        .then( (response) => {
            receive = null;
            buffer = "";
            nbTimeEmit = 0;
            continuListen = true;
            resolve(response)
            
        })
        .catch(err => {
            reject (err);
        });
    });
};



/**
 * wait the entire response
 */
async function getResponse() {

    // Quand les données commencent à arriver, on attends "timeWaitEndResponse"
    // avant de terminer l'écoute, les données arrivent par salves.
    // Lorsque pendant un certain temps on ne recoit plus de données
    // le harnais du bélier a fini d'émettre.
    let resolveOrReject = false;
    let waitResponse = new Promise((resolve, reject) => {

        let checkResponse = function () {
            console.log("Ecoute");
            // Arrête d'écouter quand on ne recoit plus de données pendant timeWaitEndResponse 
            
            if (!continuListen) {
                reject("Error antenna");
                resolveOrReject = true;
            }

            // si on ne recoit pas de données pendant trop de temps, le harnais 
            // est surement trop loin de l'antenne.
            if (nbTimeEmit >= NB_TIMES_MAX_EMIT) {
                reject("To long");
                resolveOrReject = true;
            }

            if (receive != null && receive + timeWaitEndResponse < Date.now()) {
                resolve(buffer);
                resolveOrReject = true;
            }
            
            // si jamais des données sont reçues, on continu d'écouter
            if (continuListen && !resolveOrReject) {
                resolveOrReject = false;
                setTimeout(checkResponse, timeBetweenListen);
            }
        };

        // On lance la fonction d'écoute
        checkResponse();
    })
    return waitResponse
}

async function sendOrderMultipleTimes(order, antenna) {
    if (receive == null) {
        await sendOrder(order, antenna)
            .catch(err => {
                console.log("Error send order : ", err)
            })
        console.log(nbTimeEmit)
        nbTimeEmit++;
        // On arrête au bout d'un certain nombre d'émissions ou quand on commence à recevoir les données
        if (NB_TIMES_MAX_EMIT > nbTimeEmit && buffer == "") {
            setTimeout(async function () {
                await sendOrderMultipleTimes(order, antenna)
            }, timeBetweenEmit);
        }
    }
}

// envoie l'ordre 'nbTimeEmit' fois ( )
async function sendOrder(order, antenna) {
    return new Promise((resolve, reject) => {
        antenna.write(order, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        })
    });
}


/**
 * ask 30 times around the box "retrieve data" of an harness
 * @param {number} numAlpha number of the asked alpha
 */
const retrieveData = async function (numAlpha, antenna) {
    return await sendOrderAndWaitResponse(`<3030303${numAlpha}UPLOADFILE>`, antenna);
}

/**
 * ask alpha to delete his data
 * @param {number} numAlpha 
 * @param {*} antenna 
 */
const deleteData = async function (numAlpha, antenna) {
    return await sendOrderAndWaitResponse(`<3030303${numAlpha}DELETEFILE>`, antenna);
}

const serial = {
    retrieveData,
    openPortAntenna,
    sendOrder,
    retrieveData,
    sendOrderMultipleTimes,
    deleteData,
}



module.exports = { serial }



