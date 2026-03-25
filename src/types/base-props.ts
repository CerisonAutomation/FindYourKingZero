import {ReactNode} from 'react';
import {cn} from '@/lib/utils';

// Base component props interface
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  testId?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
}

// Base button props interface
export interface BaseButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: boolean;
}

// Base form props interface
export interface BaseFormProps extends BaseComponentProps {
  onSubmit?: (data: any) => void | Promise<void>;
  validation?: any;
  disabled?: boolean;
  loading?: boolean;
  noValidate?: boolean;
}

// Base input props interface
export interface BaseInputProps extends BaseComponentProps {
  type?: string;
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  error?: string;
  helperText?: string;
  label?: string;
  id?: string;
  name?: string;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
}

// Base card props interface
export interface BaseCardProps extends BaseComponentProps {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: boolean;
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

// Base modal props interface
export interface BaseModalProps extends BaseComponentProps {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  maskClosable?: boolean;
  centered?: boolean;
  footer?: ReactNode;
}

// Base table props interface
export interface BaseTableProps extends BaseComponentProps {
  data?: any[];
  columns?: any[];
  loading?: boolean;
  empty?: ReactNode;
  pagination?: {
    current?: number;
    pageSize?: number;
    total?: number;
    onChange?: (page: number, pageSize: number) => void;
  };
  rowSelection?: {
    selectedRowKeys?: string[];
    onChange?: (selectedRowKeys: string[], selectedRows: any[]) => void;
  };
}

// Base list props interface
export interface BaseListProps extends BaseComponentProps {
  data?: any[];
  renderItem?: (item: any, index: number) => ReactNode;
  loading?: boolean;
  empty?: ReactNode;
  grid?: boolean;
  columns?: number;
  spacing?: 'sm' | 'md' | 'lg';
}

// Base navigation props interface
export interface BaseNavigationProps extends BaseComponentProps {
  items?: Array<{
    key: string;
    label: ReactNode;
    icon?: ReactNode;
    href?: string;
    onClick?: () => void;
    active?: boolean;
    disabled?: boolean;
  }>;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline';
}

// Base dropdown props interface
export interface BaseDropdownProps extends BaseComponentProps {
  dropdownTrigger?: ReactNode;
  items?: Array<{
    key: string;
    label: ReactNode;
    icon?: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    danger?: boolean;
    divider?: boolean;
  }>;
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
  triggerAction?: 'click' | 'hover';
}

// Base tooltip props interface
export interface BaseTooltipProps extends BaseComponentProps {
  title?: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  trigger?: 'hover' | 'click' | 'focus';
  delay?: number;
  color?: string;
}

// Base skeleton props interface
export interface BaseSkeletonProps extends BaseComponentProps {
  loading?: boolean;
  children?: ReactNode;
  avatar?: boolean;
  paragraph?: boolean | { rows?: number };
  active?: boolean;
  round?: boolean;
}

// Base badge props interface
export interface BaseBadgeProps extends BaseComponentProps {
  count?: number;
  showZero?: boolean;
  dot?: boolean;
  color?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  maxCount?: number;
}

// Base progress props interface
export interface BaseProgressProps extends BaseComponentProps {
  percent?: number;
  status?: 'default' | 'success' | 'exception' | 'active';
  format?: (percent?: number) => ReactNode;
  strokeColor?: string | string[];
  strokeWidth?: number;
  trailColor?: string;
  showInfo?: boolean;
}

// Base alert props interface
export interface BaseAlertProps extends BaseComponentProps {
  type?: 'success' | 'info' | 'warning' | 'error';
  message?: ReactNode;
  description?: ReactNode;
  closable?: boolean;
  onClose?: () => void;
  showIcon?: boolean;
  action?: ReactNode;
}

// Base breadcrumb props interface
export interface BaseBreadcrumbProps extends BaseComponentProps {
  items?: Array<{
    key: string;
    title: ReactNode;
    href?: string;
    onClick?: () => void;
  }>;
  separator?: ReactNode;
}

// Base pagination props interface
export interface BasePaginationProps extends BaseComponentProps {
  current?: number;
  total?: number;
  pageSize?: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
}

// Helper function to merge props with base props
export function mergeBaseProps<T extends BaseComponentProps>(
  baseProps: BaseComponentProps,
  customProps: T
): T {
  return {
    ...baseProps,
    ...customProps,
    className: cn(baseProps.className, customProps.className),
  };
}

// Helper function to create base component props
export function createBaseProps(props: Partial<BaseComponentProps>): BaseComponentProps {
  return {
    className: props.className || '',
    children: props.children,
    testId: props.testId || undefined,
    'aria-label': props['aria-label'] || undefined,
    'aria-describedby': props['aria-describedby'] || undefined,
    'aria-labelledby': props['aria-labelledby'] || undefined,
  };
}
