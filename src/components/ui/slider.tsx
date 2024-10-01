import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"
import { Image } from "@mantine/core"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-primary">
      <SliderPrimitive.Range className="absolute h-full bg-secondary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-7 w-7 rounded-full border-2 border-secondary bg-primary ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" >
      <Image src="/pencil.png" alt="pencil" className="w-7 h-6 bg-white rounded-full p-0.5" />
    </SliderPrimitive.Thumb>
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
