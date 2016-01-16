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
                        conductive: true
                    }
                },
                fiberGlass: {
                    name: "Insulator",
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
                rigid:{
                    name: "Rigid",
                    color: "#aaa",
                    altColor: "#9CC9CB",
                    properties:{}
                },
                flexure: {
                    name: "Flexure",
                    color: "#aaa",
                    altColor: "#8391AC",
                    properties:{}
                },
                piezo: {
                    name: "Piezo",
                    color: "#aaa",
                    altColor: "#F5447B",
                    properties:{}
                },
                mosfet: {
                    name: "MOSFET",
                    color: "#aaa",
                    altColor: "#F99987",
                    properties:{}
                }
                //
                //
                //
                //#ecf0f1
                //#8391AC
                //857B64
                //FDE2D9
                //D77948
            }
        }
    }

});