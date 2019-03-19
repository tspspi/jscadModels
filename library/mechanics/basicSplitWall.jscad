/*
	Basic split wall
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
if(typeof window.jscad.tspi.mechanics !== 'object') { window.jscad.tspi.mechanics = new Object(); }

window.jscad.tspi.mechanics.basicsplitwall = function(printer, params) {
	knownParameters = [
		{ name: 'l',							type: 'number',		default: -1 	},
		{ name: 'h',							type: 'number',		default: -1 	},
		{ name: 'd',							type: 'number',		default: -1 	},
		{ name: 'overlap',						type: 'number',		default: 5		},
		{ name: 'partSelect',					type: 'number',		default: 0		},
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
		/*
			Part selects part 1 or 2 or 0 for both
		*/
		if(this.parameters['partSelect'] == 0) {
			return cube({ size: [this.parameters['l'], this.parameters['h'], this.parameters['d']]});
		}

		if(this.parameters['partSelect'] == 1) {
			return union(
				cube({size: [this.parameters['l']/2 - this.parameters['overlap']/2, this.parameters['h'], this.parameters['d']]}),
				cube({size: [this.parameters['overlap']-this.printer['correctionInsideDiameter'], this.parameters['h'], this.parameters['d']/2-this.printer['correctionInsideDiameter']]}).translate([this.parameters['l']/2 - this.parameters['overlap']/2, 0, 0])
			);
		} else {
			return union(
				cube({size: [this.parameters['l']/2 - this.parameters['overlap']/2, this.parameters['h'], this.parameters['d']]}).translate([this.parameters['l']/2 + this.parameters['overlap']/2, 0, 0]),
				cube({size: [this.parameters['overlap'], this.parameters['h'], this.parameters['d']/2]}).translate([this.parameters['l']/2 - this.parameters['overlap']/2, 0, this.parameters['d']/2])
			);
		}
	}
}
