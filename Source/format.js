/* 
---

name: SCGFormat

description: SCG Formatting functions.  Used to provide formatting for SCG Charts

licence: See licence.txt

authors:
 - Darren Taylor

requires:

provides: [SCGFormatValue, SCGFormatAxis, SCGFormat]

...
*/

function SCGFormatValue( value, store ){
	value = ( value / store.divisor ).round( 2 );
	return value;
}

function SCGFormatAxis( min, max, label, store ){
	/* The Maximum value and the Minimum value are likely of some   */
	/* order of magnitude, take that order and then produce a scale */
	/* to reduce results by */
	
	var magnitude = Math.max( min * -1, max );

	/* we actually want numbers in sort of hundreds so ... */
	var quantifier;
	var quantifiers = [ '', ' (thousands)', ' (millions)', ' (billions)', ' (trillions)' ];
	var divisor = 1;
	for ( var i = 0; i < quantifiers.length ; i ++ ){
		divisor *= 1000;
		if ( magnitude < divisor ){
			quantifier = quantifiers[i];
			break;
		}
	}

	store.divisor = divisor / 1000;

	return label + quantifier;
}

var SCGFormat = [ SCGFormatValue, SCGFormatAxis ];

function SCGFormatBytesValue( value, store ){
	value = ( value / store.divisor ).round( 2 );
	return value;
}

function SCGFormatBytesAxis( min, max, label, store ){
	/* The Maximum value and the Minimum value are likely of some   */
	/* order of magnitude, take that order and then produce a scale */
	/* to reduce results by */
	
	var magnitude = Math.max( min * -1, max );

	/* we actually want numbers in sort of hundreds so ... */
	var quantifier;
	var quantifiers = [ '', ' (KBytes)', ' (MBytes)', ' (GBytes)', ' (TBytes)', ' (PBytes)' ];
	var divisor = 1;
	for ( var i = 0; i < quantifiers.length ; i ++ ){
		divisor *= 1024;
		if ( magnitude < divisor ){
			quantifier = quantifiers[i];
			break;
		}
	}

	store.divisor = divisor / 1024;

	return label + quantifier;
}

var SCGFormatBytes = [ SCGFormatBytesValue, SCGFormatBytesAxis ];

/* Time differences (in seconds) */

function SCGFormatTimeValue( value, store ){
	var display = "";
	var remainder = value;

	var divisors = [
		{ t: 'y', v: 31536000 }, // Years
		{ t: 'm', v: 2592000 }, // Months (assuming 31 day months)
		{ t: 'w', v: 604800 }, // Weeks
		{ t: 'd', v: 86400 }, // Days
		{ t: 'h', v: 3600 }, // Hours
		{ t: 'm', v: 60 }, // Minutes
	].each( function( d ){
		var p = parseInt( remainder / d.v );
		if ( display != 0 || p > 0 ){
			display += p + d.t;
		}
		remainder = remainder % d.v;
	} );

	return display;
}

function SCGFormatTimeAxis( min, max, label, store ){
	return label;
}

var SCGFormatTime = [ SCGFormatTimeValue, SCGFormatTimeAxis ];

