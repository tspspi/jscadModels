/*
    Simple kinematic mount templates

    Note: Currently work in progress!

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

/*
    Basic usage:

        include('/mechanics/isothread.jscad');
        include('/optics/kinematic01.jscad');

        function main(params) {
            let mount = new window.jscad.tspi.optics.kinematicmountBasis({}, {});

            return mount.getModel();
        }
*/

if(typeof window === 'undefined') { window = new Object(); }
if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.optics !== 'object') { window.jscad.tspi.optics = new Object(); }

window.jscad.tspi.optics.kinematicmountBasis = function(printer, params) {
    knownParameters = [
        /*
            The minimum thickness is the minimum material thickness on the other
            side of the nut inserts
        */
        { name : 'minThickness',    type : 'number',                default: 1              },

        /*
            Springscrewm is the metric dimension of the screw used to fix and tension
            the screws
        */
        { name : 'springscrewm',    type : 'number',                default: 4              },
        { name : 'springscrewlen',  type : 'number',                default: 15             },

        /*
            Adjustscrewm is the metric dimension of the adjustment screws
        */
        { name : 'adjustscrewm',    type : 'number',                default: 4              },
        { name : 'adjustscrewlen',  type : 'number',                default: 15             },

        /*
            Mountscrews can be inserted from the side (standing kinematic mounts)
            or from the face backside (horizontal mounts)
        */
        { name : 'mountscrewside',  type : 'boolean',               default: true           },
        { name : 'mountscrewm',     type : 'number',                default: 4              },

        { name : 'platedistance',   type : 'number',                default: 5              },
        { name : 'platewidth',      type : 'number',                default: 50             },

        { name : 'frontplateEnable', type : 'boolean',              default : true          },
        { name : 'backplateEnable', type : 'boolean',              default : true           }
	];

	knownPrinterParameters = [
		{ name: 'scale', 						type: 'number', 	default: 1 		},
		{ name: 'correctionInsideDiameter', 	type: 'number', 	default: 0 		},
		{ name: 'correctionOutsideDiameter', 	type: 'number', 	default: 0 		},
		{ name: 'resolutionCircle', 			type: 'number', 	default: 16 	},
	];

	this.parameters = { };
	this.printer = { };
	this.rawprinter = printer;
	this.rawparams = params;
	this.error = false;

	for(let i = 0; i < knownParameters.length; i++) {
		if(typeof(params[knownParameters[i].name]) === knownParameters[i].type) {
			this.parameters[knownParameters[i].name] = params[knownParameters[i].name];
		} else if(knownParameters[i].default != -1) {
			this.parameters[knownParameters[i].name] = knownParameters[i].default;
		} else {
			this.error = true;
		}
	}
	for(let i = 0; i < knownPrinterParameters.length; i++) {
		if(typeof(printer[knownPrinterParameters[i].name]) === knownPrinterParameters[i].type) {
			this.printer[knownPrinterParameters[i].name] = printer[knownPrinterParameters[i].name];
		} else if(knownPrinterParameters[i].default != -1) {
			this.printer[knownPrinterParameters[i].name] = knownPrinterParameters[i].default;
		} else {
			this.error = true;
		}
	}

    let fn 					= this.printer['resolutionCircle'];
    this.fnSphere           = 64;

    this.springscrewnut = new window.jscad.tspi.isoNut(printer, { m : this.parameters['springscrewm'] });
    this.adjustscrewnut = new window.jscad.tspi.isoNut(printer, { m : this.parameters['springscrewm'] });
    this.mountscrewnut = new window.jscad.tspi.isoNut(printer, { m : this.parameters['springscrewm'] });

    this.thickness = Math.max(
        this.springscrewnut.h + this.parameters['minThickness'],
        this.adjustscrewnut.h + this.parameters['minThickness'],
        this.mountscrewnut.h + this.parameters['minThickness']
    );
    this.centerFrontplate = [ 0, 0, 0 ];
    this.centerBackplate = [ 0, 0, -this.thickness - this.parameters['platedistance']];
    this.platewidth = this.parameters['platewidth'];

    this.getModel = function() {
        let spacingFrontBack = this.parameters['platedistance'];
        let pw = this.parameters['platewidth'];
        let minwall = this.parameters['minThickness'];
        let frontplate = cube({ size : [ pw, pw, this.thickness ], center : true });

        frontplate = difference(
            frontplate,
            union(
                this.springscrewnut.getModel().translate( [ pw/2 - this.springscrewnut.getRadiusOutside() - minwall, 0,  -this.springscrewnut.h / 2 + this.thickness/2 ] ),
                this.springscrewnut.getModel().translate( [ 0, -(pw/2 - this.springscrewnut.getRadiusOutside() - minwall),  -this.springscrewnut.h / 2 + this.thickness/2 ] ),
                cylinder({d : this.springscrewnut.throughhole_coarse, h : this.thickness, center : true }).translate([pw/2 - this.springscrewnut.getRadiusOutside() - minwall, 0, 0]),
                cylinder({d : this.springscrewnut.throughhole_coarse, h : this.thickness, center : true }).translate([0, -(pw/2 - this.springscrewnut.getRadiusOutside() - minwall), 0])
            )
        );

        let backplate = cube({ size : [ pw, pw, this.thickness ], center : true }).translate([0,0, -this.thickness - spacingFrontBack ])

        backplate = union(
            backplate,
            intersection(
                difference(
                    sphere({ r : spacingFrontBack, fn : this.fnSphere }),
                    cube({ size : [ 2*spacingFrontBack, 2*spacingFrontBack, spacingFrontBack ], center : true }).translate([0, 0, -spacingFrontBack/2 ])
                ).translate( [ pw/2 - this.springscrewnut.getRadiusOutside() - minwall, -(pw/2 - this.springscrewnut.getRadiusOutside() - minwall),  - spacingFrontBack - this.thickness/2 ] ),
                cube({ size : [ pw, pw, spacingFrontBack ], center : true }).translate([0, 0, -spacingFrontBack/2 - this.thickness/2])
            )
        );
        backplate = difference(
            backplate,
            union(
                this.adjustscrewnut.getModel().translate( [ pw/2 - this.springscrewnut.getRadiusOutside() - minwall, pw/2 - this.adjustscrewnut.getRadiusOutside() - minwall,  this.adjustscrewnut.h/2 - this.thickness - spacingFrontBack - minwall/2  ] ),
                this.adjustscrewnut.getModel().translate( [ -(pw/2 - this.springscrewnut.getRadiusOutside() - minwall), -(pw/2 - this.adjustscrewnut.getRadiusOutside() - minwall),  this.adjustscrewnut.h/2 - this.thickness - spacingFrontBack - minwall/2 ] ),
                cylinder({d : this.adjustscrewnut.throughhole_coarse, h : this.thickness, center : true }).translate([ pw/2 - this.springscrewnut.getRadiusOutside() - minwall, pw/2 - this.adjustscrewnut.getRadiusOutside() - minwall, - this.thickness - spacingFrontBack ]),
                cylinder({d : this.adjustscrewnut.throughhole_coarse, h : this.thickness, center : true }).translate([-(pw/2 - this.springscrewnut.getRadiusOutside() - minwall), -(pw/2 - this.adjustscrewnut.getRadiusOutside() - minwall), - this.thickness - spacingFrontBack  ]),

                cylinder({d : this.springscrewnut.throughhole_coarse, h : this.thickness, center : true }).translate([pw/2 - this.springscrewnut.getRadiusOutside() - minwall, 0, - this.thickness - spacingFrontBack ]),
                cylinder({d : this.springscrewnut.throughhole_coarse, h : this.thickness, center : true }).translate([0, -(pw/2 - this.springscrewnut.getRadiusOutside() - minwall), - this.thickness - spacingFrontBack  ])
            )
        );

        let parts = [];
        if(this.parameters['frontplateEnable']) {
            parts.push(frontplate);
        };
        if(this.parameters['backplateEnable']) {
            parts.push(backplate);
        };

        return union(parts);
    }
}


