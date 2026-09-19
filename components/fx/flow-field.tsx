"use client"

import { useEffect, useRef } from "react"
import { onFrame } from "@/lib/telemetry"

/**
 * The atmosphere layer: contour isolines of a domain-warped fBm field, drawn as
 * a single fullscreen fragment shader.
 *
 * Contours rather than particles on purpose — a topographic readout belongs to
 * the avionics concept in a way a starfield never would, and it is one draw
 * call with no geometry, so it costs almost nothing.
 *
 * The field responds to the pointer (a local warp that drags the terrain) and
 * to scroll depth (the whole field translates and the contour interval opens
 * up, so the machine feels like it is descending through the data).
 *
 * Bails out entirely on small screens, on reduced-motion, and when WebGL is
 * unavailable — the page keeps a static gradient underneath in all three cases.
 */

const VERT = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`

/**
 * `deriv` reflects whether OES_standard_derivatives is available. With it we get
 * screen-space-correct line width (fwidth), which keeps contours an even
 * thickness even where the pointer warp stretches the field. Without it we fall
 * back to a fixed width rather than failing to compile — a slightly coarser
 * field beats no field.
 */
const FRAG = (deriv: boolean) => `${deriv ? "#extension GL_OES_standard_derivatives : enable" : ""}
precision highp float;

uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_mouse;
uniform float u_scroll;   // 0..1 document progress
uniform float u_speed;    // smoothed pointer speed
uniform vec3  u_tint;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

