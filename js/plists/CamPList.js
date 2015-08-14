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
                translation: {x:-4.0757,y: -4.3432,z: -6.2154},
                rotation: {x:Math.PI/2,y:0,z:0},
                scale: 20,
                components: {
                    xAxis: {
                        name: "X Axis",
                        isLinear: true,
                        axisOfMotion: null,
                        //minBound
                        //maxBound
                        parent: "yAxis",
                        children: ["zAxis"],
                        stl: {
                            filename: "assets/stls/stapler/xAxis.stl",
                            offset: {x:0,y:0,z:0},
                            scale: 1.0,
                            rotation: {x:0,y:0,z:0}
                        }
                    },
                    frame: {
                        name: "Y Axis",
                        isLinear: true,
                        axisOfMotion: null,
                        //minBound
                        //maxBound
                        parent: "substrate",
                        children: ["yAxis"],
                        stl: {
                            filename: "assets/stls/stapler/yAxis.stl",
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
                        parent: "xAxis",
                        children: [],//stock
                        stl: {
                            filename: "assets/stls/stapler/zAxis.stl",
                            offset: {x:0,y:0,z:0},
                            scale: 1.0,
                            rotation: {x:0,y:0,z:0}
                        }
                    },
                    yAxis: {
                        name: "Frame",
                        isLinear: true,
                        axisOfMotion: null,
                        //minBound
                        //maxBound
                        parent: "frame",
                        children: ["xAxis"],
                        stl: {
                            filename: "assets/stls/stapler/frame.stl",
                            offset: {x:0,y:0,z:0},
                            scale: 1.0,
                            rotation: {x:0,y:0,z:0}
                        }
                    },
                    substrate: {
                        name: "Substrate",
                        isLinear: false,
                        axisOfMotion: null,
                        //minBound
                        //maxBound
                        parent: null,
                        children: ["yAxis"],
                        stl: {
                            filename: "assets/stls/stapler/substrate.stl",
                            offset: {x:0,y:0,z:0},
                            scale: 1.0,
                            rotation: {x:0,y:0,z:0}
                        }
                    }
                },
                stock:{
                    stock1: {
                        description:{
                            materialName: "brass",
                            length: 4
                        },
                        name: "Stock 1",
                        parent: "zAxis",
                        position: {x:0,y:0,z:0}
                    },
                    stock2: {
                        description:{
                            materialName: "fiberGlass",
                            length: 4
                        },
                        name: "Stock 2",
                        parent: "zAxis",
                        position: {x:26.1,y:0,z:0}
                    }
                },
                defaults: {
                    camStrategy: "raster",
                    placementOrder: "XYZ",//used for raster strategy entry
                    camProcess: "gcode",
                    rapidHeight:10,
                    rapidHeightRelative: true,
                    safeHeight: 0.5,
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