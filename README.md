# react-leaflet-graticule

React wrapper around [leaflet.latlng-graticule](https://github.com/cloudybay/leaflet.latlng-graticule)
for [react-leaflet](https://react-leaflet.js.org).

Displays a latitude/longitude grid on a map, with grid tick labels at the edges of the map.

Supports react-leaflet v2. Maybe v1? Haven't tested that yet.

Example project:

## Demos

Demo

Demo of Lambert projection

## Usage

### install package

    npm install react-leaflet-graticule

or

    yarn add react-leaflet-graticule

### import to project

```javascript
import { Graticule } from "react-leaflet-graticule"
```

### add it to the map

```javascript
<Graticule />
```

## Properties

* **showLabel** - show grid tick labels at the edges of the map; defaults to `true`
* **opacity** - opacity of the grid lines and labels, from 0 to 1; defaults to `1`
* **weight** - width of the grid lines; defaults to `0.8`
* **color** - color of the grid lines, in any format accepted by HTML; defaults to `#aaa`
* **font** - font definition for the labels, in any format accepted by HTML; defaults to `12px Verdana`
* **fontColor** - color of the labels, in any format accepted by HTML; defaults to `#aaa`
* **dashArray** - used to achieve dashed lines; defaults to `[0,0]`
* **zoomInterval** - use different intervals for ranges of zoom levels; see below for more information

### `zoomInterval`

#### same intervals for latitude and longitude

`zoomInterval` should be set to an array of objects, each with properties

* **start** - zoom level at which the interval starts
* **end** - zoom level at which the interval ends
* **interval** - how many units between grid lines

Intervals should not overlap. (What happens if they do?) (What about gaps in zoom levels?)

#### different intervals for latitude and longitude

`zoomInterval` should be set to an object with `latitude` and `longitude` properties.
Each one should be set to an array of objects with `start`, `end`, and `interval`
properties as above.

#### examples

```javascript
// same intervals for latitude and longitude
zoomInterval: [
  {start: 0, end: 2, interval: 40},
  {start: 3, end: 3, interval: 20},
  {start: 4, end: 4, interval: 10},
  {start: 5, end: 7, interval: 5},
  {start: 8, end: 20, interval: 1}
]
```

```javascript
// same intervals for latitude and longitude
zoomInterval:
  latitude: [
    {start: 4, end: 6, interval: 5},
    {start: 7, end: 20, interval: 1}
  ],
  longitude: [
    {start: 4, end: 6, interval: 10},
    {start: 7, end: 20, interval: 2}
  ]
}
```

### Properties for non-rectilinear projections

* **latLineCurved** - interval of polyline; defaults to `0`
* **lngLineCurved** - interval of polyline; defaults to `0`
