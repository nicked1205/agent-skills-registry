interface Props {
  className?: string;
}

export function SearchIcon({ className }: Props) {
  return (
    <svg className={className ? className : ""} viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="M20 20L17 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
