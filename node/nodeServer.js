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
var baudRate = 115200;
var isStreaming = false;

//io.sockets.on('connection', function (socket) {
//    io.emit('baudRate', baudRate);
//});


io.on('connection', function(socket){

    var allPorts = [];
    refreshAvailablePorts(function(_allPorts, _portName, _baudRate){
        currentPort = changePort(_portName, _baudRate);
    });


    socket.on('baudRate', function(value){
        refreshAvailablePorts(function(){
            if (!checkThatPortExists(portName)) return;
            currentPort = changePort(portName, value);
            baudRate = value;
        });
    });

    socket.on('portName', function(value){
        refreshAvailablePorts(function(){
            if (!checkThatPortExists(value)) return;
            currentPort = changePort(value, baudRate);
            portName = value;
        });
    });

    socket.on('dataOut', function(data){
        outputData(data);
    });

    function outputData(data){
        io.emit('dataSent', data);
        data += '\n';
        console.log("Sending data: " + data);
        currentPort.write(new Buffer(data), function(err, res) {
            if (err) onPortError(err);
        });
//        currentPort.write(new Buffer([parseInt(data)]));//write byte
    }

    socket.on('flush', function(){
        if (currentPort) currentPort.flush(function(){
            console.log("port " + portName + " flushed");
        });
    });

    socket.on('refreshPorts', function(){
        console.log("refreshing ports list");
        allPorts = refreshAvailablePorts();
    });

    socket.on('stopStream', function(){
        outputData("!");
        setIsStreaming(false);
    });

    socket.on('startStream', function(){
        setIsStreaming(true);
    });

    socket.on('pauseStream', function(){
        setIsStreaming(false);
    });

    function setIsStreaming(state){
        if (state == isStreaming) return;
        isStreaming = state;
        io.emit('isStreaming', isStreaming);
    }

    function checkThatPortExists(_portName){
        if (allPorts.indexOf(_portName) < 0) {
            onPortError("no available port called " + _portName);
            return false;
        }
        return true;
    }




    function refreshAvailablePorts(callback){
        var _allPorts = [];
        serialport.list(function(err, ports){
            ports.forEach(function(port) {
                _allPorts.push(port.comName);
            });

            allPorts = _allPorts;

            if (!portName && _allPorts.length>0) portName = _allPorts[0];
            if (callback) callback(allPorts, portName, baudRate);

            io.emit('connected', {
                baudRate: baudRate,
                portName: portName,
                availablePorts: _allPorts
            });
        });
    }

    function initPort(_portName, _baudRate){

        console.log("initing port " + _portName + " at " + _baudRate);
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
            onPortOpen(_portName, _baudRate);
            port.on('data', onPortData);
            port.on('close', onPortClose);
            port.on('error', onPortError);
        });
        return port;
    }

    function changePort(_portName, _baudRate){
        console.log("change");
        if (!_portName) {
            onPortError("no port name specified");
            return null;
        }
        if (currentPort) {
            var oldBaud = baudRate;
            var oldName = portName;
            console.log("disconnecting port " + oldName + " at " + oldBaud);
            if (currentPort.isOpen()) currentPort.close(function(error){
                if (error) {
                    onPortError(error);
                    return null;
                }
                io.emit("portDisconnected", {baudRate:oldBaud, portName:oldName});
            });
        }
        return initPort(_portName, _baudRate);
    }

    function onPortOpen(name, baud){
        io.emit("portConnected", {baudRate:baud, portName:name});
        setIsStreaming(false);
    }

    function onPortData(data){
        console.log(data);
        io.emit('dataIn', data);
    }

    function onPortClose(){
//        console.log("port closed");
    }

    function onPortError(error){
        console.log("Serial port error " + error);
        io.emit("errorMsg", {error:String(error)});
    }

});






