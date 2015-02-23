/**
 * Created by aghassaei on 1/7/15.
 */


$(function(){

    //setup persistent global variables

    //init web workers
    window.workers = persistentWorkers(8);

    //init threeJS and geometry models
    window.three = new ThreeModel();

    window.lattice = new Lattice();
    window.appState = new AppState({lattice:window.lattice});



    //ui
    new NavBar({model:appState});

    //threeJS View
    new ThreeView({model:window.three, appState:appState});

    window.lattice.addCellAtIndex({x:0,y:0,z:0});//add a cell
});
