//all property lists for the app, these are "static" variables


define(['three'], function(THREE){

    return {

        allMenuTabs: {
            navDesign:{
                lattice:"Lattice",
                //sketch:"Sketch",
                material:"Material",
                import:"Import",
                part:"Part",
                script:"Script"
            },
            electronicNavSim:{
                eSetup:"Connectivity",
                eStatic:"Statics",
                eDynamic:"Dynamics"
            },
            mechanicalNavSim:{
                mSetup:"Setup",
                mStatic:"Statics",
                mDynamic:"Dynamics"
            },
            navOptimize:{
                optimize:"Optimize"
            },
            navAssemble:{
                assembler:"Assembler",
                cam: "Process",
                animate:"Preview"
            },
            navComm:{
                setupComm: "Setup",
                send: "Send"
            },
            //maybe do something different here?
            navComposite:{
                composite:"Composite Editor"
            },
            navMaterial:{
                materialEditor: "Material Editor"
            }
        },

        allCellTypes: {
            octa:"Octahedron",
            tetra: "Tetrahedron",
            cube:"Cube",
            truncatedCube:"Cuboctahedron",
            kelvin:"Kelvin"
        },
        allConnectionTypes: {
            octa: {face:"Face",  edgeRot:"Edge", vertex:"Vertex"},// freeformFace:"Freeform Face"  edge:"Edge",   (Rotated)
            tetra: {stacked: "Stacked"},//vertex: "Vertex"
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
                    kennyTeq: "Kenny Teq",
                    kennyTeqHighRes: "Kenny Teq (High Res)",
                    samTeq: "Square"
//                   xShape:"X"
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
                face: null//{
//                    square:"Square",
//                    xShape:"X"
//                }
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
            tetra: {
                stacked: 'mechanical',
                vertex: 'mechanical'
            },
            cube: {
                face: 'electronic',
                gik: 'electronic'
            },
            truncatedCube: {face: 'mechanical'},
            kelvin: {face: 'mechanical'}
        },

        allMaterialClasses:{
            mechanical: "Structural",
            electronic: "Electronic",
//            space: "Space Structures"
        },

        allMaterials:{
            electronic:{
                brass:{
                    name: "Brass",
                    color: "#b5a642",
                    altColor: "#857B64",
                    properties:{
                        conductive: true
                    }
                },
                fiberGlass: {
                    name: "Fiberglass",
                    color: "#fef1b5",
//                    opacity: "0.9",
                    altColor: "#ecf0f1",
                    properties:{}
                },
                carbon: {
                    name: "Carbon Composite",
                    color: "#222",
                    altColor: "#000",
                    properties:{}
                },
                nType: {
                    name: "Silicon N-Type",
                    color: "#bcc6cc",
                    altColor: "#8391AC",
                    properties:{}
                },
                nTypePlus: {
                    name: "Silicon Heavily Doped N-Type (N+)",
                    color: "#c6ccbc",
                    altColor: "#9CC9CB",
                    properties:{}
                },
                pType: {
                    name: "Silicon P-Type",
                    color: "#ccbcc6",
                    altColor: "#F5447B",
                    properties:{}
                },
                pTypePlus: {
                    name: "Silicon Heavily Doped P-Type (P+)",
                    color: "#ccc2bc",
                    altColor: "#F99987",
                    properties:{}
                }
                //857B64
                //FDE2D9
                //D77948
            },
            mechanical:{
                rigid:{
                    name: "Rigid",
                    color: "#aaa",
                    altColor: "#666",
                    properties:{}
                },
                flexure: {
                    name: "Flexure",
                    color: "#aaa",
                    altColor: "#8391AC",
                    properties:{}
                }
            },
            space:{
                fiberGlass: {
                    name: "Glass Filled Nylon",
                    color: "#fef1b5",
//                    opacity: "0.9",
                    altColor: "#ecf0f1",
                    properties:{}
                },
                carbon: {
                    name: "Carbon Composite",
                    color: "#222",
                    altColor: "#000",
                    properties:{}
                },
                nType: {
                    name: "Aluminum",
                    color: "#bcc6cc",
                    altColor: "#8391AC",
                    properties:{}
                },
                brass:{
                    name: "Brass",
                    color: "#b5a642",
                    altColor: "#857B64",
                    properties:{
                        conductive: true
                    }
                },
                nTypePlus: {
                    name: "Power Storage",
                    color: "#c6ccbc",
                    altColor: "#9CC9CB",
                    properties:{}
                },
                pType: {
                    name: "Logic",
                    color: "#ccbcc6",
                    altColor: "#F5447B",
                    properties:{}
                },
                pTypePlus: {
                    name: "Solar Panel",
                    color: "#ccc2bc",
                    altColor: "#F99987",
                    properties:{}
                }
                //857B64
                //FDE2D9
                //D77948
            }
        },

        allMachineTypes:{
            octa:{
                face: {handOfGod: "Hand of God"},
                edgeRot: {
                    crab: "Crab",
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
                    stapler: "Dual Head Stapler"
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
            staplerDual: {gcode: "G-Code"},
            crab: {gcode: "G-Code"}
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
            crab: null
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