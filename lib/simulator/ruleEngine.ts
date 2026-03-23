import { MissionSettings } from "@/components/map-editor/MapEditor";

export type MissionState = {
    timeElapsed: number;
    currentScore: number;
    collectedCheckpoints: Set<number>;
    totalCheckpoints: number;
    collisions: number;
};

export type MissionResult = "playing" | "pass" | "fail";

export class RuleEngine {
    constructor(private settings: MissionSettings) { }

    public evaluate(state: MissionState): MissionResult {
        // 1. Check thất bại (Fail conditions)
        if (
            this.settings.timeLimit > 0 &&
            state.timeElapsed >= this.settings.timeLimit
        ) {
            return "fail"; // Hết giờ
        }

        // Mở rộng sau: if (state.collisions > maxCollisions) return 'fail';

        // 2. Check thành công (Win conditions)
        const passedScore =
            this.settings.requiredScore <= 0 ||
            state.currentScore >= this.settings.requiredScore;

        const passedCheckpoints =
            state.totalCheckpoints === 0 ||
            state.collectedCheckpoints.size === state.totalCheckpoints;

        // Phải hoàn thành cả điểm số và checkpoint mới thắng
        const hasWinCondition = state.totalCheckpoints > 0 || this.settings.requiredScore > 0;

        if (hasWinCondition && passedScore && passedCheckpoints) {
            return "pass";
        }

        return "playing";
    }
}
