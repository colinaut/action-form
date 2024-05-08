type Context = { execute: () => void };

const context: Context[] = [];

export function createSignal<T>(value: T): [() => T, (value: T) => void] {
	const subscriptions = new Set<Context>();

	const read = () => {
		const observer = context[context.length - 1];
		if (observer) subscriptions.add(observer);
		return value;
	};
	const write = (newValue: T) => {
		value = newValue;
		for (const observer of subscriptions) {
			observer.execute();
		}
	};

	return [read, write];
}

export function createEffect(fn: () => void) {
	const effect = {
		execute() {
			context.push(effect);
			fn();
			context.pop();
		},
	};

	effect.execute();
}
