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

var SCGLinechart = new Class({
Implements: [ Events, Options ],
Extends: SCGChart,
initialize: function( obj, options ){
	this.parent( obj, options );
	this.element = $(obj);
	this.createPaper();

	this.numberOfPoints = Math.min( this.options.data.length - 1, 100 );
	this.options.key = false;

	/* line graphs might not be stacked (infact, probably aren't */
	if ( !this.options.stacked && this.stacked ){
		this.multi = true;
		this.stacked = false;
	}

	this._dataLength = this.options.data.length
	this._step = this.chart.width / (this._dataLength - 1); 
	this._left = this.chart.left;

	this.setRange( this.options.x, this.options.y );
	this.createColours();
	this.drawAxis();
	this.drawGrid();
	this.drawPoints();

	if ( this.options.average ){
		this.drawAverage();
	}
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
			this._lines.push( this.drawLine( lineData, column ) );
			this.addKey( column );
		}, this );

	} else {
		this._lines.push( this.drawLine( this.options.data, 0 ) );
	}
},
addPoint: function( point ){
	this.options.data.push( point );

	console.log( this._lines );

	var oldLine = this._lines.shift();
	oldLine.paper.linePath.remove();
	var newLine = this.chartLine( this.options.data, 1 );
	this._lines.push( newLine );

	console.log( newLine );

//	this._lines[ 0 ].paper.linePath.animate({ path: newLine.linePath }, 1000 );
	newLine.paper.linePath = this.paper.path( newLine.linePath );
	newLine.paper.linePath.animate( { transform: [ 'T', -this._step, 0 ] }, 1000 );
	this.options.data.shift();


},
drawLine: function( data, colour ){
	var line = this.chartLine( data, colour );
	line.paper.linePath = this.paper.path( line.linePath );
	return line;
},
chartLine: function( data, colour ){
	var linepoints = [];
	var line = {
		linePath: '',
		fillPath: '',
		points: [],
		paper: {}
	};

	var x = this._left;

	Array.each( data, function( value, position ){
		var height = Math.round((value / this.y.scale) * this.y.step );

		obj = this;
		var point = {
			obj: this,
			bottom: this.chart.zero - height + 5,
			value: value,
			middle: x,
			x: x,
			y: this.chart.zero - height,
			label: {
				label: this.options.labels[ position ]
			}
		};

		var highlight = (function(){ 
					if ( this.point ){
						this.point.attr({'fill-opacity': 1}); 
					}
					this.tt = this.obj.createToolTip( this );	
				}).bind( point );
		var removeHighlight = (function(){
					if ( this.point ){
						this.point.attr({'fill-opacity': 0.4});
					}
					this.tt.remove();
				}).bind( point );
//		point.point = this.paper.circle( x, this.chart.zero - height, 5 ).attr( { 'stroke-width': 1, 'stroke': this.colours[colour], 'fill': '90-' + this.alphaColours[colour] + '-' + this.colours[colour], 'fill-opacity': 0.4 } );
//		point.point.hover( highlight, removeHighlight );
//		line.push( point.point );
		x += this._step;
		linepoints.push( point );	
	}, this );	

	var path = [];

	linepoints.reverse().each( function( point, position ){
		if ( position == 0 ){
			/* first point */
			path.push( 'M', point.x, point.y, 'R' );
		} else if ( position == linepoints.length ){
			/* last point */
		} else {
			var previous = linepoints[ position - 1 ];
			path.push( point.x, point.y );
		}
	}, this );

	/* create a fill path */
//	var fillpath = path.clone();
//	fillpath.push( 'V', this.chart.zero, 'L', this.chart.right, this.chart.zero, 'L', linepoints[0].x, linepoints[0].y, 'Z' );
//	var fill = this.paper.path( fillpath ).attr({'stroke': 0, 'fill': this.colours[colour], 'fill-opacity': 0.3});
//	var hline = this.paper.path( path ).attr({'stroke': this.colours[colour], 'stroke-width': 2 });
//	line.push( fill );
//	line.push( hline );

//	linepoints.reverse().each( function( point, position ){
//		if ( point.point ){
//			point.point.toFront();
//		}
//	}, this );
//
//
//	this.grid.xAxis.toFront();
//	this.grid.yAxis.toFront();
//	return line;

	line.linePath = path;
	return line;
}
});


