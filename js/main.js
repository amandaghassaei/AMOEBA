/**
 * Created by aghassaei on 1/7/15.
 */


$(function(){

    window.workers = persistentWorkers(8);

    var three = new ThreeView();//singleton, my threejs view

    //init models and views
    var fillGeometry = new FillGeometry();//singleton, mesh to fill with lattice
    three.setFillGeometry(fillGeometry);
    new ImportView({model: fillGeometry});

    lattice = new Lattice();





    setupNavBar(three);




});
