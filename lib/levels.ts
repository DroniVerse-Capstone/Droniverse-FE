import type { ToolboxCategory } from './blockly';
import { CANVAS_CENTER } from './simConfig';

export type Level = {
	id: string;
	name: string;
	environment: {
		start: {
			position: [number, number, number];
			headingDeg?: number;
		};
		goal: {
			position: [number, number, number];
			shape?: 'circle' | 'square';
			radius?: number;
			rotation?: [number, number, number];
			size?: [number, number];
		};
		obstacles: {
			id: string;
			type: string;
			position: [number, number, number];
			size: [number, number, number];
			color?: string;
			rotation?: [number, number, number];
		}[];
	};
	description: string;
	// toolboxCategories?: ToolboxCategory[];
};

export const LAB_LEVELS: Level[] = [
	{
		id: 'reach-goal-basic',
		name: 'Lab 1: Đến đích',
		environment: {
			start: { position: [75, 0, 0], headingDeg: 0 },
			goal: { position: [75, 0, -225], shape: "square", size: [50, 50] },
			obstacles: [],
		},
		description: 'Di chuyển thẳng đến vòng đích màu xanh.',
	},
	{
		id: 'avoid-obstacle',
		name: 'Lab 2: Tránh vật',
		environment: {
			start: { position: [100, 0, -100] },
			goal: { position: [100, 100, -400], shape: "circle", radius: 40, rotation: [0, 90, 0] },
			obstacles: [
				{
					id: "pillar-1",
					type: "box",
					position: [-150, 0, -200],
					size: [100, 50, 10],
					color: "#00d9ff",
					rotation: [0, 0, 0],
				},
				{
					id: "pillar-test",
					type: "cylinder",
					position: [-50, 0, -300], 
					size: [40, 50, 0],       
					color: "#00d9ff",
					rotation: [0, 90, 0],        
				}
				// {
				// 	id: "pillar-2",
				// 	type: "box",
				// 	position: [-50, -380, 50],
				// 	size: [40, 60, 40],
				// 	rotation: [0, 0, 0],
				// },
				// {
				// 	id: "wall-1",
				// 	type: "box",
				// 	position: [-200, -200, 30],
				// 	// long thin wall: length, height, thickness
				// 	size: [220, 30, 12],
				// 	rotation: [0, 0.2, 0],
				// },
			],
		},
		description: 'Bay tránh các chấm đỏ và tới đích.',
	},
];

export function getLevelById(levelId: string): Level {
	const raw = LAB_LEVELS.find((l) => l.id === levelId) ?? LAB_LEVELS[0];
	return normalizeLevelCoordinates(raw);
}

export function getHeadingTowardsGoal(level: Level): number {
	const dx = level.environment.goal.position[0] - level.environment.start.position[0];
	const dy = level.environment.goal.position[2] - level.environment.start.position[2];
	const rad = Math.atan2(dx, -dy); // clockwise from north
	return normalizeHeading((rad * 180) / Math.PI);
}

export function getInitialHeading(level: Level): number {
	if (typeof level.environment.start.headingDeg === "number") {
		return normalizeHeading(level.environment.start.headingDeg);
	}
	return normalizeHeading(0);
}

function normalizeHeading(deg: number): number {
	let d = deg % 360;
	if (d < 0) d += 360;
	return d;
}

function shiftToCanvasCoords<T extends { x: number; y: number }>(point: T): T {
	return {
		...point,
		x: point.x + CANVAS_CENTER.x,
		y: point.y + CANVAS_CENTER.y,
	};
}

function shiftPositionToCanvasCoords(position: [number, number, number]): [number, number, number] {
	return [
		position[0] + CANVAS_CENTER.x,
		position[1],
		position[2] + CANVAS_CENTER.y,
	];
}

function normalizeLevelCoordinates(level: Level): Level {
	return {
		...level,
		environment: {
			...level.environment,
			start: {
				...level.environment.start,
				position: shiftPositionToCanvasCoords(level.environment.start.position),
			},
			goal: {
				...level.environment.goal,
				position: shiftPositionToCanvasCoords(level.environment.goal.position),
			},
			obstacles: level.environment.obstacles.map((obs) => {
				const b = obs as any;
				return {
					...b,
					position: shiftPositionToCanvasCoords(b.position),
				};
			}),
		},
	};
}


