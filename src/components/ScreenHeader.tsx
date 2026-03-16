type ScreenHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

export default function ScreenHeader({ eyebrow, title, subtitle }: ScreenHeaderProps) {
  return (
    <header className="screen-head">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="subtitle">{subtitle}</p>
      </div>
    </header>
  );
}
