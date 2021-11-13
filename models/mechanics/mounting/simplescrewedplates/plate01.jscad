include('/mechanics/isothread.jscad');

function getParameterDefinitions() {
	return [
		{ name : 'm', type: 'float', initial: 3, caption: "Screw diameter (M)" },
		{ name : 'sl', type: 'float', initial: 8, caption: "Screw length" },
		{ name : 'width' , type : 'float' , initial : 50, caption : 'Width' },
		{ name : 'height' , type : 'float' , initial : 30, caption : 'Width' },

		{ name : 'topSide' , type : 'checkbox' , checked : false, caption : 'Top side' }
/*
		{ name : 'correctionInsideDiameter', type : 'float', initial : 0, caption : 'Inside diameter correction' },
		{ name : 'correctionOutsideDiameter', type : 'float', initial : 0, caption : 'Outside diameter correction' },
		{ name : 'scale' , type : 'float' , initial : 1, caption : 'Scale' }
*/
	];
}

function main(params) {
	let m = params['m'];
	let l = params['sl'];
	let w = params['width'];
	let h = params['height'];

	let fn = 128;

	let screwTpl = new window.jscad.tspi.iso4762Screw( {}, { m : m, l : l, corehole : false, throughhole : true });
	let nutTpl = new window.jscad.tspi.isoNut( {}, { m : m });
	let nutTpl4 = new window.jscad.tspi.isoNut( {}, { m : 4 });

	/*
		Backside ...
	*/
	let bs_h = nutTpl.h + 1.5;
	let bs = cube({ size : [w, h, bs_h], center : true}).translate([0,0,bs_h/2]);
	bs = difference(
		bs,
		nutTpl.getModel().translate([ w/2 - nutTpl.ro - 2,  h/2 - nutTpl.ro - 2, 0]),
		nutTpl.getModel().translate([-w/2 + nutTpl.ro + 2,  h/2 - nutTpl.ro - 2, 0]),
		nutTpl.getModel().translate([ w/2 - nutTpl.ro - 2, -h/2 + nutTpl.ro + 2, 0]),
		nutTpl.getModel().translate([-w/2 + nutTpl.ro + 2, -h/2 + nutTpl.ro + 2, 0]),

		screwTpl.getTemplate().translate([ w/2 - nutTpl.ro - 2,  h/2 - nutTpl.ro - 2, 0]),
		screwTpl.getTemplate().translate([-w/2 + nutTpl.ro + 2,  h/2 - nutTpl.ro - 2, 0]),
		screwTpl.getTemplate().translate([ w/2 - nutTpl.ro - 2, -h/2 + nutTpl.ro + 2, 0]),
		screwTpl.getTemplate().translate([-w/2 + nutTpl.ro + 2, -h/2 + nutTpl.ro + 2, 0])
	);

	let us_h = screwTpl.k + 1.5;
	let posPlatePlaneTop = l+screwTpl.k;
	let us = cube({ size : [w, h, us_h], center : true}).translate([0,0,-us_h/2+l+screwTpl.k]);
	us = difference(
		us,

		screwTpl.getTemplate().translate([ w/2 - nutTpl.ro - 2,  h/2 - nutTpl.ro - 2, 0]),
		screwTpl.getTemplate().translate([-w/2 + nutTpl.ro + 2,  h/2 - nutTpl.ro - 2, 0]),
		screwTpl.getTemplate().translate([ w/2 - nutTpl.ro - 2, -h/2 + nutTpl.ro + 2, 0]),
		screwTpl.getTemplate().translate([-w/2 + nutTpl.ro + 2, -h/2 + nutTpl.ro + 2, 0])
	);
	us = union(
		us,

		difference(
			union(
				cylinder({ d : 15, h : 15, fn : fn, center : true}).rotateY(90).translate([0, 0, posPlatePlaneTop + 15]),
				linear_extrude( { height : 15 }, new CSG.Polygon2D([ [-h/2, 0 ], [h/2, 0], [15/2, 15], [-15/2, 15] ], true ) ).rotateX(90).rotateZ(90).translate([-15/2,0,posPlatePlaneTop])
			),
			cylinder({ d : 4.5, h : 15, fn : fn, center : true}).rotateY(90).translate([0, 0, posPlatePlaneTop + 15])
		)
	);
	us = difference(
		us,
		union(
			nutTpl4.getModel().rotateY(90).translate([15/2 - nutTpl4.h/2, 0, posPlatePlaneTop + 15]),
			cylinder({ d : 10, h : 3, fn : fn, center : true}).rotateY(90).translate([-15/2 + 3/2, 0, posPlatePlaneTop + 15])
		)
	);

	if(params['topSide']) {
		return us;
	} else {
		return bs;
	}
}
