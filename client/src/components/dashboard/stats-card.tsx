import { cn } from "@/lib/utils";
import { LinkIcon } from "lucide-react";
import { ReactNode } from "react";
import { Link } from "wouter";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  href: string;
  linkText: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  iconBgColor = "bg-primary-50",
  iconColor = "text-primary-500",
  href,
  linkText,
  className,
}: StatsCardProps) {
  return (
    <div className={cn("bg-white overflow-hidden shadow rounded-lg", className)}>
      <div className="p-5">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", iconBgColor)}>
            <div className={iconColor}>{icon}</div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-neutral-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-neutral-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-neutral-50 px-5 py-3">
        <div className="text-sm">
          <Link href={href}>
            <a className="font-medium text-primary-500 hover:text-primary-600 flex items-center">
              {linkText}
              <LinkIcon className="ml-1 h-4 w-4" />
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
