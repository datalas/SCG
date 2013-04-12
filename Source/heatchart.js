/* 
---

name: SCGHeatchart

description: SCGHeatchart Class.  Defines a child class for HeatCharts

licence: See licence.txt

authors:
 - Darren Taylor

requires:
 - SCGChart
 - SCGFormatValue
 - SCGFormatAxis

provides: [SCGHeatchart]

...
*/

var SCGHeatchart = new Class({
Implements: [ Events, Options ],
Extends: SCGChart,
initialize: function( obj, options ){
	this.parent( obj, options );
	this.element = $(obj);
	this.createPaper();

	this.options.key = false;

	this.setRange();
	this.drawHeatGrid();
},
drawHeatGrid: function(){
	/* The heat grid is simple, it's a line consisting of rectangles of the size of data points */
	var lines = this.options.data[0].length;

	var pointWidth = parseInt( this.chart.width / this.options.data.length );
	var lineHeight = this.chart.height / lines;

	var max = 0;
	this.options.data.each( function( child ){
		max = Math.max( Array.max( child ), max );
	}, this );
	this.max = max;
	
	var topGraph = this.chart.top - 5;
	var topScale = (this.options.gutter.top - 10) / max;

	if ( this.stacked ){
		/* we do need to determine how many lines we have */
		var colours = [];
		var paths   = [];
		for ( var i = 0; i < lines; i++ ){
			colours[ i ] = [];
			paths[ i ] = [ 'M', this.chart.left, this.chart.top, 'R' ];
		}

		this.options.data.each( function( datapoint, pointNumber ){
			Array.each( datapoint, function( line, lineNumber ){
				var colour = this.getColour( line );
				var fillcolour = colour;
				if ( colours[ lineNumber ] && colours[ lineNumber ][ pointNumber - 1 ] ){
					fillcolour = '0-' + colours[ lineNumber ][ pointNumber - 1 ] + '-' + colour;
				}
				this.paper.rect( this.chart.left + ( pointWidth * pointNumber ), this.chart.top + ( lineNumber * lineHeight ), pointWidth, lineHeight ).attr({'stroke': '#000000', 'stroke-width': 0, 'fill': fillcolour} );
				this.paper.rect( this.chart.left + ( pointWidth * pointNumber ), this.chart.top + ( lineNumber * lineHeight ), pointWidth, lineHeight ).attr({'stroke': '#000000', 'stroke-width': 1, opacity: 0.1} );
				colours[ lineNumber ].push( colour );
				paths[lineNumber].push( this.chart.left + ( pointWidth * (pointNumber+1) ), topGraph - (line * topScale ) );
			}, this );
		}, this );

		for ( var i = 0; i < lines; i++ ){
			var line = this.paper.rect( this.chart.left, this.chart.top + ( i * lineHeight ), ( this.options.data.length) * pointWidth, lineHeight ).attr({'stroke-width': 0, 'fill': '#000000', 'opacity': 0});
			this.paper.text( this.chart.left - 10, this.chart.top + ( i * lineHeight ) + ( lineHeight / 2 ), this.options.labels[ i ] ).attr({'text-anchor': 'end', 'font-size': 14});
			line.path = this.paper.path( paths[ i ] ).attr({'stroke': '#000020', 'opacity': 0.3});
			line.hover( function(){
					this.path.attr({'opacity': 1, 'stroke': '#5050ff', 'stroke-width': 2});
				}, function(){
					this.path.attr({'opacity': 0.2, 'stroke': '#000000', 'stroke-width': 1});
				} );
		}
			
		for ( var i = 1; i <= this.options.data.length; i++ ){
			if ( i % parseInt( this.options.data.length / this.options.ypoints ) == 0 ){
				this.paper.text( this.chart.left + ( i * pointWidth ), this.chart.bottom + 10, i ).attr({'font-size': 14, 'opacity' : 0.3});
				this.paper.path( [ 'M', this.chart.left + ( i * pointWidth ), this.chart.bottom, 'V', this.chart.top ] ).attr({'stroke-width': 1, 'stroke': '#000000', 'opacity': 0.6});
				this.paper.text( this.chart.left + ( i * pointWidth ), 10, i ).attr({'font-size': 14, 'opacity': 0.3});
				this.paper.path( [ 'M', this.chart.left + ( i * pointWidth ), 5, 'V', this.chart.top - 5, ] ).attr({'stroke-width': 1, 'stroke': '#000000', 'opacity': 0.1});
			}
		}
	}
}
});

