/**
 * Created by aghassaei on 1/7/15.
 */

require.config({

    baseUrl: 'js',

    paths: {
        jquery: 'dependencies/jquery-2.1.3',
        underscore: 'dependencies/underscore',
        backbone: 'dependencies/backbone',
        flatUI: 'dependencies/flatUI/js/flat-ui',
        fileSaverLib: 'dependencies/loaders/FileSaver.min',

        //three
        three: 'dependencies/three',
        orbitControls: 'dependencies/OrbitControls',
        threeModel: 'three/ThreeModel',
        threeView: 'three/ThreeView',

        //models
        globals: 'models/globals',
        plist: 'models/PList',
        appState: 'models/AppState',
        fileSaver: 'models/FileSaver',

        //lattice
        lattice: 'lattice/Lattice',
        cubeLattice: 'lattice/CubeLattice',
        gikLattice: 'lattice/GIKLattice',
        kelvinLattice: 'lattice/KelvinLattice',
        octaEdgeLattice: 'lattice/OctaEdgeLattice',
        octaFaceLattice: 'lattice/OctaFaceLattice',
        octaRotEdgeLattice: 'lattice/OctaRotEdgeLattice',
        octaVertexLattice: 'lattice/OctaVertexLattice',
        truncatedCubeLattice: 'lattice/TruncatedCubeLattice',
        tetraStackedLattice: 'lattice/TetraStackedLattice',
        tetraVertexLattice: 'lattice/TetraVertexLattice',

        //baseplane
        baseplane: 'baseplane/BasePlane',
        squareBaseplane: 'baseplane/SquareBasePlane',
        octaBaseplane: 'baseplane/OctaBasePlane',
        rotEdgeOctaBaseplane: 'baseplane/RotEdgeOctaBasePlane',

        //highlighter
        highlighter: 'highlighter/Highlighter',
        defaultHighlighter: 'highlighter/DefaultHighlighter',
        cubeHighlighter: 'highlighter/CubeHighlighter',
        superCellHighlighter: 'highlighter/SuperCellHighlighter',
        octaFaceHighlighter: 'highlighter/OctaFaceHighlighter',
        truncatedCubeHighlighter: 'highlighter/TruncatedCubeHighlighter',

        //cells
        cell: 'cells/DMACell',
        octaFaceCell: 'cells/OctaFaceCell',
        octaEdgeCell: 'cells/OctaEdgeCell',
        octaVertexCell: 'cells/OctaVertexCell',
        octaRotEdgeCell: 'cells/OctaRotEdgeCell',
        tetraStackedCell: 'cells/TetraStackedCell',
        tetraVertexCell: 'cells/TetraVertexCell',
        truncatedCubeCell: 'cells/TruncatedCubeCell',
        kelvinCell: 'cells/KelvinCell',
        cubeCell: 'cells/CubeCell',
        gikCell: 'cells/GIKCell',
        superCell: 'cells/supercells/DMASupercell',
        gikSuperCell: 'cells/supercells/GIKSuperCell',

        //materials
        materials: 'materials/DMAMaterials',
        electronicMaterials: 'materials/ElectronicMaterials',
        mechanicalMaterials: 'materials/MechanicalMaterials',

        //UI
        navbar: 'menus/Navbar',
        navViewMenu: 'menus/NavViewMenu',//view dropdown
        ribbon: 'menus/Ribbon',
        menuWrapper: 'menus/MenuWrapperView',
        menuParent: 'menus/MenuParentView',
        latticeMenu: 'menus/LatticeMenuView',
        importMenu: 'menus/LatticeMenuView',
        partMenu: 'menus/PartMenuView',
        scriptMenu: 'menus/ScriptMenuView',
        physicsMenu: 'menus/PhysicsMenuView',
        materialMenu: 'menus/MaterialMenuView',
        optimizeMenu: 'menus/OptimizationMenuView',
        assemblerMenu: 'menus/AssemblerMenuView',
        camMenu: 'menus/CamMenuView',
        animateMenu: 'menus/AnimationMenuView',
        sendMenu: 'menus/SendMenuView'

    },

    shim: {
        three: {
            exports: 'THREE'
        },
        orbitControls: {
            deps: ['three'],
            exports: 'THREE'
        },
        fileSaverLib: {
            exports: 'saveAs'
        },
        flatUI: {
            deps: ['jquery']
        }
    }

});

//require.onError = function (err) {
//    console.log(err.requireType);
//    console.log(err.requireModules);
//    throw err;
//};

//init stuff
require(['appState', 'lattice', 'menuWrapper', 'navbar', 'ribbon', 'threeModel', 'threeView', 'flatUI'],
    function(appState, lattice, MenuWrapper, Navbar, Ribbon, three, ThreeView){

    new MenuWrapper({model:appState});
    new Navbar({model:appState});
    new Ribbon({model:appState});

    new ThreeView({model:three});

//    if (lattice.get("connectionType") != "gik") lattice.addCellAtIndex({x:0,y:0,z:0});//add a cell
});
