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
                    name: "Structural Conductive",
                    color: "#b5a642",
                    altColor: "#857B64",
                    properties:{
                        conductive: true,
                        density: 8500,//kg/m^3
                        elasMod: 1000,//Gpascals (kg/(s^2*m)/10000000000)
                        k: 100
                    }
                },
                flexureCond: {
                    name: "Flexure Conductive",
                    color: "#b4ac9c",
                    altColor: "#b4ac9c",
                    texture: "stripes",
                    properties:{
                        conductive: true,
                        density: 3500,//kg/m^3
                        elasMod: 0.01,
                        k: 30
                    }
                },
                //alum:{
                //    name: "Lightweight Structural Conductive",
                //    color: "#9CC9CB",
                //    altColor: "#9CC9CB",
                //    properties:{
                //        conductive: true,
                //        density: 8500,//kg/m^3
                //        elasMod: 1000,//Gpascals (kg/(s^2*m)/10000000000)
                //        k: 1000
                //    }
                //},
                fiberGlass: {
                    name: "Structural Insulating",
                    color: "#8a2be2",
                    altColor: "#8a2be2",
                    properties:{
                        conductive: false,
                        density: 3500,//kg/m^3
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
//                carbon: {
//                    name: "Resistive",
//                    color: "#222",
//                    altColor: "#000",
//                    properties:{
//                        conductive: false,
//                        density: 500,//kg/m^3
//                        elasMod: 181,
//                        k: 1000
//                    }
//                },

                flexure: {
                    name: "Flexure Insulating",
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
                piezo: {
                    name: "Piezo",
                    color: "#FFCC00",
                    altColor: "#FFCC00",
                    properties:{
                        conductive: false,
                        density: 6500,//kg/m^3
                        elasMod: 50,
                        k: 50
                    }
                },
                signal: {
                    name: "Signal Generator",
                    color: "#0EE3B8",
                    altColor: "#0EE3B8",
                    properties:{
                        conductive: true,
                        density: 6500,//kg/m^3
                        elasMod: 50,
                        k: 50
                    }
                }
                //nmos: {
                //    name: "NMOS",
                //    color: "#F99987",
                //    altColor: "#F99987",
                //    properties:{
                //        conductive: false,
                //        density: 6500,//kg/m^3
                //        elasMod: 50,
                //        k: 1000
                //    }
                //},
                //pmos: {
                //    name: "PMOS",
                //    color: "#0EE3B8",
                //    altColor: "#0EE3B8",
                //    properties:{
                //        conductive: false,
                //        density: 6500,//kg/m^3
                //        elasMod: 50,
                //        k: 1000
                //    }
                //},
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
            }
        }
    }

});