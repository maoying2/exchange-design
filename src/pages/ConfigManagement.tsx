/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronDown, 
  CheckCircle,
  LayoutGrid,
  List as ListIcon,
  Settings2,
  Terminal,
  FileSearch,
  X,
  Play,
  Save,
  RefreshCw,
  HelpCircle,
  FileCode,
  Braces,
  Cpu,
  Power,
  AppWindow,
  Logs
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PluginPackage, PluginCategory, PackageStatus, PluginStatus, PluginDetail } from '../types';

interface ConfigManagementProps {
  packages: PluginPackage[];
  setPackages: React.Dispatch<React.SetStateAction<PluginPackage[]>>;
}

export default function ConfigManagement({ packages, setPackages }: ConfigManagementProps) {
  const [sidebarTab, setSidebarTab] = useState<'package' | 'category'>('package');
  const [selectedPkgId, setSelectedPkgId] = useState<string | 'ALL'>('ALL');
  const [selectedCategories, setSelectedCategories] = useState<PluginCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [activePlugin, setActivePlugin] = useState<PluginDetail | null>(null);
  const [isTestModalOpen, setTestModalOpen] = useState(false);
  const [isLogModalOpen, setLogModalOpen] = useState(false);
  
  const [testInputData, setTestInputData] = useState('{\n  "id": "123",\n  "content": "example data"\n}');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const filteredPluginsRaw = useMemo(() => {
    let result: { pkgName: string; pkgCategory: PluginCategory; plugin: PluginDetail }[] = [];
    
    packages.forEach(pkg => {
      // Filter by package if in package tab
      if (sidebarTab === 'package' && selectedPkgId !== 'ALL' && pkg.id !== selectedPkgId) return;
      
      pkg.plugins.forEach(plugin => {
        // Filter by category if in category tab
        const matchesCategory = sidebarTab === 'package' || selectedCategories.length === 0 || selectedCategories.includes(pkg.category);
        const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             plugin.code.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (matchesCategory && matchesSearch) {
          result.push({ pkgName: pkg.name, pkgCategory: pkg.category, plugin });
        }
      });
    });
    
    return result;
  }, [packages, selectedPkgId, selectedCategories, searchQuery, sidebarTab]);

  const toggleCategory = (cat: PluginCategory) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredPluginsRaw.length) setSelectedIds([]);
    else setSelectedIds(filteredPluginsRaw.map(p => p.plugin.id));
  };

  const batchStatusToggle = (newStatus: PluginStatus) => {
    setPackages(prev => prev.map(pkg => ({
      ...pkg,
      plugins: pkg.plugins.map(p => selectedIds.includes(p.id) ? { ...p, status: newStatus } : p)
    })));
  };

  const togglePluginStatus = (pkgName: string, pluginId: string) => {
    setPackages(prev => prev.map(pkg => {
      if (pkg.name === pkgName) {
        return {
          ...pkg,
          plugins: pkg.plugins.map(p => 
            p.id === pluginId ? { ...p, status: p.status === PluginStatus.ENABLED ? PluginStatus.DISABLED : PluginStatus.ENABLED } : p
          )
        };
      }
      return pkg;
    }));
  };

  const runTest = () => {
    setIsRunning(true);
    setTestResult(null);
    setTimeout(() => {
      setIsRunning(false);
      setTestResult(`{\n  "status": "success",\n  "timestamp": "${new Date().toISOString()}",\n  "processed": true,\n  "output": {\n    "message": "Data processed by ${activePlugin?.name}"\n  }\n}`);
    }, 1200);
  };

  const generateData = () => {
    const mock: any = {};
    activePlugin?.parameters.forEach(p => {
      mock[p.code] = p.defaultValue || (p.type === 'number' ? 0 : 'sample');
    });
    setTestInputData(JSON.stringify(mock, null, 2));
  };

  return (
    <div className="flex h-full gap-6 overflow-hidden text-slate-800">
      {/* Sidebar Filter */}
      <div className="w-80 flex flex-col shrink-0 overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm">
        {/* Sidebar Tabs */}
        <div className="flex border-b border-slate-100 p-1.5 bg-slate-50/50">
          <button 
            onClick={() => setSidebarTab('package')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${sidebarTab === 'package' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <ListIcon size={14} /> 插件包列表
          </button>
          <button 
            onClick={() => setSidebarTab('category')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${sidebarTab === 'category' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutGrid size={14} /> 插件分类列表
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
          {sidebarTab === 'package' ? (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="搜索插件包..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-1">
                <button 
                  onClick={() => setSelectedPkgId('ALL')}
                  className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-all border ${selectedPkgId === 'ALL' ? 'bg-blue-50 text-blue-700 border-blue-100 shadow-sm' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                >
                  全部已运行包
                </button>
                {packages.filter(p => p.status === PackageStatus.RUNNING).map(pkg => (
                  <button 
                    key={pkg.id}
                    onClick={() => setSelectedPkgId(pkg.id)}
                    className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-all border ${selectedPkgId === pkg.id ? 'bg-blue-50 text-blue-700 border-blue-100 shadow-sm' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                  >
                    <p>{pkg.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1 font-normal uppercase tracking-tight">{pkg.code}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {Object.values(PluginCategory).map((cat) => {
                const isActive = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all border ${isActive ? 'bg-blue-50 text-blue-700 border-blue-100 shadow-sm' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
                        <LayoutGrid size={16} />
                      </div>
                      <span>{cat}</span>
                    </div>
                    {isActive && <CheckCircle size={14} className="text-blue-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main List */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-w-0">
        <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between shrink-0 h-16">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="搜索插件功能、编码..."
                className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-600 transition-all font-medium"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AnimatePresence>
              {selectedIds.length > 0 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">已选择 {selectedIds.length} 项</span>
                  <button 
                    onClick={() => batchStatusToggle(PluginStatus.ENABLED)}
                    className="h-8 px-4 bg-white border border-slate-200 rounded text-xs font-bold text-blue-600 hover:bg-blue-50 flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <Power size={14} /> 批量启用
                  </button>
                  <button 
                    onClick={() => batchStatusToggle(PluginStatus.DISABLED)}
                    className="h-8 px-4 bg-white border border-slate-200 rounded text-xs font-bold text-slate-500 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <Power size={14} className="rotate-180" /> 批量停用
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
              Active: {filteredPluginsRaw.length}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 sticky top-0 z-10 border-b border-slate-100">
              <tr>
                <th className="w-12 px-6 py-4">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                    checked={selectedIds.length === filteredPluginsRaw.length && filteredPluginsRaw.length > 0}
                    onChange={toggleAll}
                  />
                </th>
                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">插件名称</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">所属插件包</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">插件分类</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">唯一编码</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">核心接口</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">状态</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredPluginsRaw.map(({ pkgName, pkgCategory, plugin }) => (
                <tr key={plugin.id} className={`group hover:bg-slate-50/80 transition-colors ${selectedIds.includes(plugin.id) ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                      checked={selectedIds.includes(plugin.id)}
                      onChange={() => toggleSelect(plugin.id)}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-bold text-slate-800">{plugin.name}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs text-slate-500 font-medium">{pkgName}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold uppercase tracking-tight">{pkgCategory}</span>
                  </td>
                  <td className="px-4 py-4">
                    <code className="text-xs font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 border border-slate-100 rounded uppercase tracking-tighter">{plugin.code}</code>
                  </td>
                  <td className="px-4 py-4 text-slate-500 font-mono text-xs italic">{plugin.subCategory}</td>
                  <td className="px-4 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${plugin.status === PluginStatus.ENABLED ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-100 text-slate-500 border-slate-200 opacity-60'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${plugin.status === PluginStatus.ENABLED ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                      {plugin.status === PluginStatus.ENABLED ? '已启用' : '已停用'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3 text-blue-600 font-bold">
                       <button onClick={() => setActivePlugin(plugin)} className="hover:underline text-[11px] flex items-center gap-1 transition-all">
                         <Settings2 size={12} /> 配置
                       </button>
                       <button 
                         onClick={() => { setActivePlugin(plugin); setTestModalOpen(true); }}
                         className="hover:underline text-[11px] flex items-center gap-1 transition-all"
                       >
                         <Terminal size={12} /> 测试
                       </button>
                       <button 
                         onClick={() => { setActivePlugin(plugin); setLogModalOpen(true); }}
                         className="hover:underline text-[11px] flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-all"
                       >
                         <Logs size={12} /> 日志
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPluginsRaw.length === 0 && (
             <div className="py-32 flex flex-col items-center justify-center text-slate-300">
                <FileSearch size={48} className="mb-4 opacity-50" />
                <p className="text-sm font-bold">没有找到匹配的插件</p>
                <p className="text-xs mt-1 text-slate-400">请检查筛选条件或确认插件包已上架运行</p>
             </div>
           )}
        </div>
      </div>

      {/* Configuration Slider Placeholder */}
      {activePlugin && !isTestModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setActivePlugin(null)} />
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col overflow-hidden"
          >
            <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md">
                  <Settings2 size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">插件参数配置</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{activePlugin.name} / {activePlugin.code}</p>
                </div>
              </div>
              <button onClick={() => setActivePlugin(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </header>

            <div className="flex-1 overflow-auto p-10 space-y-8">
               <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700 leading-relaxed italic flex gap-3">
                 <HelpCircle size={16} className="shrink-0 mt-0.5 opacity-50" />
                 <span>配置参数将作为插件运行时的初始化选项，修改后将在下次任务执行时生效。</span>
               </div>

               <div className="space-y-6">
                 {activePlugin.parameters.map(p => (
                   <div key={p.code}>
                     <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                       {p.name} {p.required && <span className="text-rose-500">*</span>}
                     </label>
                     <input 
                       type="text" 
                       defaultValue={p.defaultValue}
                       className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700" 
                     />
                     <span className="text-[10px] text-slate-400 mt-1 block font-mono">Code: {p.code} | Type: {p.type.toUpperCase()}</span>
                   </div>
                 ))}
               </div>
            </div>

            <footer className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
               <button onClick={() => setActivePlugin(null)} className="px-6 py-2 bg-white border border-slate-200 text-slate-500 font-bold rounded-lg hover:bg-slate-50 transition-all">取消</button>
               <button className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md shadow-blue-100 transition-all active:scale-[0.98]">
                 保存配置
               </button>
            </footer>
          </motion.div>
        </div>
      )}

      {/* Test Modal (Match wireframe - 4 panels JSON UI) */}
      <AnimatePresence>
        {isTestModalOpen && activePlugin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh] border border-slate-200"
            >
              <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-900 text-white rounded-lg flex items-center justify-center">
                    <Terminal size={18} />
                  </div>
                  <h2 className="font-bold text-slate-800 tracking-tight">插件功能测试 - {activePlugin.name}</h2>
                </div>
                <button onClick={() => setTestModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </header>

              <div className="flex-1 overflow-hidden flex flex-col p-6 space-y-4">
                {/* 4 Quadrant Layout */}
                <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4 overflow-hidden">
                  {/* Top Left: Input Def */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col bg-slate-50/30">
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 italic">
                        <FileCode size={14} className="text-slate-400" /> 入参定义
                      </span>
                    </div>
                    <div className="flex-1 p-4 overflow-auto font-mono text-[12px] text-slate-500 leading-relaxed">
                      <pre>{JSON.stringify(activePlugin.parameters, null, 2)}</pre>
                    </div>
                  </div>

                  {/* Top Right: Return Desc */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col bg-slate-50/30">
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 italic">
                         <Braces size={14} className="text-slate-400" /> 返回说明
                      </span>
                    </div>
                    <div className="flex-1 p-4 overflow-auto font-mono text-[12px] text-slate-500 leading-relaxed italic opacity-70">
                      {"{\n  \"status\": \"success | error\",\n  \"data\": \"Object\",\n  \"message\": \"String\"\n}"}
                    </div>
                  </div>

                  {/* Bottom Left: Test Data */}
                  <div className="border-2 border-blue-100 rounded-xl overflow-hidden flex flex-col shadow-sm">
                    <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2 italic">
                         <Cpu size={14} /> 测试数据
                      </span>
                    </div>
                    <textarea 
                      className="flex-1 p-4 font-mono text-[12px] outline-none resize-none bg-white text-slate-700"
                      value={testInputData}
                      onChange={e => setTestInputData(e.target.value)}
                    />
                  </div>

                  {/* Bottom Right: Test Result */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col bg-slate-900 shadow-inner">
                    <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">
                         <CheckCircle size={14} className="text-green-500" /> 测试结果
                      </span>
                    </div>
                    <div className="flex-1 p-4 overflow-auto font-mono text-[12px] text-green-400 leading-relaxed">
                      {isRunning ? (
                        <div className="h-full flex flex-col items-center justify-center gap-2 opacity-50">
                          <RefreshCw className="animate-spin" size={24} />
                          <p>Executing...</p>
                        </div>
                      ) : testResult ? (
                        <pre className="whitespace-pre-wrap">{testResult}</pre>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-700 italic">
                          Click "Run Test" to see results.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Common Action Bar in the middle of quadrants (as per wireframe style) */}
                <div className="flex items-center justify-center gap-4 py-2">
                   <button 
                     onClick={generateData}
                     className="px-6 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                   >
                     生成测试数据
                   </button>
                   <button className="px-6 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                     校验测试数据
                   </button>
                   <button 
                     onClick={runTest}
                     disabled={isRunning}
                     className="px-10 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 flex items-center gap-2 active:scale-[0.98] disabled:opacity-50"
                   >
                     {isRunning ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                     运行测试
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Log Modal */}
      <AnimatePresence>
        {isLogModalOpen && activePlugin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[70vh] border border-slate-700"
            >
              <header className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-800 text-blue-400 rounded-lg flex items-center justify-center border border-slate-700 shadow-sm">
                    <Logs size={18} />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-100 tracking-tight">插件运行日志 - {activePlugin.name}</h2>
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{activePlugin.code}</p>
                  </div>
                </div>
                <button onClick={() => setLogModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </header>

              <div className="flex-1 p-6 font-mono text-[12px] text-slate-300 overflow-auto bg-slate-950/50 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
                 <div className="space-y-1">
                   <p className="text-slate-600">--- Log session started at {new Date().toLocaleTimeString()} ---</p>
                   <p className="text-blue-400">[INFO] Loaded configuration for {activePlugin.code}</p>
                   <p className="text-green-500">[SUCCESS] Plugin binary checksum verified.</p>
                   <p className="text-slate-400">[DEBUG] Initializing worker thread pool (size=4)...</p>
                   <p className="text-slate-400">[DEBUG] Connecting to message broker...</p>
                   <p className="text-green-500">[SUCCESS] Connection established.</p>
                   <p className="text-slate-100">[STDOUT] Worker-1 starts processing task #9982</p>
                   <p className="text-slate-100 pl-4">Transforming input data using Python 3.10 engine...</p>
                   <p className="text-slate-100 pl-4">Applying filter: ignore_null=true</p>
                   <p className="text-blue-400 pl-4">[INTERNAL] Memory usage stable at 142MB</p>
                   <p className="text-slate-100">[STDOUT] Task #9982 completed in 45ms</p>
                   <p className="text-slate-100">[STDOUT] Worker-1 waiting for new tasks...</p>
                   {/* Continuous tail animation simulation */}
                   <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1, repeat: Infinity }} className="inline-block w-2 h-4 bg-blue-500 rounded-sm align-middle ml-1" />
                 </div>
              </div>

              <footer className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Streaming
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-1.5 bg-slate-800 text-slate-300 rounded text-xs font-bold hover:bg-slate-700 transition-all border border-slate-700">清空日志</button>
                  <button className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition-all shadow-md">导出日志</button>
                </div>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
