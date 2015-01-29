/**
 * Created by aghassaei on 1/7/15.
 */


$(function(){

    window.workers = persistentWorkers(8);


    //init threeJS
    window.three = new ThreeModel();

    var lattice = new Lattice();
    new ThreeView({model:window.three, lattice:lattice});


    //setup ui
    var appState = new AppState();
    var menu = new MenuWrapper({lattice:lattice, model:appState});
    NavBar(menu);

    lattice.addCell(new THREE.Vector3(0,0,0));
});
