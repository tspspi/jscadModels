/*
	Simple race track to floor level adapter
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

function vshape(thickness, length, width) {
	var cutLength = Math.sqrt((width/2)*(width/2) + length*length);
	var cutAngle = 90-Math.atan2(length, width/2) * 180 / Math.PI;
	var curAddLen = Math.tan(cutAngle * Math.PI/180)*width;
	return difference(
		cube({size: [width, length, thickness]}),
		union(
			cube({size: [width, cutLength, thickness]}).rotateZ(-cutAngle).translate([width/2, 0, 0]),
			cube({size: [width, cutLength, thickness]}).rotateZ(-cutAngle).translate([-width/2, 0, 0]).mirroredX()
		)
	);
}

function vshapeCut(thickness, length, virtlength, width) {
	var cutLength = Math.sqrt((width/2)*(width/2) + virtlength*virtlength);
	var cutAngle = 90-Math.atan2(virtlength, width/2) * 180 / Math.PI;
	var curAddLen = Math.tan(cutAngle * Math.PI/180)*width;
	var part = difference(
		cube({size: [width, virtlength, thickness]}),
		union(
			cube({size: [width, cutLength, thickness]}).rotateZ(-cutAngle).translate([width/2, 0, 0]),
			cube({size: [width, cutLength, thickness]}).rotateZ(-cutAngle).translate([-width/2, 0, 0]).mirroredX()
		)
	)
	
	if(virtlength > length) {
	    return difference(
	        part,
	        cube({size: [width, virtlength-length, width]})
        ).translate([0, -(virtlength-length), 0]);
        return part;
	} else {
	    return part;
	}
}

function getParameterDefinitions() {
    return [
        { name : 'vWidth', type : 'float', initial: 18.0, caption: "V Width"},
        { name : 'vClearance', type : 'float', initial: 0.1, caption: "V Clearance"},
        { name : 'vLength', type : 'float', initial: 13.6, caption: "V Length"},
        { name : 'vFlatLength', type : 'float', initial: 4.8, caption: "V flat length"},
        { name : 'vOffset', type : 'float', initial: 14.8, caption: "V offset"},
        { name : 'vIndent', type: 'float', initial: 0.8, caption: "V indention"},

        { name : 'thickness', type : 'float', initial: 5, caption: "Thickness"},
        { name : 'width', type : 'float', initial: 51, caption: "Width"},
        { name : 'length', type : 'float', initial: 100, caption: "Length"}
    ];
}

function carsAdapter(params) {
    /* Parameters */
    var vWidth = params.vWidth;
    var vWidth_Clearance = params.vClearance;
    var vLength = params.vLength;
    var vLengthClearance = params.vClearance;
    var vFlatLength = params.vFlatLength;

    var vOffset = params.vOffset;
    
    var thickness = params.thickness;

    var width = params.width;
    var length = params['length'];

    var indent = params.vIndent;


    /* === End of parameters === */
    var thickLength = length -(vLength + vLengthClearance);
    var cutAngle = Math.atan2(thickness, length) * 180 / Math.PI;
    var virtlenVFlat = vFlatLength * width / (2 * indent);

    return union(
        vshape(thickness, vLength, vWidth-vWidth_Clearance).translate([-vWidth/2-width/2+vOffset, -vLength-vFlatLength, 0]),
        // cube({size: [vWidth, vFlatLength, thickness]}).translate([-vWidth/2-width/2+vOffset, -vFlatLength, 0]),
        vshapeCut(thickness, vFlatLength, virtlenVFlat, vWidth-vWidth_Clearance).mirroredY().translate([-vWidth/2-width/2+vOffset, 0, 0]),

        difference(
            cube({size: [width, length+vFlatLength+vLength, thickness]}).translate([-width/2,0,0]),
            union(
                union(
                    vshape(thickness, vLength, vWidth).translate([-vWidth/2-width/2+vOffset, -vLength-vFlatLength, 0]),
                    // cube({size: [vWidth, vFlatLength, thickness]}).translate([-vWidth/2-width/2+vOffset, -vFlatLength, 0])
                    vshapeCut(thickness, vFlatLength, virtlenVFlat, vWidth).mirroredY().translate([-vWidth/2-width/2+vOffset, 0, 0])
                ).mirroredX().mirroredY(),
                cube({size: [width, length*10, 10*thickness]}).rotateX(-cutAngle).translate([-width/2.0, vFlatLength+vLength, thickness])
            )
        )
    );
    
}

function main(params) {
    return carsAdapter(params);
}
