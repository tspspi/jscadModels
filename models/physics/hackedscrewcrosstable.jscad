/*
	Simple crew actuated spring loaded cross table

	Note that this really was just a quick hack (maybe I'll do a clean model
	soon) since I required an hacked adjustable tungsten filament holder for an
	electron source for which I'd only print the two outer frames.

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

include('/mechanics/isothread.jscad');

function getParameterDefinitions() {
    /*
        This function returns a list of all user configureable
        options (used to parameterize the model).
    */
    return [
		{ name: 'grpGlobal', type: 'group', caption: 'Global settings' },
		{ name: 'guiderodDiameter', type: 'float', caption: 'Guiderod diameter', default: 3 },
		{ name: 'guiderodSpringDia', type: 'float', caption: 'Guiderod diameter', default: 5 },
		{ name: 'screwM', type: 'float', caption: 'Metric screw size', default: 4 },
		{ name: 'screwLen', type: 'float', caption: 'Metric length', default: 20 },
		{ name: 'minWallWidth', type: 'float', caption: 'Minimum wall width', default: 2 },

		{ name: 'grpTable', type: 'group', caption: 'Table settings' },
		{ name: 'tableInsideX', type: 'float', caption: 'Table inside width', default: 10 },
		{ name: 'tableInsideY', type: 'float', caption: 'Table inside depth', default: 10 },
		{ name: 'tableInsideZ', type: 'float', caption: 'Table inside thickness', default: 10 },

		{ name: 'grpAxisX', type: 'group', caption: 'First axis (inner axis)' },
		{ name: 'axis1Distance', type: 'float', caption: 'First axis length', default: 20 },

		{ name: 'grpAxisY', type: 'group', caption: 'First axis (outside axis)' },
		{ name: 'axis2Distance', type: 'float', caption: 'Second axis length', default: 20 },

		{ name: 'grpPrinter', type: 'group', caption: 'Printer' },
		{ name: 'scale', default: 1.0, type: 'float', caption: 'Scale' },
		{ name: 'correctionInsideDiameter', default: 1, type: 'float', caption: 'Inside diameter correction' },
		{ name: 'correctionOutsideDiameter', default: 0, type: 'float', caption: 'Outside diameter correction' },
		{ name: 'correctionInsideDiameterMoving', default: 0, type: 'float', caption: 'Inside diameter correction (moving)' },
		{ name: 'correctionOutsideDiameterMoving', default: 0, type: 'float', caption: 'Outside diameter correction (moving)' },
		{ name: 'resolutionCircle', default: 32, type: 'int', caption: 'Circle resolution (steps)' }
    ];
}

