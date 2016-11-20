import events = require('events');

export interface EventifyEvent {
    name: string;
    payload: any;
    [key: string]: any;
}

export type Listener = (event: EventifyEvent) => any;

export type Emit<Args, Payload> = {
    (args?: Args): Payload;
    subscribe: (listener: Listener) => Function;
    inject: (extraEventProps: { [key: string]: any }) => Emit<Args, Payload>
}

export const ALL_EVENT = Symbol('ALL_EVENT');

function createEvent(name: string, payload: any, attachment: Object = {}): EventifyEvent {
    const event = {
        name,
        payload,
    };

    return Object.assign(event, attachment);
}

export function create() {
    const emitter = new events.EventEmitter();

    function subscribeAll(listener: Listener) {
        emitter.on(ALL_EVENT, listener);
        return () => emitter.removeListener(ALL_EVENT, listener);
    }

    function subscribe(eventName: string, listener: Listener) {
        emitter.on(eventName, listener);
        return () => emitter.removeListener(eventName, listener);
    }

    function eventify<Args, Payload>(eventName: string, callback?: (args?: Args) => Payload) {

        let attachment: { [key: string]: any };

        function emit(args?: Args) {
            const payload = callback ? callback(args) : undefined;

            if (payload instanceof Promise) {
                Promise.resolve(payload).then(v => {
                    const event = createEvent(eventName, v, attachment);
                    emitter.emit(eventName, event);
                    emitter.emit(ALL_EVENT, event);
                });
            } else {
                const event = createEvent(eventName, payload, attachment);
                emitter.emit(eventName, event);
                emitter.emit(ALL_EVENT, event);
            }

            return payload;
        }

        let f: any = emit;

        f.subscribe = (listener: Listener) => subscribe(eventName, listener);

        f.inject = (extraEventProps: {}) => {
            attachment = extraEventProps;
            return f as Emit<Args, Payload>;
        };

        let $emit: Emit<Args, Payload> = f;
        return $emit;
    }

    return {
        eventify,
        subscribe,
        subscribeAll,
        _emitter: emitter, // for debugging
    };
}
