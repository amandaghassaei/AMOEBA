//all property lists for the app, these are "static" variables


define(['three'], function(THREE){

    return {

        allMenuTabs: {
            navDesign:{
                lattice:"Lattice",
                //sketch:"Sketch",
                material:"Materials",
                import:"Import",
                part:"Part"
//                script:"Script"
            },
            electronicNavSim:{
                eSetup:"Connectivity",
//                materialProperties: "Materials",
                eStatic:"Statics",
                eDynamic:"Dynamics"
            },
            mechanicalNavSim:{
                mSetup:"Setup",
//                materialProperties: "Materials",
                mStatic:"Statics",
                mDynamic:"Dynamics"
            },
            navOptimize:{
                optimize:"Optimize"
            },
            navAssemble:{
                assembler:"Assembler",
                assemblerSetup: "Setup",
                cam: "Process",
//                editCamOutput: "Edit",
                animate:"Preview"
            },
            navMachineComponent:{
                editComponent: "Edit Component"
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
            kelvin:"Kelvin",
//            hex: "Hexagonal"
        },
        allConnectionTypes: {
            octa: {face:"Face",  edgeRot:"Edge", vertex:"Vertex"},// freeformFace:"Freeform Face"  edge:"Edge",   (Rotated)
            tetra: {stacked: "Stacked"},//vertex: "Vertex"
            cube: {face:"Face", gik: "GIK"},
            truncatedCube: {face:"Face"},
            kelvin: {face: "Face"},
            hex: {face: "Face"}
        },
        allLatticeSubclasses:{
            octa: {face:"octaFaceLattice",  edgeRot:"octaRotEdgeLattice", vertex:"octaVertexLattice"},// freeformFace:"Freeform Face"  edge:"octaEdgeLattice",   (Rotated)
            tetra: {stacked: "tetraStackedLattice"},//vertex: "tetraVertexLattice"
            cube: {face:"cubeLattice", gik: "gikLattice"},
            truncatedCube: {face:"truncatedCubeLattice"},
            kelvin: {face: "kelvinLattice"},
            hex: {face: "hexLattice"}
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
            kelvin: {face: null},
            hex: {face: null}
        },

        allCellModes:{//supercell, cell, part, node, beam
            supercell: "Hierarchical Mode",
            cell: "Voxel Mode",
            part: "Part Mode",
            hide: "Hide Cells"
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
            kelvin: {face: 'mechanical'},
            hex: {face: 'mechanical'}
        },

        allMaterialClasses:{
            mechanical: "Structural",
            electronic: "Electronic"
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
            }
        },

        allScripts: {
            loadFile: "Load From File..."
        }

    }
});