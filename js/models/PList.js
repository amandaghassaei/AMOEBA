//all property lists for the app, these are "static" variables


define(['three'], function(THREE){

    return {

        allMenuTabs: {
            navDesign:{
                lattice:"Lattice",
//            import:"Import",
                    //sketch:"Sketch",
                    part:"Part",
                    script:"Script"
            },
            navSim:{
                physics:"Physics",
                part:"Part",
                material:"Material",
                optimize:"Optimize"
            },
            navAssemble:{
                assembler:"Assembler",
                cam: "Process",
                animate:"Preview",
                send: "Send"
            }
        },

        allCellTypes: {
            octa:"Octahedron",
            tetra: "Tetrahedron (Coming Soon)",
            cube:"Cube",
            truncatedCube:"Cuboctahedron",
            kelvin:"Kelvin"
        },
        allConnectionTypes: {
            octa: {face:"Face", edgeRot:"Edge", vertex:"Vertex"},//edge:"Edge", freeformFace:"Freeform Face"
            tetra: {vertex: "Vertex"},
            cube: {face:"Face", gik: "GIK"},
            truncatedCube: {face:"Face"},
            kelvin: {face: "Face"}
        },
        allPartTypes:{
            octa:{
                face: {
                    triangle:"Triangle"
                },
                edge: null,
                    edgeRot: {
                    vox: "Snap Voxel (high res)",
                        voxLowPoly: "Snap Voxel (low res)"
                },
                vertex: {
                    square:"Square",
                        xShape:"X"
                }
            },
            tetra: {vertex: null},
            cube: {face: null,
                gik: {
                lego: "Micro LEGO (high res)",
                    legoLowPoly: "Micro LEGO (low res)"
            }
            },
            truncatedCube: {
                face: {
                    square:"Square",
                        xShape:"X"
                }
            },
            kelvin: {face: null}
        },

        allMaterialTypes:{
            octa:{
                face: 'mechanical',
                edge: 'mechanical',
                edgeRot: 'mechanical',
                vertex: 'mechanical'
            },
            tetra: {vertex: 'mechanical'},
            cube: {
                face: 'mechanical',
                gik: 'electronic'
            },
            truncatedCube: {face: 'mechanical'},
            kelvin: {face: 'mechanical'}
        },

        allMaterials:{
            electronic:{
                brass:{
                    name: "Brass",
                        color: "#b5a642",
                        altColor: "#857B64"
                },
                fiberGlass: {
                    name: "Fiberglass",
                        color: "#fef1b5",
//                    opacity: "0.9",
                        altColor: "#ecf0f1"
                },
                carbon: {
                    name: "Carbon Composite",
                        color: "#222",
                        altColor: "#000"
                },
                nType: {
                    name: "Silicon N-Type",
                        color: "#bcc6cc",
                        altColor: "#9CC9CB"
                },
                nTypePlus: {
                    name: "Silicon Heavily Doped N-Type (N+)",
                        color: "#c6ccbc",
                        altColor: "#8391AC"
                },
                pType: {
                    name: "Silicon P-Type",
                        color: "#ccbcc6",
                        altColor: "#F5447B"
                },
                pTypePlus: {
                    name: "Silicon Heavily Doped P-Type (P+)",
                        color: "#ccc2bc",
                        altColor: "#F99987"
                }
                //857B64
                //FDE2D9
                //D77948
            },
            mechanical:{
                rigid:{
                    name: "Rigid",
                        color: "#b5a642",
                        altColor: "#857B64"
                },
                flexure: {
                    name: "Flexure",
                        color: "#fef1b5",
                        altColor: "#ecf0f1"
                }
            }
        },

        allMachineTypes:{
            octa:{
                face: {handOfGod: "Hand of God"},
                edgeRot: {
                    shopbot: "Shopbot",
                        oneBitBot: "One Bit Bot",
                        oneBitBotLegs: "One Bit Bot with Legs",
                        handOfGod: "Hand of God"
                },
                vertex: {handOfGod: "Hand of God"}
            },
            tetra: {
                vertex:{handOfGod: "Hand of God"}
            },
            cube:{
                face:{handOfGod: "Hand of God"},
                gik: {
                    stapler: "Stapler",
                        staplerDual: "Dual Head Stapler"
//                handOfGod: "Hand of God"
                }
            },
            truncatedCube:{
                face:{handOfGod: "Hand of God"}
            },
            kelvin:{
                face:{handOfGod: "Hand of God"}
            }
        },
        allAssemblyStrategies: {
            raster: "Raster"
        },
        allCamProcesses: {
            shopbot:{
                shopbot: "Shopbot (sbp)",
                    gcode: "G-Code"
            },
            handOfGod:{gcode: "G-Code"},
            oneBitBot:{
                gcode: "G-Code",
                    tinyG: "TinyG"
            },
            stapler: {gcode: "G-Code"},
            staplerDual: {gcode: "G-Code"}
        },

        allMachineDefaults: {
            shopbot:null,
                handOfGod:null,
                oneBitBot:null,
                stapler: {
                camStrategy: "raster",
                    placementOrder: "XYZ",//used for raster strategy entry
                    camProcess: "gcode",
                    rapidHeight:3,
                    rapidHeightRelative: true,
                    safeHeight: 0.05,
                    originPosition: new THREE.Vector3(0,0,0),
                    rapidSpeeds:{xy: 3, z: 2},
                feedRate:{xy: 0.1, z: 0.1}
            },
            staplerDual: null
        },

        allScripts: {
            loadFile: "Load From File..."
        },

        allUnitTypes: {
            inches: "Inches",
                mm: "mm"
            //um: "micron"
        }

    }
});