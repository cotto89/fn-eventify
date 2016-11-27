import events = require('events');

export interface EventifyEvent {
    name: string;
    payload: any;
    [key: string]: any;
}

export type Listener = (event: EventifyEvent) => any;

export type AttacherFn = (event: EventifyEvent) => EventifyEvent
export type AttacherObj = { [prop: string]: any }
export type Attacher = AttacherFn | AttacherObj

export type Emit<Args, Payload> = {
    (args?: Args): Payload;
    subscribe: (listener: Listener) => Function;
    inject: (attacher: Attacher) => Emit<Args, Payload>
}

export const ALL_EVENT = Symbol('ALL_EVENT');

function createEvent(name: string, payload: any, attacher: Attacher = {}): EventifyEvent {
    let event = { name, payload };

    if (typeof attacher === 'function') {
        const attachment = attacher(event);

        if (attachment) {
            event = attachment;
        }

    } else {
        event = Object.assign(event, attacher);
    }

    return event;
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

        let $attacher: Attacher = {};

        const emit = (args?: Args) => {
            const payload = callback ? callback(args) : undefined;

            if (payload instanceof Promise) {
                Promise.resolve(payload).then(v => {
                    const event = createEvent(eventName, v, $attacher);
                    emitter.emit(eventName, event);
                    emitter.emit(ALL_EVENT, event);
                });
            } else {
                const event = createEvent(eventName, payload, $attacher);
                emitter.emit(eventName, event);
                emitter.emit(ALL_EVENT, event);
            }

            return payload;
        };

        const option = {
            subscribe: (listener: Listener) => subscribe(eventName, listener),
            inject: (attacher: Attacher) => {
                $attacher = attacher;
                return emit as Emit<Args, Payload>;
            },
        };

        const $emit = Object.assign(emit, option);
        return $emit;
    }

    return {
        eventify,
        subscribe,
        subscribeAll,
        _emitter: emitter, // for debugging
    };
}
