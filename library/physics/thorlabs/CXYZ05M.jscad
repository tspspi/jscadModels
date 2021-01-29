/*
    Simple template for the Thorlabs CXYZ05M to allow
    easy design of mechanical assemblies around this
    XYZ adjustment table
*/

if(typeof window !== 'object') { window = new Object(); }
if(typeof window.jscad !== 'object') { window.jscad = new Object(); }
if(typeof window.jscad.tspi !== 'object') { window.jscad.tspi = new Object(); }
if(typeof window.jscad.tspi.physics !== 'object') { window.jscad.tspi.physics = new Object(); }
if(typeof window.jscad.tspi.physics.thorlabs !== 'object') { window.jscad.tspi.physics.thorlabs = new Object(); }

window.jscad.tspi.physics.thorlabs.CXYZ05M = function(printer, params) {
    this.getTemplate = function() {
        let path = new CSG.Polygon2D([[-24.8, 15.0], [-15.0, 24.8], [15.0, 24.8], [24.8, 15.0], [24.8, -15.0], [15.0, -24.8], [-15.0, -24.8], [-24.8, -15.0]], true);
    	let body = linear_extrude({ height : 14.6 }, path).translate([0,0,-14.6]);

    	body = difference(
    		body,
    		union(
    			cylinder({ d : 6, h : 14.6, center : true }).translate([-15,-15,-14.6/2]),
    			cylinder({ d : 6, h : 14.6, center : true }).translate([-15, 15,-14.6/2]),
    			cylinder({ d : 6, h : 14.6, center : true }).translate([ 15,-15,-14.6/2]),
    			cylinder({ d : 6, h : 14.6, center : true }).translate([ 15, 15,-14.6/2])
    		)
    	);

    	body = union(
    		body,
    		cylinder({ d : 28, h : 25.1, center : true }).translate([0,0,-25.1/2 + 4.4])
    	);

    	body = difference(
    		body,
    		cylinder({ d : 13.589, h : 25.1, center : true }).translate([0,0,-25.1/2+4.4])
    	);

    	return body;
    }
}
