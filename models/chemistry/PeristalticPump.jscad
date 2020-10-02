/*
	Parameterizeable peristaltic pump

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

include('/mechanics/stepper28byj_48.jscad');
include('/mechanics/isothread.jscad');

function getParameterDefinitions() {
    return [
        { name : 'pipeod', title : 'Pipe outer diameter', type : 'float', default : 6 },
        { name : 'pipeid', title : 'Pipe inner diameter', type : 'float', default : 4 },
        { name : 'squeezeStretch', title : 'Additional squeeze space stretching', type : 'float', default : 1 },

        { name : 'rollerOD', title : 'Roller outer diameter', type : 'float', default : 22 },
        { name : 'rollerID', title : 'Roller inner diameter', type : 'float', default : 6 },
		{ name : 'rollerH', title : 'Roller height', type : 'float', default : 7 },
        { name : 'rollerScrewMetric', title : 'Roller screw metric (Mx)', type : 'int', default : 8 },

		{ name : 'washerThickness', title : 'Washer thickness', type : 'float', default : 1 },

		{ name : 'rotorDiameter', type : 'float', default : 50 },
		{ name : 'nBearings' , type : 'int', default : 2},
		{ name : 'nDivisions', type : 'int', default : 3 },

        { name : 'minWallThickness', type : 'float', default : 1 },

		{ name : 'cableGrooveDepth', type : 'float', default : 2 },
		{ name : 'cableGrooveWidth', type : 'float', default : 5 },

		{ name : 'cableHoleWidth', type : 'float', default : 5 },
		{ name : 'cableHoleHeight', type : 'float', default : 2 },


        { name : 'scale', type : 'float', default : 1.0 },
		{ name : 'fn', type : 'int', default : 32 },
        { name : 'correctionInsideDiameter', type : 'float', default : 0 },
        { name : 'correctionOutsideDiameter', type : 'float', default : 0 }
    ]
}

function rotor(params) {
    var pipeod = params['pipeod'];
    var pipeid = params['pipeid'];
    var rollerod = params['rollerOD'];
    var rollerid = params['rollerID'];
	var rollerheight = params['rollerH'];
    var rollerScrewMetric = params['rollerScrewMetric'];
    var squeezeStretch = params['squeezeStretch'];
    var rotorDiameter = params['rotorDiameter'];
    var minWallThickness = params['minWallThickness'];
	var ndivisions = params['nDivisions'];
	var nbearingsstacked = params['nBearings'];
	var washerThickness = params['washerThickness'];
	var rotorHeight = 2 * minWallThickness + rollerheight * nbearingsstacked + 2*washerThickness + params['correctionInsideDiameter'];
	var fnSteps = params['fn'];

    if(pipeod <= pipeid) { alert("Pipe outer or inner diameter invalid. Using defaults (6/4)"); pipeod = 6; pipeid = 4; }
    if(rollerod <= rollerid) { alert("Roller inner or outer diameter invalid. Using defaults (22/8)"); rollerod = 22; rollerid = 8; }

    var diameterPipe = (pipeod - pipeid) / 2.0;
    var minPipeThickness = (2*diameterPipe);
    var minSpacingAndInset = minPipeThickness/2.0;
    var rollerExpose = (pipeod - minSpacingAndInset) * squeezeStretch;
    var rollerOffset = rotorDiameter/2 - (rollerod/2 - rollerExpose);

    if((rollerod/2 - rollerExpose - rollerid/2) < minWallThickness) { alert("Warning: Cannot guarantee minimum wall thickness"); }
    if((rollerod/2 - rollerExpose - rollerid/2) < 0) { alert("Cannot realize design"); return; }

	var printer = params;

	/*
		Generate array of ball bearings
	*/
	var ballbearings = [];
	var bearingCutTool = [];
	for(var anglestep = 0; anglestep < ndivisions; anglestep++) {
		for(var bearingstep = 0; bearingstep < nbearingsstacked; bearingstep++) {
			ballbearings.push(
				difference(
					cylinder({d : rollerod + params['correctionInsideDiameter'], h : rollerheight, center : true, fn : fnSteps}),
					cylinder({d : rollerid - params['correctionInsideDiameter'], h : rollerheight, center : true, fn : fnSteps})
				).translate([rollerOffset,0,rollerheight/2 + rollerheight * bearingstep - (nbearingsstacked * rollerheight)/2]).rotateZ(360 / ndivisions * anglestep).setColor([1,0,0])
			);
		}
		bearingCutTool.push(
			union(
				cube({ size : [ rollerod + params['correctionInsideDiameter'], rollerod + params['correctionInsideDiameter'], rollerheight * nbearingsstacked + 2 * washerThickness + params['correctionInsideDiameter'] ], center : true }).translate([rollerOffset + rollerod/2,0,0]).rotateZ(360 / ndivisions * anglestep),
				cylinder({ d : rollerod + params['correctionInsideDiameter'], h : rollerheight * nbearingsstacked + 2 * washerThickness + params['correctionInsideDiameter'], center : true, fn : fnSteps }).translate([rollerOffset,0,0]).rotateZ(360 / ndivisions * anglestep)
			)
		);
	}

	/*
		Generate roller
	*/
    var nutTpl = new window.jscad.tspi.isoNut(params, { m : rollerScrewMetric });

	var roller = difference(
		cylinder({ h : nutTpl.getHeight() + 2 * minWallThickness + rollerheight * nbearingsstacked + 2*washerThickness + params['correctionInsideDiameter'], d : rotorDiameter, center : true, fn : fnSteps }).translate([0,0,-nutTpl.getHeight()/2]),
		union(bearingCutTool)
	);

    var nutcut = [];
    var screwcut = [];
    for(var anglestep = 0; anglestep < ndivisions; anglestep++) {
        nutcut.push(nutTpl.getModel().translate([rollerOffset,0,-nutTpl.getHeight()/2 - (rollerheight * nbearingsstacked)/2 - washerThickness - minWallThickness - params['correctionInsideDiameter']/2]).rotateZ(360 / ndivisions * anglestep).setColor([0,0,1]));
        nutcut.push(cylinder({ r : nutTpl.getRadiusThreadCore()/2, h : nutTpl.getHeight(), center : true, fn : fnSteps }).translate([rollerOffset,0,-nutTpl.getHeight()/2 - (rollerheight * nbearingsstacked)/2 - washerThickness - minWallThickness - params['correctionInsideDiameter']/2]).rotateZ(360 / ndivisions * anglestep).setColor([0,0,1]));
        screwcut.push(cylinder({d : nutTpl.getThroughholeCoarse(), h : nutTpl.getHeight() + 2*minWallThickness + rollerheight * nbearingsstacked + 2*washerThickness + params['correctionInsideDiameter'], fn : fnSteps}).translate([rollerOffset,0,-nutTpl.getHeight()/2 - (rollerheight * nbearingsstacked)/2 - washerThickness - minWallThickness - params['correctionInsideDiameter']/2]).rotateZ(360 / ndivisions * anglestep).setColor([0,0,1]));
    }
    roller = difference(
        roller,
        union(nutcut)
    );
    roller = difference(
        roller,
        union(screwcut)
    );

    // DEBUG
    roller = union(
        roller,
        union(ballbearings)
    );

	var stepper = new window.jscad.tspi.mechanics.stepper28BYJ_48(printer, {});

	var roller = difference(
	    roller.translate([0,0,nutTpl.getHeight()]),
	    stepper.getModel().translate([0,0,-rotorHeight/2-1.5]).scale(1.01)
    );

    return roller;
}

