
Splunk.Module.AccountBar = $.klass(Splunk.Module, {
    
    MAX_URI_LENGTH_IE: 2048,

    initialize: function($super, container) {
        $super(container);
        // TODO this may be overly aggressive but its better to do it sooner rather than later. 
        this.childEnforcement  = Splunk.Module.NEVER_ALLOW;
        this.parentEnforcement = Splunk.Module.NEVER_ALLOW;

        
        var appList = this.getParam('appList') || [{'label': _('(No apps available)'), 'uri': '', 'id': ''}];
        var launcherApp = this.getParam('launcherApp');
        var canInstallApps = this.getParam('canInstallApps');
        
        if (appList.length == 0) {
            this.logger.error('Unable to construct app list; no apps found');
        }
        
        // add links to visit the Home app and create a new app 
        appList.push({'divider': 'splDivider'});
        if (launcherApp) {
            appList.push(launcherApp);
        }

        appList.push({
            'label': _('Manage apps...'), 
            'uri': Splunk.util.make_url('manager', Splunk.util.getCurrentApp(), 'apps', 'local')
        });

        if (canInstallApps) {
            appList.push({
                'label': _('Find more apps...'), 
                'uri': Splunk.util.make_url('manager', Splunk.util.getCurrentApp(), 'apps', 'remote')
            });
        }
        
        if ($('#applicationsMenuActivator', this.container).length ) { 
            var appsMenu = new Splunk.MenuBuilder({
                containerDiv: this.container,
                menuDict: appList,
                activator: $('#applicationsMenuActivator', this.container),
                menuClasses: 'splMenu-secondary'
            });
        }
        
        $('.alerts_opener', container).click(function() {
            Splunk.window.openAerts(this.href);
            return false;
        });
        
        $('.job_manager_opener', container).click(function() {
            Splunk.window.openJobManager();
            return false;
        });
        var self = this;
        $('.user_options_opener', container).click(function() {	
        	var path = "/" + window.location.href.split('/').slice(3).join("/");
        	
			if (/authentication\/changepassword/.exec(path))
			    return false;
			
			var redirectUrl = this.href + '&redirect_override=' + encodeURIComponent(path);
			
			if($.browser.msie && redirectUrl.length > self.MAX_URI_LENGTH_IE) {
			    // this means a permalink in the redirect_override has made the full URL too long for IE,
			    // so use the non-permalinked version (by stripping out everything after the "#") to avoid a 404 
			    // TODO: this logic should probably be migrated to a generic redirect method that all modules can use
			    
			    redirectUrl = this.href + '&redirect_override=' + encodeURIComponent(path.split("#")[0]);
			}
			window.location = redirectUrl; 
			return false;
        });
        
        $('.wall_opener', container).click(function() {
          Splunk.Popup.Wall();
          return false;
        });
        
        $('.splIcon-close', container).click(function() {
            window.close();
            return false;
        });
        
        var cancelJobsOnLogoClick = Splunk.util.normalizeBoolean(this._params.cancelJobsOnLogoClick);
        if (cancelJobsOnLogoClick) {
            $('.appLogo', container).click(function(event) {
                // if theres an href then we defer location change until the cancellation is complete.
                var target_uri = $(this).attr("href");
                // only get the jobs that can be autocancelled (we dont actually care if they're running or not)
                var jobs = Splunk.Globals.Jobber.listJobs(function(job){
                    return (job.canBeAutoCancelled());
                });
                if (jobs.length > 0) {
                    jobs.cancel(function() {
                        if (target_uri) {
                            document.location = target_uri;
                            return true;
                        }
                    });
                    if (target_uri) {
                        event.preventDefault();
                        return false;
                    }
                }
            });
            
            
        }
    }
   
});

