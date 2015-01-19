/**
 * Created by aghassaei on 1/7/15.
 */


$(function(){

    window.workers = persistentWorkers(8);


    //init threeJS
    var threeModel = new ThreeModel();

    //backbone models and views
    var fillGeometry = new FillGeometry();//singleton, mesh to fill with lattice
    new ImportView({model: fillGeometry});
    var fillGeometryView = new FillGeometryView({model: fillGeometry, three:threeModel});


    var lattice = new Lattice();
    var latticeView = new LatticeView({model:lattice, three:threeModel, fillGeometry:fillGeometry});

    var highlightTargets = [latticeView];

    var threeView = new ThreeView({model:threeModel, highlightTargets:highlightTargets});


    setupNavBar(threeModel);
});
