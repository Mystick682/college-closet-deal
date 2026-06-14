import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface University {
  id: string;
  name: string;
  short_name: string | null;
  country: string;
  city: string | null;
  email_domains: string[];
}

export function useUniversities() {
  return useQuery({
    queryKey: ["universities"],
    queryFn: async (): Promise<University[]> => {
      const { data, error } = await supabase
        .from("universities")
        .select("id, name, short_name, country, city, email_domains")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function UniversityPicker({
  value,
  onChange,
  placeholder = "Select a university",
  className,
}: {
  value: string | null | undefined;
  onChange: (id: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const { data: unis = [] } = useUniversities();
  const selected = unis.find((u) => u.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn("w-full justify-between font-normal", className)}
        >
          <span className="truncate flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            {selected ? (
              <>
                <span className="font-medium">{selected.short_name || selected.name}</span>
                <span className="text-muted-foreground text-xs">· {selected.country}</span>
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)] max-w-[400px]" align="start">
        <Command>
          <CommandInput placeholder="Search universities..." />
          <CommandList>
            <CommandEmpty>No university found.</CommandEmpty>
            <CommandGroup>
              {unis.map((u) => (
                <CommandItem
                  key={u.id}
                  value={`${u.name} ${u.short_name ?? ""} ${u.country}`}
                  onSelect={() => { onChange(u.id); setOpen(false); }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === u.id ? "opacity-100" : "opacity-0")} />
                  <div className="flex flex-col">
                    <span className="font-medium">{u.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {u.city ? `${u.city}, ` : ""}{u.country}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}