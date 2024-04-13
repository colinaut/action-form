import type ActionTableStepEvent from "./types";

declare global {
	interface GlobalEventHandlersEventMap {
		"af-step": CustomEvent<ActionTableStepEvent>;
	}
}

export {};
