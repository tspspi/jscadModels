/*
	ISO Threads library.

	Currently implements:
		Nut Templates (without threading; Inside diameter correction currently affects
					   outside diameter because it's an template)
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
	Example:

	include('/mechanics/isothread.jscad');

	function getParameterDefinitions() {
		return [
			{ name: 'm', type: 'float', initial: 8, caption: "M" },
			{ name : 'correctionInsideDiameter', type : 'float', initial : 0, caption : 'Inside diameter correction' },
			{ name : 'correctionOutsideDiameter', type : 'float', initial : 0, caption : 'Outside diameter correction' },
			{ name : 'scale' , type : 'float' , initial : 1, caption : 'Scale' }
		];
	}

	function main(params) {
		var nut = new window.jscad.tspi.isoNut( params, { m : params.m  });
		return nut.getModel();
	}
*/

if(typeof window === 'undefined') { window = new Object(); }
if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }

window.jscad.tspi.isoNut = function(printer, params) {
	knownParameters = [
		{ name: 'm',				type: 'number',					default: -1				},
		{ name: 'norm',				type: 'string',					default: "iso4032"			},
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

	this.metricScrewDimensionsDIN912_ISO4762 = [
		{ m : 1.4, dk : 2.6,   k : 1.4, s : 1.3, b : 10, d : 1.4},
		{ m : 1.6, dk : 3,     k : 1.6, s : 1.5, b : 12, d : 1.6},
		{ m : 2,   dk : 3.8,   k : 2,   s : 1.5, b : 14, d : 2  },
		{ m : 2.5, dk : 4.5,   k : 2.5, s : 2,   b : 16, d : 2.5},
		{ m : 3,   dk : 5.68,  k : 3,   s : 2.5, b : 18, d : 3  },
		{ m : 4,   dk : 7.22,  k : 4,   s : 3,   b : 20, d : 4  },
		{ m : 5,   dk : 8.72,  k : 5,   s : 4,   b : 22, d : 5  },
		{ m : 6,   dk : 10.22, k : 6,   s : 5,   b : 24, d : 6  },
		{ m : 8,   dk : 13.27, k : 8,   s : 6,   b : 28, d : 8  },
		{ m : 10,  dk : 16.27, k : 10,  s : 8,   b : 32, d : 10 },
		{ m : 12,  dk : 18.27, k : 12,  s : 10,  b : 36, d : 12 },
		{ m : 14,  dk : 21.33, k : 14,  s : 12,  b : 40, d : 14 },
		{ m : 16,  dk : 24.33, k : 16,  s : 14,  b : 44, d : 16 },
		{ m : 18,  dk : 27.33, k : 18,  s : 14,  b : 48, d : 18 },
		{ m : 20,  dk : 30.33, k : 20,  s : 17,  b : 52, d : 20 },
		{ m : 24,  dk : 36.39, k : 24,  s : 19,  b : 60, d : 24 }
	];

	this.metricDimensions = [
		{ m :  1  , s :  2.5, hISO4032 : -1  , hDIN934 :  0.8, ISO4035 : -1   , corehole :  0.75 , throughhole_fine :  1.1 , throughhole_medium :  1.2 , throughhole_coarse :  1.3 },
		{ m :  1.2, s :  3  , hISO4032 : -1  , hDIN934 :  1.0, ISO4035 : -1   , corehole :  0.95 , throughhole_fine :  1.3 , throughhole_medium :  1.4 , throughhole_coarse :  1.5 },
		{ m :  1.4, s :  3  , hISO4032 : -1  , hDIN934 :  1.2, ISO4035 :  1.0 , corehole : -1    , throughhole_fine :  1.5 , throughhole_medium :  1.6 , throughhole_coarse :  1.8 },
		{ m :  1.6, s :  3.2, hISO4032 :  1.3, hDIN934 :  1.3, ISO4035 :  1.0 , corehole :  1.25 , throughhole_fine :  1.7 , throughhole_medium :  1.8 , throughhole_coarse :  2.0 },
		{ m :  2  , s :  4  , hISO4032 :  1.6, hDIN934 :  1.6, ISO4035 :  1.2 , corehole :  1.6  , throughhole_fine :  2.2 , throughhole_medium :  2.4 , throughhole_coarse :  2.6 },
		{ m :  2.5, s :  5  , hISO4032 :  2.0, hDIN934 :  2.0, ISO4035 :  1.6 , corehole :  2.05 , throughhole_fine :  2.7 , throughhole_medium :  2.9 , throughhole_coarse :  3.1 },
		{ m :  3  , s :  5.5, hISO4032 :  2.4, hDIN934 :  2.4, ISO4035 :  1.8 , corehole :  2.5  , throughhole_fine :  3.2 , throughhole_medium :  3.4 , throughhole_coarse :  3.6 },
		{ m :  3.5, s :  6  , hISO4032 :  2.8, hDIN934 :  2.8, ISO4035 :  2.0 , corehole : -1    , throughhole_fine :  3.7 , throughhole_medium :  3.9 , throughhole_coarse :  4.2 },
		{ m :  4  , s :  7  , hISO4032 :  3.2, hDIN934 :  3.2, ISO4035 :  2.2 , corehole :  3.3  , throughhole_fine :  4.3 , throughhole_medium :  4.5 , throughhole_coarse :  4.8 },
		{ m :  5  , s :  8  , hISO4032 :  4.7, hDIN934 :  4.0, ISO4035 :  2.7 , corehole :  4.2  , throughhole_fine :  5.3 , throughhole_medium :  5.5 , throughhole_coarse :  5.8 },
		{ m :  6  , s : 10  , hISO4032 :  5.2, hDIN934 :  5.0, ISO4035 :  3.2 , corehole :  5    , throughhole_fine :  6.4 , throughhole_medium :  6.6 , throughhole_coarse :  7.0 },
		{ m :  8  , s : 13  , hISO4032 :  6.8, hDIN934 :  6.5, ISO4035 :  4.0 , corehole :  6.8  , throughhole_fine :  8.4 , throughhole_medium :  9.0 , throughhole_coarse : 10.0 },
		{ m : 10  , s : 16  , hISO4032 :  8.4, hDIN934 :  8.0, ISO4035 :  5.0 , corehole :  8.5  , throughhole_fine : 10.5 , throughhole_medium : 11.0 , throughhole_coarse : 12.0 },
		{ m : 12  , s : 18  , hISO4032 : 10.8, hDIN934 : 10.0, ISO4035 :  6.0 , corehole : 10.2  , throughhole_fine : 13.0 , throughhole_medium : 13.5 , throughhole_coarse : 14.5 },
		{ m : 14  , s : 21  , hISO4032 : 12.8, hDIN934 : 11.0, ISO4035 :  7.0 , corehole : -1    , throughhole_fine : 15.0 , throughhole_medium : 15.5 , throughhole_coarse : 16.5 },
		{ m : 16  , s : 24  , hISO4032 : 14.8, hDIN934 : 13.0, ISO4035 :  8.0 , corehole : 14    , throughhole_fine : 17.0 , throughhole_medium : 17.5 , throughhole_coarse : 18.5 },
		{ m : 18  , s : 27  , hISO4032 : 15.8, hDIN934 : 15.0, ISO4035 :  9.0 , corehole : -1    , throughhole_fine : 19.0 , throughhole_medium : 20.0 , throughhole_coarse : 21.0 },
		{ m : 20  , s : 30  , hISO4032 : 18.0, hDIN934 : 16.0, ISO4035 : 10.0 , corehole : 17.5  , throughhole_fine : 21.0 , throughhole_medium : 22.0 , throughhole_coarse : 24.0 },
		{ m : 22  , s : 34  , hISO4032 : 19.4, hDIN934 : 18.0, ISO4035 : 11.0 , corehole : -1    , throughhole_fine : 23.0 , throughhole_medium : 24.0 , throughhole_coarse : 26.0 },
		{ m : 24  , s : 36  , hISO4032 : 21.5, hDIN934 : 19.0, ISO4035 : 12.0 , corehole : 21    , throughhole_fine : 25.0 , throughhole_medium : 26.0 , throughhole_coarse : 28.0 },
		{ m : 30  , s : 46  , hISO4032 : 25.6, hDIN934 : 24.0, ISO4035 : 15.0 , corehole : 26.5  , throughhole_fine : 31.0 , throughhole_medium : 33.0 , throughhole_coarse : 35.0 },
		{ m : 33  , s : 50  , hISO4032 : 28.7, hDIN934 : 26.0, ISO4035 : 16.5 , corehole : -1    , throughhole_fine : 34.0 , throughhole_medium : 36.0 , throughhole_coarse : 38.0 },
		{ m : 36  , s : 55  , hISO4032 : 31.0, hDIN934 : 29.0, ISO4035 : 18.0 , corehole : 32    , throughhole_fine : 37.0 , throughhole_medium : 39.0 , throughhole_coarse : 42.0 },
		{ m : 39  , s : 60  , hISO4032 : 33.4, hDIN934 : 31.0, ISO4035 : 19.5 , corehole : -1    , throughhole_fine : 40.0 , throughhole_medium : 42.0 , throughhole_coarse : 44.0 },
		{ m : 42  , s : 65  , hISO4032 : 34.0, hDIN934 : 34.0, ISO4035 : 21.0 , corehole : 37.5  , throughhole_fine : 43.0 , throughhole_medium : 45.0 , throughhole_coarse : 48.0 },
		{ m : 45  , s : 70  , hISO4032 : 36.0, hDIN934 : 36.0, ISO4035 : 22.5 , corehole : -1    , throughhole_fine : 46.0 , throughhole_medium : 48.0 , throughhole_coarse : 52.0 },
		{ m : 48  , s : 75  , hISO4032 : 38.0, hDIN934 : 38.0, ISO4035 : 24.0 , corehole : 43    , throughhole_fine : 49.0 , throughhole_medium : 52.0 , throughhole_coarse : 56.0 },
		{ m : 52  , s : 80  , hISO4032 : 42.0, hDIN934 : 42.0, ISO4035 : 26.0 , corehole : -1    , throughhole_fine : 53.0 , throughhole_medium : 57.0 , throughhole_coarse : 60.0 },
		{ m : 56  , s : 85  , hISO4032 : 45.0, hDIN934 :  -1 , ISO4035 : 28.0 , corehole : 50.5  , throughhole_fine : 57.0 , throughhole_medium : 62.0 , throughhole_coarse : 66.0 },
		{ m : 64  , s : 95  , hISO4032 : 51.0, hDIN934 :  -1 , ISO4035 : 32.0 , corehole : 58    , throughhole_fine : 65.0 , throughhole_medium : 70.0 , throughhole_coarse : 74.0 }
	];

	this.getNormParameter = function(m) {
		for(i = 0; i < this.metricDimensions.length; i++) {
			if(this.metricDimensions[i].m == m) {
				return this.metricDimensions[i];
			}
		}
		alert("Request for unknown nut metric "+m);
		return null;
	}

	this.getNormThickness = function(params, norm) {
		if((norm != 'iso4032') && (norm != 'din934') && (norm != 'iso4035')) {
			alert("Request for unknown norm "+norm);
			return 0;
		}

		switch(norm) {
			case 'iso4032': return params.hISO4032;
			case 'din934':	return params.hDIN934;
			case 'iso4035': return params.ISO4035;
		}

		alert("Request for unknown nut metric "+m);
		return 0;
	};


	this.m = this.parameters['m'];
	this.norm = this.parameters['norm'];
	this.normparams = this.getNormParameter(this.parameters['m']);
	this.s = this.normparams.s * this.printer['scale']; // Inside radius
	this.h = this.getNormThickness(this.normparams, this.norm) * this.printer['scale'];
	this.ro = this.s / (2 * Math.cos(30 * Math.PI / 180))  * this.printer['scale']; // Outside radius
	this.corehole = this.normparams.corehole  * this.printer['scale'];
	this.throughhole_fine = this.normparams.throughhole_fine + this.printer['correctionInsideDiameter'];
	this.throughhole_medium = this.normparams.throughhole_medium + this.printer['correctionInsideDiameter'];
	this.throughhole_coarse = this.normparams.throughhole_coarse + this.printer['correctionInsideDiameter'];

	this.getModel = function() {
		var leff = this.l + 2*this.printer['correctionInsideDiameter'];
		var h1eff = this.h1 + 2*this.printer['correctionInsideDiameter'];
		var seff = this.s + 2*this.printer['correctionInsideDiameter'];
		var heff = this.h + 2*this.printer['correctionInsideDiameter'];

		var points = [];
		var angleStep = 2 * Math.PI / 6;

		for(var i = 0; i < 6; i++) {
			points.push( [ this.ro * Math.cos(i * angleStep), this.ro * Math.sin(i * angleStep) ] );
		}
		var nutBodyPath = new CAG.fromPoints( points );

		return difference(
			linear_extrude({ height: heff }, hull(nutBodyPath)).translate([0,0,-heff/2.0]),
			cylinder({ r : this.corehole / 2.0, h : heff, center: true })
		);
	};

	this.getHeight = function() {
		var heff = this.h + 2*this.printer['correctionInsideDiameter'];
		return heff;
	}

	this.getRadiusOutside = function() {
		return this.ro;
	}
	this.getRadiusInside = function() {
		return this.s;
	}

	this.getRadiusThreadCore = function() {
		return this.corehole;
	}

	this.getThroughholeFine = function()	{ return this.throughhole_fine; }
	this.getThroughholeMedium = function()	{ return this.throughhole_medium; }
	this.getThroughholeCoarse = function()	{ return this.throughhole_coarse; }
}
