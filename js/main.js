/**
 * Created by aghassaei on 1/7/15.
 */

//setup persistent global variables
if (typeof dmaGlobals === "undefined") dmaGlobals = {};


$(function(){

    //init web workers
    window.workers = persistentWorkers(8);

    //init threeJS and geometry models
    dmaGlobals.three = new ThreeModel();

    dmaGlobals.appState = new AppState();
    dmaGlobals.lattice = new Lattice();
    dmaGlobals.lattice._updateLatticeType();//todo get rid of this
    dmaGlobals.assembler = new Assembler();
    dmaGlobals.appState.delayedInit();


    //ui
    new NavBar({model:dmaGlobals.appState});

    //threeJS View
    new ThreeView({model:dmaGlobals.three, appState:dmaGlobals.appState});

    dmaGlobals.lattice.addCellAtIndex({x:0,y:0,z:0});//add a cell
});
