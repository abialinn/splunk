var jsdom = require('jsdom'),
    __script_basepath = "file:///" + __dirname + "/httpdocs/static/js/",
    __font_basepath = "file:///" + __dirname + "/";

PDFDocument = require('pdfkit');
fs = require('fs');

function createChartingWindow(scriptBasepath, callback) {
    jsdom.env({
        html: "<html><head></head><body><div id='container'></div></body></html>",
        src: [
            fs.readFileSync(scriptBasepath + "contrib/jquery-1.6.2.min.js").toString(),
            fs.readFileSync(scriptBasepath + "contrib/json2.js").toString(),
            fs.readFileSync(scriptBasepath + "contrib/lowpro_for_jquery.js").toString(),
            fs.readFileSync(scriptBasepath + "i18n.js").toString(),
            fs.readFileSync(scriptBasepath + "splunk.js").toString(),
            fs.readFileSync(scriptBasepath + "util.js").toString(),
            fs.readFileSync(__dirname + "/svg_prep.js").toString(),
            fs.readFileSync(scriptBasepath + "contrib/highcharts.js").toString(),
            fs.readFileSync(scriptBasepath + "contrib/exporting.js").toString(),
            fs.readFileSync(scriptBasepath + "js_charting.js").toString()
        ],
        done: function(err, window) {
            if(err) {
                callback(err, null);
                return;
            }

            // Hard-code locale data for en_US
            window._i18n_locale={"date_formats": {"medium": {"pattern": "MMM d, yyyy", "format": "%(MMM)s %(d)s, %(yyyy)s"}, "full": {"pattern": "EEEE, MMMM d, yyyy", "format": "%(EEEE)s, %(MMMM)s %(d)s, %(yyyy)s"}, "long": {"pattern": "MMMM d, yyyy", "format": "%(MMMM)s %(d)s, %(yyyy)s"}, "short": {"pattern": "M/d/yy", "format": "%(M)s/%(d)s/%(yy)s"}}, "scientific_format": "#E0", "exp_symbol": "E", "eras": {"wide": {"0": "Before Christ", "1": "Anno Domini"}, "abbreviated": {"0": "BC", "1": "AD"}, "narrow": {"0": "B", "1": "A"}}, "decimal_symbol": ".", "months": {"stand-alone": {"wide": {"1": "January", "2": "February", "3": "March", "4": "April", "5": "May", "6": "June", "7": "July", "8": "August", "9": "September", "10": "October", "11": "November", "12": "December"}, "abbreviated": {"1": "January", "2": "February", "3": "March", "4": "April", "5": "May", "6": "June", "7": "July", "8": "August", "9": "September", "10": "October", "11": "November", "12": "December"}, "narrow": {"1": "J", "2": "F", "3": "M", "4": "A", "5": "M", "6": "J", "7": "J", "8": "A", "9": "S", "10": "O", "11": "N", "12": "D"}}, "format": {"wide": {"1": "January", "2": "February", "3": "March", "4": "April", "5": "May", "6": "June", "7": "July", "8": "August", "9": "September", "10": "October", "11": "November", "12": "December"}, "abbreviated": {"1": "Jan", "2": "Feb", "3": "Mar", "4": "Apr", "5": "May", "6": "Jun", "7": "Jul", "8": "Aug", "9": "Sep", "10": "Oct", "11": "Nov", "12": "Dec"}, "narrow": {"1": "J", "2": "F", "3": "M", "4": "A", "5": "M", "6": "J", "7": "J", "8": "A", "9": "S", "10": "O", "11": "N", "12": "D"}}}, "group_symbol": ",", "days": {"stand-alone": {"wide": {"0": "Monday", "1": "Tuesday", "2": "Wednesday", "3": "Thursday", "4": "Friday", "5": "Saturday", "6": "Sunday"}, "abbreviated": {"0": "Monday", "1": "Tuesday", "2": "Wednesday", "3": "Thursday", "4": "Friday", "5": "Saturday", "6": "Sunday"}, "narrow": {"0": "M", "1": "T", "2": "W", "3": "T", "4": "F", "5": "S", "6": "S"}}, "format": {"wide": {"0": "Monday", "1": "Tuesday", "2": "Wednesday", "3": "Thursday", "4": "Friday", "5": "Saturday", "6": "Sunday"}, "abbreviated": {"0": "Mon", "1": "Tue", "2": "Wed", "3": "Thu", "4": "Fri", "5": "Sat", "6": "Sun"}, "narrow": {"0": "M", "1": "T", "2": "W", "3": "T", "4": "F", "5": "S", "6": "S"}}}, "datetime_formats": {"null": "{1} {0}"}, "percent_format": "#,##0%", "min_week_days": 1, "first_week_day": 6, "periods": {"am": "AM", "pm": "PM"}, "minus_sign": "-", "time_formats": {"medium": {"pattern": "h:mm:ss a", "format": "%(h)s:%(mm)s:%(ss)s %(a)s"}, "full": {"pattern": "h:mm:ss a v", "format": "%(h)s:%(mm)s:%(ss)s %(a)s %(v)s"}, "long": {"pattern": "h:mm:ss a z", "format": "%(h)s:%(mm)s:%(ss)s %(a)s %(z)s"}, "short": {"pattern": "h:mm a", "format": "%(h)s:%(mm)s %(a)s"}}, "quarters": {"stand-alone": {"wide": {"1": "1st quarter", "2": "2nd quarter", "3": "3rd quarter", "4": "4th quarter"}, "abbreviated": {"1": "1st quarter", "2": "2nd quarter", "3": "3rd quarter", "4": "4th quarter"}, "narrow": {"1": "1", "2": "2", "3": "3", "4": "4"}}, "format": {"wide": {"1": "1st quarter", "2": "2nd quarter", "3": "3rd quarter", "4": "4th quarter"}, "abbreviated": {"1": "Q1", "2": "Q2", "3": "Q3", "4": "Q4"}, "narrow": {"1": "1", "2": "2", "3": "3", "4": "4"}}}, "plus_sign": "+", "number_format": "#,##0.###", "locale_name": "en_US"};

	    window.locale_name = function() { return 'en_US'; };
	    window.locale_uses_day_before_month = function() { return false; };

            callback(null, window);
        }
    });
}

