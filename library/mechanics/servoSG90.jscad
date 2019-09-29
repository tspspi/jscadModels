/*
    SG90 servo motor template

    Note: Origin is normally set in the lower
	edge of the servo. The origin can be set
	into the axis with {center:true} parameter.
	
    If you think this code was useful BTC
    contributions are welcome at
    19sKN38N4yxWZXoZeAdXZb5rq9xk32aDP4
*/

if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.mechanics !== 'object') { window.jscad.tspi.mechanics = new Object(); }

/*
	Usage:
		include('/mechanics/servoSG90.jscad');

		function main() {
			var step = new window.jscad.tspi.mechanics.stepperSG90({}, { horn : 3, center: true });
			return step.getModel();
		}

	Options:
		horn			Selects which type of horn should be added
						0		none (default)
						1		single sided
						2		double sided
						3		t style
		enableHorn		Decides if the horn should be painted (default true)
		enableServo		Decides if the servo itself should be painted (default true)
		center			If set centers the servo so that the axis passes through 0,0,0
						with the horn being in the upper plane and the 

	Printer options:
		scale	Applied scaling factor
*/

window.jscad.tspi.mechanics.stepperSG90 = function(printer, params) {
	knownParameters = [
		{ name: 'center',						type: 'boolean',		default: false	},
		{ name: 'enableHorn',					type: 'boolean',		default: true },
		{ name: 'enableServo',					type: 'boolean',		default: true },
		/*
			Servo horn selection
				0 	none
				1	single side
				2	both sides
				3	cross style
		*/
		{ name: 'horn',							type: 'number',			default: 0 },
	];

	knownPrinterParameters = [
		{ name: 'scale',                         type: 'number',     default: 1         },
		{ name: 'correctionInsideDiameter',     type: 'number',     default: 0         },
		{ name: 'correctionOutsideDiameter',     type: 'number',     default: 0         },
		{ name: 'resolutionCircle',             type: 'number',     default: 32     },
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
			this.error = false;
		}
	}
	for(i = 0; i < knownPrinterParameters.length; i++) {
		if(typeof(printer[knownPrinterParameters[i].name]) === knownPrinterParameters[i].type) {
			this.printer[knownPrinterParameters[i].name] = printer[knownPrinterParameters[i].name];
		} else if(knownPrinterParameters[i].default != -1) {
			this.printer[knownPrinterParameters[i].name] = knownPrinterParameters[i].default;
		} else {
			this.error = false;
		}
	}
	
	this.getModel = function() {
		if(this.parameters['enableServo']) {
			var model = union(
				cube({ size : [ 22.5, 12.0, 23.0 ], center : false }),
				difference(
					cube({ size : [ 32.0, 12.0,  2.5 ], center : false }).translate([ -4.75, 0, 16.0 ]),
					union(
						cylinder({ d : 2.5, h : 30, center : true}).translate([-1.25-1.25, 6, 15]),
						cylinder({ d : 2.5, h : 30, center : true}).translate([22.5+1.25+1.25, 6, 15])
					)
				),
				cylinder({ d : 12.0, h : 27, center : true }).translate([6, 6, 13.5 ]),
				cylinder({ d :  5.0, h : 30, center : true }).translate([6, 6, 15 ]).setColor([1,0,0]),
				cylinder({ d :  6.0, h : 27, center : true }).translate([11.5, 6, 13.5])
			);
		} else {
			var model = cube({ size : [ 0, 0, 0 ] });
		}

		if(this.parameters['enableHorn']) {
			if(this.parameters['horn'] > 0) {
				var horn = difference(
					cylinder({ d : 7, h : 4, center : true }).translate([0, 0, 2]),
					cylinder({ d : 5, h : 2.5, center : true }).translate([0, 0, 2.75])
				);

				if((this.parameters['horn'] == 1) || (this.parameters['horn'] == 2)) {
					var singleHornPart = difference(
						union(
							cube([ 19.5-3.5-2, 5.5, 1.5 ]).translate([0, -5.5/2, 0]),
							cylinder({ d : 4, h : 1.5, center : true }).translate([14.0, 0, 0.75])
						),
						union(
							cube([ 19.5-3.5, 5.5, 1.5 ]).translate([0, -5.5/2, 0]).rotateZ(-atan(1.5 / (14+7))).translate([0, 5.5, 0]),
							cube([ 19.5-3.5, 5.5, 1.5 ]).translate([0, -5.5/2, 0]).rotateZ(-atan(1.5 / (14+7))).translate([0, 5.5, -1.5]).rotateX(180),
							cylinder({ d : 1, h : 1.5, center: true }).translate([5.3+0*2, 0, 1.5/2]),
							cylinder({ d : 1, h : 1.5, center: true }).translate([5.3+1*2, 0, 1.5/2]),
							cylinder({ d : 1, h : 1.5, center: true }).translate([5.3+2*2, 0, 1.5/2]),
							cylinder({ d : 1, h : 1.5, center: true }).translate([5.3+3*2, 0, 1.5/2]),
							cylinder({ d : 1, h : 1.5, center: true }).translate([5.3+4*2, 0, 1.5/2]),
							cylinder({ d : 1, h : 1.5, center: true }).translate([5.3+5*2, 0, 1.5/2])
						)
					);
					if(this.parameters['horn'] == 1) {
						// Single ended
						horn = union(
							horn,
							singleHornPart
						);
					} else {
						// Double ended
						horn = union(
							horn,
							singleHornPart,
							singleHornPart.rotateZ(180)
						);
					}
				}

				if(this.parameters['horn'] == 3) {
					// Cross styled horn
					var singleHornPart = difference(
						union(
							cube([ 19.5-3.5-2, 5.5, 1.5 ]).translate([0, -5.5/2, 0]),
							cylinder({ d : 4, h : 1.5, center : true }).translate([14.0, 0, 0.75])
						),
						union(
							cube([ 19.5-3.5, 5.5, 1.5 ]).translate([0, -5.5/2, 0]).rotateZ(-atan(1.5 / (14+7))).translate([0, 5.5, 0]),
							cube([ 19.5-3.5, 5.5, 1.5 ]).translate([0, -5.5/2, 0]).rotateZ(-atan(1.5 / (14+7))).translate([0, 5.5, -1.5]).rotateX(180),
							cylinder({ d : 1, h : 1.5, center: true }).translate([5+0*2, 0, 1.5/2]),
							cylinder({ d : 1, h : 1.5, center: true }).translate([5+1*2, 0, 1.5/2]),
							cylinder({ d : 1, h : 1.5, center: true }).translate([5+2*2, 0, 1.5/2]),
							cylinder({ d : 1, h : 1.5, center: true }).translate([5+3*2, 0, 1.5/2]),
							cylinder({ d : 1, h : 1.5, center: true }).translate([5+4*2, 0, 1.5/2]),
							cylinder({ d : 1, h : 1.5, center: true }).translate([5+5*2, 0, 1.5/2])
						)
					);
					var otherHornPart = difference(
						union(
							cube([ 22-3.5-2, 7, 1.5 ]).translate([0, -7/2, 0]),
							cylinder({ d : 4, h : 1.5, center : true }).translate([16.5, 0, 0.75])
						),
						union(
							cube([ 23-3.5, 7, 1.5 ]).translate([0, -7/2, 0]).rotateZ(-atan(3 / (16.5+7))).translate([0, 7, 0]),
							cube([ 23-3.5, 7, 1.5 ]).translate([0, -7/2, 0]).rotateZ(-atan(3 / (16.5+7))).translate([0, 7, -1.5]).rotateX(180),
							cylinder({ d : 1, h : 1.5, center: true }).translate([5+0*2, 0, 1.5/2]),
							cylinder({ d : 1, h : 1.5, center: true }).translate([5+1*2, 0, 1.5/2]),
							cylinder({ d : 1, h : 1.5, center: true }).translate([5+2*2, 0, 1.5/2]),
							cylinder({ d : 1, h : 1.5, center: true }).translate([5+3*2, 0, 1.5/2]),
							cylinder({ d : 1, h : 1.5, center: true }).translate([5+4*2, 0, 1.5/2]),
							cylinder({ d : 1, h : 1.5, center: true }).translate([5+5*2, 0, 1.5/2]),
							cylinder({ d : 1, h : 1.5, center: true }).translate([5+6*2, 0, 1.5/2])
						)
					);
					
					horn = union(
						horn,
						difference(
							union(
								cube([ 4, 17-4, 1.5]).translate([ -2, -(17-4)/2, 0]),
								cylinder({ d : 4, h : 1.5, center : true }).translate([0, 6.5, 1.5/2]),
								cylinder({ d : 4, h : 1.5, center : true }).translate([0, -6.5, 1.5/2])
							),
							union(
								cylinder({ d : 1, h : 1.5, center: true }).translate([0, 5+0*2, 1.5/2]),
								cylinder({ d : 1, h : 1.5, center: true }).translate([0, 5+1*2, 1.5/2]),
								cylinder({ d : 1, h : 1.5, center: true }).translate([0, -5-0*2, 1.5/2]),
								cylinder({ d : 1, h : 1.5, center: true }).translate([0, -5-1*2, 1.5/2])
							)
						),
						singleHornPart,
						otherHornPart.rotateZ(180)
					);
				}
				
				horn = difference(
					horn,
					cylinder({ d : 2.5, h : 4, center: true }).translate([0,0,2])
				);
				
				model = union(
					model,
					horn.rotateX(180).translate([6, 6, 31])
				);
			}
		}

		if(this.parameters['center']) {
			model = model.translate([-6, -6, -31+4]);
		}

		return model.scale(this.printer['scale']);
	};
	
	this.getAxisOffsetX = function() {
		return 6 * this.printer['scale'];
	};
	this.getAxisOffsetY = function() {
		return 6 * this.printer['scale'];
	};
	this.getHornThicknessMax = function() {
		if(this.parameters['horn'] == 0) {
			return 0;
		} else {
			return 7;
		}
	};
	this.getHornMaxLength = function() {
		switch(this.parameters['horn']) {
			case 0:		return 0;
			case 1:		return 19.5;
			case 2:		return 32;
			case 3:		return 34.3;
			default:	alert("Unknown horn configuration"); return 0;
		}
	}
	this.getHornMaxWidth = function() {
		switch(this.parameters['horn']) {
			case 0:		return 0;
			case 1:		return 7;
			case 2:		return 7;
			case 3:		return 17;
			default:	alert("Unknown horn configuration"); return 0;
		}
	}
}
