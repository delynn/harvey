var _ = require('underscore');
var Joi = require('joi');
var T = Joi.Types;


module.exports = function() {

	this.validateSuite = function(suite) {
		
		var err = Joi.validate(suite, suiteSchema);
		if(err) {
			throw err;
		}

		//Config
		if(suite.config) {
			//TODO: validate config
		}
		
		//requestTemplates
		if(suite.requestTemplates) {
			for(var i=0; i<suite.requestTemplates.length; i++) {
				err = Joi.validate(suite.requestTemplates[i], requestTemplateSchema);
				if(err && err.message !== 'the key (body) is not allowed') {
					throw new Error('requestTemplates[\'' + suite.requestTemplates[i].id + '\']: ' + err.message);
				}
			}
			
			var duplicateIds = findDuplicateIds(suite.requestTemplates);
			if(duplicateIds.length > 0) {
				throw new Error('The following request template ids are specified more than once: \'' + duplicateIds.join('\', \'') + '\'');
			}
		}
		
		//responseTemplates
		if(suite.responseTemplates) {
			for(var i=0; i<suite.responseTemplates.length; i++) {
				err = Joi.validate(suite.responseTemplates[i], responseTemplateSchema);
				if(err && err.message !== 'the key (body) is not allowed') {
					throw new Error('responseTemplates[\'' + suite.responseTemplates[i].id + '\']: ' + err.message);
				}
			}
			
			var duplicateIds = findDuplicateIds(suite.responseTemplates);
			if(duplicateIds.length > 0) {
				throw new Error('The following response template ids are specified more than once: \'' + duplicateIds.join('\', \'') + '\'');
			}
		}


		//setupAndTeardown
		if(suite.setupAndTeardowns) {
			for(var i=0; i<suite.setupAndTeardowns.length; i++) {
				err = Joi.validate(suite.setupAndTeardowns[i], setupAndTeardownsSchema);
				if(err) {
					throw new Error('setupAndTeardowns[\'' + suite.setupAndTeardowns[i].id + '\']: ' + err.message);
				}

				if(suite.setupAndTeardowns[i].request) {
					err = Joi.validate(suite.setupAndTeardowns[i].request, requestSchema);
					if(err && err.message !== 'the key (body) is not allowed') {
						throw new Error('setupAndTeardowns[\'' + suite.setupAndTeardowns[i].id + '\'].request: ' + err.message);
					}
				}

				if(suite.setupAndTeardowns[i].expectedResponse) {
					err = Joi.validate(suite.setupAndTeardowns[i].expectedResponse, expectedResponseSchema);
					if(err && err.message !== 'the key (body) is not allowed') {
						throw new Error('setupAndTeardowns[\'' + suite.setupAndTeardowns[i].id + '\'].expectedResponse: ' + err.message);
					}
				}

				if(suite.setupAndTeardowns[i].actions) {
					//TODO: validate actions
				}
			}

			var duplicateIds = findDuplicateIds(suite.setupAndTeardowns);
			if(duplicateIds.length > 0) {
				throw new Error('The following setup and teardown ids are specified more than once: \'' + duplicateIds.join('\', \'') + '\'');
			}

		}

		//tests
		if(suite.tests) {
			for(var i=0; i<suite.tests.length; i++) {
				err = Joi.validate(suite.tests[i], testSchema);
				if(err) {
					throw new Error('tests[\'' + suite.tests[i].id + '\']: ' + err.message);
				}

				if(suite.tests[i].request) {
					err = Joi.validate(suite.tests[i].request, requestSchema);
					if(err && err.message !== 'the key (body) is not allowed') {
						throw new Error('tests[\'' + suite.tests[i].id + '\'].request: ' + err.message);
					}
				}

				if(suite.tests[i].expectedResponse) {
					err = Joi.validate(suite.tests[i].expectedResponse, expectedResponseSchema);
					if(err && err.message !== 'the key (body) is not allowed') {
						throw new Error('tests[\'' + suite.tests[i].id + '\'].expectedResponse: ' + err.message);
					}
				}

				if(suite.tests[i].actions) {
					//TODO: validate actions
				}
			}

			var duplicateIds = findDuplicateIds(suite.tests);
			if(duplicateIds.length > 0) {
				throw new Error('The following test ids are specified more than once: \'' + duplicateIds.join('\', \'') + '\'');
			}
		}

	};

	var findDuplicateIds = function(array) {
		var duplicates = [];
		for(var i=0; i<array.length-1; i++) {
			for(var j=i+1; j<array.length; j++) {
				if(array[i].id === array[j].id) {
					if(duplicates.indexOf(array[i].id) === -1) {
						duplicates.push(array[i].id);
					}
				}
			}
		}

		return duplicates;
	};
	
	//Declare the Joi schema objects
	var requestSchema = T.Object({
		"templates": T.Array().includes(T.String().min(1)),
		"method": T.String().valid('GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'),
		"protocol": T.String().valid('http', 'https'),
		"host": T.String(),
		"port": T.Number().integer().min(80).max(65535),
		"resource": T.String().emptyOk(),
		"headers": T.Object().allowOtherKeys()
		//Since body can be anything we won't validate it
	});

	var expectedResponseSchema = T.Object({
		"templates": T.Array().includes(T.String().min(1)),
		"statusCode": T.Number().integer().min(100).max(505),
		"headers": T.Object().allowOtherKeys()
		//Since body can be a string or object we need to validate it separately
	});

	var testSchema = T.Object({
		"id": T.String().min(1).required(),
		"variables": T.Array(),
		"request": T.Object(),
		"expectedResponse": T.Object(),
		"actions": T.Array(),
		"setup": T.Array().includes(T.String().min(1)),
		"teardown": T.Array().includes(T.String().min(1))
	});

	var requestTemplateSchema = T.Object({
		"id": T.String().min(1).required(),
		"method": T.String().valid('GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'),
		"protocol": T.String().valid('http', 'https'),
		"host": T.String(),
		"port": T.Number().integer().min(80).max(65535),
		"resource": T.String().emptyOk(),
		"headers": T.Object().allowOtherKeys()
		//Since body can be a string or object we need to validate it separately
	});
	
	var responseTemplateSchema = T.Object({
		"id": T.String().min(1).required(),
		"statusCode": T.Number().integer().min(100).max(505),
		"headers": T.Object().allowOtherKeys()
		//Since body can be a string or object we need to validate it separately
	});

	var setupAndTeardownsSchema = T.Object({
		"id": T.String().min(1).required(),
		"variables": T.Object(),
		"request": T.Object(),
		"expectedResponse": T.Object(),
		"actions": T.Array()
	});

	var suiteSchema = T.Object({
		"config": T.Object(),
		"requestTemplates": T.Array(),
		"responseTemplates": T.Array(),
		"setupAndTeardowns": T.Array(),
		"tests": T.Array(),
		"suiteSetup": T.Array(),
		"suiteTeardown": T.Array()
	});
};