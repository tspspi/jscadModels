include('/mechanics/isothread.jscad');

function getParameterDefinitions() {
	return [
		{ name : 'grpModel', type : 'group', caption : 'Model parameters' },
		{ name : 'tubeDiameter', type : 'float', initial : 59.5+2, caption : 'Tube diameter' },
		{ name : 'tubeHeight', type : 'float', initial : 100, caption : 'Tube height' },
		{ name : 'clampDistance', type : 'float', initial : 42, caption : 'Clamp distance' },
		{ name : 'clampHeight', type : 'float', initial : 12, caption : 'Clamp height' },
		{ name : 'rodDiameter', type : 'float', initial : 8, caption : 'Rod diameter' },
		{ name : 'rodSpacing' , type : 'float', initial: 130, caption : 'Rod spacing' },
		{ name : 'rodLength' , type : 'float', initial : 1000, caption : 'Rod length' },
		{ name : 'clampThickness', type : 'float', initial : 5, caption: 'Clamp thickness' },
		{ name : 'clampSlitSize' , type : 'float', initial : 5, caption: 'Slit size' },
		{ name : 'clampNutM', type : 'float', initial : 4, caption : 'Nut M' },

		{ name : 'grpDisplay', type : 'group', caption : 'Display selection' },
		{ name : 'printMode', type : 'checkbox', caption : 'Show only print model', checked : false },

		{ name : 'dspTube', type : 'checkbox', caption : 'Tube', checked : true },
		{ name : 'dspNonPrintables', type : 'checkbox', caption : 'Non printables', checked : true },
		{ name : 'dspClamp1', type : 'checkbox', caption : 'Clamp 1', checked : true },
		{ name : 'dspClamp2', type : 'checkbox', caption : 'Clamp 2', checked : true },

		{ name : 'grpPrinter', type : 'group', caption : 'Printer parameters' },
		{ name : 'resolutionCircle', type : 'int', initial : 256, caption: 'Resolution circle' }
	];
}

