import daBoiAvatar from "../client/static/da-boi.webp";
import type { GridFeature } from "./components/FeaturesGrid";

export const features: GridFeature[] = [
  {
    name: "双向转换",
    description: "支持PDF、Word与Markdown的相互转换，满足各种文档处理需求",
    emoji: "🔄",
    href: "/file-upload",
    size: "large",
  },
  {
    name: "免费使用",
    description: "基础转换功能完全免费，每日10次转换限额，满足个人用户需求",
    emoji: "🆓",
    href: "/file-upload",
    size: "large",
  },
  {
    name: "操作简单",
    description: "拖拽上传文件，一键转换，自动下载结果，无需复杂操作",
    emoji: "🎯",
    href: "/file-upload",
    size: "medium",
  },
  {
    name: "转换精准",
    description: "基于Microsoft MarkItDown技术，保证转换质量和格式准确性",
    emoji: "✅",
    href: "/file-upload",
    size: "medium",
  },
  {
    name: "安全可靠",
    description: "文件72小时自动删除，不存储用户隐私数据，安全有保障",
    emoji: "�",
    href: "#",
    size: "small",
  },
  {
    name: "多格式支持",
    description: "支持PDF、Word、Markdown等多种格式，满足不同场景需求",
    emoji: "�",
    href: "/file-upload",
    size: "small",
  },
  {
    name: "Pro版功能",
    description: "无限转换、批量处理、大文件支持、无广告等高级功能",
    emoji: "⭐",
    href: "/pricing",
    size: "small",
  },
  {
    name: "全球访问",
    description: "海外服务器部署，全球用户均可快速访问和使用",
    emoji: "🌍",
    href: "#",
    size: "small",
  },
];

export const testimonials = [
  {
    name: "开发者小明",
    role: "前端工程师",
    avatarSrc: daBoiAvatar,
    socialUrl: "#",
    quote: "iLoveMarkdown让我从PDF文档中提取内容变得非常简单，转换后的Markdown格式干净整洁，节省了我大量时间。",
  },
  {
    name: "内容创作者小红",
    role: "技术博主",
    avatarSrc: daBoiAvatar,
    socialUrl: "#",
    quote: "作为一名博主，我经常需要在Word和Markdown之间转换文档，iLoveMarkdown的双向转换功能简直太棒了！",
  },
  {
    name: "学生小李",
    role: "计算机专业学生",
    avatarSrc: daBoiAvatar,
    socialUrl: "#",
    quote: "免费版的转换次数完全满足我的需求，转换质量也很高，是我学习和作业的好帮手。",
  },
];

export const faqs = [
  {
    id: 1,
    question: "iLoveMarkdown支持哪些文件格式？",
    answer: "iLoveMarkdown支持PDF、Word与Markdown的双向转换，包括PDF→MD、Word→MD、MD→PDF、MD→Word。",
    href: "#",
  },
  {
    id: 2,
    question: "免费版有什么限制？",
    answer: "免费版支持单文件转换（≤10MB），每日转换限额为10次，提供基础转换功能。",
    href: "#",
  },
  {
    id: 3,
    question: "文件安全吗？",
    answer: "我们非常重视用户隐私，上传的文件会在72小时内自动删除，不会存储用户的隐私数据。",
    href: "#",
  },
  {
    id: 4,
    question: "Pro版有哪些优势？",
    answer: "Pro版提供无限转换、批量处理、大文件支持（≤50MB）、无广告、优先转换、格式优化等高级功能。",
    href: "/pricing",
  },
];

export const footerNavigation = {
  app: [
    { name: "首页", href: "/" },
    { name: "文件转换", href: "/file-upload" },
    { name: "价格", href: "/pricing" },
  ],
  company: [
    { name: "关于我们", href: "#" },
    { name: "隐私政策", href: "#" },
    { name: "服务条款", href: "#" },
  ],
};

export const examples = [
  {
    name: "PDF转Markdown",
    description: "将PDF文档转换为干净的Markdown格式，便于编辑和管理",
    imageSrc: daBoiAvatar,
    href: "/file-upload",
  },
  {
    name: "Word转Markdown",
    description: "将Word文档转换为标准Markdown格式，适合技术文档和博客写作",
    imageSrc: daBoiAvatar,
    href: "/file-upload",
  },
  {
    name: "Markdown转PDF",
    description: "将Markdown文件转换为专业PDF文档，适合正式文档和报告",
    imageSrc: daBoiAvatar,
    href: "/file-upload",
  },
];

