const { serial } = require('./writeSerial');

serial.openPortAntenna().then( antenna => {
    serial.deleteData(8, antenna).then( () => {
        console.log("DELETED");
    });
});
