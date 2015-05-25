//all property lists for the app, these are "static" variables

function AppPList(){
    return {


    allMenuTabs: {
        navDesign:{
            lattice:"Lattice",
            import:"Import",
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
        kelvin:"Truncated Octahedron"
    },
    allConnectionTypes: {
        octa: {face:"Face", freeformFace:"Freeform Face", edgeRot:"Edge", vertex:"Vertex"},//edge:"Edge",
        tetra: {vertex: "Vertex"},
        cube: {face:"Face", gik: "GIK"},
        truncatedCube: {face:"Face"},
        kelvin: {face: "Face"}
    },
    allPartTypes:{
        octa:{
            face: {
                triangle:"Triangle"
                //beam:"Beam",
                //truss:"Truss"
            },
            freeformFace: {
                trox:"Troxes"
                //beam:"Beam"
            },
            edge: null,
            edgeRot: {
                vox: "Snap Voxel (high res)",
                voxLowPoly: "Snap Voxel (low res)"
                //beam:"Beam"
            },
            vertex: null//{
                //beam:"Beam",
//                    square:"Square",
//                    xShape:"X"
//                }
        },
        tetra: {vertex: null},
        cube: {face: null,
            gik: {
                lego: "Micro LEGO (high res)",
                legoLowPoly: "Micro LEGO (low res)"
            }
        },
        truncatedCube: {face: null},
        kelvin: {face: null}
    },

    allMaterialTypes:{
        octa:{
            face: null,
            freeformFace: null,
            edge: null,
            edgeRot: null,
            vertex: null//{
                //beam:"Beam",
//                    square:"Square",
//                    xShape:"X"
//                }
        },
        tetra: {vertex: null},
        cube: {face: null,
            gik: {
                brass:{
                    name: "Brass",
                    color: "#b5a642"
                },
                fiberGlass: {
                    name: "Fiberglass",
                    color: "#fef1b5"
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