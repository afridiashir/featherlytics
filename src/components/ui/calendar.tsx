"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("flex gap-4 flex-col sm:flex-row relative", defaultClassNames.months),
        month: cn("flex flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "flex items-center justify-between absolute inset-x-0 top-0 z-10",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "text-muted-foreground",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "text-muted-foreground",
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          "flex items-center justify-center h-8 w-full text-sm font-medium",
          defaultClassNames.month_caption,
        ),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground w-8 text-[0.8rem] font-normal flex-1 text-center",
          defaultClassNames.weekday,
        ),
        week: cn("flex w-full mt-1", defaultClassNames.week),
        day: cn(
          "relative w-8 h-8 p-0 text-center text-sm focus-within:relative focus-within:z-20",
          defaultClassNames.day,
        ),
        range_start: cn(
          "rounded-l-md bg-accent",
          defaultClassNames.range_start,
        ),
        range_middle: cn("rounded-none bg-accent/50", defaultClassNames.range_middle),
        range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
        today: cn(
          "[&_button]:font-semibold [&_button]:text-[#2a78d6] dark:[&_button]:text-[#3987e5]",
          defaultClassNames.today,
        ),
        outside: cn("text-muted-foreground/50", defaultClassNames.outside),
        disabled: cn("text-muted-foreground/30 opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName, ...rest }) => {
          const Icon = orientation === "left" ? ChevronLeftIcon : ChevronRightIcon
          return <Icon className={cn("size-4", chevronClassName)} {...rest} />
        },
        DayButton: ({ className: dayButtonClassName, day: _day, modifiers, ...rest }) => (
          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "size-8 rounded-md p-0 font-normal aria-selected:opacity-100",
              modifiers.selected &&
                !modifiers.range_start &&
                !modifiers.range_end &&
                !modifiers.range_middle &&
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              (modifiers.range_start || modifiers.range_end) &&
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              dayButtonClassName,
            )}
            {...rest}
          />
        ),
      }}
      {...props}
    />
  )
}

export { Calendar }
