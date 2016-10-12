/**
 * Created by ghassaei on 10/12/16.
 */

define([], function(){

    return {
        allMaterials: {
            insulating: {
                name: "Structural",
                color: "#fcefb5",
                altColor: "#fcefb5",
                properties: {
                    density: 3500,//kg/m^3
                    longitudalK: {x: 80, y: 80, z: 80},
                    shearK: {xy: 80, xz: 80, yx: 80, yz: 80, zx: 80, zy: 80},
                    bendingK: {x: 80, y: 80, z: 80},
                    torsionK: {x: 80, y: 80, z: 80}
                }
            },
            bending1DOF: {
                name: "1 DOF Hinge",
                color: "#cda4f3",
                altColor: "#cda4f3",
                texture: "stripes",
                mesh: "bending1dof",
                properties: {
                    density: 3500,//kg/m^3
                    longitudalK: {x: 80, y: 80, z: 80},
                    shearK: {xy: 80, xz: 80, yx: 80, yz: 80, zx: 80, zy: 80},
                    bendingK: {x: 80, y: 80, z: 2},
                    torsionK: {x: 80, y: 80, z: 80}
                }
            },
            bending2DOF: {
                name: "2 DOF Hinge",
                color: "#cda4f3",
                altColor: "#cda4f3",
                texture: "stripes",
                mesh: "bending2dof",
                properties: {
                    density: 3500,//kg/m^3
                    longitudalK: {x: 80, y: 80, z: 80},
                    shearK: {xy: 80, xz: 80, yx: 80, yz: 80, zx: 80, zy: 80},
                    bendingK: {x: 80, y: 2, z: 2},
                    torsionK: {x: 80, y: 80, z: 80}
                }
            },
            torsion1DOF: {
                name: "Torsion Flexure",
                color: "#cda4f3",
                altColor: "#cda4f3",
                texture: "stripes",
                mesh: "torsion1dof",
                properties: {
                    density: 3500,//kg/m^3
                    longitudalK: {x: 80, y: 80, z: 80},
                    shearK: {xy: 80, xz: 80, yx: 80, yz: 80, zx: 80, zy: 80},
                    bendingK: {x: 80, y: 80, z: 80},
                    torsionK: {x: 80, y: 80, z: 1}
                }
            },
            shear1DOF: {
                name: "Shear Flexure",
                color: "#cda4f3",
                altColor: "#cda4f3",
                texture: "cubeTextureShearFlex",
                properties: {
                    density: 3500,//kg/m^3
                    longitudalK: {x: 80, y: 80, z: 80},
                    shearK: {xy: 80, xz: 80, yx: 80, yz: 80, zx: 2, zy: 80},
                    bendingK: {x: 80, y: 80, z: 80},
                    torsionK: {x: 80, y: 80, z: 80}
                }
            },
            isoFlex: {
                name: "Iso-Flexible",
                color: "#cda4f3",
                altColor: "#cda4f3",
                texture: "stripes",
                properties: {
                    density: 3500,//kg/m^3
                    longitudalK: {x: 10, y: 10, z: 10},
                    shearK: {xy: 10, xz: 10, yx: 10, yz: 10, zx: 10, zy: 10},
                    bendingK: {x: 10, y: 10, z: 10},
                    torsionK: {x: 10, y: 10, z: 10}
                }
            },
            actuatorLinear1DOF: {
                name: "Linear Actuator",
                color: "#FFCC00",
                altColor: "#FFCC00",
                texture: "cubeTexture",
                properties: {
                    actuator: true,
                    density: 3500,//kg/m^3
                    longitudalK: {x: 80, y: 80, z: 80},
                    shearK: {xy: 80, xz: 80, yx: 80, yz: 80, zx: 80, zy: 80},
                    bendingK: {x: 80, y: 80, z: 80},
                    torsionK: {x: 80, y: 80, z: 80}
                }
            },
            actuatorBending1DOF: {
                name: "Bending Actuator",
                color: "#FFCC00",
                altColor: "#FFCC00",
                mesh: "bending1dof",
                properties: {
                    actuator: true,
                    density: 3500,//kg/m^3
                    longitudalK: {x: 80, y: 80, z: 80},
                    shearK: {xy: 80, xz: 80, yx: 80, yz: 80, zx: 80, zy: 80},
                    bendingK: {x: 80, y: 80, z: 80},
                    torsionK: {x: 80, y: 80, z: 80}
                }
            },
            actuatorTorsion1DOF: {
                name: "Torsional Actuator",
                color: "#FFCC00",
                altColor: "#FFCC00",
                mesh: "torsion1dof",
                properties: {
                    actuator: true,
                    density: 3500,//kg/m^3
                    longitudalK: {x: 80, y: 80, z: 80},
                    shearK: {xy: 80, xz: 80, yx: 80, yz: 80, zx: 80, zy: 80},
                    bendingK: {x: 80, y: 80, z: 80},
                    torsionK: {x: 80, y: 80, z: 80}
                }
            },
            actuatorShear: {
                name: "Shear Actuator",
                color: "#FFCC00",
                altColor: "#FFCC00",
                texture: "cubeTextureShear",
                properties: {
                    actuator: true,
                    density: 3500,//kg/m^3
                    longitudalK: {x: 80, y: 80, z: 80},
                    shearK: {xy: 80, xz: 80, yx: 80, yz: 80, zx: 80, zy: 80},
                    bendingK: {x: 80, y: 80, z: 80},
                    torsionK: {x: 80, y: 80, z: 80}
                }
            }
        }
    }
});