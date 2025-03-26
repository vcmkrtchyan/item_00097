"use client"

import { useEffect, useRef, useState } from "react"
import type { Trip } from "@/context/travel-context"
import mermaid from "mermaid"

interface TravelFlowDiagramProps {
  trip: Trip
}

export function TravelFlowDiagram({ trip }: TravelFlowDiagramProps) {
  const [svg, setSvg] = useState<string>("")
  const mermaidRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "default",
      securityLevel: "loose",
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: "basis",
      },
    })

    const generateDiagram = async () => {
      if (trip.destinations.length === 0) return

      // Create a mermaid diagram definition
      let diagram = "graph LR;\n"

      // Add nodes for each destination
      trip.destinations.forEach((dest, index) => {
        diagram += `  dest${index}["${dest.name}"];\n`
      })

      // Add connections between destinations
      for (let i = 0; i < trip.destinations.length - 1; i++) {
        diagram += `  dest${i} --> dest${i + 1};\n`
      }

      try {
        const { svg } = await mermaid.render("travel-diagram", diagram)
        setSvg(svg)
      } catch (error) {
        console.error("Error rendering mermaid diagram:", error)
      }
    }

    generateDiagram()
  }, [trip])

  if (trip.destinations.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No destinations to display</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto py-4">
      <div ref={mermaidRef} dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  )
}

