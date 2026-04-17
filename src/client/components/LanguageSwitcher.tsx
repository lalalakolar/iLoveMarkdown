import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  return (
    <div className="flex items-center space-x-2">
      <Select value={currentLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="zh">中文</SelectItem>
          <SelectItem value="en">English</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSwitcher;