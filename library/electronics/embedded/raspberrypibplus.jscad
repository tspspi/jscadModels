/*
	RaspberryPi B+ library
	
	Provides a template and drill pattern for
	Raspberry Pi B+.
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

if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.raspberrypi !== 'object') { window.jscad.tspi.raspberrypi = new Object(); }

/*
	include("/electronics/embedded/raspberrypibplus.jscad");

	if(typeof printerSettings !== 'object') {
	   var printerSettings = {
		  'scale' : 1.0,
		  'correctionInsideDiameter': 1,
		  'correctionOutsideDiameter': 0,
		  'correctionInsideDiameterMoving': 0,
		  'correctionOutsideDiameterMoving': 0,
		  'resolutionCircle': 360
	   };
	}

	function main(params) {
		var raspi3bpl = new window.jscad.tspi.raspberrypi.bplus(printerSettings, { });
		
		return raspi3bpl.getModel();
	}
*/

window.jscad.tspi.raspberrypi.bplus = function(printer, params) {
	knownParameters = [
		{ name: 'mountscrewHeight',				type: 'number',		default: 20				},		// Height of the mountscrews (used for drillpattern)
		{ name: 'mountscrewDiameter',			type: 'number',		default: 2.75			},		// Diameter of mountscrews (hole!)
		{ name: 'details',						type: 'boolean',	default: true			},		// Enable or disable details
		{ name: 'standoffMin',					type: 'number',		default: 2.4			},		// Standoff distance below the PCB
		{ name: 'standoffInclude',				type: 'boolean',	default: false			},		// Should the standoff be included in the model (always included in template!)
	];
	knownPrinterParameters = [
		{ name: 'scale', 						type: 'number', 	default: 1 				},
		{ name: 'correctionInsideDiameter', 	type: 'number', 	default: 0 				},
		{ name: 'correctionOutsideDiameter', 	type: 'number', 	default: 0 				},
		{ name: 'resolutionCircle', 			type: 'number', 	default: 360 			}
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

	
	this.pinheader257 = function(detail) {
		var parts = Array();
		if(!detail) {
			return cube({size: [50.5, 5, 10-1.6]});
		} else {
			parts.push(cube({size: [50.5, 5, 4-1.6]}).setColor([0,0,0]));
			for(var i = 0; i < 20; i++) {
				parts.push(cube({size: [0.5, 0.5, 10-1.6] }).translate([2.5*i + (2.5/2.0) - 0.25, 2.5/2.0 - 0.25, 0]).setColor([255,0,0]));
				parts.push(cube({size: [0.5, 0.5, 10-1.6] }).translate([2.5*i + (2.5/2.0) - 0.25, 2.5/2.0+2.5 - 0.25, 0]).setColor([255,0,0]));
			}
			return union(parts);
		}
	}

	this.getModel = function() {
		var mountscrewHeight = (this.parameters['mountscrewHeight'] < 1.6+this.parameters['standoffMin']) ? (1.6+this.parameters['standoffMin']) : this.parameters['mountscrewHeight'];

		var parts = Array();
		var drills = Array();

        var pcbThick = 1.6;
        if(this.parameters['standoffInclude']) {
            pcbThick += standoffMin;
        }

		parts.push(cube({ size: [ 85-2*3.0, 56, pcbThick ], center: false }).translate([3.0, 0 , 0]));
		parts.push(cube({ size: [ 3.0, 56-2*3.0, pcbThick], center: false }).translate([0, 3, 0]));
		parts.push(cube({ size: [ 3.0, 56-2*3.0, pcbThick], center: false }).translate([85-3, 3, 0]));

		parts.push(cylinder({ r: 3.0, h: pcbThick, center: false }).translate([85-3, 56-3, 0]));
		parts.push(cylinder({ r: 3.0, h: pcbThick, center: false }).translate([3, 56-3, 0]));
		parts.push(cylinder({ r: 3.0, h: pcbThick, center: false }).translate([85-3, 3, 0]));
		parts.push(cylinder({ r: 3.0, h: pcbThick, center: false }).translate([3, 3, 0]));
		
		drills.push(cylinder({ r: 2.75/2.0, h: pcbThick, center: false}).translate([3.5, 3.5, 0]));
		drills.push(cylinder({ r: 2.75/2.0, h: pcbThick, center: false}).translate([3.5, 3.5+49, 0]));
		drills.push(cylinder({ r: 2.75/2.0, h: pcbThick, center: false}).translate([3.5+58, 3.5, 0]));
		drills.push(cylinder({ r: 2.75/2.0, h: pcbThick, center: false}).translate([3.5+58, 3.5+49, 0]));

		/* Created PCB */
		var pcb = difference(union(parts), union(drills)).setColor([0,100,0]);
		if(this.parameters['standoffInclude']) {
			pcb = pcb.translate([0,0,-this.parameters['standoffMin']]);
		}

		/* Connectors */
		var parts = Array();
		var drills = Array();
		
		/* USB */
		parts.push(cube({ size: [ 17.3, 13, 17-1.6 ], center: false }).translate([69.5, 40.5, 1.6]));
		parts.push(cube({ size: [ 17.3, 13, 17-1.6 ], center: false }).translate([69.5, 23, 1.6]));

		/* Ethernet */
		parts.push(cube({ size: [ 21, 16, 15-1.6 ], center: false }).translate([66, 2, 1.6]));

		/* GPIO Header */
		parts.push(this.pinheader257(this.parameters['details']).translate([7,50,1.6]));
		
		/* SD Card Holder */
		parts.push(cube({ size: [ 17, 14, 3-1.3 ], center: false }).translate([ 0.7,22, -(3-1.3)]));
		parts.push(cube({ size: [ 14, 11, 3-1.3 ], center: false }).translate([-2.5,22, -(3-1.3)]));
		
		/* DDI Connector */
		parts.push(cube({ size: [3,21,7-1.6], center: false }).translate([2.7,17,1.6]).setColor([0,0,0]));
		
		/* Power connector (Micro USB)*/
		parts.push(cube({size: [7.5, 5.6, 4-1.6]}).translate([6.5, -1, 1.6]));
		
		/* HDMI */
		parts.push(cube({size: [15, 10.5, 8-1.6]}).translate([24, -1, 1.6]));
		
		/* DCI Connector */
		parts.push(cube({ size: [3,21,7-1.6], center: false }).translate([43.5,1,1.6]).setColor([0,0,0]));
		
		/* RCA */
		parts.push(cube({size: [7, 12.5, 7.4-1.6]}).translate([50, 0, 1.6]));
		parts.push(cylinder({r: 3.0, h: 15, center: true}).rotateX(90).translate([50+3.5, 12.5-15+7.5, 1.6+(7.4-1.6)/2]));

        /* CPU and Controllers */
        if(this.parameters['details']) {
            parts.push(cube({size: [12,12,3-1.6]}).translate([23,24,1.6]).setColor([0,0,0]));
            parts.push(cube({size: [9,9,3-1.6]}).translate([53,30,1.6]).setColor([0,0,0]));
        }
		
		return union(
			pcb,
			parts
		).scale(this.printer['scale']);
	}
	
	this.getTemplate = function() {
		var oldDetails = this.parameters['details'];
		this.parameters['details'] = false;
		var res = this.getModel();
		this.parameters['details'] = oldDetails;
		return res;
	}
	
	this.getDrillPattern = function() {
		var drills = Array();
		drills.push(cylinder({ r: this.parameters['mountscrewDiameter']/2.0, h: this.parameters['mountscrewHeight'], center: false}).translate([3.5, 3.5, 1.6-this.parameters['mountscrewHeight']]));
		drills.push(cylinder({ r: this.parameters['mountscrewDiameter']/2.0, h: this.parameters['mountscrewHeight'], center: false}).translate([3.5, 3.5+49, 1.6-this.parameters['mountscrewHeight']]));
		drills.push(cylinder({ r: this.parameters['mountscrewDiameter']/2.0, h: this.parameters['mountscrewHeight'], center: false}).translate([3.5+58, 3.5, 1.6-this.parameters['mountscrewHeight']]));
		drills.push(cylinder({ r: this.parameters['mountscrewDiameter']/2.0, h: this.parameters['mountscrewHeight'], center: false}).translate([3.5+58, 3.5+49, 1.6-this.parameters['mountscrewHeight']]));
		return union(drills).scale(this.printer['scale']);
	}
}
