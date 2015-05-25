/**
 * Created by aghassaei on 1/7/15.
 */

//setup persistent global variables
if (typeof globals === "undefined") globals = {};


$(function(){

    //init web workers
//    window.workers = persistentWorkers(8);

    //init global singletons
    globals.plist = buildAppPList();
    globals.three = new ThreeModel();
    globals.appState = new AppState();
    globals.lattice = new Lattice({appState: globals.appState});
    globals.lattice.delayedInit();
    globals.assembler = new Assembler({appState: globals.appState, lattice:globals.lattice});
    globals.appState.delayedInit();

    //ui
    new NavBar({model:globals.appState});
    new Ribbon({model:globals.appState});

    //threeJS View
    new ThreeView({model:globals.three, appState:globals.appState});

    if (globals.lattice.get("connectionType") != "gik") globals.lattice.addCellAtIndex({x:0,y:0,z:0});//add a cell
});
