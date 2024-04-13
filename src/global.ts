import type { ActionFormStepEvent } from "./types";

declare global {
	interface GlobalEventHandlersEventMap {
		"af-step": CustomEvent<ActionFormStepEvent>;
	}
}

export {};
