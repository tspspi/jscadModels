include('/mechanics/isothread.jscad');
include('/mechanics/screwclamp.jscad');

if(typeof window === 'undefined') { window = new Object(); }
if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.miniecm !== 'object') { window.jscad.tspi.miniecm = new Object(); }

window.jscad.tspi.miniecm.bedxy = function(printer, params) {
	let knownParameters = [
		{ name: 'guiderodClampM',				type: 'number',		default: 8			},
		{ name: 'guiderodClampScrewLength',		type: 'number',		default: 40			},

		{ name: 'guiderodDiameter',				type: 'number',		default: 8			},
		{ name: 'guiderodLengthMax',			type: 'number',		default: 230		},

		{ name: 'guiderodClampMinWall',			type: 'number',		default: 2			},

		{ name: 'onlyPrintedPart',				type: 'boolean',	default: false		},
	];

	let knownPrinterParameters = [
		{ name: 'scale', 						type: 'number', 	default: 1 			},
		{ name: 'correctionInsideDiameter', 	type: 'number', 	default: 0 			},
		{ name: 'correctionOutsideDiameter', 	type: 'number', 	default: 0 			},
		{ name: 'resolutionCircle', 			type: 'number', 	default: 32 /*360*/ 		},
	];

	this.parameters = { };
	this.printer = { };
	this.error = false;

	for(var i = 0; i < knownParameters.length; i++) {
		if(typeof(params[knownParameters[i].name]) === knownParameters[i].type) {
			this.parameters[knownParameters[i].name] = params[knownParameters[i].name];
		} else if(knownParameters[i].default != -1) {
			this.parameters[knownParameters[i].name] = knownParameters[i].default;
		} else {
			this.error = true;
		}
	}
	for(i = 0; i < knownPrinterParameters.length; i++) {
		if(typeof(printer[knownPrinterParameters[i].name]) === knownPrinterParameters[i].type) {
			this.printer[knownPrinterParameters[i].name] = printer[knownPrinterParameters[i].name];
		} else if(knownPrinterParameters[i].default != -1) {
			this.printer[knownPrinterParameters[i].name] = knownPrinterParameters[i].default;
		} else {
			this.error = true;
		}
	}

	this.rawPrinterObject = printer;

	this.getModel = function() {
		/*
			Generate X Axis rods and clamps
		*/
		let rodclamp = new window.jscad.tspi.mechanics.basicScrewclamp(this.rawPrinterObject, { m : this.parameters['guiderodClampM'], screwLength : this.parameters['guiderodClampScrewLength'], rodDiameter : this.parameters['guiderodDiameter'], onlyPrintedPart : this.parameters['onlyPrintedPart'], minWallThickness : this.parameters['guiderodClampMinWall']});

		let positionAxisX_2_y = this.parameters['guiderodLengthMax']+2*(rodclamp.getClampSizeX()/2-rodclamp.getClampThickness());
		let positionAxisX_1_y = 0;
		let positionAxisY_1_x = (-rodclamp.getClampSizeX()/2+rodclamp.getClampThickness());
		let positionAxisY_2_x = this.parameters['guiderodLengthMax']+rodclamp.getClampSizeX()/2-rodclamp.getClampThickness();

		let useableRodX = this.parameters['guiderodLengthMax'] - 2 * rodclamp.getClampThickness();
		let requiresSpaceZ = 2 * rodclamp.getClampSizeY();
		//alert("When using "+this.parameters['guiderodDiameter']+"mm rod, usable travel area is "+useableRodX+", height of assembly requires "+requiresSpaceZ);

		let stabilizer1 = (new CSG.Polygon2D([[0, 0], [0, rodclamp.getClampSizeY()], [-(rodclamp.getClampSizeX()-rodclamp.getClampThickness()), rodclamp.getClampSizeY()]])).extrude({ offset : [0, 0, rodclamp.getClampThickness()]}).rotateX(90).translate([0,rodclamp.getClampSizeX()/2,-rodclamp.getOffsetBelowRod()]);

		let edgeMountPart = union(
			rodclamp.getModel().rotateX(90).rotateZ(90).translate([0, 0, 0]),
			rodclamp.getModel().rotateX(90).translate([-rodclamp.getClampSizeX()/2+rodclamp.getClampThickness(), rodclamp.getClampSizeX()/2, rodclamp.getClampSizeY()]),
			stabilizer1
		);

		let axis2Height = rodclamp.getClampSizeY();

		let bedPrinted = union(
			edgeMountPart,
			edgeMountPart.mirroredX().translate([this.parameters['guiderodLengthMax'], 0, 0]),

			edgeMountPart.mirroredY().translate([0, positionAxisX_2_y, 0]),
			edgeMountPart.mirroredX().mirroredY().translate([this.parameters['guiderodLengthMax'], positionAxisX_2_y, 0])
		);

		if(!this.parameters['onlyPrintedPart']) {
			let nonprintedParts = union(
 				cylinder({ d : this.parameters['guiderodDiameter'], h : this.parameters['guiderodLengthMax']}).rotateY(90).setColor([0,0,1]),
				cylinder({ d : this.parameters['guiderodDiameter'], h : this.parameters['guiderodLengthMax']}).rotateY(90).translate([0, positionAxisX_2_y, 0]).setColor([0,0,1]),

				cylinder({ d : this.parameters['guiderodDiameter'], h : this.parameters['guiderodLengthMax']}).rotateY(90).rotateZ(90).translate([positionAxisY_1_x, rodclamp.getClampSizeX()/2-rodclamp.getClampThickness(), axis2Height]).setColor([0,0,1]),
				cylinder({ d : this.parameters['guiderodDiameter'], h : this.parameters['guiderodLengthMax']}).rotateY(90).rotateZ(90).translate([positionAxisY_2_x, rodclamp.getClampSizeX()/2-rodclamp.getClampThickness(), axis2Height]).setColor([0,0,1])
			);
			return union(bedPrinted, nonprintedParts);
		} else {
			return bedPrinted;
		}
	}
}


function main() {
	let bed = new window.jscad.tspi.miniecm.bedxy({}, {});
	return bed.getModel();
}
