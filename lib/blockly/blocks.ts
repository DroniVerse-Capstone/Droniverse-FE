import type * as BlocklyType from "blockly/core";

type BlockTranslations = {
	takeOff: { message: string; tooltip: string };
	up: { message: string; tooltip: string };
	down: { message: string; tooltip: string };
	left: { message: string; tooltip: string };
	right: { message: string; tooltip: string };
	forward: { message: string; tooltip: string };
	backward: { message: string; tooltip: string };
	turnRight: { message: string; tooltip: string };
	turnLeft: { message: string; tooltip: string };
	land: { message: string; tooltip: string };
	repeat: { message: string; tooltip: string };
	if: { message: string; tooltip: string };
	ifElse: { message: string; tooltip: string; elseMessage?: string };
	isObstacleAhead: { message: string; tooltip: string };
	amountValue: { tooltip: string };
	mathOperation: { tooltip: string };
	playSound: { message: string; tooltip: string };
	inputNumber: { message: string; tooltip: string };
};

export function registerDroneBlocks(Blockly: typeof BlocklyType, translations: BlockTranslations) {
	const define =
		(Blockly as any).common?.defineBlocksWithJsonArray ??
		(Blockly as any).defineBlocksWithJsonArray;

	define([
		{
			type: "drone_take_off",
			message0: translations.takeOff.message,
			previousStatement: true,
			nextStatement: true,
			colour: 320,
			tooltip: translations.takeOff.tooltip,
		},
		{
			type: "drone_up",
			message0: translations.up.message,
			args0: [{ type: "field_number", name: "AMOUNT", value: 1, min: 1, max: 10, precision: 1 }],
			previousStatement: true,
			nextStatement: true,
			colour: 230,
			tooltip: translations.up.tooltip,
		},
		{
			type: "drone_down",
			message0: translations.down.message,
			args0: [{ type: "field_number", name: "AMOUNT", value: 1, min: 1, max: 10, precision: 1 }],
			previousStatement: true,
			nextStatement: true,
			colour: 230,
			tooltip: translations.down.tooltip,
		},
		{
			type: "drone_left",
			message0: translations.left.message,
			args0: [{ type: "field_number", name: "DIST", value: 1, min: 1, max: 10, precision: 1 }],
			previousStatement: true,
			nextStatement: true,
			colour: 160,
			tooltip: translations.left.tooltip,
		},
		{
			type: "drone_right",
			message0: translations.right.message,
			args0: [{ type: "field_number", name: "DIST", value: 1, min: 1, max: 10, precision: 1 }],
			previousStatement: true,
			nextStatement: true,
			colour: 160,
			tooltip: translations.right.tooltip,
		},
		{
			type: "drone_forward",
			message0: translations.forward.message,
			args0: [{ type: "field_number", name: "DIST", value: 1, min: 1, max: 10, precision: 1 }],
			previousStatement: true,
			nextStatement: true,
			colour: 160,
			tooltip: translations.forward.tooltip,
		},
		{
			type: "drone_back",
			message0: translations.backward.message,
			args0: [{ type: "field_number", name: "DIST", value: 1, min: 1, max: 10, precision: 1 }],
			previousStatement: true,
			nextStatement: true,
			colour: 160,
			tooltip: translations.backward.tooltip,
		},
		{
			type: "drone_turn_right",
			message0: translations.turnRight.message,
			args0: [{ type: "field_number", name: "DEG", value: 90, min: 0, max: 360 }],
			previousStatement: true,
			nextStatement: true,
			colour: 20,
			tooltip: translations.turnRight.tooltip,
		},
		{
			type: "drone_turn_left",
			message0: translations.turnLeft.message,
			args0: [{ type: "field_number", name: "DEG", value: 90, min: 0, max: 360 }],
			previousStatement: true,
			nextStatement: true,
			colour: 20,
			tooltip: translations.turnLeft.tooltip,
		},
		{
			type: "drone_land",
			message0: translations.land.message,
			previousStatement: true,
			colour: 0,
			tooltip: translations.land.tooltip,
		},
		{
			type: "drone_repeat",
			message0: translations.repeat.message,
			args0: [{ type: "field_number", name: "COUNT", value: 3, min: 1 }],
			message1: "%1",
			args1: [{ type: "input_statement", name: "DO" }],
			previousStatement: true,
			nextStatement: true,
			colour: 120,
			tooltip: translations.repeat.tooltip,
		},
		{
			type: "drone_if",
			message0: translations.if.message,
			args0: [{ type: "input_value", name: "CONDITION", check: "Boolean" }],
			message1: "%1",
			args1: [{ type: "input_statement", name: "DO" }],
			previousStatement: true,
			nextStatement: true,
			colour: 210,
			tooltip: translations.if.tooltip,
		},
		{
			type: "drone_if_else",
			message0: translations.ifElse.message,
			args0: [{ type: "input_value", name: "CONDITION", check: "Boolean" }],
			message1: "%1",
			args1: [{ type: "input_statement", name: "DO" }],
			message2: translations.ifElse.elseMessage || "Else %1",
			args2: [{ type: "input_statement", name: "ELSE" }],
			previousStatement: true,
			nextStatement: true,
			colour: 210,
			tooltip: translations.ifElse.tooltip,
		},
		{
			type: "drone_is_obstacle_ahead",
			message0: translations.isObstacleAhead.message,
			output: "Boolean",
			colour: 210,
			tooltip: translations.isObstacleAhead.tooltip,
		},
		{
			type: "drone_amount_value",
			message0: "%1",
			args0: [{ type: "field_number", name: "VAL", value: 1, min: 1, max: 100 }],
			output: "Number",
			colour: 230,
			tooltip: translations.amountValue.tooltip,
		},
		{
			type: "drone_math_operation",
			message0: "%1 %2 %3",
			args0: [
				{ type: "input_value", name: "A", check: "Number" },
				{ type: "field_dropdown", name: "OP", options: [["+", "ADD"], ["-", "MINUS"], ["×", "MULTIPLY"], ["÷", "DIVIDE"]] },
				{ type: "input_value", name: "B", check: "Number" },
			],
			output: "Number",
			colour: 230,
			tooltip: translations.mathOperation.tooltip,
		},
		{
			type: "drone_play_sound",
			message0: translations.playSound.message,
			args0: [
				{ type: "field_dropdown", name: "SOUND", options: [["Beep", "beep"], ["Chime", "chime"], ["Buzzer", "buzzer"]] },
			],
			previousStatement: true,
			nextStatement: true,
			colour: 290,
			tooltip: translations.playSound.tooltip,
		},
		{
			type: "drone_input_number",
			message0: translations.inputNumber.message,
			args0: [{ type: "field_input", name: "PROMPT", text: "Nhập số" }],
			output: "Number",
			colour: 160,
			tooltip: translations.inputNumber.tooltip,
		},
	]);
}
