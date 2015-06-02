/**
 * Created by aghassaei on 1/7/15.
 */

requirejs.config({
    baseUrl: 'js',
    paths: {
        jquery: 'dependencies/jquery-2.1.3',
        underscore: 'dependencies/underscore',
        backbone: 'dependencies/backbone',
        three: 'dependencies/three',

        plist: 'models/AllAppPLists',
        appState: 'models/AppState',
        lattice: 'lattice/Lattice'
    },
    shim: {
        three: {
            exports: 'THREE'
        }
    }
});

requirejs(['jquery', 'lattice'], function($, lattice) {
    console.log(lattice);
});


//setup persistent global variables
//if (typeof globals === "undefined") globals = {};
//
//
//$(function(){
//
//    //init web workers
////    window.workers = persistentWorkers(8);
//
//    //init global singletons
//    globals.three = ThreeModel();
//    globals.plist = AppPList();
//    globals.appState = new AppState();
//    globals.lattice = new Lattice();
//    globals.basePlane = null;
//    globals.highlighter = null;
//    globals.lattice.delayedInit();//todo need this?
//    globals.cam = new Cam({appState: globals.appState});
//    globals.fileSaver = GlobalFilesaver();
//
//    //ui
//    new MenuWrapper({model: globals.appState});
//    new NavBar({model:globals.appState});
//    new Ribbon({model:globals.appState});
//    new ScriptView({model:globals.appState});
//
//    //threeJS View
//    new ThreeView({model:globals.three});
//
//    if (globals.lattice.get("connectionType") != "gik") globals.lattice.addCellAtIndex({x:0,y:0,z:0});//add a cell
//
////    return {globals:globals};
//});
