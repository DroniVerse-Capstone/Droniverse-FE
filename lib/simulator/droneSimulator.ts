import * as THREE from "three";
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from "three-mesh-bvh";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { normalizeAngle } from "@/helpers/angle";
import { clampWithinCanvas, CANVAS_CENTER, WORLD_SCALE_VALUE, ALTITUDE_SCALE } from "../config3D/simConfig";
import { SIMULATOR_CONFIG } from "./config";

// Add BVH support to Three.js
// @ts-ignore
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
// @ts-ignore
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
// @ts-ignore
THREE.Mesh.prototype.raycast = acceleratedRaycast;

export type DroneState = {
	x: number;
	y: number;
	headingDeg: number;
	altitude: number;
	batteryConsumed?: number;
	isStarted?: boolean;
};

export type Command =
	| { type: 'up'; amount: number }
	| { type: 'down'; amount: number }
	| { type: 'left'; distance: number }
	| { type: 'right'; distance: number }
	| { type: 'forward'; distance: number }
	| { type: 'back'; distance: number }
	| { type: 'turn_right'; degrees: number }
	| { type: 'turn_left'; degrees: number }
	| { type: 'land' }
	| { type: 'take_off' }
	| { type: 'repeat'; count: number; actions: Command[] };

export type ExecutionStatus = 'idle' | 'running' | 'completed' | 'goal_reached' | 'failed';
export type FailReason = 'collision' | 'battery' | 'out_of_bounds' | 'timeout' | '';

export class DroneController {
	private queue: Command[] = [];
	private status: ExecutionStatus = 'idle';
	private failReason: FailReason = '';
	private onTick?: (state: DroneState) => void;
	private onStatus?: (status: ExecutionStatus, reason?: FailReason) => void;
	private state: DroneState;
	private obstacles: any[] = [];
	private obstaclePhysics: {
		id: string;
		mesh: THREE.Mesh;
		raw: any;
	}[] = [];
	private goalArea:
		| {
			shape: "circle" | "square";
			x: number;
			y: number;
			radius?: number;
			size?: [number, number];
			altitude?: number;
		}
		| null = null;

	private rafId: number | null = null;
	private worldConfig: { width: number; height: number; padding: number };
	private canvasCenter: { x: number; y: number };

	constructor(initial: DroneState, worldConfig?: { width: number; height: number; padding: number }) {
		this.state = { ...initial };
		this.worldConfig = worldConfig || { width: SIMULATOR_CONFIG.world.canvas.width, height: SIMULATOR_CONFIG.world.canvas.height, padding: SIMULATOR_CONFIG.world.canvas.padding };
		this.canvasCenter = { x: this.worldConfig.width / 2, y: this.worldConfig.height / 2 };
	}

	reset(initial: DroneState) {
		this.stop();
		this.state = { ...initial, batteryConsumed: 0 };
		this.queue = [];
		this.setStatus('idle');
		this.emitTick();
	}

	setGoalArea(area: { shape: "circle" | "square"; x: number; y: number; radius?: number; size?: [number, number]; altitude?: number } | null) {
		this.goalArea = area;
	}

