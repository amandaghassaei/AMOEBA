/**
 * Created by aghassaei on 6/17/15.
 */

//todo get cam, lattice, appstate out of here

define(['underscore', 'backbone', 'socketio', 'machineState', 'cam', 'lattice', 'appState'],
    function(_, Backbone, io, machineState, cam, lattice, appState){

    var SerialComm = Backbone.Model.extend({

        defaults: {
            connected: false,
            portConnected: false,
            availablePorts: [],
            portName: "Select Port",
            baudRate: 200,
            error: null,
            lastMessageReceived: null,
            lastMessageSent: "",
            isStreaming: false,
            singleStepMode: true
        },

        initialize: function(){
            this.machineState = machineState;
            this.listenTo(machineState, "change", this._updateVirtualMachine);
            if (appState.get) this.listenTo(appState, "change:currentNav", this._navChanged);
            this.attemptToConnectToNode();
        },

        _navChanged: function(){
            if (appState.previous("currentNav") == "navComm") lattice.showCells("cells");
        },

        attemptToConnectToNode: function(){
            if (!this.get("connected")) {
                this.socket = io.connect('http://localhost:8080', {'forceNew':true});
                addEventHandlers(this.socket);//if we're not in the serial monitor window
            }
        },

        connectionFailed: function(){
            this.set("connected", false);
            this.socket.disconnect();
            this.socket = null;
        },

        refreshPorts: function(){
            this.socket.emit('refreshPorts');
        },

        send: function(data){
            this.socket.emit("dataOut", data);
        },

        flushBuffer: function(){
            this.socket.emit("flush");
        },

        startStream: function(){
            this.socket.emit("startStream");
        },

        pauseStream: function(){
            this.socket.emit("pauseStream");
        },

        stopStream: function(){
            this.socket.emit("stopStream");
        },

        _updateVirtualMachine: function(){
            cam.setPosition(this.getMachineState().toJSON());
        },

        sendGCode: function(){
            if (!this.get("isStreaming")) return;
            if (!cam.initialize) return;//don't do this from serial monitor window
            var self = this;
            var machineState = this.getMachineState();
            if (machineState && machineState.isReadyStatus()){
                var lineNum = cam.get("simLineNumber");
                var allLines = cam.get("dataOut").split("\n");
                if (lineNum == 0) lattice.hideCells("cells");
                if (lineNum >= 0 && lineNum < allLines.length) {
                    var line = allLines[lineNum];

                    if (line.substr(0,2) == "({"){
                        var index = line.substr(1,line.length-2);
                        index = JSON.parse(index);
                        lattice.showCellAtIndex(index);
                    }

                    self.listenToOnce(machineState, "readyForNextCommand", function(){
                        lineNum ++;
                        cam.set("simLineNumber", lineNum);
                        if (self.get("singleStepMode")){
                            self.pauseStream();
                            return;
                        }
                        self.sendGCode();
                    });
                    self.send('{"gc":"' + line + '"}');
                } else if (lineNum == allLines.length){
                    self.pauseStream();
                    cam.set("simLineNumber", 0);
                } else {
                    console.warn("invalid line number " + lineNum);
                }

            } else console.warn("machine not ready");
        },

        refreshMachineState: function(){//when updating connection, create a new instance of machine state
            this.machineState.refresh();
        },

        getMachineState: function(){
            return this.machineState;
        },

        setBaudRate: function(value){
            this.socket.emit("baudRate", value);
        },

        setPortName: function(value){
            this.socket.emit("portName", value);
        },

        openSerialMonitor: function(){
            if (!this.get("connected")) {
                console.warn("can't open serial monitor if not connected to node server");
                return;
            }
            require(['serialMonitorController'], function(serialMonitorController){
                serialMonitorController.open();
            });
        }

    });

    var serialComm = new SerialComm();

    function addEventHandlers(socket){

        socket.on('connected', function(data){
            serialComm.set("connected", true, {silent:true});
            _.each(_.keys(data), function(key){
                if (data[key] !== null) serialComm.set(key, data[key]);
            });
        });

        socket.on('dataIn', function(data){
            if (data == "" || data == '\n' || data == "\r") return;
            serialComm.set("lastMessageReceived", data, {silent:true});
            serialComm.trigger("change:lastMessageReceived");
            try {
                var json = JSON.parse(data);
                if (json.r && json.r.sr){
                    serialComm.getMachineState().setPosition(json.r.sr);
                } else if (json.sr){
                    serialComm.getMachineState().setPosition(json.sr);
                }
            } catch(err) {
//                console.warn(err);
            }
        });

        socket.on('dataSent', function(data){
            serialComm.set("lastMessageSent", data, {silent:true});
            serialComm.trigger("change:lastMessageSent");
        });

        socket.on('isStreaming', function(data){
            serialComm.set("isStreaming", data);
            if (data == true) serialComm.sendGCode();
        });

        socket.on('portConnected', function(data){
            console.log("connected port " + data.portName + " at " + data.baudRate);
            serialComm.set("baudRate", data.baudRate);
            serialComm.set("portName", data.portName);
            serialComm.set("portConnected", true);
            serialComm.set("error", false);
            serialComm.refreshMachineState();
        });

        socket.on('portDisconnected', function(data){
            console.log("disconnected port " + data.portName + " at " + data.baudRate);
            if (serialComm.get("baudRate") != data.baudRate) return;
            if (serialComm.get("portName") != data.portName) return;
            serialComm.set("portConnected", false);
        });

        socket.on("errorMsg", function(data){
            console.warn(data);
            serialComm.set("error", data.error);
        });

        socket.on("error", function(error){
            console.warn(error);
        });

        socket.on("connect_error", function(){
            serialComm.connectionFailed();
        });
    }





    return serialComm;

});