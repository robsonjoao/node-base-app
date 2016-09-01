'use strict';

var http = require('http');
var url = require('url');

var app = null;
var cloudConfig = null;


exports.init = function(args) {
	app = args.app;
	cloudConfig = args.cloudConfig;
}

//var service = exports = module.exports = {};

//service.get = 

var serviceRequest = {

	get: function(args) {
		args.method = 'GET';
		this.request(args);
	},

	post: function(args) {
		args.method = 'POST';
		this.request(args);
	},	

	put: function(args) {
		args.method = 'PUT';
		this.request(args);
	},		


	discoveryService: function(serviceName) {
		if(cloudConfig.get('eureka.client.registerWithEureka')) {
			//Eureka discovery
			console.log('finding service in eureka: ' + serviceName);
			var eureka = app.get('eureka');
			var servicesInfos = eureka.getInstancesByAppId(serviceName);
			if(servicesInfos && servicesInfos.length > 0) {
				return {
					host: servicesInfos[0].hostName,
					port:  servicesInfos[0].port.$
				};
			}
		}else{
			//Cloud Config
			console.log('finding service in config: ' + serviceName);
			var serviceInfo = cloudConfig.get(serviceName + '.ribbon.listOfServers');
			console.log(serviceInfo);
			if(serviceInfo) {
				var serviceUrl = url.parse(serviceInfo);
				return {
					host: serviceUrl.hostname,
					port: serviceUrl.port
				};
			}
		}

		return null;
	},

	request: function(args) {
		console.log('aqui');
		//var path = args.path;
		var callback = args.success;
		var res = args.res;

		if(args.service) {
			var service = this.discoveryService(args.service);
			if(service) {
				args.host = service.host;
				args.port = service.port;
			}
		}else{
			args.host = (args.host || 'localhost');
			args.port = (args.port || 7001);
		}
		//args.path = (args.host || 'localhost');

		var options = {
			host: args.host,
			port: args.port,
			path: args.path,
			method: args.method
		};

		


		if(args.headers) {
			options.headers = args.headers;
		}
		
		if(args.req && args.req.headers) {
			//options.headers = args.req.headers;
		}


		console.log(options);



		if(args.req && args.req.body) {
			console.log('REQ HEADERs:');
			console.log(args.req.headers);

			if(args.req.headers) {
				options.headers = args.req.headers;
			}else{

				if(!options.headers) {
					options.headers = {};
				}
			    options.headers['content-type'] = 'application/x-www-form-urlencoded';
				options.headers['content-length'] = Buffer.byteLength(JSON.stringify(args.req.body));
				//console.log('============================');
				//console.log(options.headers);
				//console.log('============================');
			}
		
		}

		if(args.resultMap) {
			options.headers = {
				'ResultMap': JSON.stringify(args.resultMap)
			}
		}		

		var request = http.request(options, function(resService) {
			resService.setEncoding('utf-8');

		    var responseString = '';

		    resService.on('data', function(data) {
		      responseString += data;
		    });

		    resService.on('end', function() {
				var responseObject = JSON.parse(responseString);
				if(callback) {
					callback(responseObject);
				}else if(res) {
					res.json(responseObject);
				}
		    });

			resService.on('error', function(err) {
				console.log('::: ERROR');
				console.log(err);
			    // Handle error
			});		    
		});

		if(args.postData) {
			request.write(args.postData);
		}else if(args.body) {
			console.log('----------------------------------');
			console.log(args.body);
			console.log('----------------------------------');
			request.write(JSON.stringify(args.body));
		}else if(args.req && args.req.body) {
			console.log('----------------------------------');
			console.log(args.req.body);
			console.log('----------------------------------');


			console.log('ENVIANDO BODY');
			console.log(JSON.stringify(args.req.body));
			request.write(JSON.stringify(args.req.body));
		}

		request.end();		
	},

	teste: function() {
		console.log('chegou aqui mesmo')
	}
}



exports.get = function(args) {
	return serviceRequest.get(args);
};

exports.post = function(args) {
	return serviceRequest.post(args);
};

exports.put = function(args) {
	return serviceRequest.put(args);
};