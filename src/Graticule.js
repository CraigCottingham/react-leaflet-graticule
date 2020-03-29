import { Layer } from "leaflet"
import { MapLayer } from "react-leaflet"

export default class Graticule extends MapLayer {
  constructor(props: Props) {
    super(props)

    this.updateVariables = this.updateVariables.bind(this)

    this.defaultOptions = {
      showLabel: true,
      opacity: 1,
      weight: 0.8,
      color: "#aaa",
      font: "12px Verdana",
      fontColor: "#aaa",
      dashArray: [3, 3],
      // lngLineCurved: 0,
      // latLineCurved: 0,
      zoomInterval: [
        {start: 0, end: 2, interval: 30},
        {start: 3, end: 3, interval: 20},
        {start: 4, end: 4, interval: 10},
        {start: 5, end: 5, interval:  5},
        {start: 6, end: 7, interval:  1}
      ]
    }

    this.updateVariables(props)

    this.map = null // context.map || props.leaflet.map
    this.canvas = null
    this.currZoom = null
    this.currLatInterval = null
    this.currLngInterval = null
  }

  updateVariables(props: Props): Props {
    this.options = (props && props.options) || this.defaultOptions
  }

  createLeafletElement() {
    const _ = this;
    const GraticuleRenderer = Layer.extend({

      onAdd: function (map) {
        _.map = map

        if (!_.canvas) {
          _.initCanvas()
        }

        _.map._panes.overlayPane.appendChild(_.canvas)

        _.map.on("viewreset", _.reset, _)
        _.map.on("move", _.reset, _)
        _.map.on("moveend", _.reset, _)

        // if (_.map.options.zoomAnimation && L.Browser.any3d) {
        //   _.map.on("zoomanim", _.animateZoom, _)
        // }

        _.reset()
      },

      onRemove: function (map) {
        if (_.map === map) {
          if (_.canvas.parentNode) {
            _.canvas.parentNode.removeChild(_.canvas)
          }

          _.canvas = null

          _.map.off("viewreset", _.reset, _)
          _.map.off("move", _.reset, _)
          _.map.off("moveend", _.reset, _)

          // if (_.map.options.zoomAnimation) {
          //   _.map.off("zoomanim", _.animateZoom, _)
          // }

          _.map = null
        }
      },

      addTo: function (map) {
        map.addLayer(this)
        return this
      }
    })
    return new GraticuleRenderer(this.options)
  }

  updateLeafletElement(fromProps, toProps) {
    console.log("in ReactLeafletGraticule.updateLeafletElement")

    this.updateVariables(toProps)
    this.reset()
  }

  initCanvas() {
    const canvas = document.createElement("canvas")

    // if (this.map.options.zoomAnimation && L.Browser.any3d) {
    canvas.classList.add("leaflet-zoom-animated")
    // }
    // else {
    //   canvas.classList.add("leaflet-zoom-hide")
    // }

    // this.updateOpacity()

    canvas.onSelectStart = function() { return false }
    canvas.onMouseMove = function() { return false }
    canvas.onLoad = this.onCanvasLoad.bind(this)

    this.canvas = canvas
  }

  onCanvasLoad() {
    this.leafletElement.fire("load")
  }

  reset() {
    const size = this.map.getSize()
    const lt = this.map.containerPointToLayerPoint([0, 0])

    this.canvas._leaflet_pos = lt
    // if (Browser.any3d) {
      // setTransform(canvas, lt)
      this.canvas.style["transform"] = `translate3d(${lt.x}px,${lt.y}px,0)`
    // }
    // else {
      // this.canvas.style.left = lt.x + "px"
      // this.canvas.style.top = lt.y + "px"
    // }

    this.canvas.width = size.x
    this.canvas.height = size.y
    // this.canvas.style.width = size.x + "px"
    // this.canvas.style.height = size.y + "px"

    this.calcInterval()

    this.draw(true)
  }

  calcInterval() {
    const zoom = this.map.getZoom()
    if (zoom !== this.currZoom) {
      this.currLngInterval = null
      this.currLatInterval = null
      this.currZoom = zoom
    }

    if (!this.currLngInterval) {
      try {
        for (let idx in this.options.zoomInterval) {
          const dict = this.options.zoomInterval[idx]
          if ((dict.start <= zoom) && (dict.end >= zoom)) {
            this.currLngInterval = dict.interval
            break
          }
        }
      }
      catch (e) {
        this.currLngInterval = 0
      }
    }

    if (!this.currLatInterval) {
      try {
        for (let idx in this.options.zoomInterval) {
          const dict = this.options.zoomInterval[idx]
          if ((dict.start <= zoom) && (dict.end >= zoom)) {
            this.currLatInterval = dict.interval
            break
          }
        }
      }
      catch (e) {
        this.currLatInterval = 0
      }
    }
  }

