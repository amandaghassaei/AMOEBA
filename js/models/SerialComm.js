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
            portName: null,
            baudRate: 200,
            error: null
        },

        initialize: function(){


        },

        _changeProperty: function(property, value){
            if (property === null || property === undefined || value === null || value === undefined) return;
            if (this.get(property) == value) return;
            socket.emit(property, value);
            this.set(property, value);
        }

    });

    var serialComm = new SerialComm();

    socket.on('connected', function(data){
        console.log(data);
        serialComm.set("connected", true, {silent:true});
        _.each(_.keys(data), function(key){
            serialComm.set(key, data[key], {silent:true});
        });
        serialComm.trigger("change");
    });

    socket.on('disconnected', function(){
        serialComm.set("connected", false);
    });

    socket.on('portConnected', function(baudRate){
        serialComm.set("baudRate", baudRate);
        serialComm.set("portConnected", true);
    });

    socket.on('portDisconnected', function(baudRate){
        if (serialComm.get("baudRate") != baudRate) return;
        serialComm.set("portConnected", false);
    });

    socket.on("error", function(error){
        serialComm.set("error", error);
    });



    return serialComm;

});