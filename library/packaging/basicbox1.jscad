/*
	Basic (rounded) box

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

	include('/packaging/basicbox1.jscad');

	function getParameterDefinitions() {
		return [
			{ name: 'length', type: 'float', initial: 80, caption: "Length" },
			{ name: 'width', type: 'float', initial: 40, caption: "Width" },
			{ name: 'height', type: 'float', initial: 30, caption: "Height" },
			{ name: 'thickness', type: 'float', initial: 3, caption: "Wall thickness" },
			{ name: 'edgeradius', type: 'float', initial: 5, caption: "Edge radius" },
			{ name: 'hoverlap', type: 'float', initial: 2, caption: "Overlapping region" },
			{ name: 'cutratio', type: 'float', initial: 0.7, caption: "Split / cut ratio" },
			{ name: 'selBottom', type: 'checkbox', checked: false, caption: "Select top side (else bottom side)" }
		];
	}

	function main(params) {
		var box = new window.jscad.tspi.basicbox( { }, params );

		if(params.selBottom) {
			return box.getModelTop();
		} else {
			return box.getModelBottom();
		}
	}
*/


if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }

window.jscad.tspi.basicbox = function(printer, params) {
	var knownParameters = [
		{ name: 'height',			type: 'number', 	default: -1 				},
		{ name: 'width',			type: 'number',		default: -1 				},
		{ name: 'length',			type: 'number',		default: -1 				},

		{ name: 'thickness',		type: 'number',		default: 1.0 				},

		{ name: 'cutratio',			type: 'number',		default: 0.5 				},
		{ name: 'cutheight',		type: 'number',		default: 0.0 				},

		{ name: 'hoverlap',			type: 'number',		default: 3.0 				},

		{ name: 'edgeradius',		type: 'number',		default: 0.0 				},
	];

	var knownPrinterParameters = [
		{ name: 'scale', 						type: 'number', 	default: 1 		},
		{ name: 'correctionInsideDiameter', 	type: 'number', 	default: 0 		},
		{ name: 'correctionOutsideDiameter', 	type: 'number', 	default: 0 		},
		{ name: 'resolutionCircle', 			type: 'number', 	default: 360 	},
	];

	this.parameters = { };
	this.printer = { };
	this.error = false;

	/*
		Load known parameters from printer and params
		parameter
	*/
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

	// Passed parameters
	this.height = this.parameters['height'];
	this.width = this.parameters['width'];
	this.length = this.parameters['length'];

	if((this.height <= 0) || (this.width <= 0) || (this.length <= 0)) {
		alert("Box dimensions have to be larger than zero");
		this.error = true;
	}

	this.thickness = this.parameters['thickness'];

	if(this.thickness <= 0) {
		alert("Thickness has to be positive and larger than zero");
		this.error = true;
	} else if((2*this.thickness > this.width) || (2*this.thickness > this.height) || (2*this.thickness > this.length)) {
		alert("Box with supplied wall thickness would have no room inside");
		this.error = true;
	}

	this.cutratio = this.parameters['cutratio'];
	this.cutheight = this.parameters['cutheight'];
	if((this.cutratio <= 0) && (this.cutheight <= 0)) {
		alert("No cut method specified");
		this.error = true;
	} else if(this.cutratio > 0) {
		if(this.cutratio > 1) {
			alert("Cut ratio is invalid");
			this.error = true;
		}
		this.cutheight = this.height * this.cutratio;
	} else {
		if(this.cutheight >= this.height) {
			alert("Cut cannot be at same or above box height");
			this.error = true;
		}
		this.cutratio = this.cutheight / this.height;
	}

	this.height1 = this.height * this.cutratio;
	this.height2 = this.height - this.height1;

	this.hoverlap = this.parameters['hoverlap'];
	if(this.hoverlap < 0) {
		alert("Overlap has to be zero or positive");
		this.error = true;
	}

	this.edgeradius = this.parameters['edgeradius'];
	if(this.edgeradius < 0) {
		alert("Edge radius has to be positive or zero");
		this.error = true;
	} else if((2*this.edgeradius > this.width) || (2*this.edgeradius > this.height) || (2*this.edgeradius > this.length)) {
		alert("Edge radius is too large and would result in a sphere");
		this.error = true;
	}

	// Printer parameters
	this.scale = this.printer['scale'];
	this.correctionID = this.printer['correctionInsideDiameter'];
	this.correctionOD = this.printer['correctionOutsideDiameter'];
	this.resolutionCircle = this.printer['resolutionCircle'];


	this.getModelTop = function() {
		var longestedge = this.width;
		if(this.length > longestedge) { longestedge = this.length; }
		if(this.height > longestedge) { longestedge = this.height; }

		var box = difference(
			cube({ size: [ this.length, this.width, this.height2 ] }),
			cube({ size: [ this.length-2*this.thickness, this.width-2*this.thickness, this.height2-this.thickness ]}).translate([this.thickness, this.thickness, this.thickness])
		);

		/* Rounding edges */

		if(this.edgeradius > 0) {
				var cuttool = difference(
			        	cube({size : [ longestedge, this.edgeradius, this.edgeradius ]}),
				        cylinder({ r : this.edgeradius, h : longestedge }).rotateY(90).translate([0, this.edgeradius, this.edgeradius])
			        );
				var cuttool2 = cube({size : [ longestedge, this.edgeradius+this.thickness, this.edgeradius+this.thickness ]});
				var edgetool = difference(
					cuttool2,
					cylinder({ r : this.edgeradius, h : longestedge-2*this.thickness }).rotateY(90).translate([this.thickness, this.edgeradius+this.thickness, this.edgeradius+this.thickness])
		                );
				var roundededge = difference(
					edgetool,
					cuttool
				);

				box = union(difference(box, cuttool2.scale([this.length / longestedge, 1, 1])), roundededge.scale([this.length / longestedge, 1, 1]));
				box = union(difference(box, cuttool2.rotateZ(90).rotateY(90).scale([1, this.width / longestedge, 1])), roundededge.rotateZ(90).rotateY(90).scale([1, this.width / longestedge, 1]));

		                box = union(difference(box, cuttool2.rotateX(90).translate([0, this.width, 0]).scale([this.length / longestedge, 1, 1])), roundededge.rotateX(90).translate([0, this.width, 0]).scale([this.length / longestedge, 1, 1]));
				box = union(difference(box, cuttool2.rotateZ(90).rotateY(0).scale([1, this.width / longestedge, 1]).translate([this.length, 0, 0])), roundededge.rotateZ(90).rotateY(0).scale([1, this.width / longestedge, 1]).translate([this.length, 0, 0]));

				box = union(difference(box, cuttool2.rotateY(-90).rotateZ(-90).translate([0,0,this.edgeradius+this.thickness]).scale([1, 1, this.height2 / longestedge])), roundededge.rotateY(-90).rotateZ(-90).scale([1, 1, this.height2 / longestedge]));
				box = union(difference(box, cuttool2.rotateY(-90).rotateZ(0).translate([0,0,this.edgeradius+this.thickness]).translate([this.length, 0, 0]).scale([1, 1, this.height2 / longestedge])), roundededge.rotateY(-90).rotateZ(0).translate([this.length, 0, 0]).scale([1, 1, this.height2 / longestedge]));
				box = union(difference(box, cuttool2.rotateY(-90).rotateZ(90).translate([0,0,this.edgeradius+this.thickness]).translate([this.length, this.width, 0]).scale([1, 1, this.height2 / longestedge])), roundededge.rotateY(-90).rotateZ(90).translate([this.length, this.width, 0]).scale([1, 1, this.height2 / longestedge]));
				box = union(difference(box, cuttool2.rotateY(-90).rotateZ(180).translate([0,0,this.edgeradius+this.thickness]).translate([0, this.width, 0]).scale([1, 1, this.height2 / longestedge])), roundededge.rotateY(-90).rotateZ(180).translate([0, this.width, 0]).scale([1, 1, this.height2 / longestedge]));

				var cutSphereOutside = difference(
					cube({size: [this.edgeradius, this.edgeradius, this.edgeradius] }),
					sphere({ r: this.edgeradius })
				).rotateX(180).rotateZ(-90).translate([this.edgeradius, this.edgeradius, this.edgeradius]);

				box = union(box, cutSphereOutside.translate([this.thickness, this.thickness, this.thickness]));
				box = union(box, cutSphereOutside.rotateZ(90).translate([this.length-this.thickness, this.thickness, this.thickness]));
				box = union(box, cutSphereOutside.rotateZ(180).translate([this.length-this.thickness, this.width-this.thickness, this.thickness]));
				box = union(box, cutSphereOutside.rotateZ(270).translate([this.thickness, this.width-this.thickness, this.thickness]));

		                box = difference(box, cutSphereOutside);
		                box = difference(box, cutSphereOutside.rotateZ(90).translate([this.length,0, 0]));
		                box = difference(box, cutSphereOutside.rotateZ(180).translate([this.length, this.width, 0]));
		                box = difference(box, cutSphereOutside.rotateZ(270).translate([0, this.width, 0]));

				box = difference(
					box,
					union(
						cuttool,
						cuttool.rotateZ(90).rotateY(90).scale([1, this.width / longestedge, 1]),
						cuttool.rotateX(90).translate([0, this.width, 0]),
						cuttool.rotateZ(90).rotateY(0).scale([1, this.width / longestedge, 1]).translate([this.length, 0, 0]),
						cuttool.rotateY(-90).rotateZ(-90).scale([1, 1, this.height2 / longestedge]),
						cuttool.rotateY(-90).rotateZ(0).translate([this.length, 0, 0]).scale([1, 1, this.height2 / longestedge]),
						cuttool.rotateY(-90).rotateZ(90).translate([this.length, this.width, 0]).scale([1, 1, this.height2 / longestedge]),
						cuttool.rotateY(-90).rotateZ(180).translate([0, this.width, 0]).scale([1, 1, this.height2 / longestedge]),

						cylinder({r : this.edgeradius, h: this.height}).translate([this.edgeradius+this.thickness, this.edgeradius+this.thickness, this.thickness+this.edgeradius]),
						cylinder({r : this.edgeradius, h: this.height}).translate([this.edgeradius+this.thickness, this.width-this.edgeradius-this.thickness, this.thickness+this.edgeradius]),
						cylinder({r : this.edgeradius, h: this.height}).translate([this.length-this.edgeradius-this.thickness, this.edgeradius+this.thickness, this.thickness+this.edgeradius]),
						cylinder({r : this.edgeradius, h: this.height}).translate([this.length-this.edgeradius-this.thickness, this.width-this.edgeradius-this.thickness, this.thickness+this.edgeradius])
					)
				);
		}

		/* Kerbe */

		var alpha = 90-atan(this.hoverlap*2 / this.thickness);

		box = union(
			box,
			union(
				intersection(
					cube({size: [this.length - 2*this.thickness - 2*this.edgeradius, this.thickness/2, this.hoverlap]}).translate([this.thickness+this.edgeradius, this.thickness/2, this.height2]),
					cube({size: [this.length - 2*this.thickness - 2*this.edgeradius, this.thickness/2, Math.sqrt(this.hoverlap*this.hoverlap+this.thickness*this.thickness/4)]}).rotateX(-alpha).translate([this.thickness+this.edgeradius, this.thickness/2, this.height2])
				),

				intersection(
					cube({size: [this.length - 2*this.thickness - 2*this.edgeradius, this.thickness/2, this.hoverlap]}).translate([this.thickness+this.edgeradius, this.width-this.thickness, this.height2]),
					cube({size: [this.length - 2*this.thickness - 2*this.edgeradius, this.thickness/2, Math.sqrt(this.hoverlap*this.hoverlap+this.thickness*this.thickness/4)]}).translate([0,-this.thickness/2, 0]).rotateX(alpha).translate([0,this.thickness/2, 0]).translate([this.thickness+this.edgeradius, this.width-this.thickness, this.height2])
				),

				intersection(
					cube({size: [this.thickness/2, this.width - 2*this.thickness - 2*this.edgeradius, this.hoverlap]}).translate([this.thickness/2, this.thickness+this.edgeradius, this.height2]),
					cube({size: [this.thickness/2, this.width - 2*this.thickness - 2*this.edgeradius, Math.sqrt(this.hoverlap*this.hoverlap+this.thickness*this.thickness/4)]}).rotateY(alpha).translate([this.thickness/2, this.thickness+this.edgeradius, this.height2])
				),

				intersection(
					cube({size: [this.thickness/2, this.width - 2*this.thickness - 2*this.edgeradius, this.hoverlap]}).translate([this.length-this.thickness, this.thickness+this.edgeradius, this.height2]),
					cube({size: [this.thickness/2, this.width - 2*this.thickness - 2*this.edgeradius, Math.sqrt(this.hoverlap*this.hoverlap+this.thickness*this.thickness/4)]}).translate([-this.thickness/2, 0, 0]).rotateY(-alpha).translate([this.thickness/2, 0, 0]).translate([this.length-this.thickness, this.thickness+this.edgeradius, this.height2])
				)
			)
		);

		box = union(
			box,
			difference(cylinder({r1 : this.edgeradius+this.thickness/2, r2: this.edgeradius, h : this.hoverlap}), cylinder({r : this.edgeradius, h : this.hoverlap})).translate([this.thickness+this.edgeradius,this.thickness+this.edgeradius, this.height2]),
			difference(cylinder({r1 : this.edgeradius+this.thickness/2, r2: this.edgeradius, h : this.hoverlap}), cylinder({r : this.edgeradius, h : this.hoverlap})).translate([this.length-this.thickness-this.edgeradius,this.thickness+this.edgeradius, this.height2]),
			difference(cylinder({r1 : this.edgeradius+this.thickness/2, r2: this.edgeradius, h : this.hoverlap}), cylinder({r : this.edgeradius, h : this.hoverlap})).translate([this.thickness+this.edgeradius,this.width-this.thickness-this.edgeradius, this.height2]),
			difference(cylinder({r1 : this.edgeradius+this.thickness/2, r2: this.edgeradius, h : this.hoverlap}), cylinder({r : this.edgeradius, h : this.hoverlap})).translate([this.length-this.thickness-this.edgeradius,this.width-this.thickness-this.edgeradius, this.height2])
		);


	/*
		box = union(
			box,
			union(
				cube({size: [this.length - 2*this.thickness - 2*this.edgeradius, this.thickness/2, this.hoverlap]}).translate([this.thickness+this.edgeradius, this.thickness/2, this.height2]),
				cube({size: [this.length - 2*this.thickness - 2*this.edgeradius, this.thickness/2, this.hoverlap]}).translate([this.thickness+this.edgeradius, this.width-this.thickness, this.height2]),
				cube({size: [this.thickness/2, this.width - 2*this.thickness - 2*this.edgeradius, this.hoverlap]}).translate([this.thickness/2, this.thickness+this.edgeradius, this.height2]),
				cube({size: [this.thickness/2, this.width - 2*this.thickness - 2*this.edgeradius, this.hoverlap]}).translate([this.length-this.thickness, this.thickness+this.edgeradius, this.height2])
		    	)
	        );
	*/

	/*
		box = union(
			box,
			difference(cylinder({r : this.edgeradius+this.thickness/2, h : this.hoverlap}), cylinder({r : this.edgeradius, h : this.hoverlap})).translate([this.thickness+this.edgeradius,this.thickness+this.edgeradius, this.height2]),
			difference(cylinder({r : this.edgeradius+this.thickness/2, h : this.hoverlap}), cylinder({r : this.edgeradius, h : this.hoverlap})).translate([this.length-this.thickness-this.edgeradius,this.thickness+this.edgeradius, this.height2]),
			difference(cylinder({r : this.edgeradius+this.thickness/2, h : this.hoverlap}), cylinder({r : this.edgeradius, h : this.hoverlap})).translate([this.thickness+this.edgeradius,this.width-this.thickness-this.edgeradius, this.height2]),
			difference(cylinder({r : this.edgeradius+this.thickness/2, h : this.hoverlap}), cylinder({r : this.edgeradius, h : this.hoverlap})).translate([this.length-this.thickness-this.edgeradius,this.width-this.thickness-this.edgeradius, this.height2])
		);
	*/

		box = difference(
			box,
			union(
				cube({size: [this.length-2*this.thickness, this.width-2*this.thickness-2*this.edgeradius, this.hoverlap+0.1]}).translate([this.thickness, this.thickness+this.edgeradius, this.height2-0.1]),
				cube({size: [this.length-2*this.thickness-2*this.edgeradius, this.width-2*this.thickness, this.hoverlap+0.1]}).translate([this.thickness+this.edgeradius, this.thickness, this.height2-0.1])
			)
		);

		return box;
	}

	this.getModelBottom = function() {
		var longestedge = this.width;
		if(this.length > longestedge) { longestedge = this.length; }
		if(this.height > longestedge) { longestedge = this.height; }

		var box = difference(
			cube({ size: [ this.length, this.width, this.height1 ] }),
			cube({ size: [ this.length-2*this.thickness, this.width-2*this.thickness, this.height1-this.thickness ]}).translate([this.thickness, this.thickness, this.thickness])
		);

		/* Rounding edges */

		if(this.edgeradius > 0) {
				var cuttool = difference(
			        	cube({size : [ longestedge, this.edgeradius, this.edgeradius ]}),
				        cylinder({ r : this.edgeradius, h : longestedge }).rotateY(90).translate([0, this.edgeradius, this.edgeradius])
			        );
				var cuttool2 = cube({size : [ longestedge, this.edgeradius+this.thickness, this.edgeradius+this.thickness ]});
				var edgetool = difference(
					cuttool2,
					cylinder({ r : this.edgeradius, h : longestedge-2*this.thickness }).rotateY(90).translate([this.thickness, this.edgeradius+this.thickness, this.edgeradius+this.thickness])
		                );
				var roundededge = difference(
					edgetool,
					cuttool
				);

				box = union(difference(box, cuttool2.scale([this.length / longestedge, 1, 1])), roundededge.scale([this.length / longestedge, 1, 1]));
				box = union(difference(box, cuttool2.rotateZ(90).rotateY(90).scale([1, this.width / longestedge, 1])), roundededge.rotateZ(90).rotateY(90).scale([1, this.width / longestedge, 1]));

		                box = union(difference(box, cuttool2.rotateX(90).translate([0, this.width, 0]).scale([this.length / longestedge, 1, 1])), roundededge.rotateX(90).translate([0, this.width, 0]).scale([this.length / longestedge, 1, 1]));
				box = union(difference(box, cuttool2.rotateZ(90).rotateY(0).scale([1, this.width / longestedge, 1]).translate([this.length, 0, 0])), roundededge.rotateZ(90).rotateY(0).scale([1, this.width / longestedge, 1]).translate([this.length, 0, 0]));

				box = union(difference(box, cuttool2.rotateY(-90).rotateZ(-90).translate([0,0,this.edgeradius+this.thickness]).scale([1, 1, this.height1 / longestedge])), roundededge.rotateY(-90).rotateZ(-90).scale([1, 1, this.height1 / longestedge]));
				box = union(difference(box, cuttool2.rotateY(-90).rotateZ(0).translate([0,0,this.edgeradius+this.thickness]).translate([this.length, 0, 0]).scale([1, 1, this.height1 / longestedge])), roundededge.rotateY(-90).rotateZ(0).translate([this.length, 0, 0]).scale([1, 1, this.height1 / longestedge]));
				box = union(difference(box, cuttool2.rotateY(-90).rotateZ(90).translate([0,0,this.edgeradius+this.thickness]).translate([this.length, this.width, 0]).scale([1, 1, this.height1 / longestedge])), roundededge.rotateY(-90).rotateZ(90).translate([this.length, this.width, 0]).scale([1, 1, this.height1 / longestedge]));
				box = union(difference(box, cuttool2.rotateY(-90).rotateZ(180).translate([0,0,this.edgeradius+this.thickness]).translate([0, this.width, 0]).scale([1, 1, this.height1 / longestedge])), roundededge.rotateY(-90).rotateZ(180).translate([0, this.width, 0]).scale([1, 1, this.height1 / longestedge]));

				var cutSphereOutside = difference(
					cube({size: [this.edgeradius, this.edgeradius, this.edgeradius] }),
					sphere({ r: this.edgeradius })
				).rotateX(180).rotateZ(-90).translate([this.edgeradius, this.edgeradius, this.edgeradius]);

				box = union(box, cutSphereOutside.translate([this.thickness, this.thickness, this.thickness]));
				box = union(box, cutSphereOutside.rotateZ(90).translate([this.length-this.thickness, this.thickness, this.thickness]));
				box = union(box, cutSphereOutside.rotateZ(180).translate([this.length-this.thickness, this.width-this.thickness, this.thickness]));
				box = union(box, cutSphereOutside.rotateZ(270).translate([this.thickness, this.width-this.thickness, this.thickness]));

		                box = difference(box, cutSphereOutside);
		                box = difference(box, cutSphereOutside.rotateZ(90).translate([this.length,0, 0]));
		                box = difference(box, cutSphereOutside.rotateZ(180).translate([this.length, this.width, 0]));
		                box = difference(box, cutSphereOutside.rotateZ(270).translate([0, this.width, 0]));

				box = difference(
					box,
					union(
						cuttool,
						cuttool.rotateZ(90).rotateY(90).scale([1, this.width / longestedge, 1]),
						cuttool.rotateX(90).translate([0, this.width, 0]),
						cuttool.rotateZ(90).rotateY(0).scale([1, this.width / longestedge, 1]).translate([this.length, 0, 0]),
						cuttool.rotateY(-90).rotateZ(-90).scale([1, 1, this.height1 / longestedge]),
						cuttool.rotateY(-90).rotateZ(0).translate([this.length, 0, 0]).scale([1, 1, this.height1 / longestedge]),
						cuttool.rotateY(-90).rotateZ(90).translate([this.length, this.width, 0]).scale([1, 1, this.height1 / longestedge]),
						cuttool.rotateY(-90).rotateZ(180).translate([0, this.width, 0]).scale([1, 1, this.height1 / longestedge]),

						cylinder({r : this.edgeradius, h: this.height}).translate([this.edgeradius+this.thickness, this.edgeradius+this.thickness, this.thickness+this.edgeradius]),
						cylinder({r : this.edgeradius, h: this.height}).translate([this.edgeradius+this.thickness, this.width-this.edgeradius-this.thickness, this.thickness+this.edgeradius]),
						cylinder({r : this.edgeradius, h: this.height}).translate([this.length-this.edgeradius-this.thickness, this.edgeradius+this.thickness, this.thickness+this.edgeradius]),
						cylinder({r : this.edgeradius, h: this.height}).translate([this.length-this.edgeradius-this.thickness, this.width-this.edgeradius-this.thickness, this.thickness+this.edgeradius])
					)
				);
		}

		/* Kerbe */

		box = difference(
			box,
			union(
				cube({size: [this.length - 2*this.thickness - 2*this.edgeradius, this.thickness/2, this.hoverlap]}).translate([this.thickness+this.edgeradius, this.thickness/2, this.height1-this.hoverlap]),
				cube({size: [this.length - 2*this.thickness - 2*this.edgeradius, this.thickness/2, this.hoverlap]}).translate([this.thickness+this.edgeradius, this.width-this.thickness, this.height1-this.hoverlap]),
				cube({size: [this.thickness/2, this.width - 2*this.thickness - 2*this.edgeradius, this.hoverlap]}).translate([this.thickness/2, this.thickness+this.edgeradius, this.height1-this.hoverlap]),
				cube({size: [this.thickness/2, this.width - 2*this.thickness - 2*this.edgeradius, this.hoverlap]}).translate([this.length-this.thickness, this.thickness+this.edgeradius, this.height1-this.hoverlap])
		    	)
	        );

		box = difference(box,
			cylinder({r : this.edgeradius+this.thickness/2, h : this.hoverlap}).translate([this.thickness+this.edgeradius,this.thickness+this.edgeradius, this.height1-this.hoverlap]),
			cylinder({r : this.edgeradius+this.thickness/2, h : this.hoverlap}).translate([this.length-this.thickness-this.edgeradius,this.thickness+this.edgeradius, this.height1-this.hoverlap]),
			cylinder({r : this.edgeradius+this.thickness/2, h : this.hoverlap}).translate([this.thickness+this.edgeradius,this.width-this.thickness-this.edgeradius, this.height1-this.hoverlap]),
			cylinder({r : this.edgeradius+this.thickness/2, h : this.hoverlap}).translate([this.length-this.thickness-this.edgeradius,this.width-this.thickness-this.edgeradius, this.height1-this.hoverlap])
		);

		return box;
	}
}