  draw(label) {
    if (!this.canvas || !this.map) {
      return
    }

    const ctx = this.canvas.getContext("2d")

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    ctx.lineWidth = this.options.weight
    ctx.strokeStyle = this.options.color
    ctx.fillStyle = this.options.fontColor
    ctx.setLineDash(this.options.dashArray)
    if (this.options.font) {
      ctx.font = this.options.font
    }

    // const txtWidth = ctx.measureText("0").width
    // const txtHeight = 12
    // try {
    //   let fontSize = ctx.font.trim().split(" ")[0]
    //   txtHeight = parsePxToInt(fontSize)
    // }
    // catch (e) {
    // }

    let lt = this.map.containerPointToLatLng({x: 0, y: 0})
    let rb = this.map.containerPointToLatLng({x: this.canvas.width, y: this.canvas.height})

    let pointPerLat = (lt.lat - rb.lat) / (this.canvas.height * 0.2)
    let pointPerLon = (rb.lng - lt.lng) / (this.canvas.width * 0.2)
    if (isNaN(pointPerLat) || isNaN(pointPerLon)) {
      return
    }

    if (pointPerLat < 1) {
      pointPerLat = 1
    }
    if (pointPerLon < 1) {
      pointPerLon = 1
    }

    if (rb.lat < -90) {
      rb.lat = -90
    }
    else {
      rb.lat = parseInt(rb.lat - pointPerLat, 10)
    }

    if (lt.lat > 90) {
      lt.lat = 90
    }
    else {
      lt.lat = parseInt(lt.lat + pointPerLat, 10)
    }

    if ((lt.lng > 0) && (rb.lng < 0)) {
      rb.lng += 360
    }
    rb.lng = parseInt(rb.lng + pointPerLon, 10)
    lt.lng = parseInt(lt.lng - pointPerLon, 10)

    if (this.currLatInterval) {
      for (let i = this.currLatInterval; i <= lt.lat; i += this.currLatInterval) {
        if (i >= rb.lat) {
          this.drawLatitudeLine(ctx, i, lt.lng, rb.lng, label)
        }
      }

      for (let i = 0; i >= rb.lat; i -= this.currLatInterval) {
        if (i <= lt.lat) {
          this.drawLatitudeLine(ctx, i, lt.lng, rb.lng, label)
        }
      }
    }

    if (this.currLngInterval) {
      for (let i = this.currLngInterval; i <= rb.lng; i += this.currLngInterval) {
        if (i >= lt.lng) {
          this.drawLongitudeLine(ctx, i, lt.lat, rb.lat, label)
        }
      }

      for (let i = 0; i >= lt.lng; i -= this.currLngInterval) {
        if (i <= rb.lng) {
          this.drawLongitudeLine(ctx, i, lt.lat, rb.lat, label)
        }
      }
    }
  }

  drawLatitudeLine(ctx, tick, lngLeft, lngRight, label) {
    const leftEnd = this.latLngToCanvasPoint({lat: tick, lng: lngLeft})
    const str = this.formatLatitude(tick)
    const txtWidth = ctx.measureText(str).width
    const txtHeight = 12

    // if (curvedLat) {
    //   ...
    // }
    // else {
      const rightEnd = this.latLngToCanvasPoint({lat: tick, lng: lngRight})
      // if (curvedLon) {
      //   ...
      // }

      ctx.beginPath()
      ctx.moveTo(leftEnd.x + 1, leftEnd.y)
      ctx.lineTo(rightEnd.x - 1, rightEnd.y)
      ctx.stroke()

      if (this.options.showLabel && label) {
        const yBaseline = leftEnd.y + (txtHeight / 2) - 2
        ctx.fillText(str, 0, yBaseline)
        ctx.fillText(str, this.canvas.width - txtWidth, yBaseline)
      }
    // }
  }

  drawLongitudeLine(ctx, tick, latTop, latBottom, label) {
    const bottomEnd = this.latLngToCanvasPoint({lat: latBottom, lng: tick})
    const str = this.formatLongitude(tick)
    const txtWidth = ctx.measureText(str).width
    const txtHeight = 12

    // if (curvedLat) {
    //   ...
    // }
    // else {
      const topEnd = this.latLngToCanvasPoint({lat: latTop, lng: tick})
      // console.log(`topEnd = ${JSON.stringify(topEnd)}`)

      // if (curvedLon) {
      //   ...
      // }

      ctx.beginPath()
      ctx.moveTo(topEnd.x, topEnd.y + 1)
      ctx.lineTo(bottomEnd.x, bottomEnd.y - 1)
      ctx.stroke()

      if (this.options.showLabel && label) {
        ctx.fillText(str, topEnd.x - (txtWidth / 2), txtHeight + 1)
        ctx.fillText(str, bottomEnd.x - (txtWidth / 2), this.canvas.height - 3)
      }
    // }
  }

  latLngToCanvasPoint(latLng) {
    let projectedPoint = this.map.project(latLng)
    projectedPoint._subtract(this.map.getPixelOrigin())
    projectedPoint._add(this.map._getMapPanePos())
    return projectedPoint
  }

  formatLatitude(value) {
    // if (this.options.latFormatTickLabel) {
    //   return this.options.latFormatTickLabel(value)
    // }

    if (value < 0) {
      return `${value * -1}S`
    }
    else if (value > 0) {
      return `${value}N`
    }

    return `${value}`
  }

  formatLongitude(value) {
    // if (this.options.lngFormatTickLabel) {
    //   return this.options.lngFormatTickLabel(value)
    // }

    if (value < -180) {
      return `${value + 360}W`
    }
    else if (value === -180) {
      return "180"
    }
    else if ((value < 0) && (value > -180)) {
      return `${value * -1}W`
    }
    else if ((value > 0) && (value < 180)) {
      return `${value}E`
    }
    else if (value > 180) {
      return `${360 - value}W`
    }

    return `${value}`
  }
}
