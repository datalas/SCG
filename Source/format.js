/* 
---
description: SCG Formatting functions.  Used to provide formatting for SCG Charts

licence:

Copyright (C) 2012 Darren Taylor  http://datalas.com  

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.  

authors:
 - Darren Taylor

requires:

provides: [SCGFormatValue, SCGFormatAxis, SCGFormat]

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
