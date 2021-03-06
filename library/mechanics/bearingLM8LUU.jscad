/*
    LM8LUU linear ball bearing template

	This is a template for an LM8LUU ball bearing
	(see for example https://amzn.to/3nfPiFC - note: affiliate link, this codes author
	profits from qualified purchases)

    Note: Origin set set in center of bearing

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
    Infer an LM8LUU ball bearing centered along the
    z axis.

    Parameters:
        hollow                     true / false (default true)
        grooves                    true / false (default true)

    Printer parameters:
        resolutionCircle           default 32
	correctionInsideDiameter   default 0
	correctionOutsideDiameter  default 0
	scale                      default 1

    Example usage:
        include('/mechanics/bearingLM8LUU.jscad');

        function main() {
            return window.jscad.tspi.mechanics.bearings.LM8LUU({ resolutionCircle : 128}, { hollow : true, grooves : true });
        }
*/
if(typeof window !== 'object') { window = new Object(); }
if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.mechanics !== 'object') { window.jscad.tspi.mechanics = new Object(); }
if(typeof window.jscad.tspi.mechanics.bearings !== 'object') { window.jscad.tspi.mechanics.bearings = new Object(); }

window.jscad.tspi.mechanics.bearings.LM8LUU = function(printer, params) {
	let knownParameters = [
		{ name: 'hollow',						type: 'boolean',		default: true			},
		{ name: 'grooves',						type: 'boolean',		default: true			},
	];

	let knownPrinterParameters = [
		{ name: 'scale', 						type: 'number', 	default: 1 			},
		{ name: 'correctionInsideDiameter', 	type: 'number', 	default: 0 			},
		{ name: 'correctionOutsideDiameter', 	type: 'number', 	default: 0 			},
		{ name: 'resolutionCircle', 			type: 'number', 	default: 360		},
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

	this.printer = printer;
	this.params = params;

	this.getModel = function() {
		let id = 8;
		let od = 15;
		let od1 = 14.3;

		let L = 45;
		let w = 1.1;
		let B = 35;

		let printerScale = (this.printer['scale'] || 1);
		let printerCorrectionId = (this.printer['correctionInsideDiameter'] || 0);
		let printerCorrectionOd = (this.printer['correctionOutsideDiameter'] || 0);
		let fn = (this.printer['resolutionCircle'] || 32);

		let hollow = this.parameters['hollow'];
		let grooves = this.parameters['grooves'];

		let part = cylinder({ d : od+printerCorrectionOd, h : L, center : true, fn : fn });
		if(hollow) {
			part = difference(part, cylinder({ d : id-printerCorrectionId, h : L, center : true, fn : fn }));
		}
		part = part.setColor([0.9,0.9,0.9]);
		if(grooves) {
			let groove = difference(cylinder({d : od+printerCorrectionOd, h : w, center : true, fn : fn}), cylinder({d : od1-printerCorrectionId, h : w, center : true, fn : fn}));
			part = difference(part, groove.translate([0, 0, B/2-w/2]));
			part = difference(part, groove.translate([0, 0, -B/2+w/2]));
		}

		return part.scale(printerScale);
	};

	this.getTemplate = function() {
		let id = 8;
		let od = 15;
		let od1 = 14.3;

		let L = 45;
		let w = 1.1;
		let B = 35;

		let printerScale = (this.printer['scale'] || 1);
		let printerCorrectionId = (this.printer['correctionInsideDiameter'] || 0);
		let printerCorrectionOd = (this.printer['correctionOutsideDiameter'] || 0);
		let fn = (this.printer['resolutionCircle'] || 32);

		let part = cylinder({ d : od+printerCorrectionOd, h : L, center : true, fn : fn });
		part = part.setColor([0.9,0.9,0.9]);

		return part.scale(printerScale);
	};

	this.getOutsideDiameter = function() { return 15; }
	this.getLength = function() { return 45; }
	this.getGrooveDepth = function() { return 1.1; }
	this.getGrooveDistance = function() { return 35; }
};
