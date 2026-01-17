import { SIMULATION_CANVAS, WORLD_SCALE } from "./constants";

export const SIM_CANVAS = {
	width: SIMULATION_CANVAS.WIDTH,
	height: SIMULATION_CANVAS.HEIGHT,
	padding: SIMULATION_CANVAS.PADDING,
};

export const WORLD_SCALE_VALUE = WORLD_SCALE.POSITION;
export const ALTITUDE_SCALE = WORLD_SCALE.ALTITUDE;

export const CANVAS_CENTER = {
	x: SIM_CANVAS.width / 2,
	y: SIM_CANVAS.height / 2,
};

export type WorldPosition = {
	x: number;
	y: number;
	z: number;
};

export function clampWithinCanvas(x: number, y: number) {
	const pad = SIM_CANVAS.padding;
	const clampedX = Math.max(pad, Math.min(SIM_CANVAS.width - pad, x));
	const clampedY = Math.max(pad, Math.min(SIM_CANVAS.height - pad, y));
	return { x: clampedX, y: clampedY };
}

export function projectToWorld(xPx: number, yPx: number, altitude: number): WorldPosition {
	const centeredX = xPx - CANVAS_CENTER.x;
	const centeredZ = yPx - CANVAS_CENTER.y;
	return {
		x: centeredX * WORLD_SCALE_VALUE,
		y: altitude * ALTITUDE_SCALE,
		z: centeredZ * WORLD_SCALE_VALUE,
	};
}

export function radiusToWorld(radiusPx: number) {
	return Math.max(1, radiusPx * WORLD_SCALE_VALUE);
}

export function worldToCanvas(xWorld: number, zWorld: number) {
	return {
		x: xWorld / WORLD_SCALE_VALUE + CANVAS_CENTER.x,
		y: zWorld / WORLD_SCALE_VALUE + CANVAS_CENTER.y,
	};
}

