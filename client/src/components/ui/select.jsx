import * as React from "react"
import { cn } from "../../lib/utils"

const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
  </select>
))
Select.displayName = "Select"

const SelectContent = ({ children }) => children

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <option
    ref={ref}
    className={cn("py-1.5 px-2 text-sm", className)}
    {...props}
  >
    {children}
  </option>
))
SelectItem.displayName = "SelectItem"

const SelectTrigger = Select
const SelectValue = ({ placeholder, children }) => children || placeholder

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }