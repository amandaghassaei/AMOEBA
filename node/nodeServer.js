/**
 * Created by aghassaei on 6/17/15.
 */

var serialport = require('serialport');
SerialPort = serialport.SerialPort;// make a local instance

//var http = require('http');
//var app = http.createServer();
var io = require('socket.io').listen(8080);
//var app = require('express')();
//var http = require('http').Server(app);
//var io = require('socket.io')(http);

// list serial ports:


//defualts
var portName = '/dev/cu.usbserial-DA01L12I';
var baudRate = 9600;

//io.sockets.on('connection', function (socket) {
//    socket.emit('baudRate', baudRate);
//});


io.on('connection', function(socket){

    var allPorts = [];
    serialport.list(function(err, ports){
        ports.forEach(function(port) {
            allPorts.push(port.comName);
        });

        socket.emit('connected', {
            baudRate: baudRate,
            portName: portName,
            availablePorts: allPorts
        });
    });


    socket.on('baudRate', function(value){
        baudRate = value;
        changePort();
        console.log(value);
    });

    socket.on('portName', function(value){
        if (allPorts.indexOf(value) < 0) {
            onPortError("no available port called " + value);
            return;
        }
        portName = value;
        changePort();
        console.log(value);
    });



    var currentPort = initPort(portName, baudRate);

    function initPort(_portName, _baudRate){
        var port = new SerialPort(_portName, {
           baudRate: _baudRate,
           parser:serialport.parsers.readline("\n")
        //       parser: serialport.parsers.raw
        }, false);

        port.open(function(error){
            if (error) onPortError(error);
            onPortOpen();
            port.on('data', onPortData);
            port.on('close', onPortClose);
            port.on('error', onPortError);
        });
        return port;
    }

    function changePort(_portName, _baudRate){
        if (currentPort) currentPort.close(function(error){
            if (error) onPortError(error);
        });
        currentPort = initPort(_portName, _baudRate);
    }

    function onPortOpen(){
        socket.emit("portConnected", baudRate);
    }

    function onPortData(data){
    //    console.log(data);
    }

    function onPortClose(){
        console.log("portclosed");
        socket.emit("portDisconnected", baudRate);
    }

    function onPortError(error){
        console.log("Serial port error " + error);
        socket.emit("error", error);
    }

});






