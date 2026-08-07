/** @resolution */
uniform vec2 u_resolution;

/** Animation disabled */
uniform float u_time;

float capsule(vec2 p, vec2 a, vec2 b, float r) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

float box(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

void main() {
  gl_FragColor = vec4(0.0);
  return;
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float t = fract((u_time + 1.0) / 5.5);
  float eased = t * t * (3.0 - 2.0 * t);
  vec2 position = mix(vec2(0.04, 0.76), vec2(0.96, 0.25), eased);

  vec2 p = uv - position;
  p.x *= u_resolution.x / u_resolution.y;
  float angle = -0.16 + 0.12 * eased;
  mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  p = rotation * p;
  p /= 1.22;

  float fuselage = capsule(p, vec2(-0.075, 0.0), vec2(0.09, 0.0), 0.012);
  float nose = length(p - vec2(0.095, 0.0)) - 0.017;
  mat2 wingAngle = mat2(cos(0.18), -sin(0.18), sin(0.18), cos(0.18));
  float wing = box(wingAngle * (p - vec2(-0.005, 0.0)), vec2(0.014, 0.072));
  float tail = box(wingAngle * (p - vec2(-0.064, 0.0)), vec2(0.008, 0.032));
  float plane = min(min(fuselage, nose), min(wing, tail));

  float edge = 1.5 / min(u_resolution.x, u_resolution.y);
  float silhouette = 1.0 - smoothstep(-edge, edge, plane);
  float fade = smoothstep(0.0, 0.025, t) * (1.0 - smoothstep(0.975, 1.0, t));

  float trailY = 0.76 - (uv.x + 0.12) * 0.425;
  float trail = smoothstep(0.004, 0.0, abs(uv.y - trailY));
  trail *= step(uv.x, position.x - 0.04) * step(-0.08, uv.x);
  trail *= 0.24 + 0.12 * sin(uv.x * 120.0 - u_time * 3.0);

  float runway = smoothstep(0.003, 0.0, abs(uv.y - 0.18));
  float lights = step(0.76, fract(uv.x * 24.0 - u_time * 0.35)) * runway * 0.24;

  vec3 white = vec3(1.0);
  vec3 amber = vec3(0.95, 0.40, 0.18);
  vec3 color = white * (silhouette * 0.92 + trail) + amber * lights;
  float alpha = clamp((silhouette * 0.92 + trail + lights) * fade, 0.0, 0.92);
  gl_FragColor = vec4(color, alpha);
}
