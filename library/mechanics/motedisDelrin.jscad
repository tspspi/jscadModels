/*
	Template for the excelent Motedis Delrin Nuts.

	Currently implemented dimensions:

	* TR8 x 1.5

	This library is thought to be just a template to visualize these components
	in 3D CAD Models. It's not thought to be a printable object and includes
	no threading, etc.

	These nuts are available at https://www.motedis.at/
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
	Example (Nuts):
	===============

	include('/mechanics/motedisDelrin.jscad');

	function main(params) {
		let nut = new window.jscad.tspi.motedis.delrinTR8x1_5Template({},{});
		return nut.getModel();
	}
*/


if(typeof window === 'undefined') { window = new Object(); }
if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.motedis !== 'object') { window.jscad.tspi.motedis = new Object(); }

window.jscad.tspi.motedis.delrinTR8x1_5Template = function(printer, params) {
	let knownParameters = [
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

	this.getModel = function() {
		let nut = cube({ size : [ 36, 31, 13 ], center : true }).translate([0,0,13/2]);

		let edgetool = difference(
			cube({ size : [ 4, 4, 13 ], center : true }).translate([-2, 2, 13/2]),
			cylinder({ r : 4, center : true, h : 13}).translate([0,0,13/2])
		);

		nut = difference(
			nut,
			union(
				edgetool.translate([-36/2 + 4, 31/2 - 4, 0]),
				edgetool.rotateZ(-90).translate([36/2 - 4, 31/2 - 4, 0]),
				edgetool.rotateZ(-180).translate([36/2 -4, -31/2+4, 0]),
				edgetool.rotateZ(-270).translate([-36/2 + 4, -31/2 + 4, 0])
			)
		);

		nut = difference(
			nut,
			cylinder( { d : 6.8, h : 31, center : true }).rotateX(90).translate([0,0,13/2])
		);

		nut = difference(
			nut,
			union(
				cube( { size : [28, 3.5, 13],center : true}).translate([28/2-10, 3.5/2-31/2+12, 13/2]),
				cylinder( { d : 3.5, h : 13, center : true}).translate([-10, 3.5/2-31/2+12, 13/2])
			)
		);

		nut = difference(
			nut,
			union(
				cylinder( { d : 5.5, h : 13, center : true}).translate([-10,8.25,13/2]),
				cylinder( { d : 5.5, h : 13, center : true}).translate([-10+20,8.25,13/2])
			)
		);

		nut = difference(
			nut,
			cylinder({ d : 3.30, h : 12, center : true }).translate([0,0,12/2]).rotateX(-90).translate([11,-31/2,13/2])
		);

		return nut.setColor([0.8,0.8,0.8]);
	}
}
