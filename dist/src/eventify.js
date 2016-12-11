"use strict";
const events = require('events');
exports.ALL_EVENT = Symbol('ALL_EVENT');
function createEvent(name, payload, attacher = {}) {
    let event = { name, payload };
    if (typeof attacher === 'function') {
        const attachment = attacher(event);
        if (attachment) {
            event = attachment;
        }
    }
    else {
        event = Object.assign(event, attacher);
    }
    return event;
}
function create(CustomEventEmitter) {
    const emitter = CustomEventEmitter ? new CustomEventEmitter() : new events.EventEmitter();
    function subscribeAll(listener) {
        emitter.on(exports.ALL_EVENT, listener);
        return () => emitter.removeListener(exports.ALL_EVENT, listener);
    }
    function subscribe(eventName, listener) {
        emitter.on(eventName, listener);
        return () => emitter.removeListener(eventName, listener);
    }
    function eventify(eventName, action) {
        let $attacher = {};
        const emit = (value) => {
            const payload = action ? action(value) : undefined;
            if (payload instanceof Promise) {
                Promise.resolve(payload).then(v => {
                    const event = createEvent(eventName, v, $attacher);
                    emitter.emit(eventName, event);
                    emitter.emit(exports.ALL_EVENT, event);
                });
            }
            else {
                const event = createEvent(eventName, payload, $attacher);
                emitter.emit(eventName, event);
                emitter.emit(exports.ALL_EVENT, event);
            }
            return payload;
        };
        emit.subscribe = (listener) => subscribe(eventName, listener);
        emit.inject = (attacher) => {
            $attacher = attacher;
            return emit;
        };
        return emit;
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