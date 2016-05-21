//all property lists for the app, these are "static" variables


define(['three'], function(THREE){

    return {

        allMenus: {
            navDesign:{
                name: "Design",
                tabs:{
                    lattice:"Lattice",
                    sketch:"Planes",
                    select:"Select",
                    material:"Materials",
//                    import:"Import",
                    part:"Part"
//                    view: "View"
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
            emNavSim:{
                name: "Electronic Simulation",
                parent: "navSim",
                tabs:{
                    emSetup: "Globals",
                    emElectronics: "Electronics",
                    emBoundaryCond: "Boundaries",
                    emRun: "Run"
                }
            },
            emNavSignal:{
                name: "Composite",
                parentNav: "navSim",
                parent: "emNavSim",
                tabs:{
                    signal:"Signal Editor"
                }
            },
            navOptimize:{
                name: "Optimize",
                tabs:{
                    optimization:"Optimize"
                }
            }
        },

        urls: {
            electronics: {
                cellType: "cube",
                connectionType: "face",
                applicationType: "default",
                partType: null
            }
        },

        allLattices:{
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
                    }
                }
            }
        },

        allCellModes:{//cell, part
            cell: "Voxel Mode  &nbsp;&nbsp;(V)",
            part: "Part Mode  &nbsp;&nbsp;(P)",
            hide: "Hide Cells  &nbsp;&nbsp;(O)"
        },

        allScripts: {
            loadFile: "Load From File..."
        },

        allUnitTypes: {
            mm: {
                name: "mm",
                multiplier: 0.001
            },
            um: {
                name: "Micron",
                multiplier: 0.000001
            }
        },

        allBaseplaneTypes: {
            xy: "XY Plane",
            yz: "YZ Plane",
            xz: "XZ Plane"

        }

    }
});