/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

console.log('START GENJAVA');

const startTime      = Date.now();
var path_            = require('path');
var [argv, X, flags] = require('./processArgs.js')(
  'sourcefiles*',
  { outdir: '/build/src/java' },
  { java: true, genjava: true, node: true, debug: true }
);

X.outdir = path_.resolve(path_.normalize(X.outdir));

require('../src/foam_node.js');

// Load Manifest (files.js) Files
argv.forEach(fn => {
  flags.src = fn.substring(0, fn.indexOf('/src/')+5);
  require(fn);
});

// Promote all UNUSED Models to USED
for ( var key in foam.UNUSED ) try { foam.maybeLookup(key); } catch(x) { }
// Call a 2nd time incase interfaces generated new classes in the 1st pass
for ( var key in foam.UNUSED ) try { foam.maybeLookup(key); } catch(x) { }

var mCount = 0, jCount = 0;
// Build Java Classes
for ( var key in foam.USED ) try {
  mCount++;
  if ( foam.maybeLookup(key).model_.targetJava(X) ) jCount++;
} catch(x) {}

console.log(`END GENJAVA: ${jCount}/${mCount} models processed in ${Math.round((Date.now()-startTime)/1000)}s.`);
