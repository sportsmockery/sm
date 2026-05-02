import { RoomView } from './RoomView';

export function generateStaticParams() {
  return [
    { roomId: 'lounge' },
    { roomId: 'bears' },
    { roomId: 'bulls' },
    { roomId: 'blackhawks' },
    { roomId: 'cubs' },
    { roomId: 'whitesox' },
  ];
}

export const dynamicParams = false;

export default function Page() {
  return <RoomView />;
}
