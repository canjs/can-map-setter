/*global School*/
require('./can-map-setter');
require('steal-qunit');

QUnit.module('can/map/setter');
QUnit.test('setter testing works', function(assert) {
	var Contact = can.Map({
		setBirthday: function (raw) {
			if (typeof raw === 'number') {
				return new Date(raw);
			} else if (raw instanceof Date) {
				return raw;
			}
		}
	});
	var date = new Date(),
		contact = new Contact({
			birthday: date.getTime()
		});
	// set via constructor
	assert.equal(contact.birthday.getTime(), date.getTime(), 'set as birthday');
	// set via attr method
	date = new Date();
	contact.attr('birthday', date.getTime());
	assert.equal(contact.birthday.getTime(), date.getTime(), 'set via attr');
	// set via attr method w/ multiple attrs
	date = new Date();
	contact.attr({
		birthday: date.getTime()
	});
	assert.equal(contact.birthday.getTime(), date.getTime(), 'set as birthday');
});
QUnit.test('error binding', 1, function(assert) {
	can.Map('School', {
		setName: function (name, success, error) {
			if (!name) {
				error('no name');
			}
			return error;
		}
	});
	var school = new School();
	school.bind('error', function (ev, attr, error) {
		assert.equal(error, 'no name', 'error message provided');
	});
	school.attr('name', '');
});
QUnit.test('asyncronous setting', function(assert) {
	var Meyer = can.Map({
		setName: function (newVal, success) {
			setTimeout(function () {
				success(newVal + ' Meyer');
			}, 1);
		}
	});
	var done = assert.async();
	var me = new Meyer();
	me.bind('name', function (ev, newVal) {
		assert.equal(newVal, 'Justin Meyer');
		assert.equal(me.attr('name'), 'Justin Meyer');
		done();
	});
	me.attr('name', 'Justin');
});

QUnit.test('setter function values are automatically batched (#815)', function(assert) {
	var Mapped = can.Map.extend({
		setFoo: function(newValue){
			this.attr("zed","ted");
			return newValue;
		}
	});

	var map = new Mapped(),
		batchNum;

	map.bind("zed", function(ev){
		batchNum = ev.batchNum;
		assert.ok(batchNum, "zed event is batched");
	});
	map.bind("foo", function(ev){
		assert.equal(batchNum, ev.batchNum, "batchNums are the same");
	});

	map.attr("foo","bar");

});


//!steal-remove-start
if (can.dev) {
	QUnit.test('setter function warns if a timeout did not happen (#808)', function(assert) {
		var done = assert.async();
		var oldlog = can.dev.warn;
		can.dev.warnTimeout = 10;
		can.dev.warn = function (text) {
			assert.ok(text, "got a message");
			can.batch.stop(true);
			can.dev.warn = oldlog;
			done();
		};
		var Mapped = can.Map.extend({
			setFoo: function(){}
		});

		var map = new Mapped();
		map.attr("foo", 1);

	});

	QUnit.test('setter function does not warn if setter is called back quickly (#808)', function(assert) {
		var done = assert.async();
		assert.expect(1);
		var oldlog = can.dev.warn;
		can.dev.warnTimeout = 100;
		var firstMsg = false;
		can.dev.warn = function () {
			// first warn is not the relevant message, there is a deprecation warning we need to ignore
			if(!firstMsg) {
				return;
			}
			assert.ok(false, "got a message");
			done();
		};
		var Mapped = can.Map.extend({
			setFoo: function(newValue, setter){
				setTimeout(function(){
					setter("BAR");
				},10);
			}
		});

		var map = new Mapped();
		map.attr("foo", 1);
		map.bind("foo", function(ev, newVal){
			assert.equal(newVal, "BAR", "new val set");
			done();
			can.dev.warn = oldlog;
		});

	});


}
//!steal-remove-end
