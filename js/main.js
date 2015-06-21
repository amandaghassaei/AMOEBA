/**
 * Created by aghassaei on 1/7/15.
 */

require.config({

    baseUrl: 'js',

    paths: {
        jquery: '../dependencies/jquery-2.1.3',
        underscore: '../dependencies/underscore',
        backbone: '../dependencies/backbone',
        flatUI: '../dependencies/flatUI/js/flat-ui',
        fileSaverLib: '../dependencies/loaders/FileSaver.min',

        //three
        three: '../dependencies/three',
        orbitControls: '../dependencies/OrbitControls',
        stlLoader: '../dependencies/loaders/STLLoader',
        threeModel: 'three/ThreeModel',
        threeView: 'three/ThreeView',

        //models
        globals: 'models/globals',
        plist: 'models/PList',
        appState: 'models/AppState',
        fileSaver: 'models/FileSaver',

        //communication
        socketio: '../dependencies/socket.io-1.3.5',
        serialComm: 'models/SerialComm',

        //lattice
        latticeBase: 'lattice/LatticeBase',
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
        compositeEditorLattice: 'lattice/CompositeEditorLattice',

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
        compositeCell: "cells/supercells/CompositeCell",

        //parts
        part: 'parts/DMAPart',
        octaFaceTriPart: 'parts/OctaFaceTriPart',
        octaEdgeVoxPart: 'parts/OctaEdgeVoxPart',
        octaEdgeVoxPartLowPoly: 'parts/OctaEdgeVoxPartLowPoly',
        gikPart: 'parts/GIKPart',
        gikPartLowPoly: 'parts/GIKPartLowPoly',

        //materials
        materials: 'materials/DMAMaterials',

        //UI
        navbar: 'menus/Navbar',
        navViewMenu: 'menus/NavViewMenu',//view dropdown
        ribbon: 'menus/Ribbon',
        modalView: 'menus/ModalView',
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
        sendMenu: 'menus/SendMenuView',
        compositeMenu: 'menus/CompositeMenuView',
        setupCommMenu: 'menus/SetupCommMenuView',
        discoveryMenu: 'menus/DiscoveryMenuView',

        //templates
        navViewMenuTemplate: 'menus/templates/NavViewMenu.html',
        ribbonTemplate: 'menus/templates/Ribbon.html',
        modalViewTemplate: 'menus/templates/ModalView.html',
        menuWrapperTemplate: 'menus/templates/MenuWrapperView.html',
        latticeMenuTemplate: 'menus/templates/LatticeMenuView.html',
        importMenuTemplate: 'menus/templates/LatticeMenuView.html',
        partMenuTemplate: 'menus/templates/PartMenuView.html',
        scriptMenuTemplate: 'menus/templates/ScriptMenuView.html',
        physicsMenuTemplate: 'menus/templates/PhysicsMenuView.html',
        materialMenuTemplate: 'menus/templates/MaterialMenuView.html',
        optimizeMenuTemplate: 'menus/templates/OptimizationMenuView.html',
        assemblerMenuTemplate: 'menus/templates/AssemblerMenuView.html',
        camMenuTemplate: 'menus/templates/CamMenuView.html',
        animateMenuTemplate: 'menus/templates/AnimationMenuView.html',
        sendMenuTemplate: 'menus/templates/SendMenuView.html',
        compositeMenuTemplate: 'menus/templates/CompositeMenuView.html',
        setupCommMenuTemplate: 'menus/templates/SetupCommMenuView.html',
        discoveryMenuTemplate: 'menus/templates/DiscoveryMenuView.html',

        //stls
        octaFaceTrianglePartSTL: '../assets/stls/parts/OctaFaceTrianglePart.stl',
        octaEdgeVoxPartSTL: '../assets/stls/parts/OctaEdgeVoxPart.stl',
        octaEdgeVoxPartLowPolySTL: '../assets/stls/parts/OctaEdgeVoxPartLowPoly.stl',
        gikPartSTL: '../assets/stls/parts/GIKPart.stl',
        gikEndPartSTL: '../assets/stls/parts/GIKEndPart.stl',
        gikPartLowPolySTL: '../assets/stls/parts/GIKPartLowPoly.stl',
        gikEndPartLowPolySTL: '../assets/stls/parts/GIKEndPartLowPoly.stl'

    },

    shim: {
        three: {
            exports: 'THREE'
        },
        orbitControls: {
            deps: ['three'],
            exports: 'THREE'
        },
        stlLoader: {
            deps: ['three'],
            exports: 'THREE'
        },
        fileSaverLib: {
            exports: 'saveAs'
        },
        flatUI: {
            deps: ['jquery']
        },
        'socketio': {
            exports: 'io'
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

//    if (lattice.get("connectionType") != "gik") lattice.getUItarget().addCellAtIndex({x:0,y:0,z:0});//add a cell
});
