"use client"

import { useState } from "react"
import { Combobox } from "@/components/ui/combobox"

const frameworks = [
  { value: "next.js", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt.js", label: "Nuxt.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
]

export function ComboboxExample() {
  const [framework, setFramework] = useState("")

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-lg font-medium">Select Framework</h2>
      <Combobox 
        options={frameworks}
        value={framework}
        onValueChange={setFramework}
        placeholder="Select framework..."
        searchPlaceholder="Search framework..."
        emptyMessage="No framework found."
        className="w-[250px]"
      />
      
      {framework && (
        <p className="text-sm">
          Selected framework: <span className="font-medium">{frameworks.find(f => f.value === framework)?.label}</span>
        </p>
      )}
    </div>
  )
} 