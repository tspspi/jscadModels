include('/mechanics/isothread.jscad');

function getParameterDefinitions() {
	return [ ];
}

function main(params) {
	params = { fn : 256 };

	let tubeDiameter = 59.5+4;
	let tubeHeight = 100;

	let clampDistance = 42;
	let clampHeight = 12;

	let rodDiameter = 8;
	let rodDistance = 130;
	let rodLength = 1000;

	let clampThickness = 5;

	let clampSlitSize = 3;

	let clampNutM = 4;

	let printables = [];
	let nonPrintables = [];

	// Tube
	let tube = cylinder({ d : tubeDiameter, h : tubeHeight, center: true, fn : params.fn }).translate([0,0, 100/2 - (tubeHeight - clampDistance - clampHeight)]).setColor([0,0,0]);

	nonPrintables.push(tube);

	// Generate the clamping screw and nut
	let nut = new window.jscad.tspi.isoNut( params, { m : clampNutM  });
	let screw = new window.jscad.tspi.iso4762Screw( params, { m : clampNutM, l : clampSlitSize + 2 * (1 + nut.getHeight()) });
	let mountscrew = new window.jscad.tspi.iso4762Screw( params, { m : rodDiameter, l : rodLength });

	// Two clamping positions

	let clamp = difference(
		union(
			cylinder( { d : tubeDiameter + 2*clampThickness, h : clampHeight, center : true, fn : params.fn }).translate([0,0, clampHeight/2]),
			cube({ size : [ clampSlitSize + 2 * (1 + nut.getHeight()), 4 + 2*nut.getRadiusOutside(), Math.max(clampHeight, nut.getRadiusOutside() + 2)], center : true }).translate( [0, -tubeDiameter/2 - clampThickness - nut.getRadiusOutside(), Math.max(clampHeight, nut.getRadiusOutside() + 2) / 2] ),
			cube( { size : [ rodDistance + 2 * mountscrew.getThroughholeCoarse() + 2, 2 * mountscrew.getThroughholeCoarse() + 2, clampHeight ], center : true } ).translate([0,0,clampHeight/2])
		),
		union(
			cylinder( { d : tubeDiameter, h : clampHeight, center : true, fn : params.fn }).translate([0,0, clampHeight/2]),
			cube( { size : [ clampSlitSize, tubeDiameter + 2*clampThickness + 2*nut.getRadiusOutside(), clampHeight ], center : true } ).translate([0,-clampThickness - nut.getRadiusOutside(),clampHeight / 2]),
			nut.getModel().rotateY(-90).translate([nut.getHeight()+1, -tubeDiameter/2 - clampThickness - nut.getRadiusOutside(), clampHeight / 2]),
			screw.getTemplate().rotateY(-90).translate([nut.getHeight()+1+clampSlitSize, -tubeDiameter/2 - clampThickness - nut.getRadiusOutside(), clampHeight / 2]),
			mountscrew.getTemplate().translate([rodDistance/2, 0, 0]),
			mountscrew.getTemplate().translate([-rodDistance/2, 0, 0])
		)
	);

	nonPrintables.push(screw.getTemplate().rotateY(-90).translate([nut.getHeight()+1+clampSlitSize, -tubeDiameter/2 - clampThickness - nut.getRadiusOutside(), clampHeight / 2]).setColor([0,1,0]));
	nonPrintables.push(screw.getTemplate().rotateY(-90).translate([nut.getHeight()+1+clampSlitSize, -tubeDiameter/2 - clampThickness - nut.getRadiusOutside(), clampHeight / 2 + clampDistance]).setColor([0,1,0]));

	printables.push(clamp.translate([0,0,0]));
	printables.push(clamp.translate([0,0,clampDistance]));

	nonPrintables.push(nut.getModel().rotateY(90).translate([nut.getHeight()+1, -tubeDiameter/2 - clampThickness - nut.getRadiusOutside(), clampHeight / 2]).setColor([0,0.5,0]));
	nonPrintables.push(nut.getModel().rotateY(90).translate([nut.getHeight()+1 + clampSlitSize/2, -tubeDiameter/2 - clampThickness - nut.getRadiusOutside(), clampHeight / 2 + clampDistance ]).setColor([0,0.5,0]));

	nonPrintables.push(mountscrew.getTemplate().translate([rodDistance/2, 0, 0]));
	nonPrintables.push(mountscrew.getTemplate().translate([-rodDistance/2, 0, 0]));

	return union(
		union(printables),
		union(nonPrintables)
	);
}
