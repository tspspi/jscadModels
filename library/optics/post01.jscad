/*
	Simple post for optics components

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

	include('/mechanics/isothread.jscad');
	include('/optics/post01.jscad');

	function getParameterDefinitions() {
	    return [
			{ name : 'grpPost', type : 'group', caption : 'Post' },

			{ name : 'h', type : 'float', initial : 110, caption : "Post height" },
			{ name : 'postid', type : 'float', initial : 12, caption : "Post inner diameter" },
			{ name : 'postwalld', type : 'float', initial : 5, caption : "Post wall thickness" },
			{ name : 'postwalld2', type : 'float', initial : 3, caption : "Base taper thickness" },
			{ name : 'posth2', type : 'float', initial : 20, caption : "Base taper height" },

			{ name : 'grpBase', type : 'group', caption : 'Base' },

			{ name : 'basem', type : 'float', initial : 4, caption : "Metric screw (table mount)" },
			{ name : 'basew', type : 'float', initial : 56, caption: "Base width" },
			{ name : 'basel', type : 'float', initial : 60, caption: "Base length" },
			{ name : 'baseh', type : 'float', initial : 8, caption: "Base thickness" },

			{ name : 'grpGrubScrew', type : 'group', caption : 'Grub screw' },

			{ name : 'grubm', type : 'float', initial : 4, caption : "Metric screw (grub screw)" },
			{ name : 'grubh', type : 'float', initial : 94, caption : "Grub screw position" },
			{ name : 'grublen', type : 'float', initial : 25, caption : "Grub screw length" },

			{ name : 'grpPrinter', type : 'group', caption : 'Printer' },
			{ name : 'resolutionCircle', type : 'float', initial : 128, caption : "Circle resolution" }
	    ];
	}

	function main(params) {
		let post = new window.jscad.tspi.optics.post01(params, params);

		return post.getModel();
	}
*/

if(typeof window === 'undefined') { window = new Object(); }
if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.optics !== 'object') { window.jscad.tspi.optics = new Object(); }

window.jscad.tspi.optics.post01 = function(printer, params) {
	knownParameters = [
		{ name : 'h',				type : 'number',				default : 110			},

		{ name : 'grubm',			type : 'number',				default : 4				},
		{ name : 'grublen',			type : 'number',				default : 25			},
		{ name : 'grubh',			type : 'number',				default : 94			},

		{ name : 'basem',			type : 'number',				default : 4				},

		{ name : 'basew',			type : 'number',				default : 56			},
		{ name : 'basel',			type : 'number',				default : 60			},
		{ name : 'baseh',			type : 'number',				default : 8				},

		{ name : 'postid',			type : 'number',				default : 12			},
		{ name : 'postwalld',		type : 'number',				default : 5				},
		{ name : 'postwalld2',		type : 'number',				default : 3				},
		{ name : 'posth2',			type : 'number',				default : 20			},
	];

	knownPrinterParameters = [
		{ name: 'scale', 						type: 'number', 	default: 1 		},
		{ name: 'correctionInsideDiameter', 	type: 'number', 	default: 0 		},
		{ name: 'correctionOutsideDiameter', 	type: 'number', 	default: 0 		},
		{ name: 'resolutionCircle', 			type: 'number', 	default: 16 	},
	];

	this.parameters = { };
	this.printer = { };
	this.rawprinter = printer;
	this.rawparams = params;
	this.error = false;

	for(let i = 0; i < knownParameters.length; i++) {
		if(typeof(params[knownParameters[i].name]) === knownParameters[i].type) {
			this.parameters[knownParameters[i].name] = params[knownParameters[i].name];
		} else if(knownParameters[i].default != -1) {
			this.parameters[knownParameters[i].name] = knownParameters[i].default;
		} else {
			this.error = true;
		}
	}
	for(let i = 0; i < knownPrinterParameters.length; i++) {
		if(typeof(printer[knownPrinterParameters[i].name]) === knownPrinterParameters[i].type) {
			this.printer[knownPrinterParameters[i].name] = printer[knownPrinterParameters[i].name];
		} else if(knownPrinterParameters[i].default != -1) {
			this.printer[knownPrinterParameters[i].name] = knownPrinterParameters[i].default;
		} else {
			this.error = true;
		}
	}


	let postheight 			= this.parameters['h'];
	let postclampscrewm 	= this.parameters['grubm'];
	let postclampscrewlen 	= this.parameters['grublen'];
	let grubh 				= this.parameters['grubh'];

	let basem				= this.parameters['basem'];

	let baseWidth 			= this.parameters['basew'];
	let baseLength 			= this.parameters['basel'];
	let baseThickness 		= this.parameters['baseh'];

	let fn 					= this.printer['resolutionCircle'];

	let postid				= this.parameters['postid'];
	let postwalld			= this.parameters['postwalld'];
	let postwalld2			= this.parameters['postwalld2'];
	let postod				= postid + 2 * postwalld;
	let postod2				= postod + 2 * postwalld2;
	let posth2				= this.parameters['posth2'];

	this.grubScrew = new window.jscad.tspi.iso4762Screw({}, { m : postclampscrewm, l : postclampscrewlen });
	this.mountScrew = new window.jscad.tspi.iso4762Screw({}, { m : basem, l : postclampscrewlen });

	let dms = this.mountScrew.getThroughholeCoarse();

	this.getModel = function() {
		let l1 = baseLength/2 - postod2/2;
		let y1 = postod2/2;

		return difference(
			union(
				cube({ size : [ baseWidth, baseLength, baseThickness ], center : true }).translate([0,0,baseThickness/2]),
				cylinder( { d : postod2, h : posth2, center : true, fn : fn }).translate([0,0,posth2/2]),
				cylinder( { d : postod, h : postheight, center : true, fn : fn }).translate([0,0,postheight/2])
			),
			union(
				cylinder( { d : postid, h : postheight, center : true, fn : fn }).translate([0,0,postheight/2]),

				cube( { size : [dms, l1, baseThickness ], center : true }).translate([ (baseWidth/4), (baseLength/2)-(l1/2),baseThickness/2]),
				cube( { size : [dms, l1, baseThickness ], center : true }).translate([-(baseWidth/4), (baseLength/2)-(l1/2),baseThickness/2]),
				cube( { size : [dms, l1, baseThickness ], center : true }).translate([ (baseWidth/4),-(baseLength/2)+(l1/2),baseThickness/2]),
				cube( { size : [dms, l1, baseThickness ], center : true }).translate([-(baseWidth/4),-(baseLength/2)+(l1/2),baseThickness/2]),

				cylinder ( { d : dms, h : baseThickness, center : true, fn : fn }).translate([ (baseWidth/4), y1, baseThickness/2]),
				cylinder ( { d : dms, h : baseThickness, center : true, fn : fn }).translate([-(baseWidth/4), y1, baseThickness/2]),
				cylinder ( { d : dms, h : baseThickness, center : true, fn : fn }).translate([ (baseWidth/4),-y1, baseThickness/2]),
				cylinder ( { d : dms, h : baseThickness, center : true, fn : fn }).translate([-(baseWidth/4),-y1, baseThickness/2]),

				cylinder( { d : this.grubScrew.getRadiusThreadCore(), h : postclampscrewlen, center : true, fn : fn }).translate([0,0,postclampscrewlen/2]).rotateX(90).translate([0,0,grubh]),
				cylinder( { d : this.grubScrew.getRadiusThreadCore(), h : postclampscrewlen, center : true, fn : fn }).translate([0,0,postclampscrewlen/2]).rotateY(90).translate([0,0,grubh])
			)
		);
	}
}
