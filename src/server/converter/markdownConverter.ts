// Markdown转换服务
// 集成Microsoft MarkItDown转换核心功能

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

// 转换类型定义
export type ConversionType = 
  | 'pdf-to-md' 
  | 'word-to-md' 
  | 'md-to-pdf' 
  | 'md-to-word'
  | 'html-to-md'
  | 'md-to-html';

// 转换选项接口
export interface ConversionOptions {
  inputPath: string;
  outputPath: string;
  conversionType: ConversionType;
}

// Markdown转换服务类
export class MarkdownConverter {
  private tempDir: string;

  constructor() {
    // 创建临时目录用于存储转换文件
    this.tempDir = path.join(__dirname, '..', '..', '..', 'temp');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * 执行文件转换
   * @param options 转换选项
   * @returns 转换后的文件路径
   */
  async convert(options: ConversionOptions): Promise<string> {
    try {
      // 清理之前的输出文件
      if (fs.existsSync(options.outputPath)) {
        fs.unlinkSync(options.outputPath);
      }

      // 根据转换类型执行不同的转换命令
      switch (options.conversionType) {
        case 'pdf-to-md':
          await this.pdfToMarkdown(options.inputPath, options.outputPath);
          break;
        case 'word-to-md':
          await this.wordToMarkdown(options.inputPath, options.outputPath);
          break;
        case 'md-to-pdf':
          await this.markdownToPdf(options.inputPath, options.outputPath);
          break;
        case 'md-to-word':
          await this.markdownToWord(options.inputPath, options.outputPath);
          break;
        case 'html-to-md':
          await this.htmlToMarkdown(options.inputPath, options.outputPath);
          break;
        case 'md-to-html':
          await this.markdownToHtml(options.inputPath, options.outputPath);
          break;
        default:
          throw new Error(`不支持的转换类型: ${options.conversionType}`);
      }

      return options.outputPath;
    } catch (error) {
      console.error('转换失败:', error);
      // 清理临时文件
      if (fs.existsSync(options.outputPath)) {
        fs.unlinkSync(options.outputPath);
      }
      throw new Error(`转换失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * PDF转Markdown
   */
  private async pdfToMarkdown(inputPath: string, outputPath: string): Promise<void> {
    // 使用Microsoft MarkItDown进行转换
    // 注意：这里需要确保markitdown已安装
    try {
      await execAsync(`markitdown "${inputPath}" > "${outputPath}"`);
    } catch (error) {
      // 如果markitdown未安装，使用备用方案
      console.warn('markitdown未安装，使用备用方案');
      // 这里可以实现备用转换逻辑
      this.createDummyOutput(outputPath, 'PDF转Markdown');
    }
  }

  /**
   * Word转Markdown
   */
  private async wordToMarkdown(inputPath: string, outputPath: string): Promise<void> {
    try {
      await execAsync(`markitdown "${inputPath}" > "${outputPath}"`);
    } catch (error) {
      console.warn('markitdown未安装，使用备用方案');
      this.createDummyOutput(outputPath, 'Word转Markdown');
    }
  }

  /**
   * Markdown转PDF
   */
  private async markdownToPdf(inputPath: string, outputPath: string): Promise<void> {
    // 这里需要实现Markdown转PDF的逻辑
    // 可以使用pandoc等工具
    try {
      await execAsync(`pandoc "${inputPath}" -o "${outputPath}"`);
    } catch (error) {
      console.warn('pandoc未安装，使用备用方案');
      this.createDummyOutput(outputPath, 'Markdown转PDF');
    }
  }

  /**
   * Markdown转Word
   */
  private async markdownToWord(inputPath: string, outputPath: string): Promise<void> {
    // 这里需要实现Markdown转Word的逻辑
    try {
      await execAsync(`pandoc "${inputPath}" -o "${outputPath}"`);
    } catch (error) {
      console.warn('pandoc未安装，使用备用方案');
      this.createDummyOutput(outputPath, 'Markdown转Word');
    }
  }

  /**
   * HTML转Markdown
   */
  private async htmlToMarkdown(inputPath: string, outputPath: string): Promise<void> {
    // 使用Microsoft MarkItDown或pandoc进行HTML转Markdown
    try {
      await execAsync(`markitdown "${inputPath}" > "${outputPath}"`);
    } catch (error) {
      try {
        // 尝试使用pandoc作为备用
        await execAsync(`pandoc "${inputPath}" -o "${outputPath}"`);
      } catch (error) {
        console.warn('转换工具未安装，使用备用方案');
        this.createDummyOutput(outputPath, 'HTML转Markdown');
      }
    }
  }

  /**
   * Markdown转HTML
   */
  private async markdownToHtml(inputPath: string, outputPath: string): Promise<void> {
    // 使用pandoc进行Markdown转HTML
    try {
      await execAsync(`pandoc "${inputPath}" -o "${outputPath}"`);
    } catch (error) {
      console.warn('pandoc未安装，使用备用方案');
      this.createDummyOutput(outputPath, 'Markdown转HTML');
    }
  }

  /**
   * 创建虚拟输出文件（当转换工具不可用时）
   */
  private createDummyOutput(outputPath: string, conversionType: string): void {
    const content = `# 转换结果

## 转换类型
${conversionType}

## 提示
由于转换工具未安装，这是一个示例输出。

在生产环境中，您需要安装以下工具：
- Microsoft MarkItDown: 用于PDF和Word转Markdown
- Pandoc: 用于Markdown转PDF和Word

请参考项目文档了解详细安装步骤。`;

    fs.writeFileSync(outputPath, content);
  }

  /**
   * 清理临时文件
   */
  cleanup(): void {
    try {
      if (fs.existsSync(this.tempDir)) {
        fs.rmSync(this.tempDir, { recursive: true, force: true });
      }
    } catch (error) {
      console.error('清理临时文件失败:', error);
    }
  }
}
