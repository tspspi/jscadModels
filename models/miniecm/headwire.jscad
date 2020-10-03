include('/mechanics/isothread.jscad');
include('/mechanics/screwclamp.jscad');

if(typeof window === 'undefined') { window = new Object(); }
if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.miniecm !== 'object') { window.jscad.tspi.miniecm = new Object(); }
if(typeof window.jscad.tspi.miniecm.tool !== 'object') { window.jscad.tspi.miniecm.tool = new Object(); }

window.jscad.tspi.miniecm.tool.wiretool01 = function(printer, params) {
	let knownParameters = [
		{ name: 'wireclampScrewM',				type: 'number',		default: 3			},
		{ name: 'wireclampScrewLength',			type: 'number',		default: 20			},
		{ name: 'wireclampWireDiameter',		type: 'number',		default: 2.4		},
		{ name: 'wireclampExtendsBottom',		type: 'number',		default: 10			},
		{ name: 'wireclampWireLength',			type: 'number',		default: 175		},

		{ name: 'toolHeight',					type: 'number',		default: 50			},

		{ name: 'onlyPrintedPart',				type: 'boolean',	default: true		},

		{ name: 'wireclampSlitWidth',			type: 'number',		default: 0			},
		{ name: 'wireclampMinWallThickness',	type: 'number',		default: 1			},
	];

	let knownPrinterParameters = [
		{ name: 'scale', 						type: 'number', 	default: 1 			},
		{ name: 'correctionInsideDiameter', 	type: 'number', 	default: 0 			},
		{ name: 'correctionOutsideDiameter', 	type: 'number', 	default: 0 			},
		{ name: 'resolutionCircle', 			type: 'number', 	default: 360 		},
	];

	this.rawprinter = printer;
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


	this.getModel = function() {
		let wireDiameter 			= this.parameters['wireclampWireDiameter'];
		let wireLength 				= this.parameters['wireclampWireLength'];

		let wireExtendsBottom 		= this.parameters['wireclampExtendsBottom'];
		let metricNutDimension 		= this.parameters['wireclampScrewM'];
		let wireMountScrewLength 	= this.parameters['wireclampScrewLength'];
		let wireMountSlitWidth 		= Math.max((wireDiameter/2), 1);
		let displayPrintedPartOnly 	= this.parameters['onlyPrintedPart'];
		let minWallSize				= this.parameters['wireclampMinWallThickness'];


		let objMount = {};
		let objWire = cylinder({ d : wireDiameter, h : wireLength, center : true }).translate([0,0, wireLength/2 - wireExtendsBottom]);
		let clamp = new window.jscad.tspi.mechanics.basicScrewclamp(this.rawprinter, { m : metricNutDimension, screwLength : wireMountScrewLength, rodDiameter : wireDiameter, onlyPrintedPart : displayPrintedPartOnly, minWallThickness : minWallSize, slitWidth : wireMountSlitWidth});

		let backwallThickness = 2*minWallSize + 5;

		let printedModel = union(
			clamp.getModel(),
			clamp.getModel().translate([0,0,this.parameters['toolHeight']-clamp.getClampThickness()]),
			cube({size : [clamp.getClampSizeX(), backwallThickness, this.parameters['toolHeight']]}).translate([-clamp.getClampSizeX() / 2, -backwallThickness - clamp.getOffsetBelowRod()])
		);

		if(displayPrintedPartOnly) {
			objMount = printedModel;
		} else {
			let nonprintedParts = union(
				objWire.setColor([1,0,0])
			);
			objMount = union(
				printedModel,
				nonprintedParts
			);
		}

		return objMount;
	}

	this.getOffsetBelowRod = function() {
		let wireDiameter 			= this.parameters['wireclampWireDiameter'];
		let wireLength 				= this.parameters['wireclampWireLength'];

		let wireExtendsBottom 		= this.parameters['wireclampExtendsBottom'];
		let metricNutDimension 		= this.parameters['wireclampScrewM'];
		let wireMountScrewLength 	= this.parameters['wireclampScrewLength'];
		let wireMountSlitWidth 		= Math.max((wireDiameter/2), 1);
		let displayPrintedPartOnly 	= this.parameters['onlyPrintedPart'];
		let minWallSize				= this.parameters['wireclampMinWallThickness'];

		let clamp = new window.jscad.tspi.mechanics.basicScrewclamp(printer, { m : metricNutDimension, screwLength : wireMountScrewLength, rodDiameter : wireDiameter, onlyPrintedPart : displayPrintedPartOnly, minWallThickness : minWallSize, slitWidth : wireMountSlitWidth});

		return clamp.getOffsetBelowRod();
	}
}

function main(params) {
	let tool01 = new window.jscad.tspi.miniecm.tool.wiretool01({}, {});
	return tool01.getModel();
}
