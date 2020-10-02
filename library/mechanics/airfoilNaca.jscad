/*
	Implementation of NACA 4 digit airfoils in OpenJSCAD
	
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

	include('/mechanics/airfoilNaca.jscad');
	
	function getParameterDefinitions() {
		return [
			{ name: 'maxCamber', type: 'float', initial: 2, caption: "Maximum camber (first digit)" },
			{ name: 'maxPosition', type: 'float', initial: 4, caption: "Maximum position in ten-percent (second digit)" },
			{ name: 'maxThickness', type: 'float', initial: 15, caption: "Max Thickness (percent; third and forth digit)" },


			{ name: 'length', type: 'float', initial: 5, caption: "Length" },
			{ name: 'width', type: 'float', initial: 20, caption: "Extension (width)" },
			{ name: 'fn', type: 'float', initial: 100, caption: "Sampling steps" }
		];
	}
		
	function main(params) {
		var airfoil = new window.jscad.tspi.airfoils.naca4({}, {
			maxCamber    : params['maxCamber'],
			maxPosition  : params['maxPosition'],
			maxThickness : params['maxThickness'],
			length       : params['length'],
			width        : params['width'],
			fn           : params['fn']
		});
		
		return airfoil.getModel();
	}
*/

if(typeof window !== 'object') { window = new Object(); }
if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.airfoils !== 'object') { window.jscad.tspi.airfoils = new Object(); }

window.jscad.tspi.airfoils.naca4 = function(printer, params) {
	let knownParameters = [
		{ name : 'maxCamber',					type : 'number',	default: 2				},		// Maximum camber
		{ name : 'maxPosition',					type : 'number',	default: 4				},		// Position of maximum thickness
		{ name : 'maxThickness',				type : 'number',	default: 15				},		// Maximum camber thickness in relation to length

		{ name : 'length',						type : 'number',	default: 5				},
		{ name : 'width',						type : 'number',	default: 20				},
		{ name : 'fn',							type : 'number',	default: 20				}
	];
	let knownPrinterParameters = [
		{ name: 'scale', 						type: 'number', 	default: 1 				}
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

	/*
		Calculation functions
	*/
	
	this.nacaYC = function(x, maxCamber, maxPosition, maxThickness) {
		let m = (maxCamber / 100.0);
		let p = (maxPosition / 10.0);
		let t = (maxThickness / 100.0);

		if(x < p) {
			return m / (p*p) * (2 * p * x - x * x);
		} else {
			return m / ((1-p)*(1-p)) * ((1-2*p) + 2*p*x - x*x);
		}
	}

	this.nacaYCDiff = function(x, maxCamber, maxPosition, maxThickness) {
		let m = (maxCamber / 100.0);
		let p = (maxPosition / 10.0);
		let t = (maxThickness / 100.0);

		if(x < p) {
			return m / (p*p) * (2 * p - 2 * x);
		} else {
			return m / ((1-p)*(1-p)) * (2*p - 2 * x);
		}
	}

	this.nacaYT = function(x, maxThickness) {
		let t = (maxThickness / 100.0);

		return t / 0.2 * (0.2969 * Math.sqrt(x) - 0.1260 * x - 0.3516 * x * x + 0.2843 * x * x * x - 0.1015 * x * x * x * x);
	}

	this.nacaCAG = function(length, maxCamber, maxPositon, maxThickness, fn) {
		let pnts = [];
		let step = length / fn;

		for(let i = 0; i <= fn; i=i+1) {
			let x = (i*step) / length;
			let yt = this.nacaYT(x, maxThickness);

			let theta = Math.atan(this.nacaYCDiff(x, maxCamber, maxPositon, maxThickness));

			let xu = x - yt * Math.sin(theta);
			let yu = this.nacaYC(x, maxCamber, maxPositon, maxThickness) + yt * Math.cos(theta);

			pnts.push([xu*length, yu*length]);
		}

		for(let i = fn-1; i > 0; i--) {
			let x = (i*step) / length;
			let yt = this.nacaYT(x, maxThickness);
			let theta = Math.atan(this.nacaYCDiff(x, maxCamber, maxPositon, maxThickness));

			let xl = x + yt * Math.sin(theta);
			let yl = this.nacaYC(x, maxCamber, maxPositon, maxThickness) - yt * Math.cos(theta);

			pnts.push([xl*length, yl*length]);
		}

		return CAG.fromPoints(pnts);
	}

	this.naca = function(length, width, maxCamber, maxPositon, maxThickness, fn) {
		return linear_extrude({ height : width }, this.nacaCAG(length, maxCamber, maxPositon, maxThickness, fn));
	}


	this.getModel = function() {
		return this.naca(
			this.parameters['length'],
			this.parameters['width'],
			this.parameters['maxCamber'],
			this.parameters['maxPosition'],
			this.parameters['maxThickness'],
			this.parameters['fn']
		).scale(this.printer['scale']);
	}
}

