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
                   Setup: "Globals",
                   Electronics: "Electronics",
                   BoundaryCond: "Boundaries",
                   Run: "Run"
               }
           },
           NavSignal: {
               name: "Signals",
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