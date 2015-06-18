/**
 * Created by aghassaei on 6/17/15.
 */

define(['underscore', 'backbone', 'socketio'], function(_, Backbone, io){

    var socket = io.connect('http://localhost:8080');

    var SerialComm = Backbone.Model.extend({

        defaults: {
            connected: false,
            portConnected: false,
            availablePorts: [],
            portName: "Select Port",
            baudRate: 200,
            error: null,
            testMessage: ""
        },

        initialize: function(){


        },

        send: function(data){
            socket.emit("dataOut", data);
        },

        flushBuffer: function(){
            socket.emit("flush");
        },

        changeProperty: function(property, value){
            if (property === null || property === undefined || value === null || value === undefined) return;
            socket.emit(property, value);//always pass user interaction on
            this.set(property, value);
        }

    });

    var serialComm = new SerialComm();

    socket.on('connected', function(data){
        serialComm.set("connected", true, {silent:true});
        _.each(_.keys(data), function(key){
            if (data[key] !== null) serialComm.set(key, data[key], {silent:true});
        });
        serialComm.trigger("change");
    });

    socket.on('disconnected', function(){
        serialComm.set("connected", false);
    });

    socket.on('portConnected', function(data){
        serialComm.set("baudRate", data.baudRate);
        serialComm.set("portName", data.portName)
        serialComm.set("portConnected", true);
    });

    socket.on('portDisconnected', function(data){
        if (serialComm.get("baudRate") != data.baudRate) return;
        if (serialComm.get("portName") != data.portName) return;
        serialComm.set("portConnected", false);
    });

    socket.on("error", function(error){
        serialComm.set("error", error);
    });



    return serialComm;

});