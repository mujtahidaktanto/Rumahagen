// components/ui/icons.tsx — ikon SVG garis (stroke) yang dipakai komponen dasar; gaya sama dengan wireframe (stroke 1.8, ujung bulat).
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 20, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const MenuIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </Icon>
);
export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);
export const ChevronLeftIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Icon>
);
export const ChevronRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 5l7 7-7 7" />
  </Icon>
);
export const AlertIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3l10 18H2L12 3Z" />
    <path d="M12 10v5" />
    <circle cx="12" cy="18" r=".6" fill="currentColor" stroke="none" />
  </Icon>
);
export const InboxIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 13l3-8h12l3 8" />
    <path d="M3 13v6a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-6h-5a3 3 0 0 1-6 0H3Z" />
  </Icon>
);
const mk = (children: React.ReactNode) => {
  const C = (p: IconProps) => <Icon {...p}>{children}</Icon>;
  return C;
};

// Ikon menu navigasi (jalur SVG mengikuti wireframe v2 bila sudah ada di sana).
export const ChartIcon = mk(<path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />);
export const LockIcon = mk(<><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>);
export const CheckCircleIcon = mk(<><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.7 2.7L16 9.8" /></>);
export const BellIcon = mk(<><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 20a2 2 0 0 0 4 0" /></>);
export const GearIcon = mk(<><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></>);
export const ClipboardIcon = mk(<><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4h6v3H9zM9 14l2 2 4-4" /></>);
export const BuildingIcon = mk(<path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />);
export const BankIcon = mk(<><path d="M3 10l9-6 9 6" /><path d="M5 10v9m14-9v9M9 10v9m6-9v9M3 20h18" /></>);
export const DocIcon = mk(<><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>);
export const BookIcon = mk(<><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z" /><path d="M8 7h7M8 11h5" /></>);
export const ClockIcon = mk(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></>);
export const OfficeIcon = mk(<><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M8 7h2m4 0h2M8 11h2m4 0h2M8 15h2m4 0h2M10 21v-3h4v3" /></>);
export const TagIcon = mk(<><path d="M3 12V4h8l10 10-8 8L3 12Z" /><circle cx="7.5" cy="8.5" r="1.2" /></>);
export const LayersIcon = mk(<><path d="M12 3l9 5-9 5-9-5 9-5Z" /><path d="M3 13l9 5 9-5" /></>);
export const TrophyIcon = mk(<><path d="M8 21h8M12 17v4" /><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" /></>);
export const SwapIcon = mk(<><path d="M4 8h12M12 4l4 4-4 4" /><path d="M20 16H8m4 4-4-4 4-4" /></>);
export const CalendarIcon = mk(<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></>);
export const CardIcon = mk(<><rect x="2.5" y="6" width="19" height="13" rx="2" /><path d="M2.5 10.5h19" /></>);
export const SparkleIcon = mk(<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />);
export const UsersIcon = mk(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><circle cx="17" cy="9" r="2.5" /><path d="M17 14c2.8 0 4.5 1.9 4.5 5" /></>);
export const FolderIcon = mk(<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z" />);
export const VideoIcon = mk(<><rect x="3" y="6" width="13" height="12" rx="2" /><path d="M16 10l5-3v10l-5-3" /></>);
export const LogoutIcon = mk(<path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9" />);
export const ChevronUpIcon = mk(<path d="M6 15l6-6 6 6" />);
export const EyeIcon = mk(<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="2.6" /></>);
export const EyeOffIcon = mk(<><path d="M3 3l18 18" /><path d="M10.6 6.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.9C3.7 8.8 2 12 2 12s3.5 7 10 7a9.6 9.6 0 0 0 4.4-1.1" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>);
export const MailIcon = mk(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>);
export const ShieldCheckIcon = mk(<><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" /><path d="M9 12l2 2 4-4" /></>);
export const KeyIcon = mk(<><circle cx="8" cy="15" r="4" /><path d="M10.8 12.2 20 3M16 7l3 3M13 10l2.5 2.5" /></>);

/** Ikon netral untuk menu yang belum punya ikon khusus (diganti per modul saat layarnya dibangun). */
export const DotIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
  </Icon>
);
export const HomeIcon =(p: IconProps) => (
  <Icon {...p}>
    <path d="M3 11l9-7 9 7" />
    <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
  </Icon>
);
export const UserIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
  </Icon>
);
