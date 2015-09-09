/**
 * Created by aghassaei on 9/9/15.
 */


require.config({

    paths: {
        jquery: '../../dependencies/jquery-2.1.3',
        underscore: '../../dependencies/underscore',
        backbone: '../../dependencies/backbone',
        serialMonitor: 'SerialMonitor',
        serialMonitorView: 'SerialMonitorView'
    }

});

console.log("herefsdf");
require(['serialMonitorView', 'serialMonitor'], function(SerialMonitorView, SerialMonitor){
    new SerialMonitorView({model: new SerialMonitor()});
});