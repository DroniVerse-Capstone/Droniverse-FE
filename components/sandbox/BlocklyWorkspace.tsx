"use client";

import { useEffect, useRef, useState } from "react";
import type * as BlocklyType from "blockly/core";
import "blockly/blocks";
import "blockly/javascript";
import { registerBlocks } from "@/lib/blockly";
import { useTranslations, useLocale } from "@/providers/i18n-provider";
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
  const t = useTranslations("Sandbox");
  const locale = useLocale();
  const blocklyDivRef = useRef<HTMLDivElement | null>(null);
  const workspaceRef = useRef<any>(null);
  const [panelsCollapsed, setPanelsCollapsed] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const mod = await import("blockly/core");
      const Blockly = ((mod as any).default ??
        mod) as unknown as typeof BlocklyType;

      // Import language pack to fix right-click context menu crash
      try {
        const rawMsg = locale === "vi"
          ? await import("blockly/msg/vi").then(m => m.default || m)
          : await import("blockly/msg/en").then(m => m.default || m);

        const Msg = { ...rawMsg };
        const m = Msg as any;

        // Custom Labels (Bilingual based on i18n JSON)
        m['PROCEDURES_DEFNORETURN_TITLE'] = t("blockly.blocks.procedures.defNoReturnTitle") || (locale === "vi" ? 'Định nghĩa hàm' : 'Define function');
        m['PROCEDURES_DEFNORETURN_PROCEDURE'] = 'tên_hàm';
        m['PROCEDURES_DEFNORETURN_DO'] = t("blockly.blocks.procedures.do") || (locale === "vi" ? 'thực hiện' : 'do');
        m['PROCEDURES_CALL_BEFORE_PARAMS'] = t("blockly.blocks.procedures.call") || (locale === "vi" ? 'gọi hàm' : 'call');
        
        m['PROCEDURES_DEFRETURN_TITLE'] = t("blockly.blocks.procedures.defReturnTitle") || (locale === "vi" ? 'Định nghĩa hàm có kết quả' : 'Define function with result');
        m['PROCEDURES_DEFRETURN_PROCEDURE'] = 'tên_hàm';
        m['PROCEDURES_DEFRETURN_DO'] = t("blockly.blocks.procedures.do") || (locale === "vi" ? 'thực hiện' : 'do');
        m['PROCEDURES_DEFRETURN_RETURN'] = t("blockly.blocks.procedures.return") || (locale === "vi" ? 'trả về kết quả' : 'return result');

        // Variables
        m['VARIABLES_DEFAULT_NAME'] = locale === "vi" ? 'biến' : 'item';
        m['VARIABLES_SET'] = t("blockly.blocks.variables.set") || (locale === "vi" ? 'gán %1 bằng %2' : 'set %1 to %2');
        m['MATH_CHANGE_TITLE'] = t("blockly.blocks.variables.change") || (locale === "vi" ? 'tăng %1 thêm %2' : 'change %1 by %2');

        // Logic & Math (The ones user found hard to understand)
        m['LOGIC_BOOLEAN_TRUE'] = t("blockly.blocks.logic.true") || "TRUE";
        m['LOGIC_BOOLEAN_FALSE'] = t("blockly.blocks.logic.false") || "FALSE";
        m['LOGIC_OPERATION_AND'] = t("blockly.blocks.logic.and") || "AND";
        m['LOGIC_OPERATION_OR'] = t("blockly.blocks.logic.or") || "OR";
        m['MATH_MODULO_TITLE'] = t("blockly.blocks.math.modulo") || (locale === "vi" ? "Tìm số dư khi chia %1 cho %2" : "remainder of %1 ÷ %2");

        Blockly.setLocale(Msg);
      } catch (err) {
        console.error("Failed to load Blockly locale:", err);
      }

      if (!mounted) return;

      registerBlocks(Blockly, {
        takeOff: { message: t("blockly.blocks.takeOff.message"), tooltip: t("blockly.blocks.takeOff.tooltip") },
        up: { message: t("blockly.blocks.up.message"), tooltip: t("blockly.blocks.up.tooltip") },
        down: { message: t("blockly.blocks.down.message"), tooltip: t("blockly.blocks.down.tooltip") },
        left: { message: t("blockly.blocks.left.message"), tooltip: t("blockly.blocks.left.tooltip") },
        right: { message: t("blockly.blocks.right.message"), tooltip: t("blockly.blocks.right.tooltip") },
        forward: { message: t("blockly.blocks.forward.message"), tooltip: t("blockly.blocks.forward.tooltip") },
        backward: { message: t("blockly.blocks.backward.message"), tooltip: t("blockly.blocks.backward.tooltip") },
        turnRight: { message: t("blockly.blocks.turnRight.message"), tooltip: t("blockly.blocks.turnRight.tooltip") },
        turnLeft: { message: t("blockly.blocks.turnLeft.message"), tooltip: t("blockly.blocks.turnLeft.tooltip") },
        land: { message: t("blockly.blocks.land.message"), tooltip: t("blockly.blocks.land.tooltip") },
        repeat: { message: t("blockly.blocks.repeat.message"), tooltip: t("blockly.blocks.repeat.tooltip") },
        if: { message: t("blockly.blocks.if.message"), tooltip: t("blockly.blocks.if.tooltip") },
        ifElse: { message: t("blockly.blocks.ifElse.message"), tooltip: t("blockly.blocks.ifElse.tooltip"), elseMessage: t("blockly.blocks.ifElse.elseMessage") || "Else %1" },
        isObstacleAhead: { message: t("blockly.blocks.isObstacleAhead.message"), tooltip: t("blockly.blocks.isObstacleAhead.tooltip") },
        amountValue: { tooltip: t("blockly.blocks.amountValue.tooltip") },
        mathOperation: { tooltip: t("blockly.blocks.mathOperation.tooltip") },
        playSound: { message: t("blockly.blocks.playSound.message"), tooltip: t("blockly.blocks.playSound.tooltip") },
        inputNumber: { message: t("blockly.blocks.inputNumber.message"), tooltip: t("blockly.blocks.inputNumber.tooltip") },
      });
      const blocklyDiv = blocklyDivRef.current;
      if (!mounted || !blocklyDiv || !document.body.contains(blocklyDiv)) return;

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
        contextMenu: false,
      } as any);

      // ... rest of the code remains same ...
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
              flyout.show = function (category: any) {
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

      // Resize Observer: Cập nhật kích thước workspace khi container thay đổi
      const resizeObserver = new ResizeObserver(() => {
        if (workspaceRef.current) {
          Blockly.svgResize(workspaceRef.current);
        }
      });

      // Chặn chuột phải trực tiếp trên div container để đảm bảo menu không hiện ra
      const handleContextMenu = (e: MouseEvent) => e.preventDefault();
      blocklyDiv.addEventListener("contextmenu", handleContextMenu);

      if (blocklyDivRef.current) {
        resizeObserver.observe(blocklyDivRef.current);
      }

      return () => {
        resizeObserver.disconnect();
        blocklyDiv.removeEventListener("contextmenu", handleContextMenu);
      };
    })();

    return () => {
      mounted = false;
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
  }, []); // Chỉ chạy 1 lần duy nhất khi mount - không phụ thuộc vào callbacks để tránh dispose/reinit

  useEffect(() => {
    if (workspaceRef.current && toolboxXml) {
      workspaceRef.current.updateToolbox(toolboxXml);
    }
  }, [toolboxXml]);

  return (
    <div
      className={`h-full w-full relative ${panelsCollapsed ? "blockly-panels-collapsed" : ""
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