// 4 octaves, not 5. The fifth contributes detail finer than the contour
// interval can express, so it costs fragments and changes nothing visible.
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = rot * p * 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);

  // pointer warp — the terrain is dragged toward the cursor, more so when it moves fast
  vec2 m = (u_mouse - 0.5 * u_res) / min(u_res.x, u_res.y);
  float d = length(uv - m);
  float pull = exp(-d * 2.4) * (0.10 + u_speed * 0.010);
  vec2 p = uv * 2.4;
  p -= normalize(uv - m + 1e-5) * pull;

  // descend through the field as the page scrolls
  p.y += u_scroll * 3.0;
  p.x += u_time * 0.015;

  // Single domain warp (three fbm calls, not five). Two chained warps looked
  // marginally more organic and cost nearly twice the fragments.
  vec2 q = vec2(fbm(p + vec2(0.0, u_time * 0.04)), fbm(p + vec2(4.7, 2.1)));
  float f = fbm(p + 2.8 * q);

  // isolines. interval widens slightly with depth.
  float interval = mix(11.0, 7.0, u_scroll);
  float band = f * interval - u_time * 0.06;
  float c = abs(fract(band) - 0.5);
  float w = ${deriv ? "fwidth(band) * 0.85 + 0.004" : "0.020"};
  float line = 1.0 - smoothstep(w, w * 2.2, c);

  // every fifth contour is an index line — brighter, like a real chart
  float major = step(0.5, abs(fract(band * 0.2) - 0.5) * 2.0 - 0.6);
  line *= mix(0.42, 1.0, major);

  /**
   * Keep the middle clear and let the terrain live in the margins.
   *
   * Calibration note: uv is divided by min(res), so on a 16:10 viewport the
   * length only reaches ~0.94 in the corners and ~0.5 over most of the screen.
   * The ramp therefore has to start high — an earlier 0.18 start put bright
   * contours directly behind the headline and body copy.
   *
   * (No backticks in this file's GLSL: the shader is a JS template literal.)
   */
  float len = length(uv);
  float radial = smoothstep(0.52, 1.0, len);
  float depth = mix(1.0, 0.62, u_scroll);

  float i = line * radial * depth * 0.32;

  /**
   * A sweep travelling down the screen that illuminates the terrain as it
   * passes, the way a radar return brightens on the sweep line. This is what
   * makes the field read as a machine actively scanning rather than wallpaper.
   * Wrapped distance so it is continuous across the loop point.
   */
  float sy = gl_FragCoord.y / u_res.y;
  float sweepPos = 1.0 - fract(u_time * 0.055);
  float sdist = abs(sy - sweepPos);
  sdist = min(sdist, 1.0 - sdist);
  i += line * radial * exp(-sdist * 13.0) * 0.26;

  // a faint cursor bloom so the pointer feels like it carries a light
  i += exp(-d * 5.5) * 0.05;

  gl_FragColor = vec4(u_tint * i, i);
}
`

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)
  if (!sh) return null
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn("[avionics] shader:", gl.getShaderInfoLog(sh))
    gl.deleteShader(sh)
    return null
  }
  return sh
}

export default function FlowField() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const small = window.matchMedia("(max-width: 767px)").matches
    if (reduced || small) return

    const gl = (canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: "low-power",
    } as WebGLContextAttributes) || null) as WebGLRenderingContext | null

    if (!gl) return

    // fwidth() lives behind an extension on WebGL1
    const deriv = !!gl.getExtension("OES_standard_derivatives")

    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG(deriv))
    if (!vs || !fs) return

    const prog = gl.createProgram()
    if (!prog) return
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("[avionics] link:", gl.getProgramInfoLog(prog))
      return
    }
    gl.useProgram(prog)

    // fullscreen triangle
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, "a")
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const u = {
      res: gl.getUniformLocation(prog, "u_res"),
      time: gl.getUniformLocation(prog, "u_time"),
      mouse: gl.getUniformLocation(prog, "u_mouse"),
      scroll: gl.getUniformLocation(prog, "u_scroll"),
      speed: gl.getUniformLocation(prog, "u_speed"),
      tint: gl.getUniformLocation(prog, "u_tint"),
    }

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    /**
     * The field is deliberately rendered BELOW native resolution and scaled up
     * by CSS. It is diffuse contour work — at 0.7x nobody can tell, and it
     * halves the fragment count. `scale` is then lowered adaptively if the
     * measured frame rate says this GPU cannot keep up.
     */
    let scale = 0.7
    let dpr = 1
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5) * scale
      const w = Math.max(1, Math.floor(window.innerWidth * dpr))
      const h = Math.max(1, Math.floor(window.innerHeight * dpr))
      if (canvas.width === w && canvas.height === h) return
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
    }
    resize()
    window.addEventListener("resize", resize, { passive: true })

    let visible = !document.hidden
    const onVis = () => {
      visible = !document.hidden
    }
    document.addEventListener("visibilitychange", onVis)

    // amber by default; konami flips the console to ice
    const readTint = (): [number, number, number] =>
      document.body.dataset.mode === "wireframe" ? [0.31, 0.84, 1.0] : [1.0, 0.69, 0.0]
    let tint = readTint()
    const modeObserver = new MutationObserver(() => {
      tint = readTint()
    })
    modeObserver.observe(document.body, { attributes: true, attributeFilter: ["data-mode"] })

    /**
     * Adaptive quality. The page claims 60fps, so it has to actually mean it on
     * an integrated GPU. Two downgrade steps, then give up entirely and leave
     * the static gradient — a still background beats a janky one.
     */
    let stop: (() => void) | null = null
    let degraded = 0
    let checkAt = 2.5
    // Averaged over the whole window, not sampled at one instant — a single
    // reading lands on whatever the page happened to be doing that frame and
    // lets a sustained bad frame rate slip through.
    let acc = 0
    let accN = 0
    const supervise = (fps: number, t: number) => {
      acc += fps
      accN++
      if (t < checkAt || degraded > 1) return

      const avg = accN ? acc / accN : 60
      acc = 0
      accN = 0

      if (avg >= 40) {
        checkAt = t + 4 // keep watching in case a later section is heavier
        return
      }
      degraded++
      checkAt = t + 3
      if (degraded === 1) {
        scale = 0.45
        resize()
      } else {
        // still struggling — shut the field down for good
        canvas.style.display = "none"
        stop?.()
      }
    }

    stop = onFrame((f) => {
      if (!visible) return
      supervise(f.fps, f.t)
      gl.uniform2f(u.res, canvas.width, canvas.height)
      gl.uniform1f(u.time, f.t)
      gl.uniform2f(u.mouse, f.sx * dpr, (window.innerHeight - f.sy) * dpr)
      gl.uniform1f(u.scroll, f.progress)
      gl.uniform1f(u.speed, Math.min(f.speed, 40))
      gl.uniform3f(u.tint, tint[0], tint[1], tint[2])
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    })

    return () => {
      stop?.()
      window.removeEventListener("resize", resize)
      document.removeEventListener("visibilitychange", onVis)
      modeObserver.disconnect()
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buf)
      gl.getExtension("WEBGL_lose_context")?.loseContext()
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10" aria-hidden="true">
      {/* static ground that also serves as the mobile / no-WebGL fallback */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 0%, #11131a 0%, #06070a 62%), radial-gradient(ellipse 60% 50% at 80% 100%, #0d1016 0%, transparent 70%)",
        }}
      />
      <div className="grid-rule absolute inset-0 opacity-50" />
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
    </div>
  )
}
