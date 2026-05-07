"use client";

import React, { useEffect, useRef, useState } from "react";
import * as Blockly from "blockly/core";
import "blockly/blocks";
// We use the default language generator for JavaScript to tap into blockly's generation, 
// but we will write custom generators for our blocks.
import { javascriptGenerator } from "blockly/javascript";
// import * as En from "blockly/msg/en";
import { FieldSlider } from "@blockly/field-slider";
import 'blockly/msg/en';
import '@/styles/blocklyCustom.css';

// Register the slider field
Blockly.fieldRegistry.register('field_slider', FieldSlider);

const blockStyles = {
  flight_blocks: {
    colourPrimary: "#db4139",
    colourSecondary: "#e26660",
    colourTertiary: "#c53a33",
  },
  control_blocks: {
    colourPrimary: "#10b981",
    colourSecondary: "#34d399",
    colourTertiary: "#059669",
  },
  timing_blocks: {
    colourPrimary: "#3b82f6",
    colourSecondary: "#60a5fa",
    colourTertiary: "#2563eb",
  },
  logic_blocks: {
    colourPrimary: "#f59e0b",
    colourSecondary: "#fbbf24",
    colourTertiary: "#d97706",
  },
  variable_blocks: {
    colourPrimary: "#ec4899",
    colourSecondary: "#f472b6",
    colourTertiary: "#db2777",
  },
};

const droneTheme = Blockly.Theme.defineTheme('droneTheme', {
  name: 'droneTheme',
  base: Blockly.Themes.Classic,
  blockStyles: blockStyles,
  categoryStyles: {
    flight_category: { colour: "#3f5165" },
    control_category: { colour: "#3f5165" },
    timing_category: { colour: "#3f5165" },
    logic_category: { colour: "#3f5165" },
    variable_category: { colour: "#3f5165" },
  },
  componentStyles: {
    workspaceBackgroundColour: '#0F172B',
    toolboxBackgroundColour: '#111122',
    toolboxForegroundColour: '#cbd5e1',
    flyoutBackgroundColour: '#1a1a2e',
    flyoutForegroundColour: '#cbd5e1',
    flyoutOpacity: 0.95,
    insertionMarkerColour: '#3b82f6',
    insertionMarkerOpacity: 0.3,
    scrollbarColour: 'transparent',
    cursorColour: '#3b82f6',
  },
  fontStyle: {
    family: "'Inter', sans-serif",
    weight: "600",
    size: 12
  },
  startHats: true,
});

