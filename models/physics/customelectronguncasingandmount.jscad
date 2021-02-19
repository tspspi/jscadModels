/*
	Work in progress, most likely uninteresting to anyone else

	An cage and mounting system for tungsten cathodes / Wehnelt cylinder
  assemblies on top of simple electron optics and deflection assembly.

	The only part designed for 3D printing are the mounting frames and
	optionally the gears, optics, cathod, XYZ translation stage and
	motors are of course only templates used during 3D object generation
*/

    include('/physics/semcathodes/LEOLeicaCambridgeAEI.jscad');
		include('/physics/thorlabs/CXYZ05M.jscad');
		include('/physics/thorlabs/SM05T1.jscad');
		include('/physics/thorlabs/SM05T2.jscad');
		include('/physics/thorlabs/SM05RR.jscad');
		include('/mechanics/gears.jscad');
		include('/mechanics/stepper28byj_48.jscad');
		include('/mechanics/isothread.jscad');

    var fn = 64;

		/* Methods required for tube */
		function segmentPlateTemplate() {
			return linear_extrude({ height: 0.5 }, polygon([ [-27.0/2, 5],[-19.5/2,5],[-7/2,19.5/2],[7/2,19.5/2], [19.5/2, 5], [27.0/2, 5],
																								[27.0/2, -5], [19.5/2, -5], [7/2, -19.5/2], [-7/2,-19.5/2], [-19.5/2, -5],[-27.0/2, -5]]));
		}

		function deflectYParts() {
			return linear_extrude({ height : 0.5 }, polygon( [ [ 0, 11], [26, 16], [26, -16], [0, -11] ])).rotateY(-90).translate([0.25, 0, 0]);
		}

		function deflectXParts()  {
			return linear_extrude({ height : 0.5 }, polygon( [ [ 0, 2 ], [ 38, 3.5 ], [38, -3.5 ], [ 0, -2 ] ] )).translate([0,0,-0.25]);
		}

		function optics() {
			let ceramics = union(
				cube({size : [5,10,90], center : true}).translate([11.75, 0, 45]),
				cube({size : [5,10,90], center : true}).translate([-11.75, 0, 45])
			).setColor([0,1,0]);

			// Cathode
			let cathode = union(
				segmentPlateTemplate(),
				difference(
					cylinder({ d : 9, h : 7, center: true, fn : fn }).translate([0,0,-5.5+3.5]),
					cylinder({ d : 7.5, h : 7, center: true, fn : fn }).translate([0,0,-5.5+3.5-0.5]),
					cylinder({ d : 0.05, h : 7, center: true, fn : fn }).translate([0,0,-5.5+3.5])
				)
			);

			let plate2 = difference(
				segmentPlateTemplate(),
				cylinder( { d : 1, h : 0.5, center : true, fn : fn }).translate([0,0,0.5/2])
			);

			let l1 = difference(
				segmentPlateTemplate(),
				cylinder( { d : 16, h : 0.5, center: true, fn : fn }).translate([0,0,0.5/2])
			);

			let shieldY = union(
				difference(
					segmentPlateTemplate(),
					cylinder( { d : 1, h : 0.5, center : true, fn : fn }).translate([0,0,0.5/2])
				),
				cube({ size : [0.5, 10, 40], center:true }).translate([19/2, 0, 20+0.5]),
				cube({ size : [0.5, 10, 40], center:true }).translate([-19/2, 0, 20+0.5])
			);

			let shieldXY = difference(
				segmentPlateTemplate(),
				cube({ size : [ 2, 18, 0.5 ], center : true }).translate([0,0,0.5/2])
			);

			let deflectX = union(
				cube({ size : [0.5, 22, 8], center : true }).translate([3.25, 0, 4]),
				cube({ size : [0.5, 22, 8], center : true }).translate([-3.25, 0, 4]),
				deflectYParts().rotateY(12.5).translate([3.25, 0, 8]),
				deflectYParts().rotateY(-12.5).translate([-3.25, 0, 8])
			);

			return union(
				ceramics.rotateZ(90),

				cathode.translate([0,0,5-0.5]),
				plate2.translate([0,0,8]),
				l1.translate([0,0,14]),
				l1.translate([0,0,18]),
				l1.translate([0,0,22]),
				l1.translate([0,0,26]),

				l1.translate([0,0,29]),
				l1.translate([0,0,32]),

				shieldY.translate([0,0,34.5]),

				shieldXY.translate([0,0,78]),

				deflectX.translate([0,0,78.5]),

				union(
					deflectXParts().rotateY(-90).rotateY(6).translate([1,0,36.5]),
					deflectXParts().rotateY(-90).rotateY(-6).translate([-1,0,36.5])
				).rotateZ(90)
			);
		}

		/* New 30x30 tubeclamps */

		function opticsclamp() {
				let ch = 8;
				let clampspace = 45;

				let platePath = new CSG.Polygon2D([[-33,15.32],[-15.32,33],[15.32,33],[33,15.32],[33,-15.32],[15.32,-33],[-15.32,-33],[-33,-15.32]], true);
				let body = linear_extrude({height : ch}, platePath);

				body = difference(body, cylinder({ d : 35, h : ch, center : true, fn : fn }).translate([0,0,ch/2]));

				return union(
					body,
					body.translate([0,0,clampspace]),
					cube({ size : [10, 40, ch+clampspace], center : true }).translate([17,0,(ch+clampspace)/2]).rotateZ(90),
					cube({ size : [10, 40, ch+clampspace], center : true }).translate([17,0,(ch+clampspace)/2]).rotateZ(-90),

					cube({ size : [5, 13, ch+clampspace], center : true }).translate([20-2.5,33-6.5,(ch+clampspace)/2]),
					cube({ size : [5, 13, ch+clampspace], center : true }).translate([-20+2.5,33-6.5,(ch+clampspace)/2]).mirroredY(),

					cube({ size : [5, 13, ch+clampspace], center : true }).translate([20-2.5,-33+6.5,(ch+clampspace)/2]),
					cube({ size : [5, 13, ch+clampspace], center : true }).translate([-20+2.5,-33+6.5,(ch+clampspace)/2]).mirroredY()

					// Optional: These are connectors between optics holder an motorized cathod mount
/*					cube({ size : [5, 5, 45], center : true }).translate([20-2.5,-33+2.5,-45/2]),
					cube({ size : [5, 5, 45], center : true }).translate([-20+2.5,-33+2.5,-45/2]),
					cube({ size : [5, 5, 45], center : true }).translate([20-2.5,33-2.5,-45/2]) */
				);
		}


    function getParameterDefinitions() {
    	return [
    		{ name : 'dspNonPrintables', type : 'checkbox', caption : 'Render non printables', checked : true },
            { name : 'displayGears', type : 'checkbox', caption : 'Display all gears', checked : true },
    		{ name : 'displayOpticsClamp', type : 'checkbox', caption : 'Optics clamp', checked : true },
    		{ name : 'displayStepperMount', type : 'checkbox', caption : 'Stepper mount', checked : true },
            { name : 'setShortVariant', type : 'checkbox', caption : 'Short variant', checked : true },

    		{ name : 'grpPrinter', type : 'group', caption : 'Printer parameters' },
    		{ name : 'resolutionCircle', type : 'int', initial : 64, caption: 'Resolution circle' }
    	];
    }


    function main(params) {
        let onlyPrinted = false;
        let displayStepperMount = true;
        let displayOpticsClamp = true;
        let displayGears = true;
        let shortVariant = false;

        if(params['dspNonPrintables'])    { onlyPrinted = false;        } else { onlyPrinted = true;          }
        if(params['displayOpticsClamp'])  { displayOpticsClamp = true;  } else { displayOpticsClamp = false;  }
        if(params['displayStepperMount']) { displayStepperMount = true; } else { displayStepperMount = false; }
        if(params['displayGears'])        { displayGears = true;        } else { displayGears = false;        }
        if(params['setShortVariant'])     { shortVariant = true;        } else { shortVariant = false;        }

        if(params['resolutionCircle']) {
            fn = params['resolutionCircle'];
        }

        let cathode = new window.jscad.tspi.physics.semcathodes.LEOLeicaCambridgeAEI({}, {});

				let sm05t2 = new window.jscad.tspi.physics.thorlabs.SM05T2({}, {});
				let sm05t1 = new window.jscad.tspi.physics.thorlabs.SM05T1({}, {});
				let sm05rr = new window.jscad.tspi.physics.thorlabs.SM05RR({}, {});

				let gearwheel = new window.jscad.tspi.involuteGear({}, { 'module' : 1/3, 'teethNumber' : 30, 'thickness' : 15, 'centerholeRadius' : 1});

				let xyztable = new window.jscad.tspi.physics.thorlabs.CXYZ05M({}, {});

				let stepper = new window.jscad.tspi.mechanics.stepper28BYJ_48({ 'resolutionCircle' : fn},{});

				let nutm4 = new window.jscad.tspi.isoNut( {}, { m : 4  });
				let screwm4 = new window.jscad.tspi.iso4762Screw( {}, { m : 4, l : 12 });
                let nutm6 = new window.jscad.tspi.isoNut( {}, { m : 6  });

				let stepperMount_h = 2*gearwheel.pitchDiameter;
				let stepperMount = difference(
					cube({ size : [ 66, 66, stepperMount_h ], center : true }).translate([0, 0, -15-stepperMount_h/2]),
					union(
						cylinder({ d : 27, h : stepperMount_h, center : true, fn : fn }).translate([0,0,-15-stepperMount_h/2]),
						cube({ size : [ 17, 14, stepperMount_h / 2], center : true }).translate([-33+8.5,0, stepperMount_h/4 -15 - stepperMount_h ]),
						cube({ size : [ 17, 14, stepperMount_h / 2], center : true }).translate([-33+8.5,0, stepperMount_h/4 -15 - stepperMount_h ]).rotateZ(-90),

						cube({ size : [ 17, 14, stepperMount_h], center : true }).translate([-33+8.5,0, stepperMount_h/2 -15 - stepperMount_h ]).rotateZ(90),
						cube({ size : [ 17, 14, stepperMount_h], center : true }).translate([-33+8.5,0, stepperMount_h/2 -15 - stepperMount_h ]).rotateZ(180),

						cylinder( { d : 4.5, h : 66*2, center : true, fn : fn }).rotateX(90).translate([ 35/2, 0, -7.5-gearwheel.pitchDiameter-8]),
						cylinder( { d : 4.5, h : 66*2, center : true, fn : fn }).rotateY(90).translate([0,  35/2, -7.5-gearwheel.pitchDiameter-8]),
						cylinder( { d : 4.5, h : 66*2, center : true, fn : fn }).rotateX(90).translate([-35/2, 0, -7.5-gearwheel.pitchDiameter-8]),
						cylinder( { d : 4.5, h : 66*2, center : true, fn : fn }).rotateY(90).translate([0, -35/2, -7.5-gearwheel.pitchDiameter-8]),

                        nutm6.getModel().translate([-15, -15,-15-stepperMount_h+nutm6.getHeight()/2]),
                        nutm6.getModel().translate([ 15, -15,-15-stepperMount_h+nutm6.getHeight()/2]),
                        nutm6.getModel().translate([ 15,  15,-15-stepperMount_h+nutm6.getHeight()/2]),
                        nutm6.getModel().translate([-15,  15,-15-stepperMount_h+nutm6.getHeight()/2]),

                        nutm6.getModel().translate([-15, -15,-15-nutm6.getHeight()/2]),
                        nutm6.getModel().translate([ 15, -15,-15-nutm6.getHeight()/2]),
                        nutm6.getModel().translate([ 15,  15,-15-nutm6.getHeight()/2]),
                        nutm6.getModel().translate([-15,  15,-15-nutm6.getHeight()/2])
					)
				);
			stepperMount = difference(stepperMount, stepper.getModel().scale(1.02).rotateZ(180).rotateX(-90).translate([0,33,-7.5-gearwheel.pitchDiameter]));
			stepperMount = difference(stepperMount, stepper.getModel().scale(1.02).rotateZ(180).rotateX(-90).translate([0,33,-7.5-gearwheel.pitchDiameter]).rotateZ(90));

            if(shortVariant) {
                // Simply cut 15mm on the lower side, re-cut the nut tempaltes ...
                stepperMount = difference(
                    stepperMount,

                    union(
                        cube({ size : [ 66, 66, 15 ], center : true }).translate([0, 0, -15-stepperMount_h+15/2]),

                        nutm6.getModel().translate([-15, -15,-15-stepperMount_h+15+nutm6.getHeight()/2]),
                        nutm6.getModel().translate([ 15, -15,-15-stepperMount_h+15+nutm6.getHeight()/2]),
                        nutm6.getModel().translate([ 15,  15,-15-stepperMount_h+15+nutm6.getHeight()/2]),
                        nutm6.getModel().translate([-15,  15,-15-stepperMount_h+15+nutm6.getHeight()/2])
                    )
                )
            }

			let nutslits = union(
				cube({ size : [ 35/2, nutm4.getHeight()*1.01, nutm4.getRadiusOutside()*2*1.01 ], center : false }).rotateZ(90).translate([-33+7+nutm4.getHeight()/2, 35/2,-7.5-gearwheel.pitchDiameter-8-nutm4.getRadiusOutside()]),
				cube({ size : [ 35/2, nutm4.getHeight()*1.01, nutm4.getRadiusOutside()*2*1.01 ], center : false }).rotateZ(90).translate([-33+7+nutm4.getHeight()/2, 35/2,-7.5-gearwheel.pitchDiameter-8-nutm4.getRadiusOutside()]).mirroredY(),
				cube({ size : [ 35/2, nutm4.getHeight()*1.01, nutm4.getRadiusOutside()*2*1.01 ], center : false }).rotateZ(90).translate([-33+7+nutm4.getHeight()/2, 35/2,-7.5-gearwheel.pitchDiameter-8-nutm4.getRadiusOutside()]).rotateZ(-90),
				cube({ size : [ 35/2, nutm4.getHeight()*1.01, nutm4.getRadiusOutside()*2*1.01 ], center : false }).rotateZ(90).translate([-33+7+nutm4.getHeight()/2, 35/2,-7.5-gearwheel.pitchDiameter-8-nutm4.getRadiusOutside()]).mirroredY().rotateZ(-90)
			);
			stepperMount = difference(stepperMount, nutslits);

			let screws = union(
				screwm4.getTemplate().rotateX(-90).translate([ 35/2, 33-12, -7.5-gearwheel.pitchDiameter-8]),
				screwm4.getTemplate().rotateX(-90).translate([ -35/2, 33-12, -7.5-gearwheel.pitchDiameter-8]),
				screwm4.getTemplate().rotateX(-90).translate([ 35/2, 33-12, -7.5-gearwheel.pitchDiameter-8]).rotateZ(90),
				screwm4.getTemplate().rotateX(-90).translate([ -35/2, 33-12, -7.5-gearwheel.pitchDiameter-8]).rotateZ(90)
			).setColor([0.9,0.9,0.9]);

			let nuts = union(
				nutm4.getModel().scale(1.01).rotateZ(30).rotateX(-90).translate([ 35/2, 33-7, -7.5-gearwheel.pitchDiameter-8]),
				nutm4.getModel().scale(1.01).rotateZ(30).rotateX(-90).translate([ -35/2, 33-7, -7.5-gearwheel.pitchDiameter-8]),
				nutm4.getModel().scale(1.01).rotateZ(30).rotateX(-90).translate([ 35/2, 33-7, -7.5-gearwheel.pitchDiameter-8]).rotateZ(90),
				nutm4.getModel().scale(1.01).rotateZ(30).rotateX(-90).translate([ -35/2, 33-7, -7.5-gearwheel.pitchDiameter-8]).rotateZ(90)
			).setColor([0.95, 0.95, 0.95]);
            stepperMount = difference(stepperMount, nuts);

			let rodsassembly = union(
				cylinder( { d : 6*1.1 , h : 170, center : true, fn : fn } ).translate([-15,-15,0]),
				cylinder( { d : 6*1.1 , h : 170, center : true, fn : fn } ).translate([-15, 15,0]),
				cylinder( { d : 6*1.1 , h : 170, center : true, fn : fn } ).translate([ 15,-15,0]),
				cylinder( { d : 6*1.1 , h : 170, center : true, fn : fn } ).translate([ 15, 15,0])
			).setColor([0,1,0]);

        let printedParts = [];

        if(displayGears) {
            printedParts.push(gearwheel.getModel().rotateX(90).translate([0,42,-7.5]));
            printedParts.push(gearwheel.getModel().rotateX(90).translate([0,42,-7.5]).rotateZ(90));
            printedParts.push(
                difference(
                    gearwheel.getModel().rotateZ(6).rotateX(90).translate([0,42,-7.5-gearwheel.pitchDiameter]),
                    stepper.getModel().rotateZ(180).rotateX(-90).translate([0,33,-7.5-gearwheel.pitchDiameter])
                )
            );
            printedParts.push(
                difference(
                    gearwheel.getModel().rotateZ(6).rotateX(90).translate([0,42,-7.5-gearwheel.pitchDiameter]).rotateZ(90),
                    stepper.getModel().rotateZ(180).rotateX(-90).translate([0,33,-7.5-gearwheel.pitchDiameter]).rotateZ(90)
                )
            );
        }

        if(displayStepperMount) { printedParts.push(difference(stepperMount.setColor([0.3176,0.1922,0.2157]), rodsassembly)); }

        if(displayOpticsClamp) {
            printedParts.push(
                difference(
                    opticsclamp().translate([0,0,30]).setColor([0.3176,0.1922,0.2157]),
                    union(
                        optics().translate([0,0,sm05t2.getHeight()+sm05t1.getHeight()/2-sm05rr.getHeight()+5]),
                        rodsassembly
                    )
                )
            );
        }

        printedParts = union(printedParts);

        let templateParts = union(
            xyztable.getTemplate(),
            sm05t2.getTemplate().translate([0,0,sm05t2.getHeight()/2]).setColor([0.8,0.8,0.8]),
            sm05t1.getTemplate().translate([0,0,sm05t2.getHeight()]).setColor([0.8,0.8,0.8]),
            sm05rr.getTemplate().translate([0,0,sm05t2.getHeight()+sm05t1.getHeight()/2-sm05rr.getHeight()/2]).setColor([1,0,0]),

            cathode.getTemplate().rotateZ(180).translate([0,0,sm05t2.getHeight()+sm05t1.getHeight()/2-sm05rr.getHeight()]),

            stepper.getModel().rotateZ(180).rotateX(-90).translate([0,33,-7.5-gearwheel	.pitchDiameter]),
            stepper.getModel().rotateZ(180).rotateX(-90).translate([0,33,-7.5-gearwheel.pitchDiameter]).rotateZ(90),

            screws,
            nuts,

            rodsassembly,

            optics().translate([0,0,sm05t2.getHeight()+sm05t1.getHeight()/2-sm05rr.getHeight()+5])
        );

        let renderParts = [];
        renderParts.push(printedParts);
        if(!onlyPrinted) { renderParts.push(templateParts); }

        return union(
            renderParts
		);
    }
