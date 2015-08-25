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
        threeModel: 'three/ThreeModel',
        threeView: 'three/ThreeView',
        fillGeometry: 'three/FillGeometry',
        axes: 'three/Axes',

        //plist
        plist: 'plists/PList',

        //models
        globals: 'models/Globals',
        appState: 'models/AppState',
        fileSaver: 'models/FileSaver',

        //communication
        socketio: '../dependencies/socket.io-1.3.5',
        serialComm: 'models/SerialComm',
        commPlist: 'plists/CommPlist',
        machineState: 'models/MachineState',

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

        //parts
        part: 'parts/DMAPart',
        octaFaceTriPart: 'parts/OctaFaceTriPart',
        octaEdgeVoxPart: 'parts/OctaEdgeVoxPart',
        octaEdgeVoxPartLowPoly: 'parts/OctaEdgeVoxPartLowPoly',
        gikPart: 'parts/GIKPart',
        gikPartLowPoly: 'parts/GIKPartLowPoly',
        kennyTeqPart: 'parts/KennyTeqPart',
        kennyTeqHighResPart: 'parts/KennyTeqHighResPart',
        samTeqPart: 'parts/SamTeqPart',

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
        importMenu: 'menus/ImportMenuView',
        partMenu: 'menus/PartMenuView',
        scriptMenu: 'menus/ScriptMenuView',
        materialMenu: 'menus/MaterialMenuView',
        materialPropertiesMenu: 'menus/MaterialPropertiesMenuView',
        optimizeMenu: 'menus/OptimizationMenuView',
        assemblerMenu: 'menus/AssemblerMenuView',
        camMenu: 'menus/CamMenuView',
        editCamOutputMenu: 'menus/EditCamOutputMenuView',
        animateMenu: 'menus/AnimationMenuView',
        sendMenu: 'menus/SendMenuView',
        compositeMenu: 'menus/CompositeMenuView',
        materialEditorMenu: 'menus/MaterialEditorMenuView',
        setupCommMenu: 'menus/SetupCommMenuView',
        discoveryMenu: 'menus/DiscoveryMenuView',
        eSetupMenu: 'menus/ESetupMenuView',
        eStaticMenu: 'menus/EStaticMenuView',
        eDynamicMenu: 'menus/EDynamicMenuView',
        mSetupMenu: 'menus/MSetupMenuView',
        mStaticMenu: 'menus/MStaticMenuView',
        mDynamicMenu: 'menus/MDynamicMenuView',
        assemblerSetupMenu: 'menus/AssemblerSetupMenuView',
        editComponentMenu: 'menus/EditComponentMenuView',
        commParentMenu: 'menus/CommParentMenu',
        serialMonitorController: 'SerialMonitor/SerialMonitorController',

        //templates
        navViewMenuTemplate: 'menus/templates/NavViewMenu.html',
        ribbonTemplate: 'menus/templates/Ribbon.html',
        modalViewTemplate: 'menus/templates/ModalView.html',
        scriptView: 'menus/ScriptView',
        menuWrapperTemplate: 'menus/templates/MenuWrapperView.html',
        latticeMenuTemplate: 'menus/templates/LatticeMenuView.html',
        importMenuTemplate: 'menus/templates/ImportMenuView.html',
        partMenuTemplate: 'menus/templates/PartMenuView.html',
        scriptMenuTemplate: 'menus/templates/ScriptMenuView.html',
        materialMenuTemplate: 'menus/templates/MaterialMenuView.html',
        optimizeMenuTemplate: 'menus/templates/OptimizationMenuView.html',
        assemblerMenuTemplate: 'menus/templates/AssemblerMenuView.html',
        camMenuTemplate: 'menus/templates/CamMenuView.html',
        editCamOutputMenuTemplate: 'menus/templates/EditCamOutputMenuView.html',
        animationMenuTemplate: 'menus/templates/AnimationMenuView.html',
        sendMenuTemplate: 'menus/templates/SendMenuView.html',
        compositeMenuTemplate: 'menus/templates/CompositeMenuView.html',
        materialEditorMenuTemplate: 'menus/templates/MaterialEditorMenuView.html',
        setupCommMenuTemplate: 'menus/templates/SetupCommMenuView.html',
        discoveryMenuTemplate: 'menus/templates/DiscoveryMenuView.html',
        eSetupMenuTemplate: 'menus/templates/ESetupMenuView.html',
        eStaticMenuTemplate: 'menus/templates/EStaticMenuView.html',
        eDynamicMenuTemplate: 'menus/templates/EDynamicMenuView.html',
        mSetupMenuTemplate: 'menus/templates/MSetupMenuView.html',
        mStaticMenuTemplate: 'menus/templates/MStaticMenuView.html',
        mDynamicMenuTemplate: 'menus/templates/MDynamicMenuView.html',
        assemblerSetupMenuTemplate: 'menus/templates/AssemblerSetupMenuView.html',
        editComponentMenuTemplate: 'menus/templates/EditComponentMenuView.html',

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
        kennyTeqPartSTL: 'assets/stls/parts/KennyTeqPart.stl',
        kennyTeqPartHighResSTL: 'assets/stls/parts/KennyTeqPartHighRes.stl',
        samTeqPartSTL: 'assets/stls/parts/SamTeqPart.stl'

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
require(['appState', 'lattice', 'navbar', 'threeModel', 'threeView', 'globals', 'flatUI', 'bootstrapSlider', 'ribbon', 'menuWrapper', 'scriptView'],
    function(appState, lattice, Navbar, three, ThreeView, globals){

    new Navbar({model:appState});

    var threeView = new ThreeView({model:three});
    globals.threeView = threeView;//todo fix this

//    if (lattice.get("connectionType") != "gik") lattice.getUItarget().addCellAtIndex({x:0,y:0,z:0});//add a cell
});
