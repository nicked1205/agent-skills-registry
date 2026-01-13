import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface Props {
  isPublic: boolean;
  className?: string;
}

export function VisibilityIcon({ isPublic, className }: Props) {
  return isPublic ? (
    <EyeIcon className={className ? className : ""} />
  ) : (
    <EyeSlashIcon className={className ? className : ""} />
  );
}
