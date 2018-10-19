/*
	Parameterizeable test tube holder

	Note that test tubes normally have norm size:
						Height		Inside diameter		Outside diameter
		Small			100 mm		11 mm				13 mm
		Large			150 mm		14 mm				16 mm
		Extra large		150 mm		17 mm				20 mm
	
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


function getParameterDefinitions() {
    /*
        This function returns a list of all user configureable
        options (used to parameterize the model).
    */
    return [
		{ name: 'grpTube', type: 'group', caption: 'Test tube settings' },
		{ name: 'tubeDiameter', type: 'float', caption: 'Tube outer diameter', default: 13 },
		{ name: 'tubeHeight', type: 'float', caption: 'Tube height', default: 100 },

		{ name: 'grpHolder', type: 'group', caption: 'Holder settings' },
		{ name: 'rows', type: 'int', caption: 'Rows', default: 5 },
		{ name: 'cols', type: 'int', caption: 'Columns', default: 2 },
		{ name: 'thickness', type: 'int', caption: 'Wall thickness', default: 1 },
		
		{ name: 'grpPrinter', type: 'group', caption: 'Printer' },
		{ name: 'scale', default: 1.0, type: 'float', caption: 'Scale' },
		{ name: 'correctionInsideDiameter', default: 1, type: 'float', caption: 'Inside diameter correction' },
		{ name: 'correctionOutsideDiameter', default: 0, type: 'float', caption: 'Outside diameter correction' },
		{ name: 'correctionInsideDiameterMoving', default: 0, type: 'float', caption: 'Inside diameter correction (moving)' },
		{ name: 'correctionOutsideDiameterMoving', default: 0, type: 'float', caption: 'Outside diameter correction (moving)' },
		{ name: 'resolutionCircle', default: 360, type: 'int', caption: 'Circle resolution (steps)' }
    ];
}

function testTubeRack(printer, params) {
	/*
		First we check if there is already a printer definition loaded.
		If not we use the settings from the user-configureable parameters
	*/
	if(typeof printerSettings !== 'object') {
		var printerSettings = {
			'scale' : params.scale,
			'correctionInsideDiameter' : params.correctionInsideDiameter,
			'correctionOutsideDiameter' : params.correctionOutsideDiameter,
			'correctionInsideDiameterMoving' : params.correctionInsideDiameterMoving,
			'correctionOutsideDiameterMoving' : params.correctionOutsideDiameterMoving,
			'resolutionCircle' : params.resolutionCircle
		};
	}

	/* Load settings */

	knownPrinterParameters = [
		{ name: 'scale', 						type: 'number', 	default: 1 		},
		{ name: 'correctionInsideDiameter', 	type: 'number', 	default: 0 		},
		{ name: 'correctionOutsideDiameter', 	type: 'number', 	default: 0 		},
		{ name: 'resolutionCircle', 			type: 'number', 	default: 12 	},
	];

	knownParameters = [
		{ name: 'tubeDiameter',					type: 'number',		default: 13		},
		{ name: 'tubeHeight',					type: 'number',		default: 100	},
		{ name: 'rows',							type: 'number',		default: 5		},
		{ name: 'cols',							type: 'number',		default: 2		},
		{ name: 'thickness',					type: 'number',		default: 1		},
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
		/* Generate structure */
		var struct = union(
			cube({size: [(2*this.parameters.rows+1)*this.parameters.tubeDiameter, (2*this.parameters.cols+1)*this.parameters.tubeDiameter, this.parameters.thickness]}),	// Bottom
			cube({size: [(2*this.parameters.rows+1)*this.parameters.tubeDiameter, (2*this.parameters.cols+1)*this.parameters.tubeDiameter, this.parameters.thickness]}).translate([0,0,1/3*this.parameters.tubeHeight]),	// Middle
			cube({size: [(2*this.parameters.rows+1)*this.parameters.tubeDiameter, (2*this.parameters.cols+1)*this.parameters.tubeDiameter, this.parameters.thickness]}).translate([0,0,2/3*this.parameters.tubeHeight]),	// Upper
			cube({size: [this.parameters.thickness, (2*this.parameters.cols+1)*this.parameters.tubeDiameter, 2/3*this.parameters.tubeHeight+this.parameters.thickness]}).translate([-this.parameters.thickness,0,0]),
			cube({size: [this.parameters.thickness, (2*this.parameters.cols+1)*this.parameters.tubeDiameter, 2/3*this.parameters.tubeHeight+this.parameters.thickness]}).translate([(2*this.parameters.rows+1)*this.parameters.tubeDiameter,0,0])
		);
		var holes = [];
		for(x = 0; x < this.parameters.rows; x++) {
			for(y = 0; y < this.parameters.cols; y++) {
				holes.push(cylinder({r : this.parameters.tubeDiameter/8 + this.printer.correctionInsideDiameter/2, h: this.parameters.thickness, center: false, fn: this.printer.resolutionCircle}).translate([3/2*this.parameters.tubeDiameter + x*this.parameters.tubeDiameter*2, 3/2*this.parameters.tubeDiameter + y*this.parameters.tubeDiameter*2, 0]));
				holes.push(cylinder({r : this.parameters.tubeDiameter/2 + this.printer.correctionInsideDiameter/2, h: this.parameters.thickness, center: false, fn: this.printer.resolutionCircle}).translate([3/2*this.parameters.tubeDiameter + x*this.parameters.tubeDiameter*2, 3/2*this.parameters.tubeDiameter + y*this.parameters.tubeDiameter*2, 1/3*this.parameters.tubeHeight]));
				holes.push(cylinder({r : this.parameters.tubeDiameter/2 + this.printer.correctionInsideDiameter/2, h: this.parameters.thickness, center: false, fn: this.printer.resolutionCircle}).translate([3/2*this.parameters.tubeDiameter + x*this.parameters.tubeDiameter*2, 3/2*this.parameters.tubeDiameter + y*this.parameters.tubeDiameter*2, 2/3*this.parameters.tubeHeight]));
			}
		}

		return difference(
			struct,
			union(holes)
		).scale(this.printer.scale);
	}
}

function main(params) {
	var tr = new testTubeRack(params, params);

	return tr.getModel();
}