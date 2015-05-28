//all property lists for the app, these are "static" variables

function AppPList(){
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
            freeformFace: {
                trox:"Troxes"
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
            face: null,
            freeformFace: null,
            edge: null,
            edgeRot: null,
            vertex: null
        },
        tetra: {vertex: null},
        cube: {face: null,
            gik: {
                brass:{
                    name: "Brass",
                    color: "#b5a642",
                    altColor: "#e67e22"
                },
                fiberGlass: {
                    name: "Fiberglass",
                    color: "#fef1b5",
                    altColor: "#ecf0f1"
                },
                carbonFiber: {
                    name: "Carbon Fiber",
                    color: "#222",
                    altColor: "#000"
                },
                silicon: {
                    name: "Silicon",
                    color: "#bcc6cc",
                    altColor: "#3498db"
                }
            }
        },
        truncatedCube: {face: null},
        kelvin: {face: null}
    },

    allMachineTypes:{
        octa:{
            face: {handOfGod: "Hand of God"},
            freeformFace: {handOfGod: "Hand of God"},
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
            gik: {handOfGod: "Hand of God"}
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
        }
    },

    allScripts: {
        loadFile: "Load From File..."
    },

    allUnitTypes: {
        inches: "Inches",
        mm: "mm",
        //um: "micron"
    }

}}