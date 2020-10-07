include('/mechanics/isothread.jscad');
include('/mechanics/screwclamp.jscad');
include('/mechanics/bearingLM8LUU.jscad');
include('/mechanics/bearingLM8UU.jscad');

if(typeof window === 'undefined') { window = new Object(); }
if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.miniecm !== 'object') { window.jscad.tspi.miniecm = new Object(); }

window.jscad.tspi.miniecm.sledxy = function(printer, params) {
	let knownParameters = [
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
	this.knownGrubScrew = new window.jscad.tspi.iso4762Screw(printer, { m : this.parameters['lm8uuGrubScrewM'], l : this.parameters['lm8uuGrubScrewLength'] });
	this.knownClampNut = new window.jscad.tspi.isoNut(printer, { m : this.parameters['guiderodClampM'] });

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
		let sledDYByScrew = (Math.max(0, this.requiredWallWidth-this.knownClamp.getClampSizeX()))/2;
		let sledSizeX = this.sledRealSizeX+2*sledDYByScrew; // (this.bearing.getOutsideDiameter() + 2*this.parameters['minWallThickness']) * 2;
		let sledSizeY = this.sledRealSizeY+2*sledDYByScrew;
		let sledSizeZ =2 * this.knownClamp.getClampSizeY();

		let axis2Height = this.knownClamp.getClampSizeY();

		let sled = cube({ size : [ sledSizeX, sledSizeY, sledSizeZ ] });

		// Cut areas required by bearings ... note that bearing can only be inserted from one side ...
		sled = difference(
			sled,
			union(
				cylinder({ d : this.parameters['guiderodDiameter']+this.parameters['spacingThroughHole'], h : sledSizeX }).rotateY(90).translate([0,sledDYByScrew+this.knownClamp.getClampSizeX()/2,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
				cylinder({ d : this.parameters['guiderodDiameter']+this.parameters['spacingThroughHole'], h : sledSizeX }).rotateY(90).translate([0,-sledDYByScrew+sledSizeY-this.knownClamp.getClampSizeX()/2,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),

				cylinder({ d : this.parameters['guiderodDiameter']+this.parameters['spacingThroughHole'], h : sledSizeX }).rotateX(-90).translate([sledDYByScrew+this.knownClamp.getClampSizeX()/2,0,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2+axis2Height]),
				cylinder({ d : this.parameters['guiderodDiameter']+this.parameters['spacingThroughHole'], h : sledSizeX }).rotateX(-90).translate([-sledDYByScrew+sledSizeY-this.knownClamp.getClampSizeX()/2,0,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2+axis2Height])
			)
		);

		sled = difference(
			sled,
			union(
				this.bearing.getTemplate().scale(this.printer['lm8uuInsertDiameterScale']).rotateY(90).translate([this.bearing.getLength()/2,sledDYByScrew+this.knownClamp.getClampSizeX()/2,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
				this.bearing.getTemplate().scale(this.printer['lm8uuInsertDiameterScale']).rotateY(90).translate([this.bearing.getLength()/2,-sledDYByScrew+sledSizeY-this.knownClamp.getClampSizeX()/2,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
				this.bearing.getTemplate().scale(this.printer['lm8uuInsertDiameterScale']).rotateY(90).translate([sledSizeX-this.bearing.getLength()/2,sledDYByScrew+this.knownClamp.getClampSizeX()/2,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
				this.bearing.getTemplate().scale(this.printer['lm8uuInsertDiameterScale']).rotateY(90).translate([sledSizeX-this.bearing.getLength()/2,-sledDYByScrew+sledSizeY-this.knownClamp.getClampSizeX()/2,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),


				this.bearing.getTemplate().scale(this.printer['lm8uuInsertDiameterScale']).rotateX(-90).translate([sledDYByScrew+this.knownClamp.getClampSizeX()/2,this.bearing.getLength()/2,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2+axis2Height]),
				this.bearing.getTemplate().scale(this.printer['lm8uuInsertDiameterScale']).rotateX(-90).translate([-sledDYByScrew+sledSizeY-this.knownClamp.getClampSizeX()/2,this.bearing.getLength()/2,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2+axis2Height]),
				this.bearing.getTemplate().scale(this.printer['lm8uuInsertDiameterScale']).rotateX(-90).translate([sledDYByScrew+this.knownClamp.getClampSizeX()/2,sledSizeY-this.bearing.getLength()/2,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2+axis2Height]),
				this.bearing.getTemplate().scale(this.printer['lm8uuInsertDiameterScale']).rotateX(-90).translate([-sledDYByScrew+sledSizeY-this.knownClamp.getClampSizeX()/2,sledSizeY-this.bearing.getLength()/2,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2+axis2Height])
			)
		);

		let grubScrewOffset = (this.bearing.getLength() - this.bearing.getGrooveDistance() + this.bearing.getGrooveDepth())/2;
		let grubScrewMinLen = this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2; // Usually 16.5mm
		let grubScrewNutDistance = this.parameters['guiderodClampMinWall']; // Distance between grub screw nut and bearing
		let grubScrewRealLen = this.knownGrubScrew.l + this.knownGrubScrew.k;

		let grubScrewNutDiameter = this.knownGrubNut.getRadiusOutside()*2;
		let grubScrewNutThickness = this.knownGrubNut.getHeight()*1.2 ;
		let grubScrewNutCutDepth1 = this.knownGrubNut.getRadiusOutside()*1.5+this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2;
		let grubScrewNutCutDepth2 = this.knownGrubNut.getRadiusOutside()*1.5+this.knownClamp.getClampThickness()-this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2;
		let grubScrewNutPosition2 = this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2+axis2Height;

		sled = difference(
			sled,
			union(
				this.knownGrubScrew.getTemplate().rotateX(90).translate([0,this.knownGrubScrew.l+this.knownGrubScrew.k,0]).translate([grubScrewOffset, 0, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
				this.knownGrubScrew.getTemplate().rotateX(90).translate([0,this.knownGrubScrew.l+this.knownGrubScrew.k,0]).translate([this.bearing.getLength() - grubScrewOffset, 0, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
				this.knownGrubScrew.getTemplate().rotateX(90).translate([0,this.knownGrubScrew.l+this.knownGrubScrew.k,0]).translate([sledSizeX-grubScrewOffset, 0, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
				this.knownGrubScrew.getTemplate().rotateX(90).translate([0,this.knownGrubScrew.l+this.knownGrubScrew.k,0]).translate([sledSizeX-(this.bearing.getLength() - grubScrewOffset), 0, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),

				this.knownGrubScrew.getTemplate().rotateX(-90).translate([0,-this.knownGrubScrew.l-this.knownGrubScrew.k,0]).translate([grubScrewOffset, sledSizeY, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
				this.knownGrubScrew.getTemplate().rotateX(-90).translate([0,-this.knownGrubScrew.l-this.knownGrubScrew.k,0]).translate([this.bearing.getLength() - grubScrewOffset, sledSizeY, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
				this.knownGrubScrew.getTemplate().rotateX(-90).translate([0,-this.knownGrubScrew.l-this.knownGrubScrew.k,0]).translate([sledSizeX-grubScrewOffset, sledSizeY, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
				this.knownGrubScrew.getTemplate().rotateX(-90).translate([0,-this.knownGrubScrew.l-this.knownGrubScrew.k,0]).translate([sledSizeX-(this.bearing.getLength() - grubScrewOffset), sledSizeY, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),

				this.knownGrubScrew.getTemplate().rotateY(-90).translate([this.knownGrubScrew.l+this.knownGrubScrew.k,0,0]).translate([0, grubScrewOffset, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2+axis2Height]),
				this.knownGrubScrew.getTemplate().rotateY(-90).translate([this.knownGrubScrew.l+this.knownGrubScrew.k,0,0]).translate([0, this.bearing.getLength() - grubScrewOffset, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2+axis2Height]),
				this.knownGrubScrew.getTemplate().rotateY(-90).translate([this.knownGrubScrew.l+this.knownGrubScrew.k,0,0]).translate([0, sledSizeY-grubScrewOffset, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2+axis2Height]),
				this.knownGrubScrew.getTemplate().rotateY(-90).translate([this.knownGrubScrew.l+this.knownGrubScrew.k,0,0]).translate([0, sledSizeY-(this.bearing.getLength() - grubScrewOffset), this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2+axis2Height]),

				this.knownGrubScrew.getTemplate().rotateY(90).translate([-this.knownGrubScrew.l-this.knownGrubScrew.k,0,0]).translate([sledSizeX, grubScrewOffset, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2+axis2Height]),
				this.knownGrubScrew.getTemplate().rotateY(90).translate([-this.knownGrubScrew.l-this.knownGrubScrew.k,0,0]).translate([sledSizeX, this.bearing.getLength() - grubScrewOffset, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2+axis2Height]),
				this.knownGrubScrew.getTemplate().rotateY(90).translate([-this.knownGrubScrew.l-this.knownGrubScrew.k,0,0]).translate([sledSizeX, sledSizeY-grubScrewOffset, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2+axis2Height]),
				this.knownGrubScrew.getTemplate().rotateY(90).translate([-this.knownGrubScrew.l-this.knownGrubScrew.k,0,0]).translate([sledSizeX, sledSizeY-(this.bearing.getLength() - grubScrewOffset), this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2+axis2Height])
			)
		);

		sled = difference(
			sled,
			union(
				cube({ size : [grubScrewNutDiameter,grubScrewNutThickness,grubScrewNutCutDepth1], center : true }).translate([grubScrewOffset, sledDYByScrew+this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()*this.printer['lm8uuInsertDiameterScale']/2-grubScrewNutDistance, grubScrewNutCutDepth1/2]),
				cube({ size : [grubScrewNutDiameter,grubScrewNutThickness,grubScrewNutCutDepth1], center : true }).translate([this.bearing.getLength() - grubScrewOffset, sledDYByScrew+this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()*this.printer['lm8uuInsertDiameterScale']/2-grubScrewNutDistance, grubScrewNutCutDepth1/2]),
				cube({ size : [grubScrewNutDiameter,grubScrewNutThickness,grubScrewNutCutDepth1], center : true }).translate([sledSizeX-grubScrewOffset, sledDYByScrew+this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()*this.printer['lm8uuInsertDiameterScale']/2-grubScrewNutDistance, grubScrewNutCutDepth1/2]),
				cube({ size : [grubScrewNutDiameter,grubScrewNutThickness,grubScrewNutCutDepth1], center : true }).translate([sledSizeX-(this.bearing.getLength() - grubScrewOffset), sledDYByScrew+this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()*this.printer['lm8uuInsertDiameterScale']/2-grubScrewNutDistance, grubScrewNutCutDepth1/2]),

				cube({ size : [grubScrewNutDiameter,grubScrewNutThickness,grubScrewNutCutDepth1], center : true }).translate([grubScrewOffset, sledSizeY-(sledDYByScrew+this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2-grubScrewNutDistance), grubScrewNutCutDepth1/2]),
				cube({ size : [grubScrewNutDiameter,grubScrewNutThickness,grubScrewNutCutDepth1], center : true }).translate([this.bearing.getLength() - grubScrewOffset, sledSizeY-(sledDYByScrew+this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2-grubScrewNutDistance), grubScrewNutCutDepth1/2]),
				cube({ size : [grubScrewNutDiameter,grubScrewNutThickness,grubScrewNutCutDepth1], center : true }).translate([sledSizeX-grubScrewOffset, sledSizeY-(sledDYByScrew+this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2-grubScrewNutDistance), grubScrewNutCutDepth1/2]),
				cube({ size : [grubScrewNutDiameter,grubScrewNutThickness,grubScrewNutCutDepth1], center : true }).translate([sledSizeX-(this.bearing.getLength() - grubScrewOffset), sledSizeY-(sledDYByScrew+this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2-grubScrewNutDistance), grubScrewNutCutDepth1/2]),

				cube({ size : [grubScrewNutThickness,grubScrewNutDiameter,grubScrewNutCutDepth2], center : true }).translate([sledDYByScrew+this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2-grubScrewNutDistance,grubScrewOffset, sledSizeZ-grubScrewNutCutDepth2/2]),
				cube({ size : [grubScrewNutThickness,grubScrewNutDiameter,grubScrewNutCutDepth2], center : true }).translate([sledDYByScrew+this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2-grubScrewNutDistance,this.bearing.getLength() - grubScrewOffset, sledSizeZ-grubScrewNutCutDepth2/2]),
				cube({ size : [grubScrewNutThickness,grubScrewNutDiameter,grubScrewNutCutDepth2], center : true }).translate([sledDYByScrew+this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2-grubScrewNutDistance,sledSizeY-grubScrewOffset, sledSizeZ-grubScrewNutCutDepth2/2]),
				cube({ size : [grubScrewNutThickness,grubScrewNutDiameter,grubScrewNutCutDepth2], center : true }).translate([sledDYByScrew+this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2-grubScrewNutDistance,sledSizeY-(this.bearing.getLength() - grubScrewOffset), sledSizeZ-grubScrewNutCutDepth2/2]),

				cube({ size : [grubScrewNutThickness,grubScrewNutDiameter,grubScrewNutCutDepth2], center : true }).translate([sledSizeX-(sledDYByScrew+this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2-grubScrewNutDistance),grubScrewOffset, sledSizeZ-grubScrewNutCutDepth2/2]),
				cube({ size : [grubScrewNutThickness,grubScrewNutDiameter,grubScrewNutCutDepth2], center : true }).translate([sledSizeX-(sledDYByScrew+this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2-grubScrewNutDistance),this.bearing.getLength() - grubScrewOffset, sledSizeZ-grubScrewNutCutDepth2/2]),
				cube({ size : [grubScrewNutThickness,grubScrewNutDiameter,grubScrewNutCutDepth2], center : true }).translate([sledSizeX-(sledDYByScrew+this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2-grubScrewNutDistance),sledSizeY-grubScrewOffset, sledSizeZ-grubScrewNutCutDepth2/2]),
				cube({ size : [grubScrewNutThickness,grubScrewNutDiameter,grubScrewNutCutDepth2], center : true }).translate([sledSizeX-(sledDYByScrew+this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2-grubScrewNutDistance),sledSizeY-(this.bearing.getLength() - grubScrewOffset), sledSizeZ-grubScrewNutCutDepth2/2])
			)
		);


		// Cut inside (for general purpose tooling)
		if(this.parameters['sledSizeInside'] > 0) {
			sled = difference(
				sled,
				cube({ size : [sledSizeX-2*this.requiredWallWidth, sledSizeY-2*this.requiredWallWidth, sledSizeZ]}).translate([this.requiredWallWidth, this.requiredWallWidth, 0])
			);
		}

		if(!this.parameters['onlyPrintedPart']) {
			sled = union(
				sled,

				this.bearing.getModel().rotateY(90).translate([this.bearing.getLength()/2,sledDYByScrew+this.knownClamp.getClampSizeX()/2,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
				this.bearing.getModel().rotateY(90).translate([this.bearing.getLength()/2,-sledDYByScrew+sledSizeY-this.knownClamp.getClampSizeX()/2,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
				this.bearing.getModel().rotateY(90).translate([sledSizeX-this.bearing.getLength()/2,sledDYByScrew+this.knownClamp.getClampSizeX()/2,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
				this.bearing.getModel().rotateY(90).translate([sledSizeX-this.bearing.getLength()/2,-sledDYByScrew+sledSizeY-this.knownClamp.getClampSizeX()/2,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),

				this.bearing.getModel().rotateX(-90).translate([sledDYByScrew+this.knownClamp.getClampSizeX()/2,this.bearing.getLength()/2,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2+axis2Height]),
				this.bearing.getModel().rotateX(-90).translate([-sledDYByScrew+sledSizeY-this.knownClamp.getClampSizeX()/2,this.bearing.getLength()/2,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2+axis2Height]),
				this.bearing.getModel().rotateX(-90).translate([sledDYByScrew+this.knownClamp.getClampSizeX()/2,sledSizeY-this.bearing.getLength()/2,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2+axis2Height]),
				this.bearing.getModel().rotateX(-90).translate([-sledDYByScrew+sledSizeY-this.knownClamp.getClampSizeX()/2,sledSizeY-this.bearing.getLength()/2,this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2+axis2Height]),

				this.knownGrubNut.getModel().rotateX(90).translate([grubScrewOffset, this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2-grubScrewNutDistance, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]).setColor([0.8,0.8,0.8]),
				this.knownGrubNut.getModel().rotateX(90).translate([this.bearing.getLength() - grubScrewOffset, this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2-grubScrewNutDistance, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]).setColor([0.8,0.8,0.8]),
				this.knownGrubNut.getModel().rotateX(90).translate([sledSizeX-grubScrewOffset, this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2-grubScrewNutDistance, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]).setColor([0.8,0.8,0.8]),
				this.knownGrubNut.getModel().rotateX(90).translate([sledSizeX-(this.bearing.getLength() - grubScrewOffset), this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2-grubScrewNutDistance, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]).setColor([0.8,0.8,0.8]),

				this.knownGrubNut.getModel().rotateX(90).translate([grubScrewOffset, sledSizeY-(this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2-grubScrewNutDistance), this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]).setColor([0.8,0.8,0.8]),
				this.knownGrubNut.getModel().rotateX(90).translate([this.bearing.getLength() - grubScrewOffset, sledSizeY-(this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2-grubScrewNutDistance), this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]).setColor([0.8,0.8,0.8]),
				this.knownGrubNut.getModel().rotateX(90).translate([sledSizeX-grubScrewOffset, sledSizeY-(this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2-grubScrewNutDistance), this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]).setColor([0.8,0.8,0.8]),
				this.knownGrubNut.getModel().rotateX(90).translate([sledSizeX-(this.bearing.getLength() - grubScrewOffset), sledSizeY-(this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2-grubScrewNutDistance), this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]).setColor([0.8,0.8,0.8]),

				this.knownGrubNut.getModel().rotateY(90).translate([this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2-grubScrewNutDistance,grubScrewOffset,grubScrewNutPosition2]).setColor([0.8,0.8,0.8]),
				this.knownGrubNut.getModel().rotateY(90).translate([this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2-grubScrewNutDistance,this.bearing.getLength() - grubScrewOffset,grubScrewNutPosition2]).setColor([0.8,0.8,0.8]),
				this.knownGrubNut.getModel().rotateY(90).translate([this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2-grubScrewNutDistance,sledSizeY-grubScrewOffset,grubScrewNutPosition2]).setColor([0.8,0.8,0.8]),
				this.knownGrubNut.getModel().rotateY(90).translate([this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2-grubScrewNutDistance,sledSizeY-(this.bearing.getLength() - grubScrewOffset),grubScrewNutPosition2]).setColor([0.8,0.8,0.8]),

				this.knownGrubNut.getModel().rotateY(90).translate([sledSizeX-(this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2-grubScrewNutDistance),grubScrewOffset,grubScrewNutPosition2]).setColor([0.8,0.8,0.8]),
				this.knownGrubNut.getModel().rotateY(90).translate([sledSizeX-(this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2-grubScrewNutDistance),this.bearing.getLength() - grubScrewOffset,grubScrewNutPosition2]).setColor([0.8,0.8,0.8]),
				this.knownGrubNut.getModel().rotateY(90).translate([sledSizeX-(this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2-grubScrewNutDistance),sledSizeY-grubScrewOffset,grubScrewNutPosition2]).setColor([0.8,0.8,0.8]),
				this.knownGrubNut.getModel().rotateY(90).translate([sledSizeX-(this.knownClamp.getClampSizeX()/2-this.bearing.getOutsideDiameter()/2-grubScrewNutDistance),sledSizeY-(this.bearing.getLength() - grubScrewOffset),grubScrewNutPosition2]).setColor([0.8,0.8,0.8]),

				this.knownGrubScrew.getTemplate().rotateX(90).translate([0,this.knownGrubScrew.l+this.knownGrubScrew.k,0]).translate([grubScrewOffset, 0, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
				this.knownGrubScrew.getTemplate().rotateX(90).translate([0,this.knownGrubScrew.l+this.knownGrubScrew.k,0]).translate([this.bearing.getLength() - grubScrewOffset, 0, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
				this.knownGrubScrew.getTemplate().rotateX(90).translate([0,this.knownGrubScrew.l+this.knownGrubScrew.k,0]).translate([sledSizeX-grubScrewOffset, 0, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
				this.knownGrubScrew.getTemplate().rotateX(90).translate([0,this.knownGrubScrew.l+this.knownGrubScrew.k,0]).translate([sledSizeX-(this.bearing.getLength() - grubScrewOffset), 0, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),

				this.knownGrubScrew.getTemplate().rotateX(-90).translate([0,-this.knownGrubScrew.l-this.knownGrubScrew.k,0]).translate([grubScrewOffset, sledSizeY, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
				this.knownGrubScrew.getTemplate().rotateX(-90).translate([0,-this.knownGrubScrew.l-this.knownGrubScrew.k,0]).translate([this.bearing.getLength() - grubScrewOffset, sledSizeY, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
				this.knownGrubScrew.getTemplate().rotateX(-90).translate([0,-this.knownGrubScrew.l-this.knownGrubScrew.k,0]).translate([sledSizeX-grubScrewOffset, sledSizeY, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),
				this.knownGrubScrew.getTemplate().rotateX(-90).translate([0,-this.knownGrubScrew.l-this.knownGrubScrew.k,0]).translate([sledSizeX-(this.bearing.getLength() - grubScrewOffset), sledSizeY, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2]),

				this.knownGrubScrew.getTemplate().rotateY(-90).translate([this.knownGrubScrew.l+this.knownGrubScrew.k,0,0]).translate([0, grubScrewOffset, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2+axis2Height]),
				this.knownGrubScrew.getTemplate().rotateY(-90).translate([this.knownGrubScrew.l+this.knownGrubScrew.k,0,0]).translate([0, this.bearing.getLength() - grubScrewOffset, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2+axis2Height]),
				this.knownGrubScrew.getTemplate().rotateY(-90).translate([this.knownGrubScrew.l+this.knownGrubScrew.k,0,0]).translate([0, sledSizeY-grubScrewOffset, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2+axis2Height]),
				this.knownGrubScrew.getTemplate().rotateY(-90).translate([this.knownGrubScrew.l+this.knownGrubScrew.k,0,0]).translate([0, sledSizeY-(this.bearing.getLength() - grubScrewOffset), this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2+axis2Height]),

				this.knownGrubScrew.getTemplate().rotateY(90).translate([-this.knownGrubScrew.l-this.knownGrubScrew.k,0,0]).translate([sledSizeX, grubScrewOffset, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2+axis2Height]),
				this.knownGrubScrew.getTemplate().rotateY(90).translate([-this.knownGrubScrew.l-this.knownGrubScrew.k,0,0]).translate([sledSizeX, this.bearing.getLength() - grubScrewOffset, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2+axis2Height]),
				this.knownGrubScrew.getTemplate().rotateY(90).translate([-this.knownGrubScrew.l-this.knownGrubScrew.k,0,0]).translate([sledSizeX, sledSizeY-grubScrewOffset, this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2+axis2Height]),
				this.knownGrubScrew.getTemplate().rotateY(90).translate([-this.knownGrubScrew.l-this.knownGrubScrew.k,0,0]).translate([sledSizeX, sledSizeY-(this.bearing.getLength() - grubScrewOffset), this.knownClamp.getOffsetBelowRod()+this.parameters['guiderodDiameter']/2+axis2Height])
			);
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
	return (new window.jscad.tspi.miniecm.sledxy(params, params)).getModel();
}
