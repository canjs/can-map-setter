# can-map-setter (DEPRECATED)

*The setter plugin (and the attributes plugin) have been deprecated in favor of the [define plugin](https://canjs.com/docs/can.Map.prototype.define.html), which provides the same functionality. It will still be maintained up to 3.0 and potentially after. Projects using setters should consider switching to [define setters](https://canjs.com/docs/can.Map.prototype.define.set.html).*

[![Build Status](https://travis-ci.org/canjs/can-map-setter.png?branch=master)](https://travis-ci.org/canjs/can-map-setter)

Use setter methods on can.Map

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Installation](#installation)
  - [ES6 use](#es6-use)
  - [CommonJS use](#commonjs-use)
- [AMD use](#amd-use)
  - [Standalone use](#standalone-use)
- [Usage](#usage)
  - [Differences From `attr`](#differences-from-attr)
  - [Error Handling](#error-handling)
  - [Demo](#demo)
- [API Reference](#api-reference)
  - [`setATTR: function(newValue,setValue,setErrors)`](#setattr-functionnewvaluesetvalueseterrors)
  - [`setValue`](#setvalue)
  - [`setErrors`](#seterrors)
- [Making Changes](#making-changes)
  - [Making a Build](#making-a-build)
  - [Running the tests](#running-the-tests)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## Installation

### ES6 use

With StealJS, you can import this module directly in a template that is autorendered:

```js
import plugin from 'can-map-setter';
```

### CommonJS use

Use `require` to load `can-map-setter` and everything else
needed to create a template that uses `can-map-setter`:

```js
var plugin = require("can-map-setter");
```

## AMD use

Configure the `can` and `jquery` paths and the `can-map-setter` package:

```html
<script src="require.js"></script>
<script>
	require.config({
	    paths: {
	        "jquery": "node_modules/jquery/dist/jquery",
	        "can": "node_modules/canjs/dist/amd/can"
	    },
	    packages: [{
		    	name: 'can-map-setter',
		    	location: 'node_modules/can-map-setter/dist/amd',
		    	main: 'lib/can-map-setter'
	    }]
	});
	require(["main-amd"], function(){});
</script>
```

### Standalone use

Load the `global` version of the plugin:

```html
<script src='./node_modules/can-map-setter/dist/global/can-map-setter.js'></script>
```

## Usage

`can.Map.setter(name, setValue(value), setErrors(errors))` extends the Map object 
to provide convenient helper methods for setting attributes on a map.

The [attr](https://canjs.com/docs/can.Map.prototype.attr.html) function looks for a camel-case `setATTR` function to handle setting 
the `ATTR` property. For example, the following makes sure the `birthday` attribute is 
always a Date type.

	var Contact = can.Map.extend({
		setBirthday : function(raw){
			if(typeof raw === 'number'){
				return new Date( raw )
			}else if(raw instanceof Date){
				return raw;
			}
		}
	});
	
	var contact = new Contact({ birthday: 1332777411799 });
	contact.attr('birthday') //-> Date(Mon Mar 26 2012)

By providing a function that takes the raw data and returns a form useful for JavaScript, 
we can make our maps automatically convert data.

	var Contact = can.Map.extend({
		setBirthday : function(raw){
			if(typeof raw === 'number'){
				return new Date( raw )
			}else if(raw instanceof Date){
				return raw;
			}
		}
	});

	// set on init
	var contact = new Contact({ birthday: 1332777411799 });
	
	// get the contact's birthday via 'attr' method
	contact.attr('birthday') 
		// -> Mon Mar 26 2012 08:56:51 GMT-0700 (MST)

	// set via 'attr' method
	contact.attr('birthday', new Date('11/11/11').getTime())
	
	contact.attr('birthday') 
		// -> Fri Nov 11 2011 00:00:00 GMT-0700 (MST)

	contact.attr({
		'birthday': new Date('03/31/12').getTime()
	});

	contact.attr('birthday') 
		// -> Sat Mar 31 2012 00:00:00 GMT-0700 (MST)


If the returned value is `undefined`, this means the setter is either in an async 
event or the attribute(s) were not set. 

### Differences From `attr`

The way that return values from setters affect the value of an Map's property is different from [attr's](https://canjs.com/docs/can.Map.prototype.attr.html) normal behavior. Specifically, when the property's current value is an Map or List, and an Map or List is returned from a setter, the effect will not be to merge the values into the current value as if the return value was fed straight into `attr`, but to replace the value with the
new Map or List completely:

```
var Contact = can.Map.extend({
	setInfo: function(raw) {
      return raw;
	}
});

var alice = new Contact({info: {name: 'Alice Liddell', email: 'alice@liddell.com'}});
alice.attr(); // {name: 'Alice Liddell', 'email': 'alice@liddell.com'}
alice.info._cid; // '.map1'

alice.attr('info', {name: 'Allison Wonderland', phone: '888-888-8888'});
alice.attr(); // {name: 'Allison Wonderland', 'phone': '888-888-8888'}
alice.info._cid; // '.map2'
```

If you would rather have the new Map or List merged into the current value, call `attr` inside the setter:

```
var Contact = can.Map.extend({
	setInfo: function(raw) {
      this.info.attr(raw);
      return this.info;
	}
});

var alice = new Contact({info: {name: 'Alice Liddell', email: 'alice@liddell.com'}});
alice.attr(); // {name: 'Alice Liddell', 'email': 'alice@liddell.com'}
alice.info._cid; // '.Map1'

alice.attr('info', {name: 'Allison Wonderland', phone: '888-888-8888'});
alice.attr(); // {name: 'Allison Wonderland', email: 'alice@liddell.com', 'phone': '888-888-8888'}
alice.info._cid; // '.Map1'
```

### Error Handling

Setters can trigger errors if values passed didn't meet your defined validation(s).

Below is an example of a _School_ observable that accepts a name property and errors when no value or a empty string is passed.


	var School = can.Map.extend({
		setName : function(name, success, error){
			if(!name){
				error("no name");
			}
			return error;
		}
	});

	var school = new School();
	
	// bind to error handler
	school.bind("error", function(ev, attr, error){
		alert("no name")
	})
	
	// set to empty string
	school.attr("name","");

### Demo

The example app is a pagination widget that updates
the offsets when the _Prev_ or _Next_ button is clicked.

See: can-map-setter/src/setter-paginate.html

Notice the `setCount` and `setOffset` setters.


## API Reference

### `setATTR: function(newValue,setValue,setErrors)`

**Parameters**

- ATTR `{String}` - The capitalized attribute name this setter will set.
- newValue `{*}` - The propsed value of the attribute specified by attr.
- setValue `{setValue(value)}` - A callback function that can specify `undefined` values or the value at a later time.
- setErrors `{setErrors(errors)}` - A callback function that can specify error data if the proposed value is in error

**Returns**

- `{*}` - If a non-undefined value is returned, that value is set as the attribute's value. If undefined is returned, it's assumed that the `setValue` callback will be called. Use `setValue` to set undefined values.

### `setValue`

Sets the setter attributes value

**Parameters**

- value `{*}` - The value

**Use**

Call a setter's `setValue` callback update
the value of the attribute.

### `setErrors`

Called to specify setter errors that result in an 'error' event triggered with the property and errors.

**Parameters**

- errors `{Array<String|Object>}` - Error details

**Use**

Call a setter's `setErrors` callback to 
trigger errors events on the map instance.

## Making Changes

### Making a Build

To make a build of the distributables into `dist/` in the cloned repository run

```
npm install
node build
```

### Running the tests

Tests can run in the browser by opening a webserver and visiting the `test.html` page.
Automated tests that run the tests from the command line in Firefox can be run with

```
npm test
```
