/*
	Template library for SMA.. and SMA..L linear bearing blocks

	These bearing blocks are commonly available by various vendors
	and usually house LM..UU or LM..LUU bearings (for short and long
	variant) secured into place using retaining rings.

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
	Example usage (note getModel and getTemplate are both supported):

	include('/mechanics/bearingblockSMAUU.jscad');

	function getParameterDefinitions() {
	    return [
			{ name: 'series', type :'float', default : 8, caption: 'Shaft diameter' },
			{ name: 'adjustable', type : 'checkbox', checked : false, caption : 'Adjustable' },
			{ name: 'long', type : 'checkbox', checked : false, caption : 'Long variant' },

			{ name: 'grpPrinter', type: 'group', caption: 'Printer' },
			{ name: 'scale', default: 1.0, type: 'float', caption: 'Scale' },
			{ name: 'correctionInsideDiameter', default: 0, type: 'float', caption: 'Inside diameter correction' },
			{ name: 'correctionOutsideDiameter', default: 0, type: 'float', caption: 'Outside diameter correction' },
			{ name: 'resolutionCircle', default: 360, type: 'int', caption: 'Circle resolution (steps)' }
	    ];
	}
	function main(params) {
		let block = new window.jscad.tspi.mechanics.bearingblocks.LMUU(params, params);

		return block.getModel();
	}
*/
if(typeof window !== 'object') { window = new Object(); }
if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.mechanics !== 'object') { window.jscad.tspi.mechanics = new Object(); }
if(typeof window.jscad.tspi.mechanics.bearingblocks !== 'object') { window.jscad.tspi.mechanics.bearingblocks = new Object(); }

