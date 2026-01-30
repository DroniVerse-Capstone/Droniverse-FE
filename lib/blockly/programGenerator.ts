
import type * as BlocklyType from "blockly/core";
import type { Command } from "../simulator/droneSimulator";

export type GeneratedProgram = Command[];


export function generateProgram(
	Blockly: typeof BlocklyType,
	workspace: BlocklyType.WorkspaceSvg
): GeneratedProgram {
	const commands: GeneratedProgram = [];
	const topBlocks = workspace.getTopBlocks(true);

	function walkBlock(block: any): Command[] {
		const result: Command[] = [];
		let currentBlock = block;
		const tam = 200;
		while (currentBlock) {
			switch (currentBlock.type) {
				case "drone_take_off":
					result.push({ type: "take_off" });
					break;
				case "drone_up":
					result.push({ type: "up", amount: (Number(currentBlock.getFieldValue("AMOUNT")) * tam) || 0 });
					break;
				case "drone_down":
					result.push({ type: "down", amount: (Number(currentBlock.getFieldValue("AMOUNT")) * tam) || 0 });
					break;
				case "drone_left":
					result.push({ type: "left", distance: (Number(currentBlock.getFieldValue("DIST")) * tam) || 0 });
					break;
				case "drone_right":
					result.push({ type: "right", distance: (Number(currentBlock.getFieldValue("DIST")) * tam) || 0 });
					break;
				case "drone_forward":
					result.push({ type: "forward", distance: (Number(currentBlock.getFieldValue("DIST")) * tam) || 0 });
					break;
				case "drone_back":
					result.push({ type: "back", distance: (Number(currentBlock.getFieldValue("DIST")) * tam) || 0 });
					break;
				case "drone_turn_right":
					result.push({ type: "turn_right", degrees: Number(currentBlock.getFieldValue("DEG")) || 0 });
					break;
				case "drone_turn_left":
					result.push({ type: "turn_left", degrees: Number(currentBlock.getFieldValue("DEG")) || 0 });
					break;
				case "drone_repeat": {
					const count: number = Number(currentBlock.getFieldValue("COUNT")) || 0;
					const doBlock = currentBlock.getInputTargetBlock("DO");
					const innerCommands = doBlock ? walkBlock(doBlock) : [];
					result.push({ type: "repeat", count, actions: innerCommands });
					break;
				}
				case "drone_land":
					result.push({ type: "land" });
					break;
			}
			currentBlock = currentBlock.getNextBlock();
		}
		return result;
	}

	for (const topBlock of topBlocks) {
		commands.push(...walkBlock(topBlock));
	}

	return commands;
}

