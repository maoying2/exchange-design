/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Settings, 
  ChevronRight, 
  Menu, 
  Layout, 
  Database, 
  ArrowLeftRight as Swap, 
  FunctionSquare as Func, 
  FileJson, 
  Network 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PluginPackage, 
  MenuType, 
  PluginCategory, 
  PackageStatus, 
  PluginStatus 
} from './types';
import ReleaseManagement from './pages/ReleaseManagement';
import ConfigManagement from './pages/ConfigManagement';

// Initial Mock Data
const INITIAL_PACKAGES: PluginPackage[] = [
  {
    id: 'pkg-1',
    name: 'MySQL数据源适配器',
    category: PluginCategory.DATA_SOURCE,
    code: 'datasource.mysql.v1',
    language: 'Java',
    uploader: '张研发',
    uploadTime: '2024-12-21 10:30:00',
    currentVersion: '1.2.0',
    description: '支持MySQL 5.7+的数据源高速采集与同步插件',
    detailDescription: '{\n  "engine": "v3",\n  "driver": "com.mysql.cj.jdbc.Driver",\n  "threadPool": 50\n}',
    status: PackageStatus.RUNNING,
    versions: [
      { version: '1.2.0', uploadTime: '2024-12-21 10:30:00', uploader: '张研发', description: '增强批量入库性能' },
      { version: '1.1.0', uploadTime: '2024-10-31 15:45:00', uploader: '李运维', description: '修复连接池泄露BUG' }
    ],
    plugins: [
      {
        id: 'p-1-1',
        code: 'mysql.writer',
        name: 'MySQL高速写入器',
        subCategory: 'IDataWriter',
        description: '高性能MySQL写入插件',
        status: PluginStatus.ENABLED,
        parameters: [
          { name: '连接字符串', code: 'jdbcUrl', type: 'string', required: true, defaultValue: 'jdbc:mysql://localhost:3306/db' },
          { name: '并发数', code: 'concurrency', type: 'number', required: false, defaultValue: '8' }
        ]
      }
    ]
  },
  {
    id: 'pkg-2',
    name: 'JSON/XML转换工具包',
    category: PluginCategory.FILE_CONVERSION,
    code: 'converter.standard.v1',
    language: 'Python',
    uploader: '王架构',
    uploadTime: '2024-10-31 09:20:00',
    currentVersion: '2.0.1',
    description: '标准报文格式转换插件，支持多层级嵌套解析',
    detailDescription: '{\n  "lib": "xmltodict",\n  "parser": "lxml"\n}',
    status: PackageStatus.OFFLINE,
    versions: [
      { version: '2.0.1', uploadTime: '2024-10-31 09:20:00', uploader: '王架构', description: '发布2.0正式版' }
    ],
    plugins: [
      {
        id: 'p-2-1',
        code: 'json.to.xml',
        name: 'JSON转XML',
        subCategory: 'IFileConverter',
        description: '将JSON数据流转换为XML格式',
        status: PluginStatus.DISABLED,
        parameters: [
          { name: '根节点名', code: 'rootElement', type: 'string', required: true, defaultValue: 'root' }
        ]
      }
    ]
  },
  {
    id: 'pkg-3',
    name: 'Oracle 高级链接器',
    category: PluginCategory.DATA_SOURCE,
    code: 'datasource.oracle.v2',
    language: 'Java',
    uploader: '周研发',
    uploadTime: '2025-01-15 14:00:00',
    currentVersion: '2.1.0',
    description: '支持 Oracle 19c 容器化部署的数据源插件',
    detailDescription: '{\n  "engine": "v3",\n  "driver": "oracle.jdbc.OracleDriver"\n}',
    status: PackageStatus.ERROR,
    versions: [
      { version: '2.1.0', uploadTime: '2025-01-15 14:00:00', uploader: '周研发', description: '初始发布' }
    ],
    plugins: [
      {
        id: 'p-3-1',
        code: 'oracle.reader',
        name: 'Oracle读取器',
        subCategory: 'IDataReader',
        description: 'Oracle 数据库增量读取',
        status: PluginStatus.DISABLED,
        parameters: [
          { name: '监听地址', code: 'host', type: 'string', required: true, defaultValue: '127.0.0.1' }
        ]
      }
    ]
  },
  {
    id: 'pkg-4',
    name: 'Kafka 实时消息引擎',
    category: PluginCategory.DATA_EXCHANGE,
    code: 'exchange.kafka.v3',
    language: 'Go',
    uploader: '郑开发',
    uploadTime: '2025-02-10 16:30:00',
    currentVersion: '3.5.2',
    description: '高吞吐量实时消息交换插件',
    detailDescription: '{\n  "engine": "v3",\n  "broker": "localhost:9092"\n}',
    status: PackageStatus.OFFLINE,
    versions: [
      { version: '3.5.2', uploadTime: '2025-02-10 16:30:00', uploader: '郑开发', description: '升级底层SDK' }
    ],
    plugins: [
      {
        id: 'p-4-1',
        code: 'kafka.producer',
        name: 'Kafka生产者',
        subCategory: 'IMessageSender',
        description: '发送消息到 Kafka Topic',
        status: PluginStatus.ENABLED,
        parameters: [
          { name: 'Topic名', code: 'topic', type: 'string', required: true, defaultValue: 'test-topic' }
        ]
      }
    ]
  }
];

