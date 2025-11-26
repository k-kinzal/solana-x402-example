'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useNetwork } from '@/hooks/useNetwork';
import { NetworkType } from '@/lib/solana/constants';
import { cn } from '@/lib/utils';
import { Settings2 } from 'lucide-react';

const networkOptions: { value: NetworkType; label: string; color: string }[] = [
  { value: 'devnet', label: 'Devnet', color: 'bg-green-500' },
  { value: 'testnet', label: 'Testnet', color: 'bg-yellow-500' },
  { value: 'mainnet-beta', label: 'Mainnet', color: 'bg-red-500' },
];

export function NetworkSelector() {
  const { network, setNetwork } = useNetwork();
  const currentNetwork = networkOptions.find((n) => n.value === network);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative w-9 h-9">
          <Settings2 className="w-4 h-4" />
          <div
            className={cn(
              'absolute top-1 right-1 w-2 h-2 rounded-full',
              currentNetwork?.color
            )}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {networkOptions.map((net) => (
          <DropdownMenuItem
            key={net.value}
            onClick={() => setNetwork(net.value)}
            className={cn(network === net.value && 'bg-accent')}
          >
            <div className="flex items-center gap-2">
              <div className={cn('w-2 h-2 rounded-full', net.color)} />
              {net.label}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
