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


//defaults
var portName = null;
var currentPort = null;
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

        if (!portName && allPorts.length>0) portName = allPorts[0];
        if (portName) currentPort = changePort(portName, baudRate);

        socket.emit('connected', {
            baudRate: baudRate,
            portName: portName,
            availablePorts: allPorts
        });
    });

    socket.on('baudRate', function(value){
        baudRate = value;
        currentPort = changePort(portName, baudRate);
    });

    socket.on('portName', function(value){
        if (allPorts.indexOf(value) < 0) {
            onPortError("no available port called " + value);
            return;
        }
        portName = value;
        currentPort = changePort(portName, baudRate);
    });

    socket.on('dataOut', function(data){
        console.log(data);
    });

    socket.on('flush', function(){
        console.log("flush");
    });




    function initPort(_portName, _baudRate){
        var port = new SerialPort(_portName, {
           baudRate: _baudRate,
           parser:serialport.parsers.readline("\n")
        //       parser: serialport.parsers.raw
        }, false);

        port.open(function(error){
            if (error) {
                onPortError(error);
                currentPort = null;
                return;
            }
            onPortOpen();
            port.on('data', onPortData);
            port.on('close', onPortClose);
            port.on('error', onPortError);
        });
        return port;
    }

    function changePort(_portName, _baudRate){
        if (!portName) {
            onPortError("no port name specified");
            return null;
        }
        if (currentPort) currentPort.close(function(error){
            if (error) {
                onPortError(error);
                return null;
            }
            return initPort(_portName, _baudRate);
        });
        else return initPort(_portName, _baudRate);
    }

    function onPortOpen(){
        socket.emit("portConnected", {baudRate: baudRate, portName:portName});
    }

    function onPortData(data){
    //    console.log(data);
    }

    function onPortClose(){
        socket.emit("portDisconnected", {baudRate: baudRate, portName:portName});
    }

    function onPortError(error){
        console.log("Serial port error " + error);
        socket.emit("error", error);
    }

});






