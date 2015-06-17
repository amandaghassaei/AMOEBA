/**
 * Created by aghassaei on 6/17/15.
 */


var serialport = require('serialport');
SerialPort = serialport.SerialPort;// make a local instance of it

// list serial ports:
serialport.list(function (err, ports) {
    ports.forEach(function(port) {
        console.log(port.comName);
    });
    var portName = ports[4].comName;
    console.log("opening port " + portName);
    var myPort = new SerialPort(portName, {
       baudRate: 9600,
       // look for return and newline at the end of each data packet:
       parser: serialport.parsers.readline("\r\n")
    });

    myPort.on('open', onPortOpen);
    myPort.on('data', onPortData);
    myPort.on('close', onPortClose);
    myPort.on('error', onPortError);
});

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


