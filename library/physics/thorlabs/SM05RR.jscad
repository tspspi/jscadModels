/*
    Simple and really basic template for the Thorlabs
    SM05RR to allow easy design of mechanical assemblies

    (Currently no model for the threading itself, really just basic stuff)
*/

if(typeof window !== 'object') { window = new Object(); }
if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.physics !== 'object') { window.jscad.tspi.physics = new Object(); }
if(typeof window.jscad.tspi.physics.thorlabs !== 'object') { window.jscad.tspi.physics.thorlabs = new Object(); }

window.jscad.tspi.physics.thorlabs.SM05RR = function(printer, params) {
    this.getTemplate = function() {
        return difference(
            cylinder({ d : 13.589, h : 1.7, center : true }),
            union(
                cylinder({ d : 11.0, h : 1.7, center : true}),
                cube({size : [14, 0.5, 1.7/2]}).translate([7, 0.25, 1.7/4])
            )
        );
    }

    this.getHeight = function() {
        return 1.7;
    }
}


/*
function main() {
    let part = new window.jscad.tspi.physics.thorlabs.SM05RR({},{});
    return part.getTemplate();
}
*/
