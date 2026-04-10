import "react-native";

declare module "react-native" {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
  }
  interface TextInputProps {
    className?: string;
  }
  interface TouchableOpacityProps {
    className?: string;
  }
  interface ImageProps {
    className?: string;
  }
}

// Override lucide-react-native to use React Native types instead of web types
declare module "lucide-react-native" {
  import { SvgProps } from "react-native-svg";
  import React from "react";
  
  export interface LucideProps extends SvgProps {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
    className?: string;
  }
  
  export type LucideIcon = React.FC<LucideProps>;
  
  export const Home: LucideIcon;
  export const Image: LucideIcon;
  export const Map: LucideIcon;
  export const User: LucideIcon;
  export const Mail: LucideIcon;
  export const Lock: LucideIcon;
  export const LogIn: LucideIcon;
  export const ShieldAlert: LucideIcon;
  export const LogOut: LucideIcon;
  export const Settings: LucideIcon;
  export const Shield: LucideIcon;
  export const Bell: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const Folder: LucideIcon;
  export const FolderOpen: LucideIcon;
  export const HardDrive: LucideIcon;
  export const Filter: LucideIcon;
  export const Plus: LucideIcon;
  export const MapPin: LucideIcon;
  export const Layers: LucideIcon;
  export const Navigation: LucideIcon;
  export const ClipboardList: LucideIcon;
  export const Clipboard: LucideIcon;
  export const Search: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const Camera: LucideIcon;
  export const Trash2: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const Clock: LucideIcon;
  export const Calendar: LucideIcon;
}

declare module "@tanstack/query-async-storage-persister" {
  export function createAsyncStoragePersister(options: any): any;
}

declare module "@tanstack/react-query-persist-client" {
  import { QueryClient } from "@tanstack/react-query";
  import React from "react";
  export const PersistQueryClientProvider: React.FC<{
    client: QueryClient;
    persistOptions: any;
    onSuccess?: () => void;
    children?: React.ReactNode;
  }>;
}

declare module "@react-native-community/netinfo" {
  export interface NetInfoState {
    isConnected: boolean | null;
    [key: string]: any;
  }
  export function addEventListener(listener: (state: NetInfoState) => void): () => void;
  export function fetch(): Promise<NetInfoState>;
  const _default: {
    addEventListener: typeof addEventListener;
    fetch: typeof fetch;
  };
  export default _default;
}

declare module "@shopify/flash-list" {
  import React from "react";
  export interface FlashListProps<T> {
    data: T[] | null | undefined;
    renderItem: (info: { item: T; index: number }) => React.ReactElement | null;
    estimatedItemSize: number;
    [key: string]: any;
  }
  export const FlashList: React.ForwardRefExoticComponent<FlashListProps<any> & React.RefAttributes<any>>;
}
