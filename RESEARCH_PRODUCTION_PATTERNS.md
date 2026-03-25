# 🏆 PRODUCTION-LEVEL REACT PATTERNS - COMPREHENSIVE RESEARCH FINDINGS

## 📋 EXECUTIVE SUMMARY

This document compiles research from 2024 industry best practices for production-level React development, covering hooks, components, pages, state management, error handling, and testing patterns.

**Research Sources:**
- FullStack Labs Production Patterns
- React Official Documentation (React 19)
- React Router v6 Best Practices
- TanStack Query Patterns
- Kent C. Dodds Testing Patterns
- Patterns.dev Compound Components
- Industry-Standard Error Boundaries
- Zustand vs Redux Toolkit Comparisons

---

## 🎣 PRODUCTION-LEVEL HOOKS PATTERNS

### 1. **Separation of Concerns (Model-View-Controller)**

**Pattern:** Separate data/logic from view components using custom hooks

**Structure:**
```typescript
// hooks/useTodos.ts - Model (Data & Logic)
export const useTodos = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    const data = await api.getTodos();
    setTodos(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  return { todos, loading, fetchTodos };
};

// components/TodosScreen.tsx - View (Presentation)
const TodosScreen = ({ todos, loading, onRefresh }: TodosScreenProps) => {
  return loading ? <Loading /> : <List data={todos} />;
};

// pages/TodosPage.tsx - Controller (Orchestration)
const TodosPage = () => {
  const { todos, loading, fetchTodos } = useTodos();
  return <TodosScreen todos={todos} loading={loading} onRefresh={fetchTodos} />;
};
```

**Benefits:**
- ✅ Better testability (mock hooks easily)
- ✅ Clear separation of concerns
- ✅ Reusable logic across components
- ✅ Easier maintenance

### 2. **Custom Hook Naming & Organization**

**Naming Conventions:**
```typescript
// ✅ Good
useAuth
useFormValidation
useLocalStorage
useMediaQuery
useDebounce
useIntersectionObserver

// ❌ Bad
useData
useStuff
useHelper
```

**File Organization:**
```
src/
├── hooks/
│   ├── reusable/           # Generic, app-agnostic hooks
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── useMediaQuery.ts
│   ├── domain/            # Domain-specific hooks
│   │   ├── useAuth.ts
│   │   ├── useUser.ts
│   │   └── useNotifications.ts
│   └── feature/           # Feature-specific hooks
│       ├── useVoiceNavigation.ts
│       └── useChat.ts
```

### 3. **Dependency Management Best Practices**

**Pattern:** Proper dependency arrays to prevent infinite loops

```typescript
// ✅ Correct - Stable dependencies
const fetchUser = useCallback(async () => {
  const user = await api.getUser(userId);
  setUser(user);
}, [userId]); // Only depends on userId

useEffect(() => {
  fetchUser();
}, [fetchUser]); // fetchUser is stable due to useCallback

// ❌ Wrong - Missing dependencies
useEffect(() => {
  fetchData(); // Missing fetchData in deps
}, []);

// ❌ Wrong - Unstable dependencies
useEffect(() => {
  fetchData();
}, [data]); // data changes after fetch, causing loop
```

### 4. **useMemo & useCallback Optimization**

**When to Use:**
```typescript
// ✅ Use useMemo for expensive computations
const expensiveValue = useMemo(() => {
  return data.filter(item => item.complexCalculation > threshold)
    .sort((a, b) => a.score - b.score);
}, [data, threshold]);

// ✅ Use useCallback for event handlers passed to children
const handleSubmit = useCallback((values: FormValues) => {
  api.submitForm(values);
}, []);

// ❌ Don't use for simple values
const simpleValue = useMemo(() => a + b, [a, b]); // Overkill
```

**Key Rule from React Docs:**
> "You should only rely on useCallback as a performance optimization. If your code doesn't work without it, find the underlying problem and fix it first."

### 5. **Async Hook Pattern with useEffect**

```typescript
const useAsyncData = (url: string) => {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        const response = await fetch(url);
        const data = await response.json();

        if (!cancelled) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ data: null, loading: false, error });
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true; // Prevent state updates on unmounted component
    };
  }, [url]);

  return state;
};
```

