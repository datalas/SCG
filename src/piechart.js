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

var SCGPiechart = new Class({
Implements: [ Events, Options ],
Extends: SCGChart,
initialize: function( obj, options ){
	this.parent( obj, options);
	this.element = $(obj);

	this.createPaper();
	this.createColours();

	this.drawPie();
},
drawPie: function(){
	var total = 0;
	this.options.data.each( function( slice ){ total += parseFloat(slice) }, this );
	
	var starting_angle = 0;
	
	var radius = parseInt( Math.min(  (this.height - this.options.gutter.top - this.options.gutter.bottom ), (this.width - this.options.gutter.left - this.options.gutter.right ) ) / 2 );

	var cx = this.options.gutter.left + radius;
	var cy = this.options.gutter.top + radius;

	this.shader = this.paper.circle( cx, cy, radius - 1 ).attr({ fill: 'r(0.5,0.5)rgba(255,255,255,1)-rgba(0,0,0,.3)' });

	/* so, this will be X pixels high, ergo we need to start it at the mid point */
	var keyHeight = this.options.data.length * 20;
	this.labelY = cy - ( keyHeight / 2 ) + 10;
	this.labelX = cx + radius + 50;
	var keyWidth = 0;
	
	this.options.data.each( function( slice, index ){ 
		var angle = 360 * ( slice / total );
		var sector = this.sector( cx, cy, radius, starting_angle, starting_angle + angle, { 'fill': this.colours[ index ], 'opacity': 0.6, 'stroke': '#ffffff' } );
		var key = this.addKey( index );
		var ms = 500;
		var percentage = parseInt((slice/total) * 100) + '%';
		
		var highlight = function(){
			sector.stop().animate({transform: "s1.1 1.1 " + cx + " " + cy}, ms, "elastic");
			sector.attr({'opacity': 1 });
			key.blob.attr({'fill-opacity': 1 });
			key.blob.scale(2,2);
			key.text.attr({'font-size': 14});
			sector._percent = this.paper.text( sector.center.x, sector.center.y, percentage ).attr({'fill': '#ffffff', 'font-size': 30});
		};
		var removeHighlight = function(){
			sector.stop().animate({transform: ""}, ms, "elastic");
			sector.attr({'opacity': 0.6 });
			key.blob.attr({'fill-opacity': 0.4 });
			key.blob.scale(0.5,0.5);
			key.text.attr({'font-size': 12});
			sector._percent.remove();
		};
		sector.hover( highlight, removeHighlight );
		key.blob.hover( highlight, removeHighlight );
		key.text.hover( highlight, removeHighlight );
		keyWidth = Math.max( keyWidth, key.width );
		starting_angle += angle;
	}, this );
},
sector: function(cx, cy, r, startAngle, endAngle, params ) {
	var rad = Math.PI / 180;
	var midAngle = startAngle + ( (endAngle-startAngle)/2 );

	var x1 = cx + r * Math.cos(-startAngle * rad),
	x2 = cx + r * Math.cos(-endAngle * rad),
	y1 = cy + r * Math.sin(-startAngle * rad),
	y2 = cy + r * Math.sin(-endAngle * rad),
	xCen = cx + (r/2) * Math.cos(-midAngle * rad),
	yCen = cy + (r/2) * Math.sin(-midAngle * rad);

	var sector = this.paper.path(["M", cx, cy, "L", x1, y1, "A", r, r, 0, +(endAngle - startAngle > 180), 0, x2, y2, "z"]).attr(params);
	sector.center = {
		x: xCen,
		y: yCen
	};
	return sector;
}

});

