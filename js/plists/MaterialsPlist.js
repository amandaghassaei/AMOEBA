/**
 * Created by aghassaei on 9/24/15.
 */


define([], function(){

    return {
        allMaterialClasses:{
            em: "Electro-Mechanical"
        },

        allMaterials:{
            em:{
                brass:{
                    name: "Structural Conductibe",
                    color: "#b5a642",
                    altColor: "#857B64",
                    properties:{
                        conductive: true,
                        density: 8500,//kg/m^3
                        elasMod: 100,//Gpascals (kg/(s^2*m)/1000000000)
                        k: 100
                    }
                },
                alum:{
                    name: "Lightweight Structural Conductibe",
                    color: "#8391AC",
                    altColor: "#8391AC",
                    properties:{
                        conductive: true,
                        density: 8500,//kg/m^3
                        elasMod: 100,//Gpascals (kg/(s^2*m)/1000000000)
                        k: 100
                    }
                },
                fiberGlass: {
                    name: "Structural Insulating",
                    color: "#fef1b5",
                    altColor: "#ecf0f1",
                    properties:{
                        conductive: false,
                        density: 500,//kg/m^3
                        elasMod: 17.2,
                        k: 100
                    }
                },
//                heatResist: {
//                    name: "Structural Heat-Resistant",
//                    color: "#9CC9CB",
//                    altColor: "#9CC9CB",
//                    properties:{
//                        conductive: false,
//                        density: 500,//kg/m^3
//                        elasMod: 17.2
//                    }
//                },
                carbon: {
                    name: "Resistive",
                    color: "#222",
                    altColor: "#000",
                    properties:{
                        conductive: false,
                        density: 500,//kg/m^3
                        elasMod: 181,
                        k: 100
                    }
                },
                flexure: {
                    name: "Flexure Insulating",
                    color: "#8391AC",
                    altColor: "#8391AC",
                    properties:{
                        conductive: false,
                        density: 3500,//kg/m^3
                        elasMod: 0.01,
                        k: 10
                    }
                },
                flexureCond: {
                    name: "Flexure Conductive",
                    color: "#ecf0f1",
                    altColor: "#ecf0f1",
                    properties:{
                        conductive: false,
                        density: 3500,//kg/m^3
                        elasMod: 0.01,
                        k: 10
                    }
                },
                piezo: {
                    name: "Piezo",
                    color: "#F5447B",
                    altColor: "#F5447B",
                    properties:{
                        conductive: false,
                        density: 6500,//kg/m^3
                        elasMod: 50,
                        k: 100
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
                        k: 100
                    }
                },
                pmos: {
                    name: "NMOS",
                    color: "#857B64",
                    altColor: "#857B64",
                    properties:{
                        conductive: false,
                        density: 6500,//kg/m^3
                        elasMod: 50,
                        k: 100
                    }
                },
                diode: {
                    name: "Diode",
                    color: "#FDE2D9",
                    altColor: "#FDE2D9",
                    properties:{
                        conductive: false,
                        density: 6500,//kg/m^3
                        elasMod: 50,
                        k: 100
                    }
                },
                zener: {
                    name: "Zener Diode",
                    color: "#D77948",
                    altColor: "#D77948",
                    properties:{
                        conductive: false,
                        density: 6500,//kg/m^3
                        elasMod: 50,
                        k: 100
                    }
                }
            }
        }
    }

});