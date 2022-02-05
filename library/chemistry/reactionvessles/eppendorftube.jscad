/*
    Eppendorf tube templates.

		Currently supported tube sizes:
			0.5 ml
			1.5 ml

    These templates have been used in the design for a thermocycler
    and centrifuge for laboratory scale PCR.

    If you think this code was useful BTC
    contributions are welcome at
    19sKN38N4yxWZXoZeAdXZb5rq9xk32aDP4
*/


/*
	Usage example:
	--------------

	include('/chemistry/reactionvessles/eppendorftube.jscad');

	function main() {
		let obj = new window.jscad.tspi.chemistry.reactionvessles.eppendorftube({},{ resolutionCircle : 128 });
		return obj.getTemplate();
	}

*/

if(typeof window !== 'object') { window = new Object(); }
if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.chemistry !== 'object') { window.jscad.tspi.chemistry = new Object(); }
if(typeof window.jscad.tspi.chemistry.reactionvessles !== 'object') { window.jscad.tspi.chemistry.reactionvessles = new Object(); }

window.jscad.tspi.chemistry.reactionvessles.eppendorftube = function(printer, params) {
	knownParameters = [
		{ name : 'tubesize',			type : 'number',		default : 1.5	},
	];

	knownPrinterParameters = [
		{ name: 'scale',                         type: 'number',     default: 1         },
		{ name: 'correctionInsideDiameter',     type: 'number',     default: 0         },
		{ name: 'correctionOutsideDiameter',     type: 'number',     default: 0         },
		{ name: 'resolutionCircle',             type: 'number',     default: 32     },
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

	this.tubespecs = [
		{ fill : 1.5, d1 : 20, d2 : 10.8, d3 : 10.7, dr : 3.6, h1 : 2, h2 : 20, h3 : 37.8, h4 : 38.9 },
		{ fill : 0.5, d1 : 18, d2 :  7.8, d3 : 7.3, dr : 2.4, h1 : 2, h2 : 16.5, h3 : 29.2, h4 : 30.0 }
	];

	this.specs = this.tubespecs[0];
	for(i = 0; i < this.tubespecs.length; i++) {
		if(this.parameters['tubesize'] == this.tubespecs[i].fill) {
			this.specs = this.tubespecs[i];
		}
	}

	this.getTemplate = function() {
		let d1 = this.specs.d1;
		let d2 = this.specs.d2;
		let d3 = this.specs.d3;
		let dr = this.specs.dr;
		let h1 = this.specs.h1;
		let h2 = this.specs.h2;
		let h3 = this.specs.h3;
		let h4 = this.specs.h4;
		let fn = this.printer['resolutionCircle'];

		let ri = dr / 2;
		let h5 = ri + (h4 - h3);

		let tube = union(
			cylinder({ d : d1, h : h1, center : true, fn : fn}).translate([0,0,-h1/2 +h4]),
			cylinder({ d1 : d3, d2 : d2, h : h2 - h1, center : true, fn : fn}).translate([0,0,-(h2-h1)/2 + h4 - h1]),
			cylinder({ d1 : 2*h5, d2 : d3, h : h3 - h2, center : true, fn : fn}).translate([0,0,-(h3-h2)/2 + h4 - h2]),
			sphere({ r : h5, center : true, fn : fn }).translate([0,0,h5/2])
		);

		return tube;
	}
}
