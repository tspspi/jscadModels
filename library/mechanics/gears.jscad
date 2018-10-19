/*
	Gears library.
	
	Provides involute gears.
*/

/*
	Redistribution and use in source and binary forms, with or without
	modification, are permitted provided that the following conditions are met:

	1. Redistributions of source code must retain the above copyright notice, this
	   list of conditions and the following disclaimer.

	2. Redistributions in binary form must reproduce the above copyright notice,
	   this list of conditions and the following disclaimer in the documentation
	   and/or other materials provided with the distribution.

	3. Neither the name of the copyright holder nor the names of its
	   contributors may be used to endorse or promote products derived from
	   this software without specific prior written permission.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
	AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
	FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
	DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
	SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
	CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
	OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
	OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }

/*
	Usage example:
	--------------
	
	include("/mechanics/gears.jscad");

	var printerSettings = {
	   'scale' : 1.0,
	   'correctionInsideDiameter': 0,
	   'correctionOutsideDiameter': 0,
	   'correctionInsideDiameterMoving': 0,
	   'correctionOutsideDiameterMoving': 0,
	   'resolutionCircle': 360
	};
	 
	function getParameterDefinitions() {
		return [
			{ name: 'gearModule', caption: 'Gear module', type: 'float', default: 0.15 },
			{ name: 'gearTeethNumber', caption: 'Number of teeth', type: 'int', default: 15 },
			{ name: 'gearThickness', caption: 'Thickness', type: 'float', default: 3 },
			{ name: 'gearCenterholeRadius', caption: 'Centerhole radius', type: 'float', default: 3 },
			{ name: 'gearInclination', caption: 'Inclination', type: 'float', default: 0 },
			{ name: 'gearInclinationSteps', caption: 'Inclination steps', type: 'float', default: 25 }
		];
	}
	 
	function main(params) {
		var gear = new window.jscad.tspi.involuteGear(printerSettings, {
			'module' : params.gearModule,
			'teethNumber': params.gearTeethNumber,
			'thickness' : params.gearThickness,
			'centerholeRadius': params.gearCenterholeRadius,
			'inclination': params.gearInclination,
			'inclinationSteps': params.gearInclinationSteps
		});
		var gear2 = new window.jscad.tspi.involuteGear(printerSettings, {
			'module' : params.gearModule,
			'teethNumber': params.gearTeethNumber,
			'thickness' : params.gearThickness,
			'centerholeRadius': params.gearCenterholeRadius,
			'inclination': -1*params.gearInclination,
			'inclinationSteps': params.gearInclinationSteps
		});
	 
		return union(
			gear.getModel(),
			gear2.getModel().rotateX(0).rotateZ(-1.65).translate([0,gear.pitchRadius + gear2.pitchRadius, 0])
		);
	}
*/

