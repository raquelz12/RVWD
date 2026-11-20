import './TextArea.css';

export interface TextAreaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  className?: string; 
}

export default function TextArea({ value, onChange, placeholder, rows = 4, className }: TextAreaProps) {
  return (
    <textarea 
      className={`textarea ${className || ''}`} 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder} 
      rows={rows} 
    />
  );
}