const SerialPort = require('serialport');

const NB_TIMES_MAX_EMIT = 35
const timeBetweenEmit = 1000
const timeBetweenListen = 1000
const timeWaitEndResponse = 3000
const portUsb = '/dev/ttyUSB0';

let receive = null;
let buffer = "";
let nbTimeEmit = 0

/**
 * Open the serial port to deal with radio antenna
 */
const openPortAntenna = async function () {

    // OUVERTURE DU PORT SERIAL
    // Il ne doit y avoir que l'antenne branchée 
    const port = new SerialPort(portUsb, {
        baudRate: 57600
    });

    return new Promise((resolve, reject) => {
        port.open(() => {
            console.log("open");
            resolve(port);
        })
    });
}


const sendOrderAndWaitResponse = async function (order, antenna) {
    // Met en route l'antenne

    return new Promise(async (resolve, reject) => {

        sendOrderMultipleTimes(order, antenna);

        const response = null;

        // start wait the response, resolved when the response is full
        await getResponse(antenna)
            .then(data => response = data)
            .catch(err => console.log(err))

        // Reset
        antenna.close(() => {
            console.log("PORT FERME")
            resolve(response);
        });
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
 * wait the entire response
 */
async function getResponse(antenna) {

    // Listen entry data
    antenna.on('data', function (data) {
        buffer += data.toString('hex');
        receive = Date.now();
    });

    // Quand les données commencent à arriver, on attends "timeWaitEndResponse"
    // avant de terminer l'écoute, les données arrivent par salves.
    // Lorsque pendant un certain temps on ne recoit plus de données
    // le harnais du bélier a fini d'émettre.
    let waitResponse = new Promise((resolve, reject) => {
        let checkResponse = function () {
            // Si on a déjà recu et que le temps entre deux salve est longs
            // on peut dire qu'il n'y en aura plus
            if (receive != null && receive + timeWaitEndResponse < Date.now()) {
                resolve("Done !");
            }
            // si jamais de données reçus, on continu d'écouter
            else {
                setTimeout(checkResponse, timeBetweenListen);
            }

            // si on ne recoit pas de donnée pendant trop de temps, le harnais 
            // est surement trop loin de l'antenne.

            if (nbTimeEmit >= NB_TIMES_MAX_EMIT) {
                reject("To long");
            }
        };

        // On lance la fonction d'écoute pour la première fois
        checkResponse();
    })


    let wait = await waitResponse;
    return buffer;
}

async function sendOrderMultipleTimes(order, antenna) {
    if (receive == null) {
        await sendOrder(order, antenna)

        nbTimeEmit++;

        // On arrête au bout d'un certain nombre d'émissions.
        if (NB_TIMES_MAX_EMIT > nbTimeEmit) {
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
const serial = {
    retrieveData,
    openPortAntenna,
    sendOrder,
    retrieveData,
    sendOrderMultipleTimes
}



module.exports = { serial }



