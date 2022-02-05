/*
	Template for the 8mm die-cast KFL08 flange bearing

	This library is thought to be just a template to visualize these components
	in 3D CAD Models. It's not thought to be a printable object!

	These bearings are available at https://www.motedis.at/
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

	include('/mechanics/motedisKFL08.jscad');

	function main(params) {
		let bearingBlock = new window.jscad.tspi.motedis.kfl08Template({}, {});

		return bearingBlock.getTemplate();
	}
*/

if(typeof window === 'undefined') { window = new Object(); }
if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.motedis !== 'object') { window.jscad.tspi.motedis = new Object(); }

window.jscad.tspi.motedis.kfl08Template = function(printer, params) {
	let knownParameters = [
		{ name: 'printableModification',		type: 'boolean',	default : false		}
	];

	let knownPrinterParameters = [
		{ name: 'scale', 						type: 'number', 	default: 1 			},
		{ name: 'correctionInsideDiameter', 	type: 'number', 	default: 0 			},
		{ name: 'correctionOutsideDiameter', 	type: 'number', 	default: 0 			},
		{ name: 'resolutionCircle', 			type: 'number', 	default: 32 /*360*/ 		},
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

	this.getTemplate = function() {
		let r1 = 5.25;
		let r2 = 26.7/2;
		let d = 18;

		let gamma = asin((r2 - r1) / d);
		let alpha = 90 - gamma;
		let a1 = r1 * cos(alpha);
		let a2 = r2 * cos(alpha);
		let b1 = r1 * sin(alpha);
		let b2 = r2 * sin(alpha);

		let edges = [
			[ - d - a1, b1 ],
			[ - a2, b2 ],
			[ a2, b2 ],
			[d + a1, b1 ],

			[d + a1, - b1 ],
			[ a2, - b2 ],
			[ - a2, - b2 ],
			[ - d - a1, - b1 ]
		];
		let path = new CSG.Polygon2D(edges, /* Polygon is closed */ true );
		let bodyPart = linear_extrude( { height : 4 }, path ).translate([0,0,-4]);

		let borehole = union(
			cylinder( { d : 4.5, h : 4, center : true, fn : this.printer['resolutionCircle'] }).translate([ 18,0,-2]),
			cylinder( { d : 4.5, h : 4, center : true, fn : this.printer['resolutionCircle'] }).translate([-18,0,-2])
		).setColor([1,0,0]);
		let bearingHolder = union(
			cylinder({ d : 26.5, h : 4, center : true, fn : this.printer['resolutionCircle'] }).translate([0,0,-2]),
			cylinder({ d : 25.7, h : 4.5, center : true, fn : this.printer['resolutionCircle'] }).translate([0,0, 2.25]),
			cylinder({ d : 12, h : 11.1, center : true, fn : this.printer['resolutionCircle'] }).translate([0,0,11.1/2 - 4]),

			cylinder({ r : 5.25, h : 4, center : true, fn : this.printer['resolutionCircle'] }).translate([18,0,-2]),
			cylinder({ r : 5.25, h : 4, center : true, fn : this.printer['resolutionCircle'] }).translate([-18,0,-2]),

			bodyPart
		);

		return bearingHolder;
	}

	this.getModel = function() {
		let r1 = 5.25;
		let r2 = 26.7/2;
		let d = 18;

		let gamma = asin((r2 - r1) / d);
		let alpha = 90 - gamma;
		let a1 = r1 * cos(alpha);
		let a2 = r2 * cos(alpha);
		let b1 = r1 * sin(alpha);
		let b2 = r2 * sin(alpha);

		let edges = [
			[ - d - a1, b1 ],
			[ - a2, b2 ],
			[ a2, b2 ],
			[d + a1, b1 ],

			[d + a1, - b1 ],
			[ a2, - b2 ],
			[ - a2, - b2 ],
			[ - d - a1, - b1 ]
		];
		let path = new CSG.Polygon2D(edges, /* Polygon is closed */ true );
		let bodyPart = linear_extrude( { height : 4 }, path ).translate([0,0,-4]);

		let borehole = union(
			cylinder( { d : 4.5, h : 4, center : true, fn : this.printer['resolutionCircle'] }).translate([ 18,0,-2]),
			cylinder( { d : 4.5, h : 4, center : true, fn : this.printer['resolutionCircle'] }).translate([-18,0,-2])
		).setColor([1,0,0]);
		let bearingHolder = union(
			cylinder({ d : 26.5, h : 4, center : true, fn : this.printer['resolutionCircle'] }).translate([0,0,-2]),
			cylinder({ d : 25.7, h : 4.5, center : true, fn : this.printer['resolutionCircle'] }).translate([0,0, 2.25]),

			cylinder({ r : 5.25, h : 4, center : true, fn : this.printer['resolutionCircle'] }).translate([18,0,-2]),
			cylinder({ r : 5.25, h : 4, center : true, fn : this.printer['resolutionCircle'] }).translate([-18,0,-2]),

			bodyPart
		);

		if(this.parameters['printableModification']) {
			return difference(
				bearingHolder,
				union(
					borehole,
					cylinder({ d : 12, h : 11.1, center : true, fn : this.printer['resolutionCircle'] }).translate([0,0,11.1/2 - 4]),
					cylinder({ d : 20, h : 4.5+4, center : true, fn : this.printer['resolutionCircle'] }).translate([0,0,(4.5+4)/2 - 4 + 1])
				)
			);
		} else {
			return difference(
				bearingHolder,
				union(
					borehole,
					cylinder({ d : 12, h : 11.1, center : true, fn : this.printer['resolutionCircle'] }).translate([0,0,11.1/2 - 4]),
					cylinder({ d : 20, h : 4.5+4, center : true, fn : this.printer['resolutionCircle'] }).translate([0,0,(4.5+4)/2 - 4])
				)
			);
		}
	}
}
