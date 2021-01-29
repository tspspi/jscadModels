/*
    Just a model of a typical LEO/Leica/Cambridge/AEI
    tungsten SEM cathode - not manufacturable from this
    design, this file is only thought to be used as a
    template.

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
    Usage sample:

    include('/physics/semcathodes/LEOLeicaCambridgeAEI.jscad');

    function main() {
        let cathode = new window.jscad.tspi.physics.semcathodes.LEOLeicaCambridgeAEI({}, {});
        return cathode.getTemplate();
    }
*/

if(typeof window !== 'object') { window = new Object(); }
if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.physics !== 'object') { window.jscad.tspi.physics = new Object(); }
if(typeof window.jscad.tspi.physics.semcathodes !== 'object') { window.jscad.tspi.physics.semcathodes = new Object(); }

window.jscad.tspi.physics.semcathodes.LEOLeicaCambridgeAEI = function(printer, params) {
    knownParameters = [
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

	this.getTemplate = function() {
		let baseDiameter = 12.2 + this.printer['correctionInsideDiameter'];
		let baseThickness = 1.8 + this.printer['correctionInsideDiameter'];

		let mountpostDia = 1;
		let mountpostHeight = 10.2;
		let mountpostTopHeight = 3.5;

		let mountpostSpacing = 5 + mountpostDia;
		let tungstenKeepoutWidth = 8.5;
		let tungstenWeldHeight = 3;
		let tungstenTipHeight = 4;
		let tungstenDiameter = 0.05;

		let base = cylinder({ d : baseDiameter, h : baseThickness, center : true, fn : this.printer['resolutionCircle'] }).translate([0,0,-baseThickness/2]);

		let post = cylinder({ d : mountpostDia, h : mountpostHeight, center : true, fn : this.printer['resolutionCircle'] }).translate([0,0,-mountpostHeight/2 + mountpostTopHeight]);

		let tungstenkeepout = union(
			cylinder({ d :  tungstenDiameter, h : tungstenKeepoutWidth, center : true, fn : this.printer['resolutionCircle'] }).rotateY(90).translate([0,0,tungstenWeldHeight+tungstenDiameter/2]),
			cylinder( { d : tungstenDiameter, h : tungstenTipHeight, center : true, fn : this.printer['resolutionCircle'] }).translate([0,0,(tungstenTipHeight/2)+tungstenWeldHeight])
		).setColor([0,0,0]);

		return union(
			base.setColor([1,1,1]),
			post.translate([mountpostSpacing/2, 0, 0]).setColor([0.8,0.8,0.8]),
			post.translate([-mountpostSpacing/2, 0, 0]).setColor([0.8,0.8,0.8]),
			tungstenkeepout
		);
	}
}