// Define blocks
const defineBlocks = () => {
  Blockly.Blocks['drone_takeoff'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(" CẤT CÁNH");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#6366f1");
      this.setTooltip("Bắt đầu bay lên từ mặt đất");
    }
  };

  Blockly.Blocks['drone_land'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(" HẠ CÁNH");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#6366f1");
      this.setTooltip("Từ từ hạ cánh xuống mặt đất");
    }
  };

  Blockly.Blocks['drone_emergency_stop'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(" DỪNG KHẨN CẤP");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#ef4444");
      this.setTooltip("Dừng toàn bộ động cơ ngay lập tức!");
    }
  };

  // Move Blocks
  Blockly.Blocks['drone_go_simple'] = {
    init: function () {
      this.appendDummyInput()
        .appendField("🧭 DI CHUYỂN")
        .appendField(new Blockly.FieldDropdown([
          ["TIẾN", "FORWARD"],
          ["LÙI", "BACKWARD"],
          ["SANG TRÁI", "LEFT"],
          ["SANG PHẢI", "RIGHT"],
          ["LÊN CAO", "UP"],
          ["XUỐNG THẤP", "DOWN"]
        ]), "DIRECTION")
      this.appendDummyInput()
        .appendField("TRONG")
        .appendField(new Blockly.FieldNumber(1, 0.1, 10), "DURATION")
        .appendField("S")
      this.appendDummyInput()
        .appendField("LỰC")
        .appendField(new FieldSlider(40, 0, 100), "POWER")
        .appendField("%");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#6366f1");
      this.setInputsInline(true);
    }
  };

  Blockly.Blocks['drone_turn_simple'] = {
    init: function () {
      this.appendDummyInput()
        .appendField("🔄 QUAY")
        .appendField(new Blockly.FieldDropdown([
          ["TRÁI", "LEFT"],
          ["PHẢI", "RIGHT"]
        ]), "DIRECTION")
        .appendField("TRONG")
        .appendField(new Blockly.FieldNumber(1, 0.1, 10), "DURATION")
        .appendField("S VỚI")
        .appendField(new FieldSlider(50, 0, 100), "POWER")
        .appendField("%");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#6366f1");
      this.setInputsInline(true);
    }
  };

  Blockly.Blocks['drone_turn_degrees'] = {
    init: function () {
      this.appendDummyInput()
        .appendField("📐 XOAY GÓC")
        .appendField(new Blockly.FieldDropdown([
          ["TRÁI", "LEFT"],
          ["PHẢI", "RIGHT"]
        ]), "DIRECTION")
        .appendField("GÓC")
        .appendField(new Blockly.FieldDropdown([
          ["30°", "30"],
          ["45°", "45"],
          ["90°", "90"],
          ["180°", "180"]
        ]), "DEGREES");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#6366f1");
      this.setInputsInline(true);
    }
  };

  Blockly.Blocks['drone_set_throttle'] = {
    init: function () {
      this.appendDummyInput()
        .appendField("⚡ LỰC NÂNG")
        .appendField(new FieldSlider(65, 0, 100), "THROTTLE")
        .appendField("% TRONG")
        .appendField(new Blockly.FieldNumber(1), "DURATION")
        .appendField("S");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#ec4899");
      this.setInputsInline(true);
    }
  };

  Blockly.Blocks['drone_set_pitch'] = {
    init: function () {
      this.appendDummyInput()
        .appendField("↕ NGHIÊNG DỌC")
        .appendField(new Blockly.FieldDropdown([
          ["TRƯỚC", "FORWARD"],
          ["SAU", "BACKWARD"]
        ]), "DIRECTION")
        .appendField(new FieldSlider(10, 0, 30), "PITCH")
        .appendField("° TRONG")
        .appendField(new Blockly.FieldNumber(1), "DURATION")
        .appendField("S VỚI LỰC")
        .appendField(new FieldSlider(50, 0, 100), "POWER")
        .appendField("%");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#ec4899");
      this.setInputsInline(true);
    }
  };

  Blockly.Blocks['drone_set_roll'] = {
    init: function () {
      this.appendDummyInput()
        .appendField("↔ NGHIÊNG NGANG")
        .appendField(new Blockly.FieldDropdown([
          ["TRÁI", "LEFT"],
          ["PHẢI", "RIGHT"]
        ]), "DIRECTION")
        .appendField(new FieldSlider(10, 0, 30), "ROLL")
        .appendField("° TRONG")
        .appendField(new Blockly.FieldNumber(1), "DURATION")
        .appendField("S VỚI LỰC")
        .appendField(new FieldSlider(50, 0, 100), "POWER")
        .appendField("%");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#ec4899");
      this.setInputsInline(true);
    }
  };

  Blockly.Blocks['drone_set_yaw'] = {
    init: function () {
      this.appendDummyInput()
        .appendField("↪ QUAY THÂN")
        .appendField(new Blockly.FieldDropdown([
          ["TRÁI", "LEFT"],
          ["PHẢI", "RIGHT"]
        ]), "DIRECTION")
        .appendField(new FieldSlider(50, 0, 100), "YAW")
        .appendField("% TRONG")
        .appendField(new Blockly.FieldNumber(1), "DURATION")
        .appendField("S");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#ec4899");
      this.setInputsInline(true);
    }
  };
};

