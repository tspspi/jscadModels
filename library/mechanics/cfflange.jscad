/*
	ISO 3669:2020 CF flange models

	Work in progress: Missing rotatable flanges & query functions for
	thickness and pipe inset height as well as support for threaded
	flanges
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

	include('/mechanics/cfflange.jscad');
	function main(params) {
		var flange = new window.jscad.tspi.mechanics.cfflange.ISO3669( { resolutionCircle : 128 }, { cf : 40 });
		return flange.getModel();
	}
*/


if(typeof window !== 'object') { window = new Object(); }
if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.mechanics !== 'object') { window.jscad.tspi.mechanics = new Object(); }
if(typeof window.jscad.tspi.mechanics.cfflange !== 'object') { window.jscad.tspi.mechanics.cfflange = new Object(); }

window.jscad.tspi.mechanics.cfflange.ISO3669 = function(printer, params) {
	let knownParameters = [
		{ name: 'cf',							type: 'number',			default: 40				},
		{ name: 'rotateable',					type: 'boolean',		default: false			},
		{ name: 'rotateableOutside',			type: 'boolean',		default: false			},
		{ name: 'pipeDiameter',					type: 'number',			default: -1				},
		{ name: 'pipeWallWidth',				type: 'number',			default: 2.25			},
		{ name: 'boltThrough',					type: 'boolean',		default: true			},
	];

	let knownPrinterParameters = [
		{ name: 'scale', 						type: 'number', 	default: 1 			},
		{ name: 'correctionInsideDiameter', 	type: 'number', 	default: 0 			},
		{ name: 'correctionOutsideDiameter', 	type: 'number', 	default: 0 			},
		{ name: 'resolutionCircle', 			type: 'number', 	default: 64   		},
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

	this.printerRaw = printer;
	this.params = params;

	this.dimensions = [
		{ cf :  10, outsideDiameter :  25.0, tubeMax :  12.0, boltN :  6, boltHoleDia :  3.3, boltThreadM :  3, boltIncl : 0.50, boltCircle :  17.6, boltPositionTolerance : 0.1, sealRecess :  13.5, knifeEdge :  10.5, pipeConnectionDepth :  3.0, setbackInnerRotateable :    0, thickness :  6.0 },
		{ cf :  16, outsideDiameter :  33.8, tubeMax :  19.4, boltN :  6, boltHoleDia :  4.4, boltThreadM :  4, boltIncl : 0.70, boltCircle :  27.0, boltPositionTolerance : 0.1, sealRecess :  21.4, knifeEdge :  18.3, pipeConnectionDepth :  3.3, setbackInnerRotateable :  5.9, thickness :  7.0 },
		{ cf :  25, outsideDiameter :  54.0, tubeMax :  25.8, boltN :  4, boltHoleDia :  6.8, boltThreadM :  6, boltIncl : 1.00, boltCircle :  41.3, boltPositionTolerance : 0.2, sealRecess :  33.0, knifeEdge :  27.7, pipeConnectionDepth :  4.3, setbackInnerRotateable :  6.0, thickness : 11.5 },
		{ cf :  40, outsideDiameter :  69.9, tubeMax :  44.5, boltN :  6, boltHoleDia :  6.8, boltThreadM :  6, boltIncl : 1.00, boltCircle :  58.7, boltPositionTolerance : 0.2, sealRecess :  48.3, knifeEdge :  41.9, pipeConnectionDepth :  4.3, setbackInnerRotateable :  7.7, thickness : 12.5 },
		{ cf :  50, outsideDiameter :  85.7, tubeMax :  51.0, boltN :  8, boltHoleDia :  8.4, boltThreadM :  8, boltIncl : 1.25, boltCircle :  72.4, boltPositionTolerance : 0.2, sealRecess :  61.8, knifeEdge :  55.9, pipeConnectionDepth :  4.9, setbackInnerRotateable :  9.7, thickness : 16.0 },
		{ cf :  63, outsideDiameter : 114.3, tubeMax :  70.0, boltN :  8, boltHoleDia :  8.4, boltThreadM :  8, boltIncl : 1.25, boltCircle :  92.2, boltPositionTolerance : 0.2, sealRecess :  82.5, knifeEdge :  77.2, pipeConnectionDepth :  6.4, setbackInnerRotateable : 12.7, thickness : 17.0 },
		{ cf :  75, outsideDiameter : 117.4, tubeMax :  76.2, boltN : 10, boltHoleDia :  8.4, boltThreadM :  8, boltIncl : 1.25, boltCircle : 102.3, boltPositionTolerance : 0.2, sealRecess :  91.6, knifeEdge :  85.2, pipeConnectionDepth :  6.5, setbackInnerRotateable : 13.0, thickness : 17.5 },
		{ cf : 100, outsideDiameter : 152.4, tubeMax : 108.0, boltN : 16, boltHoleDia :  8.4, boltThreadM :  8, boltIncl : 1.25, boltCircle : 130.3, boltPositionTolerance : 0.2, sealRecess : 120.6, knifeEdge : 115.3, pipeConnectionDepth :  7.2, setbackInnerRotateable : 14.3, thickness : 19.5 },
		{ cf : 125, outsideDiameter : 171.5, tubeMax : 127.0, boltN : 18, boltHoleDia :  8.4, boltThreadM :  8, boltIncl : 1.25, boltCircle : 151.6, boltPositionTolerance : 0.2, sealRecess : 141.8, knifeEdge : 136.3, pipeConnectionDepth :  7.2, setbackInnerRotateable : 14.3, thickness : 21.0 },
		{ cf : 160, outsideDiameter : 203.2, tubeMax : 159.0, boltN : 20, boltHoleDia :  8.4, boltThreadM :  8, boltIncl : 1.25, boltCircle : 181.0, boltPositionTolerance : 0.2, sealRecess : 171.4, knifeEdge : 166.1, pipeConnectionDepth :  8.0, setbackInnerRotateable : 15.9, thickness : 21.0 },
		{ cf : 200, outsideDiameter : 254.0, tubeMax : 206.0, boltN : 24, boltHoleDia :  8.4, boltThreadM :  8, boltIncl : 1.25, boltCircle : 231.8, boltPositionTolerance : 0.2, sealRecess : 222.2, knifeEdge : 216.9, pipeConnectionDepth :  8.6, setbackInnerRotateable : 17.2, thickness : 24.0 },
		{ cf : 250, outsideDiameter : 304.8, tubeMax : 256.0, boltN : 32, boltHoleDia :  8.4, boltThreadM :  8, boltIncl : 1.25, boltCircle : 284.0, boltPositionTolerance : 0.2, sealRecess : 273.1, knifeEdge : 267.5, pipeConnectionDepth :  9.0, setbackInnerRotateable : 18.0, thickness : 24.0 },
		{ cf : 275, outsideDiameter : 336.6, tubeMax : 273.0, boltN : 30, boltHoleDia : 10.8, boltThreadM : 10, boltIncl : 1.50, boltCircle : 306.3, boltPositionTolerance : 0.2, sealRecess : 294.4, knifeEdge : 288.2, pipeConnectionDepth :  9.9, setbackInnerRotateable : 19.8, thickness : 28.0 },
		{ cf : 300, outsideDiameter : 368.3, tubeMax : 306.0, boltN : 32, boltHoleDia : 10.8, boltThreadM : 10, boltIncl : 1.50, boltCircle : 338.1, boltPositionTolerance : 0.2, sealRecess : 326.4, knifeEdge : 320.0, pipeConnectionDepth :  9.9, setbackInnerRotateable : 19.8, thickness : 28.0 },
		{ cf : 350, outsideDiameter : 419.1, tubeMax : 356.0, boltN : 36, boltHoleDia : 10.8, boltThreadM : 10, boltIncl : 1.50, boltCircle : 388.9, boltPositionTolerance : 0.4, sealRecess : 376.7, knifeEdge : 373.0, pipeConnectionDepth : 10.4, setbackInnerRotateable : 20.7, thickness : 28.0 },
		{ cf : 400, outsideDiameter : 469.9, tubeMax : 406.0, boltN : 40, boltHoleDia : 10.8, boltThreadM : 10, boltIncl : 1.50, boltCircle : 437.9, boltPositionTolerance : 0.4, sealRecess : 424.4, knifeEdge : 419.0, pipeConnectionDepth : 10.4, setbackInnerRotateable : 20.7, thickness : 28.0 }
	];

	for(i = 0; i < this.dimensions.length; i++) {
		if(this.dimensions[i].cf == this.parameters['cf']) {
			this.cf       = this.dimensions[i].cf;
			this.l1       = this.dimensions[i].outsideDiameter;
			this.l2       = this.dimensions[i].tubeMax;
			this.boltN    = this.dimensions[i].boltN;
			this.l3       = this.dimensions[i].boltHoleDia;
			this.boltM    = this.dimensions[i].boltThreadM;
			this.boltIncl = this.dimensions[i].boltIncl;
			this.l4       = this.dimensions[i].boltCircle;
			this.phi      = this.dimensions[i].boltPositionTolerance;
			this.l5       = this.dimensions[i].sealRecess;
			this.l6       = this.dimensions[i].knifeEdge;
			this.l7       = this.dimensions[i].pipeConnectionDepth;
			this.l8       = this.dimensions[i].setbackInnerRotateable;
			this.l9       = this.dimensions[i].thickness;
			break;
		}
	}
	if(i == this.dimensions.length) {
		alert("Unsupported CF flange size "+this.parameters['cf']);
	}
	if(this.parameters['pipeDiameter'] > this.l2) {
		alert("Tube diameter out of range, claping to maximum");
		this.pipeDiameter = this.l2;
	} else if(this.parameters['pipeDiameter'] < 0) {
		this.pipeDiameter = this.l2;
	} else {
		this.pipeDiameter = this.parameters['pipeDiameter'];
	}
	this.pipeWallWidth = this.parameters['pipeWallWidth'];
	if((2*this.pipeWallWidth >= this.pipeDiameter) && (this.parameters['pipeDiameter'] > 0)) {
		alert("Pipe wall width is not reasonable");
	}
	this.fn = this.printer['resolutionCircle'];
	this.boltThrough = this.parameters['boltThrough'];

	this.getModel = function() {
		if(this.parameters['rotateable']) {
			alert("Rotateable flanges are currently not supported - work in progress");
		} else {
			let flange = cylinder({ d : this.l1, h : this.l9, center : true, fn : this.fn }).translate([0,0,this.l7-(this.l9 / 2)]);
			if(this.pipeDiameter > 0) {
				let pipeInset = this.l9 - this.l7;
				flange = difference(
					flange,
					union(
						cylinder({ d : this.pipeDiameter, h : pipeInset, center : true, fn : this.fn}).translate([0,0,-pipeInset/2]),
						cylinder({ d : this.pipeDiameter - 2*this.pipeWallWidth, h : this.l9, center : true, fn : this.fn}).translate([0,0,this.l7-(this.l9 / 2)])
					)
				);
			}
			flange = difference(
				flange,
				cylinder({ d : this.l6, h : 1.2, center : true, fn : this.fn}).translate([0,0,-0.6 + this.l7])
			);

			flange = difference(
				flange,
				cylinder({ d : this.l5, h : 0.98, center : true, fn : this.fn}).translate([0,0,-0.98/2 + this.l7])
			);

			let kfwidth = (this.l5 - this.l6) / 2;
			let kfheight = Math.tan(20 * Math.PI / 180) * kfwidth;
			flange = difference(
				flange,
				difference(
					cylinder({ d : this.l5, h : kfheight, center : true, fn : this.fn}),
					cylinder({ d1 : this.l5, d2 : this.l6, h : kfheight, center : true, fn : this.fn})
				).translate([0,0,-0.98 - kfheight/2 + this.l7])
			);

			for(iHole = 0; iHole < this.boltN; iHole++) {
				let currentAngle = (360 / this.boltN) * iHole;
				if(this.boltThrough) {
					flange = difference(
						flange,
						cylinder({ d : this.l3, h : this.l9, center : true, fn : this.fn }).translate([this.l4 / 2, 0, this.l7-(this.l9 / 2)]).rotateZ(currentAngle)
					);
				} else {
					/* Only add thread core holes. Note that this is _not_ specified in ISO3669 */
				}
			}

			/* Leak checking grooves */
			flange = difference(
				flange,
				union(
					cube({ size : [(this.l1-this.l5)/2+kfwidth/2, 1.5, 1.5 ], center : true}).translate([-(this.l1-this.l5)/4 + this.l1/2, 0, -0.74 + this.l7]).rotateZ(180 / this.boltN),
					cube({ size : [(this.l1-this.l5)/2+kfwidth/2, 1.5, 1.5 ], center : true}).translate([-(this.l1-this.l5)/4 + this.l1/2, 0, -0.74 + this.l7]).rotateZ(180 / this.boltN + 180)
				).setColor([1,0,0])
			);

			return flange;
		}
	}
}
