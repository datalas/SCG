/* 
 * Copyright (C) 2012 Darren Taylor  http://datalas.com  
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.  
 */

var SCGHeatRadar = new Class({
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
	var dataPoints = this.options.data[0].length;

	/* how many degrees ( is in each section ? ) */
	var sectorWidth = 360 / dataPoints;

	/* we also need to calculate the maximum value of all of our datapoints */

	var max = 0;
	this.options.data.each( function( child ){
		max = Math.max( Array.max( child ), max );
	}, this );

	this.max = max;

	var rad = Math.PI / 180;
	var pointWidth = 30;

	/* from the height of our circle we need to plot some circles denoting */
	/* the scale, this would be the Y axis I guess */
	
	/* where is the center of our graph ? */
	var radius = Math.min( (this.chart.width/2), (this.chart.height/2) );

	var offset = radius - ( pointWidth * this.options.data.length );

	var x = this.options.gutter.left + radius;
	var y = this.options.gutter.top + radius;

	/* Our scale is the radius, divided by the max :) */
	var scale = (radius - offset) / max;

	var axisLabels = this.paper.set();
	var lines = this.paper.set();

	/* now we need to print out our radius */
	(this.options.data[0]).each( function( dataPoint, i ){
		var startAngle = i * sectorWidth - 90;
		var xOff = (radius) * Math.cos( -startAngle * rad );
		var yOff = (radius) * Math.sin( startAngle * rad);
		lines.push( this.paper.path(['M',x,y,'L',x+xOff,y+yOff]).attr({'stroke': '#000000', 'opacity': 0.1}) );
	}, this );

	/* now we need to print out our radius */
	this.options.data.each( function( dataset, datasetnumber ){
		Array.each( dataset, function( dataPoint, i ){
			var startAngle = i * sectorWidth - 90;
			var xOff = ((datasetnumber) * pointWidth + offset + 15) * Math.cos( -startAngle * rad );
			var yOff = ((datasetnumber) * pointWidth + offset + 15) * Math.sin( startAngle * rad);
			if ( i > 0 ){
				this.paper.circle( x + xOff, y + yOff, 8 ).attr({'stroke': '#000020', 'opacity': 0.1});
				this.paper.text( x + xOff, y + yOff, i ).attr({'opacity': 0.8});
			}
			this.paper.path(['M',x,y,'L',x+xOff,y+yOff]).attr({'stroke': '#000000', 'opacity': 0.1});
		}, this );
	}, this );


	var ranges = [];

	/* now the points themselves */
	this.options.data.each( function( dataset, datasetnumber ){
		ranges[ datasetnumber ] = this.paper.set();
		Array.each( dataset, function( point, pointnumber ){
			/* we need four points (there are four lights!) */
			var startAngle = pointnumber * sectorWidth - 90;
			var endAngle = ( pointnumber + 1 ) * sectorWidth - 90;

			var innerRadius = ( datasetnumber )  * pointWidth + offset;
			var outerRadius = innerRadius + pointWidth

			var x0 = x + innerRadius * Math.cos( -startAngle * rad );
			var y0 = y + innerRadius * Math.sin( startAngle * rad );

			var x1 = x + innerRadius * Math.cos( -endAngle * rad );
			var y1 = y + innerRadius * Math.sin( endAngle * rad );

			var x2 = x + outerRadius * Math.cos( -startAngle * rad );
			var y2 = y + outerRadius * Math.sin( startAngle * rad );

			var x3 = x + outerRadius * Math.cos( -endAngle * rad );
			var y3 = y + outerRadius * Math.sin( endAngle * rad );
	
			var colour = this.getColour( point );

			/* draw the section */
			this.paper.path([
				"M", x0, y0, 
				"L", x2, y2, 
				"A", outerRadius, outerRadius, 1, +(endAngle - startAngle > 180), 1, x3, y3, 
				"L", x1, y1, 
				"A", outerRadius, outerRadius, 0, +(endAngle - startAngle > 180), 0, x0, y0, 
				"z"]).attr({ 'stroke-width': 0, 'opacity': 0.4, 'fill': colour, 'fill-opacity': 0.9});
		}, this );

		this.paper.text( x, y - (( datasetnumber ) * pointWidth + offset + (pointWidth/2) ), this.options.labels[datasetnumber] ).attr({});
		this.paper.circle( x, y,(( datasetnumber ) * pointWidth + offset) ).attr({'stroke': '#000000', 'opacity': 0.4 }); 
	}, this );

	this.paper.circle( x, y,( (this.options.data.length ) * pointWidth + offset) ).attr({'stroke': '#000000', 'opacity': 0.4 }); 
	
	this.paper.circle( x, y, offset).attr({'stroke': '#000000', 'stroke-width': 0, 'fill': '#ffffff' });
	this.paper.circle( x, y, offset).attr({'stroke': '#000000', 'stroke-width': 1, 'opacity': 0.4 });
}
});


