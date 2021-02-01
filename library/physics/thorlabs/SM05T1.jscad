/*
    Simple and really basic template for the Thorlabs
    SM05T1 to allow easy design of mechanical assemblies

    (Currently no model for the threading itself, really just basic stuff)
*/

if(typeof window !== 'object') { window = new Object(); }
if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.physics !== 'object') { window.jscad.tspi.physics = new Object(); }
if(typeof window.jscad.tspi.physics.thorlabs !== 'object') { window.jscad.tspi.physics.thorlabs = new Object(); }

window.jscad.tspi.physics.thorlabs.SM05T1 = function(printer, params) {
    this.getTemplate = function() {
        return difference(
            cylinder({ d : 17.8, h : 7.1, center : true }),
            cylinder({ d : 13.589, h : 7.1, center : true})
        );
    }

    this.getHeight = function() {
        return 7.1;
    }
}

/*
function main() {
    let part = new window.jscad.tspi.physics.thorlabs.SM05T1({},{});
    return part.getTemplate();
}
*/
