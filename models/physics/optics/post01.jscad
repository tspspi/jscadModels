include('/mechanics/isothread.jscad');
include('/optics/post01.jscad');

function getParameterDefinitions() {
	return [
		{ name : 'grpPost', type : 'group', caption : 'Post' },

		{ name : 'h', type : 'float', initial : 110, caption : "Post height" },
		{ name : 'postid', type : 'float', initial : 12, caption : "Post inner diameter" },
		{ name : 'postwalld', type : 'float', initial : 5, caption : "Post wall thickness" },
		{ name : 'postwalld2', type : 'float', initial : 3, caption : "Base taper thickness" },
		{ name : 'posth2', type : 'float', initial : 20, caption : "Base taper height" },

		{ name : 'grpBase', type : 'group', caption : 'Base' },

		{ name : 'basem', type : 'float', initial : 4, caption : "Metric screw (table mount)" },
		{ name : 'basew', type : 'float', initial : 56, caption: "Base width" },
		{ name : 'basel', type : 'float', initial : 60, caption: "Base length" },
		{ name : 'baseh', type : 'float', initial : 8, caption: "Base thickness" },

		{ name : 'grpGrubScrew', type : 'group', caption : 'Grub screw' },

		{ name : 'grubm', type : 'float', initial : 4, caption : "Metric screw (grub screw)" },
		{ name : 'grubh', type : 'float', initial : 94, caption : "Grub screw position" },
		{ name : 'grublen', type : 'float', initial : 25, caption : "Grub screw length" },

		{ name : 'grpPrinter', type : 'group', caption : 'Printer' },
		{ name : 'resolutionCircle', type : 'float', initial : 128, caption : "Circle resolution" }
	];
}

function main(params) {
	let post = new window.jscad.tspi.optics.post01(params, params);

	return post.getModel();
}
