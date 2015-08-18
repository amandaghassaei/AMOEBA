/**
 * Created by aghassaei on 8/12/15.
 */


define(['three'], function(THREE){

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
                        rotary: false,
                        axisOfMotion: null,
                        //minBound
                        //maxBound
                        parent: "yAxis",
                        motionVector: {x:1, y:0, z:0},
                        stl: {
                            filename: "assets/stls/stapler/xAxis.stl",
                            offset: {x:0,y:0,z:0},
                            scale: 1.0,
                            rotation: {x:0,y:0,z:0}
                        }
                    },
                    frame: {
                        name: "Y Axis",
                        rotary: false,
                        axisOfMotion: null,
                        //minBound
                        //maxBound
                        parent: "substrate",
                        motionVector: {x:0, y:1, z:0},
                        stl: {
                            filename: "assets/stls/stapler/yAxis.stl",
                            offset: {x:0,y:0,z:0},
                            scale: 1.0,
                            rotation: {x:0,y:0,z:0}
                        }
                    },
                    zAxis: {
                        name: "Z Axis",
                        rotary: false,
                        axisOfMotion: null,
                        //minBound
                        //maxBound
                        parent: "xAxis",
                        motionVector: {x:0, y:0, z:1},
                        stl: {
                            filename: "assets/stls/stapler/zAxis.stl",
                            offset: {x:0,y:0,z:0},
                            scale: 1.0,
                            rotation: {x:0,y:0,z:0}
                        }
                    },
                    yAxis: {
                        name: "Frame",
                        rotary: false,
                        axisOfMotion: null,
                        //minBound
                        //maxBound
                        parent: "frame",
                        isStatic: true,
                        stl: {
                            filename: "assets/stls/stapler/frame.stl",
                            offset: {x:0,y:0,z:0},
                            scale: 1.0,
                            rotation: {x:0,y:0,z:0}
                        }
                    },
                    substrate: {
                        name: "Substrate",
                        rotary: true,
                        axisOfMotion: null,
                        centerOfRotation: {x:10,y:10,z:0},
                        //minBound
                        //maxBound
                        parent: null,
                        motionVector: {x:0, y:0, z:1},
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
                        position: {x:26,y:0.236,z:0}
                    }
                },
                lattice:{
                    scale: 1.27,
                    units: 'mm'
                },
                defaults: {
                    camStrategy: "raster",
                    placementOrder: "XYZ",//used for raster strategy entry
                    camProcess: "gcode",
                    rapidHeight:40,
                    rapidHeightRelative: true,
                    safeHeight: 0.5,
                    originPosition: new THREE.Vector3(0,0,0),
                    rapidSpeeds:{xy: 240, z: 120},
                    feedRate:{xy: 6, z: 6}
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