window.jscad.tspi.optics.kinematicmountFoot_Simple1 = function(printer, params) {
    knownParameters = [
        /* Feet parameters ... */
        { name: 'mountscrewM',                  type: 'number',     default: 4      }
	];

	knownPrinterParameters = [
		{ name: 'scale', 						type: 'number', 	default: 1 		},
		{ name: 'correctionInsideDiameter', 	type: 'number', 	default: 0 		},
		{ name: 'correctionOutsideDiameter', 	type: 'number', 	default: 0 		},
		{ name: 'resolutionCircle', 			type: 'number', 	default: 16 	},
	];

	this.parameters = { };
	this.printer = { };
	this.rawprinter = printer;
	this.rawparams = params;
	this.error = false;

	for(let i = 0; i < knownParameters.length; i++) {
		if(typeof(params[knownParameters[i].name]) === knownParameters[i].type) {
			this.parameters[knownParameters[i].name] = params[knownParameters[i].name];
		} else if(knownParameters[i].default != -1) {
			this.parameters[knownParameters[i].name] = knownParameters[i].default;
		} else {
			this.error = true;
		}
	}
	for(let i = 0; i < knownPrinterParameters.length; i++) {
		if(typeof(printer[knownPrinterParameters[i].name]) === knownPrinterParameters[i].type) {
			this.printer[knownPrinterParameters[i].name] = printer[knownPrinterParameters[i].name];
		} else if(knownPrinterParameters[i].default != -1) {
			this.printer[knownPrinterParameters[i].name] = knownPrinterParameters[i].default;
		} else {
			this.error = true;
		}
	}
    this.basis = new window.jscad.tspi.optics.kinematicmountBasis(printer, params);
    if(this.parameters['mountscrewM'] != 0) {
        this.mountscrew = new window.jscad.tspi.iso4762Screw(printer, { m : this.parameters['mountscrewM'] });
    }

    this.getModel = function() {
        let spacing = 5;
        let thicknessParallel = 5;
        let thicknessNormal = 40;

        let foot = union(
            /* Spacer */
            cube({ size : [ spacing, this.basis.platewidth, this.basis.thickness ], center : true }).translate(this.basis.centerBackplate).translate([spacing / 2 + this.basis.platewidth/2, 0, 0 ]),
            /* Foot itself */
            cube({ size : [ thicknessParallel, this.basis.platewidth, thicknessNormal ], center : true }).translate(this.basis.centerBackplate).translate([thicknessParallel/2 + spacing + this.basis.platewidth/2, 0, thicknessNormal/2 - this.basis.thickness/2])
        );

        return foot;
    }
}

