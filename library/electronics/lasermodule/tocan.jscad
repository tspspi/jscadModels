/*
	TO-9 and TO-18 packages as described by JEDEC (maximum values used)
	to be used as templates when embedding laser diodes.

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

	include('/electronics/lasermodule/tocan.jscad');

	function main(params) {
		to18 = new window.jscad.tspi.electronics.lasermodule.tocan({}, {'TO' : 18, includePinExcludeArea : false});
		to9 = new window.jscad.tspi.electronics.lasermodule.tocan({}, {'TO' : 9, includePinExcludeArea : false});
		return union(
			to18.getModel(),
			to9.getModel().translate([10,0,0])
		);
	}
*/

if(typeof window !== 'object') { window = new Object(); }
if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.electronics !== 'object') { window.jscad.tspi.electronics = new Object(); }
if(typeof window.jscad.tspi.electronics.lasermodule !== 'object') { window.jscad.tspi.electronics.lasermodule = new Object(); }

window.jscad.tspi.electronics.lasermodule.tocan = function(printer, params) {
	let tospecs = {
		 9 : { 'A' : 6.60, 'F' : 3.94, 'l' : 12.7, 'l1' : 1.27, 'l2' : 6.35, 'b' : 0.533, 'b2' : 0.483, 'D' : 9.40, 'D1' : 8.51, 'e' : 5.08, 'e1' : 2.54, 'j' : 0, 'k' : 0, 'alpha' : 0 },
		 18 : { 'A' : 5.33, 'F' : 0.762, 'l' : 12.7, 'l1' : 1.27, 'l2' : 6.35, 'b' : 0.533, 'b2' : 0.483, 'D' : 5.84, 'D1' : 4.95, 'e' : 2.54, 'e1' : 1.27, 'j' : 1.17, 'k' : 1.22, 'alpha' : 45 }
	}

	knownPrinterParameters = [
		{ name: 'scale', 											type: 'number', 	default: 1 		},
		{ name: 'resolutionCircle', 					type: 'number', 	default: 360 	},
	];
	knownParameters = [
		{ name: 'TO',     type: 'number', default : 18  },

		{ name: 'includePins',							type: 'boolean',	default: true		},
		{ name: 'includePinExcludeArea',		type: 'boolean',	default: false		}
	]

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
	if(!(this.parameters['TO'] in tospecs)) {
		alert("Unknown spec for TO"+this.parameters['TO']);
		this.parameters['TO'] = 18;
	}

	for (const [key, value] of Object.entries(tospecs[this.parameters['TO']])) {
		this.parameters[key] = value;
	}

	this.model = new window.jscad.tspi.electronics.lasermodule.tocan_arb(printer, this.parameters);

	this.getModel = function() {
		return this.model.getModel();
	}
}

window.jscad.tspi.electronics.lasermodule.tocan_arb = function(printer, params) {
	knownPrinterParameters = [
		{ name: 'scale', 											type: 'number', 	default: 1 		},
		{ name: 'resolutionCircle', 					type: 'number', 	default: 360 	},
	];
	knownParameters = [
		{ name: 'A',     type: 'number', default : 5.33  },
		{ name: 'F',     type: 'number', default : 0.762 },
		{ name: 'l',     type: 'number', default : 12.7  },
		{ name: 'l1',    type: 'number', default : 1.27  },
		{ name: 'l2',    type: 'number', default : 6.35  },

		{ name: 'b',     type: 'number', default : 0.533 },
		{ name: 'b2',    type: 'number', default : 0.483 },
		{ name: 'D',     type: 'number', default : 5.84  },
		{ name: 'D1',    type: 'number', default : 4.95  },

		{ name: 'e',     type: 'number', default : 2.54  },
		{ name: 'e1',    type: 'number', default : 1.27  },

		{ name: 'j',     type: 'number', default : 1.17  },
		{ name: 'k',     type: 'number', default : 1.22  },
		{ name: 'alpha', type: 'number', default : 45    },

		{ name: 'includePins',							type: 'boolean',	default: true		},
		{ name: 'includePinExcludeArea',		type: 'boolean',	default: false		}
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
		let A = this.parameters['A'];
		let F = this.parameters['F'];
		let l = this.parameters['l'];
		let l1 = this.parameters['l1'];
		let l2 = this.parameters['l2'];
		let b = this.parameters['b'];
		let b2 = this.parameters['b2'];
		let D = this.parameters['D'];
		let D1 = this.parameters['D1'];
		let e = this.parameters['e'];
		let e1 = this.parameters['e1'];
		let j = this.parameters['j'];
		let k = this.parameters['k'];
		let alpha = this.parameters['alpha'];

		let fn = this.printer['resolutionCircle'];

		body = union(
			cylinder({d : D, h : F, center : true, fn : fn}).translate([0,0,F/2]),
			cylinder({d : D1, h : A, center : true, fn : fn}).translate([0,0,A/2])
		);
		if((k > 0) && (j > 0)) {
			body = union(
				body,
				cube({size : [j, k, F], center : true}).translate([0, -k/2 - D1/2, F/2]).rotateZ(-alpha)
			);
		}

		if(this.parameters['includePinExcludeArea']) {
			result = union(
				body.setColor([0.80, 0.80, 0.80]),
				cylinder({d : D1, h : l, center : true, fn : fn}).translate([0,0,-l/2]).setColor([0.88,0,0])
			);
		} else if(this.parameters['includePins']) {
			result = union(
				body.setColor([0.80, 0.80, 0.80]),
				cylinder({d : b,  h : l, center : true, fn : fn}).translate([0,(e - e1),-l/2]).setColor([0.88,0.88,0.88]),
				cylinder({d : b,  h : l, center : true, fn : fn}).translate([0,-e1,-l/2]).setColor([0.88,0.88,0.88]),
				cylinder({d : b,  h : l, center : true, fn : fn}).translate([e1,0,-l/2]).setColor([0.88,0.88,0.88])
			)
		} else {
			result = body.setColor([0.80, 0.80, 0.80]);
		}

		return result;
	}
}
