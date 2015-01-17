/**
 * Created by aghassaei on 1/7/15.
 */


$(function(){

    window.workers = persistentWorkers(8);


    //init threeJS view
    var threeModel = new ThreeModel();
    var three = new ThreeView({model:threeModel});

    //backbone models and views
    var fillGeometry = new FillGeometry();//singleton, mesh to fill with lattice
    new ImportView({model: fillGeometry});
    new FillGeometryView({model: fillGeometry, three:threeModel});


    lattice = new Lattice();


    setupNavBar(threeModel);
});
