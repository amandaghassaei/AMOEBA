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
                translation: {
                    x: 11.43,
                    y: -61.93,
                    z: -5.06
                },
                scale: 0.7874,
                rotation: {
                    x: 1.5707963267948966,
                    y: 0,
                    z: 0
                },
                shouldPickUpStock: false,
                relative: false,
                camProcesses: [
                    "gcode"
                ],
                numMaterials: 2,
                components: {
                    xAxis: {
                        id: "xAxis",
                        name: "X Axis",
                        children: [
                            "zAxis"
                        ],
                        parent: "yAxis",
                        translation: {
                            x: 15.651968503937008,
                            y: 0,
                            z: 0
                        },
                        scale: 1,
                        rotation: {
                            x: 0,
                            y: 0,
                            z: 0
                        },
                        rotary: false,
                        motionVector: {
                            x: 1,
                            y: 0,
                            z: 0
                        },
                        stl: {
                            filename: "assets/stls/stapler/xAxis.stl"
                        }
                    },
                    frame: {
                        id: "frame",
                        name: "Y Axis",
                        children: [
                            "yAxis"
                        ],
                        parent: "substrate",
                        translation: {
                            x: 0,
                            y: 0,
                            z: 0
                        },
                        scale: 1,
                        rotation: {
                            x: 0,
                            y: 0,
                            z: 0
                        },
                        rotary: false,
                        motionVector: {
                            x: 0,
                            y: 1,
                            z: 0
                        },
                        stl: {
                            filename: "assets/stls/stapler/yAxis.stl"
                        }
                    },
                    zAxis: {
                        id: "zAxis",
                        name: "Z Axis",
                        children: [
                            "stock1",
                            "stock2"
                        ],
                        parent: "xAxis",
                        translation: {
                            x: 0,
                            y: 0,
                            z: 7.874015748031496
                        },
                        scale: 1,
                        rotation: {
                            x: 0,
                            y: 0,
                            z: 0
                        },
                        rotary: false,
                        motionVector: {
                            x: 0,
                            y: 0,
                            z: 1
                        },
                        stl: {
                            filename: "assets/stls/stapler/zAxis.stl"
                        }
                    },
                    yAxis: {
                        id: "yAxis",
                        name: "Frame",
                        children: [
                            "xAxis"
                        ],
                        parent: "frame",
                        translation: {
                            x: 0,
                            y: 18.194488188976376,
                            z: 0
                        },
                        scale: 1,
                        rotation: {
                            x: 0,
                            y: 0,
                            z: 0
                        },
                        rotary: false,
                        motionVector: {
                            x: 0,
                            y: 1,
                            z: 0
                        },
                        stl: {
                            filename: "assets/stls/stapler/frame.stl"
                        }
                    },
                    substrate: {
                        id: "substrate",
                        name: "Substrate",
                        children: [
                            "frame"
                        ],
                        parent: "",
                        translation: {
                            x: 9,
                            y: 9.5,
                            z: 0
                        },
                        scale: 1,
                        rotation: {
                            x: 0,
                            y: 0,
                            z: 0
                        },
                        rotary: true,
                        motionVector: {
                            x: 0,
                            y: 0,
                            z: 1
                        },
                        centerOfRotation: {
                            x: 9,
                            y: 9.5,
                            z: 0
                        },
                        stl: {
                            filename: "assets/stls/stapler/substrate.stl"
                        }
                    }
                },
                stock: {
                    stock1: {
                        id: "stock1",
                        name: "Stock 1",
                        children: [],
                        parent: "zAxis",
                        translation: {
                            x: 0,
                            y: 0,
                            z: 0
                        },
                        scale: 1,
                        rotation: {
                            x: 0,
                            y: 0,
                            z: 0
                        },
                        motionVector: {
                            x: 0,
                            y: 0,
                            z: 0
                        },
                        description: {
                            materialName: "fiberGlass",
                            length: 4
                        }
                    },
                    stock2: {
                        id: "stock2",
                        name: "Stock 2",
                        children: [],
                        parent: "zAxis",
                        translation: {
                            x: 26,
                            y: 0.236,
                            z: 0
                        },
                        scale: 1,
                        rotation: {
                            x: 0,
                            y: 0,
                            z: 0
                        },
                        motionVector: {
                            x: 0,
                            y: 0,
                            z: 0
                        },
                        description: {
                            materialName: "brass",
                            length: 4
                        }
                    }
                },
                tree: {
                    substrate: 0,
                    frame: 1,
                    yAxis: 2,
                    xAxis: 3,
                    zAxis: 4,
                    stock1: 5,
                    stock2: 5
                },
                lattice: {
                    scale: 1.27,
                    units: "mm"
                },
                defaults: {
                    camStrategy: "raster",
                    placementOrder: "XYZ",
                    camProcess: "gcode",
                    rapidHeight: 20,
                    rapidHeightRelative: true,
                    safeHeight: 4,
                    originPosition: {
                        x: -15,
                        y: -4,
                        z: 0
                    },
                    rapidSpeeds: {
                        xy: 250,
                        z: 250
                    },
                    feedRate: {
                        xy: 100,
                        z: 100
                    }
                },
                customPost: {
                    customFunctionsContext: {
                        zClearHeight: 8,
                        zPreload: 0.2,
                        stockWait: 0.75,
                        blOvershoot: 1,
                        place: 1
                    },
                    customHeader: "function (exporter, settings, context, self){\n    var data = \"\";\n    data += exporter.setUnits(settings.units);\n    data += self.customHome(exporter, settings, context);\n    return data;\n}",
                    customFooter: "function (exporter, settings, context, self){\n    var data = \"\";\n    data += self.customHome(exporter, settings, context);\n    return data;\n}",
                    customHome: "function (exporter, settings, context, self){\n    var data = \"\";\n    data += exporter.goHome(settings);\n    return data;\n}",
                    customPickUpStock: "function (exporter, settings, context, self){//not relevant for your assembler\n    var data = \"\";\n    return data;\n}",
                    customChangeZLayer: "function (currentIndex, lastIndex, exporter, settings, context, self){\n    var data = \"\";\n    if (lastIndex === null || (currentIndex.z-lastIndex.z)%2 != 0){\n        data += exporter.addLine(\"G0\", [\"A\" + ((currentIndex.z+1)%2*0.3125).toFixed(4)], \"new layer\");\n        data += \"\\n\";\n    }\n    return data;\n}",
                    customMoveXY: "function (position, lastPosition, index, exporter, settings, context, self){//already offset for dual heads\n    var data = \"\";\n\n    var overshoot = false;\n    var overshootPosition = position.clone();\n\n    //always approach from +x +y direction\n    if (lastPosition.x < position.x){\n        overshoot = true;\n        overshootPosition.x += context.blOvershoot;\n    }\n\n    if (lastPosition.y < position.y){\n        overshoot = true;\n        overshootPosition.y += context.blOvershoot;\n    }\n\n    if (overshoot){\n      data += exporter.rapidXY(overshootPosition, settings);\n    }\n    data += exporter.rapidXY(position, settings);\n\n    return data;\n}",
                    customPlacePart: "function (position, index, material, exporter, settings, context, self){//already offset for dual heads\n    var data = \"\";\n    data += exporter.rapidZ(position.z + settings.safeHeight, settings);\n    data += exporter.moveZ(position.z - context.zPreload, settings);\n\n  \tif (context.place == 1) {\n    \tif (material == \"brass\") data += exporter.addLine(\"M3\");\n    \telse if (material == \"fiberGlass\") data += exporter.addLine(\"M4\");\n\n    \tdata += exporter.addLine(\"G4\", [\"P\" + context.stockWait]);\n    \tdata += exporter.addLine(\"M5\");\n    }\n    data += exporter.addComment(JSON.stringify(index));//leave this, tells sim to show cell\n\n    data += exporter.moveZ(position.z - context.zPreload, settings);//need this line?\n\n    data += exporter.moveZ(position.z + settings.safeHeight, settings);\n    data += exporter.rapidZ(position.z + context.zClearHeight, settings);\n    return data;\n}",
                    customCalcPositionOffsets: "function (index, position, material, settings, context, self){\n    //this feeds into moveXY and placePart functions\n\n    position.sub(settings.originPosition);\n\n    if (index.z%2 == 0){\n        //offset for rotation\n        var offset = self.components.substrate.centerOfRotation.clone().multiplyScalar(settings.scale);//offset in lattice pitch\n        var dist = position.clone().sub(offset);\n        var temp = offset.add(new THREE.Vector3(-dist.y, dist.x-.385, position.z));\n    \ttemp.x -= 19.685;\n      \ttemp.y -= 0.25;\n      \tposition.x = temp.x*1.00426509 + temp.y*0.00845728 + 19.685;\n      \tposition.y = -0.022965*temp.x + 0.99985418*temp.y + 0.25;\n    } else {\n        //position.y -= 0.25;\n        //position.x -= settings.scale;\n      \ttemp = position;\n      \tposition.x = temp.x*0.99912511 + temp.y*0.01588617;\n      \tposition.y = -0.01224847*temp.x + 1.00483492*temp.y;\n    }\n\n    var stock = _.find(self.stock, function(thisStock){\n        return thisStock.getMaterial() == material\n    });\n    if (stock === undefined) {\n        console.warn(\"no stock defined of type \" + material + \" for this assembler\");\n        return null;\n    }\n\n\n    position.sub(stock.getPosition().multiplyScalar(settings.scale));\n\n    return position;\n}"
                }
            },
            mojo:{
                name: "Mojo",
                shouldPickUpStock: false,
                relative: true,
                camProcesses: ["gcode"],
                numMaterials: -1,
                translation: {x:8.48528,y:8.48528,z:8.48528},
                rotation: {x:0,y:0,z:0},//Math.PI/2
                scale: 0.083333,
                components: {
                    frame:  {
                        name: "Y Axis",
                        rotary: false,
                        //minBound
                        //maxBound
                        parent: null,
                        motionVector: {x:0, y:1, z:0},
                        stl: {
                            filename: "assets/stls/mojo/mojo.stl"
                        }
                    }
                },
                stock: {},
                defaults:{},
                customPost: {}
            }
        },

        machineTypesForLattice:{
            octa:{
                face: ["handOfGod"],
                edgeRot: ["shopbot", "oneBitBot", "handOfGod"],
                vertex: ["mojo"]
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

        allJointTypes: {
            revolute: "Revolute",
            continuous: "Continuous",
            prismatic: "Prismatic",
            fixed: "Fixed",
            floating: "Floating",
            planar: "Planar"
        },

        allAssemblyStrategies: {
            raster: "Raster"
        },

        allCamProcesses: {
            shopbot: "Shopbot (sbp)",
            gcode: "G-Code",
            tinyG: "TinyG (G-Code)"
        }

    }
});