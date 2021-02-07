/*
	Alu profile templates

	Currently supported:
		B-Type 20x20, Nut 6

	Requires:
		include('/mechanics/aluprofile.jscad');

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

	include('/mechanics/aluprofile.jscad');
	function main() {
		let obj = new window.jscad.tspi.mechanics.aluprofile.b20x20n6({}, { l : 100 });
		return obj.getTemplate();
	}
*/

/*
	Simple cube example:

	include('/mechanics/aluprofile.jscad');
	function main() {
		let obj1 = new window.jscad.tspi.mechanics.aluprofile.b20x20n6({}, { l : 100 });
		let obj2 = new window.jscad.tspi.mechanics.aluprofile.b20x20n6({}, { l : 100-2*20 });

		obj1 = obj1.getTemplate();
		obj2 = obj2.getTemplate();

		return union(
		    obj2.translate([ 40,  40, 50]),
		    obj2.translate([-40,  40, 50]),
		    obj2.translate([ 40, -40, 50]),
		    obj2.translate([-40, -40, 50]),
		    obj1.rotateX(90).translate([40, 0, 10]),
		    obj1.rotateX(90).translate([-40, 0, 10]),
		    obj2.rotateY(90).translate([0, -40, 10]),
		    obj2.rotateY(90).translate([0,  40, 10]),
		    obj1.rotateX(90).translate([40, 0, 90]),
		    obj1.rotateX(90).translate([-40, 0, 90]),
		    obj2.rotateY(90).translate([0, -40, 90]),
		    obj2.rotateY(90).translate([0,  40, 90])
        );
	}
*/


if(typeof window === 'undefined') { window = new Object(); }
if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.mechanics !== 'object') { window.jscad.tspi.mechanics = new Object(); }
if(typeof window.jscad.tspi.mechanics.aluprofile !== 'object') { window.jscad.tspi.mechanics.aluprofile = new Object(); }

window.jscad.tspi.mechanics.aluprofile.b20x20n6 = function(printer, params) {
	let knownParameters = [
		{ name: 'l',				type: 'number',					default: -1				},
		{ name: 'nx',				type: 'number',					default: 1				},
		{ name: 'ny',				type: 'number',					default: 1				},
		{ name: 'borehole',			type: 'number',					default: 5.5			},
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

	this.getTemplate = function() {
		let profile = cube({ size : [ 20, 20, this.parameters['l']], center : true });

		let cutTool = difference(
			cube({ size : [ 1.5, 1.5, this.parameters['l']], center : true }),
			cylinder({ r : 1.5, h : this.parameters['l'], center : true, fn : this.printer['resolutionCircle'] }).translate([-1.5/2, -1.5/2, 0 ])
		);

		profile = difference(
			profile,
			cylinder( { d : this.parameters['borehole'], h : this.parameters['l'], center : true })
		);

		let nutslotPoly =  new CSG.Polygon2D([
			[ 3, 10 ],
			[ 3, 8.2 ],
			[ 5.5, 8.2 ],
			[ 5.5, 7.5 ],
			[ 3, 4.5 ],
			[-3, 4.5],
			[-5.5, 7.5],
			[-5.5, 8.2],
			[-3, 8.2],
			[-3, 10]
		], true);
		let nutCutTool = linear_extrude({ height : this.parameters['l'] }, nutslotPoly).translate([0,0,-this.parameters['l']/2]);

		profile = difference(profile, nutCutTool);
		profile = difference(profile, nutCutTool.rotateZ(90));
		profile = difference(profile, nutCutTool.rotateZ(180));
		profile = difference(profile, nutCutTool.rotateZ(270));

		if((this.parameters['nx'] > 1) || (this.parameters['ny'] > 1)) {
			let assembly = [];

			for(let ix = 0; ix < this.parameters['nx']; ix++) {
				for(let iy = 0; iy < this.parameters['ny']; iy++) {
					assembly.push(profile.translate([20 * ix, 20 * iy, 0]));
				}
			}

			profile = union(assembly).translate([10 - 20*this.parameters['nx']/2, 10 - 20*this.parameters['ny']/2, 0]);
		}

		profile = difference(
			profile,
			union(
				cutTool.translate([(20*this.parameters['nx']/2)-1.5/2, (20*this.parameters['ny']/2)-1.5/2, 0]),
				cutTool.translate([(20*this.parameters['nx']/2)-1.5/2, (20*this.parameters['ny']/2)-1.5/2, 0]).rotateZ(90),
				cutTool.translate([(20*this.parameters['nx']/2)-1.5/2, (20*this.parameters['ny']/2)-1.5/2, 0]).rotateZ(180),
				cutTool.translate([(20*this.parameters['nx']/2)-1.5/2, (20*this.parameters['ny']/2)-1.5/2, 0]).rotateZ(270)
			)
		);


		return profile.setColor([0.9, 0.9, 0.9]);
	}
}
