"use client"

import * as React from "react"
import { createMap } from "piri"

import { cn } from "@/lib/utils"

export interface Marker {
  lat: number
  lng: number
  size?: number
  pulse?: boolean
  [key: string]: unknown
}

type MapMarker<M extends Marker> = Omit<M, "lat" | "lng"> & {
  x: number
  y: number
}

type PiriOptions = Parameters<typeof createMap>[0]

export type CountryCode = NonNullable<PiriOptions["countries"]>[number]
export type MapRegion = NonNullable<PiriOptions["region"]>
export type OutlineRing = readonly (readonly [number, number])[]

export interface DottedMapProps<M extends Marker = Marker>
  extends React.SVGProps<SVGSVGElement> {
  width?: number
  height?: number
  mapSamples?: number
  grid?: PiriOptions["grid"]
  radius?: number
  countries?: CountryCode[]
  region?: MapRegion
  outline?: readonly OutlineRing[]
  markers?: M[]
  dotColor?: string
  markerColor?: string
  dotRadius?: number
  pulse?: boolean

  renderMarkerOverlay?: (args: {
    marker: MapMarker<M>
    index: number
    x: number
    y: number
    r: number
  }) => React.ReactNode
}

const mercator = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))

const projectRing = (
  ring: OutlineRing,
  width: number,
  height: number,
  region: MapRegion,
): Array<[number, number]> => {
  const lngSpan = region.lng.max - region.lng.min
  const mercMax = mercator(region.lat.max)
  const mercSpan = mercator(region.lat.min) - mercMax
  return ring.map(([lng, lat]) => [
    ((lng - region.lng.min) / lngSpan) * width,
    ((mercator(lat) - mercMax) / mercSpan) * height,
  ])
}

const isInsideRing = (x: number, y: number, ring: Array<[number, number]>): boolean => {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

export function DottedMap<M extends Marker = Marker>({
  width = 150,
  height = 75,
  mapSamples = 5000,
  grid = "diagonal",
  radius = 0.3,
  countries,
  region,
  outline,
  markers = [],
  dotColor = "currentColor",
  markerColor = "#FF6900",
  dotRadius = 0.2,
  pulse = false,
  renderMarkerOverlay,
  className,
  style,
  ...svgProps
}: DottedMapProps<M>) {
  const { points, addMarkers } = React.useMemo(
    () => createMap({ width, height, mapSamples, grid, radius, countries, region }),
    [width, height, mapSamples, grid, radius, countries, region],
  )

  const outlinePolygons = React.useMemo(() => {
    if (!outline) return null
    if (!region) {
      throw new Error("DottedMap: region is required when outline is provided")
    }
    return outline.map((ring) => projectRing(ring, width, height, region))
  }, [outline, region, width, height])

  const visiblePoints = React.useMemo(() => {
    if (!outlinePolygons) return points

    const aspect = width / height
    let rows = Math.round(Math.sqrt(mapSamples / aspect))
    if (grid === "diagonal") rows = Math.round(rows * (2 / Math.sqrt(3)))
    const cols = Math.round(rows * aspect)
    const margin = radius * 1.25
    const cellW = cols > 1 ? (width - 2 * margin) / (cols - 1) : 0
    const cellH = rows > 1 ? (height - 2 * margin) / (rows - 1) : 0
    const cells: Array<{ x: number; y: number }> = []

    for (let row = 0; row < rows; row++) {
      const y = margin + row * cellH
      for (let col = 0; col < cols; col++) {
        const offset = grid === "diagonal" && row % 2 === 0 ? cellW / 2 : 0
        const x = margin + col * cellW + offset
        if (x > width - margin) continue
        if (outlinePolygons.some((ring) => isInsideRing(x, y, ring))) cells.push({ x, y })
      }
    }

    return cells
  }, [points, outlinePolygons, width, height, mapSamples, grid, radius])

  const dotsPath = React.useMemo(() => {
    const snap = (value: number) => Math.round(value * 100) / 100
    const diameter = snap(dotRadius * 2)
    const dot = snap(dotRadius)
    return visiblePoints
      .map(
        (point) =>
          `M${snap(point.x - dotRadius)} ${snap(point.y)}a${dot} ${dot} 0 1 0 ${diameter} 0a${dot} ${dot} 0 1 0 ${-diameter} 0`,
      )
      .join("")
  }, [visiblePoints, dotRadius])

  const processedMarkers = React.useMemo(() => addMarkers(markers), [addMarkers, markers])

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("text-gray-500 dark:text-gray-500", className)}
      style={{ width: "100%", height: "100%", ...style }}
      {...svgProps}
    >
      <path d={dotsPath} fill={dotColor} />

      {processedMarkers.map((marker, index) => {
        const r = typeof marker.size === "number" ? marker.size : dotRadius
        const shouldPulse = pulse ? marker.pulse !== false : marker.pulse === true
        const pulseTo = r * 2.8

        return (
          <g key={`${marker.x}-${marker.y}-${index}`}>
            <circle cx={marker.x} cy={marker.y} r={r} fill={markerColor} />

            {shouldPulse ? (
              <g pointerEvents="none">
                <circle
                  cx={marker.x}
                  cy={marker.y}
                  r={r}
                  fill="none"
                  stroke={markerColor}
                  strokeOpacity={1}
                  strokeWidth={0.35}
                >
                  <animate
                    attributeName="r"
                    values={`${r};${pulseTo}`}
                    dur="1.4s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="1;0"
                    dur="1.4s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle
                  cx={marker.x}
                  cy={marker.y}
                  r={r}
                  fill="none"
                  stroke={markerColor}
                  strokeOpacity={0.9}
                  strokeWidth={0.3}
                >
                  <animate
                    attributeName="r"
                    values={`${r};${pulseTo}`}
                    dur="1.4s"
                    begin="0.7s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.9;0"
                    dur="1.4s"
                    begin="0.7s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            ) : null}

            {renderMarkerOverlay?.({
              marker: { ...marker, x: marker.x, y: marker.y },
              index,
              x: marker.x,
              y: marker.y,
              r,
            })}
          </g>
        )
      })}
    </svg>
  )
}
