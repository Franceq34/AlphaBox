const SerialPort = require('serialport');

const nbTimesMaxEmit = 32
const timeBetweenEmit = 1000
const timeWaitEndResponse = 3000

let receive = null;
let buffer = "";
let nbTimeEmit = 0

async function openPortAntenna() {
    // OUVERTURE DU PORT SERIAL
    // Il ne doit y avoir que l'antenne branchée
    const port = new SerialPort('/dev/ttyUSB0', {
        baudRate: 57600
    })


    // Open errors will be emitted as an error event
    port.on('error', function (err) {
        console.log('Error: ', err.message)
    })
    return port
}

const retrieveData = async function (numAlpha) {
    // Met en route l'antenne
    const antenna = await openPortAntenna();

    // return the response of the alpha
    
    // start send order   
    sendOrder(`<3030303${numAlpha}UPLOADFILE>`, antenna);

    let dataJumps = null
    // start wait the response, resolved when the response is full
    await getResponse(antenna)
    .then( data => dataJumps = data)
    .catch( err => console.log(err))

    // Reset
    antenna.close();
    return dataJumps;
}

/**
 * wait the entire response
 */
async function getResponse(antenna) {
    antenna.on('data', function (data) {
        buffer += data.toString('hex');
        receive = Date.now();
    });

    let waitResponse = new Promise((resolve, reject) => {
        let checkResponse = function() {
            if (isEndResponse()) {
                resolve("done !");
            }
            else {
                setTimeout(checkResponse, timeBetweenEmit);
            }
            if (nbTimeEmit > nbTimesMaxEmit) {
                reject("to long");
            }
        };
        checkResponse();
    })

    let wait = await waitResponse;
    return buffer;
}


function isEndResponse() {
    return receive != null && receive + timeWaitEndResponse < Date.now()
}

// ECOUTE LES PORTS USBs
// https://www.npmjs.com/package/usb-detection
// usbDetect.startMonitoring();

function sendOrder(order, antenna) {
    if (receive == null) {
        antenna.write(order, function (err) {
            if (err) {
                return console.log('Error on write: ', err.message)
            }
        })
        nbTimeEmit++;
        setTimeout(function () {
            sendOrder(order, antenna)
        }, 1000);
    }
}

module.exports = { retrieveData }