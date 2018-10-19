/*
	Lego/Duplo/etc. adapter library

	Can produce various Lego/Duplo interfaces.
	
	If you think this code was useful BTC
	contributions are welcome at
	19sKN38N4yxWZXoZeAdXZb5rq9xk32aDP4
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

/*
	Usage example:

	include('/toys/lego.jscad');

	function getParameterDefinitions() {
		return [
			{ name: 'grpLegoBrick', type: 'group', caption: 'Brick' },
			{ name: 'n', type: 'int', default: 4, caption: 'N' },
			{ name: 'm', type: 'int', default: 2, caption: 'M' },
			{ name: 'h', type: 'int', default: 1, caption: 'H' },
			{ name: 'planar', type: 'checkbox', checked: false, caption: 'Planar' },

			{ name: 'grpPrinter', type: 'group', caption: 'Printer' },
			{ name: 'scale', default: 1.0, type: 'float', caption: 'Scale' },
			{ name: 'correctionInsideDiameter', default: 1, type: 'float', caption: 'Inside diameter correction' },
			{ name: 'correctionOutsideDiameter', default: 0, type: 'float', caption: 'Outside diameter correction' },
			{ name: 'correctionInsideDiameterMoving', default: 0, type: 'float', caption: 'Inside diameter correction (moving)' },
			{ name: 'correctionOutsideDiameterMoving', default: 0, type: 'float', caption: 'Outside diameter correction (moving)' },
			{ name: 'resolutionCircle', default: 360, type: 'int', caption: 'Circle resolution (steps)' }
		];
	}

	function main(params) {
		var printer = params;
		var brickConfig = params;
		var brick4x4 = new window.jscad.tspi.toys.legoBrickBasis(printer, brickConfig);
		
		// Simple 2x4 lego brick:
		//	var brick = new window.jscad.tspi.toys.legoBrickBasis(printer, { n : 4, m : 2, type: 'lego' });
		// 2x4 planar lego brick:
		//	var brick = new window.jscad.tspi.toys.legoBrickBasis(printer, { n : 4, m : 2, planar: true, type: 'lego' });
		// 15x20er plane:
		//	var brick = new window.jscad.tspi.toys.legoBrickBasis(printer, { n : 15, m : 20, planar: true, type: 'lego' });
		// 2x4 brick, double height:
		//	var brick = new window.jscad.tspi.toys.legoBrickBasis(printer, { n : 15, m : 20, h : 2, type: 'lego' });

		return brick4x4.getModel();
	}
*/

if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.toys !== 'object') { window.jscad.tspi.toys = new Object(); }

window.jscad.tspi.toys.legoBrickBasis = function(printer, params) {
	knownPrinterParameters = [
		{ name: 'scale', 						type: 'number', 	default: 1 		},
		{ name: 'correctionInsideDiameter', 	type: 'number', 	default: 0 		},
		{ name: 'correctionOutsideDiameter', 	type: 'number', 	default: 0 		},
		{ name: 'resolutionCircle', 			type: 'number', 	default: 360 	},
	];
	knownParameters = [
		{ name: 'n',							type: 'number',		default: -1		},
		{ name: 'm',							type: 'number',		default: -1		},
		{ name: 'h',							type: 'number',		default: 1		},
		{ name: 'planar',						type: 'boolean',	default: false	},
		{ name: 'type',							type: 'string',		default: "lego"	},	/* lego, duplo, quatro, primo */
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

	switch(this.parameters['type']) {
		case 'lego':
			this.dimBasisX = 7.8;
			this.dimBasisY = 7.8;
			this.dimBasisZ = 9.6;
			this.wallThickness = 1.5;
			this.cylinderTopDiameter = 4.8;
			this.cylinderTopHeight = 1.7;
			this.cylinderTopWallThickness = 1.5/2;
			this.cylinderBottomDiameter = (Math.sqrt(7.8*7.8*2)-4.8);
			this.cylinderBottomWallThickness = 0.5;
			if(this.parameters['planar']) {
				this.dimBasisZ *= (1.0/3.0);
			}
			break;
		default:
			alert("Lego Library: Unsupported type "+this.parameters['type']);
			this.dimBasisX = 7.8;
			this.dimBasisY = 7.8;
			this.dimBasisZ = 9.6;
			this.wallThickness = 1.5;
			this.cylinderTopDiameter = 4.8;
			this.cylinderTopHeight = 1.7;
			this.cylinderTopWallThickness = 1.5/2;
			this.cylinderBottomDiameter = (Math.sqrt(7.8*7.8*2)-4.8);
			this.cylinderBottomWallThickness = 0.5;
			if(this.parameters['planar']) {
				this.dimBasisZ *= (1.0/3.0);
			}
			break;
	}
	
	this.getModel = function() {
		var parts = Array();
		var i;
		var j;
		
		parts.push(
			difference(
				cube({size: [ this.dimBasisX*this.parameters['n'], this.dimBasisY*this.parameters['m'], this.dimBasisZ*this.parameters['h'] ], center: false }),
				cube({size: [ this.dimBasisX*this.parameters['n']-2*this.wallThickness+this.printer['correctionInsideDiameter'], this.dimBasisY*this.parameters['m']-2*this.wallThickness+this.printer['correctionInsideDiameter'], this.dimBasisZ*this.parameters['h']-this.wallThickness ], center: false }).translate([this.wallThickness, this.wallThickness, 0])
			)
		);
		
		for(i = 0; i < this.parameters['n']; i++) {
			for(j = 0; j < this.parameters['m']; j++) {
				parts.push(cylinder( { r: this.cylinderTopDiameter/2.0, h: this.cylinderTopHeight, center: true }).translate([this.dimBasisX*i+this.dimBasisX/2, this.dimBasisY*j+this.dimBasisY/2, this.cylinderTopHeight / 2 + this.dimBasisZ*this.parameters['h']]));
			}
		}
		for(i = 0; i < this.parameters['n']-1; i++) {
			for(j = 0; j < this.parameters['m']-1; j++) {
				parts.push(difference(
					cylinder( { r: this.cylinderBottomDiameter/2.0, h: this.dimBasisZ*this.parameters['h'], center: true }).translate([this.dimBasisX*(i+1), this.dimBasisY*(j+1), (this.dimBasisZ*this.parameters['h'])/2]),
					cylinder( { r: this.cylinderBottomDiameter/2.0-this.cylinderBottomWallThickness, h: this.dimBasisZ*this.parameters['h'], center: true }).translate([this.dimBasisX*(i+1), this.dimBasisY*(j+1), (this.dimBasisZ*this.parameters['h'])/2])
				));
			}
		}
		
		return union(parts);
	}
}
