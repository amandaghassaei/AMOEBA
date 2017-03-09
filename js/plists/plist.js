/**
 * Created by ghassaei on 10/12/16.
 */

define([], function(){

   return {
       allMenus: {
           navDesign: {
               name: "Design",
               tabs: {
                   material: "Materials",
                   lattice: "Lattice",
                   camera: "View"
                   //sketch: "Visibility",
                   //select: "Select",
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
           cm: {
               name: "cm"
           },
           mm: {
               name: "mm"
           },
           inches: {
               name: "inches"
           }
       },

       allCameraTypes:{
           perspective: {
               name: "Perspective"
           },
           ortho: {
               name: "Orthographic"
           }
       }

   }

});