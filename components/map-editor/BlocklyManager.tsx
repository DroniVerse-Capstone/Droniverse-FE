import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LabRule } from '@/types/lab';
import {
  FaArrowsAlt, FaSync, FaSitemap, FaWifi, FaCalculator, FaBox, FaPuzzlePiece,
  FaSearch, FaSave, FaTimesCircle
} from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { useTranslations } from '@/providers/i18n-provider';

interface BlocklyManagerProps {
  show: boolean;
  onClose: () => void;
  rule: LabRule;
  onSave: (allowedBlocks: string[] | undefined) => void;
  isReadOnly?: boolean;
  labName?: string;
}

type BlockInfo = {
  id: string;
  name: string;
  desc: string;
  required?: boolean;
}

type CategoryInfo = {
  id: string;
  name: string;
  color: string;
  icon: JSX.Element;
  blocks: BlockInfo[];
}

export const REQUIRED_BLOCKS = ['drone_take_off', 'drone_land', 'drone_up', 'drone_down'];

const RAW_CATEGORIES = [
  {
    id: 'motion',
    color: '#10b981',
    icon: <FaArrowsAlt size={14} />,
    blocks: [
      { id: 'drone_take_off', required: true },
      { id: 'drone_land', required: true },
      { id: 'drone_up', required: true },
      { id: 'drone_down', required: true },
      { id: 'drone_forward' },
      { id: 'drone_back' },
      { id: 'drone_left' },
      { id: 'drone_right' },
      { id: 'drone_turn_left' },
      { id: 'drone_turn_right' }
    ]
  },
  {
    id: 'loops',
    color: '#3b82f6',
    icon: <FaSync size={14} />,
    blocks: [
      { id: 'drone_repeat' }
    ]
  },
  {
    id: 'logic',
    color: '#a855f7',
    icon: <FaSitemap size={14} />,
    blocks: [
      { id: 'drone_if' },
      { id: 'drone_if_else' },
      { id: 'logic_compare' },
      { id: 'logic_operation' },
      { id: 'logic_negate' },
      { id: 'logic_boolean' }
    ]
  },
  {
    id: 'sensors',
    color: '#9ca3af',
    icon: <FaWifi size={14} />,
    blocks: [
      { id: 'drone_is_obstacle_ahead' }
    ]
  },
  {
    id: 'math',
    color: '#d8b4fe',
    icon: <FaCalculator size={14} />,
    blocks: [
      { id: 'math_number' },
      { id: 'math_arithmetic' },
      { id: 'math_modulo' },
      { id: 'drone_amount_value' },
      { id: 'drone_math_operation' }
    ]
  },
  {
    id: 'variables',
    color: '#f59e0b',
    icon: <FaBox size={14} />,
    blocks: [
      { id: 'category_variables' }
    ]
  },
  {
    id: 'functions',
    color: '#86efac',
    icon: <FaPuzzlePiece size={14} />,
    blocks: [
      { id: 'category_functions' }
    ]
  }
];

const ALL_IDS = RAW_CATEGORIES.flatMap(c => c.blocks.map(b => b.id));

