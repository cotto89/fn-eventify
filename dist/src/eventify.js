"use strict";
const events = require('events');
exports.ALL_EVENT = Symbol('ALL_EVENT');
function createEvent(name, payload, attachment = {}) {
    const event = {
        name,
        payload,
    };
    return Object.assign(event, attachment);
}
function create() {
    const emitter = new events.EventEmitter();
    function subscribeAll(listener) {
        emitter.on(exports.ALL_EVENT, listener);
        return () => emitter.removeListener(exports.ALL_EVENT, listener);
    }
    function subscribe(eventName, listener) {
        emitter.on(eventName, listener);
        return () => emitter.removeListener(eventName, listener);
    }
    function eventify(eventName, callback) {
        let attachment;
        function emit(args) {
            const payload = callback ? callback(args) : undefined;
            if (payload instanceof Promise) {
                Promise.resolve(payload).then(v => {
                    const event = createEvent(eventName, v, attachment);
                    emitter.emit(eventName, event);
                    emitter.emit(exports.ALL_EVENT, event);
                });
            }
            else {
                const event = createEvent(eventName, payload, attachment);
                emitter.emit(eventName, event);
                emitter.emit(exports.ALL_EVENT, event);
            }
            return payload;
        }
        let f = emit;
        f.subscribe = (listener) => subscribe(eventName, listener);
        f.inject = (extraEventProps) => {
            attachment = extraEventProps;
            return f;
        };
        let $emit = f;
        return $emit;
    }
    return {
        eventify,
        subscribe,
        subscribeAll,
        _emitter: emitter,
    };
}
exports.create = create;
//# sourceMappingURL=eventify.js.map