//all property lists for the app, these are "static" variables


define(['three'], function(THREE){

    return {

        allMenus: {
            navDesign:{
                name: "Design",
                tabs:{
                    lattice:"Lattice",
                    //sketch:"Sketch",
                    material:"Materials",
                    import:"Import",
                    part:"Part"
                    //script:"Script"
                }
            },
            navMaterial:{
                name: "Materials",
                parent: "navDesign",
                tabs:{
                    materialEditor: "Material Editor"
                }
            },
            navComposite:{
                name: "Composite",
                parent: "navDesign",
                tabs:{
                    composite:"Composite Editor"
                }
            },
            navSim:{
                name: "Simulate",
                tabs:{
                }
            },
            electronicNavSim:{
                name: "Electronic Simulation",
                parent: "navSim",
                tabs:{
                    eSetup:"Connectivity",
    //                materialProperties: "Materials",
                    eStatic:"Statics",
                    eDynamic:"Dynamics"
                }
            },
            mechanicalNavSim:{
                name: "Mechanical Simulation",
                parent: "navSim",
                tabs:{
                    mSetup:"Setup",
    //                materialProperties: "Materials",
                    mStatic:"Statics",
                    mDynamic:"Dynamics"
                }
            },
            navOptimize:{
                name: "Optimize",
                tabs:{
                    optimize:"Optimize"
                }
            },
            navAssemble:{
                name: "Assemble",
                tabs:{
                    assembler:"Assembler",
                    assemblerSetup: "Setup",
                    cam: "Globals",
    //                editCamOutput: "Edit",
                    animate:"Preview"
                },
            },
            navMachineComponent:{
                name: "Component Editor",
                parent: "navAssemble",
                tabs:{
                    editComponent: "Edit Component"
                }
            },
            navComm:{
                name: "Comm",
                tabs:{
                    setupComm: "Setup",
                    send: "Send"
                }
            }
        },

        allLattices:{
            octa: {
                name: "Octahedron",
                connection: {
                    face: {
                        name: "Face",
                        subclass: "octaFaceLattice",
                        types: {
                            octaTruss: {
                                name: "Matt's Truss",
                                parts: {
                                    triangle:"Triangle"
                                },
                                aspectRatio: new THREE.Vector3(1,1,1),
                                materialClasses: ['mechanical']
                            },
                            default: {
                                name: "Default",
                                parts: null,
                                aspectRatio: new THREE.Vector3(1,1,1)
                            }
                        }
                    },
//                    edge: {
//                        name: "Edge (Rotated)",
//                        subclass: "octaEdgeLattice"
//                    },
                    edgeRot: {
                        name: "Edge",
                        subclass: "octaRotEdgeLattice",
                        types: {
                            snapVoxel: {
                                name: "Ben's Voxels",
                                parts: {
                                    vox: "Snap Voxel (high res)",
                                    voxLowPoly: "Snap Voxel (low res)"
                                },
                                aspectRatio: new THREE.Vector3(1,1,1),
                                materialClasses: ['mechanical']
                            },
                            default: {
                                name: "Default",
                                parts: null,
                                aspectRatio: new THREE.Vector3(1,1,1)
                            }
                        }
                    },
                    vertex: {
                        name: "Vertex",
                        subclass: "octaVertexLattice",
                        type: {
                            kennyVertex: {
                                name: "Kenny's Lattice",
                                parts: {
                                    kennyTeq: "Kenny Teq",
                                    kennyTeqHighRes: "Kenny Teq (High Res)",
                                    samTeq: "Square"
                //                   xShape:"X"
                                },
                                aspectRatio: new THREE.Vector3(1,1,1),
                                materialClasses: ['mechanical']
                            },
                            default: {
                                name: "Default",
                                parts: null,
                                aspectRatio: new THREE.Vector3(1,1,1)
                            }
                        }
                    }
                }
            },
            tetra: {
                name: "Tetrahedron",
                connection: {//vertex: "Vertex"
                    stacked: {
                        name: "Stacked",
                        subclass: "tetraStackedLattice",
                        type: {
                            default: {
                                name: "Default",
                                parts: null,
                                aspectRatio: new THREE.Vector3(1,1,1)
                            }
                        }
                    }
                }
            },
            cube: {
                name: "Cube",
                connection: {
                    face: {
                        name: "Face",
                        subclass: "cubeLattice",
                        type: {
                            default: {
                                name: "Default",
                                parts: null,
                                aspectRatio: new THREE.Vector3(1,1,1)
                            }
                        }
                    },
                    gik: {
                        name: "GIK",
                        subclass: "gikLattice",
                        type: {
                            willGik: {
                                name: "Will's Lattice",
                                parts: {
                                    lego: "Micro LEGO (high res)",
                                    legoLowPoly: "Micro LEGO (low res)"
                                },
                                aspectRatio: new THREE.Vector3(1,1,1.28),
                                materialClasses: ['electronic']
                            },
                            default: {
                                name: "Default",
                                parts: null,
                                aspectRatio: new THREE.Vector3(1,1,1)
                            }
                        }
                    }
                }
            },
            truncatedCube: {
                name: "Cuboctahedron",
                connection: {
                    face: {
                        name: "Face",
                        subclass: "truncatedCubeLattice",
                        type: {
                            default: {
                                name: "Default",
                                parts: null,
                                aspectRatio: new THREE.Vector3(1,1,1)
                            }
                        }
                    }
                }
            },
            kelvin: {
                name: "Kelvin",
                connection: {
                    face: {
                        name: "Face",
                        subclass: "kelvinLattice",
                        type: {
                            default: {
                                name: "Default",
                                parts: null,
                                aspectRatio: new THREE.Vector3(1,1,1)
                            }
                        }
                    }
                }
            },
            hex: {
                name: "Hexagonal",
                connection: {
                    face: {
                        name: "Face",
                        subclass: "hexLattice",
                        type: {
                            default: {
                                name: "Default",
                                parts: null,
                                aspectRatio: new THREE.Vector3(1,1,1)
                            }
                        }
                    },
                    faceRot: {
                        name: "Face (Rotated)",
                        subclass: "hexRotLattice",
                        type: {
                            default: {
                                name: "Default",
                                parts: null,
                                aspectRatio: new THREE.Vector3(1,1,1)
                            }
                        }
                    }
                }
            }
        },

        allCellModes:{//supercell, cell, part, node, beam
            supercell: "Hierarchical Mode",
            cell: "Voxel Mode",
            part: "Part Mode",
            hide: "Hide Cells"
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