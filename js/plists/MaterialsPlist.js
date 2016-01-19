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
                    name: "Brass",
                    color: "#b5a642",
                    altColor: "#857B64",
                    properties:{
                        conductive: true,
                        density: 8500,//kg/m^3
                        elasMod: 100//Gpascals (kg/(s^2*m)/1000000000)
                    }
                },
                fiberGlass: {
                    name: "Insulator",
                    color: "#fef1b5",
//                    opacity: "0.9",
                    altColor: "#ecf0f1",
                    properties:{
                        conductive: false,
                        density: 500,//kg/m^3
                        elasMod: 17.2
                    }
                },
                carbon: {
                    name: "Carbon Composite",
                    color: "#222",
                    altColor: "#000",
                    properties:{
                        conductive: false,
                        density: 500,//kg/m^3
                        elasMod: 181
                    }
                },
                flexure: {
                    name: "Flexure",
                    color: "#aaa",
                    altColor: "#8391AC",
                    properties:{
                        conductive: false,
                        density: 3500,//kg/m^3
                        elasMod: 0.01
                    }
                },
                piezo: {
                    name: "Piezo",
                    color: "#aaa",
                    altColor: "#F5447B",
                    properties:{
                        conductive: false,
                        density: 6500,//kg/m^3
                        elasMod: 50
                    }
                },
                mosfet: {
                    name: "MOSFET",
                    color: "#aaa",
                    altColor: "#F99987",
                    properties:{
                        conductive: false,
                        density: 6500,//kg/m^3
                        elasMod: 50
                    }
                }
                //
                //
                //#9CC9CB
                //#ecf0f1
                //#8391AC
                //857B64
                //FDE2D9
                //D77948
            }
        }
    }

});