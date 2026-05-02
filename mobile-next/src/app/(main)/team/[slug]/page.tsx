import { TeamView } from './TeamView';

export function generateStaticParams() {
  return [
    { slug: 'bears' },
    { slug: 'bulls' },
    { slug: 'blackhawks' },
    { slug: 'cubs' },
    { slug: 'whitesox' },
  ];
}

export const dynamicParams = false;

export default function Page() {
  return <TeamView />;
}