export const BlocklyManager: React.FC<BlocklyManagerProps> = ({ show, onClose, rule, onSave, isReadOnly, labName }) => {
  const t = useTranslations("BlocklyManager");
  const [selected, setSelected] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('motion');
  const [search, setSearch] = useState('');

  const BLOCK_CATEGORIES = useMemo<CategoryInfo[]>(() => 
    RAW_CATEGORIES.map(cat => ({
      ...cat,
      name: t(`categories.${cat.id}`),
      blocks: cat.blocks.map(b => ({
        ...b,
        name: t(`blocks.${b.id}`),
        desc: t(`blocks.${b.id}_desc`)
      }))
    }))
  , [t]);

  useEffect(() => {
    if (show) {
      if (!rule.allowedBlocks || rule.allowedBlocks.length === 0) {
        setSelected(ALL_IDS);
      } else {
        const initial = [...rule.allowedBlocks];
        REQUIRED_BLOCKS.forEach(b => { if (!initial.includes(b)) initial.push(b); });
        setSelected(initial);
      }
    }
  }, [show, rule.allowedBlocks]);


  if (!show) return null;

  const toggleBlock = (id: string, req?: boolean) => {
    if (req || isReadOnly) return;
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const setGroup = (catId: string, state: boolean) => {
    if (isReadOnly) return;
    const cat = BLOCK_CATEGORIES.find(c => c.id === catId);
    if (!cat) return;
    const ids = cat.blocks.filter(b => !b.required).map(b => b.id);
    setSelected(prev => {
      const filtered = prev.filter(x => !ids.includes(x));
      return state ? [...filtered, ...ids] : filtered;
    });
  };

  const handleSave = () => {
    onSave(selected);
    onClose();
  };

  const currentCat = BLOCK_CATEGORIES.find(c => c.id === activeTab);
  const filteredBlocks = currentCat?.blocks.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="sm:max-w-5xl bg-[#121216] border border-white/10 p-0 overflow-hidden rounded-lg shadow-2xl flex flex-col max-h-[90vh] [&>button]:hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

        {/* HEADER */}
        <div className="relative z-10 px-5 py-4 flex items-center justify-between border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <FaPuzzlePiece size={16} />
            </div>
            <div>
              <DialogTitle className="text-[12px] font-black uppercase tracking-[0.2em] text-white">
                {t('title')}
              </DialogTitle>
              <p className="text-[9px] text-white/30 font-bold uppercase tracking-tight mt-0.5">{labName || t('description')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5"
          >
            <FaTimesCircle size={16} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 flex overflow-hidden h-[600px]">
          {/* SIDEBAR TABS */}
          <div className="w-48 bg-black/20 border-r border-white/5 flex flex-col p-2 gap-1 overflow-y-auto shrink-0">
            {BLOCK_CATEGORIES.map(cat => {
              const active = activeTab === cat.id;
              const enabledCount = cat.blocks.filter(b => selected.includes(b.id)).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={cn(
                    "px-3 py-2.5 rounded flex flex-col transition-all text-left",
                    active ? "bg-white/5 border border-white/10 shadow-inner" : "hover:bg-white/[0.02] border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ color: active ? cat.color : '#666' }}>{cat.icon}</span>
                    <span className={cn("text-[11px] font-black uppercase tracking-wider", active ? "text-white" : "text-white/30")}>
                      {cat.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[9px] font-bold text-white/20 uppercase">{t('selectedCount')}</span>
                    <span className={cn("text-[10px] font-mono font-bold", enabledCount > 0 ? "text-sky-400" : "text-white/10")}>
                      {enabledCount}/{cat.blocks.length}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* MAIN LIST */}
          <div className="flex-1 flex flex-col bg-black/10">
            <div className="h-12 px-6 flex items-center justify-between border-b border-white/5 shrink-0">
              <div className="flex items-center gap-2 relative flex-1 max-w-xs">
                <FaSearch className="absolute left-0 text-white/20 text-[10px]" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={t('search')}
                  className="bg-transparent border-none text-[11px] font-bold pl-5 w-full focus:outline-none placeholder:text-white/10 text-white"
                />
              </div>

              <div className="flex items-center gap-4">
                {!isReadOnly && (
                  <>
                    <button
                      onClick={() => setGroup(activeTab, true)}
                      className="text-[9px] font-black text-emerald-500/80 hover:text-emerald-400 uppercase tracking-[0.1em]"
                    >
                      {t('selectAll')}
                    </button>
                    <div className="w-px h-3 bg-white/10" />
                    <button
                      onClick={() => setGroup(activeTab, false)}
                      className="text-[9px] font-black text-white/20 hover:text-white/40 uppercase tracking-[0.1em]"
                    >
                      {t('deselectAll')}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2 scrollbar-thin">
              {filteredBlocks?.map(b => {
                const isOn = selected.includes(b.id);
                return (
                  <div
                    key={b.id}
                    onClick={() => toggleBlock(b.id, b.required)}
                    className={cn(
                      "p-3 rounded border flex items-center justify-between transition-all cursor-pointer group select-none",
                      isOn ? "bg-white/[0.03] border-white/10" : "bg-black/40 border-white/[0.02] opacity-40 hover:opacity-60"
                    )}
                  >
                    <div className="flex flex-col pr-2">
                      <span className={cn("text-[11px] font-bold tracking-tight", isOn ? "text-white" : "text-white/60")}>{b.name}</span>
                      <span className="text-[9px] text-white/20 mt-0.5 font-medium">{b.desc}</span>
                    </div>

                    {b.required ? (
                      <span className="text-[8px] font-black uppercase text-emerald-500 bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10 shrink-0">{t('required')}</span>
                    ) : (
                      <Switch
                        checked={isOn}
                        disabled={isReadOnly}
                        onCheckedChange={() => toggleBlock(b.id)}
                        className="scale-[0.8] data-[state=checked]:bg-sky-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="relative z-10 px-5 py-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none">
            {t('selectedCount')} <span className="text-white/60">{selected.length} / {ALL_IDS.length}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[10px] font-black text-white/30 hover:text-white uppercase tracking-widest transition-all"
            >
              {isReadOnly ? t('close') : t('cancel')}
            </button>
            {!isReadOnly && (
              <button
                onClick={handleSave}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 flex items-center gap-2"
              >
                <FaSave size={10} />
                {t('save')}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

