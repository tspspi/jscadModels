/*
	A basic witch model (can be assembled with paracord
	or some other rope and some wood or plastic stick)
*/

function getParameterDefinitions() {
    return [
        { name: 'bodyheight', type: 'float', initial: 60, caption: "Body height" },
        { name: 'headdiameter', type: 'float', initial: 40, caption: "Head diameter" },
        { name: 'bottomdiameter', type: 'float', initial: 40, caption: "Bottom body diameter" },
        { name: 'topdiameter', type: 'float', initial: 25, caption: "Bottom body diameter" },
        { name: 'armAndLegDiameter', type: 'float', initial: 5, caption: "Arm and leg diameter" },
        { name: 'noseDiameter', type: 'float', initial: 8, caption: "Nose diameter" },
        { name: 'eyeDiameter', type: 'float', initial: 3, caption: "Eye diameter" },
        { name: 'mouthDiameter', type: 'float', initial: 3, caption: "Mouth diameter (inset)" },
        { name: 'mouthWidth', type: 'float', initial: 60, caption: "Mouth diameter (ltr)" },
        { name: 'broomDiameter', type: 'float', initial: 6, caption: "Broom diameter" },
        { name: 'broomAngle', type: 'float', initial: 5, caption: "Broom angle" },
    ];
}

function main(params) {
    return union(
        difference(
            cylinder({ fn : 200, r1 : params.bottomdiameter/2, r2 : params.topdiameter/2, h : params.bodyheight, center: true }).translate([0,0,params.bodyheight/2]),
            union(
                torus({ ri: params.armAndLegDiameter/2, ro: (params.headdiameter*0.625)/2 }).translate([0, -params.bottomdiameter/3, 3*params.armAndLegDiameter/2]),
                // cylinder({ r : params.armAndLegDiameter/2, h : params.bottomdiameter, center: true }).rotateY(90).translate([0,0, 4.0/5.0*params.bodyheight])
                torus({ ri: params.armAndLegDiameter/2, ro: (0.8*params.headdiameter)/2 }).translate([0, -params.bottomdiameter/3, 3.8/5.0*params.bodyheight]),
                torus({ ri : params.armAndLegDiameter*2, ro : params.topdiameter/2+params.armAndLegDiameter/2}).translate([0,0,params.bodyheight-params.armAndLegDiameter/2]),
                cylinder({ r : params.broomDiameter/2, h : params.bottomdiameter+params.bodyheight, center: true }).rotateX(90).translate([0,0,5*params.armAndLegDiameter/2]).rotateX(-1 * params.broomAngle)
            )
        ),
        difference(
            sphere( { fn : 200, r : params.headdiameter/2, center: true }).translate([0,0,params.bodyheight/2+2*params.headdiameter/2]),
            union(
                sphere( { r : params.eyeDiameter/2, center: true}).translate([params.noseDiameter,-params.headdiameter/2+params.noseDiameter/8,params.bodyheight/2+2*params.headdiameter/2+params.noseDiameter/2+params.eyeDiameter/2]),
                sphere( { r : params.eyeDiameter/2, center: true}).translate([-params.noseDiameter,-params.headdiameter/2+params.noseDiameter/8,params.bodyheight/2+2*params.headdiameter/2+params.noseDiameter/2+params.eyeDiameter/2]),
				torus( { ri : params.mouthDiameter/2, ro: params.mouthWidth/2 }).rotateX(20).translate([0,-(params.headdiameter/2-params.mouthWidth/2-params.mouthDiameter/2),params.bodyheight/2+2*params.headdiameter/2-params.noseDiameter/3])
            )
        ),
        sphere( { r : params.noseDiameter/2, center: true}).translate([0,-params.headdiameter/2+params.noseDiameter/4,params.bodyheight/2+2*params.headdiameter/2+params.noseDiameter/2])
    );
}