function screwCrossTable(printer, params) {
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
		{ name: 'guiderodDiameter',				type: 'number',		default: 3		},
		{ name: 'guiderodSpringDia',			type: 'number',		default: 5		},
		{ name: 'screwM',						type: 'number',		default: 4		},
		{ name: 'screwLen',						type: 'number',		default: 20		},
		{ name: 'minWallWidth',					type: 'number',		default: 1		},
		{ name: 'frameWallWidth',				type: 'number',		default: 3		},
		{ name: 'minSpacing',					type: 'number',		default: 2		},

		{ name: 'tableInsideX',					type: 'number',		default: 10		},
		{ name: 'tableInsideY',					type: 'number',		default: 10		},
		{ name: 'tableInsideZ',					type: 'number',		default: 10		},

		{ name: 'axis1Distance',				type: 'number',		default: 20		},
		{ name: 'axis2Distance',				type: 'number',		default: 20		},
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

	this.nut = new window.jscad.tspi.isoNut( printer, { m : this.parameters['screwM']  });

	this.getModel = function() {
		let nonPrintables = [];

		let minWallWidth = this.parameters['minWallWidth'];

		let realGuiderodParameter = this.parameters['guiderodDiameter'] + this.printer['correctionInsideDiameter'];
		let realTableHeight = Math.max(this.parameters['tableInsideZ'], realGuiderodParameter + 2*this.parameters['minWallWidth'], this.nut.getRadiusOutside()*2 + 2*minWallWidth);
		let realTableWidth = this.parameters['tableInsideY'] + 4*this.parameters['minWallWidth'] + 2*realGuiderodParameter;
		// Model for the inner table ...
		let innerTable = difference(
			cube({ size : [this.parameters['tableInsideX'], realTableWidth, realTableHeight], center : true }).translate([0,0,realTableHeight/2]),
			union(
				cylinder({ d : realGuiderodParameter, h : this.parameters['tableInsideX'], center : true, fn : this.printer['resolutionCircle']}).rotateY(90).translate([0,   realTableWidth/2 - this.parameters['minWallWidth'] - realGuiderodParameter/2, realTableHeight/2]),
				cylinder({ d : realGuiderodParameter, h : this.parameters['tableInsideX'], center : true, fn : this.printer['resolutionCircle']}).rotateY(90).translate([0, - realTableWidth/2 + this.parameters['minWallWidth'] + realGuiderodParameter/2, realTableHeight/2]),

				cylinder({ d : 9, h : realTableHeight, center : true, fn : this.printer['resolutionCircle'] }).translate([0,0,realTableHeight/2]),
				cylinder({ d : 12+this.printer['correctionInsideDiameter'], h : realTableHeight-minWallWidth, center : true, fn : this.printer['resolutionCircle'] }).translate([0,0,realTableHeight/2+minWallWidth])
			)
		);

		let axis1Frame_InnerLength = this.parameters['axis1Distance'] + this.parameters['tableInsideX'] + 2 * this.printer['correctionInsideDiameter'];
		let axis1Frame_InnerWidth = realTableWidth + 2 * this.parameters['minSpacing'];
		let axis1Frame_Height = realTableHeight;

		let axis1Frame_OutLen = axis1Frame_InnerLength + 2 * this.parameters['frameWallWidth'];
		let axis1Frame_OutWidth = axis1Frame_InnerWidth + 2 * this.parameters['frameWallWidth'];

		let guiderod1 = cylinder( { d : realGuiderodParameter, h : axis1Frame_OutLen, center : true, fn : this.printer['resolutionCircle'] }).rotateY(90).translate([minWallWidth,   realTableWidth/2 - this.parameters['minWallWidth'] - realGuiderodParameter/2, realTableHeight/2]);
		let guiderod2 = cylinder( { d : realGuiderodParameter, h : axis1Frame_OutLen, center : true, fn : this.printer['resolutionCircle'] }).rotateY(90).translate([minWallWidth, - realTableWidth/2 + this.parameters['minWallWidth'] + realGuiderodParameter/2, realTableHeight/2]);

		// Model for inner frame
		let innerFrame = difference(
			cube({ size : [ axis1Frame_OutLen + this.nut.getHeight(), axis1Frame_OutWidth, axis1Frame_Height + 2 * this.parameters['minWallWidth'] + realGuiderodParameter], center : true }).translate([-this.nut.getHeight()/2,0,axis1Frame_Height/2 + (2 * this.parameters['minWallWidth'] + realGuiderodParameter)/2]),
			union(
				cube({ size : [ axis1Frame_InnerLength, axis1Frame_InnerWidth, axis1Frame_Height + 2 * this.parameters['minWallWidth'] + realGuiderodParameter ], center : true }).translate([0,0,axis1Frame_Height/2 + (2 * this.parameters['minWallWidth'] + realGuiderodParameter)/2]),
				guiderod1,
				guiderod2,
				this.nut.getModel().scale(1.1).rotateY(90).translate([-axis1Frame_OutLen/2+1,0,realTableHeight/2]),
				cylinder({ d : this.nut.getThroughholeMedium(), h : this.nut.getHeight() + this.parameters['frameWallWidth'], center: true, fn : this.printer['resolutionCircle'] }).rotateY(90).translate([-axis1Frame_OutLen/2-this.nut.getHeight()/2 + this.parameters['frameWallWidth']/2,0,realTableHeight/2])
			)
		);

		nonPrintables.push(guiderod1);
		nonPrintables.push(guiderod2);
		nonPrintables.push(this.nut.getModel().rotateY(90).translate([-axis1Frame_OutLen/2+1,0,realTableHeight/2]));

		// Model for outer frame

		let axis2Frame_InnerLength = axis1Frame_OutLen + this.nut.getHeight() + 2 * this.printer['correctionInsideDiameter'];
		let axis2Frame_InnerWidth = axis1Frame_OutWidth + this.parameters['axis2Distance'] + 2 * this.printer['correctionInsideDiameter'];

		let axis2Frame_OutLen = axis2Frame_InnerLength + 2 * this.parameters['frameWallWidth'];
		let axis2Frame_OutWidth = axis2Frame_InnerWidth + 2 * this.parameters['frameWallWidth'];

		let axis2Frame_Height = axis1Frame_Height;
		let realAxis2Frame_Height = axis2Frame_Height + 2 * this.parameters['minWallWidth'] + realGuiderodParameter;

		let guiderod3 = cylinder( { d : realGuiderodParameter, h : axis2Frame_OutWidth, center : true, fn : this.printer['resolutionCircle'] }).rotateX(90).translate([axis2Frame_InnerLength/2-realGuiderodParameter/2-this.parameters['frameWallWidth']-this.parameters['minSpacing'] -this.nut.getHeight()/2,0,realAxis2Frame_Height - this.parameters['minWallWidth'] - realGuiderodParameter/2]);
		let guiderod4 = cylinder( { d : realGuiderodParameter, h : axis2Frame_OutWidth, center : true, fn : this.printer['resolutionCircle'] }).rotateX(90).translate([-axis2Frame_InnerLength/2+realGuiderodParameter/2+this.parameters['frameWallWidth']+this.parameters['minSpacing'] -this.nut.getHeight()/2,0,realAxis2Frame_Height - this.parameters['minWallWidth'] - realGuiderodParameter/2]);

		let outerFrame = difference(
			difference(
				union(
					cube({ size : [ axis2Frame_OutLen, axis2Frame_OutWidth + this.nut.getHeight(), realAxis2Frame_Height], center : true  }).translate([0,this.nut.getHeight()/2, (2 * this.parameters['minWallWidth'] + realGuiderodParameter)/2])
				),
				union(
					cube({ size : [ axis2Frame_InnerLength, axis2Frame_InnerWidth, realAxis2Frame_Height], center : true  }).translate([0,0,  (2 * this.parameters['minWallWidth'] + realGuiderodParameter)/2]),
					cube({ size : [ this.parameters['frameWallWidth'], this.parameters['axis2Distance']+this.nut.getThroughholeCoarse(), this.nut.getThroughholeCoarse() ], center : true }).translate([ -axis2Frame_OutLen/2 + this.parameters['frameWallWidth']/2 , 0, 0 ])
				)
			).translate([-this.nut.getHeight()/2, 0, axis2Frame_Height/2 ]),
			union(
				guiderod3,
				guiderod4,
				this.nut.getModel().scale(1.1).rotateX(90).translate([0,axis2Frame_OutWidth/2-1,realAxis2Frame_Height / 2]),
				cylinder({ d : this.nut.getThroughholeMedium(), h : 2*(this.nut.getHeight() + this.parameters['frameWallWidth']), center: true, fn : this.printer['resolutionCircle'] }).rotateX(90).translate([0,axis2Frame_OutWidth/2,realAxis2Frame_Height / 2])
			)
		);

		nonPrintables.push(guiderod3);
		nonPrintables.push(guiderod4);
		nonPrintables.push(this.nut.getModel().rotateX(90).translate([0,axis2Frame_OutWidth/2-1,realAxis2Frame_Height / 2]));

		return union(
			innerTable,
			difference(innerFrame, union(guiderod3, guiderod4)),
			outerFrame,
			union(nonPrintables).setColor([0,1,0])
		).scale(this.printer.scale);
	}
}

function main(params) {
	var tr = new screwCrossTable(params, params);

	return tr.getModel();
}
