// Gamechanger #16 — TanStack Virtual: render 10k profiles at DOM cost of 10
// Usage in Discover grid:
//
// import { useVirtualizer } from '@tanstack/react-virtual';
// const rowVirtualizer = useVirtualizer({
//   count: profiles.length,
//   getScrollElement: () => parentRef.current,
//   estimateSize: () => 280,
//   overscan: 5,
// });
export { useVirtualizer, useWindowVirtualizer } from '@tanstack/react-virtual';
