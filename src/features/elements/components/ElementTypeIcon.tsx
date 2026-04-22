import {
  Bird,
  Buildings,
  Calendar,
  Car,
  Lightbulb,
  MapPin,
  Package,
  User,
} from '@phosphor-icons/react';
import type { ElementType } from '@/types';

interface ElementTypeIconProps {
  type: ElementType;
  size?: number;
}

const iconByType = {
  character: User,
  location: MapPin,
  vehicle: Car,
  item: Package,
  organization: Buildings,
  creature: Bird,
  event: Calendar,
  concept: Lightbulb,
} as const;

export function ElementTypeIcon({ type, size = 24 }: ElementTypeIconProps) {
  const Icon = type === 'custom' ? Package : iconByType[type];
  return <Icon size={size} />;
}
