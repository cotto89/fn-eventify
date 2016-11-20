/// <reference types="node" />
import events = require('events');
export interface EventifyEvent {
    name: string;
    payload: any;
    [key: string]: any;
}
export declare type Listener = (event: EventifyEvent) => any;
export declare type Emit<Args, Payload> = {
    (args?: Args): Payload;
    subscribe: (listener: Listener) => Function;
    inject: (extraEventProps: {
        [key: string]: any;
    }) => Emit<Args, Payload>;
};
export declare const ALL_EVENT: symbol;
export declare function create(): {
    eventify: <Args, Payload>(eventName: string, callback?: ((args?: Args | undefined) => Payload) | undefined) => {
        (args?: Args | undefined): Payload;
        subscribe: (listener: Listener) => Function;
        inject: (extraEventProps: {
            [key: string]: any;
        }) => Emit<Args, Payload>;
    };
    subscribe: (eventName: string, listener: Listener) => () => events.EventEmitter;
    subscribeAll: (listener: Listener) => () => events.EventEmitter;
    _emitter: events.EventEmitter;
};
