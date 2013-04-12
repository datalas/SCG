SCG - Scheming Cow Graphs
===========

Graphing Library using MooTools and Raphael.

Provides Line, Pie, Bar, Stacked Bar and Weird and wonderful variations of charts.

![Screenshot](http://www.datalas.com/images/scg.png)

Note:

The SCG graphs require MooTools, MooTools-more (probably) and Raphaeljs to be loaded
before the SCG libraries are.

MooTools - www.mootools.net    v1.4.5 or Higher
RaphaelJS - www.raphaeljs.com  v2.1.0 or Higher


How to use
-------

SCGCharts are designed to be very lightweight to include in a HTML page, once the 
source files are included a chart can be added to a HTML div element very simply

	<div id='test1'></div>

	... later

	<script type='text/javascript'>
	window.addEvent( 'domready', function(){
		new SCGBarchart( 'test1', {
			yaxis: 'thingies',
			data: [ 
				10, 
				20, 
				30, 
				14, 
				19, 
				47, 
				139, 
				233, 
				123 
			],
			labels: [ 
				'label1', 
				'label2', 
				'label3', 
				'label4', 
				'label5', 
				'label6', 
				'label7', 
				'label8', 
				'label9' 
			]
		});
	});
	</script>

And that's it.

Other types include subtle variations, please check the samples for more information.


-------

Copyright (C) 2012 Darren Taylor ([http://www.datalas.com/](http://www.datalas.com/))

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