function stator01(params) {
    var pipeod = params['pipeod'];
    var pipeid = params['pipeid'];
    var rollerod = params['rollerOD'];
    var rollerid = params['rollerID'];
	var rollerheight = params['rollerH'];
    var rollerScrewMetric = params['rollerScrewMetric'];
    var squeezeStretch = params['squeezeStretch'];
    var rotorDiameter = params['rotorDiameter'];
    var minWallThickness = params['minWallThickness'];
	var ndivisions = params['nDivisions'];
	var nbearingsstacked = params['nBearings'];
	var washerThickness = params['washerThickness'];
	var rotorHeight = 2 * minWallThickness + rollerheight * nbearingsstacked + 2*washerThickness + params['correctionInsideDiameter'];
	var fnSteps = params['fn'];

    if(pipeod <= pipeid) { alert("Pipe outer or inner diameter invalid. Using defaults (6/4)"); pipeod = 6; pipeid = 4; }
    if(rollerod <= rollerid) { alert("Roller inner or outer diameter invalid. Using defaults (22/8)"); rollerod = 22; rollerid = 8; }

    var diameterPipe = (pipeod - pipeid) / 2.0;
    var pipeFlatWidth = pipeod * 3.15 / 2.0;
    var minPipeThickness = (2*diameterPipe);
    var minSpacingAndInset = minPipeThickness/2.0;
    var rollerExpose = (pipeod - minSpacingAndInset) * squeezeStretch;
    var rollerOffset = rotorDiameter/2 - (rollerod/2 - rollerExpose);
	var mainBlockSizeA = rotorDiameter + 2 * minWallThickness + 2*rollerExpose + 4*minSpacingAndInset;
	var mainBlockSizeB = rotorDiameter + 2 * minWallThickness + 2*rollerExpose + 4*minSpacingAndInset;

    if((rollerod/2 - rollerExpose - rollerid/2) < minWallThickness) { alert("Warning: Cannot guarantee minimum wall thickness"); }
    if((rollerod/2 - rollerExpose - rollerid/2) < 0) { alert("Cannot realize design"); return; }

    var nutTpl = new window.jscad.tspi.isoNut(params, { m : rollerScrewMetric });
    var rotorHeightReal = nutTpl.getHeight() + 2 * minWallThickness + rollerheight * nbearingsstacked + 2*washerThickness + params['correctionInsideDiameter'];



    var basisBlock = cube({ size : [ mainBlockSizeA, mainBlockSizeB, rotorHeightReal + nutTpl.getHeight()/2], center : true }).translate([0,0,-nutTpl.getHeight()/2]);
    basisBlock = difference(
        basisBlock,
        cylinder({ d : rotorDiameter + params['correctionInsideDiameter'] + 2*rollerExpose + 2*minSpacingAndInset, h : rotorHeightReal + nutTpl.getHeight() + 0.5, center : true, fn : fnSteps }).translate([0,0,-0.5]) // Constant: 0.5 is spacing between rotor and stator at bottom ...
    );
	var pipeFlatDiameter = rotorDiameter + params['correctionInsideDiameter'] + 2*rollerExpose + 4*minSpacingAndInset;
    basisBlock = difference(
        basisBlock,
        cylinder({ d : pipeFlatDiameter, h : pipeFlatWidth, center : true, fn : fnSteps})
    );

	// Feed holes for pipe
	var pipeCut = cylinder({ d : pipeod + params['correctionInsideDiameter'], h : mainBlockSizeA/2, center : true}).rotateY(90);
	basisBlock = difference(
		basisBlock,
		pipeCut.translate([mainBlockSizeA/4, pipeFlatDiameter/2 - (pipeod+params['correctionInsideDiameter'])/2, 0])
	);
	basisBlock = difference(
		basisBlock,
		pipeCut.translate([mainBlockSizeA/4, -1 * (pipeFlatDiameter/2 - (pipeod+params['correctionInsideDiameter'])/2), 0])
	);

    // Rendering a cut model to illustrate goove layout:
	/*
        basisBlock = difference(
            basisBlock.translate([0,0,0]),
            cube({ size : [ 100, 100, 100 ]}).translate([0,0,-50])
        );
	*/
    basisBlock = basisBlock.translate([0,0,nutTpl.getHeight()]);

    var stepper = new window.jscad.tspi.mechanics.stepper28BYJ_48(params, {});
    basisBlock = difference(
        basisBlock,
        stepper.getModel().translate([0,0,-rotorHeight/2-1.5]).scale(1.01)
    );

    return basisBlock;
}