// Define generators
const defineGenerators = () => {
  javascriptGenerator.forBlock['drone_takeoff'] = (block: any) => `TAKEOFF|${block.id}\n`;
  javascriptGenerator.forBlock['drone_land'] = (block: any) => `LAND|${block.id}\n`;
  javascriptGenerator.forBlock['drone_emergency_stop'] = (block: any) => `EMERGENCY_STOP|${block.id}\n`;
  javascriptGenerator.forBlock['drone_go_simple'] = (block: any) => `GO|${block.id} ${block.getFieldValue('DIRECTION')} ${block.getFieldValue('DURATION')} ${block.getFieldValue('POWER')}\n`;
  javascriptGenerator.forBlock['drone_turn_simple'] = (block: any) => `TURN|${block.id} ${block.getFieldValue('DIRECTION')} ${block.getFieldValue('DURATION')} ${block.getFieldValue('POWER')}\n`;
  javascriptGenerator.forBlock['drone_turn_degrees'] = (block: any) => `TURN_DEG|${block.id} ${block.getFieldValue('DIRECTION')} ${block.getFieldValue('DEGREES')}\n`;
  javascriptGenerator.forBlock['drone_set_throttle'] = (block: any) => `THROTTLE|${block.id} ${block.getFieldValue('THROTTLE')} ${block.getFieldValue('DURATION')}\n`;
  javascriptGenerator.forBlock['drone_set_pitch'] = (block: any) => `PITCH_ADV|${block.id} ${block.getFieldValue('DIRECTION')} ${block.getFieldValue('PITCH')} ${block.getFieldValue('DURATION')} ${block.getFieldValue('POWER')}\n`;
  javascriptGenerator.forBlock['drone_set_roll'] = (block: any) => `ROLL_ADV|${block.id} ${block.getFieldValue('DIRECTION')} ${block.getFieldValue('ROLL')} ${block.getFieldValue('DURATION')} ${block.getFieldValue('POWER')}\n`;
  javascriptGenerator.forBlock['drone_set_yaw'] = (block: any) => `YAW|${block.id} ${block.getFieldValue('DIRECTION')} ${block.getFieldValue('YAW')} ${block.getFieldValue('DURATION')}\n`;
};

const toolboxXml = `
<xml xmlns="https://developers.google.com/blockly/xml">
  <category name="Lệnh bay" categorystyle="flight_category">
    <block type="drone_takeoff"></block>
    <block type="drone_land"></block>
    <block type="drone_emergency_stop"></block>
  </category>
  <category name="Di chuyển" categorystyle="timing_category">
    <block type="drone_go_simple"></block>
    <block type="drone_turn_simple"></block>
    <block type="drone_turn_degrees"></block>
  </category>
  <category name="Cài đặt" categorystyle="variable_category">
    <block type="drone_set_throttle"></block>
    <block type="drone_set_pitch"></block>
    <block type="drone_set_roll"></block>
    <block type="drone_set_yaw"></block>
  </category>
</xml>
`;

type BlocklyEditorProps = {
  onRunScript: (script: string) => void;
  activeBlockId?: string | null;
};

const BlocklyEditor = React.memo(({ onRunScript, activeBlockId }: BlocklyEditorProps) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

  useEffect(() => {
    defineBlocks();
    defineGenerators();

    if (blocklyDiv.current && !workspaceRef.current) {
      workspaceRef.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolboxXml,
        theme: droneTheme,
        renderer: 'zelos',
        media: 'https://unpkg.com/blockly/media/',
        trashcan: true,
        move: { scrollbars: true, drag: true, wheel: true },
        scrollbars: false,
        zoom: { controls: true, wheel: true, startScale: 0.8, maxScale: 1.2, minScale: 0.6, pinch: true },
        grid: { spacing: 30, length: 3, colour: '#38bdf8', snap: true }
      });

      // Continuous flyout logic for consistency
      const toolbox = workspaceRef.current.getToolbox() as any;
      if (toolbox && toolbox.getFlyout) {
        const flyout = toolbox.getFlyout();
        if (flyout) {
          flyout.autoClose = false;
        }
      }
    }
  }, []);

  useEffect(() => {
    if (workspaceRef.current) workspaceRef.current.highlightBlock(activeBlockId || null);
  }, [activeBlockId]);

  useEffect(() => {
    const handleTriggerEvent = () => {
      if (workspaceRef.current) {
        const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
        if (code.trim()) onRunScript(code);
        else alert("Vui lòng kéo các khối lệnh vào không gian làm việc!");
      }
    };
    window.addEventListener('TRIGGER_RUN_SCRIPT', handleTriggerEvent);
    return () => window.removeEventListener('TRIGGER_RUN_SCRIPT', handleTriggerEvent);
  }, [onRunScript]);

  return (
    <div className="w-full h-full flex flex-col bg-[#0f172a] overflow-hidden border border-white/10 rounded-2xl shadow-2xl">
      <div className="h-14 border-b border-white/10 bg-[#1e293b]/80 backdrop-blur-md flex items-center px-6 gap-3 shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-[#db4139] shadow-[0_0_12px_rgba(219,65,57,0.6)]" />
        <h2 className="text-[10px] font-black text-slate-100 uppercase tracking-[0.25em]">Khu vực chỉnh sửa lệnh</h2>
      </div>

      <div className="flex-1 relative" ref={blocklyDiv}></div>
    </div>
  );
});

BlocklyEditor.displayName = "BlocklyEditor";
export default BlocklyEditor;
