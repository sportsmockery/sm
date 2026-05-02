import { LiveView } from './LiveView';

export function generateStaticParams() {
  return [{ gameId: 'view' }];
}

export const dynamicParams = false;

export default function Page() {
  return <LiveView />;
}
