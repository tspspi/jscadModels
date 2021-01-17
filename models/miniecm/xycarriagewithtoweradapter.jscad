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


	this.sledDYByScrew = (Math.max(0, this.requiredWallWidth-this.knownClamp.getClampSizeX()))/2;
//	this.sledSizeX = this.sledRealSizeX+2*this.sledDYByScrew; // (this.bearing.getOutsideDiameter() + 2*this.parameters['minWallThickness']) * 2;
//	this.sledSizeY = this.sledRealSizeY+2*this.sledDYByScrew;
	this.sledSizeX = this.sledRealSizeX;
	this.sledSizeY = this.sledRealSizeY;

	this.sledSizeZ = 2 * this.knownClamp.getClampSizeY();

	this.nutT8 = new window.jscad.tspi.miniecm.leadscrewnutT8(printer, {});

	this.getModel = function() {
		let sledDYByScrew = this.sledDYByScrew;
		let sledSizeX = this.sledSizeX;
		let sledSizeY = this.sledSizeY;
		let sledSizeZ = this.sledSizeZ;

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
		{ name : 'grpTower', type : 'Group', caption : 'Tower' },
		{ name : 'zDistance', type : 'float', initial : 60, caption : 'Z travel distance' },

		{ name : 'grpTool', type : 'Group', caption : 'Tool' },
		{ name : 'toolHeight', type : 'float', initial : 50, caption : 'Tool holder height' },

		{ name : 'grpSled', type : 'Group', caption : 'Sled' },
		{ name: 'sledSizeWallMin', type: 'float', initial: 0, caption: 'Minimum wall size' },
		{ name : 'sledBearingsLong', type : 'checkbox', checked : false, caption: 'Use long bearings' },

		{ name : 'grpPrinter', type : 'Group', caption : 'Printer' },
        { name: 'resolutionCircle', type: 'float', initial: 32, caption: 'Circle resolution', min : 32 },
		{ name: 'scale', type : 'float', initial : 1, caption : 'Scale' },
		{ name: 'correctionInsideDiameter', type : 'float', initial : 0, caption : 'Inside diameter correction' },
		{ name: 'correctionOutsideDiameter', type : 'float', initial : 0, caption : 'Outside diameter correction' }
    ];
}

function main(params) {
	params['onlyPrintedPart'] = false;
	let mountplate = new window.jscad.tspi.miniecm.tool.mountplate(params, params);

	params['sledSizeOutsideMin'] = Math.max(mountplate.getMountplateWidth(), mountplate.getMountplateLength());
	params['sledSizeInside'] = 45;

	params['onlyPrintedPart'] = true;
	let sled = new window.jscad.tspi.miniecm.sledxy(params, params);

	parts = [];
	parts.push( sled.getModel().translate([0, -sled.sledSizeY/2, 0]) );
	parts.push( cube({ size : [mountplate.mountplateSizeX, mountplate.mountplateSizeY, 1 ], center : true}).translate([mountplate.mountplateSizeX/2,0,sled.sledSizeZ - 1/2]));
	parts.push( mountplate.getModel().rotateZ(180).translate([mountplate.mountplateSizeX/2+mountplate.mountplateAsymX,mountplate.mountplateAsymY,-mountplate.getMountplateLowerZPosition()+sled.sledSizeZ]) );

//	return mountplate.getModel();

	return union(parts);
}
