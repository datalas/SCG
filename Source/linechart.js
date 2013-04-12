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
	smooth: true,
	points: true,

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
	}
},
initialize: function( obj, options ){
	this.parent( obj, options );
	this.element = $(obj);
	this.createPaper();
	this.clickgrid = this.paper.set();

	this.numberOfPoints = this.options.data.length;
	this.options.key = false;

	/* line graphs might not be stacked (infact, probably aren't */
	if ( !this.options.stacked && this.stacked ){
		this.multi = true;
		this.stacked = false;
	}

	this.createColours();

	this.resize( this.options.width, this.options.height );

	this._run = true;

	(function(){
		if ( this._run ){
			this.fireEvent('periodical');
		}
	}).periodical( this.options.interval, this );

	if( 1 || this.options.selectable ){
		this.element.addEvent('mousedown', this.startSelect.bind( this ) );
		this.element.addEvent('mouseleave', this.stopSelect.bind( this ) );
		this.element.addEvent('mouseup', this.endSelect.bind(this) );
		this.element.addEvent('mousemove', this.moveSelect.bind(this) );
	}
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
	this.averageLine = this.paper.path([ 'M', this.chart.left, this.chart.zero - height, 'H', this.chart.right ]).attr({'stroke': '#ff6600'});
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
			this.addKey( column );
		}, this );

	} else {
		var line = this.chartLine( this.options.data, 0 );
		this._lines.push( this.drawLine( line, 0 ) );
	}

	/* we want to add some buffers to our borders */
	this.axis.splice( 0,0, this.paper.rect( 0, 0, this.chart.left, this.height ).attr({'stroke-width': 0,'fill':'#ffffff'}).toBack() );
	this.axis.splice( 0,0, this.paper.rect( this.chart.right, 0, this.width, this.height ).attr({'stroke-width': 0, 'fill':'#ffffff'}).toBack() );


	this.axis.toFront();
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

	line.paper.linePath.animate( { transform: [ 'T', -this._step, 0 ] }, this.options.interval, 'linear', this.complete.bind(this) );
	line.paper.fillPath.animateWith( line.paper.linePath, null, { transform: [ 'T', -this._step, 0 ] }, this.options.interval, 'linear' );
	line.paper.pointsSet.animateWith( line.paper.linePath, null,   { transform: [ 'T', -this._step, 0 ] }, this.options.interval, 'linear' );

	line.paper.linePath.toFront();
},
drawLine: function( line, colour ){
	line.paper.linePath = this.paper.path( line.linePath ).attr({'stroke': this.colours[colour], 'stroke-width': 2});;
	line.paper.fillPath = this.paper.path( line.fillPath ).attr({'stroke-width': 0, 'fill': this.colours[colour], 'fill-opacity': 0.3});;
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
chartLine: function( data, colour ){
	var line = {
		linePath: '',
		fillPath: '',
		points: [],
		paper: {}
	};

	var x = this._left;
	var obj = this;

	Array.each( data, function( value, position ){
		var height = Math.round((value / this.y.scale) * this.y.step );

		var point = {
			obj: obj,
			bottom: this.chart.zero - height + 5,
			value: value,
			middle: x,
			x: x,
			y: this.chart.zero - height,
			label: {
				label: this.options.labels[ position ]
			}
		};

		line.points.push( point );

		x += this._step;
	}, this );	

	var path = [];

	line.points.reverse().each( function( point, position ){
		if ( position == 0 ){
			/* first point */
			if ( this.options.smooth ){
				path.push( 'M', point.x, point.y, 'R' );
			} else {
				path.push( 'M', point.x, point.y, 'L' );
			}
		} else if ( position == line.points.length ){
			/* last point */
		} else {
			var previous = line.points[ position - 1 ];
			path.push( point.x, point.y );
		}
	}, this );

	/* create a fill path */
	var fillpath = path.clone();
	fillpath.push( 'V', this.chart.zero, 'H', x, 'V', line.points[0].y, 'Z' );

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

	this._step = this.chart.width / (this.numberOfPoints - 1); 
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

	this.fireEvent('selectend', [
		{
			start: startPosition,
			stop:  endPosition,
			startLabel: this.options.labels[ parseInt( startPosition / this.xStep ) ],
			endLabel: this.options.labels[ parseInt( endPosition / this.xStep ) ]
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
			this._selection.attr({ 
				x: (Math.min( this._startSelection.x, pos.x )) + this.chart.left,
				width: Math.max( 
					pos.x - this._startSelection.x,
					this._startSelection.x - pos.x,
					0.1
				)
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
}




});


