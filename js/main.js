/**
 * Created by aghassaei on 1/7/15.
 */


$(function(){

    three = Three();

    //init models and views
    window.fillGeometry = new FillGeometry();//init a singleton, add to global scope
    new ImportView({model: window.fillGeometry});


    //window.fillGeometry.set({geometry:"stuff"});

    setupNavBar();
    workers = persistentWorkers(8);



});
