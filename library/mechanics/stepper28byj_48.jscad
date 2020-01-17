/*
    Stepper motor 28BYJ-48 (5V DC stepper)

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

        function main() {
            var stepper = new window.jscad.tspi.mechanics.stepper28BYJ_48({}, {});

            return stepper.getModel();
        }
*/

if(typeof window !== 'object') { window = new Object(); }
if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.mechanics !== 'object') { window.jscad.tspi.mechanics = new Object(); }

window.jscad.tspi.mechanics.stepper28BYJ_48 = function(printer, params) {
    knownParameters = [
        { name: 'shaft',                        type: 'boolean',    default: true    	},
		{ name : 'screwholes',					type: 'boolean',	default: true		},
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

    this.getModel = function() {
		if(this.parameters['screwholes']) {
	        return union(
	            cylinder({ r : 28.0/2+this.printer['correctionInsideDiameter']/2, h : 19, center : true, fn: this.printer['resolutionCircle'] }).translate([0,-8, -19/2 ]).setColor([0.8, 0.8, 0.8]),
	            difference(
	                union(
	                    cube({ size : [42-7+this.printer['correctionInsideDiameter'], 7+this.printer['correctionInsideDiameter'], 1], center: true }).translate([0,-8+this.printer['correctionInsideDiameter']/2,-0.5]),
	                    cylinder({ r : (7.0+this.printer['correctionInsideDiameter'])/2, h : 1 , center: true, fn: this.printer['resolutionCircle'] }).translate([-(42-7-this.printer['correctionInsideDiameter'])/2,-8+this.printer['correctionInsideDiameter']/2,-0.5]),
	                    cylinder({ r : (7.0+this.printer['correctionInsideDiameter'])/2, h : 1 , center: true, fn: this.printer['resolutionCircle'] }).translate([(42-7-this.printer['correctionInsideDiameter'])/2,-8+this.printer['correctionInsideDiameter']/2,-0.5])
	                ),
	                union(
	                    cylinder({ r : (3.5+this.printer['correctionInsideDiameter'])/2, h : 1 , center: true, fn: this.printer['resolutionCircle'] }).translate([-(42-7)/2,-8,-0.5]),
	                    cylinder({ r : (3.5+this.printer['correctionInsideDiameter'])/2, h : 1 , center: true, fn: this.printer['resolutionCircle'] }).translate([(42-7)/2,-8,-0.5])
	                )
	            ).setColor([0.8, 0.8, 0.8]),
	            cube({ size : [ 9.5+this.printer['correctionInsideDiameter'], 17+this.printer['correctionInsideDiameter'], 17.5+this.printer['correctionInsideDiameter'] ], center : true }).translate([0,-17-this.printer['correctionInsideDiameter'],-17.5/2-this.printer['correctionInsideDiameter']/2]).setColor([0,0,1]),
	            cube({ size : [ 17.5+this.printer['correctionInsideDiameter'], 17-3+this.printer['correctionInsideDiameter'], 18+this.printer['correctionInsideDiameter'] ], center : true }).translate([0,-17+3-this.printer['correctionInsideDiameter'],-18/2-this.printer['correctionInsideDiameter']/2]).setColor([0,0,1]),
	            cylinder({ r : 9.2/2+this.printer['correctionInsideDiameter'], h: 1.5+this.printer['correctionInsideDiameter'], center: true, fn: this.printer['resolutionCircle'] }).translate([0,0,1.5/2+this.printer['correctionInsideDiameter']/2]).setColor([0.8, 0.8, 0.8]),
	            difference(
	                cylinder({ r : (5+this.printer['correctionInsideDiameter'])/2, h : 10+this.printer['correctionInsideDiameter'], center : true, fn: this.printer['resolutionCircle'] }).translate([0,0,10/2+this.printer['correctionInsideDiameter']/2]).setColor([1,0,0]),
	                union(
	                    cube({size : [5, 1+this.printer['correctionInsideDiameter'], 6+this.printer['correctionInsideDiameter']]}).translate([-2.5,1.5,4]),
	                    cube({size : [5, 1+this.printer['correctionInsideDiameter'], 6+this.printer['correctionInsideDiameter']]}).translate([-2.5,-1-+this.printer['correctionInsideDiameter']-1.5,4])
	                )
	            ),
	            cube({size : [ 8, 1, 5 ], center : true}).translate([0, -0.5-24.6, -2.5]).setColor([1,0,0])
	        ).scale(this.printer['scale']);
		} else {
			return union(
	            cylinder({ r : 28.0/2+this.printer['correctionInsideDiameter']/2, h : 19, center : true, fn: this.printer['resolutionCircle'] }).translate([0,-8, -19/2 ]).setColor([0.8, 0.8, 0.8]),
                union(
                    cube({ size : [42-7+this.printer['correctionInsideDiameter'], 7+this.printer['correctionInsideDiameter'], 1], center: true }).translate([0,-8+this.printer['correctionInsideDiameter']/2,-0.5]),
                    cylinder({ r : (7.0+this.printer['correctionInsideDiameter'])/2, h : 1 , center: true, fn: this.printer['resolutionCircle'] }).translate([-(42-7-this.printer['correctionInsideDiameter'])/2,-8+this.printer['correctionInsideDiameter']/2,-0.5]),
                    cylinder({ r : (7.0+this.printer['correctionInsideDiameter'])/2, h : 1 , center: true, fn: this.printer['resolutionCircle'] }).translate([(42-7-this.printer['correctionInsideDiameter'])/2,-8+this.printer['correctionInsideDiameter']/2,-0.5])
	            ).setColor([0.8, 0.8, 0.8]),
	            cube({ size : [ 9.5+this.printer['correctionInsideDiameter'], 17+this.printer['correctionInsideDiameter'], 17.5+this.printer['correctionInsideDiameter'] ], center : true }).translate([0,-17-this.printer['correctionInsideDiameter'],-17.5/2-this.printer['correctionInsideDiameter']/2]).setColor([0,0,1]),
	            cube({ size : [ 17.5+this.printer['correctionInsideDiameter'], 17-3+this.printer['correctionInsideDiameter'], 18+this.printer['correctionInsideDiameter'] ], center : true }).translate([0,-17+3-this.printer['correctionInsideDiameter'],-18/2-this.printer['correctionInsideDiameter']/2]).setColor([0,0,1]),
	            cylinder({ r : 9.2/2+this.printer['correctionInsideDiameter'], h: 1.5+this.printer['correctionInsideDiameter'], center: true, fn: this.printer['resolutionCircle'] }).translate([0,0,1.5/2+this.printer['correctionInsideDiameter']/2]).setColor([0.8, 0.8, 0.8]),
	            difference(
	                cylinder({ r : (5+this.printer['correctionInsideDiameter'])/2, h : 10+this.printer['correctionInsideDiameter'], center : true, fn: this.printer['resolutionCircle'] }).translate([0,0,10/2+this.printer['correctionInsideDiameter']/2]).setColor([1,0,0]),
	                union(
	                    cube({size : [5, 1+this.printer['correctionInsideDiameter'], 6+this.printer['correctionInsideDiameter']]}).translate([-2.5,1.5,4]),
	                    cube({size : [5, 1+this.printer['correctionInsideDiameter'], 6+this.printer['correctionInsideDiameter']]}).translate([-2.5,-1-+this.printer['correctionInsideDiameter']-1.5,4])
	                )
	            ),
	            cube({size : [ 8, 1, 5 ], center : true}).translate([0, -0.5-24.6, -2.5]).setColor([1,0,0])
	        ).scale(this.printer['scale']);
		}
    }
}