---

## 🧩 PRODUCTION-LEVEL COMPONENTS PATTERNS

### 1. **Compound Component Pattern**

**Pattern:** Components that work together with shared state via Context

```typescript
// Context for shared state
const SelectContext = createContext<{
  value: string;
  onChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

// Root component
const Select = ({ children, value, onChange }: SelectProps) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectContext.Provider value={{ value, onChange, open, setOpen }}>
      <div className="select">{children}</div>
    </SelectContext.Provider>
  );
};

// Child components
const Trigger = ({ children }: { children: React.ReactNode }) => {
  const { open, setOpen } = useContext(SelectContext)!;
  return <button onClick={() => setOpen(!open)}>{children}</button>;
};

const Options = ({ children }: { children: React.ReactNode }) => {
  const { open } = useContext(SelectContext)!;
  return open ? <div className="options">{children}</div> : null;
};

const Option = ({ value, children }: OptionProps) => {
  const { value: selectedValue, onChange, setOpen } = useContext(SelectContext)!;
  const isSelected = selectedValue === value;

  return (
    <div
      className={isSelected ? 'selected' : ''}
      onClick={() => {
        onChange(value);
        setOpen(false);
      }}
    >
      {children}
    </div>
  );
};

// Compose
Select.Trigger = Trigger;
Select.Options = Options;
Select.Option = Option;

// Usage
<Select value={value} onChange={setValue}>
  <Select.Trigger>Select an option</Select.Trigger>
  <Select.Options>
    <Select.Option value="1">Option 1</Select.Option>
    <Select.Option value="2">Option 2</Select.Option>
  </Select.Options>
</Select>
```

**Benefits:**
- ✅ Flexible composition
- ✅ Implicit state sharing
- ✅ Reduced prop drilling
- ✅ Better encapsulation

### 2. **Render Props Pattern (Less Common in 2024)**

Replaced by custom hooks pattern in most cases.

### 3. **Polymorphic Components Pattern**

```typescript
// Component that can render as different elements
type ButtonProps<T extends ElementType = 'button'> = {
  as?: T;
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
} & ComponentPropsWithoutRef<T>;

const Button = <T extends ElementType = 'button'>({
  as,
  variant = 'primary',
  children,
  ...props
}: ButtonProps<T>) => {
  const Component = as || 'button';
  return (
    <Component className={`btn btn-${variant}`} {...props}>
      {children}
    </Component>
  );
};

// Usage
<Button>Default Button</Button>
<Button as="a" href="/link">Link Button</Button>
<Button as={Link} to="/route">Router Link</Button>
```

### 4. **Controlled vs Uncontrolled Pattern**

```typescript
// Uncontrolled (internal state)
const InputUncontrolled = ({ defaultValue = '', ...props }: InputProps) => {
  const [value, setValue] = useState(defaultValue);
  return <input value={value} onChange={e => setValue(e.target.value)} {...props} />;
};

// Controlled (external state)
const InputControlled = ({ value, onChange, ...props }: InputProps) => {
  return <input value={value} onChange={onChange} {...props} />;
};

// Flexible (supports both)
const InputFlexible = ({
  value: controlledValue,
  defaultValue = '',
  onChange,
  ...props
}: FlexibleInputProps) => {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);

  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalValue(e.target.value);
    }
    onChange?.(e);
  };

  return <input value={value} onChange={handleChange} {...props} />;
};
```

### 5. **Composition with `asChild` Pattern (Radix UI / shadcn)**

```typescript
import { Slot } from '@radix-ui/react-slot';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'primary' | 'secondary';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild, variant = 'default', children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp ref={ref} className={`btn-${variant}`} {...props}>
        {children}
      </Comp>
    );
  }
);

// Usage
<Button>Regular Button</Button>
<Button asChild>
  <a href="/link">Link Styled as Button</a>
</Button>
```

---

## 📄 PRODUCTION-LEVEL PAGES PATTERNS

### 1. **Route-Based Code Splitting**

```typescript
// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Router setup
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },
    ]
  }
]);

// Layout with Suspense
const Layout = () => (
  <Suspense fallback={<PageLoader />}>
    <Outlet />
  </Suspense>
);
```

### 2. **Route Guards & Authentication**

