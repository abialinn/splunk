Splunk.namespace("Splunk.pdf");

/**
 * Splunk.pdf object includes utility functions for accessing the 'pdfgen'
 * rendering engine in splunkd. 
 */

Splunk.pdf = {

    /**
     * is_pdf_available will call availableCallback if the pdfgen endpoint returns non-4XX
     * and will call unavailableCallback otherwise
     * the value of the REST call will be stored for subsequent use
     */
    is_pdf_available: function(availableCallback, unavailableCallback) {
        if (this.pdfIsAvailableSet) {
            if (this.pdfIsAvailable === true && availableCallback) { 
                availableCallback(this.whichPdfEngine); 
            } else if (this.pdfIsAvailable === false && unavailableCallback) { 
                unavailableCallback(); 
            }
            return;
        }
        this.pdfIsAvailable = false;
        this.whichPdfEngine = "none";
        var that = this;
        
        function setIsAvailable(whichPdf, callback) {
            that.pdfIsAvailable = true;
            that.whichPdfEngine = whichPdf;
            that.pdfIsAvailableSet = true;
            if (callback) { callback(that.whichPdfEngine); }
        }
        function setIsUnavailable(callback) {
            that.pdfIsAvailable = false;
            that.pdfIsAvailableSet = false;
            if (callback) { callback(); }
        }

        $.get(Splunk.util.make_full_url("splunkd/__raw/services/pdfgen/is_available"))
            .success( function(data) { 
                if (data === "pdfgen") {
                    setIsAvailable("pdfgen", availableCallback);
                } else if (data === "deprecated") {
                    Splunk.pdf.isDeprecatedServerAvailable(
                        function() {
                            setIsAvailable("deprecated", availableCallback);
                            }, 
                        function() {
                            setIsUnavailable(unavailableCallback);
                            }, 
                        function() {
                            setIsUnavailable(unavailableCallback);
                            }, 
                        function() {
                            setIsUnavailable(unavailableCallback);
                            }, 
                        function(errorMsg) {
                            setIsUnavailable(unavailableCallback);
                        }); 
                }
            })
            .error(function() { 
                setIsUnavailable(unavailableCallback);
            });
    },

    /**
     * check to see if the deprecated PDF Report Server is available
     * @param {Function} enabledCallback
     * @param {Function} disabledCallback
     * @param {Function} notInstalledCallback
     * @param {Function} deniedCallback
     * @param {Function} errorCallback takes one parameter errorMsg, a string
     **/ 
    isDeprecatedServerAvailable: function(enabledCallback, disabledCallback, notInstalledCallback, deniedCallback, errorCallback) {
        $.getJSON(Splunk.util.make_url("report/is_enabled"), function(response, textStatus) {
            switch(response.status) {
                case 'enabled':
                    enabledCallback();
                    break;
                case 'disabled':
                    disabledCallback();
                    break;
                case 'notinstalled':
                    notInstalledCallback();
                    break;
                case 'denied':
                    deniedCallback();
                    break;
                default:
                    errorCallback(sprintf(_("Received an unexpected response '%s' while fetching the status of the PDF report server"), data.status));
                    break;
            }
        }); 
    },

    /**
     * get_render_url_for_saved_search returns a URL which will return
     * a PDF representing the <namespace>/<savedSearch> object.
     * If sid is provided, the PDF renderer will use the existing job
     * instead of dispatching a new one.
     */
    get_render_url_for_saved_search: function(savedSearch, namespace, sid, pdfService) {
        var params = {};
        params["input-report"] = savedSearch;
        params["namespace"] = namespace;
        if (sid) {
            params["sid"] = sid;
        }
    
        return Splunk.pdf._get_pdfgen_render_url(params);    
    },

    /**
     * get_render_url_for_current_dashboard returns a URL which will return
     * a PDF representing the current dashboard visible in the browser
     */
    get_render_url_for_current_dashboard: function(pdfService) {
        // quickly bail out of the function if we are using the deprecated PDF report server
        if (pdfService === "deprecated") {
            var pdfParams = { output: 'pdf' };
            pdfUrl = Splunk.util.make_url('app', Splunk.util.getCurrentApp(), Splunk.util.getCurrentView()) +
                '?' + Splunk.util.propToQueryString(pdfParams);
            return pdfUrl;
        }

        var params = {};
        params["input-dashboard"] = Splunk.ViewConfig.view.id;
        params["namespace"] = Splunk.ViewConfig.app.id;
       
        var gimps = $('.Gimp');
        for (var i = 0; i < gimps.length; i++) {
            var gimpId = gimps[i].id;
            var gimpModule = Splunk.Globals['ModuleLoader'].getModuleInstanceById(gimpId);

            var search = gimpModule.getContext().get("search");
            if (!search || !search.job) continue;

            var sid = search.job.getSearchId();
            if (!sid) continue;

            params["sid_" + i] = sid;     
        }
        
        return Splunk.pdf._get_pdfgen_render_url(params);    
    },
   
    /**
     * _get_pdfgen_render_url is a 'private' utility function to encapsulate all
     * general behavior related to setting up a pdfgen/render URL
     */ 
    _get_pdfgen_render_url: function(params) {
        // IE6 will not open content-type=application/pdf in a separate 
        // viewer unless the very last bit of the URL is XXXX.pdf
        if ($.browser.msie && $.browser.version == '6.0') {
            params["ie6-output-name"] = "results.pdf";
        }

        return Splunk.util.make_full_url("splunkd/__raw/services/pdfgen/render", params);
    }
};
