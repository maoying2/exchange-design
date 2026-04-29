/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum PluginCategory {
  DATA_SOURCE = '数据源对接插件',
  DATA_EXCHANGE = '数据交换插件',
  MAPPING_FUNCTION = '映射函数插件',
  FILE_CONVERSION = '文件转换插件',
  RESOURCE_COLLECTION = '资源采集插件',
}

export enum PackageStatus {
  OFFLINE = '已下架',
  ONLINE = '上架中',
  RUNNING = '运行中',
  ERROR = '异常',
}

export enum PluginStatus {
  ENABLED = '启用',
  DISABLED = '停用',
}

export interface PluginParameter {
  name: string;
  code: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  required: boolean;
  defaultValue: string;
}

export interface PluginDetail {
  id: string;
  code: string;
  name: string;
  subCategory: string; // 细类 (扩展接口名)
  description: string;
  parameters: PluginParameter[];
  status: PluginStatus;
}

export interface PluginPackageVersion {
  version: string;
  uploadTime: string;
  uploader: string;
  description: string;
  fileUrl?: string;
  detailJson?: string;
}

export interface PluginPackage {
  id: string;
  name: string;
  category: PluginCategory;
  code: string; // 业务唯一标识
  language: 'Java' | 'Python' | 'Go' | 'NodeJS';
  uploader: string;
  uploadTime: string;
  currentVersion: string;
  description: string;
  detailDescription: string; // 明细插件描述 (json文件内)
  status: PackageStatus;
  versions: PluginPackageVersion[];
  plugins: PluginDetail[]; // 包含的明细插件
}

export type MenuType = 'RELEASE' | 'CONFIG';
