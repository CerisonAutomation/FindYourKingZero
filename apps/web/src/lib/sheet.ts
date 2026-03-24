// Gamechanger #18 — Vaul: native-feel bottom drawer for mobile (replaces all modal hacks)
// Usage: <Drawer.Root> wrapping profile card, filter panel, paygate upgrade prompt
export { Drawer } from 'vaul';
// Pattern:
// <Drawer.Root shouldScaleBackground>
//   <Drawer.Trigger asChild><button>Open</button></Drawer.Trigger>
//   <Drawer.Portal>
//     <Drawer.Overlay />
//     <Drawer.Content>...</Drawer.Content>
//   </Drawer.Portal>
// </Drawer.Root>
