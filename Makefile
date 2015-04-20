clean:
	npm cache clean && rm -rf node_modules/*

install:
	make clean && npm install

update:
	make clean && rm -rf npm-shrinkwrap.json && npm install . && npm shrinkwrap
	 
test:
	@NODE_ENV=test ./node_modules/.bin/mocha --recursive --reporter spec --timeout 3000 test

test-debug:
	@NODE_ENV=test node-debug -p 8081 ./node_modules/.bin/_mocha --recursive --reporter spec --timeout 3000 test

test-cov:
	@NODE_ENV=test ./node_modules/.bin/mocha --require blanket --recursive --timeout 3000 -R travis-cov test

test-cov-json:
	@NODE_ENV=test ./node_modules/.bin/mocha --require blanket --recursive --timeout 3000 -R json-cov > test/coverage.json

test-cov-html:
	@NODE_ENV=test ./node_modules/.bin/mocha --require blanket --recursive --timeout 3000 -R html-cov test > test/coverage.html
	xdg-open "file://${CURDIR}/test/coverage.html" &

browserify:
	node node_modules/browserify/bin/cmd.js index.js -i request > harvey.js

browserify-min:
	node node_modules/browserify/bin/cmd.js index.js -i request > harvey.js
	node_modules/minify/bin/minify harvey.js harvey-min.js
	
.PHONY: test test-cov test-cov-json test-cov-html browserify browserify-min
