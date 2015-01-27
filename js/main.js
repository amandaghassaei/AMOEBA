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
    var menu = MenuWrapper({lattice:lattice});
    NavBar(menu);
});
