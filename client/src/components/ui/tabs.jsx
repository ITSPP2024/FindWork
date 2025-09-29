import * as React from "react"
import { cn } from "../../lib/utils"

const Tabs = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-2", className)}
    {...props}
  />
))
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px] bg-gray-100 text-gray-600",
      className
    )}
    {...props}
  />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className, active, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
      active 
        ? "bg-white text-gray-900 shadow-sm" 
        : "text-gray-600 hover:text-gray-900",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 outline-none", className)}
    {...props}
  />
))
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }