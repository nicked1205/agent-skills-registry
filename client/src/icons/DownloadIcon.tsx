import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

interface Props {
  className?: string;
}

export function DownloadIcon({ className }: Props) {
  return <ArrowDownTrayIcon className={className ? className : ""} />;
}