window.jscad.tspi.mechanics.bearingblocks.LMUU = function(printer, params) {
	let knownParameters = [
		{ name: 'series',						type: 'number',		default: 8			},
		/* { name: 'adjustable',					type: 'boolean',	default: false		}, */
		{ name: 'long',							type: 'boolean',	default: false		},
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

	let variants = [
		{ long : false, shaft :  8, h : 11, e : 17, w :  34, l :  30, f :  22  , g : 18  , t :  6, b :  24  , c : 18, k :  5   , s1 :  4, s2 :  3.4, i : 8 , DBearing: 15, LBearing:  24, nutd2: 15.7, nutm: 1.1  },
		{ long : false, shaft : 10, h : 13, e : 20, w :  40, l :  35, f :  26  , g : 21  , t :  8, b :  28  , c : 21, k :  6   , s1 :  5, s2 :  4.3, i : 12, DBearing: 19, LBearing:  29, nutd2: 20  , nutm: 1.1  },
		{ long : false, shaft : 12, h : 15, e : 21, w :  42, l :  36, f :  28  , g : 24  , t :  8, b :  30.5, c : 26, k :  5.75, s1 :  5, s2 :  4.3, i : 12, DBearing: 21, LBearing:  30, nutd2: 22  , nutm: 1.1  },
		{ long : false, shaft : 13, h : 15, e : 22, w :  44, l :  39, f :  30  , g : 24.5, t :  8, b :  33  , c : 26, k :  5.5 , s1 :  5, s2 :  4.3, i : 12, DBearing: 23, LBearing:  32, nutd2: 24.1, nutm: 1.3  },
		{ long : false, shaft : 16, h : 19, e : 25, w :  50, l :  44, f :  38.5, g : 32.5, t :  9, b :  36  , c : 34, k :  7   , s1 :  5, s2 :  4.3, i : 12, DBearing: 28, LBearing:  37, nutd2: 29.4, nutm: 1.3  },
		{ long : false, shaft : 20, h : 21, e : 27, w :  54, l :  50, f :  41  , g : 35  , t : 11, b :  40  , c : 40, k :  7   , s1 :  6, s2 :  5.2, i : 12, DBearing: 32, LBearing:  42, nutd2: 33.7, nutm: 1.3  },
		{ long : false, shaft : 25, h : 26, e : 38, w :  76, l :  67, f :  51.5, g : 42  , t : 12, b :  54  , c : 50, k : 11   , s1 :  8, s2 :  7  , i : 18, DBearing: 40, LBearing:  59, nutd2: 42.5, nutm: 1.85 },
		{ long : false, shaft : 30, h : 30, e : 39, w :  78, l :  72, f :  59.5, g : 49  , t : 15, b :  58  , c : 58, k : 10   , s1 :  8, s2 :  7  , i : 18, DBearing: 45, LBearing:  64, nutd2: 47.5, nutm: 1.85 },
		{ long : false, shaft : 35, h : 34, e : 45, w :  90, l :  80, f :  66  , g : 54  , t : 18, b :  70  , c : 60, k : 10   , s1 :  8, s2 :  7  , i : 18, DBearing: 52, LBearing:  70, nutd2: 55  , nutm: 2.15 },
		{ long : false, shaft : 40, h : 40, e : 51, w : 102, l :  90, f :  78  , g : 62  , t : 20, b :  80  , c : 60, k : 11   , s1 : 10, s2 :  8.7, i : 25, DBearing: 60, LBearing:  80, nutd2: 63  , nutm: 2.15 },
		{ long : false, shaft : 50, h : 52, e : 61, w : 122, l : 110, f : 102  , g : 80  , t : 25, b : 100  , c : 80, k : 11   , s1 : 10, s2 :  8.7, i : 25, DBearing: 80, LBearing: 100, nutd2: 83.5, nutm: 2.65 },
		{ long : false, shaft : 60, h : 58, e : 66, w : 132, l : 122, f : 114  , g : 94  , t : 30, b : 108  , c : 90, k : 12   , s1 : 12, s2 : 10.7, i : 25, DBearing: 90, LBearing: 110, nutd2: 93.5, nutm: 3.15 },

		{ long : true, shaft :  8, h : 11, e : 17, w :  34, lsmal :  58, lkbal :  58, f :  22  , g : 18  , t :  6, b :  24  , csmal :  42, ckbal:  42, k :  5   , s1 : 4 , s2 : 3.4, i : 8 , DBearing: 15, LBearing:  45, nutd2: 15.7, nutm: 1.1  },
		{ long : true, shaft : 10, h : 13, e : 20, w :  40, lsmal :  68, lkbal :  68, f :  26  , g : 21  , t :  8, b :  28  , csmal :  46, ckbal:  46, k :  6   , s1 : 5 , s2 : 4.3, i : 12, DBearing: 19, LBearing:  55, nutd2: 20  , nutm: 1.1  },
		{ long : true, shaft : 12, h : 15, e : 21, w :  42, lsmal :  70, lkbal :  -1, f :  28  , g : 24  , t :  8, b :  30.5, csmal :  50, ckbal:  -1, k :  5.75, s1 : 5 , s2 : 4.3, i : 12, DBearing: 21, LBearing:  57, nutd2: 22  , nutm: 1.1  },
		{ long : true, shaft : 13, h : 15, e : 22, w :  44, lsmal :  75, lkbal :  77, f :  30  , g : 24.5, t :  8, b :  33  , csmal :  50, ckbal:  64, k :  5.5 , s1 : 5 , s2 : 4.3, i : 12, DBearing: 23, LBearing:  61, nutd2: 24.1, nutm: 1.3  },
		{ long : true, shaft : 16, h : 19, e : 25, w :  50, lsmal :  85, lkbal :  89, f :  38.5, g : 32.5, t :  9, b :  36  , csmal :  60, ckbal:  79, k :  7   , s1 : 5 , s2 : 4.3, i : 12, DBearing: 28, LBearing:  70, nutd2: 29.4, nutm: 1.3  },
		{ long : true, shaft : 20, h : 21, e : 27, w :  54, lsmal :  96, lkbal : 100, f :  41  , g : 35  , t : 11, b :  40  , csmal :  70, ckbal:  90, k :  7   , s1 : 6 , s2 : 5.2, i : 12, DBearing: 32, LBearing:  80, nutd2: 33.7, nutm: 1.3  },
		{ long : true, shaft : 25, h : 26, e : 38, w :  76, lsmal : 130, lkbal : 136, f :  51.5, g : 42  , t : 12, b :  54  , csmal : 100, ckbal: 119, k : 11   , s1 : 8 , s2 : 7  , i : 18, DBearing: 40, LBearing: 112, nutd2: 42.5, nutm: 1.85 },
		{ long : true, shaft : 30, h : 30, e : 39, w :  78, lsmal : 140, lkbal : 154, f :  59.5, g : 49  , t : 15, b :  58  , csmal : 110, ckbal: 132, k : 10   , s1 : 8 , s2 : 7  , i : 18, DBearing: 45, LBearing: 123, nutd2: 47.5, nutm: 1.85 },
		{ long : true, shaft : 35, h : 34, e : 45, w :  90, lsmal : 155, lkbal :  -1, f :  68  , g : 54  , t : 18, b :  70  , csmal : 120, ckbal:  -1, k : 10   , s1 : 8 , s2 : 7  , i : 18, DBearing: 52, LBearing: 135, nutd2: 55  , nutm: 2.15 },
		{ long : true, shaft : 40, h : 40, e : 51, w : 102, lsmal : 175, lkbal : 180, f :  78  , g : 62  , t : 20, b :  80  , csmal : 140, ckbal: 150, k : 11   , s1 : 10, s2 : 8.7, i : 25, DBearing: 60, LBearing: 151, nutd2: 64  , nutm: 2.15 },
		{ long : true, shaft : 50, h : 52, e : 61, w : 122, lsmal : 215, lkbal : 230, f : 102  , g : 80  , t : 25, b : 100  , csmal : 160, ckbal: 200, k : 11   , s1 : 10, s2 : 8.7, i : 25, DBearing: 80, LBearing: 192, nutd2: 83.5, nutm: 2.65 },
	];

	this.printer = printer;
	this.params = params;

	/*
		Select matching model
	*/
	this.variant = false;
	variants.forEach((variant) => {
		if((variant.shaft == this.parameters['series']) && (variant.long == this.parameters['long'])) {
			this.variant = variant;
		}
	});

	if(!this.variant) {
		alert("Invalid bearing block (SMAUU) variant");
	}

	this.l = this.variant['l'];
	this.height1 = this.variant['g'];
	this.height2 = this.variant['f'];
	this.width = this.variant['w'];
	this.hshaft = this.variant['h'];

	if(this.variant['long']) {
		this.variant['c'] = this.variant['csmal'];
		this.variant['l'] = this.variant['lsmal'];
	}

	this.getTemplate = function() {
		let fn = this.printer['resolutionCircle'];

		let d1 = this.variant['i'] - this.variant['t'];
		let d2 = this.variant['f'] - this.variant['g'];

		let w = this.variant['w'];
		let f = this.variant['f'];
		let t = this.variant['t'];
		let k = this.variant['k'];
		let l = this.variant['l'];
		let g = this.variant['g'];
		let i = this.variant['i'];
		let h = this.variant['h'];

		let edges = [
			[ -w/2, f/2 ],
			[ w/2, f/2 ],

			[ w/2, f/2 - t],
			[w/2 - d1, f/2 - i],

			[w/2 - d1, f/2 - g],
			[w/2 - 2*k , f/2 - g],
			[w/2 - 2*k - d2 , -f/2],
			[-w/2+2*k+d2, -f/2],
			[-w/2+2*k, f/2 - g],
			[-w/2 + d1, f/2 - g],

			[-w/2 +d1, f/2 - i],
			[-w/2, f/2 - t]
		];

		let path = new CSG.Polygon2D(edges, true );
		let part = linear_extrude( { height : l }, path ).translate([0,((f/2)-h)/2,-l/2]);

		return part;
	};
	this.getModel = function() {
		let fn = this.printer['resolutionCircle'];

		let d1 = this.variant['i'] - this.variant['t'];
		let d2 = this.variant['f'] - this.variant['g'];

		let w = this.variant['w'];
		let f = this.variant['f'];
		let t = this.variant['t'];
		let k = this.variant['k'];
		let l = this.variant['l'];
		let g = this.variant['g'];
		let i = this.variant['i'];
		let h = this.variant['h'];

		let edges = [
			[ -w/2, f/2 ],
			[ w/2, f/2 ],

			[ w/2, f/2 - t],
			[w/2 - d1, f/2 - i],

			[w/2 - d1, f/2 - g],
			[w/2 - 2*k , f/2 - g],
			[w/2 - 2*k - d2 , -f/2],
			[-w/2+2*k+d2, -f/2],
			[-w/2+2*k, f/2 - g],
			[-w/2 + d1, f/2 - g],

			[-w/2 +d1, f/2 - i],
			[-w/2, f/2 - t]
		];

		let path = new CSG.Polygon2D(edges, true );
		let part = linear_extrude( { height : l }, path ).translate([0,((f/2)-h)/2,-l/2]);

		let shaft = cylinder({ d : this.variant['DBearing'], h : l, center : true, fn : fn });
		let drill1 = cylinder({ d : this.variant['s2'], h : f, center : true, fn : fn });

		part = difference(
			part,
			union(
				shaft,
				drill1.rotateX(90).translate([-this.variant['b']/2, 0,  this.variant['c']/2]),
				drill1.rotateX(90).translate([-this.variant['b']/2, 0, -this.variant['c']/2]),
				drill1.rotateX(90).translate([ this.variant['b']/2, 0,  this.variant['c']/2]),
				drill1.rotateX(90).translate([ this.variant['b']/2, 0, -this.variant['c']/2]),

				cylinder({ d : this.variant['nutd2'], height : this.variant['nutm'], center : true, fn : fn }).translate([0, 0,  this.variant['LBearing']/2 + this.variant['nutm']/2]),
				cylinder({ d : this.variant['nutd2'], height : this.variant['nutm'], center : true, fn : fn }).translate([0, 0, -this.variant['LBearing']/2 - this.variant['nutm']/2])
			)
		);

		return part;
	};
}
