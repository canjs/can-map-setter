/*can-map-setter@0.1.0#can-map-setter*/
var can = require('can/util/util');
require('can/map/map');
can.classize = function (s, join) {
    var parts = s.split(can.undHash), i = 0;
    for (; i < parts.length; i++) {
        parts[i] = can.capitalize(parts[i]);
    }
    return parts.join(join || '');
};
var classize = can.classize, proto = can.Map.prototype, old = proto.__set;
proto.__set = function (prop, value, current, success, error) {
    var self = this;
    var cap = classize(prop), setName = 'set' + cap, errorCallback = function (errors) {
            var stub = error && error.call(self, errors);
            if (stub !== false) {
                can.trigger(self, 'error', [
                    prop,
                    errors
                ], true);
            }
            return false;
        };
    if (this[setName]) {
        can.batch.start();
        value = this[setName](value, function (value) {
            old.call(self, prop, value, current, success, errorCallback);
        }, errorCallback);
        if (value === undefined) {
            can.batch.stop();
            return;
        } else {
            old.call(self, prop, value, current, success, errorCallback);
            can.batch.stop();
            return this;
        }
    } else {
        old.call(self, prop, value, current, success, errorCallback);
    }
    return this;
};
module.exports = exports = can.Map;