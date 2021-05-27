include("/mechanics/isothread.jscad")


function getParameterDefinitions() {
	return [
		{name: 'p1enable', type: 'checkbox', checked: true, caption: 'Part 1'},
		{name: 'p2enable', type: 'checkbox', checked: true, caption: 'Part 2'},
		{name: 'p3enable', type: 'checkbox', checked: true, caption: 'Part 3'},
		{name: 'p4enable', type: 'checkbox', checked: true, caption: 'Part 4'},
		{name: 'p5enable', type: 'checkbox', checked: true, caption: 'Part 5'},
		{name: 'p6enable', type: 'checkbox', checked: true, caption: 'Part 6'},

		{name: 'senable', type: 'checkbox', checked: false, caption: 'Render screws'},
	];
}

function main(params) {
	let fn = 256;
//	let fn = 32;
    let wsMountScrew = new window.jscad.tspi.iso4762Screw( {}, { m : 6, l : 13, corehole : true, throughhole : false });

	let p1 = difference(
		cube({ size : [ 30, 20, 40 ], center : true }).translate([0,-5,40/2]),
		union(
			cylinder({ d : 5, h : 25, center : true, fn : fn }).translate([0,0,25/2]),
			cylinder({d : 5, h : 10, center : true, fn : fn }).rotateX(90).translate([0, 0, 32]),
			cylinder({d : 10, h : 5, center : true, fn : fn }).rotateX(90).translate([0, -5/2+5, 32]),
			cylinder({d : 13, h : 10, center : true, fn : fn }).rotateX(90).translate([0, -10, 32]),
			cylinder({ d : 6, h : 30, center : true, fn : fn }).rotateY(90).translate([0, -9, 32 ])
		)
	);

	let len2 = 10+5+20+5+40 + 105 +5;
	let p2 = difference(
		cube({ size : [len2, 30, 10 ], center : true }).translate([-10+len2/2, 0, 10/2]),
		union(
		    cylinder({ d : 6, h : 10, center : true, fn : fn }).translate([5, 0, 10/2]),
		    cylinder({ d : 10, h : 5, center : true, fn : fn }).translate([5, 0, 5/2]),

            cube({ size : [20, 30, 2 ], center : true }).translate([0,0,10-1]),

		    cylinder({ d : 6, h : 10, center : true, fn : fn }).translate([5+65, 0, 10/2]),
		    cylinder({ d : 10, h : 5, center : true, fn : fn }).translate([5+65, 0, 5/2]),

            cube({ size : [10, 30, 2 ], center : true }).translate([5+65,0,10-1]),

		    cylinder({ d : 6, h : 10, center : true, fn : fn }).translate([5+65+105, 0, 10/2]),
		    cylinder({ d : 10, h : 5, center : true, fn : fn }).translate([5+65+105, 0, 5/2]),

            cube({ size : [10, 30, 2 ], center : true }).translate([5+65+105,0,10-1])
        )
	);

	let p3diam = 64;
	let p3_xlen = 10+20+p3diam;
	let p3_ylen = 10;
	let p3_zlen = p3diam/2-2.5;
	let p3 = difference(
        cube({ size : [p3_xlen, p3_ylen, p3_zlen], center : true }).translate([0,0,p3_zlen/2]),
        union(
            cylinder({ d : p3diam, h : 10, center : true, fn : fn }).rotateX(90).translate([0,0,p3diam/2+5]),
            cylinder({ d : 5, h : 8, center : true, fn : fn }).translate([0,0,5/2]),
			cylinder({ d : 5, h : p3_zlen, center : true, fn : fn }).translate([ p3_xlen/2-11,0,p3_zlen/2]),
			cylinder({ d : 5, h : p3_zlen, center : true, fn : fn }).translate([-p3_xlen/2+11,0,p3_zlen/2])
        )
    );
    p3 = difference(
		p3,
		difference(
			cube({ size : [100, 10, 100], center : true }),
			cylinder( { d : 80+15-12, h : 10, center : true, fn : fn }).rotateX(90)
		).translate([0,0,80/2])
	);

	let p3_2 = difference(
			cube({ size : [p3_xlen, p3_ylen, p3_zlen], center : true }).translate([0,0,p3_zlen/2]),
        union(
            cylinder({ d : p3diam, h : 10, center : true, fn : fn }).rotateX(90).translate([0,0,p3diam/2+5]),
			cylinder({ d : 6.5, h : p3_zlen, center : true, fn : fn }).translate([ p3_xlen/2-11,0,p3_zlen/2]),
			cylinder({ d : 6.5, h : p3_zlen, center : true, fn : fn }).translate([-p3_xlen/2+11,0,p3_zlen/2]),
			cylinder({ d : 12, h : p3_zlen/2, center : true, fn : fn }).translate([ p3_xlen/2-11,0,p3_zlen/4]),
			cylinder({ d : 12, h : p3_zlen/2, center : true, fn : fn }).translate([-p3_xlen/2+11,0,p3_zlen/4])
        )
	).rotateY(180).translate([0,0,p3_zlen]);

	p3_2 = difference(
		p3_2,
		difference(
			cube({ size : [100, 10, 100], center : true }),
			cylinder( { d : 80+15-12, h : 10, center : true, fn : fn }).rotateX(90)
		).translate([0,0,0])
	);

	p3_2 = difference(
		p3_2,
		difference(
			cube({ size : [100, 10, 100], center : true }),
			cylinder( { d : 80+15-12, h : 10, center : true, fn : fn }).rotateX(90)
		).translate([0,0,0])
	);

	p3_2 = difference(
		p3_2,
		difference(
			cube({ size : [100, 10, 100], center : true}),
			union(
				cylinder({ d : 80+15-28, h : 10, center : true, fn : fn}).rotateX(90),
				cube({ size : [150, 150, 26], center : true}).translate([0,0,0])
			)
		)
	);


	let p4diam = 60;
	let p4_xlen = 10+20+p4diam;
	let p4_ylen = 10;
	let p4_zlen = p4diam/2-2.5;
	let p4 = difference(
        cube({ size : [p4_xlen, p4_ylen, p4_zlen], center : true }).translate([0,0,p4_zlen/2]),
        union(
            cylinder({ d : p4diam, h : 10, center : true, fn : fn }).rotateX(90).translate([0,0,p4diam/2+5]),
            cylinder({ d : 5, h : 8, center : true, fn : fn }).translate([0,0,5/2]),
			cylinder({ d : 5, h : p4_zlen, center : true, fn : fn }).translate([ p4_xlen/2-11,0,p4_zlen/2]),
			cylinder({ d : 5, h : p4_zlen, center : true, fn : fn }).translate([-p4_xlen/2+11,0,p4_zlen/2])
        )
    );
	p4 = difference(
		p4,
		difference(
			cube({ size : [100, 10, 100], center : true }),
			cylinder( { d : 80+15-12, h : 10, center : true, fn : fn }).rotateX(90)
		).translate([0,0,80/2])
	);

	let p4_2 = difference(
			cube({ size : [p4_xlen, p4_ylen, p4_zlen], center : true }).translate([0,0,p4_zlen/2]),
        union(
            cylinder({ d : p4diam, h : 10, center : true, fn : fn }).rotateX(90).translate([0,0,p4diam/2+5]),
			cylinder({ d : 6.5, h : p4_zlen, center : true, fn : fn }).translate([ p4_xlen/2-11,0,p4_zlen/2]),
			cylinder({ d : 6.5, h : p4_zlen, center : true, fn : fn }).translate([-p4_xlen/2+11,0,p4_zlen/2]),
			cylinder({ d : 12, h : p3_zlen/2, center : true, fn : fn }).translate([ p3_xlen/2-11,0,p3_zlen/4]),
			cylinder({ d : 12, h : p3_zlen/2, center : true, fn : fn }).translate([-p3_xlen/2+11,0,p3_zlen/4])
        )
	).rotateY(180).translate([0,0,p4_zlen]);

	p4_2 = difference(
		p4_2,
		difference(
			cube({ size : [100, 10, 100], center : true }),
			cylinder( { d : 80+15-12, h : 10, center : true, fn : fn }).rotateX(90)
		).translate([0,0,0])
	);

	p4_2 = difference(
		p4_2,
		difference(
			cube({ size : [100, 10, 100], center : true}),
			union(
				cylinder({ d : 80+15-28, h : 10, center : true, fn : fn}).rotateX(90),
				cube({ size : [150, 150, 26], center : true}).translate([0,0,0])
			)
		)
	);


    let screwModels = union(
        wsMountScrew.getTemplate().rotateX(-90).translate([0, 10, 32+20]),

		wsMountScrew.getTemplate().translate([ p3_xlen/2-5,65+105,85]),
		wsMountScrew.getTemplate().translate([-p3_xlen/2+5,65+105,85]),

		wsMountScrew.getTemplate().translate([ p4_xlen/2-5,65,85]),
		wsMountScrew.getTemplate().translate([-p4_xlen/2+5,65,85]),

		wsMountScrew.getTemplate().rotateX(180).translate([0, 5+65+105, -10]),
		wsMountScrew.getTemplate().rotateX(180).translate([0, 5+65, -10]),
	    wsMountScrew.getTemplate().rotateX(180).translate([0, 5, -10])
    );

	let renderables = [];

	if(params['p1enable']) { renderables.push(p1.translate([0,0,10]).translate([0,0,10])); }
	if(params['p2enable']) { renderables.push(p2.translate([-5,0,0]).rotateZ(90)); }
	if(params['p3enable']) { renderables.push(p3.translate([0,65+105,10-2]).translate([0,0,10])); }
	if(params['p4enable']) { renderables.push(p3_2.translate([0,65+105,10-2+45]).translate([0,0,10])); }
	if(params['p5enable']) { renderables.push(p4.translate([0,65,10-2]).translate([0,0,10])); }
	if(params['p6enable']) { renderables.push(p4_2.translate([0,65,10-2+45]).translate([0,0,10])); }

	if(params['senable']) { renderables.push(screwModels); }

	return union(renderables);
}
