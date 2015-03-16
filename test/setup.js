'use strict';

var sandboxedModule = require('sandboxed-module');

sandboxedModule.configure({
    sourceTransformersSingleOnly: [ 'istanbul' ]
});
