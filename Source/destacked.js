/* 
---

name: SCGDestackedhart

description: SCGDestackedchart Class.  Defines a child class for Destacked Line charts

licence: See licence.txt

authors:
 - Darren Taylor

requires:
 - SCGChart
 - SCGFormatValue
 - SCGFormatAxis
 - SCGLinechart

provides: [SCGLinechart]

...
*/

var SCGDestackedchart = new Class({
Implements: [ Events, Options ],
Extends: SCGLinechart,
options:{
	stacked: 0,
	smooth: true,
	points: false,

	clickable: false,
	tailkeys: false,

	interval: 500,

	periodical: function(){ },
	complete: function(){ },
	translateLabels: function( label ){ return label; },
	styles: {
		markLabel: {
			'stroke': '#0000ff',
			'fill': '#0000ff'
		},
		selection: {
			'fill':'#d0d0ff', 
			'opacity': 0.6
		}
	},
	graphHeight: 80,
	graphSeperator: 30,
	commonScale: false,
	average: false,
},
initialize: function( obj, options ){
	this.parent( obj, options );
	this.element = $(obj);
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
redrawAxis: function(){
	/* remove all elements from our paper */
	this.paper.clear();
	this._labels = null;
	
	/* and redraw the graph */
	this.drawAxis();
	this.drawGrid();
	this.drawPoints();

	if ( this.options.average ){
		this.drawAverage();
	}

	if( this.options.clickable ){
		this.clickableGrid();
	}

	this._lines.each( function( line ){
		line.paper.pointsSet.toFront();		
	});

	this.drawBackground();
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

	this._destacked = [];

	/* a destacked graph *has* to be stacked for it to be destacked */
	var offset = 0;

	this.options.data[0].each( function( first, seriesindex ){
		/* flatten the array down so we have a number of different data series */
		var series = this.options.data.map( function(i){ return i[seriesindex]; } );

		var destackedGraph = {
			position: {
				bottom: this.options.gutter.top + offset + this.options.graphHeight,
				right:  this.options.width - this.options.gutter.right,
				left:   this.options.gutter.left,
				top:    this.options.gutter.top + offset,
				width:  ( this.options.width - ( this.options.gutter.left + this.options.gutter.right )),
				height: this.options.graphHeight
			},
			series: series
		};

		if ( this.options.commonScale ){
			destackedGraph.y = this.getRange( this.options.data, destackedGraph.position );
		} else {
			destackedGraph.y = this.getRange( series, destackedGraph.position );
		}
		destackedGraph.position.zero = destackedGraph.y.zero;

		destackedGraph.axis = this.drawChartAxis( destackedGraph.position, destackedGraph.y );
		this._destacked.push( destackedGraph );

		offset += this.options.graphHeight + this.options.graphSeperator;
	}, this );
},
drawAverage: function()
{
	this._destacked.each( function( chart ){
		var numberOfPoints = 0;
		var total = 0;

		chart.series.each( function(point){
			numberOfPoints++;
			total += point;
		}, this );

		var height = Math.round(( (total/numberOfPoints) / chart.y.scale) * chart.y.step );
		this.paper.path([ 'M', chart.position.left, chart.position.zero - height, 'H', chart.position.right ]).attr( this.options.styles.averageLine);
	}, this );
},
chartLine: function( data, colour ){
	return this.parent( data, colour, this._destacked[ colour ] );
},
drawGrid: function(){
	if ( this.options.grid ){
		if ( this._grid ){
			this._grid.clear();
		} else {
			this._grid = this.paper.set();
		}

		this._destacked.each( function( chart ){
			Array.each( chart.axis.points.x, function( point ){
				this._grid.push( this.paper.path( ['M',point,chart.position.bottom, 'L', point, chart.position.top ] ).attr( this.options.lines.grid ).toBack() );
			}, this );
			Array.each( chart.axis.points.y, function( point ){
				this._grid.push( this.paper.path( ['M',chart.position.left,point, 'L', chart.position.right, point ] ).attr( this.options.lines.grid ).toBack() );
			}, this );

			/* does the grid have a background ? */
			if ( this.options.styles.grid ){
				this._grid.push( this.paper.rect( chart.position.left, chart.position.top, chart.position.width, chart.position.height ).attr({
					'stroke-width': 0,
					'fill':this.options.styles.grid
				}).toBack() );
			}

		}, this );
	}
},
});


