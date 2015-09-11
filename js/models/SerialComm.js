/**
 * Created by aghassaei on 6/17/15.
 */

define(['underscore', 'backbone', 'socketio', 'machineState'], function(_, Backbone, io, MachineState){

    var SerialComm = Backbone.Model.extend({

        defaults: {
            connected: false,
            portConnected: false,
            availablePorts: [],
            portName: "Select Port",
            baudRate: 200,
            error: null,
            lastMessageReceived: null,
            lastMessageSent: ""
        },

        initialize: function(){
            this.machineState = null;
            this.attemptToConnectToNode();
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

        refreshMachineState: function(){//when updating connection, create a new instance of machine state
            if (this.machineState) this.machineState.destroy();
            this.machineState = new MachineState();
        },

        getMachineState: function(){
            return this.machineState;
        },

        setProperty: function(property, value){//portName, baudRate
            if (property === null || property === undefined || value === null || value === undefined) return;
            this.socket.emit(property, value);//always pass user interaction on
            this.set(property, value);
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
                if (data[key] !== null) serialComm.set(key, data[key], {silent:true});
            });
            serialComm.trigger("change");
        });

        socket.on('dataIn', function(data){
            if (data == "" || data == '\n' || data == "\r") return;
            serialComm.set("lastMessageReceived", data, {silent:true});
            serialComm.trigger("change:lastMessageReceived");
        });

        socket.on('dataSent', function(data){
            serialComm.set("lastMessageSent", data, {silent:true});
            serialComm.trigger("change:lastMessageSent");
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
            console.log(data);
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