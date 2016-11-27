import assert = require('power-assert');
import sinon = require('sinon');
import * as Eventify from './../src/index';
import { ALL_EVENT } from './../src/eventify';

describe('Eventify', () => {
    let Eventor = Eventify.create();
    let spy = sinon.spy();

    beforeEach(() => {
        Eventor = Eventify.create();
        spy.reset();
    });

    describe('eventify()', () => {
        it('return emit(), emit.subscribe(), emit.inject', () => {
            const emit = Eventor.eventify('DEMO');

            assert.equal(typeof emit, 'function');
            assert.equal(typeof emit.subscribe, 'function');
            assert.equal(typeof emit.inject, 'function');
        });
    });

    describe('emit()', () => {
        it('emit event when emit calling', () => {
            const emit = Eventor.eventify('DEMO');
            emit.subscribe(spy);
            emit();

            assert(spy.calledWithExactly({ name: 'DEMO', payload: undefined }));
        });

        it('return callback result', () => {
            const emit = Eventor.eventify('DEMO', () => true);
            emit.subscribe(spy);
            const result = emit();

            assert.equal(result, true);
            assert(spy.calledWithExactly({ name: 'DEMO', payload: true }));
        });

        context('when callback return Promise', () => {
            it('publish event after resolve Promise', async () => {
                const emit = Eventor.eventify('Promise', () => Promise.resolve(true));
                emit.subscribe(spy);
                await emit();

                assert(spy.calledWithExactly({ name: 'Promise', payload: true }));
            });
        });
    });

    describe('emit.inject()', () => {
        it('return emit function', () => {
            const emitA = Eventor.eventify('DEMO');
            const emitB = emitA.inject((e) => Object.assign(e, { extra: true }));
            assert(emitA === emitB);
        });

        context('when attcher is function', () => {
            it('inject extra props to event', () => {
                const emit = Eventor.eventify('DEMO').inject((e) => Object.assign(e, { extra: true }));
                emit.subscribe(spy);
                emit();
                assert(spy.calledWithExactly({ name: 'DEMO', payload: undefined, extra: true }));
            });
        });

        context('when attcher is Object', () => {
            it('inject extra props to event object', () => {
                const emit = Eventor.eventify('DEMO').inject({ extra: true });
                emit.subscribe(spy);
                emit();
                assert(spy.calledWithExactly({ name: 'DEMO', payload: undefined, extra: true }));
            });
        });
    });

    describe('emit.subject()', () => {
        it('register listener and return unsubscribe function', () => {
            const emitter = Eventor._emitter;
            const emit = Eventor.eventify('DEMO');

            assert.equal(emitter.listenerCount('DEMO'), 0);

            const unsubscribe = emit.subscribe((e) => { assert(e); });

            assert.equal(emitter.listenerCount('DEMO'), 1);

            unsubscribe();
            assert.equal(emitter.listenerCount('DEMO'), 0);
        });
    });

    describe('subscribe()', function () {
        it('register listener to specific event', () => {
            const emitter = Eventor._emitter;
            const emit = Eventor.eventify('DEMO');

            assert.equal(emitter.listenerCount('DEMO'), 0);
            // register
            const unsubscribe = Eventor.subscribe('DEMO', spy);
            Eventor.subscribe('DEMO', spy);

            assert.equal(emitter.listenerCount('DEMO'), 2);

            emit();
            assert(spy.calledWithExactly({ name: 'DEMO', payload: undefined }));

            unsubscribe();
            assert.equal(emitter.listenerCount('DEMO'), 1);
        });
    });

    describe('subscribeAll', function () {
        it('listen all event', () => {
            const emitter = Eventor._emitter;
            const emitA = Eventor.eventify('DEMO-A').inject({ extra: true });
            const emitB = Eventor.eventify('DEMO-B').inject(e => Object.assign(e, { extra: true }));

            assert.equal(emitter.listenerCount('DEMO-A'), 0);
            assert.equal(emitter.listenerCount('DEMO-b'), 0);
            assert.equal(emitter.listenerCount(ALL_EVENT), 0);

            const unsubscribe = Eventor.subscribeAll(spy);
            Eventor.subscribeAll(() => ({}));

            assert.equal(emitter.listenerCount('DEMO-A'), 0);
            assert.equal(emitter.listenerCount('DEMO-b'), 0);
            assert.equal(emitter.listenerCount(ALL_EVENT), 2);

            emitA();
            emitB();

            assert(spy.callCount === 2);
            assert(spy.firstCall.calledWithExactly({ name: 'DEMO-A', payload: undefined, extra: true }));
            assert(spy.secondCall.calledWithExactly({ name: 'DEMO-B', payload: undefined, extra: true }));

            unsubscribe();

            assert.equal(emitter.listenerCount('DEMO-A'), 0);
            assert.equal(emitter.listenerCount('DEMO-b'), 0);
            assert.equal(emitter.listenerCount(ALL_EVENT), 1);
        });
    });
});
