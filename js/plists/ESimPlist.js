/**
 * Created by aghassaei on 8/9/15.
 */


define([], function(){

    return {

        allCurrentUnits:{
            1: "A",
            0.001: "mA",
            0.000001: "uA"
        },

        allVoltageUnits:{
            1: "V",
            0.001: "mV"
        },

        visibleStaticSimTypes: {
            none: "None",
            electricField: "Electric Field",
            chargeField: "Charge Distribution",
            capacitanceField: "Capacitance"
        }
    }

});