declare namespace React {
  type ReactNode = any;
  type ReactElement = any;
  interface ComponentProps<T> extends Record<string, any> {}
}

declare module 'react' {
  const React: {
    useState: <T>(value: T | (() => T)) => [T, (update: T | ((prev: T) => T)) => void];
    useRef: <T>(value: T | null) => { current: T | null };
    useCallback: <T extends (...args: any[]) => any>(fn: T, deps: any[]) => T;
    useLayoutEffect: (effect: () => void | (() => void), deps?: any[]) => void;
    forwardRef: <T, P = any>(render: (props: P, ref: any) => any) => (props: P & { ref?: any }) => any;
  };
  export = React;
  export type ReactNode = any;
  export type ReactElement = any;
  export type FC<P = {}> = (props: P) => ReactElement | null;
  export type ComponentProps<T> = any;
  export type HTMLAttributes<T> = Record<string, any>;
  export type DetailedHTMLProps<P, T> = P & { ref?: any };
}

declare module 'react-native' {
  export const Platform: {
    OS: 'ios' | 'android' | 'macos' | 'windows' | 'web' | string;
    select: <T>(spec: { ios?: T; android?: T; default?: T }) => T | undefined;
  };

  export interface ViewProps {
    style?: any;
    [key: string]: any;
  }

  export interface TextProps {
    children?: React.ReactNode;
    style?: any;
  }

  export interface TextInputProps {
    value?: string;
    onChangeText?: (text: string) => void;
    editable?: boolean;
    multiline?: boolean;
    placeholder?: string;
    placeholderTextColor?: string;
    onSubmitEditing?: (event: any) => void;
    blurOnSubmit?: boolean;
    style?: any;
    autoFocus?: boolean;
  }

  export interface FlatListProps<ItemT> {
    data?: readonly ItemT[] | null;
    renderItem?: (info: { item: ItemT; index: number }) => React.ReactElement | null;
    keyExtractor?: (item: ItemT, index: number) => string;
    contentContainerStyle?: any;
    [key: string]: any;
  }

  export class FlatList<ItemT> {
    constructor(props: FlatListProps<ItemT>);
  }

  export const StyleSheet: {
    create<T extends { [key: string]: any }>(styles: T): T;
    hairlineWidth: number;
  };

  export const View: (props: ViewProps & { children?: React.ReactNode }) => React.ReactElement;
  export const Text: (props: TextProps) => React.ReactElement;
  export const Image: (props: { source: { uri: string }; style?: any }) => React.ReactElement;
  export const TextInput: (props: TextInputProps) => React.ReactElement;
  export const TouchableOpacity: (props: any) => React.ReactElement;
  export const KeyboardAvoidingView: (props: any) => React.ReactElement;
}

declare module '@openai/chatkit' {
  export type ChatKitOptions = Record<string, any>;
}

declare const process: {
  env: Record<string, string | undefined>;
};
