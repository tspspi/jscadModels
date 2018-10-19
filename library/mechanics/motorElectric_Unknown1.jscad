/*
	DC 6V 16000rpm 2mm Dia Shaft
	Unknown manufacturer

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
	Usage example
	-------------
	
	include('/mechanics/motorElectric_Unknown1.jscad');

	var printerSettings = {
	   'scale' : 1.0,
	   'correctionInsideDiameter': 1,
	   'correctionOutsideDiameter': 0,
	   'correctionInsideDiameterMoving': 0,
	   'correctionOutsideDiameterMoving': 0,
	   'resolutionCircle': 360
	};

	function main() {
		var motor = new window.jscad.tspi.mechanics.motorElectric_Unknown1(printerSettings, {
			shaft: true
		});
		
		return difference(
			cube({size: [25,20,10],center:[true,true,false]}),
			motor.getModel()
		);
	}
*/

if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.mechanics !== 'object') { window.jscad.tspi.mechanics = new Object(); }

window.jscad.tspi.mechanics.motorElectric_Unknown1 = function(printer, params) {
	knownParameters = [
		{ name: 'shaft',						type: 'boolean',	default: true	},
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

	this.getModel = function() {
		var motorCasing = union(
			difference(
				union(
					cylinder({r : 20/2+(this.printer.correctionInsideDiameter/2), h: 25, center: true, fn: this.printer.resolutionCircle}).translate([0, 0, 25/2]),
					cylinder({r : 6/2+(this.printer.correctionInsideDiameter/2), h: 2, center: true, fn: this.printer.resolutionCircle}).translate([0,0,-1]),
					cylinder({r : 10/2+(this.printer.correctionInsideDiameter/2), h:2, center: true, fn: this.printer.resolutionCircle}).translate([0,0,25+1])
				),
				union(
					cube({size: [20, 20, 25], center: false}).translate([-10, 15/2+(this.printer.correctionInsideDiameter/2), 0]),
					cube({size: [20, 20, 25], center: false}).translate([-10, -15/2-20-(this.printer.correctionInsideDiameter/2), 0])
				)
			),
			cube({size: [16, 2, 5]}).translate([-8, -15/2-2, -5+25])
		);
		
		if(this.parameters.shaft) {
			var shaft = cylinder({r : 1+(this.printer.correctionInsideDiameter/2), h: 38, center: true, fn: this.printer.resolutionCircle}).translate([0,0,+38/2-9]).setColor([1,0,0]);
		}
		
		return union(
			motorCasing,
			shaft
		).scale(this.printer.scale);
	}
}
