import type { ComponentProps } from 'react';

/** Research documents use native navigation: hashes, browser history and new tabs
 * must work without the framework's client router or RSC prefetch runtime. */
export default function ResearchLink(props: ComponentProps<'a'>) {
  return <a {...props} />;
}
