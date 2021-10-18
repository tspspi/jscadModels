/*
	D-Sub miniature connector library

    Note: This is _NOT_ finished, this is work in progress ...
*/
if(typeof window !== 'object') { window = new Object(); }
if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.electronics !== 'object') { window.jscad.tspi.electronics = new Object(); }
if(typeof window.jscad.tspi.electronics.connectors !== 'object') { window.jscad.tspi.electronics.connectors = new Object(); }

window.jscad.tspi.electronics.connectors.M24308_4 = function(printer, params) {
    knownParameters = [
        { name: 'type',                         type:  'string',	default: -1				},
        { name: 'ispackage',                    type:  'boolean',	default : false			},
        { name: 'isMale',                       type:  'boolean',   default : false         },

        { name: 'fillHoles',                    type:  'boolean',   default : false         },
        { name: 'onlyblind',                    type:  'boolean',   default : false         },
    ];

    knownPrinterParameters = [
        { name: 'scale', 						type: 'number', 	default: 1 		},
        { name: 'correctionInsideDiameter', 	type: 'number', 	default: 0 		},
        { name: 'correctionOutsideDiameter', 	type: 'number', 	default: 0 		},
        { name: 'resolutionCircle', 			type: 'number', 	default: 360 	},
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

    this.metrics = [
        { package : "M24308/4-5Z",    connector : "M24308/4-5Z",  A : 66.55, B : 52.68, C : 60.99, D : 11.07, E : 14.99, F : 10.57, G : 5.69, H : 55.07, J : 13.31, L : 0.74, insertArrangement : 1, positions : 50, shellsize : 5 },
        { package : "M24308/4-4Z",    connector : "M24308/4-4Z",  A : 68.98, B : 55.30, C : 63.37, D : 8.23,  E : 12.17, F : 10.57, G : 5.69, H : 57.45, J : 10.46, L : 0.74, insertArrangement : 2, positions : 37, shellsize : 4 },
        { package : "M24308/4-3Z",    connector : "M24308/4-3Z",  A : 52.65, B : 38.84, C : 46.91, D : 8.23,  E : 12.17, F : 10.57, G : 5.69, H : 41.02, J : 10.46, L : 0.74, insertArrangement : 3, positions : 25, shellsize : 3 },
        { package : "M24308/4-2Z",    connector : "M24308/4-2Z",  A : 38.76, B : 25.12, C : 33.20, D : 8.23,  E : 12.17, F : 10.46, G : 5.82, H : 27.25, J : 10.46, L : 0.51, insertArrangement : 4, positions : 15, shellsize : 2 },
        { package : "M24308/4-1Z",    connector : "M24308/4-1Z",  A : 30.43, B : 16.79, C : 24.87, D : 8.23,  E : 12.17, F : 10.46, G : 5.82, H : 19.02, J : 10.46, L : 0.51, insertArrangement : 5, positions :  9, shellsize : 1 },
        { package : "M24308/4-263Z",  connector : "M24308/4-5Z",  A : 66.55, B : 52.68, C : 60.99, D : 11.07, E : 14.99, F : 10.57, G : 5.69, H : 55.07, J : 13.31, L : 0.74, insertArrangement : 1, positions : 50, shellsize : 5 },
        { package : "M24308/4-262Z",  connector : "M24308/4-4Z",  A : 68.94, B : 55.30, C : 63.37, D : 8.23,  E : 12.17, F : 10.57, G : 5.69, H : 57.45, J : 10.46, L : 0.74, insertArrangement : 2, positions : 37, shellsize : 4 },
        { package : "M24308/4-261Z",  connector : "M24308/4-3Z",  A : 52.65, B : 38.84, C : 46.91, D : 8.23,  E : 12.17, F : 10.57, G : 5.69, H : 41.02, J : 10.46, L : 0.74, insertArrangement : 3, positions : 25, shellsize : 3 },
        { package : "M24308/4-260Z",  connector : "M24308/4-2Z",  A : 38.76, B : 25.12, C : 33.20, D : 8.23,  E : 12.17, F : 10.46, G : 5.82, H : 27.25, J : 10.46, L : 0.51, insertArrangement : 4, positions : 15, shellsize : 2 },
        { package : "M24308/4-259Z",  connector : "M24308/4-1Z",  A : 30.43, B : 16.79, C : 24.87, D : 8.23,  E : 12.17, F : 10.46, G : 5.82, H : 19.02, J : 10.46, L : 0.51, insertArrangement : 5, positions :  9, shellsize : 1 },
    ];

    /*
        Search for metric that we should apply and load dimensions into local
        properties
    */
    for(i = 0; i < this.metrics.length; i++) {
        if(this.parameters['ispackage']) {
            if(this.metrics[i]['package'] == this.parameters['type']) {
                this.A = this.metrics[i]['A'];
                this.B = this.metrics[i]['B'];
                this.C = this.metrics[i]['C'];
                this.D = this.metrics[i]['D'];
                this.E = this.metrics[i]['E'];
                this.F = this.metrics[i]['F'];
                this.G = this.metrics[i]['G'];
                this.H = this.metrics[i]['H'];
                this.J = this.metrics[i]['J'];
                this.L = this.metrics[i]['L'];
                this.isConnector = false;
                this.insertArrangement = this.parameters['insertArrangement']
            }
        } else {
            if(this.metrics[i]['connector'] == this.parameters['type']) {
                this.A = this.metrics[i]['A'];
                this.B = this.metrics[i]['B'];
                this.C = this.metrics[i]['C'];
                this.D = this.metrics[i]['D'];
                this.E = this.metrics[i]['E'];
                this.F = this.metrics[i]['F'];
                this.G = this.metrics[i]['G'];
                this.H = this.metrics[i]['H'];
                this.J = this.metrics[i]['J'];
                this.L = this.metrics[i]['L'];
                this.isConnector = true;
                this.insertArrangement = this.parameters['insertArrangement']
            }
        }
    }
    this.isMale = this.parameters['isMale']

    this.getTemplate = function() {
        /* Rounding tool at the edges */
        let roundToolEdge = difference(
            cube({ size : [ (this.E-this.J)/2, this.L, (this.E-this.J)/2 ], center : true}).translate([-(this.E-this.J)/4, 0, (this.E-this.J)/4]),
            cylinder( { r : (this.E-this.J)/2, h : this.E , center : true } ).rotateX(90)
        );

        let housingPlate = difference(
            cube({ size : [ this.A, this.L, this.E ], center : true}),
            union(
                roundToolEdge.translate([-this.A/2+(this.E-this.J)/2, 0, this.J/2]),
                roundToolEdge.translate([-this.A/2+(this.E-this.J)/2, 0, this.J/2]).mirroredX(),
                roundToolEdge.translate([-this.A/2+(this.E-this.J)/2, 0, this.J/2]).mirroredZ(),
                roundToolEdge.translate([-this.A/2+(this.E-this.J)/2, 0, this.J/2]).mirroredX().mirroredZ()
            )
        );

        if(!this.parameters['fillHoles']) {
            housingPlate = difference(
                housingPlate,
                union(
                    cylinder( { d : 3.05, h : this.L, center : true } ).rotateX(90).translate([-this.C/2, 0, 0]),
                    cylinder( { d : 3.05, h : this.L, center : true } ).rotateX(90).translate([ this.C/2, 0, 0])
                )
            );
        }

        /* In case we only want a blind cover we are done ... */
        if(this.parameters['onlyblind']) { return housingPlate; }

        let tan10Deg = Math.tan(10 * Math.PI / 180);

        /* Male connector */

        let outsideShell = linear_extrude(
            { height : this.G },
            new CSG.Polygon2D(
                [
                    [ -this.H/2, -this.J/2, 0 ],
                    [ -this.H/2 + this.J*tan10Deg, this.J/2, 0 ],
                    [ this.H/2 - this.J*tan10Deg, this.J/2, 0 ],
                    [ this.H/2, -this.J/2, 0 ]
                ],
                true
            )
        );
        if(!this.parameters['fillHoles']) {
            outsideShell = difference(
                outsideShell,
                linear_extrude(
                    { height : this.G },
                    new CSG.Polygon2D(
                        [
                            [ -this.H/2+0.5, -this.J/2+0.5, 0 ],
                            [ -this.H/2 + this.J*tan10Deg + 0.5, this.J/2 - 0.5, 0 ],
                            [ this.H/2 - this.J*tan10Deg - 0.5, this.J/2 - 0.5, 0 ],
                            [ this.H/2 - 0.5, -this.J/2 + 0.5, 0 ]
                        ],
                        true
                    )
                )
            );
        };
        outsideShell = outsideShell.rotateX(90).translate([0, -this.L/2, 0]);

        /* Female connector */

        let insideShell = linear_extrude(
            { height : this.G },
            new CSG.Polygon2D(
                [
                    [ -this.B/2 - 0.5, -this.D/2 - 0.5, 0 ],
                    [ -this.B/2 - 0.5 + this.D*tan10Deg, this.D/2 + 0.5, 0 ],
                    [ this.B/2 + 0.5 - this.D*tan10Deg, this.D/2 + 0.5, 0 ],
                    [ this.B/2 + 0.5, -this.D/2 - 0.5, 0 ]
                ],
                true
            )
        );
        if(!(this.parameters['fillHoles'])) {
            insideShell = difference(
                insideShell,
                linear_extrude(
                    { height : this.G },
                    new CSG.Polygon2D(
                        [
                            [ -this.B/2, -this.D/2, 0 ],
                            [ -this.B/2 + this.D*tan10Deg, this.D/2, 0 ],
                            [ this.B/2 - this.D*tan10Deg, this.D/2, 0 ],
                            [ this.B/2, -this.D/2, 0 ]
                        ],
                        true
                    )
                )
            );
        }
        insideShell = insideShell.rotateX(90).translate([0, -this.L/2, 0]);

        /* Connector receptible, worst case */
        let connectorReceptible = linear_extrude(
            { height : 9.52 },
            new CSG.Polygon2D(
                [
                    [ -this.H/2, -this.J/2, 0 ],
                    [ -this.H/2 + this.J*tan10Deg, this.J/2, 0 ],
                    [ this.H/2 - this.J*tan10Deg, this.J/2, 0 ],
                    [ this.H/2, -this.J/2, 0 ]
                ],
                true
            )
        ).rotateX(90).translate([0, this.L/2 + 9, 0 ]);

        if(this.isMale) {
            housingPlate = union(
                housingPlate,
                outsideShell,
                connectorReceptible
            );
        } else {
            housingPlate = union(
                housingPlate,
                insideShell,
                connectorReceptible
            );
        }

        return housingPlate.setColor([0.75, 0.75, 0.75]);
    }
}

window.jscad.tspi.electronics.connectors.M24308_4_Insert = function(printer, params) {

}

function main() {
    testConnector = new window.jscad.tspi.electronics.connectors.M24308_4({}, { 'type' : 'M24308/4-2Z' })
    return testConnector.getTemplate();
}
