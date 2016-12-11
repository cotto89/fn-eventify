import events = require('events');

export interface EventifyEvent {
    name: string;
    payload: any;
    [key: string]: any;
}

export type Listener = (event: EventifyEvent) => any;
export type Attacher = ((event: EventifyEvent) => EventifyEvent) | { [prop: string]: any }

export interface EmitOption<T> {
    subscribe: (listener: Listener) => Function;
    inject: (attacher: Attacher) => T & EmitOption<T>;
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

export function create<T extends events.EventEmitter>(CustomEventEmitter?: { new (): T }) {
    const emitter = CustomEventEmitter ? new CustomEventEmitter() : new events.EventEmitter();

    function subscribeAll(listener: Listener) {
        emitter.on(ALL_EVENT, listener);
        return () => emitter.removeListener(ALL_EVENT, listener);
    }

    function subscribe(eventName: string, listener: Listener) {
        emitter.on(eventName, listener);
        return () => emitter.removeListener(eventName, listener);
    }

    function eventify<R, T extends () => R>(eventName: string, action?: T): T & EmitOption<T>
    function eventify<A, R, T extends (a: A) => R>(eventName: string, action?: T): T & EmitOption<T>
    function eventify<T extends Function>(eventName: string, action?: Function): T & EmitOption<T> {

        let $attacher: Attacher = {};

        const emit: any = (value?: any) => {
            const payload = action ? action(value as any) : undefined;

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

        emit.subscribe = (listener: Listener) => subscribe(eventName, listener);
        emit.inject = (attacher: Attacher) => {
            $attacher = attacher;
            return emit as (T & EmitOption<T>);
        };

        return emit as T & EmitOption<T>;
    }

    return {
        eventify,
        subscribe,
        subscribeAll,
        _emitter: emitter, // for debugging
    };
}
