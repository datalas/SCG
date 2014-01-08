/* 
---

name: axisline.js


licence: See licence.txt

authors:
 - Darren Taylor

requires:

provides: [SCGAxisLine]

...
*/

var SCGAxisLine = new Class({
Implements: [ Events, Options ],
Extends: SCGLinechart,
options:{
	key: false,
	stacked: false
},
/* Standard constructor-a-like */
initialize: function( obj, options ){
	this.parent( obj, options );

	this.createKey();
	this.drawKey();
},
keySize: function(){
	return this.options.gutter.left;
},
drawKey: function(){
	if ( this._keySet ){
		this._keySet.show();
		this._keySet.toFront();
	}
},
addKey: function( label ){
	/* we need to create a line to denote where to place this line */
	var key = {
		sample: this.paper.set()
	};

	var sampleWidth = 30;
	var sampleHeight = 24;

	/* work out the position of the *next* line */
	var nextLength = this._keys.length + 1;

	if ( nextLength % 2 ){
		key.linePosition = (parseInt( nextLength / 2 ) * -5) + this.options.gutter.left - 5;
	} else {
		key.linePosition = (parseInt( ( nextLength - 1 ) / 2 ) * 5 ) + ( this.options.width - this.options.gutter.right ) + 5;
	}

	/* now we need to create a cute ? little sample graph with the appropriate colours */
	key.sample.push( this.paper.rect( 0, 0, sampleWidth, sampleHeight ).attr( {
		'stroke-width': 0,
		'fill': '#ffffff'
	} ) );

	/* make a little sample liney thingy */
	var path = [ 'M', 0, sampleHeight ];

	for ( var i = 5; i <= sampleWidth ; i += 5 ){
		path.push( 'V', Math.floor( Math.random() * sampleHeight ) );
		path.push( 'H', i );
	}

	path.push( 'V', sampleHeight );

	key.sample.push( this.paper.path( path ).attr({ 
		'stroke': this.colours[ label ] 
	}) );

	path.push( 'Z' );
	key.sample.push( this.paper.path( path ).attr({ 
		'stroke-width': 0,
		'fill': this.fillColours[ label ],
		'fill-opacity': this.fillOpacity[ label ]
	}) );


	key.sample.push( this.paper.rect( 0, 0, sampleWidth, sampleHeight ).attr( {
		'stroke': '#505050',
		'stroke-width': 1,
		'stroke-opacity': 1
	} )).toFront();


	/* Now a nice shiny label */
	key.sample.push( this.paper.text( sampleWidth + 20, parseInt( sampleHeight / 2 ), this.options.labels[ label ] ) );

	/* if we have a previous sample, move to the left of it */
	var position = this.options.width - this.options.gutter.right;

	if ( this._keys.length > 0 ){
		position = this._keys[ this._keys.length - 1 ].sample.getBBox().x;
	}

	/* store our new key */
	this._keys.push( key );
	key.sample.forEach( (function(k){ this._keySet.push( k ); }).bind(this) );
	this._keySet.push( key.axisLine );

	key.sample.transform( [ 'T', position - (key.sample.getBBox().width + 15), 10 ] );
},
redraw: function(){
	/* check whether we need to adjust the scale of our graph */
	if ( this.setRange() ){
		/* The range has changed, so we need to redraw our Axis */
		this.redrawAxis();
	}	

	if ( this.stacked || this.multi ){
		this.options.data[0].each( function( first_line, column ){
			var lineData = this.options.data.map( function(c){ return c[column]; } );
			var newLine = this.chartLine( lineData, 1 );
			this.moveLine( this._lines[ column ], newLine, column ); 
			delete lineData;
		}, this );
	} else {
		var newLine = this.chartLine( this.options.data, 1 );
		this.moveLine( this._lines[ 0 ], newLine, colomn ); 
	}

	this.tailKeys();
	this.drawBackground();
},
chartLine: function( data, colour ){
	return this.parent( data, colour, this._allAxis[ colour ] );
},
drawAxis: function(){

	if ( this.axis ){
		this.axis.remove();
		delete this.axis;
	}

	this.axis = this.paper.set();

	this.points = {
		x: [],
		y: [],
		xLabels: [],
		yLabels: [],
	};

	/* Set the labelX and labelY points, these are where the key will appear */
	this.labelY = this.chart.top;
	this.labelX = this.width - this.options.gutter.right + 30;

	this._allAxis = [];

	/* draw the X axis */
	this.xStep = this.calculateXStep( this.chart );

	var label = 0;

	for ( var i = this.chart.left; i < this.chart.width + this.chart.left; i += this.xStep ){
		this.axis.push( this.paper.path( ['M', i, this.chart.bottom, 'L', i, this.chart.bottom + 5 ] ).attr(this.options.lines.grid ) ); 
		this.points.x.push( i );
	}

	this.options.data[0].each( function( first, seriesindex ){
		/* flatten the array down so we have a number of different data series */
		var series = this.options.data.map( function(i){ return i[seriesindex]; } );

		/* work out the position of the *next* line */
		var nextLength = seriesindex + 1;
		var linePosition = 0;

		if ( nextLength % 2 ){
			linePosition = (parseInt( nextLength / 2 ) * -5) + this.options.gutter.left - ( seriesindex * 20 ) - 5;
		} else {
			linePosition = (parseInt( ( nextLength - 1 ) / 2 ) * 5 ) + ( this.options.width - this.options.gutter.right ) + ( (seriesindex - 1) * 20 ) + 5;
		}

		var axisLabel = {
			position: {
				bottom: this.options.height - this.options.gutter.bottom,
				right:  this.options.width - this.options.gutter.right,
				left:   this.options.gutter.left,
				labelPosition: linePosition,
				linePosition: seriesindex % 2 ? 'left' : 'right',
				labelColour: { 'stroke' : this.colours[ seriesindex ] },
				top:    this.options.gutter.top,
				width:  ( this.options.width - ( this.options.gutter.left + this.options.gutter.right )),
				height: this.options.height - this.options.gutter.top - this.options.gutter.bottom,
			},
			series: series
		};

		if ( this.options.commonScale ){
			axisLabel.y = this.getRange( this.options.data, axisLabel.position );
		} else {
			axisLabel.y = this.getRange( series, axisLabel.position );
		}
		axisLabel.position.zero = axisLabel.y.zero;

		axisLabel.axis = this.drawChartAxis( axisLabel.position, axisLabel.y );
		this._allAxis.push( axisLabel );

	}, this );
}

});
