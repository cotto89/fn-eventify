/// <reference types="node" />
import events = require('events');
export interface EventifyEvent {
    name: string;
    payload: any;
    [key: string]: any;
}
export declare type Listener = (event: EventifyEvent) => any;
export declare type AttacherFn = (event: EventifyEvent) => EventifyEvent;
export declare type AttacherObj = {
    [prop: string]: any;
};
export declare type Attacher = AttacherFn | AttacherObj;
export declare type Emit<Args, Payload> = {
    (args?: Args): Payload;
    subscribe: (listener: Listener) => Function;
    inject: (attacher: Attacher) => Emit<Args, Payload>;
};
export declare const ALL_EVENT: symbol;
export declare function create(): {
    eventify: <Args, Payload>(eventName: string, callback?: ((args?: Args | undefined) => Payload) | undefined) => ((args?: Args | undefined) => Payload | undefined) & {
        subscribe: (listener: Listener) => () => events.EventEmitter;
        inject: (attacher: Attacher) => {
            (args?: Args | undefined): Payload;
            subscribe: (listener: Listener) => Function;
            inject: (attacher: Attacher) => Emit<Args, Payload>;
        };
    };
    subscribe: (eventName: string, listener: Listener) => () => events.EventEmitter;
    subscribeAll: (listener: Listener) => () => events.EventEmitter;
    _emitter: events.EventEmitter;
};
