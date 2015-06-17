/**
 * Created by aghassaei on 6/17/15.
 */

define(['underscore', 'backbone', 'socketio'], function(_, Backbone, io){

    var SerialComm = Backbone.Model.extend({

    });

    var serialComm = new SerialComm();
    var socket = io.connect('http://localhost:8080');

    socket.on('connected', function(){
        console.log("worked");
    });



    return serialComm;

});