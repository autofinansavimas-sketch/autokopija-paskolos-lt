import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Filter, X, TrendingUp } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

interface QuickFiltersProps {
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
  counts: {
    today: number;
    week: number;
    withReminders: number;
    noContact: number;
  };
}

export default function QuickFilters({ 
  activeFilter, 
  onFilterChange, 
  counts 
}: QuickFiltersProps) {
  const [open, setOpen] = useState(false);

  const filters = [
    { 
      id: "today", 
      label: "Šiandien", 
      icon: Clock, 
      count: counts.today,
      color: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
    },
    { 
      id: "week", 
      label: "Šią savaitę", 
      icon: Calendar, 
      count: counts.week,
      color: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
    },
    { 
      id: "withReminders", 
      label: "Su priminimais", 
      icon: TrendingUp, 
      count: counts.withReminders,
      color: "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
    },
    { 
      id: "noContact", 
      label: "Be kontakto 3+ d.", 
      icon: Filter, 
      count: counts.noContact,
      color: "bg-red-500/10 text-red-600 hover:bg-red-500/20"
    },
  ];

  const activeFilterData = filters.find(f => f.id === activeFilter);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Desktop filters */}
      <div className="hidden md:flex items-center gap-2">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;
          
          return (
            <Button
              key={filter.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={`h-8 gap-1.5 ${!isActive ? filter.color : ''}`}
              onClick={() => onFilterChange(isActive ? null : filter.id)}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{filter.label}</span>
              <Badge 
                variant="secondary" 
                className={`ml-1 h-5 px-1.5 text-xs ${isActive ? 'bg-primary-foreground/20' : ''}`}
              >
                {filter.count}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Mobile filter popover */}
      <div className="md:hidden">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <Filter className="h-3.5 w-3.5" />
              {activeFilterData ? (
                <>
                  <span>{activeFilterData.label}</span>
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {activeFilterData.count}
                  </Badge>
                </>
              ) : (
                <span>Filtruoti</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <div className="flex flex-col gap-1">
              {filters.map((filter) => {
                const Icon = filter.icon;
                const isActive = activeFilter === filter.id;
                
                return (
                  <Button
                    key={filter.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="justify-between h-9"
                    onClick={() => {
                      onFilterChange(isActive ? null : filter.id);
                      setOpen(false);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {filter.label}
                    </span>
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {filter.count}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Clear filter button */}
      {activeFilter && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground"
          onClick={() => onFilterChange(null)}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
