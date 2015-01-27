/**
 * Created by aghassaei on 1/7/15.
 */


$(function(){

    window.workers = persistentWorkers(8);


    //init threeJS
    var threeModel = new ThreeModel();
    window.three = threeModel;

    //backbone models and views
//    var fillGeometry = new FillGeometry();//singleton, mesh to fill with lattice
//    new ImportView({model: fillGeometry});
//    var fillGeometryView = new FillGeometryView({model: fillGeometry, three:threeModel});


    var lattice = new Lattice();
    var threeView = new ThreeView({model:threeModel, lattice:lattice});


    //setup ui
    var menu = MenuWrapper();
    NavBar(menu);
});
