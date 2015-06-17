/**
 * Created by aghassaei on 6/17/15.
 */


var serialport = require('serialport');
SerialPort = serialport.SerialPort;// make a local instance

// list serial ports:
serialport.list(function (err, ports) {
    ports.forEach(function(port) {
        console.log(port.comName);
    });
});

//defualts
var portName = '/dev/cu.usbserial-DA01L12I';
var baudRate = 9600;

var myPort = new SerialPort(portName, {
   baudRate: baudRate,
   parser:serialport.parsers.readline("\n")
//       parser: serialport.parsers.raw
});

myPort.on('open', onPortOpen);
myPort.on('data', onPortData);
myPort.on('close', onPortClose);
myPort.on('error', onPortError);




function onPortOpen(){
    console.log("port open");
}

function onPortData(data){
    console.log(data);
}

function onPortClose(){
    console.log("port close");
}

function onPortError(error){
    console.log("Serial port error " + error);
}


