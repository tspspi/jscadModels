/*
	Simple filament spool holder used with M8 threaded rod and ball bearings
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

function getParameterDefinitions() {
	return [
		{ name: 'enableLeft', caption: 'Enable left side', type: 'checkbox', checked: true },
		{ name: 'enableRight', caption: 'Enable right side', type: 'checkbox', checked: true },
		{ name: 'enableAdapter', caption: 'Enable spool adapter', type: 'checkbox', checked: true },
		{ name: 'hollow', caption: 'Hollow', type: 'checkbox', checked: true },
	];
}

function quarterCylinder(radius,height) {
	return difference(
		cylinder({r : radius, h: height, center: true}),
		union(
			cube({size: [radius, 2*radius, height]}).translate([-radius, -radius, -height/2]),
			cube({size: [radius, 2*radius, height]}).translate([-radius, -radius, -height/2]).rotateZ(90)
		)
	);
}

function hole() {
	return difference(
		cube({size: [160, 21, 105-3]}).translate([-110+30, 0, 3]),
		union(
			cube({size: [74, 41, 160]}).rotateY(-90+67).translate([80,-20,0]),
		    cube({size: [74, 41, 160]}).rotateY(-90+67).translate([80,-21,0]).rotateZ(180)
		)
	)
}

function leftHolder(params) {
	return difference(
	    union(
		    cube({size: [220-40, 21, 110+3+3+11+13]}).translate([-110+20, 0, 0]),
    		cube({size: [220-40, 41, 3]}).translate([-110+20, -20, 0]),
			cylinder({d: 10, h: 10, center: true}).translate([-110+20+20, -10, 5]),
			cylinder({d: 10, h: 10, center: true}).translate([110-20-20, -10, 5])
		),
		union(
		    cube({size: [74, 41, 160]}).rotateY(-90+68).translate([110-20,-20,0]),
		    cube({size: [74, 41, 160]}).rotateY(-90+68).translate([110-20,-21,0]).rotateZ(180),
		    cylinder({r : 11+1, h: 7+1, center: true}).rotateX(90).translate([0, 0, 3+110+11]).translate([0,10.5,0]),
		    cylinder({r : 11-3, h: 41, center: true}).rotateX(90).translate([0, 0, 3+110+11]).translate([0,10.5,0]),
		    quarterCylinder(140-112, 41).rotateZ(-90).rotateX(90).translate([0, 0, 140]).translate([0,1,0]),
		    cylinder({d: 5, h: 10, center: true}).translate([-110+20+20, -10, 5]),
		    cylinder({d: 5, h: 10, center: true}).translate([110-20-20, -10, 5]),
			params['hollow'] ? hole() : cube({size: [1,1,1]}).translate([1000,1000,1000])
		)
	);
}

function rightHolder(params) {
	return difference(
	    union(
		    cube({size: [220-40, 21, 110+3+3+11+13]}).translate([-110+20, 0, 0]),
    		cube({size: [220-40, 41, 3]}).translate([-110+20, 0, 0]),
			cylinder({d: 10, h: 10, center: true}).translate([-110+20+20, 41-10, 5]),
			cylinder({d: 10, h: 10, center: true}).translate([110-20-20, 41-10, 5])
		),
		union(
		    cube({size: [74, 41, 160]}).rotateY(-90+68).translate([110-20,0,0]),
		    cube({size: [74, 41, 160]}).rotateY(-90+68).translate([110-20,-41,0]).rotateZ(180),
		    cylinder({r : 11+1, h: 7+1, center: true}).rotateX(90).translate([0, 0, 3+110+11]).translate([0,10.5,0]),
		    cylinder({r : 11-3, h: 41, center: true}).rotateX(90).translate([0, 0, 3+110+11]).translate([0,10.5,0]),
		    quarterCylinder(140-112, 41).rotateZ(-90).rotateX(90).translate([0, 0, 140]).translate([0,1,0]),
		    cylinder({d: 5, h: 10, center: true}).translate([-110+20+20, 41-10, 5]),
		    cylinder({d: 5, h: 10, center: true}).translate([110-20-20, 41-10, 5]),
			params['hollow'] ? hole() : cube({size: [1,1,1]}).translate([1000,1000,1000])
		)
	);
}

function spoolAdapter() {
	return difference(
        union(
			cylinder({d : 52, h: 10, center: true}),
			cylinder({d : 55, h: 1, center: true}).translate([0,0,-0.5-10/2])
    	),
    	cylinder({d : 9, h : 10 + 1, center: true}).translate([0,0,-0.5])
    );
}

function main(params) {
    var parts = [];

    if(params['enableRight']) {
        parts.push(rightHolder(params).translate([0,50,0]));
    }
    if(params['enableLeft']) {
        parts.push(leftHolder(params));
    }
	if(params['enableAdapter']) {
		parts.push(spoolAdapter().translate([0,-70,6]));
	}
	return union(parts);
}
