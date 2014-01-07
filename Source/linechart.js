/* 
---

name: SCGLinechart

description: SCGLinechart Class.  Defines a child class for LineChart charts

licence: See licence.txt

authors:
 - Darren Taylor

requires:
 - SCGChart
 - SCGFormatValue
 - SCGFormatAxis

provides: [SCGLinechart]

...
*/

var SCGLinechart = new Class({
Implements: [ Events, Options ],
Extends: SCGChart,
options:{
	stacked: 0,
	type: 'smooth',  /* can be 'block', 'line' or 'smooth' */
	points: true,

	clickable: false,
	tailkeys: false,

	interval: 500,

	periodical: function(){ },
	complete: function(){ },
	translateLabels: function( label ){ return label; },
	key: false
},
initialize: function( obj, options ){
	this.parent( obj, options );
	this.clickgrid = this.paper.set();

	this.numberOfPoints = this.options.data.length;

	/* line graphs might not be stacked (infact, probably aren't */
	if ( !this.options.stacked && this.stacked ){
		this.multi = true;
		this.stacked = false;
	}

	this.resize( this.options.width, this.options.height );

	this._run = true;

	(function(){
		if ( this._run ){
			this.fireEvent('periodical');
		}
	}).periodical( this.options.interval, this );
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
	this.drawXAxis();
	this.drawPoints();
	this.createKey();

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
	this.drawKey();
},

stop: function(){
	this._run = false;
},
run: function(){
	this._run = true;
},
drawAverage: function(){
	var numberOfPoints = 0;
	var total = 0;

	if ( this.stacked || this.multi ){
		this.options.data.each( function( series ){
			series.each( function( point ){
				numberOfPoints++;
				total += point;
			}, this );
		}, this );
	} else {
		this.options.data.each( function( point ){
			numberOfPoints++;
			total += point;
		}, this );
	}

	var height = Math.round(( (total/numberOfPoints) / this.y.scale) * this.y.step );
	this.averageLine = this.paper.path([ 'M', this.chart.left, this.chart.zero - height, 'H', this.chart.right ]).attr( this.options.styles.averageLine );
	switch( this.options.axisLabelStyle ){
	case 'extreme':
		this.paper.text( this.chart.left - 5, this.chart.zero - height, 'Av' ).attr({'text-anchor': 'end' });
		break;
	};
},
drawPoints: function(){
	this._lines = [];
	if ( this.stacked || this.multi ){
		this.options.key = true;
		/* we need to redraw our lines */
		this.options.data[0].each( function( first_line, column ){
			var lineData = this.options.data.map( function(c){ return c[column]; } );
			var line = this.chartLine( lineData, column );
			this._lines.push( this.drawLine( line, column ) );
//			this.addKey( column );
		}, this );

	} else {
		var line = this.chartLine( this.options.data, 0 );
		this._lines.push( this.drawLine( line, 0 ) );
	}

	/* we want to add some buffers to our borders, this white outs the overflow for the animated graphs */
	this.axis.splice( 0,0, this.paper.rect( 1, 1, this.chart.left, this.height-2 ).attr({'stroke-width': 0,'fill': this.options.styles.background} ).toBack() );
	this.axis.splice( 0,0, this.paper.rect( this.chart.right, 1, this.width-2, this.height-2 ).attr({'stroke-width': 0, 'fill': this.options.styles.background }).toBack() );

	this.axis.toFront();
	if ( this.paperBackground ){
		this.paperBackground.border.toFront();
	}
},
addPoint: function( point, label ){
	/* add the point to our data */
	this.options.data.push( point );
	this.options.labels.push( label );

	/* check whether we need to adjust the scale of our graph */
	if ( this.setRange() ){
		/* The range has changed, so we need to redraw our Axis */
		this.redrawAxis();
	}	

	if ( this.stacked || this.multi ){
		this.options.data[0].each( function( first_line, column ){
			var lineData = this.options.data.map( function(c){ return c[column]; } );
			var line = this.addPointToLine( this._lines[ column ], lineData, column );
			delete lineData;
		}, this );
	} else {
		this.addPointToLine( this._lines[ 0 ], this.options.data, 1 );
	}

	this.tailKeys();

	this.axis.toFront();
	this.options.data.shift();
	this.options.labels.shift();

	if ( this.clickgrid ){
		this.clickgrid.toFront();
	}
},
addPointToLine: function( line, lineData, colour ){
	var newLine = this.chartLine( lineData, 1 );
	this.moveLine( line, newLine, colour ); 

	delete newLine;

	line.paper.linePath.animate( { transform: [ 'T', -this.xStep, 0 ] }, this.options.interval, 'linear', this.complete.bind(this) );
	line.paper.fillPath.animateWith( line.paper.linePath, null, { transform: [ 'T', -this.xStep, 0 ] }, this.options.interval, 'linear' );
	line.paper.pointsSet.animateWith( line.paper.linePath, null,   { transform: [ 'T', -this.xStep, 0 ] }, this.options.interval, 'linear' );

	line.paper.linePath.toFront();
},
drawLine: function( line, colour ){
	line.paper.linePath = this.paper.path( line.linePath ).attr({'stroke': this.colours[colour], 'stroke-width': 2});;
	line.paper.fillPath = this.paper.path( line.fillPath ).attr({'stroke-width': 0, 'fill': this.fillColours[colour], 'fill-opacity': this.fillOpacity[ colour ]});;
	line.paper.points   = [];//this.paper.set();
	line.paper.pointsSet = this.paper.set();
	if ( this.options.points ){
		line.points.each( function( point, index ){
			var circlepoint = this.paper.circle( point.x, point.y, 5 ).attr( { 'stroke-width': 1, 'stroke': this.colours[colour], 'fill': '90-' + this.alphaColours[colour] + '-' + this.colours[colour], 'fill-opacity': 0.4 } ).toFront();
			point.point = circlepoint;

			point.highlight = function(){ 
				if ( this.point ){
					this.point.attr({'fill-opacity': 1}); 
				}
				this.tt = this.obj.createToolTip( this );	
			};
			point.removeHighlight = function(){
				if ( this.point ){
					this.point.attr({'fill-opacity': 0.4});
				}
				this.tt.remove();
			};


			circlepoint.hover( point.highlight.bind( point ), point.removeHighlight.bind( point ) );
			line.paper.points.push( circlepoint );
			line.paper.pointsSet.push( circlepoint );
		}, this );
	}
	return line;
},
moveLine: function( line, lineData, colour ){
	line.paper.linePath.transform( [ 'T', 0, 0 ] );
	line.paper.fillPath.transform( [ 'T', 0, 0 ] );

	line.paper.linePath.attr( { path: lineData.linePath } );
	line.paper.fillPath.attr( { path: lineData.fillPath } );

	if ( this.options.points ){
		line.paper.points.each( function( point, index ){
			point.transform( [ 'T', 0, 0 ] );
			point.attr({ cx: lineData.points[index].x, cy: lineData.points[index].y } );
		}, this );
	}
	return line;
},
chartLine: function( data, colour, chart ){
	var line = {
		linePath: '',
		fillPath: '',
		points: [],
		paper: {}
	};

	var x = this._left;
	var obj = this;

	if ( !chart ){
		chart = {
			y: this.y,
			position: this.chart
		};
	}

	Array.each( data, function( value, position ){
		var height = Math.round((value / chart.y.scale) * chart.y.step );

		var point = {
			obj: obj,
			bottom: chart.position.zero - height + 5,
			value: value,
			middle: x,
			x: x,
			y: chart.position.zero - height,
			label: {
				label: this.options.labels[ position ]
			}
		};

		line.points.push( point );

		x += this.xStep;
	}, this );	

	var path = [];

	/* create a number of functions to handle the line points */
	/* these are different depending upon what type of line   */
	/* drawing mode we are in (options.type) so we can calculate */
	/* them once and not have to worry about making the code */
	/* which determines the point type look complicated */
	var handleFirst;
	var handleLast = function( point ){};
	var handleMid = function( point ){
		path.push( point.x, point.y );
	};
	var xStep = this.xStep;

	switch( this.options.type ){
	case 'smooth':
		handleFirst = function( point ){
			path.push( 'M', point.x, point.y, 'R' );
		};
		break;
	case 'block':
		handleFirst = function( point ){
			path.push( 'M', point.x, point.y );
		};
		handleMid = function( point ){
			path.push( 'H', point.x, 'V', point.y );
		};
		break;
	default:
		handleFirst = function( point ){
			path.push( 'M', point.x, point.y, 'L' );
		};
		break;
	};
				
	line.points.reverse().each( function( point, position ){
		if ( position == 0 ){
			/* first point */
			handleFirst( point );
		} else if ( position == line.points.length ){
			/* last point */
			handleLast( point );
		} else {
			handleMid( point );
		}
	}, this );

	/* create a fill path */
	var fillpath = path.clone();
	fillpath.push( 'V', chart.position.zero, 'H', x, 'V', line.points[0].y, 'Z' );

	line.linePath = path.join(',');
	line.fillPath = fillpath.join(',');
	return line;
},
complete: function(){
	this.fireEvent('complete');
},

resize: function( width, height ){

	/* we wish to resize the chart */
	/* set the new dimensions */
	this.options.width = width;
	this.options.height = height;

	/* resize the paper */
	this.paper.setSize( width, height );
	
	/* reset the dimensions */
	this.setDimensions();

	/* set ranges */
	this.setRange( this.options.x, this.options.y );

	this._left = this.chart.left;

	this.redrawAxis();
},


clickableGrid: function(){
	this.clickgrid.clear();
	Array.each( this.points.x, function( point, index ){
		var segment = this.paper.rect( point, this.chart.top, this.xStep, this.chart.height ).attr({'fill':'#ff00ff', 'opacity': 0}).toFront();
		segment.click( (function(){ 
			this.fireEvent('click', [ this.options.labels[ index ], index ] );
		}).bind(this));

		segment.hover( (function(){
		}).bind(this));
	}, this );
},

tailKeys: function(){
	if ( !this.options.tailkeys ){
		return;
	}

	/* creates / updates keys at the start and end of the X Axis (usually to indicate the passage of time */
	if ( !this._labels ){
		this._labels = {
			start: {
				label: this.paper.text( this.chart.left, this.chart.bottom + 5 ).attr({'fill': '#202020', 'text-anchor': 'start'}),
				pos: 0
			},
			end: {
				label: this.paper.text( this.chart.left, this.chart.bottom + 5 ).attr({'fill': '#202020', 'text-anchor': 'end'}),
				pos: this.options.labels.length - 1
			}
		};

		this.axis.push( this._labels.start.label, this._labels.end.label );
	}	

	/* work out which keys go where */
	this._labels.start.pos = 0;
	this._labels.end.pos = this.options.labels.length - 1;

	/* Firstly, place the key etc */
	[ this._labels.start, this._labels.end ].each( function( label ){
		/* set the label's text to be the correct value */
		/* calculate where it should be */
		var x = this.chart.left + ( label.pos * this.xStep );

		label.label.attr({ 
			text: this.options.translateLabels( this.options.labels[ label.pos ] ),
			x: x
		});
	}, this );
},
calculateXStep: function( chart ){
	return ( chart.width / ( this.numberOfPoints - 1 ));
}
});


