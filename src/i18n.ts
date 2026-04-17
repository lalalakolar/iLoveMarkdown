import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

// 配置i18next
i18n
  .use(Backend) // 加载语言文件
  .use(initReactI18next) // 集成到React
  .init({
    fallbackLng: 'zh', // 默认语言
    lng: 'zh', // 初始语言
    debug: false, // 生产环境关闭调试
    interpolation: {
      escapeValue: false, // React已经处理了XSS
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json', // 语言文件路径
    },
  });

export default i18n;