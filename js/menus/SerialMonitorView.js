/**
 * Created by aghassaei on 9/9/15.
 */

require.config({

    baseUrl: 'js',

    paths: {
        jquery: '../dependencies/jquery-2.1.3',
        underscore: '../dependencies/underscore',
        backbone: '../dependencies/backbone'
    },

    shim: {
        three: {
            exports: 'THREE'
        },
        orbitControls: {
            deps: ['three'],
            exports: 'THREE'
        },
        stlLoader: {
            deps: ['three'],
            exports: 'THREE'
        },
        fileSaverLib: {
            exports: 'saveAs'
        },
        flatUI: {
            deps: ['jquery']
        },
        bootstrapSlider:{
            deps: ['jquery'],
            exports: '$'
        },
        'socketio': {
            exports: 'io'
        },
        'numeric': {
            exports: 'numeric'
        }
    }

});

console.log("hi");

require(['jquery', 'underscore', 'backbone'], function($, _, Backbone){

    console.log("here45");

    var SerialMonitorView = Backbone.View.extend({

        el: "#serialMonitorView",

        initialize: function(){
            $("#serialMonitorView").html("working");
        }

    });

    new SerialMonitorView();
});