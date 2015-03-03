/**
 * Created by aghassaei on 1/7/15.
 */


$(function(){

    //setup persistent global variables

    dmaGlobals = {};

    //init web workers
    window.workers = persistentWorkers(8);

    //init threeJS and geometry models
    dmaGlobals.three = new ThreeModel();

    dmaGlobals.lattice = new Lattice();
    dmaGlobals.lattice._updateLatticeType();//todo get rid of this
    dmaGlobals.appState = new AppState({lattice:dmaGlobals.lattice});



    //ui
    new NavBar({model:dmaGlobals.appState});

    //threeJS View
    new ThreeView({model:dmaGlobals.three, appState:dmaGlobals.appState});

    dmaGlobals.lattice.addCellAtIndex({x:0,y:0,z:0});//add a cell
});
