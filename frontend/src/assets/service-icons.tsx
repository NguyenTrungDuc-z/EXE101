import { 
  Sparkles, 
  AirVent, 
  Wrench, 
  Wallet, 
  BadgeCheck, 
  ShieldCheck,
  Facebook,
  Instagram,
  Youtube,
  Search,
  Apple,
  Play,
  ChevronLeft,
  ChevronRight,
  Home,
  LucideProps
} from "lucide-react";

export const ServiceIcons = {
  cleaning: (props: LucideProps) => <Sparkles {...props} strokeWidth={1.9} />,
  ac: (props: LucideProps) => <AirVent {...props} strokeWidth={1.9} />,
  plumbing: (props: LucideProps) => <Wrench {...props} strokeWidth={1.9} />,
  wallet: (props: LucideProps) => <Wallet {...props} strokeWidth={1.9} />,
  verified: (props: LucideProps) => <BadgeCheck {...props} strokeWidth={1.9} />,
  shield: (props: LucideProps) => <ShieldCheck {...props} strokeWidth={1.9} />,
  facebook: (props: LucideProps) => <Facebook {...props} strokeWidth={1.9} />,
  instagram: (props: LucideProps) => <Instagram {...props} strokeWidth={1.9} />,
  youtube: (props: LucideProps) => <Youtube {...props} strokeWidth={1.9} />,
  search: (props: LucideProps) => <Search {...props} strokeWidth={1.9} />,
  apple: (props: LucideProps) => <Apple {...props} strokeWidth={1.9} />,
  play: (props: LucideProps) => <Play {...props} strokeWidth={1.9} />,
  chevronLeft: (props: LucideProps) => <ChevronLeft {...props} strokeWidth={1.9} />,
  chevronRight: (props: LucideProps) => <ChevronRight {...props} strokeWidth={1.9} />,
  home: (props: LucideProps) => <Home {...props} strokeWidth={1.9} />
};
