/**
 * Created by aghassaei on 9/24/15.
 */


define([], function(){

    return {
        allMaterialClasses:{
            element:{
                elementMech: "Elemental Mechanical",
                elementElectronic: "Elemental Electronic"
            },
            function:{
                em: "Functional Bricks"
            },
            module:{
                module: "Robotic Modules"
            },
            system:{
                system: "Systems"
            }
        },

        allMaterials:{
            em:{
                insulating: {
                    name: "Structural",
                    color: "#8a2be2",
                    altColor: "#8a2be2",
                    properties:{
                        conductive: false,
                        density: 3500,//kg/m^3
                        elasMod: 17.2,
                        k: 500
                    }
                },
                bending1DOF: {
                    name: "1 DOF Hinge",
                    color: "#cda4f3",
                    altColor: "#cda4f3",
                    texture: "stripes",
                    mesh: "bending1dof",
                    properties:{
                        conductive: false,
                        density: 3500,//kg/m^3
                        elasMod: 0.01,
                        k: 30
                    }
                },
                bending2DOF: {
                    name: "2 DOF Hinge",
                    color: "#cda4f3",
                    altColor: "#cda4f3",
                    texture: "stripes",
                    mesh: "bending2dof",
                    properties:{
                        conductive: false,
                        density: 3500,//kg/m^3
                        elasMod: 0.01,
                        k: 30
                    }
                },
                torsion1DOF: {
                    name: "Torsion Flexure",
                    color: "#cda4f3",
                    altColor: "#cda4f3",
                    texture: "stripes",
                    mesh: "torsion1dof",
                    properties:{
                        conductive: false,
                        density: 3500,//kg/m^3
                        elasMod: 0.01,
                        k: 30
                    }
                },
                shear1DOF: {
                    name: "Shear Flexure",
                    color: "#cda4f3",
                    altColor: "#cda4f3",
                    texture: "stripes",
                    properties:{
                        conductive: false,
                        density: 3500,//kg/m^3
                        elasMod: 0.01,
                        k: 30
                    }
                },
                conductive:{
                    name: "Electronic Routing (Straight)",
                    color: "#b5a642",
                    altColor: "#857B64",
                    mesh: "wireStraight",
                    properties:{
                        conductive: true,
                        density: 8500,//kg/m^3
                        elasMod: 1000,//Gpascals (kg/(s^2*m)/10000000000)
                        k: 500
                    }
                },
                conductiveBend:{
                    name: "Electronic Routing (Bend)",
                    color: "#b5a642",
                    altColor: "#857B64",
                    mesh: "wireBent",
                    properties:{
                        conductive: true,
                        density: 8500,//kg/m^3
                        elasMod: 1000,//Gpascals (kg/(s^2*m)/10000000000)
                        k: 500
                    }
                },
                flexureCond: {
                    name: "Flex Electronic Routing (Straight)",
                    color: "#b4ac9c",
                    altColor: "#b4ac9c",
                    texture: "stripes",
                    mesh: "wireStraight",
                    properties:{
                        conductive: true,
                        density: 3500,//kg/m^3
                        elasMod: 0.01,
                        k: 30
                    }
                },
                flexureCondBend: {
                    name: "Flex Electronic Routing (Bend)",
                    color: "#b4ac9c",
                    altColor: "#b4ac9c",
                    texture: "stripes",
                    mesh: "wireBent",
                    properties:{
                        conductive: true,
                        density: 3500,//kg/m^3
                        elasMod: 0.01,
                        k: 30
                    }
                },
                actuatorLinear1DOF: {
                    name: "Linear Actuator",
                    color: "#FFCC00",
                    altColor: "#FFCC00",
                    texture: "cubeTexture",
                    properties:{
                        conductive: false,
                        density: 6500,//kg/m^3
                        elasMod: 50,
                        k: 200
                    }
                },
                actuatorBending1DOF: {
                    name: "Bending Actuator",
                    color: "#FFCC00",
                    altColor: "#FFCC00",
                    mesh: "bending1dof",
                    properties:{
                        conductive: false,
                        density: 6500,//kg/m^3
                        elasMod: 50,
                        k: 200
                    }
                },
                actuatorTorsion1DOF: {
                    name: "Torsional Actuator",
                    color: "#FFCC00",
                    altColor: "#FFCC00",
                    mesh: "torsion1dof",
                    properties:{
                        conductive: false,
                        density: 6500,//kg/m^3
                        elasMod: 50,
                        k: 200
                    }
                },
                actuatorShear: {
                    name: "Shear Actuator",
                    color: "#FFCC00",
                    altColor: "#FFCC00",
                    properties:{
                        conductive: false,
                        density: 6500,//kg/m^3
                        elasMod: 50,
                        k: 200
                    }
                },
                signal: {
                    name: "Signal Generator",
                    color: "#0EE3B8",
                    altColor: "#0EE3B8",
                    mesh: "siliconModule",
                    properties:{
                        conductive: true,
                        density: 6500,//kg/m^3
                        elasMod: 50,
                        k: 200
                    }
                },
                script: {
                    name: "Programmable Logic",
                    color: "#0EE3B8",
                    altColor: "#0EE3B8",
                    mesh: "siliconModule",
                    properties:{
                        conductive: true,
                        density: 6500,//kg/m^3
                        elasMod: 50,
                        k: 200
                    }
                }
            },
            elementMech: {
                brass: {
                    name: "Brass",
                    color: "#b5a642",
                    altColor: "#857B64",
                    properties: {
                        conductive: true,
                        density: 8500,//kg/m^3
                        elasMod: 1000,//Gpascals (kg/(s^2*m)/10000000000)
                        k: 500
                    }
                },
                alum: {
                    name: "Aluminum",
                    color: "#9CC9CB",
                    altColor: "#9CC9CB",
                    properties: {
                        conductive: true,
                        density: 8500,//kg/m^3
                        elasMod: 1000,//Gpascals (kg/(s^2*m)/10000000000)
                        k: 1000
                    }
                },
                fiberglass: {
                    name: "Fiberglass",
                    color: "#8a2be2",
                    altColor: "#8a2be2",
                    properties: {
                        conductive: false,
                        density: 3500,//kg/m^3
                        elasMod: 17.2,
                        k: 500
                    }
                },
                rubber: {
                    name: "Rubber",
                    color: "#cda4f3",
                    altColor: "#cda4f3",
                    texture: "stripes",
                    properties: {
                        conductive: false,
                        density: 3500,//kg/m^3
                        elasMod: 0.01,
                        k: 30
                    }
                },
                //heatResist: {
                //    name: "Kapton",
                //    color: "#9CC9CB",
                //    altColor: "#9CC9CB",
                //    properties:{
                //        conductive: false,
                //        density: 500,//kg/m^3
                //        elasMod: 17.2
                //    }
                //},
                piezo: {
                    name: "Piezo",
                    color: "#FFCC00",
                    altColor: "#FFCC00",
                    properties: {
                        conductive: false,
                        density: 6500,//kg/m^3
                        elasMod: 50,
                        k: 200
                    }
                }
            },
            elementElectronic:{
                brass: {
                    name: "Brass",
                    color: "#b5a642",
                    altColor: "#857B64",
                    properties: {
                        conductive: true,
                        density: 8500,//kg/m^3
                        elasMod: 1000,//Gpascals (kg/(s^2*m)/10000000000)
                        k: 500
                    }
                },
                alum: {
                    name: "Aluminum",
                    color: "#9CC9CB",
                    altColor: "#9CC9CB",
                    properties: {
                        conductive: true,
                        density: 8500,//kg/m^3
                        elasMod: 1000,//Gpascals (kg/(s^2*m)/10000000000)
                        k: 1000
                    }
                },
                fiberglass: {
                    name: "Fiberglass",
                    color: "#8a2be2",
                    altColor: "#8a2be2",
                    properties: {
                        conductive: false,
                        density: 3500,//kg/m^3
                        elasMod: 17.2,
                        k: 500
                    }
                },
                carbon: {
                    name: "Resistive",
                    color: "#222",
                    altColor: "#000",
                    properties:{
                        conductive: false,
                        density: 500,//kg/m^3
                        elasMod: 181,
                        k: 1000
                    }
                },
                nmos: {
                    name: "NMOS",
                    color: "#F99987",
                    altColor: "#F99987",
                    properties:{
                        conductive: false,
                        density: 6500,//kg/m^3
                        elasMod: 50,
                        k: 1000
                    }
                },
                pmos: {
                    name: "PMOS",
                    color: "#0EE3B8",
                    altColor: "#0EE3B8",
                    properties:{
                        conductive: false,
                        density: 6500,//kg/m^3
                        elasMod: 50,
                        k: 1000
                    }
                },
                //diode: {
                //    name: "Diode",
                //    color: "#dfccaf",
                //    altColor: "#dfccaf",
                //    properties:{
                //        conductive: false,
                //        density: 6500,//kg/m^3
                //        elasMod: 50,
                //        k: 1000
                //    }
                //},
                //zener: {
                //    name: "Zener Diode",
                //    color: "#bf390b",
                //    altColor: "#bf390b",
                //    properties:{
                //        conductive: false,
                //        density: 6500,//kg/m^3
                //        elasMod: 50,
                //        k: 1000
                //    }
                //}
            },
            module: {
                routing: {
                    name: "Routing",
                    color: "#dfccaf",
                    altColor: "#857B64",
                    properties: {
                        conductive: false,
                        density: 6500,//kg/m^3
                        elasMod: 50,
                        k: 1000
                    }
                },
                clamp: {
                    name: "Clamp",
                    color: "#dfccaf",
                    altColor: "#dfccaf",
                    properties: {
                        conductive: false,
                        density: 6500,//kg/m^3
                        elasMod: 50,
                        k: 1000
                    }
                },
                actuator: {
                    name: "Linear Actuator",
                    color: "#dfccaf",
                    altColor: "#dfccaf",
                    properties: {
                        conductive: false,
                        density: 6500,//kg/m^3
                        elasMod: 50,
                        k: 1000
                    }
                },
                gripper: {
                    name: "Gripper",
                    color: "#dfccaf",
                    altColor: "#dfccaf",
                    properties: {
                        conductive: false,
                        density: 6500,//kg/m^3
                        elasMod: 50,
                        k: 1000
                    }
                },
                readHead: {
                    name: "Read Head",
                    color: "#dfccaf",
                    altColor: "#dfccaf",
                    properties: {
                        conductive: false,
                        density: 6500,//kg/m^3
                        elasMod: 50,
                        k: 1000
                    }
                },
                writeHead: {
                    name: "Write Head",
                    color: "#dfccaf",
                    altColor: "#dfccaf",
                    properties: {
                        conductive: false,
                        density: 6500,//kg/m^3
                        elasMod: 50,
                        k: 1000
                    }
                },
                script: {
                    name: "Micro Controller",
                    color: "#dfccaf",
                    altColor: "#dfccaf",
                    properties: {
                        conductive: false,
                        density: 6500,//kg/m^3
                        elasMod: 50,
                        k: 1000
                    }
                }
            },
            system: {
                structural: {
                    name: "Structural",
                    color: "#bf390b",
                    altColor: "#bf390b",
                    properties:{
                        conductive: false,
                        density: 6500,//kg/m^3
                        elasMod: 50,
                        k: 1000
                    }
                },
                mobile: {
                    name: "Mobile",
                    color: "#bf390b",
                    altColor: "#bf390b",
                    properties:{
                        conductive: false,
                        density: 6500,//kg/m^3
                        elasMod: 50,
                        k: 1000
                    }
                },
                register: {
                    name: "Register",
                    color: "#bf390b",
                    altColor: "#bf390b",
                    properties:{
                        conductive: false,
                        density: 6500,//kg/m^3
                        elasMod: 50,
                        k: 1000
                    }
                }
            }
        }
    }

});