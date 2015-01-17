/**
 * Created by aghassaei on 1/7/15.
 */


$(function(){

    window.workers = persistentWorkers(8);

    three = new ThreeView();

    //init models and views
    var fillGeometry = new FillGeometry();//singleton
    three.setFillGeometry(fillGeometry);
    new ImportView({model: fillGeometry});

    lattice = new Lattice();





    setupNavBar();




});
