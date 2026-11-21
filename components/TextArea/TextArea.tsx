import './TextArea.css';

export interface TextAreaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  id?: string;
}

export default function TextArea({ value, onChange, placeholder, rows = 4, className, id }: TextAreaProps) {
  return (
    <textarea
      id={id}
      className={`textarea ${className || ''}`} 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder} 
      rows={rows} 
    />
  );
}