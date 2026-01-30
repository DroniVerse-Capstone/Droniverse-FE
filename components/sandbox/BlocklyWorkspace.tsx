"use client";

import { useEffect, useRef, useState } from "react";
import type * as BlocklyType from "blockly/core";
import "blockly/blocks";
import "blockly/javascript";
import { registerBlocks } from "@/lib/blockly";
import "@/styles/blocklyCustom.css";

type Props = {
  toolboxXml: string;
  onWorkspaceReady?: (ctx: {
    Blockly: typeof BlocklyType;
    workspace: BlocklyType.WorkspaceSvg;
  }) => void;
  onBlocksChange?: (hasBlocks: boolean) => void;
};

export default function BlocklyWorkspace({ toolboxXml, onWorkspaceReady, onBlocksChange }: Props) {
  const blocklyDivRef = useRef<HTMLDivElement | null>(null);
  const workspaceRef = useRef<any>(null);
  const [panelsCollapsed, setPanelsCollapsed] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const mod = await import("blockly/core");
      const Blockly = ((mod as any).default ??
        mod) as unknown as typeof BlocklyType;
      if (!mounted) return;

      registerBlocks(Blockly);
      const blocklyDiv = blocklyDivRef.current!;

      const DarkTheme = Blockly.Theme.defineTheme("droneDark", {
        name: "droneDark",
        base: Blockly.Themes.Classic,
        componentStyles: {
          workspaceBackgroundColour: "#0F172B", 
          toolboxBackgroundColour: "#111122", 
          toolboxForegroundColour: "#ff7bff", 
          flyoutBackgroundColour: "#1a1a2e", 
          flyoutForegroundColour: "#6effff", 
          flyoutOpacity: 0.95,

          scrollbarColour: "#a855f7", 
          scrollbarOpacity: 0.7,

          insertionMarkerColour: "#00f0ff", 
          insertionMarkerOpacity: 0.8,
        },
        blockStyles: {
          motion_blocks: {
            colourPrimary: "#3b82f6",
            colourSecondary: "#2563eb",
            colourTertiary: "#1d4ed8",
          },
          control_blocks: {
            colourPrimary: "#10b981",
            colourSecondary: "#059669",
            colourTertiary: "#047857",
          },
          logic_blocks: {
            colourPrimary: "#f59e0b",
            colourSecondary: "#d97706",
            colourTertiary: "#b45309",
          },
          variable_blocks: {
            colourPrimary: "#ec4899",
            colourSecondary: "#db2777",
            colourTertiary: "#be185d",
          },
        },
        categoryStyles: {
          motion_category: {
            colour: "#3b82f6",
          },
          control_category: {
            colour: "#10b981",
          },
          logic_category: {
            colour: "#f59e0b",
          },
          variable_category: {
            colour: "#ec4899",
          },
        },
      });

      const workspace = Blockly.inject(blocklyDiv, {
        toolbox: toolboxXml,
        theme: DarkTheme,
        renderer: "zelos",
        trashcan: true,
        move: { scrollbars: true, drag: true, wheel: true },
        scrollbars: false,
        grid: {
          spacing: 30,
          length: 3,
          colour: "#38bdf8",
          snap: true,
        },
        zoom: {
          controls: true,
          wheel: true,
          startScale: 0.8,
          maxScale: 1.2,
          minScale: 0.6,
          pinch: true,
        },
        toolboxPosition: "start",
        horizontalLayout: false,
        collapse: false,
      } as any);

      let currentSelectedItem: any = null;

      const checkBlocksChange = () => {
        if (onBlocksChange) {
          const topBlocks = workspace.getTopBlocks(true);
          const hasBlocks = topBlocks.length > 0;
          onBlocksChange(hasBlocks);
        }
      };

      workspace.addChangeListener((event: BlocklyType.Events.Abstract) => {
        const eventType = (event as any).type;

        if (
          eventType === "create" ||
          eventType === Blockly.Events.BLOCK_CREATE ||
          eventType === "delete" ||
          eventType === Blockly.Events.BLOCK_DELETE ||
          eventType === "move" ||
          eventType === Blockly.Events.BLOCK_MOVE ||
          eventType === "change" ||
          eventType === Blockly.Events.BLOCK_CHANGE
        ) {
          checkBlocksChange();
        }

        if (eventType === "create" || eventType === Blockly.Events.BLOCK_CREATE) {
          const toolbox = workspace.getToolbox() as any;
          if (toolbox && currentSelectedItem) {
            setTimeout(() => {
              if (toolbox.setSelectedItem && currentSelectedItem) {
                toolbox.setSelectedItem(currentSelectedItem);
              }
            }, 50);
          }
        }

        if (
          eventType === "toolbox_item_select" ||
          eventType === "selected" ||
          eventType === Blockly.Events.TOOLBOX_ITEM_SELECT ||
          (event as any).element === "category"
        ) {
          const toolbox = workspace.getToolbox() as any;
          const toolboxEvent = event as any;

          if (toolboxEvent.newItem === null && currentSelectedItem !== null) {
            if (toolbox && toolbox.setSelectedItem && currentSelectedItem) {
              toolbox.setSelectedItem(currentSelectedItem);
            }
          } else if (toolboxEvent.newItem !== null) {
            currentSelectedItem = toolboxEvent.newItem;
          }
        }
      });

      setTimeout(() => {
        const toolbox = workspace.getToolbox() as any;
        if (toolbox && toolbox.getToolboxItems) {
          const items = toolbox.getToolboxItems();
          const firstCategory = items && items.length > 0 ? items[0] : null;
          if (firstCategory && toolbox.setSelectedItem) {
            toolbox.setSelectedItem(firstCategory);
            currentSelectedItem = firstCategory;
          }

          const originalSetSelectedItem = toolbox.setSelectedItem.bind(toolbox);

          toolbox.setSelectedItem = function (newItem: any) {
            const currentItem = toolbox.getSelectedItem();

            if (!newItem || newItem === currentItem) {
              return currentItem;
            }

            currentSelectedItem = newItem;
            return originalSetSelectedItem(newItem);
          };

          const flyout = toolbox.getFlyout();
          if (flyout) {
            flyout.autoClose = false;

            const minWidth = 200;
            const renderWithMinWidth = (block: any) => {
              const width =
                typeof block.getWidth === "function"
                  ? block.getWidth()
                  : block.width ?? block.width_?.width ?? 0;
              if (!width || width >= minWidth) return;

              if (typeof block.setWidth === "function") {
                block.setWidth(minWidth);
              } else if (block.width_ && typeof block.width_.width !== "undefined") {
                block.width_.width = minWidth;
              } else if (block.width !== undefined) {
                block.width = minWidth;
              }

              if (typeof block.render === "function") {
                block.render();
              }
            };

            const setBlocksMinWidth = () => {
              const flyoutWorkspace = flyout.getWorkspace();
              if (flyoutWorkspace) {
                const blocks = flyoutWorkspace.getAllBlocks(false);
                blocks.forEach(renderWithMinWidth);

                if (typeof flyoutWorkspace.resize === 'function') {
                  setTimeout(() => {
                    flyoutWorkspace.resize();
                  }, 50);
                }
              }
            };
            
            if (typeof flyout.show === 'function') {
              const originalShow = flyout.show.bind(flyout);
              flyout.show = function(category: any) {
                const result = originalShow(category);
                setTimeout(() => {
                  setBlocksMinWidth();
                }, 100);
                return result;
              };
            }
          }
        }
      }, 200);

      workspaceRef.current = workspace;
      if (onWorkspaceReady) onWorkspaceReady({ Blockly, workspace });
      
      checkBlocksChange();
    })();

    return () => {
      mounted = false;
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
  }, [onWorkspaceReady, toolboxXml, onBlocksChange]);

  useEffect(() => {
    if (workspaceRef.current && toolboxXml) {
      workspaceRef.current.updateToolbox(toolboxXml);
    }
  }, [toolboxXml]);

  return (
    <div
      className={`h-full w-full relative ${
        panelsCollapsed ? "blockly-panels-collapsed" : ""
      }`}
    >
      <button
        type="button"
        className="blocklyToggleBtn"
        onClick={() => setPanelsCollapsed((v) => !v)}
        aria-label="Toggle toolbox"
      >
        {panelsCollapsed ? "»" : "«"}
      </button>
      <div ref={blocklyDivRef} className="w-full h-full" />
    </div>
  );
}
