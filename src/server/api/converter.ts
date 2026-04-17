// Markdown转换API接口
import { MarkdownConverter, ConversionType } from '../converter/markdownConverter';
import * as fs from 'fs';
import * as path from 'path';
import { HttpError, prisma } from 'wasp/server';
import { SubscriptionStatus } from '../../payment/plans';
import { checkCache, writeToCache, cleanExpiredCache } from '../converter/cacheManager';

// 创建转换服务实例
const converter = new MarkdownConverter();

// 转换请求接口
interface ConvertRequest {
  fileContent: string; // Base64编码的文件内容
  fileName: string;   // 文件名
  conversionType: ConversionType; // 转换类型
}

// 转换响应接口
interface ConvertResponse {
  success: boolean;
  message: string;
  outputFile?: string; // Base64编码的转换结果
  outputFileName?: string; // 输出文件名
}

/**
 * Markdown转换API
 * @param req 转换请求
 * @param context 上下文
 * @returns 转换响应
 */
export const convertMarkdown = async (req: ConvertRequest, context: any): Promise<ConvertResponse> => {
  let inputPath: string | null = null;
  let outputPath: string | null = null;

  try {
    // 清理过期缓存（定期执行）
    cleanExpiredCache();

    // 检查文件大小
    const fileBuffer = Buffer.from(req.fileContent, 'base64');
    const fileSize = fileBuffer.length;
    const isProUser = context.user?.subscriptionStatus === SubscriptionStatus.Active;
    
    // 免费版限制：文件大小 ≤ 10MB
    if (!isProUser && fileSize > 10 * 1024 * 1024) {
      return {
        success: false,
        message: '文件过大，免费版支持的文件大小限制为10MB'
      };
    }
    
    // Pro版限制：文件大小 ≤ 50MB
    if (isProUser && fileSize > 50 * 1024 * 1024) {
      return {
        success: false,
        message: '文件过大，Pro版支持的文件大小限制为50MB'
      };
    }

    // 检查每日转换次数（仅对免费用户）
    if (!isProUser) {
      // 这里应该实现每日转换次数的检查
      // 暂时跳过，实际实现需要在数据库中记录转换次数
    }

    // 检查缓存
    const outputExtension = getOutputExtension(req.conversionType);
    const outputFileName = `${req.fileName.replace(/\.[^/.]+$/, '')}_converted${outputExtension}`;
    const cacheResult = checkCache(fileBuffer, req.conversionType, outputExtension);
    
    if (cacheResult.exists && cacheResult.data) {
      console.log('使用缓存的转换结果');
      const outputFile = cacheResult.data.toString('base64');
      return {
        success: true,
        message: '转换成功（从缓存）',
        outputFile,
        outputFileName
      };
    }

    // 创建临时文件路径
    const tempDir = path.join(__dirname, '..', '..', '..', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // 生成输入文件路径
    inputPath = path.join(tempDir, req.fileName);
    
    // 解码Base64文件内容并写入临时文件（使用流式写入）
    fs.writeFileSync(inputPath, fileBuffer);

    // 生成输出文件名和路径
    outputPath = path.join(tempDir, outputFileName);

    // 执行转换
    await converter.convert({
      inputPath,
      outputPath,
      conversionType: req.conversionType
    });

    // 读取转换结果并编码为Base64（使用流式读取）
    const outputBuffer = fs.readFileSync(outputPath);
    const outputFile = outputBuffer.toString('base64');

    // 写入缓存
    writeToCache(cacheResult.hash, req.conversionType, outputExtension, outputBuffer);

    // 清理临时文件
    if (inputPath && fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }
    if (outputPath && fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }

    // 记录转换次数（仅对免费用户）
    if (!isProUser) {
      // 这里应该实现每日转换次数的记录
      // 暂时跳过，实际实现需要在数据库中记录转换次数
    }

    return {
      success: true,
      message: '转换成功',
      outputFile,
      outputFileName
    };
  } catch (error) {
    console.error('转换API错误:', error);
    
    // 清理临时文件
    if (inputPath && fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }
    if (outputPath && fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    
    return {
      success: false,
      message: error instanceof Error ? error.message : '转换失败'
    };
  }
};

/**
 * 根据转换类型获取输出文件扩展名
 * @param conversionType 转换类型
 * @returns 输出文件扩展名
 */
function getOutputExtension(conversionType: ConversionType): string {
  switch (conversionType) {
    case 'pdf-to-md':
    case 'word-to-md':
    case 'html-to-md':
      return '.md';
    case 'md-to-pdf':
      return '.pdf';
    case 'md-to-word':
      return '.docx';
    case 'md-to-html':
      return '.html';
    default:
      return '.md';
  }
}
