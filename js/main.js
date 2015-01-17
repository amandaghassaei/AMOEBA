/**
 * Created by aghassaei on 1/7/15.
 */


$(function(){

    three = Three();

    //init models and views
    fillGeometry = new FillGeometry();//init a singleton, add to global scope
    new ImportView({model: window.fillGeometry});

    lattice = new Lattice();


    //window.fillGeometry.set({geometry:"stuff"});

    setupNavBar();
    workers = persistentWorkers(8);



});
