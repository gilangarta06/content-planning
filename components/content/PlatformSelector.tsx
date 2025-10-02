'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Platform } from '@/lib/types';

interface PlatformSelectorProps {
  selectedPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
}

export function PlatformSelector({ selectedPlatform, onPlatformChange }: PlatformSelectorProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="text-sm font-medium text-muted-foreground">Filter by platform:</span>
      <Select value={selectedPlatform} onValueChange={onPlatformChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Platforms</SelectItem>
          <SelectItem value="Instagram">Instagram</SelectItem>
          <SelectItem value="TikTok">TikTok</SelectItem>
          <SelectItem value="Facebook">Facebook</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}