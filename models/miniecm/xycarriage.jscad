include('/mechanics/isothread.jscad');
include('/mechanics/screwclamp.jscad');
include('/mechanics/bearingLM8LUU.jscad');
include('/mechanics/bearingLM8UU.jscad');

if(typeof window === 'undefined') { window = new Object(); }
if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.miniecm !== 'object') { window.jscad.tspi.miniecm = new Object(); }

window.jscad.tspi.miniecm.carriagexy = function(printer, params) {
	let knownParameters = [
		{ name: 'sledCarriageType',				type: 'boolean',	default: false		},

		{ name: 'guiderodClampM',				type: 'number',		default: 6			},
		{ name: 'guiderodClampScrewLength',		type: 'number',		default: 16			},

		{ name: 'lm8uuGrubScrewM',				type: 'number',		default: 3			},
		{ name: 'lm8uuGrubScrewLength',			type: 'number',		default: 6			},

		{ name: 'guiderodClampMinWall',			type: 'number',		default: 2			},
		{ name: 'minWallThickness',				type: 'number',		default: 1			},

		{ name: 'sledSizeInside',				type: 'number',		default: 50			},
		{ name: 'sledSizeOutsideMin',			type: 'number',		default: 0			},
		{ name: 'sledSizeWallMin',				type: 'number',		default: 0			},
		{ name: 'sledBearingsLong',				type: 'boolean',	default: false		},

		{ name: 'onlyPrintedPart',				type: 'boolean',	default: false		},

		// Default values should not be changed:
		{ name: 'spacingThroughHole',			type: 'number',		default: 2			},
	];

	let knownPrinterParameters = [
		{ name: 'scale', 						type: 'number', 	default: 1 			},
		{ name: 'correctionInsideDiameter', 	type: 'number', 	default: 0 			},
		{ name: 'correctionOutsideDiameter', 	type: 'number', 	default: 0 			},
		{ name: 'resolutionCircle', 			type: 'number', 	default: 32 /*360*/ 		},

		{ name: 'guiderodClampDiaCorrection',	type: 'number',		default: 0.1		},
		{ name: 'lm8uuInsertDiameterScale',		type: 'number',		default: 1.05		},
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

	this.parameters['guiderodDiameter'] = 8+this.printer['guiderodClampDiaCorrection']; /* Fixed since we use LM8LUU bearings */

	if(this.parameters['sledBearingsLong']) {
		this.bearing = new window.jscad.tspi.mechanics.bearings.LM8LUU(printer, { hollow : true });
	} else {
		this.bearing = new window.jscad.tspi.mechanics.bearings.LM8UU(printer, { hollow : true });
	}

	this.knownClamp = new window.jscad.tspi.mechanics.basicScrewclamp(printer, { m : this.parameters['guiderodClampM'], screwLength : this.parameters['guiderodClampScrewLength'], rodDiameter : this.parameters['guiderodDiameter'], onlyPrintedPart : this.parameters['onlyPrintedPart'], minWallThickness : this.parameters['guiderodClampMinWall']});
	this.knownGrubNut = new window.jscad.tspi.isoNut(printer, { m : 3 });
	this.knownClampNut = new window.jscad.tspi.isoNut(printer, { m : this.parameters['guiderodClampM'] });
	this.knownGrubScrew = new window.jscad.tspi.iso4762Screw(printer, { m : this.parameters['lm8uuGrubScrewM'], l : this.parameters['lm8uuGrubScrewLength'] });

	this.requiredWallWidth = Math.max(
		this.knownClamp.getClampSizeX()/2 + Math.max(this.parameters['guiderodDiameter']/2, this.bearing.getOutsideDiameter()/2) + 2*this.parameters['minWallThickness'] + this.knownGrubScrew.l + this.knownGrubScrew.k,
		this.bearing.getLength()+this.parameters['minWallThickness']
	);

	if(this.parameters['sledSizeWallMin'] > this.requiredWallWidth) { this.requiredWallWidth = this.parameters['sledSizeWallMin']; }

	this.sledRealSizeX = this.parameters['sledSizeInside']+2*this.requiredWallWidth;
	this.sledRealSizeY = this.parameters['sledSizeInside']+2*this.requiredWallWidth;

	let minRequiredSize = 2 * this.knownClamp.getClampSizeX() + this.knownClampNut.getHeight()*1.5;
	if(this.sledRealSizeX < minRequiredSize) { this.sledRealSizeX = minRequiredSize; }
	if(this.sledRealSizeY < minRequiredSize) { this.sledRealSizeY = minRequiredSize; }

	if(this.parameters['sledSizeOutsideMin'] > this.sledRealSizeX) { this.sledRealSizeX = this.parameters['sledSizeOutsideMin']; this.requiredWallWidth = (this.sledRealSizeX - this.parameters['sledSizeInside'])/2; }
	if(this.parameters['sledSizeOutsideMin'] > this.sledRealSizeY) { this.sledRealSizeY = this.parameters['sledSizeOutsideMin']; this.requiredWallWidth = (this.sledRealSizeY - this.parameters['sledSizeInside'])/2; }

	this.insideSizeX = this.sledRealSizeX - (this.knownClamp.getClampSizeX()/2 + Math.max(this.parameters['guiderodDiameter']/2, this.bearing.getOutsideDiameter()/2) + this.parameters['minWallThickness']);
	this.insideSizeY = this.sledRealSizeY - (this.knownClamp.getClampSizeX()/2 + Math.max(this.parameters['guiderodDiameter']/2, this.bearing.getOutsideDiameter()/2) + this.parameters['minWallThickness']);

	this.rawPrinterObject = printer;

	this.getModel = function() {
		let sledSizeX = this.sledRealSizeX; // (this.bearing.getOutsideDiameter() + 2*this.parameters['minWallThickness']) * 2;
		let sledSizeY = Math.max(this.knownClamp.getClampSizeX(), this.requiredWallWidth);
		let sledDYByScrew = (Math.max(0, this.requiredWallWidth-this.knownClamp.getClampSizeX()))/2;
		let sledSizeZ =2 * this.knownClamp.getClampSizeY();

		let axis2Height = this.knownClamp.getClampSizeY();

		let sled = {};
		let nonprinted = {};

		if(!this.parameters['sledCarriageType']) {
			sled = cube({ size : [ sledSizeX, sledSizeY, sledSizeZ/2 ] }).translate([0,0,sledSizeZ/2]);
			sled = union(
				sled,
				this.knownClamp.getModel().rotateX(90).translate([this.knownClamp.getClampSizeX()/2,this.knownClamp.getClampThickness(),this.knownClamp.getOffsetBelowRod()]),
				this.knownClamp.getModel().rotateX(90).rotateZ(180).translate([-this.knownClamp.getClampSizeX()/2+sledSizeX,0,this.knownClamp.getOffsetBelowRod()])
			);

			sled = difference(
				sled,
				cylinder({ d : this.parameters['guiderodDiameter']+this.parameters['spacingThroughHole'], h : sledSizeX, center : true }).translate([-this.knownClamp.getClampSizeY()-this.knownClamp.getOffsetBelowRod()-this.parameters['guiderodDiameter']/2, this.knownClamp.getClampSizeX()/2 + sledDYByScrew, sledSizeX/2]).rotateY(90)
			);

			sled = difference(
				sled,
				union(
					this.bearing.getTemplate().scale(this.printer['lm8uuInsertDiameterScale']).translate([0,this.knownClamp.getClampSizeX()/2,this.bearing.getLength()/2]).rotateY(90).translate([0,sledDYByScrew,this.knownClamp.getClampSizeY()+this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
					this.bearing.getTemplate().scale(this.printer['lm8uuInsertDiameterScale']).translate([0,this.knownClamp.getClampSizeX()/2,this.bearing.getLength()/2]).rotateY(90).translate([sledSizeX-this.bearing.getLength(),sledDYByScrew,this.knownClamp.getClampSizeY()+this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2])
				)
			);

			let grubScrewOffset = (this.bearing.getLength() - this.bearing.getGrooveDistance() + this.bearing.getGrooveDepth())/2;
			let grubScrewRealLen = this.knownGrubScrew.l + this.knownGrubScrew.k;
			sled = difference(
				sled,
				union(
					this.knownGrubScrew.getTemplate().rotateX(90).translate([grubScrewOffset,grubScrewRealLen,this.knownClamp.getClampSizeY()+this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
					this.knownGrubScrew.getTemplate().rotateX(90).translate([grubScrewOffset+this.bearing.getGrooveDistance(),grubScrewRealLen,this.knownClamp.getClampSizeY()+this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),

					this.knownGrubScrew.getTemplate().rotateX(90).translate([sledSizeX-grubScrewOffset,grubScrewRealLen,this.knownClamp.getClampSizeY()+this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
					this.knownGrubScrew.getTemplate().rotateX(90).translate([sledSizeX-grubScrewOffset-this.bearing.getGrooveDistance(),grubScrewRealLen,this.knownClamp.getClampSizeY()+this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2])
				)
			);

			let grubScrewNutCutDiameter = this.knownGrubNut.getHeight()*1.2;
			let grubScrewNutCutDepth = this.knownClamp.getClampSizeY() - this.knownClamp.getOffsetBelowRod() - this.parameters['guiderodDiameter']/2 + this.knownGrubNut.getRadiusOutside();
			let grubScrewNutCutWidth = this.knownGrubNut.getRadiusOutside()*2;
			sled = difference(
				sled,
				union(
					cube({ size : [grubScrewNutCutWidth, grubScrewNutCutDiameter, grubScrewNutCutDepth], center: true}).translate([grubScrewOffset,grubScrewNutCutDiameter/2+this.parameters['minWallThickness']+this.knownGrubScrew.k, grubScrewNutCutDepth/2 + sledSizeZ - grubScrewNutCutDepth]),
					cube({ size : [grubScrewNutCutWidth, grubScrewNutCutDiameter, grubScrewNutCutDepth], center: true}).translate([grubScrewOffset+this.bearing.getGrooveDistance(),grubScrewNutCutDiameter/2+this.parameters['minWallThickness']+this.knownGrubScrew.k, grubScrewNutCutDepth/2 + sledSizeZ - grubScrewNutCutDepth]),
					cube({ size : [grubScrewNutCutWidth, grubScrewNutCutDiameter, grubScrewNutCutDepth], center: true}).translate([sledSizeX-grubScrewOffset,grubScrewNutCutDiameter/2+this.parameters['minWallThickness']+this.knownGrubScrew.k, grubScrewNutCutDepth/2 + sledSizeZ - grubScrewNutCutDepth]),
					cube({ size : [grubScrewNutCutWidth, grubScrewNutCutDiameter, grubScrewNutCutDepth], center: true}).translate([sledSizeX-grubScrewOffset-this.bearing.getGrooveDistance(),grubScrewNutCutDiameter/2+this.parameters['minWallThickness']+this.knownGrubScrew.k, grubScrewNutCutDepth/2 + sledSizeZ - grubScrewNutCutDepth])
				)
			);

			nonprinted = union(
				this.knownGrubScrew.getTemplate().rotateX(90).translate([grubScrewOffset,grubScrewRealLen,this.knownClamp.getClampSizeY()+this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
				this.knownGrubScrew.getTemplate().rotateX(90).translate([grubScrewOffset+this.bearing.getGrooveDistance(),grubScrewRealLen,this.knownClamp.getClampSizeY()+this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),

				this.knownGrubScrew.getTemplate().rotateX(90).translate([sledSizeX-grubScrewOffset,grubScrewRealLen,this.knownClamp.getClampSizeY()+this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
				this.knownGrubScrew.getTemplate().rotateX(90).translate([sledSizeX-grubScrewOffset-this.bearing.getGrooveDistance(),grubScrewRealLen,this.knownClamp.getClampSizeY()+this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),

				this.bearing.getModel().translate([0,this.knownClamp.getClampSizeX()/2,this.bearing.getLength()/2]).rotateY(90).translate([0,sledDYByScrew,this.knownClamp.getClampSizeY()+this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
				this.bearing.getModel().translate([0,this.knownClamp.getClampSizeX()/2,this.bearing.getLength()/2]).rotateY(90).translate([sledSizeX-this.bearing.getLength(),sledDYByScrew,this.knownClamp.getClampSizeY()+this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2])
			);
		} else {
			sled = cube({ size : [ sledSizeX, sledSizeY, sledSizeZ/2 ] }).translate([0,0,0]);
			sled = union(
				sled,
				this.knownClamp.getModel().rotateX(90).translate([this.knownClamp.getClampSizeX()/2,this.knownClamp.getClampThickness(),this.knownClamp.getOffsetBelowRod()+sledSizeZ/2]),
				this.knownClamp.getModel().rotateX(90).rotateZ(180).translate([-this.knownClamp.getClampSizeX()/2+sledSizeX,0,this.knownClamp.getOffsetBelowRod()+sledSizeZ/2])
			);
			sled = difference(
				sled,
				cylinder({ d : this.parameters['guiderodDiameter']+this.parameters['spacingThroughHole'], h : sledSizeX, center : true }).translate([-this.knownClamp.getOffsetBelowRod()-this.parameters['guiderodDiameter']/2, this.knownClamp.getClampSizeX()/2 + sledDYByScrew, sledSizeX/2]).rotateY(90)
			);

			sled = difference(
				sled,
				union(
					this.bearing.getTemplate().scale(this.printer['lm8uuInsertDiameterScale']).translate([0,this.knownClamp.getClampSizeX()/2,this.bearing.getLength()/2]).rotateY(90).translate([0,sledDYByScrew,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
					this.bearing.getTemplate().scale(this.printer['lm8uuInsertDiameterScale']).translate([0,this.knownClamp.getClampSizeX()/2,this.bearing.getLength()/2]).rotateY(90).translate([sledSizeX-this.bearing.getLength(),sledDYByScrew,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2])
				)
			);

			let grubScrewOffset = (this.bearing.getLength() - this.bearing.getGrooveDistance() + this.bearing.getGrooveDepth())/2;
			let grubScrewRealLen = this.knownGrubScrew.l + this.knownGrubScrew.k;
			sled = difference(
				sled,
				union(
					this.knownGrubScrew.getTemplate().rotateX(90).translate([grubScrewOffset,grubScrewRealLen,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
					this.knownGrubScrew.getTemplate().rotateX(90).translate([grubScrewOffset+this.bearing.getGrooveDistance(),grubScrewRealLen,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),

					this.knownGrubScrew.getTemplate().rotateX(90).translate([sledSizeX-grubScrewOffset,grubScrewRealLen,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
					this.knownGrubScrew.getTemplate().rotateX(90).translate([sledSizeX-grubScrewOffset-this.bearing.getGrooveDistance(),grubScrewRealLen,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2])
				)
			);

			let grubScrewNutCutDiameter = this.knownGrubNut.getHeight()*1.2;
			let grubScrewNutCutDepth = this.knownClamp.getClampSizeY() - this.knownClamp.getOffsetBelowRod() - this.parameters['guiderodDiameter']/2 + this.knownGrubNut.getRadiusOutside();
			let grubScrewNutCutWidth = this.knownGrubNut.getRadiusOutside()*2;
			sled = difference(
				sled,
				union(
					cube({ size : [grubScrewNutCutWidth, grubScrewNutCutDiameter, grubScrewNutCutDepth], center: true}).translate([grubScrewOffset,grubScrewNutCutDiameter/2+this.parameters['minWallThickness']+this.knownGrubScrew.k, grubScrewNutCutDepth/2 + grubScrewNutCutDepth]),
					cube({ size : [grubScrewNutCutWidth, grubScrewNutCutDiameter, grubScrewNutCutDepth], center: true}).translate([grubScrewOffset+this.bearing.getGrooveDistance(),grubScrewNutCutDiameter/2+this.parameters['minWallThickness']+this.knownGrubScrew.k, grubScrewNutCutDepth/2 + grubScrewNutCutDepth]),
					cube({ size : [grubScrewNutCutWidth, grubScrewNutCutDiameter, grubScrewNutCutDepth], center: true}).translate([sledSizeX-grubScrewOffset,grubScrewNutCutDiameter/2+this.parameters['minWallThickness']+this.knownGrubScrew.k, grubScrewNutCutDepth/2 + grubScrewNutCutDepth]),
					cube({ size : [grubScrewNutCutWidth, grubScrewNutCutDiameter, grubScrewNutCutDepth], center: true}).translate([sledSizeX-grubScrewOffset-this.bearing.getGrooveDistance(),grubScrewNutCutDiameter/2+this.parameters['minWallThickness']+this.knownGrubScrew.k, grubScrewNutCutDepth/2 + grubScrewNutCutDepth])
				)
			);

			nonprinted = union(
				this.knownGrubScrew.getTemplate().rotateX(90).translate([grubScrewOffset,grubScrewRealLen,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
				this.knownGrubScrew.getTemplate().rotateX(90).translate([grubScrewOffset+this.bearing.getGrooveDistance(),grubScrewRealLen,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),

				this.knownGrubScrew.getTemplate().rotateX(90).translate([sledSizeX-grubScrewOffset,grubScrewRealLen,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
				this.knownGrubScrew.getTemplate().rotateX(90).translate([sledSizeX-grubScrewOffset-this.bearing.getGrooveDistance(),grubScrewRealLen,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),

				this.bearing.getModel().translate([0,this.knownClamp.getClampSizeX()/2,this.bearing.getLength()/2]).rotateY(90).translate([0,sledDYByScrew,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
				this.bearing.getModel().translate([0,this.knownClamp.getClampSizeX()/2,this.bearing.getLength()/2]).rotateY(90).translate([sledSizeX-this.bearing.getLength(),sledDYByScrew,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2])
			);
		}

		if(!this.parameters['onlyPrintedPart']) {
			sled = union(sled, nonprinted);
		}
		return sled;
	}
}


function getParameterDefinitions() {
    return [
		{ name : 'grpSled', type : 'Group', caption : 'Sled' },
        { name: 'sledSizeInside', type: 'float', initial: 0, caption: 'Inside sled size' },
		{ name: 'sledSizeOutsideMin', type: 'float', initial: 0, caption: 'Minimum outside sled size' },
		{ name: 'sledSizeWallMin', type: 'float', initial: 0, caption: 'Minimum wall size' },
		{ name : 'sledBearingsLong', type : 'checkbox', checked : false, caption: 'Use long bearings' },
		{ name : 'sledCarriageType', type : 'checkbox', checked : false, caption: 'Type A/B' },

		{ name : 'grpDisplay', type : 'Group', caption : 'Display' },
		{ name : 'onlyPrintedPart', type : 'checkbox', checked : false, caption: 'Show only printed part' },

		{ name : 'grpPrinter', type : 'Group', caption : 'Printer' },
        { name: 'resolutionCircle', type: 'float', initial: 32, caption: 'Circle resolution', min : 32 },
		{ name: 'scale', type : 'float', initial : 1, caption : 'Scale' },
		{ name: 'correctionInsideDiameter', type : 'float', initial : 0, caption : 'Inside diameter correction' },
		{ name: 'correctionOutsideDiameter', type : 'float', initial : 0, caption : 'Outside diameter correction' }
    ];
}

function main(params) {
	return (new window.jscad.tspi.miniecm.carriagexy(params, params)).getModel();
}
