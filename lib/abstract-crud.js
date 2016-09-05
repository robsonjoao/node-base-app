'use strict';

//var express = require('express');
//var route = express.Router();	

//var service = null;

module.exports = (route, options) => {

	var service = options.service;

	//var route = options.route;
	var serviceName = options.serviceName;
	var resourcePath = options.resourcePath;


	route.get('/', function(req, res, next) {

		service.get({
			service: serviceName,
			path: resourcePath + '/filter', 
			success: function(data){
				data.results = data.content;
				data.content = null;
				res.json(data);
			}
		});

	});


	route.get('/create', function(req, res, next) {
		res.json({});
	});


	route.get('/filter', function(req, res, next) {
		service.get({service: serviceName, path: resourcePath + '/filter', res: res});
	});

	route.post('/save', function(req, res, next) {
		if(req.body && req.body.id) {
			service.put({service: serviceName, path: resourcePath + '/' + req.body.id, req: req, res: res});
		}else{
			service.post({service: serviceName, path: resourcePath + '/', req: req, res: res});
		}
	});

	route.get('/:id/edit', function(req, res, next) {
		service.get({service: serviceName, path: resourcePath + '/' + req.params.id, res: res});
	});

	route.get('/:id', function(req, res, next) {
		var args = {service: serviceName, path: resourcePath + '/' + req.params.id, res: res};
		if(options.mapForShow) {
			args.resultMap = options.mapForShow({});
		}
		service.get(args);
	});

	return route;
	/*
	return {
		teste: 'teste'
	};
	*/
}
