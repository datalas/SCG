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

var SCGChart = new Class({
Implements: [ Events, Options ],
options: {
	height: 300,
	width:  800,
	ypoints: 5,
	gutter: {
		left: 70,
		right: 250,
		bottom: 50,
		top: 20
	},
	data: [],
	labels: [],
	xaxis: [],
	yaxis: null,
	labelcolour: '#505050',
	invertNegative: 0,
	lines: {
		axis: {
			'stroke': '#a0a0a0',
			'stroke-width': 1
		},
		grid: {
			'stroke': '#d0d0d0',
			'stroke-width': 0.5
		},
		tooltip: {
			'stroke': '#303030',
			'stroke-width': 1,
			'fill': '#202040',
			'fill-opacity': 0.9
		},
		tooltiptext: {
			'fill': '#a0a0ff',
			'font-size': 12
		},
		tooltiptextvalue: {
			'fill': '#ffffff',
			'opacity': 0.9,
			'font-size': 12
		}
	},
	colours: [
		[ 77, 62,106], [ 70,147,184], [ 52,203,104], [160,145,191], 
		[169,83,171], [227,106,105], [255,103, 0], [146, 22, 34], [255,192, 81], 
		[ 51,203,130], [ 46,134, 34],[ 77, 62,106], [ 70,147,184], [ 52,203,104], [160,145,191], 
		[169,83,171], [227,106,105], [255,103, 0], [146, 22, 34], [255,192, 81], 
		[ 51,203,130], [ 46,134, 34],[ 77, 62,106], [ 70,147,184], [ 52,203,104], [160,145,191], 
		[169,83,171], [227,106,105], [255,103, 0], [146, 22, 34], [255,192, 81], 
		[ 51,203,130], [ 46,134, 34],[ 77, 62,106], [ 70,147,184], [ 52,203,104], [160,145,191], 
		[169,83,171], [227,106,105], [255,103, 0], [146, 22, 34], [255,192, 81], 
		[ 51,203,130], [ 46,134, 34],[ 77, 62,106], [ 70,147,184], [ 52,203,104], [160,145,191], 
		[169,83,171], [227,106,105], [255,103, 0], [146, 22, 34], [255,192, 81], 
		[ 51,203,130], [ 46,134, 34],[ 77, 62,106], [ 70,147,184], [ 52,203,104], [160,145,191], 
		[169,83,171], [227,106,105], [255,103, 0], [146, 22, 34], [255,192, 81], 
		[ 51,203,130], [ 46,134, 34],[ 77, 62,106], [ 70,147,184], [ 52,203,104], [160,145,191], 
		[169,83,171], [227,106,105], [255,103, 0], [146, 22, 34], [255,192, 81], 
		[ 51,203,130], [ 46,134, 34],[ 77, 62,106], [ 70,147,184], [ 52,203,104], [160,145,191], 
		[169,83,171], [227,106,105], [255,103, 0], [146, 22, 34], [255,192, 81], 
		[ 51,203,130], [ 46,134, 34]
	],
	startAtZero: true,
	key: true,
	format: SCGFormat	/* Used to denote additional formatting functions for the y Axis */
},
initialize: function( obj, options ){
	this.setOptions( options );
	this.setDimensions();

	/* are we given any formatting options ? (and were we given enough ?) */
	if ( this.options.format ){
		if ( typeOf( this.options.format ) != 'array' ){
			this.options.format = [ this.options.format ];
		}
		this.yFormat = {
			value: this.options.format[ 0 ],
			axis:  this.options.format[ 1 ],
			store: {}  /* A storage option for the axis / value pair */
		}
	}
},
createColours: function(){
	var a = [];
	var aa = [];
	this.options.colours.each( function( colour ){
		a.push( 'rgb(' + colour + ')' );
		aa.push( 'rgba(' + colour + ',0.1)' );
	}, this );
	this.colours = a;
	this.alphaColours = aa;
},
createPaper: function(){
	this.paper = new Raphael( this.element, this.options.width, this.options.height );
},
/* Add an item to the keys */
addKey: function( label ){
	if ( !this.keys ){
		this.keys = {
			x: this.labelX,
			y: this.labelY,
			columns: [ [] ],
			width: 0,
			height: 0,
			column: 0
		}
	}

	if ( this.options.key && this.options.labels[ label ] ){
		if ( this.labelY > this.chart.bottom ){
			/* this label is not going to fit on the screen, not at the bottom anyhow */
			/* so we need to move it */
			this.labelY = this.keys.y;
			this.labelX = this.keys.x + Math.max( this.keys.columns[ this.keys.column ].map( function(i){ return i.width; } ).max() );
			this.keys.column ++;
			this.keys.columns[ this.keys.column ] = [];
		}

		var key = {
			label: this.options.labels[label],
			text: this.paper.text( this.labelX + 15, this.labelY, this.options.labels[label] ).attr({'text-anchor': 'start', 'font-size': 12}),
			blob: this.paper.circle( this.labelX, this.labelY, 5 ).attr({ 'stroke-width': 1, 'stroke': this.colours[label], 'fill': this.colours[label], 'fill-opacity': 0.4 })
		};

		key.width = 30 + key.text.getBBox().width;

		this.labelY += 20;
		this.keys.columns[ this.keys.column ].push( key );
		return key;
	}
},
createToolTip: function( where ){
	var tt = where.obj.paper.set();

	var value = where.value;
	if ( value < 0 && this.options.invertNegative ){
		value *= -1;
	}	

	var toolTipText      = where.obj.paper.text( where.middle, where.bottom + 15, where.label.label ).attr( where.obj.options.lines.tooltiptext );
	var toolTipTextValue = where.obj.paper.text( where.middle, where.bottom + 30, value ).attr( where.obj.options.lines.tooltiptextvalue );
	var width  = Math.max( toolTipText.getBBox().width, toolTipTextValue.getBBox().width ) + 10;
	var height = (toolTipText.getBBox().height + 2 ) * 2;

	var toolTipBox  = where.obj.paper.path( [ 
		'M', where.middle, where.bottom, 
		'L', where.middle + 5, where.bottom + 5,
		'L', where.middle + (width/2),where.bottom + 5,
		'L', where.middle + (width/2),where.bottom + 5 + height,
		'L', where.middle - (width/2),where.bottom + 5 + height,
		'L', where.middle - (width/2),where.bottom + 5,
		'L', where.middle - 5, where.bottom + 5,
		'L', where.middle, where.bottom
	] ).attr( where.obj.options.lines.tooltip );
	toolTipText.toFront();
	toolTipTextValue.toFront();
	tt.push( toolTipBox );
	tt.push( toolTipText );
	tt.push( toolTipTextValue );
	return tt;
},
setDimensions: function(){
	this.chart = {
		bottom: this.options.height - this.options.gutter.bottom,
		right:  this.options.width - this.options.gutter.right,
		left:   this.options.gutter.left,
		top:    this.options.gutter.top,
		width:  ( this.options.width - ( this.options.gutter.left + this.options.gutter.right )),
		height: ( this.options.height - ( this.options.gutter.top + this.options.gutter.bottom ))
	};

	this.chart.middle = this.chart.top + ( this.chart.height / 2 );
	this.chart.center = this.chart.left + ( this.chart.width / 2 );
	
	this.width = this.options.width;
	this.height = this.options.height;
	this.top = 0;
	this.left = 0;
	this.right = this.width;
	this.bottom = this.height;
},
setRange: function()
{
	this.y = {
	};

	/* determine whether this is a stacked graph or otherwise */
	switch( typeOf( this.options.data[0] ) ){
	case 'array':
		this.stacked = true;
		var highest = [];
		var lowest = [];
		this.options.data.each( function( point ){
			var h = 0;
			var l = 0;
			Array.each( point, function( p ){
				if ( p > 0 ){
					h += p;
				} else {
					l += p;
				}
			}, this );
			highest.push( h );
			lowest.push( l );
		}, this );

		this.y.min = Math.floor( lowest.min() * 10 ) / 10;
		this.y.max = Math.ceil( highest.max() / 10 ) * 10;

		break
	case 'number':
	case 'string':
		this.stacked = false;
		this.y.min = Math.floor( this.options.data.map( function(point){ return parseInt( point ) } ).min() * 10 ) / 10;
		this.y.max = Math.ceil( this.options.data.map( function(point){ return parseInt( point ) } ).max() / 10 ) * 10;

		break;
	};

	if ( this.options.startAtZero ){
		this.y.min = Math.min( 0, this.y.min );
	}

	/* if we have negative numbers, then we need to ensure that our minimum is */
	/* something that we can divide up by whatever our steps are ... 	   */

	/* we can determine the maximum range we have to deal with as being the maximum */
	/* value of our Maximum or (Minimum * -1) */
	var scaleMax = Math.max( this.y.max, this.y.min * -1 );

	/* determine the scale, this is to get the maximum value we encounter into */
	/* the correct number of points */
	var scale = Math.ceil( scaleMax / this.options.ypoints);

	/* we should now adjust our maxiumum and minimum values so that they are */
	/* a multiple of our scale */

	var ymax = 0;
	var points = -1;
	while ( ymax < this.y.max ){
		ymax += scale;
		points ++;
	}


	var ymin = 0;
	var npoints = -1;
	while ( ymin > this.y.min ){
		ymin -= scale;
		npoints++;
	}

	var zeroheight = parseInt((this.chart.height/(ymax - ymin)) * ( - ymin ));
	this.chart.zero = this.chart.bottom - zeroheight;

	this.y = {
		max: ymax,
		points: points,
		min: ymin,
		npoints: npoints,
		scale: scale,
		/* this.y.scale gives us the number of units we have per step (in order to have the correct number of steps */
		step: Math.ceil( (this.chart.zero - this.chart.top ) / (points+1) )
	};

},
drawAxis: function(){
	/* draw both the X and Y axis */
	
	/* it is possible that we will want to move the bottom of our graph */
	/* this would be because of negative numbers */

	this.axis = this.paper.set();

	this.grid = {
		xAxis: this.paper.path( 'M' + this.chart.left + ',' + this.chart.bottom + 'L' + this.chart.left + ',' + this.chart.top ).attr(this.options.lines.axis),
		yAxis: this.paper.path( 'M' + this.chart.left + ',' + this.chart.zero + 'L' + this.chart.right + ',' + this.chart.zero ).attr(this.options.lines.axis)
	};

	/* add the axis lines to the axis set (so we can change / update it's ordering) */
	this.axis.push( this.grid.xAxis );
	this.axis.push( this.grid.yAxis );

	this.points = {
			x: [],
			y: [],
			xLabels: [],
			yLabels: []
	};

	/* draw the X axis */
	this.xStep = parseInt( this.chart.width / this.numberOfPoints );

	var label = 0;
	this.labelY = this.chart.top;
	this.labelX = this.width - this.options.gutter.right + 30;
	for ( var i = this.options.gutter.left; i <= ( this.width - this.options.gutter.right ); i += this.xStep ){
		this.axis.push( this.paper.path( ['M', i, this.chart.bottom, 'L', i, this.chart.bottom + 5 ] ).attr(this.options.lines.grid ) ); 
		this.points.x.push( i );
	}

	/* and draw the Y axis.  This is subtly different as we shall start at the zero point and head upwards */
	/* and at the zero point again and head downwards */

	/* pass the minium and maximum values of the y axis to the formatting function   */
	/* this may alter the means by which the label is displayed, it might also alter */ 
	/* the label itself */

	yAxisLabel = this.options.yaxis;

	if ( this.yFormat.axis ){
		yAxisLabel = this.yFormat.axis( this.y.min, this.y.max, yAxisLabel, this.yFormat.store );
	}

	for ( var i = 0 ; i <= (this.y.points+1) ; i++ ){
		var y = this.chart.zero - ( i * this.y.step );
		this.points.y.push( y );

		var labelValue = ( i * this.y.scale );
		if ( this.yFormat.axis ){
			labelValue = this.yFormat.value( labelValue, this.yFormat.store );
		}

		if ( i == 0 ){
			var zeroLabel = this.paper.text( this.options.gutter.left - 5, y, 0  ).attr({'text-anchor': 'end', 'font-weight': 'bold', 'font-size': 13 });
			this.axis.push( zeroLabel );
			this.points.yLabels.push( zeroLabel );
		} else {
			this.axis.push( this.paper.path( ['M', this.options.gutter.left, y, 'L', this.options.gutter.left - 5, y ] ).attr(this.options.lines.grid) ); 
			var label = this.paper.text( this.options.gutter.left - 5, y, labelValue  ).attr({'text-anchor': 'end'});
			this.axis.push( label );
			this.points.yLabels.push( label );
		}
	}

	for ( var i = 0 ; i <= (this.y.npoints+1) ; i++ ){
		/* we are doing the negative axis, so we need to move further away from zero */
		if ( i != 0 ){
			var y = this.chart.zero + ( i * this.y.step );
			this.axis.push( this.paper.path( ['M', this.options.gutter.left, y, 'L', this.options.gutter.left - 5, y ] ).attr(this.options.lines.grid) ); 
			this.points.y.push( y );

			var value = i * this.y.scale;

			var labelValue = value;
			if ( this.yFormat.axis ){
				labelValue = this.yFormat.value( value, this.yFormat.store );
			}

			var label = this.paper.text( this.options.gutter.left - 5, y, labelValue ).attr({'text-anchor': 'end'});
			this.points.yLabels.push( label );
			this.axis.push( label );
		}
	}

	/* draw a label on the Y Axis */
	if ( this.options.yaxis ){
		var x = this.left + 5;
		var y = this.chart.top + ( this.chart.height / 2 );
		this.axis.push( this.paper.text( x, y, yAxisLabel ).attr({'fill': this.options.labelcolour }).rotate( -90, x, y ) );
	}

},
drawKey: function(){
	if ( this.stacked ){
		this.options.data[0].each( function( data, label ){
			this.points.xLabels.push( this.addKey( label ) );
		}, this );
	} else {
		this.options.data.each( function( data, label ){
			this.points.xLabels.push( this.addKey( label ) );
		}, this );
	}
},
drawGrid: function(){
	Array.each( this.points.x, function( point ){
		this.paper.path( ['M',point,this.chart.bottom, 'L', point, this.chart.top ] ).attr( this.options.lines.grid ).toBack();
	}, this );
	Array.each( this.points.y, function( point ){
		this.paper.path( ['M',this.chart.left,point, 'L', this.chart.right, point ] ).attr( this.options.lines.grid ).toBack();
	}, this );

},
getColour: function( value ){

	/* colours fade from white (no value) to green, to yellow, to red */
	/* recalculate the maximum */

	var max = this.max;

	var range = ( max / 3 );

	/* range therefor is whether we are going for slightly green, slightly white, slighty yellow etc */
	var r = 0,g = 0,b = 0;

	var colourScale = 255 / range;

	if( value < range ){
		/* white to green */
		var offset = Math.floor( colourScale * value );
		r = 255 - offset;
		g = 255;
		b = 255 - offset;
	} else if ( value < 2* range ){
		/* green to yellow */
		var offset = Math.floor( colourScale * (value-range) );
		r = 0 + offset;
		g = 255;
		b = 0;
	} else {
		/* range to red */
		var offset = Math.floor( colourScale * (value - (2*range)) );
		r = 255;
		g = 255 - offset;
		b = 0;
	}

	return 'rgb(' + r + ',' + g + ',' + b + ')';

}


});

