/* 
---

name: SCGChart

description: SCGChart Class.  Defines a base class for SCG Charts

licence: See licence.txt

authors:
 - Darren Taylor

requires:
 - RaphaelJS v2.1.0+ (www.raphaeljs.com)
 - MooTools Core / More v1.4.5+
 - SCGFormatValue
 - SCGFormatAxis

provides: [SCGChart]

...
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
	styles: {
		markLabel: {
			'stroke': '#0000ff',
			'fill': '#0000ff'
		},
		selection: {
			'fill':'#d0d0ff', 
			'opacity': 0.6
		},
		averageLine: {
			'stroke': '#000000',
			'opacity': '0.2',
			'stroke-width': 3
		}
	},
	fillOpacity: 0.3,
	min: 0,
	max: 1,
	startAtZero: true,
	key: true,
	selectable: true,
	grid: true,		/* Whether to display a grid in the background of the chart */
	persistentColour: false,/* Option to enforce persistent colouring for different series */
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

	if( this.options.selectable ){
		$(obj).addEvent('mousedown', this.startSelect.bind( this ) );
		$(obj).addEvent('mouseleave', this.stopSelect.bind( this ) );
		$(obj).addEvent('mouseup', this.endSelect.bind(this) );
		$(obj).addEvent('mousemove', this.moveSelect.bind(this) );
	}

},
createColours: function(){
	this.colours = [];
	this.fillColours = [];
	this.alphaColours = [];
	this.fillOpacity = [];
	this.options.colours.each( function( colourDef ){
		console.log( colourDef, typeOf( colourDef ) );
		var colour = colourDef;
		var opacity = this.options.fillOpacity;
		switch( typeOf( colourDef ) ){
		case 'object':
			colour = colourDef.colour;
			if ( colourDef.opacity != null ){
				opacity = colourDef.opacity;	
			}
		default:
			break;
		};

		if ( typeOf( colour[ 0 ] ) == 'array' ){
			this.colours.push( 'rgb(' + colour[0] + ')' );
			this.fillColours.push( '90-rgba(' + colour[0] + ')-rgb(' + colour[1] + '):80' );
			this.alphaColours.push( 'rgba(' + colour[0] + ',0.1)' );
		} else {
			this.colours.push( 'rgb(' + colour + ')' );
			this.fillColours.push( 'rgb(' + colour + ')' );
			this.alphaColours.push( 'rgba(' + colour + ',0.1)' );
		}
		this.fillOpacity.push( opacity );
	}, this );
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

		var colour = label;
		if ( this.options.persistentColour ){
			colour = 0;
		}

		var key = {
			label: this.options.labels[label],
			text: this.paper.text( this.labelX + 15, this.labelY, this.options.labels[label] ).attr({'text-anchor': 'start', 'font-size': 12}),
			blob: this.paper.circle( this.labelX, this.labelY, 5 ).attr({ 'stroke-width': 1, 'stroke': this.colours[colour], 'fill': this.colours[colour], 'fill-opacity': 0.4 })
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
	var range = this.getRange( this.options.data, this.chart );
	this.stacked = range.stacked;	
	this.chart.zero = y.zero;

	var dirty = false;

	if ( this.y ){
		/* we already have a range, has it changed any ? */
		if ( 
			this.y.max != range.ymax 
			|| 
			this.y.points != range.points
			||
			this.y.min != range.ymin
			||
			this.y.npoints != range.npoints
			||
			this.y.scale != range.scale
			||
			this.y.step != range.step
		){
			dirty = true;
		}
	} 

	this.y = range;

	return dirty;
},
getRange: function( data, chart )
{
	y = {};
	var stacked = false;

	/* determine whether this is a stacked graph or otherwise */
	switch( typeOf( data[0] ) ){
	case 'array':
		stacked = true;
		var highest = [];
		var lowest = [];
		data.each( function( point ){
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

		y.min = Math.floor( lowest.min() );
		y.max = Math.ceil( highest.max() );

		break
	case 'number':
	case 'string':
		stacked = false;

		y.min = Math.floor( data.map( function(point){ return Math.floor( point ) } ).min() );
		y.max = Math.ceil( data.map( function(point){ return Math.ceil( point ) } ).max() );

		break;
	};

	if ( this.options.startAtZero ){
		y.min = Math.min( 0, y.min );
	}

	y.min = Math.min( y.min, this.options.min );
	y.max = Math.max( y.max, this.options.max );

	/* if we have negative numbers, then we need to ensure that our minimum is */
	/* something that we can divide up by whatever our steps are ... 	   */

	/* we can determine the maximum range we have to deal with as being the maximum */
	/* value of our Maximum or (Minimum * -1) */
	var scaleMax = Math.max( y.max, y.min * -1 );

	/* determine the scale, this is to get the maximum value we encounter into */
	/* the correct number of points */
	var scale = Math.ceil( scaleMax / this.options.ypoints);

	/* we should now adjust our maxiumum and minimum values so that they are */
	/* a multiple of our scale */

	var ymax = 0;
	var points = -1;
	while ( ymax < y.max ){
		ymax += scale;
		points ++;
	}


	var ymin = 0;
	var npoints = -1;
	while ( ymin > y.min ){
		ymin -= scale;
		npoints++;
	}

	var zeroheight = parseInt((chart.height/(ymax - ymin)) * ( - ymin ));
	var zero = chart.bottom - zeroheight;

	/* this.y.scale gives us the number of units we have per step (in order to have the correct number of steps */
	var step = Math.ceil( (zero - chart.top ) / (points+1) );

	y = {
		max: ymax,
		points: points,
		min: ymin,
		npoints: npoints,
		scale: scale,
		step: step,
		zero: zero,
		stacked: stacked
	};

	return y;
},
drawAxis: function(){
	/* it is possible that we will want to move the bottom of our graph */
	/* this would be because of negative numbers */

	if ( this.axis ){
		this.axis.remove();
		delete this.axis;
	}

	this.axis = this.paper.set();

	var chartAxis = this.drawChartAxis( this.chart, this.y );

	/* preserve some of the bits from the axis we just created */
	this.grid   = chartAxis.grid;
	this.points = chartAxis.points;
	this.labelY = chartAxis.labelY;
	this.labelX = chartAxis.labelX;
	this.points = chartAxis.points;
},
calculateXStep: function( chart ){
	return ( chart.width / this.numberOfPoints );
},
drawChartAxis: function( chart, y )
{
	/* draw both the X and Y axis */
	var chartAxis = {};
	
	chartAxis.grid = {
		xAxis: this.paper.path( 'M' + chart.left + ',' + chart.bottom + 'L' + chart.left + ',' + chart.top ).attr(this.options.lines.axis),
		yAxis: this.paper.path( 'M' + chart.left + ',' + chart.zero + 'L' + chart.right + ',' + chart.zero ).attr(this.options.lines.axis)
	};

	/* add the axis lines to the axis set (so we can change / update it's ordering) */
	this.axis.push( chartAxis.grid.xAxis );
	this.axis.push( chartAxis.grid.yAxis );

	chartAxis.points = {
			x: [],
			y: [],
			xLabels: [],
			yLabels: []
	};

	/* draw the X axis */
	this.xStep = this.calculateXStep( chart );

	var label = 0;
	chartAxis.labelY = chart.top;
	chartAxis.labelX = this.width - this.options.gutter.right + 30;

	for ( var i = chart.left; i < chart.width + chart.left; i += this.xStep ){
		this.axis.push( this.paper.path( ['M', i, chart.bottom, 'L', i, chart.bottom + 5 ] ).attr(this.options.lines.grid ) ); 
		chartAxis.points.x.push( i );
	}

	/* and draw the Y axis.  This is subtly different as we shall start at the zero point and head upwards */
	/* and at the zero point again and head downwards */

	/* pass the minium and maximum values of the y axis to the formatting function   */
	/* this may alter the means by which the label is displayed, it might also alter */ 
	/* the label itself */

	yAxisLabel = this.options.yaxis;

	if ( this.yFormat.axis ){
		yAxisLabel = this.yFormat.axis( y.min, y.max, yAxisLabel, this.yFormat.store );
	}

	for ( var i = 0 ; i <= (y.points+1) ; i++ ){
		var ny = chart.zero - ( i * y.step );
		chartAxis.points.y.push( ny );

		var labelValue = ( i * y.scale );
		if ( this.yFormat.axis ){
			labelValue = this.yFormat.value( labelValue, this.yFormat.store );
		}

		if ( i == 0 ){
			var zeroLabel = this.paper.text( this.options.gutter.left - 5, ny, 0  ).attr({'text-anchor': 'end', 'font-weight': 'bold', 'font-size': 13 });
			this.axis.push( zeroLabel );
			chartAxis.points.yLabels.push( zeroLabel );
		} else {
			this.axis.push( this.paper.path( ['M', this.options.gutter.left, ny, 'L', this.options.gutter.left - 5, ny ] ).attr(this.options.lines.grid) ); 
			var label = this.paper.text( this.options.gutter.left - 5, ny, labelValue  ).attr({'text-anchor': 'end'});
			this.axis.push( label );
			chartAxis.points.yLabels.push( label );
		}
	}

	for ( var i = 0 ; i <= (y.npoints+1) ; i++ ){
		/* we are doing the negative axis, so we need to move further away from zero */
		if ( i != 0 ){
			var ny = chart.zero + ( i * this.y.step );
			this.axis.push( this.paper.path( ['M', this.options.gutter.left, ny, 'L', this.options.gutter.left - 5, ny ] ).attr(this.options.lines.grid) ); 
			chartAxis.points.y.push( ny );

			var value = i * y.scale;

			var labelValue = value;
			if ( this.yFormat.axis ){
				labelValue = this.yFormat.value( value, this.yFormat.store );
			}

			var label = this.paper.text( this.options.gutter.left - 5, ny, labelValue ).attr({'text-anchor': 'end'});
			chartAxis.points.yLabels.push( label );
			this.axis.push( label );
		}
	}

	/* draw a label on the Y Axis */
	if ( this.options.yaxis ){
		var nx = this.left + 5;
		var ny = chart.top + ( chart.height / 2 );
		this.axis.push( this.paper.text( nx, ny, yAxisLabel ).attr({'fill': this.options.labelcolour }).rotate( -90, nx, ny ) );
	}

	return chartAxis;

},
drawXAxis: function(){
	/* if we haven't got an xaxis, there's little point trying to draw it */
	if ( this.options.xaxis && this.options.xaxis.length <= 0 ){
		return;
	}

	Array.each( this.options.data, function( valueGroup, position ){
		//var middle = i + ( this.xStep / 2 );
		var x = this.points.x[position] + ( this.xStep / 2 );
		var y = this.chart.bottom;

		if ( this.options.xaxis && this.options.xaxis[position]){
			var label = this.paper.text( x - 5, y, this.options.xaxis[position] ).attr({'text-anchor': 'end', 'fill': this.options.labelcolour } ).rotate( -90, x, y );	
		}
	}, this );
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
	if ( this.options.grid ){
		Array.each( this.points.x, function( point ){
			this.paper.path( ['M',point,this.chart.bottom, 'L', point, this.chart.top ] ).attr( this.options.lines.grid ).toBack();
		}, this );
		Array.each( this.points.y, function( point ){
			this.paper.path( ['M',this.chart.left,point, 'L', this.chart.right, point ] ).attr( this.options.lines.grid ).toBack();
		}, this );
	}
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

},
data: function( newData ){
	this.options.data = newData;

	this.redraw();
},
labels: function( newLabels ){
	this.options.labels = newLabels;
},

redraw: function(){
	/* Virtual method to be overloaded */
},

/* Selection code, allowing a user to select bits of the chart */
getSelectionPosition: function(e){
	return {
		x: e.page.x - this.element.getCoordinates().left - this.chart.left,
		y: e.page.y - this.element.getCoordinates().top - this.chart.top
	}
},
makeSelection: function(x){
	if ( !x ){
		return;
	}

	x += this.chart.left;
	if ( !this._selection ){
		this._selection = this.paper.rect( x, this.chart.top, this.xStep, this.chart.height ).attr( this.options.styles.selection ).toFront();
	}
	this._selection.attr({ 
		x: x,
		width: 1
	});	
},
markRange: function( start, stop ){
	var startPosition = 0;
	var stopPosition = 0;

	Array.each( this.points.x, function( point, index ){
		if ( this.options.labels[ index ] == start ){
			startPosition = index;
		}
		if ( this.options.labels[ index ] == stop ){
			stopPosition = index;
		}
	}, this);

	this.makeSelection( startPosition * this.xStep );
	
	startPosition = parseInt( startPosition ) * this.xStep;
	stopPosition  = parseInt( stopPosition ) * this.xStep;

	if ( this._selection ){
		this._selection.attr({ 
			x: (Math.min( startPosition, stopPosition )) + this.chart.left,
			width: Math.max( 
				startPosition - stopPosition,
				stopPosition - startPosition,
				0.1
			)
		});
	}
},
startSelect: function(e){
	e.stop();

	this._startSelection = this.getSelectionPosition(e);

	/* rationalise X so that it starts at the nearest point on the graph */
	this._startSelection.x = this.xStep * ( parseInt( this._startSelection.x / this.xStep ));

	this.makeSelection( this._startSelection.x  );

	this.fireEvent('selectstart');
},
endSelect: function(e){
	e.stop();

	/* where is the mouse now? */
	var position = this.getSelectionPosition(e);	

	/* where did we start ? */
	var startPosition = Math.min( this._startSelection.x, position.x );
	var endPosition   = Math.max( this._startSelection.x, position.x );

	this._startSelection = null;

	var startElement = parseInt( startPosition / this.xStep );
	var endElement   = parseInt( endPosition / this.xStep );

	this.fireEvent('selectend', [
		{
			start: startPosition,
			stop:  endPosition,
			startLabel: this.options.labels[ startElement ],
			endLabel: this.options.labels[ endElement ],
			startElement: startElement,
			endElement: endElement,
			data: this.options.data.splice( startElement, (endElement - startElement) + 1 )
		}
	] );
},
moveSelect: function(e){
	var pos = this.getSelectionPosition(e);

	if ( 
		pos.x > 0 
		&&
		pos.x < this.chart.width
		&&
		pos.y > 0
		&&
		pos.y < this.chart.height
	){
		/* we are within the clickable area of the graph */
		if ( this._selection && this._startSelection ){
			var width = Math.max( pos.x - this._startSelection.x,	this._startSelection.x - pos.x,	0.1 );
			var newWidth = this.xStep * ( parseInt( width / this.xStep ) + 1 );
			this._selection.attr({ 
				x: ( parseInt( Math.min( this._startSelection.x, pos.x ) / this.xStep ) * this.xStep ) + this.chart.left,
				width: newWidth
			});
		}
	}
},
stopSelect: function(e){
	e.stop();
	if ( this._startSelection && this._selection ){
		this._selection.remove();
		this._selection = null;
	}

	this._startSelection = null;

	this.fireEvent('selectcancel');
},



markLabel: function( label ){
	if ( this.labelMark ){
		this.labelMark.remove();
	}
	
	if ( label ){
		Array.each( this.points.x, function( point, index ){
			if ( this.options.labels[ index ] == label ){
				var pointWidth  = this.xStep / 2;
				var pointHeight = 5;
				this.labelMark = this.paper.path( [ 
					'M', point, this.chart.bottom, 
					'L', point + pointWidth, this.chart.bottom + pointHeight,
					'H', point - pointWidth,
					'L', point, this.chart.bottom,
					'V', this.chart.top,
					'L', point - pointWidth, this.chart.top - pointHeight,
					'H', point + pointWidth,
					'L', point, this.chart.top 

				] ).attr( this.options.styles.markLabel);
			}
		}, this );
	}
},


});