function getChartReadyData($, response, fieldInfo, properties){
	if(!response) {
		response = { columns: [], fields: [] };
	}
	var adjustedResponse,
		category_label_cutoff = 80,
		default_max_rows_for_top = 20;

	properties['axisLabelsX.hideCategories'] = false;

	// for pie and scatter charts or gauges, don't adjust the raw response
	if(properties.chart in {pie: true, scatter: true, radialGauge: true, fillerGauge: true, markerGauge: true}) {
		adjustedResponse = response;
	}

		function resultsAreTopOrRare(response) {
	        for(var i = 0; i < response.fields.length; i++) {
	            if(response.fields[i] === "_tc") {
	                return true;
	            }
	        }
	        return false;
    	}
    	function sliceResultsBySeriesLength(response, howMany) {
	        var sliced = $.extend(true, {}, response);
	        for(var i = 0; i < response.columns.length; i++) {
	            sliced.columns[i] = response.columns[i].slice(0, howMany);
	        }
	        return sliced;
    	}

	var truncationLimit = parseInt(properties['charting.chart.resultTruncationLimit'], 10) ||
						  parseInt(properties['resultTruncationLimit'], 10) ||
						  0;

	//set a limit on the total number of data points based on the chart type and renderer
	var actualPointsPerSeries = (response.columns.length > 0) ? response.columns[0].length : 0,
	maxColumnPoints = 1200,
	maxLinePoints   = 2000,

	maxPoints = (truncationLimit > 0) ? truncationLimit : ((properties.chart in {line: true, area: true}) ? maxLinePoints : maxColumnPoints),
	numSeries = fieldInfo.fieldNames.length,
	pointsAllowedPerSeries = Math.floor(maxPoints / numSeries);

	if(actualPointsPerSeries > pointsAllowedPerSeries) {
		adjustedResponse = sliceResultsBySeriesLength(response, pointsAllowedPerSeries);
	}
	else {
		adjustedResponse = response;
	}

	// for category-based charting, use the CATEGORY_LABEL_CUTOFF to determine if labels should be shown
	if(!resultsAreTopOrRare(response)){
		if(!fieldInfo.isTimeData) {
			var numCategories = (adjustedResponse.columns.length > 0) ? adjustedResponse.columns[0].length : 0;
			if(numCategories > category_label_cutoff) {
			    properties['axisLabelsX.hideCategories'] = true;
			}
		}
	} else if(properties['chart'] !== 'pie'){
		var maxRowsForTop = parseInt(properties["maxRowsForTop"], 10) || default_max_rows_for_top;
            adjustedResponse = sliceResultsBySeriesLength(response, maxRowsForTop);
            properties.fieldHideList = ["percent"];
	}

	return adjustedResponse;

}

function getSVG(data, scriptBasepath, callback) {
	if(scriptBasepath == null) {
		scriptBasepath = __script_basepath;
	}

    createChartingWindow(scriptBasepath, function(err, window) {
        if(err) {
            callback(err, null);
        }
        else {
			window.document.createElementNS = function(ns, tagName) {
				var elem = window.document.createElement(tagName);
				elem.getBBox = function() {
					if (this.textContent) {
						doc = new PDFDocument;
						fontSize = parseInt($(elem).css("font-size"), 10);
						font = doc.font('Helvetica', fontSize);

						return {
							x: elem.offsetLeft,
							y: elem.offsetTop,
							// need to compute max width per line
							width: font.widthOfString(this.textContent),
							// need to compute currentLineHeight()+(numLines-1)*currentLineHeight(true)
							height: font.currentLineHeight()
						};
					}
					return {
					x: elem.offsetLeft,
					y: elem.offsetTop,
					width: elem.offsetWidth,
					height: elem.offsetHeight
					};

				};
				elem.createSVGRect = function() {};
				return elem;
			};

			var $ = window.$;
			var Splunk = window.Splunk;
			var $container = $('#container');

			var fieldInfo 		 = Splunk.JSCharting.extractFieldInfo(data.series),
				adjustedResponse = getChartReadyData($, data.series, fieldInfo, data.props),
				chartData 		 = Splunk.JSCharting.extractChartReadyData(adjustedResponse, fieldInfo);



			$container.width(parseInt(data.width, 10)).height(parseInt(data.height, 10));
			try {
				var chart = Splunk.JSCharting.createChart($container[0], data.props);

				chart.prepare(chartData, fieldInfo, data.props);

				chart.draw(function(chartObject) {
					var svg = $(".highcharts-container").html();
					// un-comment this next line to pretty-print the SVG to python.log
					// throw new Error(svg.replace(/>/g, ">\n"));
					callback(null, svg);
				});
			}
			catch(err) {
				console.log('exception in js_charting::getSVG' + JSON.stringify(err));
				callback(err, null);
			}
		}
    });
}

exports.getSVG = getSVG;
