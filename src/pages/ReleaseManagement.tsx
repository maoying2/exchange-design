/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  X,
  Upload, 
  History,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Database,
  Trash2,
  ArrowRight,
  Loader2,
  ChevronRight,
  Download,
  Terminal,
  FileCode,
  Package,
  Layers,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PluginPackage, PluginCategory, PackageStatus, PluginStatus } from '../types';

interface ReleaseManagementProps {
  packages: PluginPackage[];
  setPackages: React.Dispatch<React.SetStateAction<PluginPackage[]>>;
}

interface StepProgress {
  id: number;
  label: string;
  status: 'waiting' | 'loading' | 'success' | 'error';
}

export default function ReleaseManagement({ packages, setPackages }: ReleaseManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PluginPackage | null>(null);
  const [onboardingPkgId, setOnboardingPkgId] = useState<string | null>(null);
  const [onboardingSteps, setOnboardingSteps] = useState<StepProgress[]>([
    { id: 1, label: '历史包卸载', status: 'waiting' },
    { id: 2, label: '插件包下载', status: 'waiting' },
    { id: 3, label: '插件包解析', status: 'waiting' },
    { id: 4, label: '插件包装载', status: 'waiting' },
    { id: 5, label: '插件注册', status: 'waiting' },
  ]);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filtering
  const filteredPackages = packages.filter(pkg => 
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    pkg.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredPackages.length) setSelectedIds([]);
    else setSelectedIds(filteredPackages.map(p => p.id));
  };

  const startOnboarding = (pkgId: string) => {
    setOnboardingPkgId(pkgId);
    let step = 0;
    const interval = setInterval(() => {
      setOnboardingSteps(prev => prev.map((s, i) => {
        if (i < step) return { ...s, status: 'success' };
        if (i === step) return { ...s, status: 'loading' };
        return s;
      }));

      if (step > 5) {
        clearInterval(interval);
        setPackages(prev => prev.map(p => p.id === pkgId ? { ...p, status: PackageStatus.RUNNING } : p));
        setTimeout(() => setOnboardingPkgId(null), 1000);
      }
      step++;
    }, 800);
  };

  const getStatusBadge = (status: PackageStatus) => {
    switch (status) {
      case PackageStatus.RUNNING: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-600 border border-green-100">运行中</span>;
      case PackageStatus.OFFLINE: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-400 border border-slate-200">已下架</span>;
      case PackageStatus.ONLINE: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 italic">上架中...</span>;
      case PackageStatus.ERROR: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">运行异常</span>;
      default: return null;
    }
  };

  const isDeletable = (ids: string[]) => {
    const selectedPkgs = packages.filter(p => ids.includes(p.id));
    return selectedPkgs.length > 0 && selectedPkgs.every(p => p.status === PackageStatus.OFFLINE || p.status === PackageStatus.ERROR);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-slate-800">
      {/* Header Toolbar */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAddModalOpen(true)}
            className="h-9 px-4 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus size={16} /> 新增发布
          </button>
          
          <div className="h-4 w-px bg-slate-200" />
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="搜索插件包名称、编码..."
              className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 w-64 transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4 ml-4 px-4 py-1.5 bg-amber-50/50 border border-amber-100 rounded-lg shrink-0">
             <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 uppercase tracking-tight">
               <Info size={12} /> 状态控制说明: 
             </div>
             <span className="text-[10px] text-amber-600 font-medium">运行中的插件包不可编辑/删除；异常或下架状态可完全管理。</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
              <span className="text-xs text-slate-400 mr-2 flex items-center gap-1">
                <Info size={12} className="text-blue-400" />
                已选择 {selectedIds.length} 项 {!isDeletable(selectedIds) && <span className="text-rose-400 text-[10px]">(包含运行中项不可删除)</span>}
              </span>
              <button className="h-8 px-3 bg-white border border-slate-200 rounded text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs transition-all">
                <Download size={14} /> 批量导出
              </button>
              <button 
                disabled={!isDeletable(selectedIds)}
                className={`h-8 px-3 border rounded text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all ${isDeletable(selectedIds) ? 'bg-white border-slate-200 text-rose-500 hover:bg-rose-50' : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'}`}
              >
                <Trash2 size={14} /> 批量删除
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse table-fixed">
          <thead className="bg-slate-50/50 sticky top-0 z-10 border-b border-slate-100">
            <tr>
              <th className="w-12 px-4 py-3">
                <input 
                  type="checkbox" 
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                  checked={selectedIds.length === filteredPackages.length && filteredPackages.length > 0}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/4">插件包名称</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider w-40">版本</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider w-32">开发语言</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider w-32">发布人</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider w-40">更新时间</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider w-24">状态</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right w-32">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm">
            {filteredPackages.map(pkg => (
              <tr key={pkg.id} className={`group hover:bg-slate-50/80 transition-colors ${selectedIds.includes(pkg.id) ? 'bg-blue-50/30' : ''}`}>
                <td className="px-4 py-4">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                    checked={selectedIds.includes(pkg.id)}
                    onChange={() => toggleSelect(pkg.id)}
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col">
                    <span 
                      className="font-bold text-slate-800 cursor-pointer hover:text-blue-600 truncate"
                      onClick={() => setSelectedPackage(pkg)}
                    >
                      {pkg.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{pkg.code}</span>
                  </div>
                </td>
                <td className="px-4 py-4 font-mono text-slate-500">v{pkg.currentVersion}</td>
                <td className="px-4 py-4">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold">{pkg.language}</span>
                </td>
                <td className="px-4 py-4 text-slate-600">{pkg.uploader}</td>
                <td className="px-4 py-4 text-slate-400 text-xs">{pkg.uploadTime}</td>
                <td className="px-4 py-4">{getStatusBadge(pkg.status)}</td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-3 text-xs">
                    {/* 上架/下架 */}
                    {pkg.status === PackageStatus.OFFLINE || pkg.status === PackageStatus.ERROR ? (
                      <button 
                         onClick={() => startOnboarding(pkg.id)}
                         className="text-blue-600 font-bold hover:underline"
                      >
                        上架
                      </button>
                    ) : pkg.status === PackageStatus.RUNNING ? (
                      <button className="text-orange-500 font-bold hover:underline">下架</button>
                    ) : null}

                    {/* 升级: 运行中才允许升级 */}
                    <button 
                      disabled={pkg.status !== PackageStatus.RUNNING}
                      className={`font-bold transition-all ${pkg.status === PackageStatus.RUNNING ? 'text-blue-600 hover:underline' : 'text-slate-300 cursor-not-allowed'}`}
                    >
                      升级
                    </button>

                    {/* 编辑: 只有下架或异常才允许编辑 */}
                    <button 
                      disabled={pkg.status === PackageStatus.RUNNING || pkg.status === PackageStatus.ONLINE}
                      className={`font-bold transition-all ${(pkg.status === PackageStatus.OFFLINE || pkg.status === PackageStatus.ERROR) ? 'text-blue-600 hover:underline' : 'text-slate-300 cursor-not-allowed'}`}
                    >
                      编辑
                    </button>

                    <button 
                      onClick={() => setSelectedPackage(pkg)}
                      className="text-slate-400 font-bold hover:text-slate-600 hover:underline"
                    >
                      详情
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Onboarding Progress Modal */}
      <AnimatePresence>
        {onboardingPkgId && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-8"
            >
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 shadow-sm border border-blue-100">
                  <Loader2 className="animate-spin" size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">插件上架中</h3>
                <p className="text-sm text-slate-400 mt-1 italic tracking-tight">正在准备运行环境，请稍候...</p>
              </div>

              <div className="space-y-4">
                {onboardingSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${step.status === 'success' ? 'bg-green-500 border-green-500 text-white' : step.status === 'loading' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-slate-200 text-slate-300'}`}>
                      {step.status === 'success' ? <CheckCircle2 size={14} /> : step.id}
                    </div>
                    <span className={`text-sm font-medium transition-colors ${step.status === 'loading' ? 'text-blue-600 font-bold' : step.status === 'success' ? 'text-slate-700' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                    {step.status === 'loading' && <Loader2 size={14} className="animate-spin text-blue-600" />}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Add Plugin Modal (Match Wireframe) */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
            >
              <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">发布插件包</h2>
                <button onClick={() => setAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </header>

              <div className="flex-1 overflow-auto p-10 space-y-10">
                {/* Form Sections */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                  <FormField label="插件包名称" required placeholder="请输入名称" className="col-span-2" />
                  
                  <FormField label="插件包编码" required placeholder="例如: datasource.mysql.v1" />
                  <FormField label="插件包版本" required placeholder="例如: 1.0.0" />
                  
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">插件包种类 <span className="text-rose-500">*</span></label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-600">
                      {Object.values(PluginCategory).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">开发语言 <span className="text-rose-500">*</span></label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-600">
                      <option>Java</option>
                      <option>Python</option>
                      <option>Go</option>
                      <option>NodeJS</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">插件包文件 <span className="text-rose-500">*</span></label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 bg-slate-50 flex flex-col items-center justify-center group hover:border-blue-400 transition-all cursor-pointer">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 mb-4 group-hover:text-blue-500 transition-colors">
                        <Upload size={32} />
                      </div>
                      <p className="text-lg font-bold text-slate-700">文件上传</p>
                      <p className="text-xs text-slate-400 mt-1 italic uppercase tracking-tighter">MAX 200MB / .JAR .PY .ZIP</p>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">插件包简述</label>
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 h-24 resize-none transition-all"
                      placeholder="简单描述插件的功能和用途..."
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">插件描述 (JSON配置内容)</label>
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 h-40 font-mono resize-none transition-all text-blue-600"
                      defaultValue={`{\n  "engine": "v3",\n  "plugins": [\n    { "code": "demo", "name": "演示插件" }\n  ]\n}`}
                    />
                  </div>
                </div>
              </div>

              <footer className="px-8 py-6 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <button 
                  onClick={() => setAddModalOpen(false)}
                  className="px-6 py-2 bg-slate-100 text-slate-500 rounded-lg font-bold hover:bg-slate-200 transition-all"
                >
                  取消
                </button>
                <button className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md shadow-blue-100 transition-all active:scale-[0.98]">
                  确认保存
                </button>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Drawer (Match Wireframe) */}
      <AnimatePresence>
        {selectedPackage && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setSelectedPackage(null)}
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-200"
            >
              <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                    <Package size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">{selectedPackage.name}</h2>
                    <p className="text-xs text-slate-400 font-mono italic tracking-tighter uppercase">{selectedPackage.code}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedPackage(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </header>

              <div className="flex-1 overflow-auto p-10 space-y-12">
                {/* 插件基本信息 */}
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-4 bg-blue-500 rounded-full" />
                    <h3 className="font-bold text-slate-800">插件基本信息</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                    <DetailItem label="插件名称" value={selectedPackage.name} />
                    <DetailItem label="插件包编码" value={selectedPackage.code} mono />
                    <DetailItem label="插件包种类" value={selectedPackage.category} />
                    <DetailItem label="开发语言" value={selectedPackage.language} />
                    <DetailItem label="发布人员" value={selectedPackage.uploader} />
                    <DetailItem label="发布时间" value={selectedPackage.uploadTime} />
                    <div className="col-span-2">
                      <DetailItem label="插件简述" value={selectedPackage.description} multiline />
                    </div>
                  </div>
                </section>

                {/* 插件明细信息 */}
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-4 bg-blue-500 rounded-full" />
                    <h3 className="font-bold text-slate-800">插件明细信息</h3>
                  </div>
                  <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead className="bg-slate-50/50">
                        <tr className="border-b border-slate-100">
                          <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">插件名称</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">插件代码</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">插件类型</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">状态</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {selectedPackage.plugins.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-700">{p.name}</td>
                            <td className="px-4 py-3 font-mono text-xs text-slate-400">{p.code}</td>
                            <td className="px-4 py-3 text-slate-500">{p.subCategory}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.status === PluginStatus.ENABLED ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button className="text-blue-600 font-bold hover:underline">详情</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* 历史版本信息 */}
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-4 bg-blue-500 rounded-full" />
                    <h3 className="font-bold text-slate-800">历史版本信息</h3>
                  </div>
                  <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead className="bg-slate-50/50">
                        <tr className="border-b border-slate-100">
                          <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">插件包代码</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">插件包版本</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">发布时间</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">发布人员</th>
                          <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {selectedPackage.versions.map(v => (
                          <tr key={v.version} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs text-slate-400">{selectedPackage.code}</td>
                            <td className="px-4 py-3 font-bold text-slate-600">v{v.version}</td>
                            <td className="px-4 py-3 text-slate-400 text-xs">{v.uploadTime}</td>
                            <td className="px-4 py-3 text-slate-600">{v.uploader}</td>
                            <td className="px-4 py-3 text-right text-blue-600 font-bold">
                              <button className="hover:underline">下载</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              <footer className="px-10 py-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 shrink-0">
                <button 
                  onClick={() => setSelectedPackage(null)}
                  className="px-6 py-2 bg-white border border-slate-200 text-slate-500 font-bold rounded-lg hover:bg-slate-50 transition-all"
                >
                  关闭
                </button>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FormField({ label, required, placeholder, className, mono }: any) {
  return (
    <div className={className}>
      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input 
        type="text" 
        className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-300 ${mono ? 'font-mono' : ''}`}
        placeholder={placeholder}
      />
    </div>
  );
}

function DetailItem({ label, value, mono, multiline }: any) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-24 text-sm font-bold text-slate-400 text-right shrink-0">{label}:</span>
      <div className={`flex-1 text-sm ${mono ? 'font-mono text-blue-600' : 'text-slate-700'} ${multiline ? 'bg-slate-50 p-4 rounded-xl border border-slate-100 italic text-slate-500' : 'font-medium'}`}>
        {value}
      </div>
    </div>
  );
}
