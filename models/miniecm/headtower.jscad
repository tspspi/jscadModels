include('/mechanics/isothread.jscad');
include('/mechanics/screwclamp.jscad');
include('/mechanics/stepperNema17.jscad');
include('/mechanics/bearingLM8UU.jscad');
include('/mechanics/bearingLM8LUU.jscad');

if(typeof window === 'undefined') { window = new Object(); }
if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.miniecm !== 'object') { window.jscad.tspi.miniecm = new Object(); }
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

window.jscad.tspi.miniecm.leadscrewnutT8 = function(printer, params) {
	this.getTemplate = function() {
		return union(
			cylinder({ d : 10.2, h : 15, center : true }).translate([0,0,15/2 - 10]),
			cylinder({ d : 22, h : 7, center : true }).translate([0,0,3.5/2]),	// Moving 7 upwards to allow for screw heads ...

			// Shifted coreholes ...
			cylinder({d : 3, h : 8, center : true }).translate([8,0,-8/2]),
			cylinder({d : 3, h : 8, center : true }).translate([-8,0,-8/2]),
			cylinder({d : 3, h : 8, center : true }).translate([0,8,-8/2]),
			cylinder({d : 3, h : 8, center : true }).translate([0,-8,-8/2])
		).setColor([0.8,0.8,0.8]);
	}
	this.getModel = function() {
		return difference(
			union(
				cylinder({ d : 10.2, h : 15, center : true }).translate([0,0,15/2 - 10]),
				cylinder({ d : 22, h : 3.5, center : true }).translate([0,0,3.5/2])
			),
			union(
				cylinder({d : 3.5, h : 3.5, center : true }).translate([8,0,3.5/2]),
				cylinder({d : 3.5, h : 3.5, center : true }).translate([-8,0,3.5/2]),
				cylinder({d : 3.5, h : 3.5, center : true }).translate([0,8,3.5/2]),
				cylinder({d : 3.5, h : 3.5, center : true }).translate([0,-8,3.5/2]),
				cylinder({ d : 8, h : 15, center : true }).translate([0,0,15/2 - 10])
			)
		).setColor([0.8,0.8,0.8]);
	}

	this.getMaxDiameter = function() { return 22; }
}

