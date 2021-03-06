include('/mechanics/aluprofile.jscad');

if(typeof window === 'undefined') { window = new Object(); }
if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.miniecm !== 'object') { window.jscad.tspi.miniecm = new Object(); }

window.jscad.tspi.miniecm.frame = function(printer, params) {
	let knownParameters = [
	];
	let knownPrinterParameters = [
		{ name: 'scale', 						type: 'number', 	default: 1 			},
		{ name: 'correctionInsideDiameter', 	type: 'number', 	default: 0 			},
		{ name: 'correctionOutsideDiameter', 	type: 'number', 	default: 0 			},
		{ name: 'resolutionCircle', 			type: 'number', 	default: 360 		},
		{ name: 'guiderodClampDiaCorrection',	type: 'number',		default: 0.1		},
		{ name: 'lm8uuInsertDiameterScale',		type: 'number',		default: 1.05		},
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

	this.rawprinter = printer;

	this.getModel = function() {
		let obj500 = new window.jscad.tspi.mechanics.aluprofile.b20x20n6({}, { l : 500 });
		let obj460 = new window.jscad.tspi.mechanics.aluprofile.b20x20n6({}, { l : 460 });
		let outerCube = union(
		    obj500.getTemplate().rotateY(90).translate([0, -240, 0]),
		    obj500.getTemplate().rotateY(90).translate([0, 240, 0]),
		    obj500.getTemplate().rotateY(90).translate([0, -240, 500-20]),
		    obj500.getTemplate().rotateY(90).translate([0, 240, 500-20]),

		    obj460.getTemplate().translate([ 240,  240, 460/2+10]),
		    obj460.getTemplate().translate([-240,  240, 460/2+10]),
		    obj460.getTemplate().translate([ 240, -240, 460/2+10]),
		    obj460.getTemplate().translate([-240, -240, 460/2+10]),

		    obj460.getTemplate().rotateX(90).translate([-240, 0, 0]),
		    obj460.getTemplate().rotateX(90).translate([ 240, 0, 0]),
		    obj460.getTemplate().rotateX(90).translate([-240, 0, 500-20]),
		    obj460.getTemplate().rotateX(90).translate([ 240, 0, 500-20])
	    );

		let umlauf1 = union(
			obj460.getTemplate().rotateX(90).translate([-240, 0, 250]),
			obj460.getTemplate().rotateX(90).translate([240, 0, 250]),
			obj460.getTemplate().rotateY(90).translate([0, -240, 250]),
			obj460.getTemplate().rotateY(90).translate([0,  240, 250])
		);

		let boden1 = union(
            obj460.getTemplate().rotateX(90).translate([-120, 0, 0]),
            obj460.getTemplate().rotateX(90).translate([120, 0, 0]),
            obj500.getTemplate().rotateY(90).translate([0, -120, 20]),
            obj500.getTemplate().rotateY(90).translate([0, 120, 20])
        );

        let deckenverstrebung = union(
            obj460.getTemplate().rotateX(90).translate([-120, 0, 480]),
            obj460.getTemplate().rotateX(90).translate([120, 0, 480])
        );

        let elektronikfach = union(
            obj460.getTemplate().rotateX(90).translate([-240, 0, 400]),
            obj460.getTemplate().rotateX(90).translate([240, 0, 400]),
            obj460.getTemplate().rotateY(90).translate([0, -240, 400]),
            obj460.getTemplate().rotateY(90).translate([0,  240, 400]),

            obj460.getTemplate().rotateX(90).translate([-120, 0, 400]),
            obj460.getTemplate().rotateX(90).translate([120, 0, 400])
        );

		return union(
		    outerCube,
		    umlauf1,
		    boden1,
		    deckenverstrebung,
		    elektronikfach
		);
	}
}

function getParameterDefinitions() {
    return [
		{ name : 'grpPrinter', type : 'Group', caption : 'Printer' },
        { name: 'resolutionCircle', type: 'float', initial: 32, caption: 'Circle resolution', min : 32 },
		{ name: 'scale', type : 'float', initial : 1, caption : 'Scale' },
		{ name: 'correctionInsideDiameter', type : 'float', initial : 0, caption : 'Inside diameter correction' },
		{ name: 'correctionOutsideDiameter', type : 'float', initial : 0, caption : 'Outside diameter correction' }
    ];
}

function main(params) {
	let frame = new window.jscad.tspi.miniecm.frame(params, params);

	return frame.getModel();
}