	setObstacles(obs: any[]) {
		this.obstacles = obs;
		this.obstaclePhysics = [];

		for (const ob of obs) {
			const posRaw = ob.position;
			const scaleRaw = ob.raw?.scale || ob.size || [1, 1, 1];
			const rotationDegree = ob.rotation || [0, 0, 0];
			if (!posRaw) continue;

			// Axis coordinates
			const posX = Array.isArray(posRaw) ? posRaw[0] : (posRaw?.x ?? 0);
			const posY = Array.isArray(posRaw) ? posRaw[1] : (posRaw?.y ?? 0);
			const posZ = Array.isArray(posRaw) ? posRaw[2] : (posRaw?.z ?? 0);

			const sX = Array.isArray(scaleRaw) ? scaleRaw[0] : (scaleRaw?.x ?? 1);
			const sY = Array.isArray(scaleRaw) ? scaleRaw[1] : (scaleRaw?.y ?? 1);
			const sZ = Array.isArray(scaleRaw) ? scaleRaw[2] : (scaleRaw?.z ?? 1);

			// Use rotation directly as Radians (matching MapEditor's storage)
			const rotX = rotationDegree[0] || 0;
			const rotY = rotationDegree[1] || 0;
			const rotZ = rotationDegree[2] || 0;

			const primitiveType = ob.raw?.modelUrl?.replace("primitive:", "") || (ob.type === "obstacle" ? "box" : "");
			const isBox = primitiveType === "box";
			const isTree = primitiveType.includes("tree");

			// 1. Geometry Setup (Unit size with pivot at base)
			let geometry: THREE.BufferGeometry;
			if (isBox) {
				// 1x1x1 box, bottom at 0
				geometry = new THREE.BoxGeometry(1, 1, 1, 4, 4, 4).translate(0, 0.5, 0);
			} else if (isTree) {
				const trunk = new THREE.CylinderGeometry(0.12, 0.12, 0.7, 8).translate(0, 0.35, 0);
				const canopy1 = new THREE.SphereGeometry(0.48, 8, 8).translate(0, 0.7 + 0.28, 0);
				const canopy2 = new THREE.SphereGeometry(0.38, 8, 8).translate(0, 0.7 + 0.65, 0);
				const canopy3 = new THREE.SphereGeometry(0.30, 8, 8).translate(0, 0.7 + 0.98, 0);
				const canopy4 = new THREE.SphereGeometry(0.18, 8, 8).translate(0, 0.7 + 1.22, 0);
				geometry = BufferGeometryUtils.mergeGeometries([trunk, canopy1, canopy2, canopy3, canopy4]);
			} else {
				geometry = new THREE.BoxGeometry(1, 1, 1, 4, 4, 4).translate(0, 0.5, 0);
			}

			// @ts-ignore
			geometry.computeBoundsTree();

			const mesh = new THREE.Mesh(geometry);

			// 2. UNIFIED WORLD TRANSFORMATION (1:1 with standard models)
			const worldPos = new THREE.Vector3(posX, posY, posZ);
			const worldQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(rotX, rotY, rotZ));
			const worldScale = new THREE.Vector3(sX, sY, sZ);

			mesh.matrixWorld.compose(worldPos, worldQuat, worldScale);

			this.obstaclePhysics.push({
				id: ob.id || Math.random().toString(),
				mesh: mesh,
				raw: { ...ob, finalWorldScale: [sX, sY, sZ] }
			});
		}
	}

	getObstacleBounds() {
		return this.obstaclePhysics.map(p => ({
			id: p.id,
			matrix: p.mesh.matrixWorld.toArray(),
			size: p.raw.finalWorldScale,
			raw: p.raw
		}));
	}

	getFailReason(): FailReason {
		return this.failReason;
	}

	getState(): DroneState {
		return { ...this.state };
	}

	getStatus(): ExecutionStatus {
		return this.status;
	}

	getQueueLength(): number {
		return this.queue.length;
	}

	setCallbacks(onTick?: (s: DroneState) => void, onStatus?: (st: ExecutionStatus, reason?: FailReason) => void) {
		this.onTick = onTick;
		this.onStatus = onStatus;
	}

	enqueue(cmd: Command) {
		this.queue.push(cmd);
	}

	enqueueMany(cmds: Command[]) {
		this.queue.push(...cmds);
	}

	run() {
		if (this.status === 'running') return;
		this.setStatus('running');
		this.step();
	}

	stop() {
		if (this.rafId !== null) {
			cancelAnimationFrame(this.rafId);
			this.rafId = null;
		}
		if (this.status === 'running') this.setStatus('idle');
	}

	private setStatus(status: ExecutionStatus, reason: FailReason = '') {
		this.status = status;
		this.failReason = reason;
		if (this.onStatus) this.onStatus(status, reason);
	}

	private emitTick() {
		if (this.onTick) this.onTick(this.getState());
	}


	private step() {
		if (this.queue.length === 0) {
			this.setStatus('completed');
			this.emitTick();
			return;
		}
		const cmd = this.queue.shift()!;
		this.applyCommandAnimated(cmd, () => {
			if (this.status !== 'running') return;
			this.step();
		});
	}

	async stepOnce() {
		if (this.queue.length === 0) {
			this.setStatus('completed');
			this.emitTick();
			return;
		}
		if (this.status === 'running') return;

		const cmd = this.queue.shift()!;
		this.setStatus('running');
		await this.applyCommandAnimated(cmd, () => { });
		if (this.queue.length === 0) {
			this.setStatus('completed');
		} else {
			this.setStatus('idle');
		}
		this.emitTick();
	}

	private async applyCommandAnimated(cmd: Command, onDone: () => void) {
		try {
			const states = this.previewCommand(this.getState(), cmd); // trả về DroneState[]

			for (let i = 0; i < states.length; i++) {
				if (this.status === 'failed') break; // Hard stop if already failed
				const endState = states[i];

				const startState = this.getState();

				const dx = endState.x - startState.x;
				const dy = endState.y - startState.y;
				const dz = endState.altitude - startState.altitude;
				const distance3D = Math.hypot(dx, dy, dz);
				const headingDelta = Math.abs(endState.headingDeg - startState.headingDeg);

				// Calculate fuel cost for this command
				const fuelCostLinear = distance3D * SIMULATOR_CONFIG.physics.batteryConsumptionMultiplier.linear;
				const fuelCostAngular = headingDelta * SIMULATOR_CONFIG.physics.batteryConsumptionMultiplier.angular;
				const totalFuelCost = fuelCostLinear + fuelCostAngular;
				const startBattery = startState.batteryConsumed || 0;
				const endBattery = startBattery + totalFuelCost;

				let durationMs = SIMULATOR_CONFIG.animation.defaultMs;
				if (cmd.type === 'take_off') {
					durationMs = 1500; // 1.5s delay sequence for propeller spin up
				} else if (cmd.type === 'land') {
					durationMs = Math.max(1000, distance3D > 0.0001 ? (distance3D / SIMULATOR_CONFIG.speed.linear) * 1000 : 1000);
				} else if (distance3D > 0.0001) {
					durationMs = Math.max(
						SIMULATOR_CONFIG.animation.minMs,
						(distance3D / SIMULATOR_CONFIG.speed.linear) * 1000
					);
				} else if (headingDelta > 0.0001) {
					durationMs = Math.max(
						SIMULATOR_CONFIG.animation.minMs,
						(headingDelta / SIMULATOR_CONFIG.speed.angular) * 1000
					);
				}

				const isAbsoluteMove =
					cmd.type === 'up' ||
					cmd.type === 'down' ||
					cmd.type === 'left' ||
					cmd.type === 'right' ||
					cmd.type === 'take_off';

				if (isAbsoluteMove) {
					this.state = { ...this.state, headingDeg: endState.headingDeg };
					this.emitTick();
				}

				const interpolateHeading = cmd.type === 'turn_left' || cmd.type === 'turn_right';

				await new Promise<void>((resolve) => {
					const startTime = performance.now();

					const tick = () => {
						const t = (performance.now() - startTime) / durationMs;

						if (t >= 1) {
							this.state = { ...endState, headingDeg: normalizeAngle(endState.headingDeg), batteryConsumed: endBattery };

							if (this.goalArea && this.isWithinGoal(this.state)) {
								const g = this.goalArea;
								const epsilon = 0.5;
								const approachedFromAbove = startState.altitude > (g.altitude ?? 0) + epsilon && endState.altitude <= (g.altitude ?? 0) + epsilon;
								if (approachedFromAbove && endState.altitude < startState.altitude) {
									if (g.shape === "square" && g.size) {
										const halfW = g.size[0] / 2;
										const halfD = g.size[1] / 2;
										this.state.x = Math.max(g.x - halfW, Math.min(g.x + halfW, this.state.x));
										this.state.y = Math.max(g.y - halfD, Math.min(g.y + halfD, this.state.y));
									} else if (g.shape === "circle" && typeof g.radius === "number") {
									}
									this.state.altitude = g.altitude ?? this.state.altitude;
									this.queue = [];
									this.setStatus("goal_reached");
								}
							}

							this.emitTick();
							resolve();
							return;
						}

						const interpolatedX = lerp(startState.x, endState.x, t);
						const interpolatedY = lerp(startState.y, endState.y, t);
						const interpolatedAltitude = lerp(startState.altitude, endState.altitude, t);
						const clamped = clampWithinCanvas(interpolatedX, interpolatedY, this.worldConfig);

						const nextState: DroneState = {
							x: clamped.x,
							y: clamped.y,
							headingDeg: interpolateHeading
								? lerp(startState.headingDeg, endState.headingDeg, t)
								: endState.headingDeg,
							altitude: interpolatedAltitude,
							batteryConsumed: lerp(startBattery, endBattery, t),
							isStarted: cmd.type === 'take_off' ? true : startState.isStarted,
						};

						if (this.checkCollision(nextState)) {
							this.state = nextState; // Position at impact (High)
							this.setStatus('failed', 'collision');
							if (SIMULATOR_CONFIG.debug.logCollisions) {
								console.warn("🔥 DRONE COLLIDED!", nextState);
							}
							this.emitTick(); // Emit impact state

							// Then set to ground for visual fall
							this.state = { ...nextState, altitude: 0 };
							resolve();
							return;
						}

						this.state = nextState;
						this.emitTick();
						this.rafId = requestAnimationFrame(tick);
					};

					this.rafId = requestAnimationFrame(tick);
				});

				if ((this.status as string) === 'failed') {
					break; // Exit the states loop immediately on collision
				}
			}

			onDone();
		} catch (err) {
			console.error("[DroneSimulator] Lỗi trong applyCommandAnimated:", err);
			this.setStatus('failed', 'collision');
			onDone();
		}
	}

	private checkCollision(s: DroneState): boolean {
		if (this.obstaclePhysics.length === 0) return false;

		const DRONE_RADIUS = SIMULATOR_CONFIG.physics.droneRadius;

		// Drone (world space)
		const dx = (s.x - this.canvasCenter.x) * WORLD_SCALE_VALUE;
		const dy = s.altitude * ALTITUDE_SCALE;
		const dz = (s.y - this.canvasCenter.y) * WORLD_SCALE_VALUE;

		const droneSphere = new THREE.Sphere(new THREE.Vector3(dx, dy, dz), DRONE_RADIUS);
		const tempMatrix = new THREE.Matrix4();
		const tempSphere = new THREE.Sphere();

		for (const { mesh } of this.obstaclePhysics) {
			// Unity-style MeshCollider precision using BVH
			// 1. Transform drone world sphere into mesh local space
			tempMatrix.copy(mesh.matrixWorld).invert();
			tempSphere.copy(droneSphere).applyMatrix4(tempMatrix);

			// @ts-ignore - Shapecast check for triangle-level accuracy
			const hit = mesh.geometry.boundsTree.shapecast({
				intersectsBounds: (box: THREE.Box3) => box.intersectsSphere(tempSphere),
				intersectsTriangle: (tri: any) => tri.intersectsSphere(tempSphere),
			});

			if (hit) return true;
		}

		return false;
	};

	private isWithinGoal(s: DroneState): boolean {
		if (!this.goalArea) return false;
		const g = this.goalArea;

		// In our system, altitude units are cm (e.g. 100 = 0.5m in visual, 200 = 1m).
		// Epsilon 40 means within ~20cm of the pad's surface.
		const altitudeEpsilon = 40;
		const isAtCorrectAltitude = Math.abs(s.altitude - (g.altitude ?? 0)) < altitudeEpsilon;

		if (!isAtCorrectAltitude) return false;

		if (g.shape === "square" && g.size) {
			const halfW = g.size[0] / 2;
			const halfD = g.size[1] / 2;
			return Math.abs(s.x - g.x) <= halfW && Math.abs(s.y - g.y) <= halfD;
		}
		if (g.shape === "circle" && typeof g.radius === "number") {
			const distSq = Math.pow(s.x - g.x, 2) + Math.pow(s.y - g.y, 2);
			return distSq <= Math.pow(g.radius, 2);
		}
		return false;
	}









	/**
	 * Tính toán vị trí mới khi thực hiện một command
	 * 
	 * Input:
	 * - state: Vị trí hiện tại của drone
	 * - cmd: Lệnh cần thực hiện
	 * 
	 * Output:
	 * - Mảng các DroneState: [state1, state2, ...]
	 *   Mỗi state là một vị trí trung gian để animation mượt mà
	 * 
	 * Ví dụ:
	 * - forward 100m → có thể trả về [state sau 10m, state sau 20m, ..., state sau 100m]
	 * - turn_right 90° → trả về [state sau 30°, state sau 60°, state sau 90°]
	 * 
	 * Logic:
	 * - Mỗi loại command có cách tính toán khác nhau
	 * - forward/back: Dùng heading để tính hướng di chuyển
	 * - left/right: Vừa di chuyển vừa xoay 90°
	 * - turn_left/turn_right: Chỉ xoay, không di chuyển
	 * - repeat: Lặp lại các commands bên trong
	 */
	private previewCommand(state: DroneState, cmd: Command): DroneState[] {
		const s = { ...state };

		// 1. Phải khởi động động cơ trước khi làm bất kỳ hành động nào khác
		if (cmd.type !== "take_off" && !s.isStarted) return [s];

		// 2. Fly rules: Không thể di chuyển ngang khi đang ở mặt đất
		const isAllowedOnGround = cmd.type === 'up' || cmd.type === 'down' || cmd.type === 'take_off' || cmd.type === 'land' || cmd.type === 'turn_left' || cmd.type === 'turn_right';
		if (!isAllowedOnGround && s.altitude <= SIMULATOR_CONFIG.physics.groundSafeHeight) return [s];


		switch (cmd.type) {
			case "take_off":
				s.isStarted = true;
				return [s];

			case "repeat": {
				let tempState = { ...s };
				const states: DroneState[] = [];
				for (let i = 0; i < cmd.count; i++) {
					for (const action of cmd.actions) {
						const intermediateStates: any = this.previewCommand(tempState, action);
						tempState = intermediateStates[intermediateStates.length - 1];
						states.push(...intermediateStates);
					}
				}
				return states;
			}

			case 'up': {
				return [{ ...s, altitude: s.altitude + cmd.amount }];
			}

			case 'down': {
				return [{ ...s, altitude: Math.max(0, s.altitude - cmd.amount) }];
			}

			case 'left':
			case 'right':
			case 'forward':
			case 'back': {
				const dist = cmd.distance;

				let angle = s.headingDeg;
				if (cmd.type === 'left') angle -= 90;
				if (cmd.type === 'right') angle += 90;
				if (cmd.type === 'back') angle += 180;

				const rad = (angle * Math.PI) / 180;
				const moveX = Math.sin(rad);
				const moveY = -Math.cos(rad);

				const targetX = s.x + moveX * dist;
				const targetY = s.y + moveY * dist;

				const clamped = clampWithinCanvas(targetX, targetY, this.worldConfig);
				return [{ ...s, x: clamped.x, y: clamped.y }];
			}

			case 'turn_left':
				s.headingDeg = s.headingDeg - cmd.degrees;
				return [s];

			case 'turn_right':
				s.headingDeg = s.headingDeg + cmd.degrees;
				return [s];

			case 'land':
				s.altitude = 0;
				s.isStarted = false;
				return [s];

			default:
				return [s];
		}
	}



}

function toRad(deg: number) {
	return (deg * Math.PI) / 180;
}

function lerp(a: number, b: number, t: number) {
	return a + (b - a) * t;
}

function lerpAngle(a: number, b: number, t: number) {
	// choose shortest path
	let diff = ((b - a + 540) % 360) - 180;
	return a + diff * t;
}

function shortestAngleDiff(a: number, b: number) {
	let diff = ((b - a + 540) % 360) - 180;
	return diff;
}

