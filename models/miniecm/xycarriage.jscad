include('/mechanics/isothread.jscad');
include('/mechanics/screwclamp.jscad');
include('/mechanics/stepperNema17.jscad');
include('/mechanics/bearingLM8LUU.jscad');
include('/mechanics/bearingLM8UU.jscad');
include('/mechanics/motedisDelrin.jscad');

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
		let sledSizeY = Math.max(this.knownClamp.getClampSizeX(), this.requiredWallWidth, 36); // 36 is the width of the anti backlash nut on top ... change or remove in case another mechanism is used
		let sledDYByScrew = (Math.max(0, this.requiredWallWidth-this.knownClamp.getClampSizeX()))/2;
		let sledSizeZ =2 * this.knownClamp.getClampSizeY();

		let axis2Height = this.knownClamp.getClampSizeY();

		let sled = {};
		let nonprinted = {};

		let motedisDelrinNut = new window.jscad.tspi.motedis.delrinTR8x1_5Template(this.rawPrinterObject,{});
		let motedisDelrinNutPressfitFixtureM5Nut = new window.jscad.tspi.isoNut(this.rawPrinterObject, { m : 5 });
//		let motedisDelrinNutPressfitFixtureM5Screw = window.jscad.tspi.iso4762Screw(this.rawPrinterObject, { m : 5, l : 20 });

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

			nonprinted = union(
				nonprinted,
				motedisDelrinNut.getModel().rotateZ(90).translate([sledSizeX/2,+36/2,sledSizeZ]),
//				motedisDelrinNutPressfitFixtureM5Screw.getTemplate().translate([sledSizeX/2+8.25,8,sledSizeZ - motedisDelrinNutPressfitFixtureM5Nut.getHeight()/2]),
//				motedisDelrinNutPressfitFixtureM5Screw.getTemplate().translate([sledSizeX/2+8.25,28,sledSizeZ - motedisDelrinNutPressfitFixtureM5Nut.getHeight()/2])
			);
			sled = difference(
				sled,
				union(
					motedisDelrinNutPressfitFixtureM5Nut.getModel().translate([sledSizeX/2-8.25,8,sledSizeZ - motedisDelrinNutPressfitFixtureM5Nut.getHeight()/2]),
					motedisDelrinNutPressfitFixtureM5Nut.getModel().translate([sledSizeX/2-8.25,28,sledSizeZ - motedisDelrinNutPressfitFixtureM5Nut.getHeight()/2]),
					cylinder({ d : 5.8, h : motedisDelrinNutPressfitFixtureM5Nut.getHeight(), center : true }).translate([sledSizeX/2-8.25,8,sledSizeZ - motedisDelrinNutPressfitFixtureM5Nut.getHeight()/2]),
					cylinder({ d : 5.8, h : motedisDelrinNutPressfitFixtureM5Nut.getHeight(), center : true }).translate([sledSizeX/2-8.25,28,sledSizeZ - motedisDelrinNutPressfitFixtureM5Nut.getHeight()/2])
				)
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
					cube({ size : [grubScrewNutCutWidth, grubScrewNutCutDiameter, grubScrewNutCutDepth], center: true}).translate([grubScrewOffset,grubScrewNutCutDiameter/2+this.parameters['minWallThickness']+this.knownGrubScrew.k, grubScrewNutCutDepth/2]),
					cube({ size : [grubScrewNutCutWidth, grubScrewNutCutDiameter, grubScrewNutCutDepth], center: true}).translate([grubScrewOffset+this.bearing.getGrooveDistance(),grubScrewNutCutDiameter/2+this.parameters['minWallThickness']+this.knownGrubScrew.k, grubScrewNutCutDepth/2]),
					cube({ size : [grubScrewNutCutWidth, grubScrewNutCutDiameter, grubScrewNutCutDepth], center: true}).translate([sledSizeX-grubScrewOffset,grubScrewNutCutDiameter/2+this.parameters['minWallThickness']+this.knownGrubScrew.k, grubScrewNutCutDepth/2]),
					cube({ size : [grubScrewNutCutWidth, grubScrewNutCutDiameter, grubScrewNutCutDepth], center: true}).translate([sledSizeX-grubScrewOffset-this.bearing.getGrooveDistance(),grubScrewNutCutDiameter/2+this.parameters['minWallThickness']+this.knownGrubScrew.k, grubScrewNutCutDepth/2])
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





/* START OF DEPENDENCIES */
/* Dependency for this specific model (ToDo: Move into local library ...) */

if(typeof window.jscad.tspi.miniecm.tool !== 'object') { window.jscad.tspi.miniecm.tool = new Object(); }
window.jscad.tspi.miniecm.tool.ztower01 = function(printer, params) {
	let knownParameters = [
		{ name: 'wireclampScrewM',				type: 'number',		default: 3			},
		{ name: 'wireclampScrewLength',			type: 'number',		default: 6			},
		{ name: 'wireclampWireDiameter',		type: 'number',		default: 2.4		},
		{ name: 'wireclampExtendsBottom',		type: 'number',		default: 10			},
		{ name: 'wireclampWireLength',			type: 'number',		default: 175		},

		{ name: 'toolHeight',					type: 'number',		default: 50			},

		{ name: 'onlyPrintedPart',				type: 'boolean',	default: false		},

		{ name: 'wireclampSlitWidth',			type: 'number',		default: 0			},
		{ name: 'wireclampMinWallThickness',	type: 'number',		default: 1			},

		{ name: 'guiderodClampM',				type: 'number',		default: 6			},
		{ name: 'guiderodClampScrewLength',		type: 'number',		default: 16			},
		{ name: 'lm8uuGrubScrewM',				type: 'number',		default: 3			},
		{ name: 'lm8uuGrubScrewLength',			type: 'number',		default: 6			},
		{ name: 'guiderodClampMinWall',			type: 'number',		default: 2			},
		{ name: 'minWallThickness',				type: 'number',		default: 1			},

		{ name: 'bedmountScrewM',				type: 'number',		default: 6			},
		{ name: 'bedmountScrewLength',			type: 'number',		default: 16			},

		{ name: 'leadscrewDiameter',			type: 'number',		default: 8			},
		{ name: 'leadscrewBearingOD',			type: 'number',		default: 22			},
		{ name: 'leadscrewBearingH',			type: 'number',		default: 7			},
		{ name: 'stepperZLength',				type: 'number',		default: 30			},
		{ name: 'stepperCouplerH',				type: 'number',		default: 25			},
		{ name: 'stepperCouplerD',				type: 'number',		default: 19			},
		{ name: 'lowerBallDiameter',			type: 'number',		default: 3			},

		{ name: 'toolmountScrewM',				type: 'number',		default: 6			},
		{ name: 'toolmountScrewLength',			type: 'number',		default: 16			},

		{ name: 'zDistance',					type: 'number',		default: 60			},
		{ name: 'zTowerLayerHeight',			type: 'number',		default: 5			},
		{ name: 'zTowerWidthOutsideMin',		type: 'number',		default: 0			},
		{ name: 'zTowerDepthOutsideMin',		type: 'number',		default: 0			},

		{ name: 'sacrificialBridgeSize',		type: 'number',		default: 0.14		},

		{ name: 'displayMountPlate',			type: 'boolean',	default: false		},
	];

	let knownPrinterParameters = [
		{ name: 'scale', 						type: 'number', 	default: 1 			},
		{ name: 'correctionInsideDiameter', 	type: 'number', 	default: 0 			},
		{ name: 'correctionOutsideDiameter', 	type: 'number', 	default: 0 			},
		{ name: 'resolutionCircle', 			type: 'number', 	default: 360 		},
		{ name: 'guiderodClampDiaCorrection',	type: 'number',		default: 0.1		},
		{ name: 'lm8uuInsertDiameterScale',		type: 'number',		default: 1.05		},
	];

	this.rawprinter = printer;
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

	this.rawprinter = printer;

	this.parameters['guiderodDiameter'] = 8+this.printer['guiderodClampDiaCorrection']; /* Fixed since we use LM8UU bearings */

	this.guiderodClamp = new window.jscad.tspi.mechanics.basicScrewclamp(printer, { m : this.parameters['guiderodClampM'], screwLength : this.parameters['guiderodClampScrewLength'], rodDiameter : this.parameters['guiderodDiameter'], onlyPrintedPart : this.parameters['onlyPrintedPart'], minWallThickness : this.parameters['guiderodClampMinWall']});
	this.stepper = new window.jscad.tspi.mechanics.stepperNEMA17(printer, { length: this.parameters['stepperZLength'] });

	this.ballbearingAxial = difference(cylinder({d : this.parameters['leadscrewBearingOD'], h : this.parameters['leadscrewBearingH'], center : true}), cylinder({d : this.parameters['leadscrewDiameter'], h : this.parameters['leadscrewBearingH'], center : true})).translate([0,0,this.parameters['leadscrewBearingH']/2]).setColor([1,0,0]);

	let zHeight = 2 * this.parameters['zDistance'];
	this.zTowerHeight_MotorPosition =        this.parameters['zTowerLayerHeight'] + this.parameters['lowerBallDiameter'] + this.parameters['leadscrewBearingH'] + zHeight + Math.max(3 + this.parameters['leadscrewBearingH'], this.parameters['zTowerLayerHeight']) + this.parameters['stepperCouplerH'] + 2 + this.parameters['zTowerLayerHeight'];
	this.zTowerHeight_Level3Position =       this.parameters['zTowerLayerHeight'] + this.parameters['lowerBallDiameter'] + this.parameters['leadscrewBearingH'] + zHeight + Math.max(3 + this.parameters['leadscrewBearingH'], this.parameters['zTowerLayerHeight']) + this.parameters['stepperCouplerH'] + 2;
	this.zTowerHeight_CouplerPosition =      this.parameters['zTowerLayerHeight'] + this.parameters['lowerBallDiameter'] + this.parameters['leadscrewBearingH'] + zHeight + Math.max(3 + this.parameters['leadscrewBearingH'], this.parameters['zTowerLayerHeight']) + 1;
	this.zTowerHeight_UpperBearingPosition = this.parameters['zTowerLayerHeight'] + this.parameters['lowerBallDiameter'] + this.parameters['leadscrewBearingH'] + zHeight + Math.max(3 + this.parameters['leadscrewBearingH'], this.parameters['zTowerLayerHeight']) - this.parameters['leadscrewBearingH'];
	this.zTowerHeight_Level2Position =       this.parameters['zTowerLayerHeight'] + this.parameters['lowerBallDiameter'] + this.parameters['leadscrewBearingH'] + zHeight;
	this.zTowerHeight_LowerBearingPosition = this.parameters['zTowerLayerHeight'] + this.parameters['lowerBallDiameter'];
	this.zTowerHeight_LowerBallPosition =    this.parameters['zTowerLayerHeight'];

	this.leadscrewLength = (this.zTowerHeight_CouplerPosition - this.zTowerHeight_LowerBearingPosition) + (this.parameters['stepperCouplerH'] / 2);

	this.towerOutsideWidth = Math.max(this.parameters['zTowerWidthOutsideMin'], 42.3-10 + 2*this.guiderodClamp.getClampSizeY());
	this.towerOutsideDepth = Math.max(this.parameters['zTowerDepthOutsideMin'], 42.3, this.guiderodClamp.getClampSizeX());

	this.linearBearing = new window.jscad.tspi.mechanics.bearings.LM8UU(printer, {});

	this.stepperMountScrew = new window.jscad.tspi.iso4762Screw(printer, { m : 3, l : 25 });
	this.towerMountScrew = new window.jscad.tspi.iso4762Screw(printer, { m : this.parameters['bedmountScrewM'], l : this.parameters['bedmountScrewLength'] });

	this.getModel = function() {
		let nonPrintable = union(
			this.stepper.getModel().rotateX(180).scale(this.printer['lm8uuInsertDiameterScale']).translate([0,0,this.zTowerHeight_MotorPosition]),
			cylinder({ d : this.parameters['stepperCouplerD'], h : this.parameters['stepperCouplerH'], center : true }).translate([0,0,this.zTowerHeight_CouplerPosition + this.parameters['stepperCouplerH']/2]).setColor([0,1,0]),
			cylinder({ d : this.parameters['leadscrewDiameter']+2, h : this.leadscrewLength, center : true}).translate([0,0,this.leadscrewLength/2 + this.zTowerHeight_LowerBearingPosition]).setColor([0,1,0]),
			this.ballbearingAxial.scale(this.printer['lm8uuInsertDiameterScale']).translate([0,0,this.zTowerHeight_UpperBearingPosition]),
			this.ballbearingAxial.scale(this.printer['lm8uuInsertDiameterScale']).translate([0,0,this.zTowerHeight_LowerBearingPosition]),
			sphere({ r : this.parameters['lowerBallDiameter']/2, center : true }).translate([0,0,this.parameters['lowerBallDiameter']/2+this.zTowerHeight_LowerBallPosition]).setColor([1,0,0]),

			cylinder({ d : this.parameters['guiderodDiameter']+0.5, h : this.zTowerHeight_MotorPosition-this.parameters['guiderodClampMinWall'], center : true, fn: this.printer['resolutionCircle'] }).translate([0,(this.towerOutsideWidth/2)-this.guiderodClamp.getOffsetBelowRod(),this.zTowerHeight_MotorPosition/2 + this.parameters['guiderodClampMinWall']]).setColor([1,0,0]),
			cylinder({ d : this.parameters['guiderodDiameter']+0.5, h : this.zTowerHeight_MotorPosition-this.parameters['guiderodClampMinWall'], center : true, fn: this.printer['resolutionCircle'] }).translate([0,-(this.towerOutsideWidth/2)+this.guiderodClamp.getOffsetBelowRod(),this.zTowerHeight_MotorPosition/2 + this.parameters['guiderodClampMinWall']]).setColor([1,0,0]),

			this.stepperMountScrew.getTemplate().rotateX(180).translate([15.5, 15.5, this.zTowerHeight_Level3Position+this.stepperMountScrew.l]),
			this.stepperMountScrew.getTemplate().rotateX(180).translate([15.5, -15.5, this.zTowerHeight_Level3Position+this.stepperMountScrew.l]),
			this.stepperMountScrew.getTemplate().rotateX(180).translate([-15.5, 15.5, this.zTowerHeight_Level3Position+this.stepperMountScrew.l]),
			this.stepperMountScrew.getTemplate().rotateX(180).translate([-15.5, -15.5, this.zTowerHeight_Level3Position+this.stepperMountScrew.l]),

			this.towerMountScrew.getTemplate().translate([0, ((this.towerOutsideWidth/2)-this.guiderodClamp.getOffsetBelowRod() - this.parameters['guiderodDiameter'] - this.parameters['leadscrewBearingOD']/2)/2 +  this.parameters['leadscrewBearingOD']/2, this.zTowerHeight_LowerBearingPosition + this.parameters['leadscrewBearingH'] - this.towerMountScrew.l - this.towerMountScrew.k]),
			this.towerMountScrew.getTemplate().translate([0, -(((this.towerOutsideWidth/2)-this.guiderodClamp.getOffsetBelowRod() - this.parameters['guiderodDiameter'] - this.parameters['leadscrewBearingOD']/2)/2 +  this.parameters['leadscrewBearingOD']/2), this.zTowerHeight_LowerBearingPosition + this.parameters['leadscrewBearingH'] - this.towerMountScrew.l - this.towerMountScrew.k])
		);

		let wallwidth = this.parameters['zTowerLayerHeight'];
		let middleCutFront = (this.towerOutsideDepth - Math.max(this.parameters['leadscrewBearingOD']+2*this.parameters['guiderodClampMinWall'], this.guiderodClamp.getClampSizeX()))/2;
		let insideSizeHalf = ((this.towerOutsideWidth/2)-this.guiderodClamp.getOffsetBelowRod() + this.linearBearing.getOutsideDiameter()/2 + this.parameters['guiderodClampMinWall'] + 1);

		let printables = union(
			cube({ size : [this.towerOutsideDepth, 2*insideSizeHalf, this.parameters['zTowerLayerHeight']], center : true }).translate([0,0,this.parameters['zTowerLayerHeight']/2 + this.zTowerHeight_Level3Position]),
			cube({ size : [this.towerOutsideDepth-middleCutFront, 2*insideSizeHalf, this.parameters['zTowerLayerHeight']], center : true }).translate([middleCutFront/2,0,this.parameters['zTowerLayerHeight']/2 + this.zTowerHeight_Level2Position]),
			cube({ size : [this.towerOutsideDepth, 2*insideSizeHalf, this.parameters['zTowerLayerHeight']+this.parameters['lowerBallDiameter']+this.parameters['leadscrewBearingH']], center : true }).translate([0,0,(this.parameters['zTowerLayerHeight']+this.parameters['lowerBallDiameter']+this.parameters['leadscrewBearingH'])/2]),

			this.guiderodClamp.getModel().rotateZ(-90).mirroredY().translate([0, (this.towerOutsideWidth/2)-this.guiderodClamp.getOffsetBelowRod(), this.zTowerHeight_Level2Position+this.parameters['zTowerLayerHeight']]),
			this.guiderodClamp.getModel().rotateZ(-90).translate([0, -((this.towerOutsideWidth/2)-this.guiderodClamp.getOffsetBelowRod()), this.zTowerHeight_Level2Position+this.parameters['zTowerLayerHeight']]),

			cube({ size : [this.towerOutsideDepth/2-this.guiderodClamp.getClampSizeY()+this.guiderodClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2, this.guiderodClamp.getClampSizeX(), this.guiderodClamp.getClampThickness()]}).translate([0,0,this.zTowerHeight_Level2Position+this.parameters['zTowerLayerHeight']]).translate([this.guiderodClamp.getClampSizeY()/2 + this.parameters['guiderodDiameter']/2, insideSizeHalf-this.guiderodClamp.getClampSizeX(), 0]),
			cube({ size : [this.towerOutsideDepth/2-this.guiderodClamp.getClampSizeY()+this.guiderodClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2, this.guiderodClamp.getClampSizeX(), this.guiderodClamp.getClampThickness()]}).translate([0,0,this.zTowerHeight_Level2Position+this.parameters['zTowerLayerHeight']]).translate([this.guiderodClamp.getClampSizeY()/2 + this.parameters['guiderodDiameter']/2, -insideSizeHalf, 0]),

			cube({ size : [wallwidth, 2*insideSizeHalf+2*wallwidth, this.zTowerHeight_MotorPosition], center : true }).translate([this.towerOutsideDepth/2+wallwidth/2, 0, this.zTowerHeight_MotorPosition/2]),
			cube({ size : [this.towerOutsideDepth, wallwidth, this.zTowerHeight_MotorPosition], center : true}).translate([0, insideSizeHalf+wallwidth/2, this.zTowerHeight_MotorPosition/2]),
			cube({ size : [this.towerOutsideDepth, wallwidth, this.zTowerHeight_MotorPosition], center : true}).translate([0, -insideSizeHalf-wallwidth/2, this.zTowerHeight_MotorPosition/2])
		);

		printables = difference(
			printables,
			union(
				nonPrintable,
				cylinder({ d : 12, h : this.parameters['zTowerLayerHeight'], center : true}).translate([0,0,this.parameters['zTowerLayerHeight']/2 + this.zTowerHeight_Level3Position])
			)
		);
/*
		let mountplateThickness = this.parameters['zTowerLayerHeight'];
		let mountplate = difference(
			cube({ size : [this.towerOutsideDepth, 2*insideSizeHalf, mountplateThickness], center : true}).translate([0,0,-mountplateThickness/2]),
			union(
				this.towerMountScrew.getTemplate().translate([0, ((this.towerOutsideWidth/2)-this.guiderodClamp.getOffsetBelowRod() - this.parameters['guiderodDiameter'] - this.parameters['leadscrewBearingOD']/2)/2 +  this.parameters['leadscrewBearingOD']/2, this.zTowerHeight_LowerBearingPosition + this.parameters['leadscrewBearingH'] - this.towerMountScrew.l - this.towerMountScrew.k]),
				this.towerMountScrew.getTemplate().translate([0, -(((this.towerOutsideWidth/2)-this.guiderodClamp.getOffsetBelowRod() - this.parameters['guiderodDiameter'] - this.parameters['leadscrewBearingOD']/2)/2 +  this.parameters['leadscrewBearingOD']/2), this.zTowerHeight_LowerBearingPosition + this.parameters['leadscrewBearingH'] - this.towerMountScrew.l - this.towerMountScrew.k])
			)
		);
*/
		/* Add sacrificial bridges */

		printables = union(
			 printables,
			 cube({ size : [this.towerOutsideDepth, 2*insideSizeHalf, this.parameters['sacrificialBridgeSize']], center : true }).translate([0,0,this.parameters['sacrificialBridgeSize']/2 + this.zTowerHeight_Level3Position]).setColor([0,0,0]),
			 cube({ size : [this.towerOutsideDepth-middleCutFront, 2*insideSizeHalf, this.parameters['sacrificialBridgeSize']], center : true }).translate([middleCutFront/2,0,this.parameters['sacrificialBridgeSize']/2 + this.zTowerHeight_Level2Position]).setColor([0,0,0])
		);

		// Holes for inductive / capacitive sensors
		printables = difference(
			union(
				printables,
				cube({ size : [this.towerOutsideDepth+wallwidth, 1, 20], center : true}).translate([wallwidth/2, insideSizeHalf+wallwidth+1/2+5, this.zTowerHeight_Level2Position-this.parameters['zTowerLayerHeight']-20/2]),
				// cube({ size : [5, 5, 20], center : true}).translate([-this.towerOutsideDepth/2+5/2, insideSizeHalf+wallwidth+5/2, this.zTowerHeight_Level2Position-this.parameters['zTowerLayerHeight']-20/2]),
				// cube({ size : [5, 5, 20], center : true}).translate([this.towerOutsideDepth/2-5/2+wallwidth, insideSizeHalf+wallwidth+5/2, this.zTowerHeight_Level2Position-this.parameters['zTowerLayerHeight']-20/2]),

				cube({ size : [this.towerOutsideDepth+wallwidth, 1, 20], center : true}).translate([wallwidth/2, insideSizeHalf+wallwidth+1/2+5, this.zTowerHeight_LowerBearingPosition+this.parameters['leadscrewBearingH']+20/2]),
				// cube({ size : [5, 5, 20], center : true}).translate([-this.towerOutsideDepth/2+5/2, insideSizeHalf+wallwidth+5/2, this.zTowerHeight_LowerBearingPosition+this.parameters['leadscrewBearingH']+20/2]),
				// cube({ size : [5, 5, 20], center : true}).translate([this.towerOutsideDepth/2-5/2+wallwidth, insideSizeHalf+wallwidth+5/2, this.zTowerHeight_LowerBearingPosition+this.parameters['leadscrewBearingH']+20/2])

				cube({ size : [5, 5+1, this.zTowerHeight_MotorPosition], center : true}).translate([-this.towerOutsideDepth/2+5/2, insideSizeHalf+wallwidth+5/2+0.5, this.zTowerHeight_MotorPosition/2]),
				cube({ size : [5, 5+1, this.zTowerHeight_MotorPosition], center : true}).translate([this.towerOutsideDepth/2-5/2+wallwidth, insideSizeHalf+wallwidth+5/2+0.5, this.zTowerHeight_MotorPosition/2])
			),
			union(
				cylinder({ d : 13, h : wallwidth, center : true}).rotateX(90).translate([0, insideSizeHalf+wallwidth/2, this.zTowerHeight_Level2Position-this.parameters['zTowerLayerHeight']-20/2]),
				cylinder({ d : 13, h : wallwidth, center : true}).rotateX(90).translate([0, insideSizeHalf+wallwidth/2+5+1, this.zTowerHeight_Level2Position-this.parameters['zTowerLayerHeight']-20/2]),

				cylinder({ d : 13, h : wallwidth, center : true}).rotateX(90).translate([0, insideSizeHalf+wallwidth/2, this.zTowerHeight_LowerBearingPosition+this.parameters['leadscrewBearingH']+20/2]),
				cylinder({ d : 13, h : wallwidth, center : true}).rotateX(90).translate([0, insideSizeHalf+wallwidth/2+5+1, this.zTowerHeight_LowerBearingPosition+this.parameters['leadscrewBearingH']+20/2])
			)
		);

		// alert("Axis distance (from center): "+()+", Dimensions: "+(this.towerOutsideWidth+2*wallwidth)+"x"+(this.towerOutsideDepth+wallwidth)+"x"+this.zTowerHeight_MotorPosition);

		//printables = union(printables, mountplate);

		if(this.parameters['onlyPrintedPart']) {
			return printables;
		} else {
			return union(nonPrintable, printables);
		}
	}

	this.getGuiderailDistance = function() { return (this.towerOutsideWidth/2)-this.guiderodClamp.getOffsetBelowRod(); }
	this.getDimensionXReal = function() {
		let wallwidth = this.parameters['zTowerLayerHeight'];
		let insideSizeHalf = ((this.towerOutsideWidth/2)-this.guiderodClamp.getOffsetBelowRod() + this.linearBearing.getOutsideDiameter()/2 + this.parameters['guiderodClampMinWall'] + 1);
		return 2*insideSizeHalf+2*wallwidth+5+1;
	}
	this.getDimensionYReal = function() {
		let wallwidth = this.parameters['zTowerLayerHeight'];
		let insideSizeHalf = ((this.towerOutsideWidth/2)-this.guiderodClamp.getOffsetBelowRod() + this.linearBearing.getOutsideDiameter()/2 + this.parameters['guiderodClampMinWall'] + 1);
		return this.towerOutsideDepth+1*wallwidth;
	}

	this.getDimensionXRealAsymmetry = function() {
		return 3;
	}
	this.getDimensionYRealAsymmetry = function() {
		return this.parameters['zTowerLayerHeight'] / 2;
	}

	this.getBedMountScrewOffsetY = function() {
		return ((this.towerOutsideWidth/2)-this.guiderodClamp.getOffsetBelowRod() - this.parameters['guiderodDiameter'] - this.parameters['leadscrewBearingOD']/2)/2 +  this.parameters['leadscrewBearingOD']/2;
	};
}
window.jscad.tspi.miniecm.tool.mountplate = function(printer, params) {
	let knownParameters = [
		{ name: 'wireclampScrewM',				type: 'number',		default: 3			},
		{ name: 'wireclampScrewLength',			type: 'number',		default: 6			},
		{ name: 'wireclampWireDiameter',		type: 'number',		default: 2.4		},
		{ name: 'wireclampExtendsBottom',		type: 'number',		default: 10			},
		{ name: 'wireclampWireLength',			type: 'number',		default: 175		},

		{ name: 'toolHeight',					type: 'number',		default: 50			},

		{ name: 'onlyPrintedPart',				type: 'boolean',	default: false		},

		{ name: 'wireclampSlitWidth',			type: 'number',		default: 0			},
		{ name: 'wireclampMinWallThickness',	type: 'number',		default: 1			},

		{ name: 'guiderodClampM',				type: 'number',		default: 6			},
		{ name: 'guiderodClampScrewLength',		type: 'number',		default: 16			},
		{ name: 'lm8uuGrubScrewM',				type: 'number',		default: 3			},
		{ name: 'lm8uuGrubScrewLength',			type: 'number',		default: 6			},
		{ name: 'guiderodClampMinWall',			type: 'number',		default: 2			},
		{ name: 'minWallThickness',				type: 'number',		default: 1			},

		{ name: 'bedmountScrewM',				type: 'number',		default: 6			},
		{ name: 'bedmountScrewLength',			type: 'number',		default: 16			},

		{ name: 'leadscrewDiameter',			type: 'number',		default: 8			},
		{ name: 'leadscrewBearingOD',			type: 'number',		default: 22			},
		{ name: 'leadscrewBearingH',			type: 'number',		default: 7			},
		{ name: 'stepperZLength',				type: 'number',		default: 30			},
		{ name: 'stepperCouplerH',				type: 'number',		default: 25			},
		{ name: 'stepperCouplerD',				type: 'number',		default: 19			},
		{ name: 'lowerBallDiameter',			type: 'number',		default: 3			},

		{ name: 'toolmountScrewM',				type: 'number',		default: 6			},
		{ name: 'toolmountScrewLength',			type: 'number',		default: 16			},

		{ name: 'zDistance',					type: 'number',		default: 60			},
		{ name: 'zTowerLayerHeight',			type: 'number',		default: 5			},
		{ name: 'zTowerWidthOutsideMin',		type: 'number',		default: 0			},
		{ name: 'zTowerDepthOutsideMin',		type: 'number',		default: 0			},

		{ name: 'sacrificialBridgeSize',		type: 'number',		default: 0.14		},

		{ name: 'displayMountPlate',			type: 'boolean',	default: false		},
	];

	let knownPrinterParameters = [
		{ name: 'scale', 						type: 'number', 	default: 1 			},
		{ name: 'correctionInsideDiameter', 	type: 'number', 	default: 0 			},
		{ name: 'correctionOutsideDiameter', 	type: 'number', 	default: 0 			},
		{ name: 'resolutionCircle', 			type: 'number', 	default: 360 		},
		{ name: 'guiderodClampDiaCorrection',	type: 'number',		default: 0.1		},
		{ name: 'lm8uuInsertDiameterScale',		type: 'number',		default: 1.05		},
	];

	this.rawprinter = printer;
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

	this.rawprinter = printer;
	this.parameters['onlyPrintedPart'] = false;

	let tower = new window.jscad.tspi.miniecm.tool.ztower01(params, params);

	/*
		this.stepperMountScrew = new window.jscad.tspi.iso4762Screw(printer, { m : 3, l : 25 });
		this.towerMountScrew = new window.jscad.tspi.iso4762Screw(printer, { m : this.parameters['bedmountScrewM'], l : this.parameters['bedmountScrewLength'] });
	*/
	this.toolmountNut = new window.jscad.tspi.isoNut(printer, { m : this.parameters['bedmountScrewM'] });
	this.towerMountScrew = new window.jscad.tspi.iso4762Screw(printer, { m : this.parameters['bedmountScrewM'], l : this.parameters['bedmountScrewLength'] });
	let towerMountScrewScaleZ = 1.2;

	let screwPenetrationLength = - (this.parameters['zTowerLayerHeight'] + this.parameters['lowerBallDiameter'] + this.parameters['leadscrewBearingH'] - this.towerMountScrew.l - this.towerMountScrew.k);
	let mountplateOverlap = 5;
	let mountplateThickness = screwPenetrationLength + mountplateOverlap;
	let mountscrewWallThickness = screwPenetrationLength - this.toolmountNut.getHeight()*towerMountScrewScaleZ;

	this.tower = tower;

	let outsideWallWidth = 1;

	this.mountplateSizeX = this.tower.getDimensionYReal()+2*outsideWallWidth;
	this.mountplateSizeY = this.tower.getDimensionXReal()+2*outsideWallWidth;
	this.mountplateAsymX = this.tower.getDimensionYRealAsymmetry();
	this.mountplateAsymY = this.tower.getDimensionXRealAsymmetry();

	this.getModel = function() {
		let outsideWallWidth = 1;

		let mountplate = difference(
			cube({ size : [this.tower.getDimensionYReal()+2*outsideWallWidth, this.tower.getDimensionXReal()+2*outsideWallWidth, mountplateThickness], center : true}).translate([this.tower.getDimensionYRealAsymmetry(), this.tower.getDimensionXRealAsymmetry(), -mountplateThickness/2 + mountplateOverlap]),
			tower.getModel().scale(1.01)
		);
		mountplate = difference(
			mountplate,
			this.toolmountNut.getModel().scale([1,1,towerMountScrewScaleZ]).translate([0, tower.getBedMountScrewOffsetY(), this.toolmountNut.getHeight()*towerMountScrewScaleZ/2-(mountplateThickness-mountplateOverlap)])
		);
		mountplate = difference(
			mountplate,
			this.toolmountNut.getModel().scale([1,1,towerMountScrewScaleZ]).translate([0, -tower.getBedMountScrewOffsetY(), this.toolmountNut.getHeight()*towerMountScrewScaleZ/2-(mountplateThickness-mountplateOverlap)])
		);

		// Cut slits to insert nuts from the side ...
		mountplate = difference(
			mountplate,
			cube({ size : [(this.tower.getDimensionYReal()+2*outsideWallWidth)/2, this.toolmountNut.getRadiusInside(), this.toolmountNut.getHeight()*towerMountScrewScaleZ], center : true }).translate([(this.tower.getDimensionYReal()+2*outsideWallWidth)/4+this.tower.getDimensionYRealAsymmetry(), -tower.getBedMountScrewOffsetY(), this.toolmountNut.getHeight()*towerMountScrewScaleZ/2-(mountplateThickness-mountplateOverlap)]),
			cube({ size : [(this.tower.getDimensionYReal()+2*outsideWallWidth)/2, this.toolmountNut.getRadiusInside(), this.toolmountNut.getHeight()*towerMountScrewScaleZ], center : true }).translate([(this.tower.getDimensionYReal()+2*outsideWallWidth)/4+this.tower.getDimensionYRealAsymmetry(),  tower.getBedMountScrewOffsetY(), this.toolmountNut.getHeight()*towerMountScrewScaleZ/2-(mountplateThickness-mountplateOverlap)])
		);

		// Add a sacrificial bridge immediatly on top of the nut
		mountplate = union(
			mountplate,
			cube({ size : [this.tower.getDimensionYReal()+2*outsideWallWidth, this.tower.getDimensionXReal()+2*outsideWallWidth, this.parameters['sacrificialBridgeSize']] , center : true }).translate([this.tower.getDimensionYRealAsymmetry(), this.tower.getDimensionXRealAsymmetry(),-mountscrewWallThickness + this.parameters['sacrificialBridgeSize']/2]).setColor([0,0,0])
		)

		return union(
			mountplate
			// this.towerMountScrew.getTemplate().translate([0,0,(this.parameters['zTowerLayerHeight'] + this.parameters['lowerBallDiameter'] + this.parameters['leadscrewBearingH'] - this.towerMountScrew.l - this.towerMountScrew.k) + screwPenetrationLength])
			// this.towerMountScrew.getTemplate().translate([0,tower.getBedMountScrewOffsetY(),(this.parameters['zTowerLayerHeight'] + this.parameters['lowerBallDiameter'] + this.parameters['leadscrewBearingH'] - this.towerMountScrew.l - this.towerMountScrew.k)]),
			// this.towerMountScrew.getTemplate().translate([0,-tower.getBedMountScrewOffsetY(),(this.parameters['zTowerLayerHeight'] + this.parameters['lowerBallDiameter'] + this.parameters['leadscrewBearingH'] - this.towerMountScrew.l - this.towerMountScrew.k)])
		);
	}

	this.getMountplateLowerZPosition = function() {
		let screwPenetrationLength = - (this.parameters['zTowerLayerHeight'] + this.parameters['lowerBallDiameter'] + this.parameters['leadscrewBearingH'] - this.towerMountScrew.l - this.towerMountScrew.k);
		return -screwPenetrationLength;
	}

	this.getMountplateWidth = function() {
		return this.tower.getDimensionYReal()+2*outsideWallWidth;
	}
	this.getMountplateLength = function() {
		return  this.tower.getDimensionXReal()+2*outsideWallWidth;
	}
}

/* END OF DEPENDENCIES */

function getParameterDefinitions() {
    return [
		{ name : 'grpSled', type : 'Group', caption : 'Sled' },
//        { name: 'sledSizeInside', type: 'float', initial: 0, caption: 'Inside sled size' },
//		{ name: 'sledSizeOutsideMin', type: 'float', initial: 0, caption: 'Minimum outside sled size' },
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
	let mountplate = new window.jscad.tspi.miniecm.tool.mountplate(params, params);

	params['sledSizeOutsideMin'] = Math.max(mountplate.getMountplateWidth(), mountplate.getMountplateLength());
	params['sledSizeInside'] = 45;

	return (new window.jscad.tspi.miniecm.carriagexy(params, params)).getModel().rotateZ(90).scale([1.01083032491, 1.00214745884, 1]);
}
