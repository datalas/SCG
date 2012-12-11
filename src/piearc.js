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

var SCGPieArc = new Class({
Implements: [ Events, Options ],
Extends: SCGPiechart,
initialize: function( obj, options ){
	this.parent( obj, options);
	this.element = $(obj);

	this.createPaper();
	this.createColours();

	this.points = 5;

	this.draw();
},
draw: function(){
	/* Determine the size of our component parts */
	
	/* the total amount of space we have to draw on is defined by this.chart */

	var maxRadius = Math.min( this.chart.height / 2, this.chart.width / 2 );

	/* our outer ring is then at our full (outer) limit and a little inside */
	var outer = {
		outer: maxRadius,
		inner: maxRadius - 30
	};

	var inner = {
		radius: maxRadius - 40
	}

	/* Now we need to work out what our maximum is */
	var total = 0;

	this.options.data.each( function( slice ){ 
		total += parseFloat( slice[ 0 ] );
	}, this );
	
	var starting_angle = 0;
	this.borders = this.paper.set();
	this.charts = this.paper.set();

	this.leftLabels = [];
	this.rightLabels = {};
	this.rightLabelCount = 0;

	this.sectors = {};
	this.arcs = {};
	
	this.options.data.each( function( section, index ){ 
		var slice = section[0];
		var detail = section[1];

		var angle = 360 * ( slice / total );
		var percentage = parseInt((slice/total) * 100) + '%';

		var sector = this.sector( this.chart.center, this.chart.middle, outer.outer + 15, starting_angle, starting_angle + angle, { 'fill': '#505050', 'stroke-width': 5, 'fill-opacity': 0.1, 'stroke': '#ffffff'  } );
		var sector = this.sector( this.chart.center, this.chart.middle, inner.radius, starting_angle, starting_angle + angle, { 'fill': this.colours[ index ], 'stroke-width': 0, 'opacity': 0.7  } );

		sector.percentage = percentage;
		var arc = this.arc( this.chart.center, this.chart.middle, outer, starting_angle, angle, detail, index);
		this.sectors[ this.options.labels[index][0] ] = sector;
		this.arcs[ this.options.labels[index][0] ] = arc;

		this.leftLabels.push( { label: this.options.labels[index][0], colour: this.colours[index] } );

		starting_angle += angle;
		[ sector, arc ].flatten().each( function(chart){ this.charts.push( chart ) }, this );;

	}, this );

	this.charts.toFront();

	/* we have two keys, one on the left, one on the right (for the inner and outer circles) */
	/* now derive the left hand keys */
	this.labelX = this.chart.center - outer.outer - 220;
	this.labelY = this.chart.middle - ((this.leftLabels.length * 20)/2);

	var leftKey = {
		top: this.labelY,
		left: this.labelX,
		height: this.leftLabels.length * 20,
		width: 50
	};

	this.leftLabels.each( function( label, point ){
		var text = this.paper.text( this.labelX + 15, this.labelY + 10 + (20 * point ), label.label ).attr({'text-anchor': 'start', 'font-size': 12});
		var blob = this.paper.circle( this.labelX, this.labelY + 10 + (20 * point), 5 ).attr({ 'stroke-width': 1, 'stroke': label.colour, 'fill': label.colour, 'fill-opacity': 0.4 });
		var arcs = this.arcs[ label.label ];
		var x = this.chart.center;
		var y = this.chart.middle;
		var highlight = function(){
			var sector = this.sectors[ label.label ];
			sector.attr({'opacity': 1, 'stroke-width': 1, 'stroke': '#505050' });
			sector._percent = this.paper.text( sector.center.x, sector.center.y, sector.percentage ).attr({'fill': '#ffffff', 'font-size': 30});
			sector.scale( 1.5, 1.5, x, y );
			arcs.each( function( arc ){
				arc.scale( 1.5, 1.5, x,y );
				arc.attr({'opacity': 1, 'stroke-width': 1, 'stroke': '#505050' });
				this.rightLabels[ arc.label ].blob.attr( { 'fill-opacity': 1 } );
				this.rightLabels[ arc.label ].blob.scale(2,2);
				this.rightLabels[ arc.label ].text.attr( { 'font-weight': 'bold' } );
			}, this );
		};
		var resethighlight = function(){
			var sector = this.sectors[ label.label ];
			sector.scale( 2/3, 2/3, x, y );
			sector.attr({'opacity': 0.7, 'stroke-width': 0 });
			sector._percent.remove();
			arcs.each( function( arc ){
				arc.scale( 2/3, 2/3, x,y );
				arc.attr({'opacity': 0.7, 'stroke-width': 0, 'stroke': '#505050' });
				this.rightLabels[ arc.label ].blob.scale(0.5,0.5);
				this.rightLabels[ arc.label ].blob.attr( { 'fill-opacity': 0.4 } );
				this.rightLabels[ arc.label ].text.attr( { 'font-weight': 'normal' } );
			}, this );
		};
		label.coords = {
			x: this.labelX,
			y: this.labelY + 10 + ( 20 * point)
		};
		label.caption = text;
		label.blob = blob;
		text.hover( highlight, resethighlight, this, this );

	}, this );

	/* and the right hand labels */
	this.labelX = this.chart.center + outer.outer + 100;
	this.labelY = this.chart.middle - ((this.rightLabelCount * 20)/2);

	var rightKey = {
		top: this.labelY,
		left: this.labelX,
		height: this.rightLabelCount * 20,
		width: 100
	};

	var point = 0;
	Object.each( this.rightLabels, function( label ){
		label.text = this.paper.text( this.labelX + 15, this.labelY + 10 + (20 * point ), label.label ).attr({'text-anchor': 'start', 'font-size': 12});
		label.blob = this.paper.circle( this.labelX, this.labelY + 10 + (20 * point), 5 ).attr({ 'stroke-width': 1, 'stroke': label.colour, 'fill': label.colour, 'fill-opacity': 0.4 });
		point++;
		label.coords = {
			x: this.labelX,
			y: this.labelY + 10 + ( 20 * point)
		};
	}, this );



	this.frameKey( this.chart.center, this.chart.middle, outer.outer + 5, rightKey.left, rightKey.top, rightKey.height, rightKey.width, 1 );
	this.frameKey( this.chart.center, this.chart.middle, outer.outer + 5, leftKey.left, leftKey.top, leftKey.height, leftKey.width, -1 );

},
arc: function( cx, cy, radius, start, arcLength, data, index, params  ){
	/* how long is our arc ?  this will give us the scale for each point */

	/* what is the total number we have to represent ? */
	var total = data.sum();
	var rad = Math.PI / 180;

	/* so, how much of our arc is each point worth ? */
	var scale = arcLength / total;
	
	/* we should now start parsing each data point */

	var startAngle = start;
	var arcs = [];

	data.each( function( point, pointnumber ){
		/* we need four points (there are four lights!) */
		var endAngle   = startAngle + (point * scale);

		var innerRadius = radius.inner;
		var outerRadius = radius.outer

		var x0 = cx + innerRadius * Math.cos( startAngle * rad );
		var y0 = cy + innerRadius * Math.sin( -startAngle * rad );

		var x1 = cx + innerRadius * Math.cos( endAngle * rad );
		var y1 = cy + innerRadius * Math.sin( -endAngle * rad );

		var x2 = cx + outerRadius * Math.cos( startAngle * rad );
		var y2 = cy + outerRadius * Math.sin( -startAngle * rad );

		var x3 = cx + outerRadius * Math.cos( endAngle * rad );
		var y3 = cy + outerRadius * Math.sin( -endAngle * rad );

		var colour = this.colours[ pointnumber ];

		/* draw the section */
		var arc = this.paper.path([
			"M", x0, y0, 
			"L", x2, y2, 
			"A", outerRadius, outerRadius, 0, +(endAngle - startAngle > 180), 0, x3, y3, 
			"L", x1, y1, 
			"A", innerRadius, innerRadius, 1, +(endAngle - startAngle > 180 ), 1, x0, y0, 
			"z"]).attr({ 'stroke-width': 0, 'fill': colour , 'opacity': 0.7 });

		startAngle = endAngle;
		if ( !this.rightLabels[ this.options.labels[index][1][pointnumber] ] ){
			this.rightLabels[ this.options.labels[index][1][pointnumber]] = { label: this.options.labels[ index ][ 1 ][ pointnumber ], colour: this.colours[ this.rightLabelCount ] };
			this.rightLabelCount++;
		}

		arc.label = this.options.labels[index][1][pointnumber];
		arcs.push( arc );
	}, this );

	return arcs;
},
frameKey: function( cx, cy, r, x, y, height, width, side ){
	/* draw some fancy lines around the key */
	/* where does the key start ? */
	/* draw an arc from the top middle, round our arc to level with the top of the key */
	var arcY = cy - y;
	var arcX = cx + ((Math.sqrt( ((r*r) - (arcY*arcY)) )) * side );	
	this.paper.path([
		"M", cx, cy - r, "L", cx, cy - r, "A", r, r, 0, 0, +(side > 0), arcX, y,  /* Construct an arc from the top of the chart to the top of the key */
		"H", x + (width * side),
		'V', y + height,
		"H", arcX,
		"A", r, r, 0, 0, +(side>0), cx, cy + r,  /* Construct an arc from the top of the chart to the top of the key */

	]).attr({'stroke': '#505050', 'stroke-opacity': 0.3, 'stroke-width': 1, 'stroke-linecap': 'round'});

}
});