function stator02(params) {
	var pipeod = params['pipeod'];
    var pipeid = params['pipeid'];
	var rotorDiameter = params['rotorDiameter'];
	var minWallThickness = params['minWallThickness'];
	var squeezeStretch = params['squeezeStretch'];
	var nbearingsstacked = params['nBearings'];
	var washerThickness = params['washerThickness'];
	var rollerheight = params['rollerH'];
	var rollerScrewMetric = params['rollerScrewMetric'];
	var cableGrooveDepth = params['cableGrooveDepth'];
	var cableGrooveWidth = params['cableGrooveWidth'];

	var diameterPipe = (pipeod - pipeid) / 2.0;
	var minPipeThickness = (2*diameterPipe);
	var minSpacingAndInset = minPipeThickness/2.0;
	var rollerExpose = (pipeod - minSpacingAndInset) * squeezeStretch;
	var rotorHeight = 2 * minWallThickness + rollerheight * nbearingsstacked + 2*washerThickness + params['correctionInsideDiameter'];

	var mainBlockSizeA = rotorDiameter + 2 * minWallThickness + 2*rollerExpose + 4*minSpacingAndInset;
	var mainBlockSizeB = rotorDiameter + 2 * minWallThickness + 2*rollerExpose + 4*minSpacingAndInset;

	var nutTpl = new window.jscad.tspi.isoNut(params, { m : rollerScrewMetric });
    var rotorHeightReal = nutTpl.getHeight() + 2 * minWallThickness + rollerheight * nbearingsstacked + 2*washerThickness + params['correctionInsideDiameter'];

	var stepper = new window.jscad.tspi.mechanics.stepper28BYJ_48(params, {});
	var stepperHeight = 19;

	var cHeight = (19 + minWallThickness)*1.01;
	var block = cube({size : [ mainBlockSizeA, mainBlockSizeB, cHeight+cableGrooveDepth+2], center : true}).translate([0, 0, (-1*(rotorHeightReal + nutTpl.getHeight()/2)/2 + nutTpl.getHeight()/2) - cHeight/2.0 - cableGrooveDepth]);
	block = difference(block, stepper.getModel().translate([0,0,-rotorHeight/2-1.5]).scale(1.01));

	// Electronics pocket
	block = difference(block, cube({ size : [ mainBlockSizeA - 2 * minWallThickness, mainBlockSizeB/2 - 2 * minWallThickness, cHeight - minWallThickness], center : true }).translate([0, mainBlockSizeB/4 - minWallThickness, (-1*(rotorHeightReal + nutTpl.getHeight()/2)/2 + nutTpl.getHeight()/2) - cHeight/2.0 + minWallThickness]));

	// Cable groove
	var grooveLength = mainBlockSizeA - 2 * minWallThickness;
	var grooveWidth = cableGrooveWidth;
	block = difference(block, cube({ size : [grooveWidth, grooveLength, cableGrooveDepth+5], center : false }).translate([-grooveWidth/2, -grooveLength/2, (-1*(rotorHeightReal + nutTpl.getHeight()/2)/2 + nutTpl.getHeight()/2) - cHeight - cableGrooveDepth/4]));

	// Cable hole
	var holeLength = params['cableHoleWidth'];
	var holeHeight = params['cableHoleHeight'];
	block = difference(block, cube(( { size : [holeLength, 2*minWallThickness, holeHeight]})).translate([-holeLength/2, mainBlockSizeB/2 - 2*minWallThickness, (-1*(rotorHeightReal + nutTpl.getHeight()/2)/2 + nutTpl.getHeight()/2) - cHeight - cableGrooveDepth/4]).setColor([0,1,0]));

	return block;
}


function main(params) {
	return stator02(params);
	/* union(
        stator01(params),
        rotor(params)
    ); */
}
