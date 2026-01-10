interface Props {
  className?: string;
}

export function ArrowUpIcon({ className }: Props) {
  return (
    <svg
      className={className ? className : ""}
      viewBox="0 0 16 16"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      fill="#000000"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        {" "}
        <rect width="16" height="16" id="icon-bound" fill="none"></rect>{" "}
        <polygon points="8,5 13,10 3,10"></polygon>{" "}
      </g>
    </svg>
  );
}
