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
			var background = this.paper.rect( this.points.x[position], this.chart.top - 10, this.xStep, this.height - 20, 10 ).attr({'fill': '#5050f0', 'fill-opacity': 0.0, 'stroke-width': 0 });
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
			var bar = this.drawBar( value, this.points.x[position], this.chart.bottom, this.points.xLabels[ position ], this.colours[ position ], this.alphaColours[ position ] );
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

