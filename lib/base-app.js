'use strict';

var Service = require('./service');

var configClient = require("cloud-config-client");

//exports = module.exports = createApplication;

var app = exports = module.exports = {};

app.init = function(args) {
	console.log('iniciando....');
	app.args = args;
	app.express = app.args.expressApp;
	app.profile = app.express.get('env');

	app.loadCloudConfig();	
};


app.loadCloudConfig = function() {
	console.log('loading cloud config');
	console.log('profile: ' + app.profile);

	var localConf = app.express.get('config');


	configClient.load({
	    application: app.args.application,
	    profiles: [app.profile],
	    endpoint: localConf.get('cloud-config.uri'),
	    auth: {
			user: localConf.get('cloud-config.username'),
			pass: localConf.get('cloud-config.password')
	    }
	},function(error, cfg) {
		if(cfg) {
			console.log('Config Loaded');
			//console.log(cfg.toString(2));
			console.log(cfg.get('service-user-auth.ribbon.listOfServers'));
			app.cfg = cfg;
			app.express.set('cloudConfig', cfg);
			Service.init({
				app: app.express,
				cloudConfig: cfg
			});
			app.initApplication();
		}else{
			console.log('config cloud error');
			console.log(error);
		}
	});
};

app.initApplication = function() {
	console.log('Init application');
	var cfg = app.cfg;
	var registerWithEureka = cfg.get('eureka.client.registerWithEureka');
	console.log(registerWithEureka);
	if(registerWithEureka) {
		console.log('Registering with Eureka');
		connectEureka();
	}
};


function connectEureka() {
	var Eureka = require('eureka-js-client').Eureka;
	var eurekaClient = new Eureka({
	  // application instance information 
	  instance: {
	    app: 'app-nodejs-provincia',
	    hostName: 'localhost',
	    ipAddr: '127.0.0.1',
	    port: {
	      '$': 8001,
	      '@enabled': 'true',
	    },    
	    vipAddress: 'jq.test.something.com',
	    dataCenterInfo: {
	      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
	      name: 'MyOwn',
	    },
	  },
	  eureka: {
	    // eureka server host / port 
	    host: 'localhost',
	    port: 8761,
	    servicePath: '/eureka/apps/'
	  },
	});
	eurekaClient.logger.level('debug');
	eurekaClient.start();


	app.express.set('eureka', eurekaClient);	
}

exports.Service = Service;