/*
	Mini template for HC-SR04 ultrasonic distance sensor breakout board
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
	--------------

	include('/electronics/ultrasonicsensors/hcsr04.jscad');

	function main() {
		let us = new window.jscad.tspi.electronics.UltrasonicSensors.HCSR04({}, { includePins : true });
		return us.getModel();
	}
*/

if(typeof window !== 'object') { window = new Object(); }
if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.electronics !== 'object') { window.jscad.tspi.electronics = new Object(); }
if(typeof window.jscad.tspi.electronics.UltrasonicSensors !== 'object') { window.jscad.tspi.electronics.UltrasonicSensors = new Object(); }

window.jscad.tspi.electronics.UltrasonicSensors.HCSR04  = function(printer, params) {
	knownPrinterParameters = [
		{ name: 'scale', 						type: 'number', 	default: 1 		},
		{ name: 'correctionInsideDiameter', 	type: 'number', 	default: 0 		},
		{ name: 'correctionOutsideDiameter', 	type: 'number', 	default: 0 		},
		{ name: 'resolutionCircle', 			type: 'number', 	default: 360 	},
	];
	knownParameters = [
		{ name: 'includePins',					type: 'boolean',	default: false }
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
		let obj = union(
			cylinder({ d : 16, h : 15, center : true, fn : this.printer['resolutionCircle'] }).translate([-13, 0, 15/2-9]).setColor([0.8,0.8,0.8]),
			cylinder({ d : 16, h : 15, center : true, fn : this.printer['resolutionCircle'] }).translate([13, 0, 15/2-9]).setColor([0.8,0.8,0.8]),
			cube({ size : [ 45, 21, 3], center : true}).translate([0,0,-3/2+6]).setColor([0,0.8,0])
		)

		if(this.parameters['includePins']) {
			obj = union(
				obj,
				cube({size : [10,11,3], center: true}).translate([0, 11/2+21/2-3, +3/2+6]).setColor([0,0,0])
			)
		}

		return obj;
	}
}
