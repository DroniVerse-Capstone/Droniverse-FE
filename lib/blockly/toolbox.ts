

export type ToolboxCategory =
	| "motion"
	| "loops"
	| "logic"
	| "sensors"
	| "math"
	| "effects"
	| "input"
	| "variables";

type CategoryDefinition = {
	name: string;
	colour: string;
	custom?: string;
	blocks?: string[];
};

const CATEGORY_DEFINITIONS: Record<ToolboxCategory, CategoryDefinition> = {
	motion: {
		name: "📍 Di chuyển",
		colour: "#3b82f6",
		blocks: [
			"drone_up",
			"drone_down",
			"drone_forward",
			"drone_back",
			"drone_left",
			"drone_right",
			"drone_turn_right",
			"drone_turn_left",
			"drone_land",
		],
	},
	loops: {
		name: "🔄 Vòng lặp",
		colour: "#10b981",
		blocks: ["drone_repeat"],
	},
	logic: {
		name: "🧠 Điều kiện",
		colour: "#f59e0b",
		blocks: ["drone_if", "drone_if_else"],
	},
	sensors: {
		name: "📡 Cảm biến",
		colour: "#ef4444",
		blocks: ["drone_is_obstacle_ahead"],
	},
	math: {
		name: "➗ Toán học",
		colour: "#a855f7",
		blocks: ["drone_amount_value", "drone_math_operation"],
	},
	effects: {
		name: "🎵 Hiệu ứng",
		colour: "#ec4899",
		blocks: ["drone_play_sound"],
	},
	input: {
		name: "⌨️ Input",
		colour: "#0ea5e9",
		blocks: ["drone_input_number"],
	},
	variables: {
		name: "📦 Biến",
		colour: "#ec4899",
		custom: "VARIABLE",
	},
};

export const SANDBOX_TOOLBOX_CATEGORIES: ToolboxCategory[] = [
	"motion",
	"loops",
	"logic",
	"sensors",
	"math",
	"effects",
	"input",
	"variables",
];

export const DEFAULT_LAB_TOOLBOX: ToolboxCategory[] = [...SANDBOX_TOOLBOX_CATEGORIES];


export function buildToolboxXml(categories: ToolboxCategory[] = DEFAULT_LAB_TOOLBOX): string {
	const seen = new Set<ToolboxCategory>();
	const xmlCategories = categories
		.filter((cat) => {
			if (seen.has(cat)) return false;
			seen.add(cat);
			return Boolean(CATEGORY_DEFINITIONS[cat]);
		})
		.map((cat) => {
			const def = CATEGORY_DEFINITIONS[cat];
			if (!def) return "";
			if (def.custom) {
				return `<category name="${def.name}" colour="${def.colour}" custom="${def.custom}"></category>`;
			}
			const blocks = def.blocks?.map((type) => `<block type="${type}" />`).join("\n") ?? "";
			return `<category name="${def.name}" colour="${def.colour}">
${blocks}
</category>`;
		})
		.join("\n");

	return `<xml id="toolbox" style="display:none">
${xmlCategories}
</xml>`;
}

