/**
 * Created by aghassaei on 1/7/15.
 */

requirejs.config({
    baseUrl: 'js',
    paths: {
        analytics: 'dependencies/analytics',
        jquery: 'dependencies/jquery-2.1.3',
        underscore: 'dependencies/underscore',
        backbone: 'dependencies/backbone',
        flatUI: 'dependencies/flatUI/js/flat-ui',
        fileSaverLib: 'dependencies/loaders/FileSaver.min',

        //three
        three: 'dependencies/three',
        orbitControls: 'dependencies/OrbitControls',
        threeModel: 'three/ThreeModel',
        threeView: 'three/ThreeView',

        //models
        plist: 'models/PList',
        appState: 'models/AppState',
        lattice: 'lattice/Lattice',
        fileSaver: 'models/FileSaver',

        //UI
        navbar: 'menus/Navbar',
        navViewMenu: 'menus/NavViewMenu',//view dropdown
        ribbon: 'menus/Ribbon',
        menuWrapper: 'menus/MenuWrapperView',
        menuParent: 'menus/MenuParentView',
        latticeMenu: 'menus/LatticeMenuView',
        importMenu: 'menus/LatticeMenuView',
        partMenu: 'menus/PartMenuView',
        scriptMenu: 'menus/ScriptMenuView',
        physicsMenu: 'menus/PhysicsMenuView',
        materialMenu: 'menus/MaterialMenuView',
        optimizeMenu: 'menus/OptimizationMenuView',
        assemblerMenu: 'menus/AssemblerMenuView',
        camMenu: 'menus/CamMenuView',
        animateMenu: 'menus/AnimationMenuView',
        sendMenu: 'menus/SendMenuView'


    },
    shim: {
        three: {
            exports: 'THREE'
        },
        orbitControls: {
            deps: ['three'],
            exports: 'THREE'
        },
        fileSaverLib: {
            exports: 'saveAs'
        },
        flatUI: {
            deps: ['jquery']
        }
    }
});

//init stuff
requirejs(['appState', 'lattice', 'menuWrapper', 'navbar', 'ribbon', 'threeModel', 'threeView', 'analytics', 'flatUI'],
    function(appState, lattice, MenuWrapper, Navbar, Ribbon, three, ThreeView){

    new MenuWrapper({model:appState});
    new Navbar({model:appState});
    new Ribbon({model:appState});

    new ThreeView({model:three});

//    if (lattice.get("connectionType") != "gik") lattice.addCellAtIndex({x:0,y:0,z:0});//add a cell
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