window.jscad.tspi.miniecm.tool.wiretool01 = function(printer, params) {
	let knownParameters = [
		{ name: 'wireclampScrewM',				type: 'number',		default: 3			},
		{ name: 'wireclampScrewLength',			type: 'number',		default: 6			},
		{ name: 'wireclampWireDiameter',		type: 'number',		default: 2.4		},
		{ name: 'wireclampExtendsBottom',		type: 'number',		default: 10			},
		{ name: 'wireclampWireLength',			type: 'number',		default: 175		},

		{ name: 'toolHeight',					type: 'number',		default: 50			},

		{ name: 'onlyPrintedPart',				type: 'boolean',	default: true		},

		{ name: 'partToolholder01A',			type: 'boolean',	default: true		},
		{ name: 'partToolholder01B',			type: 'boolean',	default: false		},

		{ name: 'wireclampSlitWidth',			type: 'number',		default: 0			},
		{ name: 'wireclampMinWallThickness',	type: 'number',		default: 1			},

		{ name: 'guiderodClampM',				type: 'number',		default: 6			},
		{ name: 'guiderodClampScrewLength',		type: 'number',		default: 16			},
		{ name: 'lm8uuGrubScrewM',				type: 'number',		default: 3			},
		{ name: 'lm8uuGrubScrewLength',			type: 'number',		default: 6			},
		{ name: 'guiderodClampMinWall',			type: 'number',		default: 2			},
		{ name: 'minWallThickness',				type: 'number',		default: 1			},

		{ name: 'leadscrewDiameter',			type: 'number',		default: 8			},
		{ name: 'leadscrewBearingOD',			type: 'number',		default: 22			},
		{ name: 'leadscrewBearingH',			type: 'number',		default: 7			},
		{ name: 'stepperZLength',				type: 'number',		default: 30			},
		{ name: 'stepperCouplerH',				type: 'number',		default: 25			},
		{ name: 'stepperCouplerD',				type: 'number',		default: 19			},
		{ name: 'lowerBallDiameter',			type: 'number',		default: 3			},

		{ name: 'toolmountScrewM',				type: 'number',		default: 6			},
		{ name: 'toolmountScrewLength',			type: 'number',		default: 16			},

		{ name: 'zDistance',					type: 'number',		default: 50			},
		{ name: 'zTowerLayerHeight',			type: 'number',		default: 5			},
		{ name: 'zTowerWidthOutsideMin',		type: 'number',		default: 0			},
		{ name: 'zTowerDepthOutsideMin',		type: 'number',		default: 0			},

		{ name: 'sacrificialBridgeSize',		type: 'number',		default: 0.14		},
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

	this.associatedTower = new window.jscad.tspi.miniecm.tool.ztower01(printer, params);

	this.parameters['guiderodDiameter'] = 8+this.printer['guiderodClampDiaCorrection']; /* Fixed since we use LM8UU bearings */
	this.guiderodClamp = new window.jscad.tspi.mechanics.basicScrewclamp(printer, { m : this.parameters['guiderodClampM'], screwLength : this.parameters['guiderodClampScrewLength'], rodDiameter : this.parameters['guiderodDiameter'], onlyPrintedPart : this.parameters['onlyPrintedPart'], minWallThickness : this.parameters['guiderodClampMinWall']});
	this.wireClamp = new window.jscad.tspi.mechanics.basicScrewclamp(this.rawprinter, { m : this.parameters['wireclampScrewM'], screwLength : this.parameters['wireclampScrewLength'], rodDiameter : this.parameters['wireclampWireDiameter'], onlyPrintedPart : this.parameters['onlyPrintedPart'], minWallThickness : this.parameters['wireclampMinWallThickness']});
	this.linearBearing = new window.jscad.tspi.mechanics.bearings.LM8LUU(printer, {});
	this.leadscrewnut = new window.jscad.tspi.miniecm.leadscrewnutT8(printer, {});

	this.toolmountNut = new window.jscad.tspi.isoNut(printer, { m : this.parameters['toolmountScrewM'], l : this.parameters['toolmountScrewLength'] });
	this.toolmountScrew = new window.jscad.tspi.iso4762Screw(printer, { m : this.parameters['toolmountScrewM'], l : this.parameters['toolmountScrewLength'] });

	this.getModel = function() {
		let thicknessCarrier = Math.max(this.linearBearing.getOutsideDiameter(), this.leadscrewnut.getMaxDiameter()) + 2 * this.parameters['guiderodClampMinWall'];
		let widthCarrier = this.associatedTower.getGuiderailDistance()*2 + this.linearBearing.getOutsideDiameter() + 2*this.parameters['guiderodClampMinWall'];
		let heightCarrier = this.parameters['zDistance'];

		let spacingElectrodeLead = 45/2 - this.wireClamp.getOffsetBelowRod() + this.parameters['wireclampWireDiameter']/2 - thicknessCarrier/2;

		let nonPrintable = union(
			this.linearBearing.getModel().scale(this.printer['lm8uuInsertDiameterScale']).translate([0, this.associatedTower.getGuiderailDistance(), this.linearBearing.getLength()/2-heightCarrier/2]),
			this.linearBearing.getModel().scale(this.printer['lm8uuInsertDiameterScale']).translate([0, -this.associatedTower.getGuiderailDistance(), this.linearBearing.getLength()/2-heightCarrier/2]),
			this.leadscrewnut.getModel().rotateX(180).translate([0,0,-heightCarrier/2+3.5])
		);

		let printable = union(
			cube({size : [ thicknessCarrier, widthCarrier, heightCarrier ], center : true})
/*
			cube({ size : [spacingElectrodeLead, this.wireClamp.getClampSizeX(), this.wireClamp.getClampThickness()], center : true}).translate([-thicknessCarrier/2 - spacingElectrodeLead/2, 0, -this.wireClamp.getClampThickness()/2 + heightCarrier/2]),
			cube({ size : [spacingElectrodeLead, this.wireClamp.getClampSizeX(), this.wireClamp.getClampThickness()], center : true}).translate([-thicknessCarrier/2 - spacingElectrodeLead/2, 0,  this.wireClamp.getClampThickness()/2 - heightCarrier/2])
*/
		);

		let nutScaleRatio_Length = thicknessCarrier - ((this.toolmountScrew.k + this.toolmountScrew.l) - spacingElectrodeLead);
		let nutScaleRatio = nutScaleRatio_Length / (this.toolmountNut.getHeight());
		printable = difference(
			printable,
			union(
				cylinder({ d : this.parameters['guiderodDiameter']+2, h : heightCarrier, center : true}).translate([0, this.associatedTower.getGuiderailDistance(), 0]),
				cylinder({ d : this.parameters['guiderodDiameter']+2, h : heightCarrier, center : true}).translate([0, -this.associatedTower.getGuiderailDistance(), 0]),

				cylinder({ d : this.parameters['leadscrewDiameter']+2, h : heightCarrier, center: true}),

				this.leadscrewnut.getTemplate().scale(this.printer['lm8uuInsertDiameterScale']).rotateX(180).translate([0,0,-heightCarrier/2+3.5]),

				cylinder({ d : this.toolmountScrew.getThroughholeMedium(), h : thicknessCarrier, center : true }).rotateY(90).translate([0, this.associatedTower.getGuiderailDistance()/2, heightCarrier/2 - this.toolmountScrew.dk/2 - this.parameters['guiderodClampMinWall']]),
				cylinder({ d : this.toolmountScrew.getThroughholeMedium(), h : thicknessCarrier, center : true }).rotateY(90).translate([0, this.associatedTower.getGuiderailDistance()/2, -(heightCarrier/2 - this.toolmountScrew.dk/2 - this.parameters['guiderodClampMinWall'])]),
				cylinder({ d : this.toolmountScrew.getThroughholeMedium(), h : thicknessCarrier, center : true }).rotateY(90).translate([0, -this.associatedTower.getGuiderailDistance()/2, heightCarrier/2 - this.toolmountScrew.dk/2 - this.parameters['guiderodClampMinWall']]),
				cylinder({ d : this.toolmountScrew.getThroughholeMedium(), h : thicknessCarrier, center : true }).rotateY(90).translate([0, -this.associatedTower.getGuiderailDistance()/2, -(heightCarrier/2 - this.toolmountScrew.dk/2 - this.parameters['guiderodClampMinWall'])]),

				this.toolmountNut.getModel().scale([1,1,nutScaleRatio]).rotateY(90).translate([(thicknessCarrier-nutScaleRatio_Length)/2, 0, 0]).translate([0, this.associatedTower.getGuiderailDistance()/2, heightCarrier/2 - this.toolmountScrew.dk/2 - this.parameters['guiderodClampMinWall']]),
				this.toolmountNut.getModel().scale([1,1,nutScaleRatio]).rotateY(90).translate([(thicknessCarrier-nutScaleRatio_Length)/2, 0, 0]).translate([0, this.associatedTower.getGuiderailDistance()/2, -(heightCarrier/2 - this.toolmountScrew.dk/2 - this.parameters['guiderodClampMinWall'])]),
				this.toolmountNut.getModel().scale([1,1,nutScaleRatio]).rotateY(90).translate([(thicknessCarrier-nutScaleRatio_Length)/2, 0, 0]).translate([0, -this.associatedTower.getGuiderailDistance()/2, heightCarrier/2 - this.toolmountScrew.dk/2 - this.parameters['guiderodClampMinWall']]),
				this.toolmountNut.getModel().scale([1,1,nutScaleRatio]).rotateY(90).translate([(thicknessCarrier-nutScaleRatio_Length)/2, 0, 0]).translate([0, -this.associatedTower.getGuiderailDistance()/2, -(heightCarrier/2 - this.toolmountScrew.dk/2 - this.parameters['guiderodClampMinWall'])]),

				this.linearBearing.getModel().scale(this.printer['lm8uuInsertDiameterScale']).translate([0, this.associatedTower.getGuiderailDistance(), this.linearBearing.getLength()/2-heightCarrier/2]),
				this.linearBearing.getModel().scale(this.printer['lm8uuInsertDiameterScale']).translate([0, -this.associatedTower.getGuiderailDistance(), this.linearBearing.getLength()/2-heightCarrier/2])
			)
		);

		let printableToolCarrier = difference(
			union(
				this.wireClamp.getModel().rotateZ(90).translate([-thicknessCarrier/2-this.wireClamp.getOffsetBelowRod() - spacingElectrodeLead, 0, heightCarrier/2 - this.wireClamp.getClampThickness()]),
				this.wireClamp.getModel().rotateZ(90).translate([-thicknessCarrier/2-this.wireClamp.getOffsetBelowRod() - spacingElectrodeLead, 0, -heightCarrier/2]),
				cube({ size : [ spacingElectrodeLead, widthCarrier-2*this.linearBearing.getOutsideDiameter(), heightCarrier], center : true }).translate([-thicknessCarrier/2 - spacingElectrodeLead/2, 0, 0])
			),
			union(
				this.toolmountScrew.getTemplate().rotateY(-90).translate([-thicknessCarrier/2-spacingElectrodeLead+this.toolmountScrew.k+this.toolmountScrew.l, this.associatedTower.getGuiderailDistance()/2, heightCarrier/2 - this.toolmountScrew.dk/2 - this.parameters['guiderodClampMinWall']]),
				this.toolmountScrew.getTemplate().rotateY(-90).translate([-thicknessCarrier/2-spacingElectrodeLead+this.toolmountScrew.k+this.toolmountScrew.l, this.associatedTower.getGuiderailDistance()/2, -(heightCarrier/2 - this.toolmountScrew.dk/2 - this.parameters['guiderodClampMinWall'])]),
				this.toolmountScrew.getTemplate().rotateY(-90).translate([-thicknessCarrier/2-spacingElectrodeLead+this.toolmountScrew.k+this.toolmountScrew.l, -this.associatedTower.getGuiderailDistance()/2, heightCarrier/2 - this.toolmountScrew.dk/2 - this.parameters['guiderodClampMinWall']]),
				this.toolmountScrew.getTemplate().rotateY(-90).translate([-thicknessCarrier/2-spacingElectrodeLead+this.toolmountScrew.k+this.toolmountScrew.l, -this.associatedTower.getGuiderailDistance()/2, -(heightCarrier/2 - this.toolmountScrew.dk/2 - this.parameters['guiderodClampMinWall'])])
			)
		);
		let nonprintableToolCarrier = union(
			this.toolmountScrew.getTemplate().rotateY(-90).translate([-thicknessCarrier/2-spacingElectrodeLead+this.toolmountScrew.k+this.toolmountScrew.l, this.associatedTower.getGuiderailDistance()/2, heightCarrier/2 - this.toolmountScrew.dk/2 - this.parameters['guiderodClampMinWall']]),
			this.toolmountScrew.getTemplate().rotateY(-90).translate([-thicknessCarrier/2-spacingElectrodeLead+this.toolmountScrew.k+this.toolmountScrew.l, this.associatedTower.getGuiderailDistance()/2, -(heightCarrier/2 - this.toolmountScrew.dk/2 - this.parameters['guiderodClampMinWall'])]),
			this.toolmountScrew.getTemplate().rotateY(-90).translate([-thicknessCarrier/2-spacingElectrodeLead+this.toolmountScrew.k+this.toolmountScrew.l, -this.associatedTower.getGuiderailDistance()/2, heightCarrier/2 - this.toolmountScrew.dk/2 - this.parameters['guiderodClampMinWall']]),
			this.toolmountScrew.getTemplate().rotateY(-90).translate([-thicknessCarrier/2-spacingElectrodeLead+this.toolmountScrew.k+this.toolmountScrew.l, -this.associatedTower.getGuiderailDistance()/2, -(heightCarrier/2 - this.toolmountScrew.dk/2 - this.parameters['guiderodClampMinWall'])])
		);

		if(this.parameters['partToolholder01A'] && (!this.parameters['partToolholder01B'])) {
			if(this.parameters['onlyPrintedPart']) {
				return printableToolCarrier;
			} else {
				return printableToolCarrier;
			}
		} else if(this.parameters['partToolholder01B'] && (!this.parameters['partToolholder01A'])) {
			if(this.parameters['onlyPrintedPart']) {
				return printable;
			} else {
				return union(nonPrintable, printable);
			}
		} else {
			return union(nonPrintable, printable, printableToolCarrier);
		}
	}
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

	this.getModel = function() {
		let mountplate = difference(
			cube({ size : [this.tower.getDimensionYReal()+10, this.tower.getDimensionXReal()+10, mountplateThickness], center : true}).translate([this.tower.getDimensionYRealAsymmetry(), this.tower.getDimensionXRealAsymmetry(), -mountplateThickness/2 + mountplateOverlap]),
			tower.getModel().scale(1.01)
		);
		mountplate = difference(
			mountplate,
			this.toolmountNut.getModel().translate([0, tower.getBedMountScrewOffsetY(), this.toolmountNut.getHeight()*towerMountScrewScaleZ/2-(mountplateThickness-mountplateOverlap)])
		);
		mountplate = difference(
			mountplate,
			this.toolmountNut.getModel().translate([0, -tower.getBedMountScrewOffsetY(), this.toolmountNut.getHeight()*towerMountScrewScaleZ/2-(mountplateThickness-mountplateOverlap)])
		);

		// Cut slits to insert nuts from the side ...
		mountplate = difference(
			mountplate,
			cube({ size : [(this.tower.getDimensionYReal()+10)/2, this.toolmountNut.getRadiusInside(), this.toolmountNut.getHeight()*towerMountScrewScaleZ], center : true }).translate([(this.tower.getDimensionYReal()+10)/4+this.tower.getDimensionYRealAsymmetry(), -tower.getBedMountScrewOffsetY(), this.toolmountNut.getHeight()*towerMountScrewScaleZ/2-(mountplateThickness-mountplateOverlap)]),
			cube({ size : [(this.tower.getDimensionYReal()+10)/2, this.toolmountNut.getRadiusInside(), this.toolmountNut.getHeight()*towerMountScrewScaleZ], center : true }).translate([(this.tower.getDimensionYReal()+10)/4+this.tower.getDimensionYRealAsymmetry(),  tower.getBedMountScrewOffsetY(), this.toolmountNut.getHeight()*towerMountScrewScaleZ/2-(mountplateThickness-mountplateOverlap)])
		);

		// Add a sacrificial bridge immediatly on top of the nut
		mountplate = union(
			mountplate,
			cube({ size : [this.tower.getDimensionYReal()+10, this.tower.getDimensionXReal()+10, this.parameters['sacrificialBridgeSize']] , center : true }).translate([this.tower.getDimensionYRealAsymmetry(), this.tower.getDimensionXRealAsymmetry(),-mountscrewWallThickness + this.parameters['sacrificialBridgeSize']/2]).setColor([0,0,0])
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
}

function getParameterDefinitions() {
    return [
		{ name : 'grpTower', type : 'Group', caption : 'Tower' },
		{ name : 'zDistance', type : 'float', initial : 60, caption : 'Z travel distance' },

		{ name : 'grpTool', type : 'Group', caption : 'Tool' },
		{ name : 'toolHeight', type : 'float', initial : 50, caption : 'Tool holder height' },

		{ name : 'grpDisplay', type : 'Group', caption : 'Display' },
		{ name : 'showTower', type : 'checkbox', checked : true, caption: 'Show tower' },
		{ name : 'partToolholder01B', type : 'checkbox', checked : true, caption: 'Show sled' },
		{ name : 'partToolholder01A', type : 'checkbox', checked : true, caption: 'Show toolholder' },
		{ name : 'onlyPrintedPart', type : 'checkbox', checked : false, caption: 'Show only printed part' },

		{ name : 'renderedZPositionTool', type : 'float', initial : 50, caption: 'Displayed z position of sled' },

		{ name : 'grpPrinter', type : 'Group', caption : 'Printer' },
        { name: 'resolutionCircle', type: 'float', initial: 32, caption: 'Circle resolution', min : 32 },
		{ name: 'scale', type : 'float', initial : 1, caption : 'Scale' },
		{ name: 'correctionInsideDiameter', type : 'float', initial : 0, caption : 'Inside diameter correction' },
		{ name: 'correctionOutsideDiameter', type : 'float', initial : 0, caption : 'Outside diameter correction' }
    ];
}

function main(params) {
	let tower = new window.jscad.tspi.miniecm.tool.ztower01(params, params);
	let tool = new window.jscad.tspi.miniecm.tool.wiretool01(params, params);

	let parts = [];
	if(params['showTower']) { parts.push(tower.getModel()); }
	if(params['partToolholder01A'] || params['partToolholder01B']) { parts.push(tool.getModel().translate([0,0,params['renderedZPositionTool']])); }

	// let mountplate = new window.jscad.tspi.miniecm.tool.mountplate(params, params);
	// parts.push( mountplate.getModel().translate([0,0,-mountplate.getMountplateLowerZPosition()]) );

	return union(parts);
}
