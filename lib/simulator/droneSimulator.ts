

import { normalizeAngle } from "@/helpers/angle";
import { DRONE_SPEED, ANIMATION_DURATION } from "../config3D/constants";
import { clampWithinCanvas } from "../config3D/simConfig";

export type DroneState = {
	x: number;
	y: number;
	headingDeg: number;
	altitude: number;
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


export class DroneController {
	private queue: Command[] = [];
	private status: ExecutionStatus = 'idle';
	private onTick?: (state: DroneState) => void;
	private onStatus?: (status: ExecutionStatus) => void;
	private state: DroneState;
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

	constructor(initial: DroneState) {
		this.state = { ...initial };
	}

	reset(initial: DroneState) {
		this.stop();
		this.state = { ...initial };
		this.queue = [];
		this.setStatus('idle');
		this.emitTick();
	}

	setGoalArea(area: { shape: "circle" | "square"; x: number; y: number; radius?: number; size?: [number, number]; altitude?: number } | null) {
		this.goalArea = area;
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

	setCallbacks(onTick?: (s: DroneState) => void, onStatus?: (st: ExecutionStatus) => void) {
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

	private setStatus(st: ExecutionStatus) {
		this.status = st;
		if (this.onStatus) this.onStatus(st);
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
		const states = this.previewCommand(this.getState(), cmd); // trả về DroneState[]

		for (let i = 0; i < states.length; i++) {
			const endState = states[i];

			const startState = this.getState();

			const dx = endState.x - startState.x;
			const dy = endState.y - startState.y;
			const dz = endState.altitude - startState.altitude;
			const distance3D = Math.hypot(dx, dy, dz);
			const headingDelta = Math.abs(shortestAngleDiff(startState.headingDeg, endState.headingDeg));

			let durationMs = ANIMATION_DURATION.DEFAULT_MS;
			if (distance3D > 0.0001) {
				durationMs = Math.max(
					ANIMATION_DURATION.MIN_MS,
					(distance3D / DRONE_SPEED.LINEAR_PX_PER_SEC) * 1000
				);
			} else if (headingDelta > 0.0001) {
				durationMs = Math.max(
					ANIMATION_DURATION.MIN_MS,
					(headingDelta / DRONE_SPEED.ANGULAR_DEG_PER_SEC) * 1000
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
						this.state = endState;

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
					const clamped = clampWithinCanvas(interpolatedX, interpolatedY);


					this.state = {
						x: clamped.x,
						y: clamped.y,
						headingDeg: interpolateHeading
							? normalizeAngle(lerpAngle(startState.headingDeg, endState.headingDeg, t))
							: endState.headingDeg,
						altitude: lerp(startState.altitude, endState.altitude, t),
					};
					this.emitTick();
					this.rafId = requestAnimationFrame(tick);
				};

				this.rafId = requestAnimationFrame(tick);
			});
		}

		onDone();
	}

	private isWithinGoal(s: DroneState): boolean {
		if (!this.goalArea) return false;
		const g = this.goalArea;
		const epsilon = 0.5;
		if (typeof g.altitude === "number" && s.altitude > g.altitude + epsilon) return false;
		if (g.shape === "square" && g.size) {
			const halfW = g.size[0] / 2;
			const halfD = g.size[1] / 2;
			return Math.abs(s.x - g.x) <= halfW && Math.abs(s.y - g.y) <= halfD;
		}
		if (g.shape === "circle" && typeof g.radius === "number") {
			return false;
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
		// Nếu drone đang ở mặt đất (altitude <= 0.1) và không phải lệnh take_off
		// → không thể di chuyển, trả về state hiện tại (Bắt buộc phải dùng block Cất cánh)
		if (cmd.type !== "take_off" && s.altitude <= 0.1) return [s];

		switch (cmd.type) {
			case "take_off":
				s.altitude = 200; // 1m
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
			// Chỉ thay đổi độ cao
			case 'up':
				s.altitude += cmd.amount;
				return [s];

			case 'down':
				s.altitude = Math.max(0, s.altitude - cmd.amount);
				return [s];

			case 'left': {
				// Xác định hướng hiện tại theo headingDeg
				let dirRad = 0;
				if (s.headingDeg === 0) dirRad = Math.PI;         // sang trái
				else if (s.headingDeg === 90) dirRad = (3 * Math.PI) / 2; // lên
				else if (s.headingDeg === 180) dirRad = 0;       // sang phải
				else if (s.headingDeg === 270) dirRad = Math.PI / 2; // xuống

				// Di chuyển theo hướng
				s.x += Math.cos(dirRad) * cmd.distance;
				s.y += Math.sin(dirRad) * cmd.distance;

				// Clamp để không bay ra ngoài border
				const clamped = clampWithinCanvas(s.x, s.y);
				s.x = clamped.x;
				s.y = clamped.y;

				// Cập nhật heading theo hướng di chuyển (xoay 90° sang trái)
				s.headingDeg = normalizeAngle(s.headingDeg - 90);
				return [s];
			}
			case 'right': {
				// Di chuyển theo hướng hiện tại
				// Nếu heading = 0 → sang phải
				// Sau khi đi xong → heading = 90 (hướng xuống)
				let dirRad = 0;
				if (s.headingDeg === 0) dirRad = 0;          // sang phải
				else if (s.headingDeg === 90) dirRad = Math.PI / 2;   // xuống
				else if (s.headingDeg === 180) dirRad = Math.PI;      // sang trái
				else if (s.headingDeg === 270) dirRad = (3 * Math.PI) / 2; // lên

				s.x += Math.cos(dirRad) * cmd.distance;
				s.y += Math.sin(dirRad) * cmd.distance;

				// Clamp để không bay ra ngoài border
				const clamped = clampWithinCanvas(s.x, s.y);
				s.x = clamped.x;
				s.y = clamped.y;

				// Cập nhật heading theo hướng di chuyển
				s.headingDeg = normalizeAngle(s.headingDeg + 90);

				// s.headingDeg = (s.headingDeg + 90) % 360;
				return [s];
			}
			case 'forward': {
				const rad = toRad(s.headingDeg);
				s.x += Math.sin(rad) * cmd.distance;
				s.y -= Math.cos(rad) * cmd.distance;

				// Clamp để không bay ra ngoài border
				const clamped = clampWithinCanvas(s.x, s.y);
				s.x = clamped.x;
				s.y = clamped.y;

				return [s];
			}

			case 'back': {
				const rad = toRad(s.headingDeg);
				s.x -= Math.sin(rad) * cmd.distance;
				s.y += Math.cos(rad) * cmd.distance;

				// Clamp để không bay ra ngoài border
				const clamped = clampWithinCanvas(s.x, s.y);
				s.x = clamped.x;
				s.y = clamped.y;

				return [s];
			}

			case 'turn_left': {
				// Chỉ xoay, không di chuyển
				s.headingDeg = normalizeAngle(s.headingDeg - cmd.degrees);
				return [s];
			}
			case 'turn_right': {
				// Chỉ xoay, không di chuyển
				s.headingDeg = normalizeAngle(s.headingDeg + cmd.degrees);
				return [s];
			}

			case 'land':
			case 'land':
				s.altitude = 0;
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

