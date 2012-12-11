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
options:{
	stacked: 0,
},
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

	this.setRange( this.options.x, this.options.y );
	this.createColours();
	this.drawAxis();
	this.drawGrid();
	this.drawPoints();
},
drawPoints: function(){
	if ( this.stacked || this.multi ){
		this.options.key = true;
		/* we need to redraw our lines */
		this.options.data[0].each( function( first_line, column ){
			var lineData = this.options.data.map( function(c){ return c[column]; } );
			this.drawLine( lineData, column );
			this.addKey( column );
		}, this );

	} else {
		this.drawLine( this.options.data, 0 );
	}
},
drawLine: function( data, colour ){
	this.linepoints = [];

	var x = this.chart.left;
	var step = this.chart.width / (this.options.data.length - 1); 

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
		point.point = this.paper.circle( x, this.chart.zero - height, 5 ).attr( { 'stroke-width': 1, 'stroke': this.colours[colour], 'fill': '90-' + this.alphaColours[colour] + '-' + this.colours[colour], 'fill-opacity': 0.4 } );
		point.point.hover( highlight, removeHighlight );

		x += step;
		this.linepoints.push( point );	
	}, this );	

	var path = [];

	this.linepoints.reverse().each( function( point, position ){
		if ( position == 0 ){
			/* first point */
			path.push( 'M', point.x, point.y, 'R' );
		} else if ( position == this.linepoints.length ){
			/* last point */
		} else {
			var previous = this.linepoints[ position - 1 ];
			path.push( point.x, point.y );
		}
	}, this );

	/* create a fill path */
	var fillpath = path.clone();
	fillpath.push( 'V', this.chart.zero, 'L', this.chart.right, this.chart.zero, 'L', this.linepoints[0].x, this.linepoints[0].y, 'Z' );
	this.fill = this.paper.path( fillpath ).attr({'stroke': 0, 'fill': this.colours[colour], 'fill-opacity': 0.3});
	this.line = this.paper.path( path ).attr({'stroke': this.colours[colour], 'stroke-width': 2 });

	this.linepoints.reverse().each( function( point, position ){
		if ( point.point ){
			point.point.toFront();
		}
	}, this );


	this.grid.xAxis.toFront();
	this.grid.yAxis.toFront();
}
});


