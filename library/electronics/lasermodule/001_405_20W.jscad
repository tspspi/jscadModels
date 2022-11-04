/*
	20W laser module (including heat sink)

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
	Example usage:
	==============

	include('/mechanics/isothread.jscad');
	include('/electronics/lasermodule/001_405_20W.jscad');

	function main(params) {
		laser = new window.jscad.tspi.electronics.lasermodule.Module001_405nm_20W({}, {});
		return laser.getModel();
	}
*/


if(typeof window !== 'object') { window = new Object(); }
if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.electronics !== 'object') { window.jscad.tspi.electronics = new Object(); }
if(typeof window.jscad.tspi.electronics.lasermodule !== 'object') { window.jscad.tspi.electronics.lasermodule = new Object(); }

window.jscad.tspi.electronics.lasermodule.Module001_405nm_20W = function(printer, params) {
	knownPrinterParameters = [
		{ name: 'scale', 						type: 'number', 	default: 1 		},
		{ name: 'correctionInsideDiameter', 	type: 'number', 	default: 0 		},
		{ name: 'correctionOutsideDiameter', 	type: 'number', 	default: 0 		},
		{ name: 'resolutionCircle', 			type: 'number', 	default: 360 	},
	];
	knownParameters = [
		{ name: 'includePins',					type: 'boolean',	default: true		}
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

	this.screwM3 = new window.jscad.tspi.iso4762Screw( {}, { m : 3, l : 33/2, corehole : true, throughhole : false });
	this.screwM6 = new window.jscad.tspi.iso4762Screw( {}, { m : 6, l : 33/2, corehole : true, throughhole : false });

	this.getModel = function() {
		let optics = difference(
			cylinder({d : 15, h : 3.8, center : true}).translate([0,0,-3.8/2]),
			cylinder({d : 4, h : 3.8, center : true}).translate([0,0,-3.8/2])
		);

		// Model the heatsink
		let heatsink = cube({ size : [ 33, 33, 125 ], center : true }).translate([0,0,125/2]);
		// Fins on side
		heatsink = difference(heatsink, cube({ size : [4, 1, 125 ], center : true}).translate([+4/2 - 33/2, 0, 125/2]));
		heatsink = difference(heatsink, cube({ size : [4, 1, 125 ], center : true}).translate([-4/2 + 33/2, 0, 125/2]));
		for(i = 0; i < 5; i=i+1) {
			heatsink = difference(heatsink, cube({ size : [4, 1, 125 ], center : true}).translate([+4/2 - 33/2, 2 * (i+1), 125/2]));
			heatsink = difference(heatsink, cube({ size : [4, 1, 125 ], center : true}).translate([+4/2 - 33/2, -2 * (i+1), 125/2]));

			heatsink = difference(heatsink, cube({ size : [4, 1, 125 ], center : true}).translate([-4/2 + 33/2, 2 * (i+1), 125/2]));
			heatsink = difference(heatsink, cube({ size : [4, 1, 125 ], center : true}).translate([-4/2 + 33/2, -2 * (i+1), 125/2]));
		}

		for(i = 0; i < 4; i=i+1) {
			heatsink = difference(heatsink, cube({ size : [2, 1, 125 ], center : true }).translate([+1.5 + i * 2.5, -1/2 + 33/2, 125/2]));
			heatsink = difference(heatsink, cube({ size : [2, 1, 125 ], center : true }).translate([-1.5 - i * 2.5, -1/2 + 33/2, 125/2]));
		}

		/*
			"Drill" screw holes
		*/
		heatsink = difference(heatsink, cylinder({ d : this.screwM3.corehole, h : 33/2, center : true }).translate([0,0,33/4]).rotateX(90).translate([   0, 0, 4]))
		heatsink = difference(heatsink, cylinder({ d : this.screwM3.corehole, h : 33/2, center : true }).translate([0,0,33/4]).rotateX(90).translate([-9.5, 0, 4]))
		heatsink = difference(heatsink, cylinder({ d : this.screwM3.corehole, h : 33/2, center : true }).translate([0,0,33/4]).rotateX(90).translate([ 9.5, 0, 4]))

		heatsink = difference(heatsink, cylinder({ d : this.screwM3.corehole, h : 33/2, center : true }).translate([0,0,33/4]).rotateX(90).translate([  -8, 0, 10]))
		heatsink = difference(heatsink, cylinder({ d : this.screwM3.corehole, h : 33/2, center : true }).translate([0,0,33/4]).rotateX(90).translate([   8, 0, 10]))

		heatsink = difference(heatsink, cylinder({ d : this.screwM6.corehole, h : 33/2, center : true }).translate([0,0,33/4]).rotateX(90).translate([   0, 0, 31]))

		heatsink = difference(heatsink, cylinder({ d : this.screwM3.corehole, h : 33/2, center : true }).translate([0,0,33/4]).rotateX(90).translate([   0, 0, 44]))
		heatsink = difference(heatsink, cylinder({ d : this.screwM3.corehole, h : 33/2, center : true }).translate([0,0,33/4]).rotateX(90).translate([-9.5, 0, 44]))
		heatsink = difference(heatsink, cylinder({ d : this.screwM3.corehole, h : 33/2, center : true }).translate([0,0,33/4]).rotateX(90).translate([ 9.5, 0, 44]))

		heatsink = difference(heatsink, cylinder({ d : this.screwM3.corehole, h : 33/2, center : true }).translate([0,0,33/4]).rotateX(90).translate([  -8, 0, 49]))
		heatsink = difference(heatsink, cylinder({ d : this.screwM3.corehole, h : 33/2, center : true }).translate([0,0,33/4]).rotateX(90).translate([   8, 0, 49]))

		heatsink = difference(heatsink, cylinder({ d : this.screwM3.corehole, h : 33/2, center : true }).translate([0,0,33/4]).rotateX(90).translate([   0, 0, 55]))
		heatsink = difference(heatsink, cylinder({ d : this.screwM3.corehole, h : 33/2, center : true }).translate([0,0,33/4]).rotateX(90).translate([   0, 0, 69]))
		heatsink = difference(heatsink, cylinder({ d : this.screwM3.corehole, h : 33/2, center : true }).translate([0,0,33/4]).rotateX(90).translate([   0, 0, 86]))

		return union(
			heatsink.setColor([ 0.77, 0.77, 0.77 ]),
			optics.setColor([0.98, 0.73, 0.01])
		)
	}
	this.getTemplate = function() {
		return union(
			cube({ size : [ 33, 33, 125 ], center : true }).translate([0,0,125/2]),
			cylinder({d : 15, h : 3.8, center : true}).translate([0,0,-3.8/2])
		).setColor([0.77, 0.77, 0.77]);
	}
}
