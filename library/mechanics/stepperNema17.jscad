/*
    NEMA17 Stepper motor
    Note: Origin set set in center of axis base
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
    Usage example:

        function main(params) {
            // Example for Casun 42SHD0001_24B (NEMA17, length 32.5mm)
            // { name: 'shafttype', type: 'choice', values: [ "R", "S", "D" ], captions: [ "Round", "Single sided D", "Double sided D" ], caption: "Shaft type", initial: "S" },
            var test = new window.jscad.tspi.mechanics.stepperNEMA17({}, { length: 32.5, shafttype : "S" } );
            return test.getModel();
        }
*/

if(typeof window !== 'object') { window = new Object(); }
if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.mechanics !== 'object') { window.jscad.tspi.mechanics = new Object(); }

window.jscad.tspi.mechanics.stepperNEMA17 = function(printer, params) {
    knownParameters = [
        { name: 'shaft',                        type: 'boolean',    default: true    },
        { name: 'length',                       type: 'number',     default: -1     },
        { name: 'shaftCutRatio',                type: 'number',     default: 0.1     },
        { name: 'shafttype',                    type: 'string',     default: "R" },
    ];

    knownPrinterParameters = [
        { name: 'scale',                         type: 'number',     default: 1         },
        { name: 'correctionInsideDiameter',     type: 'number',     default: 0         },
        { name: 'correctionOutsideDiameter',     type: 'number',     default: 0         },
        { name: 'resolutionCircle',             type: 'number',     default: 32     },
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
            this.error = false;
        }
    }
    for(i = 0; i < knownPrinterParameters.length; i++) {
        if(typeof(printer[knownPrinterParameters[i].name]) === knownPrinterParameters[i].type) {
            this.printer[knownPrinterParameters[i].name] = printer[knownPrinterParameters[i].name];
        } else if(knownPrinterParameters[i].default != -1) {
            this.printer[knownPrinterParameters[i].name] = knownPrinterParameters[i].default;
        } else {
            this.error = false;
        }
    }

    this.dd = 42.3;
    this.a = 31.0;
    this.boltDiameter = 3.4; // Through hole - M3 tap hole would be 2.5mm
    this.centerCircleDiameter = 22;
    this.shaftDiameter = 5;
    this.length = this.parameters['length'];
    this.shaftLength = 24;

    this.getModel = function() {
        var mainbody = union(
            difference(
                union(
                    cube({ size : [ this.dd, this.dd, this.length ], center : true }).translate([0,0,-this.length/2]).setColor([0.8,0.8,0.8]),
                    difference(
                        cylinder( { d : 22, h: 2, center : true }).translate([0,0,1]),
                        cylinder( { d : 9, h: 2, center : true }).translate([0,0,1])
                    )
                ),
                union(
                    cube({ size : [ this.dd, this.dd, this.length ], center : true }).translate([54/2+this.dd/2,0,-this.length/2]).rotateZ(45+0*90),
                    cube({ size : [ this.dd, this.dd, this.length ], center : true }).translate([54/2+this.dd/2,0,-this.length/2]).rotateZ(45+1*90),
                    cube({ size : [ this.dd, this.dd, this.length ], center : true }).translate([54/2+this.dd/2,0,-this.length/2]).rotateZ(45+2*90),
                    cube({ size : [ this.dd, this.dd, this.length ], center : true }).translate([54/2+this.dd/2,0,-this.length/2]).rotateZ(45+3*90),

                    cylinder({ d : this.boltDiameter, h : this.length, center: true }).translate([21.9,0,-this.length/2]).rotateZ(45 + 0*90),
                    cylinder({ d : this.boltDiameter, h : this.length, center: true }).translate([21.9,0,-this.length/2]).rotateZ(45 + 1*90),
                    cylinder({ d : this.boltDiameter, h : this.length, center: true }).translate([21.9,0,-this.length/2]).rotateZ(45 + 2*90),
                    cylinder({ d : this.boltDiameter, h : this.length, center: true }).translate([21.9,0,-this.length/2]).rotateZ(45 + 3*90)
                )
            ),
            cube({ size : [ 16, 11, 12 ], center : true }).translate([0, -11/2 - this.dd/2, 12/2 - this.length]).setColor([1,1,1])
        );
        var shaft = cylinder({ d : this.shaftDiameter, h : this.shaftLength, center : true }).translate([0,0, this.shaftLength / 2]).setColor([1,0,0]);

        if(this.parameters['shafttype'] == "S") {
            shaft = difference(
                shaft,
                cube({ size : [ this.shaftDiameter, this.shaftDiameter, this.shaftLength ], center : true}).translate([0,this.shaftDiameter/2 + (0.5 - this.parameters['shaftCutRatio'])*this.shaftDiameter,this.shaftLength / 2])
            )
        } else if(this.parameters['shafttype'] == "D") {
            shaft = difference(
                shaft,
                union(
                    cube({ size : [ this.shaftDiameter, this.shaftDiameter, this.shaftLength ], center : true}).translate([0,this.shaftDiameter/2 + (0.5 - this.parameters['shaftCutRatio'])*this.shaftDiameter,this.shaftLength / 2]),
                    cube({ size : [ this.shaftDiameter, this.shaftDiameter, this.shaftLength ], center : true}).translate([0,this.shaftDiameter/2 + (0.5 - this.parameters['shaftCutRatio'])*this.shaftDiameter,this.shaftLength / 2]).rotateZ(180)
                )
            );
        }


        return union(
            mainbody,
            shaft
        ).scale(this.printer['scale']).scale((this.dd+this.printer['correctionInsideDiameter'])/this.dd);
    }
}
