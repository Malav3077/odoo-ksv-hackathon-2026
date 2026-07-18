/**
 * Tiny inline trend line for KPI cards. Pure/deterministic (no hooks, no
 * `Date`/random) so it renders identically on server and client and keeps the
 * KPI grid a server component. `uid` must be unique per instance so the fill
 * gradient ids don't collide.
 */
const SW = 76;
const SH = 26;
const PAD = 3;

export function Sparkline({ data, color = "var(--dash-indigo)", uid = "s" }) {
  if (!Array.isArray(data) || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = SW / (data.length - 1);

  const pts = data.map((v, i) => {
    const x = i * stepX;
    const y = SH - PAD - ((v - min) / range) * (SH - PAD * 2);
    return [x, y];
  });

  const line = pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${SW},${SH} L0,${SH} Z`;
  const [ex, ey] = pts[pts.length - 1];
  const gid = `spark-${uid}`;

  return (
    <svg
      width={SW}
      height={SH}
      viewBox={`0 0 ${SW} ${SH}`}
      className="shrink-0 overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={ex} cy={ey} r="2" fill={color} />
    </svg>
  );
}
