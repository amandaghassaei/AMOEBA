/**
 * Created by aghassaei on 1/7/15.
 */


$(function(){

    window.workers = persistentWorkers(8);


    //init threeJS
    var threeModel = new ThreeModel();
    window.three = threeModel;

    //backbone models and views
    var fillGeometry = new FillGeometry();//singleton, mesh to fill with lattice
//    new ImportView({model: fillGeometry});
//    var fillGeometryView = new FillGeometryView({model: fillGeometry, three:threeModel});


    var lattice = new Lattice({fillGeometry:fillGeometry});
    var latticeView = new LatticeView({model:lattice, three:threeModel});

    var highlightTargets = [latticeView];

    var threeView = new ThreeView({model:threeModel, highlightTargets:highlightTargets});


    //first, pre load the stl
    part_loadSTL();

    function part_loadSTL(){
        var loader = new THREE.STLLoader();
        loader.addEventListener('load', part_onMeshLoad);
        loader.load('data/Airbus_A300-600.stl');
    }

    function part_onMeshLoad(e){
        new DmaPart(e.content);
    }

    setupNavBar(threeModel);
});