window.jscad.tspi.involuteGear = function(printer, params) {
	knownParameters = [
		{ name: 'teethNumber',			type: 'number',					default: -1				},
		{ name: 'module',				type: 'number',					default: 1				},
		{ name: 'pressureAngle',		type: 'number',					default: 20				},
		{ name: 'clearance',			type: 'number',					default: 0				},
		{ name: 'thickness',			type: 'number',					default: -1				},
		{ name: 'centerholeRadius',		type: 'number',					default: 0				},
		{ name: 'resolution',			type: 'number',					default: 5				},
		{ name: 'inclination',			type: 'number',					default: 0				},
		{ name: 'inclinationSteps',		type: 'number',					default: 25				}
	];

	knownPrinterParameters = [
		{ name: 'scale', 						type: 'number', 	default: 1 		},
		{ name: 'correctionInsideDiameter', 	type: 'number', 	default: 0 		},
		{ name: 'correctionOutsideDiameter', 	type: 'number', 	default: 0 		},
		{ name: 'resolutionCircle', 			type: 'number', 	default: 360 	},
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

	this.resolution					= this.parameters['resolution'];
	this.thickness					= this.parameters['thickness'];
	this.inclination				= this.parameters['inclination'];
	this.inclinationSteps			= this.parameters['inclinationSteps'];

	this.module						= this.parameters['module'];
	this.circularPitch				= this.module * Math.PI;
	this.pressureAngle				= this.parameters['pressureAngle'];
	this.teethNumber				= this.parameters['teethNumber'];
	this.clearance					= this.parameters['clearance'];

	this.centerholeRadius			= this.parameters['centerholeRadius'] + (this.printer['correctionInsideDiameter'] / 2.0);

	this.pitchDiameter				= this.teethNumber / this.circularPitch;
	this.pitchRadius				= this.pitchDiameter / 2.0;
	this.baseCircleDiameter			= this.pitchDiameter * Math.cos(this.pressureAngle * Math.PI/180.0);
	this.baseCircleRadius			= this.baseCircleDiameter / 2.0;
	this.addendum					= 1.0 / this.circularPitch;
	this.dedendum					= this.addendum - this.clearance;
	this.outsideDiameter			= this.pitchDiameter + 2*this.addendum;
	this.outsideRadius				= this.outsideDiameter / 2.0;
	this.rootDiameter				= this.pitchDiameter - 2*this.dedendum;
	this.rootRadius					= this.rootDiameter / 2.0;

	this.getModel = function() {
		var maxTangentLength = Math.sqrt(this.outsideRadius*this.outsideRadius - this.baseCircleRadius*this.baseCircleRadius);
		var maxAngle = maxTangentLength / this.baseCircleRadius;

		var angle;
		var currentAngle;
		var currentTangentLength;
		var radialVector;
		var tangentialVector;
		var point;

		var points = [ ];
		points.push(new CSG.Vector2D(0,0));

		for(var i = 0; i <= this.resolution; i++) {
			currentAngle = maxAngle * i / this.resolution;
			currentTangentLength = currentAngle * this.baseCircleRadius;

			radialVector = CSG.Vector2D.fromAngle(currentAngle);
			tangentialVector = radialVector.normal();
			point = radialVector.times(this.baseCircleRadius).plus(tangentialVector.times(currentTangentLength));

			points.push(point);
		}

		var tangentAtPitchCircle = Math.sqrt(this.pitchRadius*this.pitchRadius - this.baseCircleRadius*this.baseCircleRadius);
		var angleAtPitchCircle = tangentAtPitchCircle / this.baseCircleRadius;
		var angularDifference = angleAtPitchCircle - Math.atan(angleAtPitchCircle);
		var angularToothWidthBase = Math.PI / this.teethNumber + 2 * angularDifference;

		for(i = this.resolution; i >= 0; i--) {
			currentAngle = maxAngle * i / this.resolution;
			currentTangentLength = currentAngle * this.baseCircleRadius;

			radialVector = CSG.Vector2D.fromAngle(angularToothWidthBase - currentAngle);
			tangentialVector = radialVector.normal().negated();
			point = radialVector.times(this.baseCircleRadius).plus(tangentialVector.times(currentTangentLength));
			points.push(point);
        }

		var singleTooth;

		if(this.inclination != 0) {
			// singleTooth = (new CSG.Polygon2D(points)).rotateExtrude({ offset: [0, 0, this.thickness], angle: this.inclination });
			var twistAngle = this.thickness * Math.tan(this.inclination * Math.PI/180.0) * 180 / (this.pitchRadius * Math.PI);
			singleTooth = (new CSG.Polygon2D(points)).extrude({ offset: [0, 0, this.thickness], twistangle: twistAngle, twiststeps: this.inclinationSteps});
		} else {
			singleTooth = (new CSG.Polygon2D(points)).extrude({ offset: [0, 0, this.thickness]});
		}

		var teeth = new CSG();
		for(i = 0; i < this.teethNumber; i++) {
			angle = i * 360 / this.teethNumber;
			teeth = teeth.unionForNonIntersecting(singleTooth.rotateZ(angle));
		}

		// Root circle also out of points

		points = [];
		var toothAngle = 2 * Math.PI / this.teethNumber;
		var toothCenterAngle = 0.5 * angularToothWidthBase;
		for(i = 0; i < this.teethNumber; i++) {
			angle = toothCenterAngle + i * toothAngle;
			points.push(CSG.Vector2D.fromAngle(angle).times(this.rootRadius));
		}
		var rootcircle = new CSG.Polygon2D(points).extrude({offset: [0, 0, this.thickness]});

		var gear = rootcircle.union(teeth);
		var result;
		if(this.centerholeRadius > 0) {
			result = difference(
				gear.translate([0,0,-this.thickness/2.0]),
				cylinder({ r : this.centerholeRadius, h : 3*this.thickness, center: true })
			);
		} else {
			result = gear.translate([0,0,-this.thickness/2.0]);
		}
		return result.rotateZ(-360 / (4 * this.teethNumber));
	};
}
