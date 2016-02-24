/**
 * Created by aghassaei on 1/7/15.
 */

require.config({

    waitSeconds: 0,

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
        selection3D: 'three/Selection3D',
        axes: 'three/Axes',
        arrow: 'three/Arrow',
        svgRenderer: '../dependencies/svgRenderer',
        threeProjector: '../dependencies/Projector',

        //plist
        plist: 'plists/PList',

        //models
        globals: 'models/Globals',
        appState: 'models/AppState',
        fileSaver: 'models/FileSaver',
        dnaExport: 'dnaExport/dnaExport',


        //lattice classes and extra methods
        latticeBase: 'lattice/LatticeBase',
        lattice: 'lattice/Lattice',
        compositeEditorLattice: 'lattice/CompositeEditorLattice',
        latticeImportGeo: 'lattice/ImportGeo',

        //lattice "subclasses"
        cubeLattice: 'lattice/latticeSubclasses/CubeLattice',

        //baseplane
        baseplane: 'baseplane/BasePlane',
        squareBaseplane: 'baseplane/SquareBasePlane',

        //highlighter
        highlighter: 'highlighter/Highlighter',
        cubeHighlighter: 'highlighter/CubeHighlighter',
        superCellHighlighter: 'highlighter/SuperCellHighlighter',

        //cells
        cell: 'cells/DMACell',
        cubeCell: 'cells/CubeCell',
        compositeCell: 'cells/supercells/CompositeCell',
        superCell: 'cells/supercells/DMASuperCell',

        //parts
        part: 'parts/DMAPart',

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
        emSetupMenu: 'menus/EmSetupMenuView',
        emRunMenu: 'menus/EmRunMenuView',

        //simulation

        //emSim
        emSimPlist: 'plists/EMSimPlist',
        emSim: 'simulation/EM/emSim',
        emSimLattice: 'simulation/EM/emSimLattice',
        emSimCell: 'simulation/EM/emSimCell',
        emSimSuperCell: 'simulation/EM/emSimSuperCell',
        emWire: 'simulation/EM/emWire'
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


//    if (lattice.get("connectionType") != "gik") lattice.getUItarget().addCellAtIndex(new THREE.Vector3(0,0,0));//add a cell
});
