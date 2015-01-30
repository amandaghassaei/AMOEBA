/**
 * Created by aghassaei on 1/7/15.
 */


$(function(){

    //init web workers
    window.workers = persistentWorkers(8);

    //init threeJS and geometry models
    window.three = new ThreeModel();
    var lattice = new Lattice();

    //setup ui
    var appState = new AppState({lattice:lattice});
    new MenuWrapper({lattice:lattice, model:appState});
    new NavBar({model:appState});

    //threeJS View
    new ThreeView({model:window.three, lattice:lattice, appState:appState});

    lattice.addCell(new THREE.Vector3(0,0,0));
});
