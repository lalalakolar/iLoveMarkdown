import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';

// 缓存目录
const CACHE_DIR = path.join(__dirname, '../../..', 'cache');

// 确保缓存目录存在
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * 生成文件的唯一哈希值
 * @param buffer 文件内容
 * @returns 哈希值
 */
const generateFileHash = (buffer: Buffer): string => {
  return crypto.createHash('md5').update(buffer).digest('hex');
};

/**
 * 生成缓存文件路径
 * @param hash 文件哈希
 * @param conversionType 转换类型
 * @param outputFormat 输出格式
 * @returns 缓存文件路径
 */
const getCacheFilePath = (hash: string, conversionType: string, outputFormat: string): string => {
  return path.join(CACHE_DIR, `${hash}_${conversionType}_${outputFormat}`);
};

/**
 * 检查缓存是否存在
 * @param hash 文件哈希
 * @param conversionType 转换类型
 * @param outputFormat 输出格式
 * @returns 是否存在缓存
 */
export const isCacheExists = (hash: string, conversionType: string, outputFormat: string): boolean => {
  const cacheFilePath = getCacheFilePath(hash, conversionType, outputFormat);
  return fs.existsSync(cacheFilePath);
};

/**
 * 从缓存中读取转换结果
 * @param hash 文件哈希
 * @param conversionType 转换类型
 * @param outputFormat 输出格式
 * @returns 缓存的转换结果
 */
export const readFromCache = (hash: string, conversionType: string, outputFormat: string): Buffer => {
  const cacheFilePath = getCacheFilePath(hash, conversionType, outputFormat);
  return fs.readFileSync(cacheFilePath);
};

/**
 * 将转换结果写入缓存
 * @param hash 文件哈希
 * @param conversionType 转换类型
 * @param outputFormat 输出格式
 * @param data 转换结果
 */
export const writeToCache = (hash: string, conversionType: string, outputFormat: string, data: Buffer): void => {
  const cacheFilePath = getCacheFilePath(hash, conversionType, outputFormat);
  fs.writeFileSync(cacheFilePath, data);
};

/**
 * 清理过期缓存（7天前的缓存）
 */
export const cleanExpiredCache = (): void => {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  
  try {
    const files = fs.readdirSync(CACHE_DIR);
    files.forEach(file => {
      const filePath = path.join(CACHE_DIR, file);
      const stats = fs.statSync(filePath);
      if (stats.mtime.getTime() < sevenDaysAgo) {
        fs.unlinkSync(filePath);
      }
    });
  } catch (error) {
    console.error('清理缓存时出错:', error);
  }
};

/**
 * 计算文件哈希并检查缓存
 * @param fileBuffer 文件内容
 * @param conversionType 转换类型
 * @param outputFormat 输出格式
 * @returns 缓存检查结果
 */
export const checkCache = (fileBuffer: Buffer, conversionType: string, outputFormat: string): { exists: boolean; hash: string; data?: Buffer } => {
  const hash = generateFileHash(fileBuffer);
  const exists = isCacheExists(hash, conversionType, outputFormat);
  
  if (exists) {
    const data = readFromCache(hash, conversionType, outputFormat);
    return { exists: true, hash, data };
  }
  
  return { exists: false, hash };
};