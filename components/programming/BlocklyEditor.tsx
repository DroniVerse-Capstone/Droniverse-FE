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

// Register the slider field
Blockly.fieldRegistry.register('field_slider', FieldSlider);

const blockStyles = {
  flight_blocks: {
    colourPrimary: "#db4139",
    colourSecondary: "#e26660",
    colourTertiary: "#c53a33",
  },
  control_blocks: {
    colourPrimary: "#2dd4bf",
    colourSecondary: "#56dccb",
    colourTertiary: "#24a998",
  },
  timing_blocks: {
    colourPrimary: "#3b82f6",
    colourSecondary: "#629bf7",
    colourTertiary: "#3575dd",
  },
};

const droneTheme = Blockly.Theme.defineTheme('droneTheme', {
  name: 'droneTheme',
  base: Blockly.Themes.Classic,
  blockStyles: blockStyles,
  categoryStyles: {
    flight_category: { colour: "#db4139" },
    control_category: { colour: "#2dd4bf" },
    timing_category: { colour: "#3b82f6" }
  },
  componentStyles: {
    workspaceBackgroundColour: '#0e131e',
    toolboxBackgroundColour: '#0b0f18',
    toolboxForegroundColour: '#b6b8bb',
    flyoutBackgroundColour: '#0b0f18',
    flyoutForegroundColour: '#b6b8bb',
    flyoutOpacity: 0.95,
    scrollbarColour: 'transparent',
    insertionMarkerColour: '#db4139',
    insertionMarkerOpacity: 0.3,
    cursorColour: '#db4139',
  },
  fontStyle: {
    family: "'Inter Tight', sans-serif",
    weight: "700",
    size: 11
  },
  startHats: true,
});

