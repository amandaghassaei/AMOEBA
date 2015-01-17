/**
 * Created by aghassaei on 1/7/15.
 */


$(function(){

    window.workers = persistentWorkers(8);

    var threeModel = new ThreeModel();
    var three = new ThreeView({model:threeModel});//singleton, my threejs view

    //init models and views
    var fillGeometry = new FillGeometry();//singleton, mesh to fill with lattice
    new ImportView({model: fillGeometry});
    three.setFillGeometry(fillGeometry);


    lattice = new Lattice();


    setupNavBar(threeModel);
});
