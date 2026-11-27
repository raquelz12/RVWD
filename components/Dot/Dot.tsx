import './Dot.css';

export interface DotProps {
  type: 'filled' | 'empty';
}

// <span> y no <div>: así se puede meter dentro de botones y enlaces
export default function Dot({ type }: DotProps) {
  return (
    <span className={`dot ${type === 'filled' ? 'filled' : 'empty'}`}></span>
  );
}
