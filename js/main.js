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
        fileSaverLib: '../dependencies/loaders/FileSaver.min',
        text: '../dependencies/require/text',
        bin: '../dependencies/require/bin',

        //three
        three: '../dependencies/three',
        orbitControls: '../dependencies/OrbitControls',
        stlLoader: '../dependencies/loaders/STLLoader',
        stlExport: '../dependencies/loaders/binary_stl_writer',

        appState: 'models/appState',
        lattice: 'models/lattice',
        plist: 'plists/plist',
        materialPlist: 'plists/materialPlist',

        threeModel: 'three/threeModel',
        baseplane: 'three/baseplane',
        highlighter: 'three/highlighter',
        threeInteraction: 'three/threeInteraction',

        menuWrapperView: 'menus/MenuWrapperView',
        menuParent: "menus/MenuParentView",

        Cell: 'classes/Cell'
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
        fileSaverLib: {
            exports: 'saveAs'
        },
        flatUI: {
            deps: ['jquery']
        }
    }

});

require.onError = function (err) {
    console.log(err.requireType);
    console.log(err.requireModules);
    throw err;
};

//init stuff
require(["jquery", "threeInteraction", "menuWrapperView", "flatUI"], function($, interaction , menuWrapper){

    menuWrapper.render();

});
