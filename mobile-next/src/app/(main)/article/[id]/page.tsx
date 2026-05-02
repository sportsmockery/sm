import { ArticleView } from './ArticleView';

export function generateStaticParams() {
  return [{ id: 'view' }];
}

export const dynamicParams = false;

export default function Page() {
  return <ArticleView />;
}