```typescript
// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Router configuration
const router = createBrowserRouter([
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ]
  }
]);
```

### 3. **Data Loading with React Router v6**

```typescript
// Page with data loader
import { LoaderFunction, useLoaderData } from 'react-router-dom';

// Loader function
export const userLoader: LoaderFunction = async ({ params }) => {
  const user = await api.getUser(params.userId!);
  if (!user) throw new Response('User not found', { status: 404 });
  return { user };
};

// Page component
const UserPage = () => {
  const { user } = useLoaderData() as { user: User };
  return <UserProfile user={user} />;
};

// Route config
{
  path: 'user/:userId',
  element: <UserPage />,
  loader: userLoader,
  errorElement: <UserErrorBoundary />
}
```

### 4. **Nested Layouts**

```typescript
// Root layout
const RootLayout = () => (
  <div className="app">
    <Header />
    <main>
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Dashboard layout (nested)
const DashboardLayout = () => (
  <div className="dashboard">
    <Sidebar />
    <div className="content">
      <Outlet />
    </div>
  </div>
);

// Route configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'dashboard',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardHome /> },
          { path: 'analytics', element: <AnalyticsPage /> },
          { path: 'reports', element: <ReportsPage /> },
        ]
      }
    ]
  }
]);
```

---

## 🔄 STATE MANAGEMENT PATTERNS

### 1. **TanStack Query (React Query) Pattern**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query hook
const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => api.getUser(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Mutation hook with optimistic updates
const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.updateUser,
    onMutate: async (newUser) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user', newUser.id] });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData(['user', newUser.id]);

      // Optimistically update
      queryClient.setQueryData(['user', newUser.id], newUser);

      return { previousUser };
    },
    onError: (err, newUser, context) => {
      // Rollback on error
      queryClient.setQueryData(['user', newUser.id], context?.previousUser);
    },
    onSettled: (newUser) => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['user', newUser?.id] });
    },
  });
};
```

**Key Concepts:**
- ✅ `queryKey` for cache identity
- ✅ `staleTime` for data freshness
- ✅ `cacheTime` for garbage collection
- ✅ Optimistic updates for better UX
- ✅ Automatic background refetching

### 2. **Zustand Pattern (Lightweight State)**

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        setUser: (user) => set({ user }),
        clearUser: () => set({ user: null }),
      }),
      { name: 'user-storage' }
    ),
    { name: 'UserStore' }
  )
);

// Usage in component
const UserProfile = () => {
  const { user, setUser } = useUserStore();
  // Component logic
};
```

### 3. **Redux Toolkit Pattern (Complex State)**

```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk
const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.getUser(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearUser: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
```

### 4. **Context + Reducer Pattern (Mid-Size Apps)**

```typescript
// State management without external libraries
const AuthContext = createContext<{
  state: AuthState;
  dispatch: Dispatch<AuthAction>;
} | null>(null);

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload
      };
    case 'LOGIN_FAILURE':
      return { ...state, isLoading: false, isAuthenticated: false };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false };
    default:
      return state;
  }
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## 🛡️ ERROR HANDLING PATTERNS

### 1. **Error Boundary Pattern (Class Component Required)**

```typescript
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);

    // Log to error reporting service
    // errorReportingService.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary
  fallback={<ErrorPage />}
  onError={(error) => analytics.track('error', error)}
>
  <MyComponent />
