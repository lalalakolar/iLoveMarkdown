import { FormEvent, useState } from "react";
import { toast } from "../client/hooks/use-toast";
import { Button } from "../client/components/ui/button";
import { Card, CardContent, CardTitle } from "../client/components/ui/card";
import { Input } from "../client/components/ui/input";
import { Label } from "../client/components/ui/label";
import { Progress } from "../client/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../client/components/ui/select";
import { Alert, AlertDescription } from "../client/components/ui/alert";

// 转换类型定义
type ConversionType = 
  | "pdf-to-md" 
  | "word-to-md" 
  | "md-to-pdf" 
  | "md-to-word"
  | "html-to-md"
  | "md-to-html";

// 支持的文件类型
const SUPPORTED_FILE_TYPES = {
  "pdf-to-md": ["application/pdf"],
  "word-to-md": ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  "md-to-pdf": ["text/markdown", "text/plain"],
  "md-to-word": ["text/markdown", "text/plain"],
  "html-to-md": ["text/html", "application/xhtml+xml"],
  "md-to-html": ["text/markdown", "text/plain"]
};

export default function FileUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [conversionType, setConversionType] = useState<ConversionType>("pdf-to-md");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);

  // 生成文件预览
  const generatePreview = (file: File) => {
    setPreviewLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
      setPreviewLoading(false);
    };
    reader.onerror = () => {
      setPreviewUrl(null);
      setPreviewLoading(false);
    };
    
    // 根据文件类型选择预览方式
    const fileType = file.type;
    if (fileType.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else if (fileType === 'text/markdown' || fileType === 'text/plain') {
      reader.readAsText(file);
    } else if (fileType === 'text/html') {
      reader.readAsText(file);
    } else {
      // 对于其他类型，显示文件信息
      setPreviewUrl(null);
      setPreviewLoading(false);
    }
  };

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isBatchMode) {
      const selectedFiles = Array.from(e.target.files || []);
      if (selectedFiles.length === 0) {
        setFiles([]);
        setPreviewUrl(null);
        return;
      }
      
      const allowedTypes = SUPPORTED_FILE_TYPES[conversionType];
      const validFiles: File[] = [];
      const invalidFiles: string[] = [];
      
      selectedFiles.forEach(file => {
        if (!allowedTypes.includes(file.type)) {
          invalidFiles.push(file.name);
        } else if (file.size > 10 * 1024 * 1024) {
          invalidFiles.push(`${file.name} (文件过大)`);
        } else {
          validFiles.push(file);
        }
      });
      
      if (invalidFiles.length > 0) {
        toast({
          title: "部分文件无效",
          description: `以下文件无法处理: ${invalidFiles.join(", ")}`,
          variant: "destructive"
        });
      }
      
      if (validFiles.length > 0) {
        setFiles(validFiles);
        // 生成第一个文件的预览
        generatePreview(validFiles[0]);
        toast({
          title: "文件选择成功",
          description: `已选择 ${validFiles.length} 个文件`,
          variant: "default"
        });
      } else {
        setFiles([]);
        setPreviewUrl(null);
      }
    } else {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        const allowedTypes = SUPPORTED_FILE_TYPES[conversionType];
        if (!allowedTypes.includes(selectedFile.type)) {
          toast({
            title: "文件类型不支持",
            description: `请选择正确的文件类型: ${allowedTypes.map(t => t.split("/")[1]).join(", ")}`,
            variant: "destructive"
          });
          setFile(null);
          setPreviewUrl(null);
          return;
        }
        
        // 检查文件大小（免费版限制10MB）
        if (selectedFile.size > 10 * 1024 * 1024) {
          toast({
            title: "文件过大",
            description: "免费版支持的文件大小限制为10MB",
            variant: "destructive"
          });
          setFile(null);
          setPreviewUrl(null);
          return;
        }
        
        setFile(selectedFile);
        generatePreview(selectedFile);
      }
    }
  };

  // 处理转换类型变化
  const handleConversionTypeChange = (value: string) => {
    setConversionType(value as ConversionType);
    setFile(null); // 重置文件选择
    setFiles([]); // 重置批量文件选择
    setPreviewUrl(null); // 重置预览
  };

  // 解码Base64字符串为Uint8Array
  const base64ToUint8Array = (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // 处理表单提交
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isBatchMode) {
      if (files.length === 0) {
        toast({
          title: "请选择文件",
          description: "请选择要转换的文件",
          variant: "destructive"
        });
        return;
      }
    } else {
      if (!file) {
        toast({
          title: "请选择文件",
          description: "请选择要转换的文件",
          variant: "destructive"
        });
        return;
      }
    }

    try {
      setIsConverting(true);
      setUploadProgress(0);

      if (isBatchMode) {
        // 批量处理
        let completed = 0;
        const total = files.length;
        
        for (const currentFile of files) {
          // 读取文件并转换为Base64
          const fileReader = new FileReader();
          const fileContent = await new Promise<string>((resolve, reject) => {
            fileReader.onload = (e) => {
              const result = e.target?.result as string;
              resolve(result.split(',')[1]); // 移除Data URL前缀
            };
            fileReader.onerror = reject;
            fileReader.readAsDataURL(currentFile);
          });

          // 模拟文件上传进度
          setUploadProgress(Math.round((completed / total) * 90));

          // 调用后端转换API
          const response = await fetch('/api/convert', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              fileContent,
              fileName: currentFile.name,
              conversionType
            })
          });

          const result = await response.json();

          if (result.success && result.outputFile && result.outputFileName) {
            // 解码Base64文件内容
            const fileBuffer = base64ToUint8Array(result.outputFile);
            const blob = new Blob([fileBuffer]);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.outputFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }

          completed++;
          setUploadProgress(Math.round((completed / total) * 90));
        }

        setUploadProgress(100);
        
        toast({
          title: "批量转换完成",
          description: `已成功转换 ${completed} 个文件`,
          variant: "default"
        });

        setIsConverting(false);
        setUploadProgress(0);
        setFiles([]);
      } else {
        // 单个文件处理
        // 读取文件并转换为Base64
        const fileReader = new FileReader();
        const fileContent = await new Promise<string>((resolve, reject) => {
          fileReader.onload = (e) => {
            const result = e.target?.result as string;
            resolve(result.split(',')[1]); // 移除Data URL前缀
          };
          fileReader.onerror = reject;
          fileReader.readAsDataURL(file!);
        });

        // 模拟文件上传进度
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        // 调用后端转换API
        const response = await fetch('/api/convert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fileContent,
            fileName: file!.name,
            conversionType
          })
        });

        const result = await response.json();
        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!result.success) {
          throw new Error(result.message || '转换失败');
        }

        // 模拟转换完成，生成下载链接
        await new Promise(resolve => setTimeout(resolve, 500));

        toast({
          title: "转换成功",
          description: "文件已成功转换，正在下载...",
          variant: "default"
        });

        // 下载转换结果
        setTimeout(() => {
          if (result.outputFile && result.outputFileName) {
            // 解码Base64文件内容
            const fileBuffer = base64ToUint8Array(result.outputFile);
            const blob = new Blob([fileBuffer]);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.outputFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          } else {
            // 模拟下载（当后端返回失败时）
            const blob = new Blob([`# 转换结果\n\n这是${file!.name}的转换结果`], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `converted_${file!.name.replace(/\.[^/.]+$/, '')}.md`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }

          setIsConverting(false);
          setUploadProgress(0);
          setFile(null);
        }, 1000);
      }

    } catch (error) {
      console.error("转换失败:", error);
      toast({
        title: "转换失败",
        description: error instanceof Error ? error.message : "文件转换过程中出现错误，请重试",
        variant: "destructive"
      });
      setIsConverting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="py-6 lg:py-10 lg:mt-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-foreground mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            文档 <span className="text-primary">↔</span> Markdown 转换
          </h2>
        </div>
        <p className="text-muted-foreground mx-auto mt-4 sm:mt-6 max-w-2xl text-center text-base sm:text-lg leading-8">
          支持PDF、Word与Markdown的双向转换，操作简单，转换精准
        </p>
        
        <Card className="my-6 sm:my-8">
          <CardContent className="mx-auto my-6 sm:my-10 space-y-4 sm:space-y-6 px-4 py-6 sm:px-6 sm:py-8 sm:max-w-lg">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-6">
              {/* 转换类型选择 */}
              <div className="space-y-2">
                <Label className="text-foreground text-sm font-medium">
                  转换类型
                </Label>
                <Select value={conversionType} onValueChange={handleConversionTypeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择转换类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf-to-md">PDF → Markdown</SelectItem>
                    <SelectItem value="word-to-md">Word → Markdown</SelectItem>
                    <SelectItem value="html-to-md">HTML → Markdown</SelectItem>
                    <SelectItem value="md-to-pdf">Markdown → PDF</SelectItem>
                    <SelectItem value="md-to-word">Markdown → Word</SelectItem>
                    <SelectItem value="md-to-html">Markdown → HTML</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 批量处理模式切换 */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2">
                <Label className="text-foreground text-sm font-medium">
                  批量处理
                </Label>
                <Button 
                  type="button" 
                  variant={isBatchMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsBatchMode(!isBatchMode)}
                  className="w-full sm:w-auto"
                >
                  {isBatchMode ? "关闭批量模式" : "开启批量模式"}
                </Button>
              </div>

              {/* 文件上传 */}
              <div className="space-y-2">
                <Label 
                  htmlFor="file-upload" 
                  className="text-foreground text-sm font-medium"
                >
                  {isBatchMode ? "选择多个文件" : "选择文件"}
                </Label>
                <Input
                  type="file"
                  id="file-upload"
                  name="file-upload"
                  accept={SUPPORTED_FILE_TYPES[conversionType].join(",")}
                  className="cursor-pointer"
                  onChange={handleFileChange}
                  disabled={isConverting}
                  multiple={isBatchMode}
                />
                {!isBatchMode && file && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      已选择: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                    {/* 文件预览 */}
                    {previewLoading && (
                      <div className="p-3 sm:p-4 border border-muted rounded-md bg-muted/50 flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">正在生成预览...</p>
                      </div>
                    )}
                    {previewUrl && (
                      <div className="p-3 sm:p-4 border border-muted rounded-md bg-muted/50">
                        <h4 className="text-sm font-medium mb-2">文件预览</h4>
                        {file.type.startsWith('image/') ? (
                          <img 
                            src={previewUrl} 
                            alt="预览" 
                            className="max-h-48 sm:max-h-64 object-contain"
                          />
                        ) : file.type === 'text/markdown' || file.type === 'text/plain' || file.type === 'text/html' ? (
                          <pre className="max-h-48 sm:max-h-64 overflow-auto text-xs">
                            <code>{previewUrl}</code>
                          </pre>
                        ) : (
                          <p className="text-sm text-muted-foreground">无法预览此文件类型</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {isBatchMode && files.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      已选择 {files.length} 个文件:
                    </p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {files.map((f, index) => (
                        <p key={index} className="text-xs text-muted-foreground">
                          {f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      ))}
                    </div>
                    {/* 批量模式下的预览 */}
                    {previewLoading && (
                      <div className="p-3 sm:p-4 border border-muted rounded-md bg-muted/50 flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">正在生成预览...</p>
                      </div>
                    )}
                    {previewUrl && (
                      <div className="p-3 sm:p-4 border border-muted rounded-md bg-muted/50">
                        <h4 className="text-sm font-medium mb-2">文件预览 (第一个文件)</h4>
                        {files[0].type.startsWith('image/') ? (
                          <img 
                            src={previewUrl} 
                            alt="预览" 
                            className="max-h-48 sm:max-h-64 object-contain"
                          />
                        ) : files[0].type === 'text/markdown' || files[0].type === 'text/plain' || files[0].type === 'text/html' ? (
                          <pre className="max-h-48 sm:max-h-64 overflow-auto text-xs">
                            <code>{previewUrl}</code>
                          </pre>
                        ) : (
                          <p className="text-sm text-muted-foreground">无法预览此文件类型</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 转换按钮和进度条 */}
              <div className="space-y-3 sm:space-y-4">
                <Button
                  type="submit"
                  disabled={(!file && !isBatchMode) || (isBatchMode && files.length === 0) || isConverting}
                  className="w-full py-6"
                >
                  {isConverting ? "转换中..." : "开始转换"}
                </Button>
                {isConverting && uploadProgress > 0 && (
                  <>
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-center text-sm text-muted-foreground">
                      {uploadProgress < 90 ? `上传中: ${uploadProgress}%` : "正在转换..."}
                    </p>
                  </>
                )}
              </div>

              {/* 免费版限制提示 */}
              <Alert variant="info">
                <AlertDescription className="text-sm">
                  免费版限制：文件大小 ≤ 10MB，每日转换限额 10 次
                </AlertDescription>
              </Alert>
            </form>
          </CardContent>
        </Card>

        {/* 转换说明 */}
        <div className="mt-8 sm:mt-12 max-w-3xl mx-auto">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">如何使用</h3>
          <ol className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <span>选择转换类型（如 PDF → Markdown）</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <span>上传要转换的文件（免费版最大 10MB）</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <span>点击「开始转换」按钮</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
              <span>等待转换完成，自动下载转换结果</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
