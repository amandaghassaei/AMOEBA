/**
 * Created by aghassaei on 1/7/15.
 */


$(function(){

    //init web workers
    window.workers = persistentWorkers(8);

    //init threeJS and geometry models
    window.three = new ThreeModel();
    window.lattice = new OctaFaceLattice();

    //setup ui
    var appState = new AppState({lattice:window.lattice});
    new MenuWrapper({lattice:window.lattice, model:appState});
    new NavBar({model:appState});

    //threeJS View
    new ThreeView({model:window.three, lattice:window.lattice, appState:appState});

    window.lattice.addCellAtIndex({x:0,y:0,z:0});
});