function main(params) {
	let displayClamp1 = params['dspClamp1'];
	let displayClamp2 = params['dspClamp2'];
	let displayTube = params['dspTube'];
	let displayNonPrintables = params['dspNonPrintables'];
	let fn = params['resolutionCircle'];

	if((!params['dspClamp1']) && (!params['dspClamp2']) && (!params['dspNonPrintables']) && (!params['dspTube']) && (!(!params['dspOnlyPrintMode']))) {
		alert("Nothing selected for display, displaying everything");

		displayClamp1 = true;
		displayClamp2 = true;
		displayTube = true;
		displayNonPrintables = true;
	}
	if(params['printMode']) {
		displayClamp1 = true;
		displayClamp2 = false;
		displayTube = false;
		displayNonPrintables = false;
	}

	let tubeDiameter = params['tubeDiameter'];
	let tubeHeight = params['tubeHeight'];

	let clampDistance = params['clampDistance'];
	let clampHeight = params['clampHeight'];

	let rodDiameter = params['rodDiameter'];
	let rodDistance = params['rodSpacing'];
	let rodLength = params['rodLength'];

	let clampThickness = params['clampThickness'];

	let clampSlitSize = params['clampSlitSize'];

	let clampNutM = params['clampNutM'];

	let printables = [];
	let nonPrintables = [];

	// Tube
	let tube = cylinder({ d : tubeDiameter, h : tubeHeight, center: true, fn : fn }).translate([0,0, 100/2 - (tubeHeight - clampDistance - clampHeight)]).setColor([0,0,0]);

	if(displayTube) {
		nonPrintables.push(tube);
	}

	// Generate the clamping screw and nut
	let nut = new window.jscad.tspi.isoNut( params, { m : clampNutM  });
	let screw = new window.jscad.tspi.iso4762Screw( params, { m : clampNutM, l : clampSlitSize + 2 * (1 + nut.getHeight()) });
	let mountscrew = new window.jscad.tspi.iso4762Screw( params, { m : rodDiameter, l : rodLength });

	// Two clamping positions

	let clamp = difference(
		union(
			cylinder( { d : tubeDiameter + 2*clampThickness, h : clampHeight, center : true, fn : fn }).translate([0,0, clampHeight/2]),
			cube({ size : [ clampSlitSize + 2 * (1 + nut.getHeight()), 4 + 2*nut.getRadiusOutside(), Math.max(clampHeight, nut.getRadiusOutside() + 2)], center : true }).translate( [0, -tubeDiameter/2 - clampThickness - nut.getRadiusOutside(), Math.max(clampHeight, nut.getRadiusOutside() + 2) / 2] ),
			cube( { size : [ rodDistance, 2 * mountscrew.getThroughholeCoarse() + 2, clampHeight ], center : true } ).translate([0,0,clampHeight/2]),
			cylinder( { r : mountscrew.getThroughholeCoarse() + 1, h : clampHeight, center : true, fn : fn } ).translate([rodDistance/2, 0, clampHeight/2]),
			cylinder( { r : mountscrew.getThroughholeCoarse() + 1, h : clampHeight, center : true, fn : fn } ).translate([-rodDistance/2, 0, clampHeight/2])
		),
		union(
			cylinder( { d : tubeDiameter, h : clampHeight, center : true, fn : fn }).translate([0,0, clampHeight/2]),
			cube( { size : [ clampSlitSize, tubeDiameter + 2*clampThickness + 2*nut.getRadiusOutside(), clampHeight ], center : true } ).translate([0,-clampThickness - nut.getRadiusOutside(),clampHeight / 2]),
			nut.getModel().rotateY(-90).translate([nut.getHeight()+1, -tubeDiameter/2 - clampThickness - nut.getRadiusOutside(), clampHeight / 2]),
			screw.getTemplate().rotateY(-90).translate([nut.getHeight()+1+clampSlitSize, -tubeDiameter/2 - clampThickness - nut.getRadiusOutside(), clampHeight / 2]),
			mountscrew.getTemplate().translate([rodDistance/2, 0, 0]),
			mountscrew.getTemplate().translate([-rodDistance/2, 0, 0])
		)
	);

	if(displayNonPrintables && displayClamp1) {
		nonPrintables.push(screw.getTemplate().rotateY(-90).translate([nut.getHeight()+1+clampSlitSize, -tubeDiameter/2 - clampThickness - nut.getRadiusOutside(), clampHeight / 2]).setColor([0,1,0]));
	}
	if(displayNonPrintables &&displayClamp2) {
		nonPrintables.push(screw.getTemplate().rotateY(-90).translate([nut.getHeight()+1+clampSlitSize, -tubeDiameter/2 - clampThickness - nut.getRadiusOutside(), clampHeight / 2 + clampDistance]).setColor([0,1,0]));
	}

	if(displayClamp1) {
		printables.push(clamp.translate([0,0,0]));
	}
	if(displayClamp2) {
		printables.push(clamp.translate([0,0,clampDistance]));
	}

	if(displayNonPrintables && displayClamp1) {
		nonPrintables.push(nut.getModel().rotateY(90).translate([nut.getHeight()+1, -tubeDiameter/2 - clampThickness - nut.getRadiusOutside(), clampHeight / 2]).setColor([0,0.5,0]));
	}
	if(displayNonPrintables && displayClamp2) {
		nonPrintables.push(nut.getModel().rotateY(90).translate([nut.getHeight()+1 + clampSlitSize/2, -tubeDiameter/2 - clampThickness - nut.getRadiusOutside(), clampHeight / 2 + clampDistance ]).setColor([0,0.5,0]));
	}

	if(displayNonPrintables) {
		nonPrintables.push(mountscrew.getTemplate().translate([rodDistance/2, 0, 0]));
		nonPrintables.push(mountscrew.getTemplate().translate([-rodDistance/2, 0, 0]));
	}

	if((printables.length > 0) && (nonPrintables.length > 0)) {
		return union(
			union(printables),
			union(nonPrintables)
		);
	} else if(printables.length > 0) {
		return union(printables);
	} else {
		return union(nonPrintables);
	}
}
