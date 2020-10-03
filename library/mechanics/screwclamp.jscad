/*
	Basic screw clamps for rods, wires, etc.

	Requires:
		include('/mechanics/isothread.jscad');

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
	Example:

	function main() {
		let obj = new window.jscad.tspi.mechanics.basicScrewclamp({}, { m : 3, screwLength : 30, rodDiameter : 8 });
		return obj.getModel();
	}

	In case one also wants to display the nut and the screw templates one can
	simply set the onlyPrintedPart parameter to false:

	function main() {
    	let obj = new window.jscad.tspi.mechanics.basicScrewclamp({}, { m : 3, screwLength : 30, rodDiameter : 8, onlyPrintedPart : false });
    	return obj.getModel();
	}
*/
if(typeof window === 'undefined') { window = new Object(); }
if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.mechanics !== 'object') { window.jscad.tspi.mechanics = new Object(); }

window.jscad.tspi.mechanics.basicScrewclamp = function(printer, params) {
	let knownParameters = [
		{ name: 'm',				type: 'number',					default: -1				},
		{ name: 'screwLength',		type: 'number',					default: -1				},
		{ name: 'rodDiameter',		type: 'number',					default: -1				},
		{ name: 'onlyPrintedPart',	type: 'boolean',				default: true			},
		{ name: 'slitWidth',		type: 'number',					default: 0				},
		{ name: 'minWallThickness',	type: 'number',					default: 1				},
	];

	let knownPrinterParameters = [
		{ name: 'scale', 						type: 'number', 	default: 1 		},
		{ name: 'correctionInsideDiameter', 	type: 'number', 	default: 0 		},
		{ name: 'correctionOutsideDiameter', 	type: 'number', 	default: 0 		},
		{ name: 'resolutionCircle', 			type: 'number', 	default: 360 	},
	];

	this.parameters = { };
	this.printer = { };
	this.error = false;
	this.rawPrinterObject = printer;

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
		let wireDiameter = this.parameters['rodDiameter'] || 2.4;
		let metricNutDimension = this.parameters['m'] || 3;
		let wireMountScrewLength = this.parameters['screwLength'] || 20;
		let wireMountSlitWidth = (this.parameters['slitWidth'] == 0) ? Math.max((wireDiameter/2), 1) : this.parameters['slitWidth'];

		let displayPrintedPartOnly = this.parameters['onlyPrintedPart'] || false;

		let minWallSize = this.parameters['minWallThickness'] || 1;

		let modelWireMountNut = new window.jscad.tspi.isoNut(this.rawPrinterObject, { m :  metricNutDimension });
		let modelWireMountScrew = new window.jscad.tspi.iso4762Screw(this.rawPrinterObject, { m : metricNutDimension, l : wireMountScrewLength, throughhole : true });

		let objWireMountNutFilled = union(modelWireMountNut.getModel(), cylinder({ d : modelWireMountNut.getThroughholeMedium(), h : modelWireMountNut.getHeight(), center : true, fn : this.printer['resolutionCircle'] }));
		let objWireMountNut = modelWireMountNut.getModel();
		let objWireMountScrew = modelWireMountScrew.getTemplate();

		let fixtureBlockThickness = Math.max(
			2*modelWireMountNut.getRadiusOutside()+(2*minWallSize),
			modelWireMountScrew.dk+2, /* ToDo: Exchange with a to be implemented getRadiusOutside function that honors the inside diameter correction! */
			modelWireMountScrew.throughhole_coarse/2 + modelWireMountNut.getRadiusOutside() + wireDiameter + (3*minWallSize)
		);
		let fixtureBlockHeight = Math.max(
			2*modelWireMountNut.getRadiusOutside()+(2*minWallSize),
			modelWireMountScrew.dk+(2*minWallSize)
		);
		let fixtureBlockLength = wireMountScrewLength + modelWireMountScrew.k;

		let objWire = cylinder({ d : wireDiameter, h : fixtureBlockHeight, center : true, fn : this.printer['resolutionCircle'] }).translate([0,0, fixtureBlockHeight/2]);

		let objFixtureBlock = difference(
			cube({size : [fixtureBlockLength, fixtureBlockThickness, fixtureBlockHeight]}).translate([-fixtureBlockLength/2, -wireDiameter/2-minWallSize,0]),
			objWire
		);
		objFixtureBlock = difference(
			objFixtureBlock,
			objWireMountNutFilled.rotateY(90).translate([-modelWireMountNut.getHeight()/2 + fixtureBlockLength/2, -wireDiameter/2-minWallSize + fixtureBlockThickness - modelWireMountNut.getRadiusOutside() - minWallSize, modelWireMountNut.getRadiusOutside() + minWallSize])
		);
		objFixtureBlock = difference(
			objFixtureBlock,
			objWireMountScrew.rotateY(-90).translate([fixtureBlockLength/2,-wireDiameter/2-minWallSize + fixtureBlockThickness - modelWireMountNut.getRadiusOutside() - minWallSize,modelWireMountNut.getRadiusOutside() + minWallSize])
		);

		objFixtureBlock = difference(
			objFixtureBlock,
			cube({size : [(wireMountSlitWidth+this.printer['correctionInsideDiameter']), fixtureBlockThickness-wireDiameter/2-minWallSize, fixtureBlockHeight ]}).translate([-(wireMountSlitWidth+this.printer['correctionInsideDiameter'])/2, 0, 0])
		);

		let objMount = {};
		if(displayPrintedPartOnly) {
			objMount = objFixtureBlock;
		} else {
			objMount = union(
				objWireMountNut.rotateY(90).translate([-modelWireMountNut.getHeight()/2 + fixtureBlockLength/2, -wireDiameter/2-minWallSize + fixtureBlockThickness - modelWireMountNut.getRadiusOutside() - minWallSize, modelWireMountNut.getRadiusOutside() + minWallSize]).setColor([0.7, 0.7, 0.7]),
				objWireMountScrew.rotateY(-90).translate([fixtureBlockLength/2,-wireDiameter/2-minWallSize + fixtureBlockThickness - modelWireMountNut.getRadiusOutside() - minWallSize,modelWireMountNut.getRadiusOutside() + minWallSize]),
				objFixtureBlock
			);
		}

		return objMount.scale(this.printer['scale']);
	}

	this.getOffsetBelowRod = function() {
		return this.parameters['rodDiameter']/2 + this.parameters['minWallThickness'];
	}

	this.getClampThickness = function() {
		let wireDiameter = this.parameters['rodDiameter'] || 2.4;
		let metricNutDimension = this.parameters['m'] || 3;
		let wireMountScrewLength = this.parameters['screwLength'] || 20;
		let wireMountSlitWidth = (this.parameters['slitWidth'] == 0) ? Math.max((wireDiameter/2), 1) : this.parameters['slitWidth'];

		let displayPrintedPartOnly = this.parameters['onlyPrintedPart'] || false;

		let minWallSize = this.parameters['minWallThickness'] || 1;

		let modelWireMountNut = new window.jscad.tspi.isoNut(this.rawPrinterObject, { m :  metricNutDimension });
		let modelWireMountScrew = new window.jscad.tspi.iso4762Screw(this.rawPrinterObject, { m : metricNutDimension, l : wireMountScrewLength, throughhole : true });

		let objWireMountNutFilled = union(modelWireMountNut.getModel(), cylinder({ d : modelWireMountNut.getThroughholeMedium(), h : modelWireMountNut.getHeight(), center : true, fn : this.printer['resolutionCircle'] }));
		let objWireMountNut = modelWireMountNut.getModel();
		let objWireMountScrew = modelWireMountScrew.getTemplate();

		let fixtureBlockThickness = Math.max(
			2*modelWireMountNut.getRadiusOutside()+(2*minWallSize),
			modelWireMountScrew.dk+2, /* ToDo: Exchange with a to be implemented getRadiusOutside function that honors the inside diameter correction! */
			modelWireMountScrew.throughhole_coarse/2 + modelWireMountNut.getRadiusOutside() + wireDiameter + (3*minWallSize)
		);
		let fixtureBlockHeight = Math.max(
			2*modelWireMountNut.getRadiusOutside()+(2*minWallSize),
			modelWireMountScrew.dk+(2*minWallSize)
		);
		let fixtureBlockLength = wireMountScrewLength + modelWireMountScrew.k;

		return fixtureBlockHeight;
	}

	this.getClampSizeX = function() {
		let wireDiameter = this.parameters['rodDiameter'] || 2.4;
		let metricNutDimension = this.parameters['m'] || 3;
		let wireMountScrewLength = this.parameters['screwLength'] || 20;
		let wireMountSlitWidth = (this.parameters['slitWidth'] == 0) ? Math.max((wireDiameter/2), 1) : this.parameters['slitWidth'];

		let displayPrintedPartOnly = this.parameters['onlyPrintedPart'] || false;

		let minWallSize = this.parameters['minWallThickness'] || 1;

		let modelWireMountNut = new window.jscad.tspi.isoNut(this.rawPrinterObject, { m :  metricNutDimension });
		let modelWireMountScrew = new window.jscad.tspi.iso4762Screw(this.rawPrinterObject, { m : metricNutDimension, l : wireMountScrewLength, throughhole : true });

		let objWireMountNutFilled = union(modelWireMountNut.getModel(), cylinder({ d : modelWireMountNut.getThroughholeMedium(), h : modelWireMountNut.getHeight(), center : true, fn : this.printer['resolutionCircle'] }));
		let objWireMountNut = modelWireMountNut.getModel();
		let objWireMountScrew = modelWireMountScrew.getTemplate();

		let fixtureBlockThickness = Math.max(
			2*modelWireMountNut.getRadiusOutside()+(2*minWallSize),
			modelWireMountScrew.dk+2, /* ToDo: Exchange with a to be implemented getRadiusOutside function that honors the inside diameter correction! */
			modelWireMountScrew.throughhole_coarse/2 + modelWireMountNut.getRadiusOutside() + wireDiameter + (3*minWallSize)
		);
		let fixtureBlockHeight = Math.max(
			2*modelWireMountNut.getRadiusOutside()+(2*minWallSize),
			modelWireMountScrew.dk+(2*minWallSize)
		);
		let fixtureBlockLength = wireMountScrewLength + modelWireMountScrew.k;

		return fixtureBlockLength;
	}

	this.getClampSizeY = function() {
		let wireDiameter = this.parameters['rodDiameter'] || 2.4;
		let metricNutDimension = this.parameters['m'] || 3;
		let wireMountScrewLength = this.parameters['screwLength'] || 20;
		let wireMountSlitWidth = (this.parameters['slitWidth'] == 0) ? Math.max((wireDiameter/2), 1) : this.parameters['slitWidth'];

		let displayPrintedPartOnly = this.parameters['onlyPrintedPart'] || false;

		let minWallSize = this.parameters['minWallThickness'] || 1;

		let modelWireMountNut = new window.jscad.tspi.isoNut(this.rawPrinterObject, { m :  metricNutDimension });
		let modelWireMountScrew = new window.jscad.tspi.iso4762Screw(this.rawPrinterObject, { m : metricNutDimension, l : wireMountScrewLength, throughhole : true });

		let objWireMountNutFilled = union(modelWireMountNut.getModel(), cylinder({ d : modelWireMountNut.getThroughholeMedium(), h : modelWireMountNut.getHeight(), center : true, fn : this.printer['resolutionCircle'] }));
		let objWireMountNut = modelWireMountNut.getModel();
		let objWireMountScrew = modelWireMountScrew.getTemplate();

		let fixtureBlockThickness = Math.max(
			2*modelWireMountNut.getRadiusOutside()+(2*minWallSize),
			modelWireMountScrew.dk+2, /* ToDo: Exchange with a to be implemented getRadiusOutside function that honors the inside diameter correction! */
			modelWireMountScrew.throughhole_coarse/2 + modelWireMountNut.getRadiusOutside() + wireDiameter + (3*minWallSize)
		);
		let fixtureBlockHeight = Math.max(
			2*modelWireMountNut.getRadiusOutside()+(2*minWallSize),
			modelWireMountScrew.dk+(2*minWallSize)
		);
		let fixtureBlockLength = wireMountScrewLength + modelWireMountScrew.k;

		return fixtureBlockThickness;
	}
}
