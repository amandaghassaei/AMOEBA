/**
 * Created by aghassaei on 8/12/15.
 */


define([], function(){

    return {

        allMachines:{
            handOfGod: {
                name: "Hand of God",
                shouldPickUpStock: false,
                relative: false,
                camProcesses: ["gcode"],
                numMaterials: -1//-1 == infinite
            },
            shopbot: {
                name: "Shopbot",
                shouldPickUpStock: true,
                relative: false,
                camProcesses: ["shopbot", "gcode"],
                numMaterials: -1
            },
            oneBitBot: {
                name: "One Bit Bot",
                shouldPickUpStock: true,
                relative: true,
                camProcesses: ["gcode", "tinyG"]
            },
            stapler: {
                name: "Dual Head Stapler",
                shouldPickUpStock: false,
                relative: false,
                camProcesses: ["gcode"],
                numMaterials: 2,
                components: {
                    xAxis: {
                        name: "X Axis",
                        isLinear: true,
                        axisOfMotion: null,
                        //minBound
                        //maxBound
                        parent: null,
                        children: [],
                        stl: {
                            filename: "jflsdkjfsd.stl",
                            offset: {x:0,y:0,z:0},
                            scale: 1.0,
                            rotation: {x:0,y:0,z:0}
                        }
                    },
                    yAxis: {
                        name: "Y Axis",
                        isLinear: true,
                        axisOfMotion: null,
                        //minBound
                        //maxBound
                        parent: null,
                        children: ["zAxis"],
                        stl: {
                            filename: "jflsdkjfsd.stl",
                            offset: {x:0,y:0,z:0},
                            scale: 1.0,
                            rotation: {x:0,y:0,z:0}
                        }
                    },
                    zAxis: {
                        name: "Z Axis",
                        isLinear: true,
                        axisOfMotion: null,
                        //minBound
                        //maxBound
                        parent: null,
                        children: [],
                        stl: {
                            filename: "jflsdkjfsd.stl",
                            offset: {x:0,y:0,z:0},
                            scale: 1.0,
                            rotation: {x:0,y:0,z:0}
                        }
                    },
                    frame: {
                        name: "Frame",
                        isLinear: true,
                        axisOfMotion: null,
                        //minBound
                        //maxBound
                        parent: null,
                        children: [],
                        stl: {
                            filename: "jflsdkjfsd.stl",
                            offset: {x:0,y:0,z:0},
                            scale: 1.0,
                            rotation: {x:0,y:0,z:0}
                        }
                    },
                    substrate: {
                        name: "Substrate",
                        isLinear: true,
                        axisOfMotion: null,
                        //minBound
                        //maxBound
                        parent: null,
                        children: [],
                        stl: {
                            filename: "jflsdkjfsd.stl",
                            offset: {x:0,y:0,z:0},
                            scale: 1.0,
                            rotation: {x:0,y:0,z:0}
                        }
                    }
                },
                defaults: {
                    camStrategy: "raster",
                    placementOrder: "XYZ",//used for raster strategy entry
                    camProcess: "gcode",
                    rapidHeight:3,
                    rapidHeightRelative: true,
                    safeHeight: 0.05,
                    originPosition: {x:0,y:0,z:0},
                    rapidSpeeds:{xy: 3, z: 2},
                    feedRate:{xy: 0.1, z: 0.1}
                }
            }
        },

        machineTypesForLattice:{
            octa:{
                face: ["handOfGod"],
                edgeRot: ["shopbot", "oneBitBot", "handOfGod"],
                vertex: ["handOfGod"]
            },
            tetra: {
                vertex: ["handOfGod"]
            },
            cube:{
                face: ["handOfGod"],
                gik: ["stapler", "handOfGod"]
            },
            truncatedCube:{
                face:["handOfGod"]
            },
            kelvin:{
                face:["handOfGod"]
            }
        },

        allAssemblyStrategies: {
            raster: "Raster"
        },

        allCamProcesses: {
            shopbot: "Shopbot (sbp)",
            gcode: "G-Code",
            tinyG: "TinyG"
        },

        allUnitTypes: {
            inches: "Inches",
            mm: "mm",
            um: "Micron"
        }

    }
});