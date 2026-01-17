import { getLevelById } from "./levels";

export type LabMeta = {
	id: string;
	levelId: string;
	title: string;
	summary: string;
	estimatedMinutes: number;
	tags?: string[];
};

export type LabChapter = {
	id: string;
	title: string;
	description: string;
	labs: LabMeta[];
};

export type LabModule = {
	id: string;
	title: string;
	description: string;
	audience?: string;
	chapters: LabChapter[];
};

export const LAB_MODULES: LabModule[] = [
	{
		id: "module-intro",
		title: "Module 1 · Điều khiển cơ bản",
		description:
			"Làm quen bố cục toạ độ, điều hướng drone về phía mục tiêu và tránh chướng ngại vật.",
		audience: "Phù hợp với lớp 6+ sau khi đã học qua Scratch hoặc Blockly.",
		chapters: [
			{
				id: "chapter-orientation",
				title: "Chương 1 · Di chuyển định hướng",
				description: "Các lab tập trung vào việc điều khiển drone bay thẳng và tránh vật cản.",
				labs: [
					{
						id: "reach-goal-basic",
						levelId: "reach-goal-basic",
						title: "Lab 1: Đến đích",
						summary: "Sử dụng block di chuyển để bay thẳng tới vòng tròn đích.",
						estimatedMinutes: 10,
						tags: ["điều hướng", "tọa độ"],
					},
					{
						id: "avoid-obstacle",
						levelId: "avoid-obstacle",
						title: "Lab 2: Tránh vật",
						summary: "Kết hợp rẽ trái/phải để bay vòng qua chướng ngại và tới đích.",
						estimatedMinutes: 15,
						tags: ["tránh vật", "logic"],
					},
				],
			},
		],
	},
];

export function getModuleById(moduleId: string): LabModule | undefined {
	return LAB_MODULES.find((module) => module.id === moduleId);
}

export function findLabInModule(module: LabModule, labId: string): { chapter: LabChapter; lab: LabMeta } | undefined {
	for (const chapter of module.chapters) {
		const lab = chapter.labs.find((l) => l.id === labId);
		if (lab) return { chapter, lab };
	}
	return undefined;
}

export function getLabLevel(levelId: string) {
	return getLevelById(levelId);
}

