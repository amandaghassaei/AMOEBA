/**
 * Created by aghassaei on 1/7/15.
 */

//setup persistent global variables
if (typeof dmaGlobals === "undefined") dmaGlobals = {};


$(function(){

    //init web workers
//    window.workers = persistentWorkers(8);

    //init global singletons
    dmaGlobals.three = new ThreeModel();
    dmaGlobals.appState = new AppState();
    dmaGlobals.lattice = new Lattice({appState: dmaGlobals.appState});
    dmaGlobals.lattice.delayedInit();
    dmaGlobals.assembler = new Assembler({appState: dmaGlobals.appState, lattice:dmaGlobals.lattice});
    dmaGlobals.appState.delayedInit();

    //ui
    new NavBar({model:dmaGlobals.appState});
    new Ribbon({model:dmaGlobals.appState});

    //threeJS View
    new ThreeView({model:dmaGlobals.three, appState:dmaGlobals.appState});

    if (dmaGlobals.lattice.get("connectionType") != "gik") dmaGlobals.lattice.addCellAtIndex({x:0,y:0,z:0});//add a cell
});
