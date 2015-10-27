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
        bootstrapSlider: '../dependencies/bootstrap-slider/bootstrap-slider',
        fileSaverLib: '../dependencies/loaders/FileSaver.min',
        numeric: '../dependencies/numeric-1.2.6',
        codeMirrorJS: '../dependencies/codemirror/javascript',
        codeMirror: '../dependencies/codemirror/codemirror',
        text: '../dependencies/require/text',
        bin: '../dependencies/require/bin',

        //three
        three: '../dependencies/three',
        orbitControls: '../dependencies/OrbitControls',
        stlLoader: '../dependencies/loaders/STLLoader',
        stlExport: '../dependencies/loaders/binary_stl_writer',
        threeModel: 'three/ThreeModel',
        threeView: 'three/ThreeView',
        fillGeometry: 'three/FillGeometry',
        axes: 'three/Axes',
        svgRenderer: '../dependencies/svgRenderer',
        threeProjector: '../dependencies/Projector',

        //plist
        plist: 'plists/PList',

        //models
        globals: 'models/Globals',
        appState: 'models/AppState',
        fileSaver: 'models/FileSaver',
        dnaExport: 'dnaExport/dnaExport',

        //communication
        socketio: '../dependencies/socket.io-1.3.5',
        serialComm: 'models/SerialComm',
        commPlist: 'plists/CommPlist',
        machineState: 'models/MachineState',
        serialMonitorController: 'SerialMonitor/SerialMonitorController',

        //lattice classes and extra methods
        latticeBase: 'lattice/LatticeBase',
        lattice: 'lattice/Lattice',
        compositeEditorLattice: 'lattice/CompositeEditorLattice',
        latticeImportGeo: 'lattice/ImportGeo',
        latticeCAM: 'lattice/LatticeCAM',

        //lattice "subclasses"
        cubeLattice: 'lattice/latticeSubclasses/CubeLattice',
        gikLattice: 'lattice/latticeSubclasses/GIKLattice',
        kelvinLattice: 'lattice/latticeSubclasses/KelvinLattice',
        octaEdgeLattice: 'lattice/latticeSubclasses/OctaEdgeLattice',
        octaFaceLattice: 'lattice/latticeSubclasses/OctaFaceLattice',
        octaRotEdgeLattice: 'lattice/latticeSubclasses/OctaRotEdgeLattice',
        octaVertexLattice: 'lattice/latticeSubclasses/OctaVertexLattice',
        truncatedCubeLattice: 'lattice/latticeSubclasses/TruncatedCubeLattice',
        tetraStackedLattice: 'lattice/latticeSubclasses/TetraStackedLattice',
        tetraVertexLattice: 'lattice/latticeSubclasses/TetraVertexLattice',
        hexLattice: 'lattice/latticeSubclasses/HexagonalLattice',
        hexRotLattice: 'lattice/latticeSubclasses/HexagonalRotLattice',

        //baseplane
        baseplane: 'baseplane/BasePlane',
        squareBaseplane: 'baseplane/SquareBasePlane',
        octaBaseplane: 'baseplane/OctaBasePlane',
        rotEdgeOctaBaseplane: 'baseplane/RotEdgeOctaBasePlane',
        hexBaseplane: 'baseplane/HexagonalBasePlane',
        hexRotBasePlane: 'baseplane/HexagonalRotBasePlane',

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
        superCell: 'cells/supercells/DMASuperCell',
        gikSuperCell: 'cells/supercells/GIKSuperCell',
        compositeCell: "cells/supercells/CompositeCell",
        hexCell: 'cells/HexagonalCell',
        hexRotCell: 'cells/HexagonalRotCell',
        dnaBrickCell: 'cells/DNABrickCell',

        //parts
        part: 'parts/DMAPart',
        octaFaceTriPart: 'parts/OctaFaceTriPart',
        octaEdgeVoxPart: 'parts/OctaEdgeVoxPart',
        octaEdgeVoxPartLowPoly: 'parts/OctaEdgeVoxPartLowPoly',
        gikPart: 'parts/GIKPart',
        gikPartLowPoly: 'parts/GIKPartLowPoly',
        kennyTechPart: 'parts/KennyTechPart',
        kennyTechHighResPart: 'parts/KennyTechHighResPart',
        samTechPart: 'parts/SamTechPart',
        legoPart: 'parts/LegoPart',
        dnaStraightPart: 'parts/DNAStraightPart',
        dnaLegoPart: 'parts/DNALegoPart',

        //materials
        materialsPlist: 'plists/MaterialsPlist',
        materials: 'materials/DMAMaterials',
        material: 'materials/DMAMaterial',
        compositeMaterial: 'materials/DMACompositeMaterial',

        //UI
        navbar: 'menus/otherUI/Navbar',
        navViewMenu: 'menus/otherUI/NavViewMenu',//view dropdown
        ribbon: 'menus/otherUI/Ribbon',
        modalView: 'menus/otherUI/ModalView',
        console: 'menus/otherUI/Console',
        contextMenu: 'menus/contextMenu/ContextMenu',
        scriptView: 'menus/otherUI/ScriptView',
        menuWrapper: 'menus/MenuWrapperView',
        menuParent: 'menus/MenuParentView',
        commParentMenu: 'menus/CommParentMenu',

        //electronic sim
        eSimPlist: 'plists/ESimPlist',
        eSim: 'simulation/electronics/eSim',
        latticeESim: 'simulation/electronics/LatticeEsim',
        eSimCell: 'simulation/electronics/cells/eSimCell',
        eSimSuperCell: 'simulation/electronics/cells/eSimSuperCell',
        eSimField: 'simulation/electronics/eSimField',


        //cam
        cam: 'cam/Cam',
        camPlist: 'plists/CamPList',

        //assemblers
        assembler: 'cam/assemblers/Assembler',
        assemblerPost: 'cam/assemblers/AssemblerPost',
        component: 'cam/assemblers/Component',
        stockComponent: 'cam/assemblers/StockComponent',
        urdfJoint: 'cam/assemblers/URDFJoint',
        urdfLink: 'cam/assemblers/URDfLink',

        //processes
        gcode: 'cam/processes/GCodeExporter',
        shopbot: 'cam/processes/ShopbotExporter',
        tinyG: 'cam/processes/TinyGExporter',

        //stls (not sure why ../ is not working here?)
        octaFaceTrianglePartSTL: 'assets/stls/parts/OctaFaceTrianglePart.stl',
        octaEdgeVoxPartSTL: 'assets/stls/parts/OctaEdgeVoxPart.stl',
        octaEdgeVoxPartLowPolySTL: 'assets/stls/parts/OctaEdgeVoxPartLowPoly.stl',
        gikPartSTL: 'assets/stls/parts/GIKPart.stl',
        gikEndPartSTL: 'assets/stls/parts/GIKEndPart.stl',
        gikPartLowPolySTL: 'assets/stls/parts/GIKPartLowPoly.stl',
        gikEndPartLowPolySTL: 'assets/stls/parts/GIKEndPartLowPoly.stl',
        kennyTechPartSTL: 'assets/stls/parts/KennyTechPart.stl',
        kennyTechPartHighResSTL: 'assets/stls/parts/KennyTechPartHighRes.stl',
        samTechPartSTL: 'assets/stls/parts/SamTechPart.stl',
        legoBrickSTL: 'assets/stls/parts/legoBrick1x1.stl',
        dnaLegoBrickSTL: 'assets/stls/parts/DNALegoBrick1x2.stl',
        dnaLegoBrick1x1STL: 'assets/stls/parts/DNALegoBrick1x1.stl'

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
        stlExport: {
            exports: 'geometryToSTLBin'
        },
        threeProjector: {
            deps: ['three'],
            exports: "THREE"
        },
        svgRenderer: {
            deps: ['three', 'threeProjector'],
            exports: "THREE.SVGRenderer"
        },
        fileSaverLib: {
            exports: 'saveAs'
        },
        flatUI: {
            deps: ['jquery']
        },
        bootstrapSlider:{
            deps: ['jquery'],
            exports: '$'
        },
        'socketio': {
            exports: 'io'
        },
        'numeric': {
            exports: 'numeric'
        }
    }

});

//require.onError = function (err) {
//    console.log(err.requireType);
//    console.log(err.requireModules);
//    throw err;
//};

//init stuff
require(['appState', 'lattice', 'navbar', 'threeModel', 'threeView', 'globals',
    'flatUI', 'bootstrapSlider', 'ribbon', 'menuWrapper', 'scriptView', 'contextMenu', 'console'],
    function(appState, lattice, Navbar, three, ThreeView, globals){

    new Navbar({model:appState});

    var threeView = new ThreeView({model:three});
    globals.threeView = threeView;//todo fix this

//    three.startAnimationLoop();

//    if (lattice.get("connectionType") != "gik") lattice.getUItarget().addCellAtIndex({x:0,y:0,z:0});//add a cell
});
