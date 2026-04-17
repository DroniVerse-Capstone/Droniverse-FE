
import type * as BlocklyType from "blockly/core";
import type { Command } from "../simulator/droneSimulator";

export type GeneratedProgram = Command[];


// Cấu hình: 
// true: Cho phép nhận giá trị từ các khối gán biến lơ lửng (Dễ cho học sinh)
// false: Bắt buộc phải nối vào luồng chính mới nhận (Giống code thật)
const SCAN_FLOATING_VARIABLES = true;

export function generateProgram(
	Blockly: typeof BlocklyType,
	workspace: BlocklyType.WorkspaceSvg
): GeneratedProgram {
	const commands: GeneratedProgram = [];
	const allBlocks = workspace.getAllBlocks(false);

	const procedureMap = new Map<string, any>();
	allBlocks.forEach((block) => {
		if (block.type === "procedures_defnoreturn" || block.type === "procedures_defreturn") {
			const name = block.getFieldValue("NAME");
			if (name) procedureMap.set(name, block);
		}
	});

	const variableMap = new Map<string, number>();
	const callStack = new Set<string>();
	const tam = 200;


	function evaluateValue(block: any): any {
		if (!block) return 0;

		switch (block.type) {
			case "math_number":
			case "drone_amount_value":
				return Number(block.getFieldValue("NUM") || block.getFieldValue("VAL") || 0);

			case "variables_get":
				const varName = block.getFieldValue("VAR");
				return variableMap.get(varName) || 0;

			case "math_arithmetic": {
				const a = evaluateValue(block.getInputTargetBlock("A"));
				const b = evaluateValue(block.getInputTargetBlock("B"));
				const op = block.getFieldValue("OP");
				switch (op) {
					case "ADD": return a + b;
					case "MINUS": return a - b;
					case "MULTIPLY": return a * b;
					case "DIVIDE": return b !== 0 ? a / b : 0;
					case "POWER": return Math.pow(a, b);
					default: return 0;
				}
			}

			case "drone_math_operation": {
				const a = evaluateValue(block.getInputTargetBlock("A"));
				const b = evaluateValue(block.getInputTargetBlock("B"));
				const op = block.getFieldValue("OP");
				switch (op) {
					case "ADD": return a + b;
					case "MINUS": return a - b;
					case "MULTIPLY": return a * b;
					case "DIVIDE": return b !== 0 ? a / b : 0;
					default: return 0;
				}
			}

			case "math_modulo": {
				const a = evaluateValue(block.getInputTargetBlock("DIVIDEND"));
				const b = evaluateValue(block.getInputTargetBlock("DIVISOR"));
				return b !== 0 ? a % b : 0;
			}

			case "logic_boolean":
				return block.getFieldValue("BOOL") === "TRUE";

			case "logic_compare": {
				const a = evaluateValue(block.getInputTargetBlock("A"));
				const b = evaluateValue(block.getInputTargetBlock("B"));
				const op = block.getFieldValue("OP");
				switch (op) {
					case "EQ": return a === b;
					case "NEQ": return a !== b;
					case "LT": return a < b;
					case "LTE": return a <= b;
					case "GT": return a > b;
					case "GTE": return a >= b;
					default: return false;
				}
			}

			case "logic_operation": {
				const a = evaluateValue(block.getInputTargetBlock("A"));
				const b = evaluateValue(block.getInputTargetBlock("B"));
				const op = block.getFieldValue("OP");
				return op === "AND" ? (a && b) : (a || b);
			}

			case "logic_negate":
				return !evaluateValue(block.getInputTargetBlock("BOOL"));

			case "procedures_callreturn": {
				const procName = block.getFieldValue("NAME");
				const procDef = procedureMap.get(procName);
				if (procDef && !callStack.has(procName)) {
					callStack.add(procName);
					const stackBlock = procDef.getInputTargetBlock("STACK");
					if (stackBlock) walkBlock(stackBlock);
					const returnValue = evaluateValue(procDef.getInputTargetBlock("RETURN"));
					callStack.delete(procName);
					return returnValue;
				}
				return 0;
			}

			default:
				return 0;
		}
	}

	// NEW: Pre-scan stage - Find all top-level variable assignments
	// This ensures that even if assignment blocks are floating, their values are captured.
	const topBlocks = workspace.getTopBlocks(true);
	if (SCAN_FLOATING_VARIABLES) {
		topBlocks.forEach(block => {
			if (block.type === "variables_set") {
				const varName = block.getFieldValue("VAR");
				const value = evaluateValue(block.getInputTargetBlock("VALUE"));
				variableMap.set(varName, value);
			}
		});
	}

	function walkBlock(block: any): Command[] {
		const result: Command[] = [];
		let currentBlock = block;

		while (currentBlock) {
			const type = currentBlock.type;

			switch (type) {
				case "drone_take_off":
					result.push({ type: "take_off" });
					break;

				case "drone_up": {
					const val = evaluateValue(currentBlock.getInputTargetBlock("AMOUNT")) || Number(currentBlock.getFieldValue("AMOUNT"));
					result.push({ type: "up", amount: val * tam });
					break;
				}
				case "drone_down": {
					const val = evaluateValue(currentBlock.getInputTargetBlock("AMOUNT")) || Number(currentBlock.getFieldValue("AMOUNT"));
					result.push({ type: "down", amount: val * tam });
					break;
				}
				case "drone_left": {
					const val = evaluateValue(currentBlock.getInputTargetBlock("DIST")) || Number(currentBlock.getFieldValue("DIST"));
					result.push({ type: "left", distance: val * tam });
					break;
				}
				case "drone_right": {
					const val = evaluateValue(currentBlock.getInputTargetBlock("DIST")) || Number(currentBlock.getFieldValue("DIST"));
					result.push({ type: "right", distance: val * tam });
					break;
				}
				case "drone_forward": {
					const val = evaluateValue(currentBlock.getInputTargetBlock("DIST")) || Number(currentBlock.getFieldValue("DIST"));
					result.push({ type: "forward", distance: val * tam });
					break;
				}
				case "drone_back": {
					const val = evaluateValue(currentBlock.getInputTargetBlock("DIST")) || Number(currentBlock.getFieldValue("DIST"));
					result.push({ type: "back", distance: val * tam });
					break;
				}
				case "drone_turn_right": {
					const val = evaluateValue(currentBlock.getInputTargetBlock("DEG")) || Number(currentBlock.getFieldValue("DEG"));
					result.push({ type: "turn_right", degrees: val });
					break;
				}
				case "drone_turn_left": {
					const val = evaluateValue(currentBlock.getInputTargetBlock("DEG")) || Number(currentBlock.getFieldValue("DEG"));
					result.push({ type: "turn_left", degrees: val });
					break;
				}

				case "variables_set": {
					const varName = currentBlock.getFieldValue("VAR");
					const value = evaluateValue(currentBlock.getInputTargetBlock("VALUE"));
					variableMap.set(varName, value);
					break;
				}

				case "math_change": {
					const varName = currentBlock.getFieldValue("VAR");
					const delta = evaluateValue(currentBlock.getInputTargetBlock("DELTA"));
					const current = variableMap.get(varName) || 0;
					variableMap.set(varName, current + delta);
					break;
				}

				case "drone_if": {
					const condition = evaluateValue(currentBlock.getInputTargetBlock("CONDITION"));
					if (condition) {
						const doBlock = currentBlock.getInputTargetBlock("DO");
						if (doBlock) result.push(...walkBlock(doBlock));
					}
					break;
				}

				case "drone_if_else": {
					const condition = evaluateValue(currentBlock.getInputTargetBlock("CONDITION"));
					if (condition) {
						const doBlock = currentBlock.getInputTargetBlock("DO");
						if (doBlock) result.push(...walkBlock(doBlock));
					} else {
						const elseBlock = currentBlock.getInputTargetBlock("ELSE");
						if (elseBlock) result.push(...walkBlock(elseBlock));
					}
					break;
				}

				case "drone_repeat": {
					const countBlock = currentBlock.getInputTargetBlock("COUNT");
					const count = countBlock ? evaluateValue(countBlock) : Number(currentBlock.getFieldValue("COUNT") || 0);
					const doBlock = currentBlock.getInputTargetBlock("DO");
					const innerCommands = doBlock ? walkBlock(doBlock) : [];
					result.push({ type: "repeat", count, actions: innerCommands });
					break;
				}

				case "drone_land":
					result.push({ type: "land" });
					break;

				case "procedures_callnoreturn":
				case "procedures_callreturn": {
					const procName = currentBlock.getFieldValue("NAME");
					const procDef = procedureMap.get(procName);
					if (procDef && !callStack.has(procName)) {
						callStack.add(procName);
						const stackBlock = procDef.getInputTargetBlock("STACK");
						if (stackBlock) result.push(...walkBlock(stackBlock));
						callStack.delete(procName);
					}
					break;
				}
			}
			currentBlock = currentBlock.getNextBlock();
		}
		return result;
	}

	// 2. Only process top blocks that are NOT function definitions
	for (const topBlock of topBlocks) {
		if (topBlock.type !== "procedures_defnoreturn" && topBlock.type !== "procedures_defreturn") {
			commands.push(...walkBlock(topBlock));
		}
	}

	return commands;
}