/*
    A simple kinetically mounted tube - this is for example used to mount
    fully integrated laser modules
*/
window.jscad.tspi.optics.kinematicmountTube01 = function(printer, params) {
    knownParameters = [
        /*
            Tube and through hole parameters ...
        */
        { name : 'tubeOD',          type : 'number',                default: 10             },
        { name : 'tubeID',          type : 'number',                default: 6              },
        { name : 'tubeLength',      type : 'number',                default: 15             },
        { name : 'backsideHoleID',  type : 'number',                default: 30             },

        { name : 'setscrewM',       type : 'number',                default: 3              },

        { name : 'frontplateEnable',type : 'boolean',               default : true          },
        { name : 'backplateEnable', type : 'boolean',               default : true          }
	];

	knownPrinterParameters = [
		{ name: 'scale', 						type: 'number', 	default: 1 		},
		{ name: 'correctionInsideDiameter', 	type: 'number', 	default: 0 		},
		{ name: 'correctionOutsideDiameter', 	type: 'number', 	default: 0 		},
		{ name: 'resolutionCircle', 			type: 'number', 	default: 16 	},
	];

	this.parameters = { };
	this.printer = { };
	this.rawprinter = printer;
	this.rawparams = params;
	this.error = false;

	for(let i = 0; i < knownParameters.length; i++) {
		if(typeof(params[knownParameters[i].name]) === knownParameters[i].type) {
			this.parameters[knownParameters[i].name] = params[knownParameters[i].name];
		} else if(knownParameters[i].default != -1) {
			this.parameters[knownParameters[i].name] = knownParameters[i].default;
		} else {
			this.error = true;
		}
	}
	for(let i = 0; i < knownPrinterParameters.length; i++) {
		if(typeof(printer[knownPrinterParameters[i].name]) === knownPrinterParameters[i].type) {
			this.printer[knownPrinterParameters[i].name] = printer[knownPrinterParameters[i].name];
		} else if(knownPrinterParameters[i].default != -1) {
			this.printer[knownPrinterParameters[i].name] = knownPrinterParameters[i].default;
		} else {
			this.error = true;
		}
	}

    this.basis = new window.jscad.tspi.optics.kinematicmountBasis(printer, params);
    if(this.parameters['setscrewM'] != 0) {
        this.setscrew = new window.jscad.tspi.iso4762Screw(printer, { m : this.parameters['setscrewM'] });
    }

    this.getModel = function() {
        let parts = [];


        let model = this.basis.getModel();
        if((this.parameters['backsideHoleID'] != 0) && (this.parameters['backplateEnable'])) {
            model = difference(
                model,
                cylinder({ d : this.parameters['backsideHoleID'], h : this.basis.thickness, center : true }).translate(this.basis.centerBackplate)
            );
        }
        if((this.parameters['frontplateEnable'])) {
            model = difference(
                union(
                    model,
                    cylinder({ d : this.parameters['tubeOD'], h : this.parameters['tubeLength'], center : true }).translate(this.basis.centerFrontplate).translate([0,0, this.parameters['tubeLength']/2 - this.basis.thickness/2 ])
                ),
                cylinder({ d : this.parameters['tubeID'], h : this.parameters['tubeLength'], center : true }).translate(this.basis.centerFrontplate).translate([0,0, this.parameters['tubeLength']/2 - this.basis.thickness/2 ])
            );

            if(this.parameters['setscrewM'] != 0) {
                model = difference(
                    model,
                    cylinder({ d: this.setscrew.getRadiusThreadCore(), h : 1.5 * this.parameters['tubeOD'], center : true }).rotateY(90).translate(this.basis.centerFrontplate).translate([0,0, this.parameters['tubeLength']/2])
                );
            }
        }

        parts.push(model);

        return union(parts);
    }
}
