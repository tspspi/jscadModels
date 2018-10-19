function getParameterDefinitions() {
	return [
		{ name: 'tubeID', type: 'float', initial: 3, caption: "Tube inner diameter" },
		{ name: 'tubeOD', type: 'float', initial: 4, caption: "Tube outer diameter" },
		{ name: 'height', type: 'float', initial: 50, caption: "Height" },
		{ name: 'heightOpen', type: 'float', initial: 10, caption: "Opening height" },
		{ name: 'attachLength', type: 'float', initial: 10, caption: "Attachment tube length" },
		{ name: 'wallMin', type: 'float', initial: 1, caption: "Minimal wall thickness" },
		{ name: 'outDia', type: 'float', initial: 8, caption: "Vessle outer size" }
	];
}

function main (params) {
	var tubeID = params.tubeID;
	var tubeOD = params.tubeOD;
	var height = params.height;
	var heightOpen = params.heightOpen;
	var attachLength = params.attachLength;
	var wallMin = params.wallMin;
	var outerDiameter = params.outDia;

	var parts = [];

	parts.push(
		difference(
			cylinder({r : tubeOD/2, h : attachLength+height+wallMin, center: true }).translate([0,0,(attachLength+height+wallMin)/2]),
			union(
				cylinder({r : tubeID/2, h : attachLength+height, center: true }).translate([0,0,(attachLength+height)/2+wallMin]),
				union(
					cube({size: [tubeID/3, tubeOD, heightOpen], center: true}).translate([0,0,heightOpen/2+wallMin]),
					cube({size: [tubeOD, tubeID/3, heightOpen], center: true}).translate([0,0,heightOpen/2+wallMin])
				)
			)
		)
	);
	
	var cylindricalHeight = 2/3*height;
	var conicalHeight = 1/3*height;
	parts.push(
		difference(
			cylinder({r : 2*(outerDiameter+wallMin), h : cylindricalHeight+wallMin, center: true }).translate([0,0,(cylindricalHeight+wallMin)/2]),
			cylinder({r : 2*(outerDiameter), h : cylindricalHeight, center: true }).translate([0,0,(cylindricalHeight)/2+wallMin])
		)
	);

	var r1Pyra = 2*(outerDiameter+wallMin);
	var r2Pyra = outerDiameter/2;
	parts.push(
		difference(
			cylinder({r1 : 2*(outerDiameter+wallMin), r2 : tubeOD/2, h: conicalHeight, center: true }).translate([0,0,conicalHeight/2 + cylindricalHeight + wallMin]),
			union(
				cylinder({r1 : 2*(outerDiameter), r2 : tubeOD/2, h: conicalHeight-wallMin, center: true }).translate([0,0,conicalHeight/2-wallMin + cylindricalHeight + wallMin]),
				cylinder({r : tubeID/2, h : attachLength+height, center: true }).translate([0,0,(attachLength+height)/2+wallMin])
			)
		)
	);

	var alpha1 = atan(conicalHeight / (r1Pyra-r2Pyra));
	parts.push(cylinder({r : tubeOD/2, h:attachLength, center: true}).translate([0,0,attachLength/2]).rotateX(-alpha1).translate([0,r1Pyra-(conicalHeight/2)/tan(alpha1),cylindricalHeight+conicalHeight/2]));
	
	return difference(
		union(parts),
		cylinder({r : tubeID/2, h:attachLength+2*wallMin, center: true}).translate([0,0,attachLength/2-wallMin]).rotateX(-alpha1).translate([0,r1Pyra-(conicalHeight/2)/tan(alpha1),cylindricalHeight+conicalHeight/2])
	);
}
