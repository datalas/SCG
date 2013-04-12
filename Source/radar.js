/* 
---
description: SCGHeatchart Class.  Defines a child class for Radar charts

licence: See licence.txt

authors:
 - Darren Taylor

requires:
 - SCGChart
 - SCGFormatValue
 - SCGFormatAxis

provides: [SCGRadar]

*/

var SCGRadar = new Class({
Implements: [ Events, Options ],
Extends: SCGChart,
initialize: function( obj, options ){
	this.parent( obj, options);
	this.element = $(obj);

	this.createPaper();
	this.createColours();

	this.points = 5;

	this.drawRadar();
},
drawRadar: function(){
	var dataPoints = this.options.data.length;

	/* how many degrees ( is in each section ? ) */
	var sectorWidth = 360 / dataPoints;

	/* we also need to calculate the maximum value of all of our datapoints */

	var max = 0;
	this.options.data.each( function( child ){
		max = Math.max( Array.max( child ), max );
	}, this );

	this.max = max;

	var rad = Math.PI / 180;
	var offset = 40;

	/* from the height of our circle we need to plot some circles denoting */
	/* the scale, this would be the Y axis I guess */
	
	/* where is the center of our graph ? */
	var radius = Math.min( (this.chart.width/2), (this.chart.height/2) );

	var x = this.options.gutter.left + radius;
	var y = this.options.gutter.top + radius;

	/* Our scale is the radius, divided by the max :) */
	var scale = (radius - offset) / max;

	var axisLabels = this.paper.set();

	/* we need this.points lines, and they should be evenly spaced */
	for ( var i = 0; i <= this.points ; i++ ){
		var index = (( max / this.points ) * i * scale );
		this.paper.circle( x, y, index + offset ).attr({'stroke': '#000000', 'opacity': 0.1});
		//if ( index/scale ){
			axisLabels.push( this.paper.text( x, y - index - offset, parseInt(index/scale) ).attr({'fill': '#000000', 'opacity': 0.6, 'font-size': 12}) );
		//}
	} 
	
	/* we do need to determine how many lines we have */

	/* now we need to print out our radius */
	this.options.data.each( function( dataPoint, i ){
		var startAngle = i * sectorWidth - 90;
		var xOff = (radius + 15) * Math.cos( -startAngle * rad );
		var yOff = (radius + 15) * Math.sin( startAngle * rad);
		this.paper.circle( x + xOff, y + yOff, 8 ).attr({'stroke': '#000020', 'opacity': 0.1});
		this.paper.text( x + xOff, y + yOff, i ).attr({'opacity': 0.8});
		this.paper.path(['M',x,y,'L',x+xOff,y+yOff]).attr({'stroke': '#000000', 'opacity': 0.1});
	}, this );

	var paths = [];
	var vPaths = this.paper.set();

	this.options.data.each( function( datapoint, point ){
		Array.each( datapoint, function( line, linenumber ){
			/* if we haven't started plotting points for this line .. */
			if ( !paths[ linenumber ] ){
				paths[ linenumber ] = [];
			}
			var startAngle = (point + 1) * sectorWidth - 90;
			var localradius = (parseFloat(line) * scale) + offset;
			var lx = localradius * Math.cos( -startAngle * rad );
			var ly = localradius * Math.sin( startAngle * rad );
			paths[linenumber].push( {
				x: x + lx,
				y: y + ly
			} );
		}, this );
	}, this );

	paths.each( function( path ){
		var fullpath = [ ];
		path.each( function( part, i ){
			fullpath.push( part.x, part.y );
			if ( i == 0 ){
				fullpath.push( 'M', part.x, part.y );
			} else {
				fullpath.push( 'L', part.x, part.y );
			}
		}, this );
		fullpath.push( 'Z' );
		vPaths.push( this.paper.path( fullpath ).attr({'stroke':'#000000', 'opacity': 0.2, 'fill': '#5050ff'}) );

	}, this );

	/* blank out the center */
	this.paper.circle( x, y, offset ).attr({'stroke': '#000000', 'stroke-width': 0, 'fill': '#ffffff'});

	axisLabels.toFront();

	/* draw some labels */
	var keyX = x + radius + 50;
	var keyY = this.options.gutter.top;

	paths.each( function( path, pathNumber ){
		var label = this.paper.text( keyX, keyY, this.options.labels[ pathNumber ] ).attr({'text-anchor': 'start', 'font-size': 14});
		label.hover( function(){
			vPaths[pathNumber].attr({'opacity': 1, 'stroke-width': 2});
		}, function(){
			vPaths[pathNumber].attr({'opacity': 0.2, 'stroke-width': 1});
		} );

		keyY += ( label.getBBox().height + 5 );
	}, this );


}
});


