/* 
---

name: SCGTreeMap

description: SCGTreeMap Class - Defines a child class for Squarified TreeMaps

licence: See licence.txt

authors:
 - Darren Taylor

requires:
 - SCGChart
 - SCGFormatValue
 - SCGFormatAxis

provides: [SCGTreeMap]

...
*/

var SCGTreeMap = new Class({
Implements: [ Events, Options ],
Extends: SCGChart,
initialize: function( obj, options ){
	this.parent( obj, options);

	this.draw();
},
/* Draw function, resolves data and draws the resulting treemap */
draw: function(){
	var boxes = this._squarify( 
		this._consolidateTuples( this.options.data, this.options.height * this.options.width ),
		[], 
		new SCGTreeMapNode( { x: 0, y: 0, width: this.options.width, height: this.options.height } ),
		[]
	);

	boxes.map( function( box, i ){
		var c = box.getCoordinates();
		this.paper.rect( c.x, c.y, c.width, c.height, 0 ).attr({'stroke': '#000000', fill: this.colours[i] });
	}, this );
},
_consolidateTuples: function( data, area ){
	var sum = data.sum();
	return data.map( function( point, pointIndex ){ 
		return {
			value: point * ( area / sum ),
			label: this.options.labels[ pointIndex ]
		}; 
	}, this).sort( function( a,b ){
		return b.value - a.value;
	});
},
_squarify: function( data, row, box, stack ){

	if ( data.length === 0 ){
		/* we have no children or anything to add to this box */
		/* so we don't need to add anything to it */
		stack.push( box );
		return;
	}

	/* check for the shortest edge of the box */
	var remainingLength = box.shortest();
	/* can we improve the apsect ratio of the box ? */
	if ( this._improveRatio( row, data[ 0 ].value, remainingLength ) ){
		/* squarifying the results will improve the aspect ratio */
		row.push( data[ 0 ].value );
		this._squarify( data.slice(1), row, box, stack );
	} else {
		/* we can't, so we should start putting thins inside */
		var newBox = box.remainingArea( row.sum() );
		stack.push( box );
		this._squarify( data, [], newBox, stack );
	}
	return stack;
},
_improveRatio: function( currentrow, nextnode, length ) {
	var newrow; 

	if (currentrow.length === 0) {
		return true;
	}

	newrow = currentrow.slice();
	newrow.push(nextnode);
            
	var currentratio = this._getRatio(currentrow, length);
	var newratio = this._getRatio(newrow, length);
            
	// the pseudocode in the Bruls paper has the direction of the comparison
	// wrong, this is the correct one.
	return currentratio >= newratio; 
},
_getRatio: function( row, length ){
	var min = Math.min.apply(Math, row);
	var max = Math.max.apply(Math, row);
	var sum = row.sum();
	return Math.max(Math.pow(length, 2) * max / Math.pow(sum, 2), Math.pow(sum, 2) / (Math.pow(length, 2) * min));
},

});

var SCGTreeMapNode = new Class({
	Implements: [ Events, Options ],
	options: {
		height: 0,
		width: 0,
		x: 0,
		y: 0
	},
	_areaWidth: 0,
	_areaHeight: 0,
	initialize: function( options ){
		this.setOptions( options );
	},
	shortest: function(){
		return Math.min( this.options.height, this.options.width );
	},
	remainingArea: function( area, newNode ){
		var areaWidth = this.options.width;
		var areaHeight = this.options.height;
		var xOffset = 0;this.options.x;
		var yOffset = 0;this.options.y;

		if ( this.options.width >= this.options.height ){
			areaWidth = area / this.options.height;
			xOffset = /*this.options.x +*/ areaWidth;
			areaWidth = this.options.width - areaWidth;
			this._areaWidth = areaWidth;
		} else {
			areaHeight = area / this.options.width;
			yOffset = /*this.options.y +*/ areaHeight;
			areaHeight = this.options.height - areaHeight;
			this._areaHeight = areaHeight;
		}

		return new SCGTreeMapNode( { 
			x: this.options.x + xOffset,
			y: this.options.y + yOffset,
			width: areaWidth,
			height: areaHeight
		} );
	},
	getCoordinates: function(){
		return {
			x: this.options.x,
			y: this.options.y,
			width: this.options.width - this._areaWidth,
			height: this.options.height - this._areaHeight,
		};
	},
});