// Define blocks
const defineBlocks = () => {
  Blockly.Blocks['drone_takeoff'] = {
    init: function () {
      this.appendDummyInput()
        .appendField("🚀 CẤT CÁNH");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#6366f1");
      this.setTooltip("Bắt đầu bay lên từ mặt đất");
    }
  };

  Blockly.Blocks['drone_land'] = {
    init: function () {
      this.appendDummyInput()
        .appendField("🛬 HẠ CÁNH");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#6366f1");
      this.setTooltip("Từ từ hạ cánh xuống mặt đất");
    }
  };

  Blockly.Blocks['drone_emergency_stop'] = {
    init: function () {
      this.appendDummyInput()
        .appendField("🛑 DỪNG KHẨN CẤP");
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
        .appendField("S");
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
        .appendField("S");
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
  javascriptGenerator.forBlock['drone_set_pitch'] = (block: any) => `PITCH|${block.id} ${block.getFieldValue('DIRECTION')} ${block.getFieldValue('PITCH')} ${block.getFieldValue('DURATION')}\n`;
  javascriptGenerator.forBlock['drone_set_roll'] = (block: any) => `ROLL|${block.id} ${block.getFieldValue('DIRECTION')} ${block.getFieldValue('ROLL')} ${block.getFieldValue('DURATION')}\n`;
  javascriptGenerator.forBlock['drone_set_yaw'] = (block: any) => `YAW|${block.id} ${block.getFieldValue('DIRECTION')} ${block.getFieldValue('YAW')} ${block.getFieldValue('DURATION')}\n`;
};

const toolboxXml = `
<xml xmlns="https://developers.google.com/blockly/xml">
  <category name="Lệnh bay" colour="#db4139" cssConfig='{"container": "category-basic"}'>
    <block type="drone_takeoff"></block>
    <block type="drone_land"></block>
    <block type="drone_emergency_stop"></block>
  </category>
  <category name="Di chuyển" colour="#2dd4bf" cssConfig='{"container": "category-move"}'>
    <block type="drone_go_simple"></block>
    <block type="drone_turn_simple"></block>
    <block type="drone_turn_degrees"></block>
  </category>
  <category name="Cài đặt" colour="#3b82f6" cssConfig='{"container": "category-advanced"}'>
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
        media: 'https://unpkg.com/blockly/media/', // [Bổ sung] Fix lỗi Failed to fetch ở bản v12
        trashcan: true,
        move: { scrollbars: { horizontal: false, vertical: false }, drag: true, wheel: true },
        zoom: { controls: true, wheel: true, startScale: 0.7, maxScale: 2, minScale: 0.3, scaleSpeed: 1.1 },
        grid: { spacing: 25, length: 2, colour: '#1e293b', snap: true }
      });
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
    <div className="w-full h-full flex flex-col bg-[#1a2333] overflow-hidden border border-white/10 rounded-2xl shadow-2xl">
      {/* Brighter Header */}
      <div className="h-14 border-b border-white/10 bg-[#243147]/80 backdrop-blur-md flex items-center px-6 gap-3 shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-[#db4139] shadow-[0_0_12px_rgba(219,65,57,0.6)]" />
        <h2 className="text-[10px] font-black text-slate-100 uppercase tracking-[0.25em]">Khu vực chỉnh sửa lệnh</h2>
      </div>

      <div className="flex-1 relative" ref={blocklyDiv}></div>

      <style>{`
        /* Brighter Workspace & Grid */
        .blocklySvg { 
          background-color: #1a2333 !important; 
          background-image: radial-gradient(circle at 1px 1px, #3b82f6 1.5px, transparent 0) !important; 
          background-size: 30px 30px !important; 
        }
        
        .blocklyMainBackground { stroke: none !important; fill: transparent !important; }

        /* Brighter Toolbox */
        .blocklyToolboxDiv { 
          background: #243147 !important; 
          border-right: 1px solid rgba(255,255,255,0.1) !important; 
          width: 140px !important; 
          padding: 16px 0 !important; 
          z-index: 70 !important; 
        }

        /* Brighter Category Buttons */
        .blocklyTreeRow { 
          height: 44px !important; 
          margin: 6px 12px !important; 
          border-radius: 12px !important; 
          display: flex !important; 
          align-items: center !important; 
          justify-content: flex-start !important;
          background: rgba(255, 255, 255, 0.05) !important; 
          border: 1px solid rgba(255,255,255,0.08) !important;
          transition: all 0.2s ease !important;
          cursor: pointer !important; 
          padding: 0 14px !important;
        }

        .blocklyTreeLabel { 
          color: #cbd5e1 !important; 
          font-family: 'Inter Tight', sans-serif !important; 
          font-weight: 700 !important; 
          font-size: 10px !important; 
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }

        .blocklyTreeRow:hover { 
          background: rgba(255, 255, 255, 0.1) !important; 
          transform: translateX(4px) !important;
        }

        /* Active State */
        .blocklyTreeRow.blocklyTreeSelected { 
          background: #db4139 !important; 
          border-color: #ef4444 !important;
          box-shadow: 0 4px 20px rgba(219, 65, 57, 0.5) !important;
        }

        .blocklyTreeSelected .blocklyTreeLabel { 
          color: white !important; 
        }

        /* Flyout Styling */
        .blocklyFlyoutBackground { 
          fill: #243147 !important; 
          fill-opacity: 0.98 !important;
        }

        .blocklyFlyoutLabelText { 
          fill: #94a3b8 !important; 
          font-family: 'Inter Tight', sans-serif !important; 
          font-weight: 900 !important; 
          font-size: 8px !important; 
          text-transform: uppercase !important;
        }

        /* Blocks & Highlights */
        .blocklyBlockCanvas { filter: drop-shadow(0 8px 16px rgba(0,0,0,0.4)); }
        .blocklySelected > .blocklyPath { stroke: white !important; stroke-width: 3px !important; filter: drop-shadow(0 0 10px rgba(255,255,255,0.5)) !important; }
        .blocklyHighlighted > .blocklyPath { stroke: #2dd4bf !important; stroke-width: 4px !important; filter: drop-shadow(0 0 15px rgba(45,212,191,0.6)) !important; }

        /* Zoom & Trashcan */
        .blocklyZoom>image, .blocklyTrash>image {
          opacity: 0.6;
          transition: opacity 0.2s;
        }
        .blocklyZoom>image:hover, .blocklyTrash>image:hover {
          opacity: 1;
        }

        .blocklyScrollbarHandle, .blocklyScrollbarBackground, .blocklyScrollbar { display: none !important; }
        .blocklyTreeIcon { display: none !important; }
      `}</style>
    </div>
  );
});

BlocklyEditor.displayName = "BlocklyEditor";
export default BlocklyEditor;
