/*
	HY86N forked light barrier model
	
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
	--------------
	
	include('/electronics/forkedlightbarrier/hy86n.jscad');
	
	function main(params) {
		// We can specify an wireKeepoutZone additionally to the wires that are normally modeled
		// This can be used to keep an area around the wires that's not filled when used as template

		var barrier = new window.jscad.tspi.electronics.ForkedLightBarrier.HY86N({}, {
			'wireKeepoutZone': 1
		});
	
		return barrier.getModel();
	}

*/

if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.electronics !== 'object') { window.jscad.tspi.electronics = new Object(); }
if(typeof window.jscad.tspi.electronics.ForkedLightBarrier !== 'object') { window.jscad.tspi.electronics.ForkedLightBarrier = new Object(); }

window.jscad.tspi.electronics.ForkedLightBarrier.HY86N = function(printer, params) {
	knownPrinterParameters = [
		{ name: 'scale', 						type: 'number', 	default: 1 		},
		{ name: 'correctionInsideDiameter', 	type: 'number', 	default: 0 		},
		{ name: 'correctionOutsideDiameter', 	type: 'number', 	default: 0 		},
		{ name: 'resolutionCircle', 			type: 'number', 	default: 360 	},
	];
	knownParameters = [
		{ name: 'includePins',					type: 'boolean',	default: true	},
		{ name: 'wireKeepoutZone',				type: 'number',		default: 0		}		/* Radius around wires that should also account to "wire" model */
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
		var obj = difference(
			cube({size: [11+this.printer.correctionOutsideDiameter, 6+this.printer.correctionOutsideDiameter, 11+this.printer.correctionOutsideDiameter]}).translate([-(this.printer.correctionOutsideDiameter/2), -(this.printer.correctionOutsideDiameter/2), -(this.printer.correctionOutsideDiameter/2)]),
			cube({size: [3+this.printer.correctionInsideDiameter, 6+this.printer.correctionInsideDiameter, 11-2.5+this.printer.correctionInsideDiameter]}).translate([4-(this.printer.correctionInsideDiameter/2), -(this.printer.correctionInsideDiameter/2), 2.5-(this.printer.correctionInsideDiameter/2)])
		).setColor(0,0,0);

		if(this.parameters.includePins) {
			obj = union(
				obj,
				cube({size: [0.5+this.printer.correctionInsideDiameter, 0.5+this.printer.correctionInsideDiameter, 6+this.printer.correctionInsideDiameter]}).translate([2-(this.printer.correctionInsideDiameter/2), 2-(this.printer.correctionInsideDiameter/2), -1*(6+this.printer.correctionInsideDiameter)]).setColor([1,0,0]),
				cube({size: [0.5+this.printer.correctionInsideDiameter, 0.5+this.printer.correctionInsideDiameter, 6+this.printer.correctionInsideDiameter]}).translate([11-(2-(this.printer.correctionInsideDiameter/2)), 2-(this.printer.correctionInsideDiameter/2), -1*(6+this.printer.correctionInsideDiameter)]).setColor([1,0,0]),
				cube({size: [0.5+this.printer.correctionInsideDiameter, 0.5+this.printer.correctionInsideDiameter, 6+this.printer.correctionInsideDiameter]}).translate([2-(this.printer.correctionInsideDiameter/2), 6-(2-(this.printer.correctionInsideDiameter/2)), -1*(6+this.printer.correctionInsideDiameter)]).setColor([1,0,0]),
				cube({size: [0.5+this.printer.correctionInsideDiameter, 0.5+this.printer.correctionInsideDiameter, 6+this.printer.correctionInsideDiameter]}).translate([11-(2-(this.printer.correctionInsideDiameter/2)), 6-(2-(this.printer.correctionInsideDiameter/2)), -1*(6+this.printer.correctionInsideDiameter)]).setColor([1,0,0])
			);

			if(this.parameters.wireKeepoutZone > 0) {
				obj = union(
					obj,
					cube({size: [0.5+this.printer.correctionInsideDiameter+2*this.parameters.wireKeepoutZone, 0.5+this.printer.correctionInsideDiameter+2*this.parameters.wireKeepoutZone, 6+this.printer.correctionInsideDiameter+2*this.parameters.wireKeepoutZone]}).translate([2-(this.printer.correctionInsideDiameter/2)-this.parameters.wireKeepoutZone, 2-(this.printer.correctionInsideDiameter/2)-this.parameters.wireKeepoutZone, -1*(6+this.printer.correctionInsideDiameter)-this.parameters.wireKeepoutZone]).setColor([1,0,0]),
					cube({size: [0.5+this.printer.correctionInsideDiameter+2*this.parameters.wireKeepoutZone, 0.5+this.printer.correctionInsideDiameter+2*this.parameters.wireKeepoutZone, 6+this.printer.correctionInsideDiameter+2*this.parameters.wireKeepoutZone]}).translate([11-(2-(this.printer.correctionInsideDiameter/2))-this.parameters.wireKeepoutZone, 2-(this.printer.correctionInsideDiameter/2)-this.parameters.wireKeepoutZone, -1*(6+this.printer.correctionInsideDiameter)-this.parameters.wireKeepoutZone]).setColor([1,0,0]),
					cube({size: [0.5+this.printer.correctionInsideDiameter+2*this.parameters.wireKeepoutZone, 0.5+this.printer.correctionInsideDiameter+2*this.parameters.wireKeepoutZone, 6+this.printer.correctionInsideDiameter+2*this.parameters.wireKeepoutZone]}).translate([2-(this.printer.correctionInsideDiameter/2)-this.parameters.wireKeepoutZone, 6-(2-(this.printer.correctionInsideDiameter/2))-this.parameters.wireKeepoutZone, -1*(6+this.printer.correctionInsideDiameter)-this.parameters.wireKeepoutZone]).setColor([1,0,0]),
					cube({size: [0.5+this.printer.correctionInsideDiameter+2*this.parameters.wireKeepoutZone, 0.5+this.printer.correctionInsideDiameter+2*this.parameters.wireKeepoutZone, 6+this.printer.correctionInsideDiameter+2*this.parameters.wireKeepoutZone]}).translate([11-(2-(this.printer.correctionInsideDiameter/2))-this.parameters.wireKeepoutZone, 6-(2-(this.printer.correctionInsideDiameter/2))-this.parameters.wireKeepoutZone, -1*(6+this.printer.correctionInsideDiameter)-this.parameters.wireKeepoutZone]).setColor([1,0,0])
				);
			}
		}

		return obj.scale(this.printer.scale);
	}
}