export default function App() {
  const [activeMenu, setActiveMenu] = useState<MenuType>('RELEASE');
  const [packages, setPackages] = useState<PluginPackage[]>(INITIAL_PACKAGES);

  // Stats for the header
  const stats = useMemo(() => {
    return {
      total: packages.length,
      running: packages.filter(p => p.status === PackageStatus.RUNNING).length,
      offline: packages.filter(p => p.status === PackageStatus.OFFLINE).length,
    };
  }, [packages]);

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8FAFC] font-sans overflow-hidden text-[#1E293B]">
      {/* Top Navigation */}
      <nav className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm transition-all">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-100 group-hover:scale-105 transition-transform">
              <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">DExP Manager</span>
          </div>

          <div className="flex">
            <button
              onClick={() => setActiveMenu('RELEASE')}
              className={`px-6 py-4 text-sm font-semibold transition-all border-b-2 h-14 ${
                activeMenu === 'RELEASE' 
                ? 'border-blue-600 text-blue-600 bg-blue-50/30' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              插件包发布管理
            </button>
            <button
              onClick={() => setActiveMenu('CONFIG')}
              className={`px-6 py-4 text-sm font-semibold transition-all border-b-2 h-14 ${
                activeMenu === 'CONFIG' 
                ? 'border-blue-600 text-blue-600 bg-blue-50/30' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              插件配置管理
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              <span>Total: {stats.total}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span>Running: {stats.running}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Menu size={16} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Developer Mode</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden p-6 relative">
        <AnimatePresence mode="wait">
          {activeMenu === 'RELEASE' ? (
            <motion.div
              key="release"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="h-full"
            >
              <ReleaseManagement packages={packages} setPackages={setPackages} />
            </motion.div>
          ) : (
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="h-full"
            >
              <ConfigManagement packages={packages} setPackages={setPackages} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function SidebarItem({ 
  icon, 
  label, 
  active, 
  onClick, 
  collapsed 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onClick: () => void;
  collapsed: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group overflow-hidden
        ${active 
          ? 'bg-blue-50 text-blue-700 shadow-sm shadow-blue-100/50 font-medium' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
        }
      `}
    >
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-600 rounded-r-full"
        />
      )}
      <div className={`${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
        {icon}
      </div>
      {!collapsed && (
        <span className="truncate text-sm tracking-tight">{label}</span>
      )}
    </button>
  );
}

