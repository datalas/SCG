/* 

---

name: SCG Barchart

description: SCG Barchart Class.  Defines a child class for BarCharts

licence: See licence.txt

authors:
 - Darren Taylor

requires:
 - SCGChart
 - SCGFormatValue
 - SCGFormatAxis

provides: [SCGBarchart]

...
*/

var SCGBarchart = new Class({
Implements: [ Events, Options ],
Extends: SCGChart,
initialize: function( obj, options ){
	this.parent( obj, options );
	this.element = $(obj);
	this.createPaper();

	this.numberOfPoints = this.options.data.length;

	this.setRange( this.options.x, this.options.y );
	this.createColours();
	this.drawAxis();
	this.drawXAxis();
	this.drawGrid();
	this.drawKey();
	this.drawBars();
},
drawXAxis: function(){
	Array.each( this.options.data, function( valueGroup, position ){
		//var middle = i + ( this.xStep / 2 );
		var x = this.points.x[position] + ( this.xStep / 2 );
		var y = this.chart.bottom;

		if ( this.options.xaxis && this.options.xaxis[position]){
			var label = this.paper.text( x - 5, y, this.options.xaxis[position] ).attr({'text-anchor': 'end', 'fill': this.options.labelcolour } ).rotate( -90, x, y );	
		}
	}, this );
},
drawBar: function( value, x, y, label, colour, alphaColour ){
	var height = Math.round((value / this.y.scale) * this.y.step );

	var y1; 
	var y2;
	var zerooffset = this.chart.bottom - this.chart.zero;
	
	if ( value >= 0 ){
		y1 = y - height - zerooffset;
		y2 = height;
	} else {
		/* negative bar .. */
		y1 = this.chart.zero;	/* start at 0 */
		y2 = -height;
	}
	
	obj = this;
	var bar = {
		'height': height,
		'obj': this,
		'middle': x + (this.xStep / 2 ),
		'bottom': y1 + y2,
		'value': value,
		'bar': this.paper.rect( x, y1, this.xStep, y2 ).attr( { 'stroke-width': 1, 'stroke': colour, 'fill': '90-' + alphaColour + '-' + colour, 'fill-opacity': 0.4 } ),
		'label': label
	};

	var highlight = (function(){ 
				if( this.label ){
					this.label.blob.attr({'fill-opacity': 1 });
					this.label.blob.scale(2,2);
					this.label.text.attr({'font-size': 14});
					this.tt = this.obj.createToolTip( this );	
				}
				this.bar.attr({'fill-opacity': 1}); 
			}).bind( bar );
	var removeHighlight = (function(){
				if( this.label ){
					this.label.blob.attr({'fill-opacity': 0.4 });
					this.label.blob.scale(0.5,0.5);
					this.label.text.attr({'font-size': 12});
					this.tt.remove();
				}
				this.bar.attr({'fill-opacity': 0.4});
			}).bind( bar );
	bar.bar.hover( highlight, removeHighlight );
	if( !this.stacked && bar.label ){
		bar.label.blob.hover( highlight, removeHighlight );
		bar.label.text.hover( highlight, removeHighlight );
	}
	return bar;
},
drawBars: function(){
	this.bars = [];

	if ( this.stacked ){
		Array.each( this.options.data, function( valueGroup, position ){
			var axislabel;
			if ( this.xAxisLabels && this.xAxisLabels[ position ] ){
				axislabel = this.xAxisLabels[position];
			}
			var positiveOffset = this.chart.bottom;
			var negativeOffset = 0;
			var childBars = [];

			Array.each( valueGroup, function( value, set ){
				var bar;
				if ( value >= 0 ){
					bar = this.drawBar( value, this.points.x[position], positiveOffset, this.points.xLabels[ set ], this.colours[ set ], this.alphaColours[ set ] );
					positiveOffset -= bar.height;
				} else {
					bar = this.drawBar( value, this.points.x[position], negativeOffset, this.points.xLabels[ set ], this.colours[ set ], this.alphaColours[ set ] );
					negativeOffset += bar.height;
				}

				childBars.push( bar );
			}, this );
			childBars.reverse().each( function( bar ){
				bar.bar.toFront();
			}, this );
			this.bars.push( childBars );	
		}, this );


	} else {
		Array.each( this.options.data, function( value, position ){
			var colour = position;
			if ( this.options.persistantColour ){
				colour = 0;
			}
			var bar = this.drawBar( value, this.points.x[position], this.chart.bottom, this.points.xLabels[ position ], this.colours[ colour ], this.alphaColours[ colour ] );
			this.bars.push( bar );	
		}, this );
	}

	this.bars.reverse().each( function( bar ){
		if ( typeOf( bar ) == "array" ){
			bar.each( function( barPart ){
				barPart.bar.toFront();
			}, this );
		} else {
			bar.bar.toFront();
		}
	}, this );

	this.grid.xAxis.toFront();
	this.grid.yAxis.toFront();
}
});

