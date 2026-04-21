export type ToolboxCategory =
	| "motion"
	| "loops"
	| "logic"
	| "sensors"
	| "math"
	| "variables"
	| "functions";

type CategoryDefinition = {
	name: string;
	colour: string;
	custom?: string;
	blocks?: string[];
};

type Translations = {
	categories: {
		motion: string;
		loops: string;
		logic: string;
		sensors: string;
		math: string;
		variables: string;
		functions: string;
	};
};

function getCategoryDefinitions(translations: Translations): Record<ToolboxCategory, CategoryDefinition> {
	return {
		motion: {
			name: translations.categories.motion,
			colour: "#3b82f6",
			blocks: [
				"drone_take_off",
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
			name: translations.categories.loops,
			colour: "#10b981",
			blocks: ["drone_repeat"],
		},
		logic: {
			name: translations.categories.logic,
			colour: "#f59e0b",
			blocks: ["drone_if", "drone_if_else", "logic_compare", "logic_operation", "logic_negate", "logic_boolean"],
		},
		sensors: {
			name: translations.categories.sensors,
			colour: "#ef4444",
			blocks: ["drone_is_obstacle_ahead"],
		},
		math: {
			name: translations.categories.math,
			colour: "#a855f7",
			blocks: ["math_number", "math_arithmetic", "math_modulo", "drone_amount_value", "drone_math_operation"],
		},
		variables: {
			name: translations.categories.variables,
			colour: "#ec4899",
			custom: "VARIABLE",
		},
		functions: {
			name: translations.categories.functions,
			colour: "#9966ff",
			custom: "PROCEDURE",
		},
	};
}

export const SANDBOX_TOOLBOX_CATEGORIES: ToolboxCategory[] = [
	"motion",
	"loops",
	"logic",
	"sensors",
	"math",
	"variables",
	"functions",
];

export const DEFAULT_LAB_TOOLBOX: ToolboxCategory[] = [...SANDBOX_TOOLBOX_CATEGORIES];


export function buildToolboxXml(
	categories: ToolboxCategory[] = DEFAULT_LAB_TOOLBOX,
	translations?: Translations,
	allowedBlocks?: string[]
): string {
	const defaultTranslations: Translations = {
		categories: {
			motion: "📍 Motion",
			loops: "🔄 Loops",
			logic: "🧠 Logic",
			sensors: "📡 Sensors",
			math: "➗ Math",
			variables: "📦 Variables",
			functions: "🧩 Functions",
		},
	};
	const CATEGORY_DEFINITIONS = getCategoryDefinitions(translations || defaultTranslations);
	const seen = new Set<ToolboxCategory>();

	// Ensure allowedBlocks is treated as a restriction if it's an array or a valid JSON string
	let allowedArray: string[] | null = null;
	try {
		if (Array.isArray(allowedBlocks)) {
			allowedArray = allowedBlocks;
		} else if (typeof allowedBlocks === "string") {
			const parsed = JSON.parse(allowedBlocks);
			if (Array.isArray(parsed)) allowedArray = parsed;
		} else if (allowedBlocks && typeof allowedBlocks === "object") {
			allowedArray = Object.values(allowedBlocks);
		}
	} catch (e) {
		allowedArray = null;
	}

	const xmlCategories = categories
		.filter((cat) => {
			if (seen.has(cat)) return false;
			seen.add(cat);
			return Boolean(CATEGORY_DEFINITIONS[cat]);
		})
		.map((cat) => {
			const def = CATEGORY_DEFINITIONS[cat];
			if (!def) return "";
			const isRestricted = !!allowedArray && allowedArray.length > 0;

			if (def.custom) {
				// If custom blocks are defined (Variables/Functions), check if their pseudo-blocks 
				// "category_variables" or "category_functions" are in allowedBlocks
				if (isRestricted) {
					if (def.custom === "VARIABLE" && !allowedArray?.includes("category_variables")) return "";
					if (def.custom === "PROCEDURE" && !allowedArray?.includes("category_functions")) return "";
				}
				return `<category name="${def.name}" colour="${def.colour}" custom="${def.custom}"></category>`;
			}

			const availableBlocks = (def.blocks || []).filter(type => {
				if (!isRestricted) return true;
				return (allowedArray as string[]).includes(type);
			});

			if (isRestricted && (!availableBlocks || availableBlocks.length === 0)) return "";

			const blocks = availableBlocks.map((type) => {
				// Thêm shadow blocks cho các khối di chuyển để vừa nhập số được, vừa lắp biến được
				if (type === "drone_up" || type === "drone_down") {
					return `<block type="${type}"><value name="AMOUNT"><shadow type="math_number"><field name="NUM">1</field></shadow></value></block>`;
				}
				if (["drone_forward", "drone_back", "drone_left", "drone_right"].includes(type)) {
					return `<block type="${type}"><value name="DIST"><shadow type="math_number"><field name="NUM">1</field></shadow></value></block>`;
				}
				if (type === "drone_turn_right" || type === "drone_turn_left") {
					return `<block type="${type}"><value name="DEG"><shadow type="math_number"><field name="NUM">90</field></shadow></value></block>`;
				}
				return `<block type="${type}" />`;
			}).join("\n") ?? "";
			return `<category name="${def.name}" colour="${def.colour}">
${blocks}
</category>`;
		})
		.filter(catStr => catStr !== "")
		.join("\n");

	return `<xml id="toolbox" style="display:none">
${xmlCategories}
</xml>`;
}
