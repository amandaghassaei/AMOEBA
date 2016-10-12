/**
 * Created by ghassaei on 10/12/16.
 */

define([], function(){

   return {
       allMenus: {
           navDesign: {
               name: "Design",
               tabs: {
                   lattice: "Lattice",
                   sketch: "Visibility",
                   select: "Select",
                   material: "Materials",
//                    import:"Import",
                   part: "Part"
//                    view: "View"
                   //script:"Script"
               }
           },
           navMaterial: {
               name: "Materials",
               parent: "navDesign",
               tabs: {
                   materialEditor: "Material Editor"
               }
           },
           navSim: {
               name: "Simulate",
               tabs: {
                   emSetup: "Globals",
                   emElectronics: "Electronics",
                   emBoundaryCond: "Boundaries",
                   emRun: "Run"
               }
           },
           emNavSignal: {
               name: "Composite",
               parent: "navSim",
               tabs: {
                   signal: "Signal Editor"
               }
           }
       },

       allUnitTypes:{
           mm: {
               name: "mm"
           },
           inches: {
               name: "inches"
           }
       }

   }

});