</ErrorBoundary>
```

**What Error Boundaries Catch:**
- ✅ Rendering errors
- ✅ Lifecycle method errors
- ✅ Constructor errors

**What They DON'T Catch:**
- ❌ Event handlers (use try/catch)
- ❌ Async code (use .catch())
- ❌ Server-side rendering errors
- ❌ Errors in the error boundary itself

### 2. **Async Error Handling Hook**

```typescript
const useAsyncError = () => {
  const [error, setError] = useState<Error | null>(null);
  const [isError, setIsError] = useState(false);

  const handleError = useCallback((err: unknown) => {
    const error = err instanceof Error ? err : new Error(String(err));
    setError(error);
    setIsError(true);
    console.error('Async error:', error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setIsError(false);
  }, []);

  return { error, isError, handleError, clearError };
};

// Usage
const UserProfile = () => {
  const { error, isError, handleError, clearError } = useAsyncError();
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = async (id: string) => {
    clearError();
    try {
      const data = await api.getUser(id);
      setUser(data);
    } catch (err) {
      handleError(err);
    }
  };

  if (isError) return <ErrorDisplay error={error} onRetry={() => fetchUser(userId)} />;
  // ...
};
```

### 3. **react-error-boundary Library Pattern**

```typescript
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

// Usage
<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onReset={() => {
    // Reset the state of your app
  }}
  onError={(error, info) => {
    logErrorToService(error, info.componentStack);
  }}
>
  <ComponentThatMayError />
</ErrorBoundary>
```

---

## 🧪 TESTING PATTERNS

### 1. **Testing Custom Hooks**

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('should decrement counter', () => {
    const { result } = renderHook(() => useCounter({ initial: 10 }));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(9);
  });
});
```

### 2. **Testing Components with Context**

```typescript
import { render, screen } from '@testing-library/react';
import { AuthProvider } from './AuthContext';
import { UserProfile } from './UserProfile';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('UserProfile', () => {
  it('renders user name', () => {
    renderWithProviders(<UserProfile />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

### 3. **Mocking API Calls**

```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/user', (req, res, ctx) => {
    return res(ctx.json({ id: 1, name: 'John' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserProfile', () => {
  it('displays user data', async () => {
    render(<UserProfile userId="1" />);

    expect(await screen.findByText('John')).toBeInTheDocument();
  });

  it('handles error', async () => {
    server.use(
      rest.get('/api/user', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(<UserProfile userId="1" />);

    expect(await screen.findByText('Error loading user')).toBeInTheDocument();
  });
});
```

---

## 📊 COMPARISON TABLE: STATE MANAGEMENT

| Feature | Context + Reducer | Zustand | Redux Toolkit | TanStack Query |
|---------|------------------|---------|---------------|----------------|
| **Bundle Size** | Small | Tiny (~1KB) | Medium | Medium |
| **Boilerplate** | Medium | Minimal | Low | Low |
| **DevTools** | Manual | Built-in | Excellent | Excellent |
| **Server State** | Manual | Manual | Manual | Built-in |
| **Learning Curve** | Low | Low | Medium | Medium |
| **Best For** | Small-Medium Apps | Medium Apps | Large Apps | Data Fetching |

---

## 🎯 KEY TAKEAWAYS

### Hooks:
1. **Separate concerns** - Model/View/Controller pattern
2. **Manage dependencies** carefully to prevent loops
3. **Use useMemo/useCallback** only for optimization
4. **Custom hooks** for reusable logic
5. **Proper cleanup** in useEffect

### Components:
1. **Compound components** for related UI elements
2. **Composition over inheritance**
3. **Controlled/Uncontrolled** flexibility
4. **asChild pattern** for polymorphic components
5. **Clear prop interfaces** with TypeScript

### Pages/Routing:
1. **Code splitting** with React.lazy
2. **Route guards** for protected routes
3. **Data loaders** (React Router v6)
4. **Nested layouts** for complex UIs
5. **Error boundaries** at route level

### State Management:
1. **TanStack Query** for server state
2. **Zustand** for client state (lightweight)
3. **Redux Toolkit** for complex apps
4. **Context + Reducer** for simple cases

### Error Handling:
1. **Error boundaries** for rendering errors
2. **try/catch** for async errors
3. **react-error-boundary** library for convenience
4. **Error logging** to monitoring services

### Testing:
1. **renderHook** for testing hooks
2. **MSW** for API mocking
3. **Integration tests** over unit tests
4. **User-centric testing** approach

---

## 📚 RECOMMENDED LIBRARIES (2024)

| Category | Library | Version |
|----------|---------|---------|
| Routing | React Router | v6+ |
| Data Fetching | TanStack Query | v5+ |
| Forms | React Hook Form + Zod | v7+ |
| State | Zustand / Redux Toolkit | Latest |
| UI Components | Radix UI + Tailwind | Latest |
| Testing | Vitest + Testing Library | Latest |
| Error Handling | react-error-boundary | v4+ |
| Animations | Framer Motion | Latest |

---

*Document compiled from industry best practices and official documentation as of March 2025*
