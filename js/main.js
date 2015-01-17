/**
 * Created by aghassaei on 1/7/15.
 */


$(function(){

    three = new ThreeView();

    //init models and views
    var fillGeometry = new FillGeometry();//singleton
    new ImportView({model: fillGeometry});

    lattice = new Lattice();


    three.setFillGeometry(fillGeometry);


    //window.fillGeometry.set({geometry:"stuff"});

    setupNavBar();
    workers = persistentWorkers(8);



});
