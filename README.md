fn-eventify
============

fn-eventify attach EventEmitter interface to Function.

Installation
------------

```
npm install fn-eventify
```

Usage
-----

### Initilize

The first, You should initialize `fn-eventify` like a creating an instace of EventEmitter.

```js
import * as Eventify from 'fn-eventify'

const Eventor = Eventify.create();
```

Eventor has `eventify()`, `subscribe()` and `subscribeAll()`


### Creating an eventify function

```js
const fn = () => 'hello world';
const greet = Eventor.eventify('GREET', fn);
```

Callback function can return `Promise`.

```js
Eventor.eventify('ASYNC_SOMETHING', () => Promise.resolve());
```


### Subscribing an event

```js
greet.subscribe((event) => {...});
```

```js
Eventor.subscribe('GREET', (event) => {...})
```

You can listen all event.

```js
Eventor.subscribeAll((event) => {...})
```

### Unsubscribing an event

`subscribe()` return `unsubscribe()`.

```js
const unsubscribe = greet.subscribe((event) => {...});
unsubscribe();
```

```js
const unsubscribe = Eventor.subscribe('GREET', (event) => {...})
unsubscribe();
```

```js
const unsubscribe = Eventor.subscribeAll((event) => {...})
unsubscribe();
```

### Publishing an event

To publish, You just call eventified function simply.

```js
const message = greet() // return result and pubslish event

assert.equal(message, 'hello world')
```

## Event Structure

```ts
{
	name: string; // event name
	payload: any; // something that returned by function
}
```

### Extending an Event Structure

You can use `inject()`.

```js
const greet = Eventor.eventify('GREET', (message) => `hello ${message}`)
	.inject({ greetor: 'cotto' })

greet.subscribe((event) => {
	assert.deepEqual(event, {
		name: 'GREET',
		payload: 'hello world',
		greetor: 'cotto'
	})
})

greet('world'); //-> hello world
```



