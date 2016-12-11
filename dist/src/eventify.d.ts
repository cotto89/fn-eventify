/// <reference types="node" />
import events = require('events');
export interface EventifyEvent {
    name: string;
    payload: any;
    [key: string]: any;
}
export declare type Listener = (event: EventifyEvent) => any;
export declare type Attacher = ((event: EventifyEvent) => EventifyEvent) | {
    [prop: string]: any;
};
export interface EmitOption<T> {
    subscribe: (listener: Listener) => Function;
    inject: (attacher: Attacher) => T & EmitOption<T>;
}
export declare const ALL_EVENT: symbol;
export declare function create<T extends events.EventEmitter>(CustomEventEmitter?: {
    new (): T;
}): {
    eventify: {
        <R, T extends () => R>(eventName: string, action?: T | undefined): T & EmitOption<T>;
        <A, R, T extends (a: A) => R>(eventName: string, action?: T | undefined): T & EmitOption<T>;
    };
    subscribe: (eventName: string, listener: Listener) => () => events.EventEmitter;
    subscribeAll: (listener: Listener) => () => events.EventEmitter;
    _emitter: events.EventEmitter;
};
