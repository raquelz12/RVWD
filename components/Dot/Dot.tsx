import './Dot.css';

export interface DotProps {
  type: 'filled' | 'empty';
}

export default function Dot({ type }: DotProps) {
  return (
    <div className={`dot ${type === 'filled' ? 'filled' : 'empty'}`}></div>
  );
}