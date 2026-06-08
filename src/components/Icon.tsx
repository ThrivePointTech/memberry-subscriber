import {
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle,
  Repeat,
  Gem,
  TrendingUp,
  Sparkles,
  Plus,
  Minus,
  Bell,
  Search,
  Users,
  Percent,
  Wallet,
  Mail,
  Phone,
  Store,
  Send,
  Link,
  X,
  BarChart2,
  Zap,
  Layers,
  Home,
  ScanLine,
  Settings,
} from "lucide-react";
import type { LucideProps } from "lucide-react";

type IconName =
  | "arrow-right"
  | "arrow-left"
  | "check"
  | "check-circle"
  | "repeat"
  | "gem"
  | "trending-up"
  | "sparkles"
  | "plus"
  | "minus"
  | "bell"
  | "search"
  | "users"
  | "percent"
  | "wallet"
  | "mail"
  | "phone"
  | "store"
  | "send"
  | "linkedin"
  | "bar-chart"
  | "zap"
  | "layers"
  | "home"
  | "scan"
  | "settings"
  | "twitter";

const icons: Record<IconName, React.FC<LucideProps>> = {
  "arrow-right": ArrowRight,
  "arrow-left": ArrowLeft,
  "check": Check,
  "check-circle": CheckCircle,
  "repeat": Repeat,
  "gem": Gem,
  "trending-up": TrendingUp,
  "sparkles": Sparkles,
  "plus": Plus,
  "minus": Minus,
  "bell": Bell,
  "search": Search,
  "users": Users,
  "percent": Percent,
  "wallet": Wallet,
  "mail": Mail,
  "phone": Phone,
  "store": Store,
  "send": Send,
  "linkedin": Link,
  "twitter": X,
  "bar-chart": BarChart2,
  "zap": Zap,
  "layers": Layers,
  "home": Home,
  "scan": ScanLine,
  "settings": Settings,
};

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export default function Icon({ name, size = 20, className, strokeWidth = 1.75, style }: IconProps) {
  const LucideIcon = icons[name];
  return <LucideIcon size={size} strokeWidth={strokeWidth} className={className} style={style} aria-hidden="true" />;
}
