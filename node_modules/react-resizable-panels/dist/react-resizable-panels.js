"use client";
import { jsx as j, jsxs as qe, Fragment as si } from "react/jsx-runtime";
import * as Sr from "react";
import { useId as wr, useLayoutEffect as ts, useEffect as Be, useRef as J, useCallback as te, createContext as Ge, useContext as fe, useState as oe, Children as xr, isValidElement as ns, useMemo as pe, useImperativeHandle as Cn, useSyncExternalStore as ot, memo as zr, Fragment as Tr } from "react";
import { createPortal as Ir } from "react-dom";
function bn(e) {
  return (typeof e == "number" || typeof e == "string") && e !== "";
}
function ft(e) {
  const t = wr();
  return bn(e) ? `${e}` : t;
}
const ue = typeof window < "u" ? ts : Be;
function Se(e) {
  const t = J(e);
  return ue(() => {
    t.current = e;
  }, [e]), te(
    (...n) => t.current?.(...n),
    [t]
  );
}
function it(...e) {
  return Se((t) => {
    e.forEach((n) => {
      if (n)
        switch (typeof n) {
          case "function": {
            n(t);
            break;
          }
          case "object": {
            n.current = t;
            break;
          }
        }
    });
  });
}
function Rt(e, t) {
  const n = e?.["data-testid"];
  return bn(n) ? `${n}` : bn(t) ? `${t}` : void 0;
}
function no(e, t) {
  return t ? e * 2 + 1 : e + 1;
}
function Cr(e, t) {
  return t ? e * 2 - 1 : e;
}
function ri(e, t, n) {
  return `${no(e, n)} / span ${Cr(t, n)}`;
}
function Lr(e) {
  return `${e * 2} / span 1`;
}
function Er({
  crossCount: e,
  crossSpan: t,
  crossStart: n,
  hasGutters: o
}) {
  const i = t === void 0 ? e : n + t;
  if (n === 0 && i === e)
    return "1 / -1";
  let s = no(n, o), r = no(i - 1, o) + 1;
  return o && (n > 0 && s--, i < e && r++), `${s} / ${r}`;
}
function bo(e, t) {
  return Number.isInteger(e) && e >= 1 && e < t;
}
function ae(e, t = "Assertion error") {
  if (!e)
    throw Error(t);
}
const os = Ge(null);
function is() {
  const e = fe(os);
  return ae(
    e,
    "Grid Context not found; did you render a Cell or Gridline outside of a Grid?"
  ), e;
}
function Rr({
  children: e,
  className: t,
  column: n,
  columnSpan: o = 1,
  elementRef: i,
  id: s,
  row: r,
  rowSpan: a = 1,
  style: l,
  ...c
}) {
  const u = ft(s), { gutters: d, registerCell: p } = is(), h = J(null), f = it(h, i);
  return ue(() => {
    const m = h.current;
    if (m !== null)
      return p({
        column: n,
        columnSpan: o,
        element: m,
        id: u,
        row: r,
        rowSpan: a
      });
  }, [n, o, u, p, r, a]), /* @__PURE__ */ j(
    "div",
    {
      ...c,
      className: t,
      "data-cell": !0,
      "data-testid": Rt(c, s),
      id: u,
      ref: f,
      style: {
        overflow: "auto",
        ...l,
        // Allow cells to shrink smaller than their content
        minHeight: 0,
        minWidth: 0,
        gridColumn: ri(n, o, d.column),
        gridRow: ri(r, a, d.row)
      },
      children: e
    }
  );
}
const Tl = /* @__PURE__ */ Object.assign(Rr, {
  displayName: "Cell"
});
let rn;
function Dr() {
  return rn === void 0 && (typeof matchMedia == "function" ? rn = !!matchMedia("(pointer:coarse)").matches : rn = !1), rn;
}
function oo({
  expandHitTargets: e,
  axis: t,
  rect: n
}) {
  const o = e ? Dr() ? t.resizeTargetMinimumSize.coarse : t.resizeTargetMinimumSize.fine : 0;
  if (n.width < o) {
    const i = o - n.width;
    n = new DOMRect(
      n.x - i / 2,
      n.y,
      n.width + i,
      n.height
    );
  }
  if (n.height < o) {
    const i = o - n.height;
    n = new DOMRect(
      n.x,
      n.y - i / 2,
      n.width,
      n.height + i
    );
  }
  return n;
}
function Lt(e, t) {
  return t === "column" ? [e.column, e.columnSpan, e.row, e.rowSpan] : [e.row, e.rowSpan, e.column, e.columnSpan];
}
function io(e, t) {
  return t === "column" ? {
    crossEnd: e.bottom,
    crossStart: e.top,
    end: e.right,
    start: e.left
  } : {
    crossEnd: e.right,
    crossStart: e.left,
    end: e.bottom,
    start: e.top
  };
}
function so(e, t, n, o) {
  return t === "column" ? new DOMRect(e.x, n, e.width, o - n) : new DOMRect(n, e.y, o - n, e.height);
}
function ai({
  axis: e,
  cells: t,
  getCellBounds: n,
  index: o,
  rect: i
}) {
  let s = [i];
  for (const r of t) {
    const [a, l] = Lt(r, e);
    if (a >= o || a + l <= o)
      continue;
    const { crossStart: c, crossEnd: u } = n(r);
    u <= c || (s = s.flatMap((d) => {
      const { crossStart: p, crossEnd: h } = io(d, e);
      if (c >= h || u <= p)
        return [d];
      const f = [];
      return p < c && f.push(so(d, e, p, c)), h > u && f.push(so(d, e, u, h)), f;
    }));
  }
  return s;
}
function ss({
  axis: e,
  cells: t,
  crossTrackCount: n,
  trackCount: o
}) {
  const i = Array.from(
    { length: n },
    () => new Array(o)
  );
  for (const s of t) {
    const [r, a, l, c] = Lt(s, e);
    for (let u = Math.max(0, l); u < Math.min(n, l + c); u++)
      for (let d = Math.max(0, r); d < Math.min(o, r + a); d++)
        i[u][d] ??= s;
  }
  return i;
}
function ci({ crossEnd: e, crossStart: t, end: n, start: o }, i) {
  return i === "column" ? new DOMRect(o, t, n - o, e - t) : new DOMRect(t, o, e - t, n - o);
}
function Mr({
  axis: e,
  cells: t,
  crossTrackCount: n,
  expandHitTargets: o,
  getAxisSize: i,
  getSlots: s,
  includeDisabled: r,
  resizeAxis: a,
  separatorPlacements: l
}) {
  const { items: c, separators: u } = a, d = c.length;
  let p = -1, h = -1, f = 0;
  if (c.forEach((P, T) => {
    P.constraintProps.disabled || (f++, p === -1 && (p = T), h = T);
  }), !r && f < 2)
    return [];
  const m = i(), b = (P) => r || P > p && P <= h, g = [], w = (P, T, C) => ({
    axis: a,
    axisSize: m,
    items: [c[P - 1], c[P]],
    rect: T,
    separator: C
  }), v = /* @__PURE__ */ new Map(), z = (P) => {
    let T = v.get(P);
    return T || (T = io(P.element.getBoundingClientRect(), e), v.set(P, T)), T;
  }, M = (P, T) => {
    let C;
    for (const D of t) {
      const [, , V, O] = Lt(D, e);
      if (T === "start") {
        if (V === P) {
          const { crossStart: N } = z(D);
          C = C === void 0 ? N : Math.min(C, N);
        }
      } else if (V + O - 1 === P) {
        const { crossEnd: N } = z(D);
        C = C === void 0 ? N : Math.max(C, N);
      }
    }
    return C;
  }, L = /* @__PURE__ */ new Set();
  for (const P of u) {
    const T = l.get(P);
    if (!T || T.index < 1 || T.index >= d || (L.add(T.index), !r && (P.disabled || P.element.hasAttribute("aria-disabled"))) || !b(T.index))
      continue;
    let C = P.element.getBoundingClientRect();
    const { crossSpan: D, crossStart: V } = T, O = D === void 0 ? n : V + D;
    let { crossStart: N, crossEnd: H } = io(
      C,
      e
    );
    if (V > 0) {
      const B = M(V - 1, "end");
      B !== void 0 && B < N && (N = B);
    }
    if (O < n) {
      const B = M(O, "start");
      B !== void 0 && B > H && (H = B);
    }
    C = so(C, e, N, H), C = oo({ expandHitTargets: o, axis: a, rect: C }), r ? g.push(w(T.index, C, P)) : ai({
      axis: e,
      cells: t,
      getCellBounds: z,
      index: T.index,
      rect: C
    }).forEach((B) => {
      g.push(w(T.index, B, P));
    });
  }
  const W = (P, T) => {
    ai({
      axis: e,
      cells: t,
      getCellBounds: z,
      index: P,
      rect: oo({ expandHitTargets: o, axis: a, rect: T })
    }).forEach((C) => {
      g.push(w(P, C));
    });
  }, U = s ? s() : ss({ axis: e, cells: t, crossTrackCount: n, trackCount: d });
  for (let P = 1; P < d; P++) {
    if (L.has(P) || !b(P))
      continue;
    let T;
    for (let C = 0; C < n; C++) {
      const D = U[C][P - 1], V = U[C][P];
      let O;
      if ((D || V) && D !== V) {
        const N = D ? z(D) : void 0, H = V ? z(V) : void 0, B = N?.end ?? H.start, I = H?.start ?? N.end, G = Math.max(
          N?.crossStart ?? -1 / 0,
          H?.crossStart ?? -1 / 0
        ), _ = Math.min(
          N?.crossEnd ?? 1 / 0,
          H?.crossEnd ?? 1 / 0
        );
        O = {
          crossEnd: Math.max(G, _),
          crossStart: G,
          end: Math.max(B, I),
          start: Math.min(B, I)
        };
      }
      O ? T = T ? {
        crossEnd: Math.max(T.crossEnd, O.crossEnd),
        crossStart: Math.min(T.crossStart, O.crossStart),
        end: Math.max(T.end, O.end),
        start: Math.min(T.start, O.start)
      } : O : T && (W(P, ci(T, e)), T = void 0);
    }
    T && W(P, ci(T, e));
  }
  return g;
}
function Ve(e) {
  const t = parseFloat(e ?? "");
  return Number.isFinite(t) ? t : 0;
}
function Pr({
  axis: e,
  element: t,
  getGutterSizes: n,
  hasGutters: o,
  layout: i,
  trackIds: s
}) {
  const r = s.length, a = o ? r * 2 - 1 : r, l = t.ownerDocument.defaultView?.getComputedStyle(t), c = e === "column", u = c ? l?.gridTemplateColumns : l?.gridTemplateRows;
  if (u) {
    const b = u.trim().split(/\s+/);
    if (b.length === a && b.every((g) => /^-?[\d.]+px$/.test(g))) {
      const g = s.map(
        (w, v) => Ve(b[o ? v * 2 : v])
      );
      return {
        availableSize: g.reduce((w, v) => w + v, 0),
        trackSizes: g
      };
    }
  }
  const d = c ? t.offsetWidth : t.offsetHeight, p = c ? Ve(l?.paddingLeft) + Ve(l?.paddingRight) + Ve(l?.borderLeftWidth) + Ve(l?.borderRightWidth) : Ve(l?.paddingTop) + Ve(l?.paddingBottom) + Ve(l?.borderTopWidth) + Ve(l?.borderBottomWidth), h = Ve(c ? l?.columnGap : l?.rowGap), f = n().reduce((b, g) => b + g, 0), m = Math.max(
    0,
    d - p - h * Math.max(0, a - 1) - f
  );
  return {
    availableSize: m,
    trackSizes: s.map(
      (b) => i && i[b] !== void 0 ? i[b] / 100 * m : m / r
    )
  };
}
class jt {
  #e = {};
  addListener(t, n) {
    const o = this.#e[t];
    return o === void 0 ? this.#e[t] = [n] : o.includes(n) || o.push(n), () => {
      this.removeListener(t, n);
    };
  }
  emit(t, n) {
    const o = this.#e[t];
    if (o !== void 0) {
      if (o.length === 1) {
        o[0].call(null, n);
        return;
      }
      let i;
      const s = Array.from(o);
      for (let r = 0; r < s.length; r++) {
        const a = s[r];
        try {
          a.call(null, n);
        } catch (l) {
          i ??= { error: l };
        }
      }
      if (i)
        throw i.error;
    }
  }
  removeListener(t, n) {
    const o = this.#e[t];
    if (o !== void 0) {
      const i = o.indexOf(n);
      i >= 0 && o.splice(i, 1);
    }
  }
}
function yn(e) {
  const t = (o) => {
    o.preventDefault(), o.stopPropagation(), n();
  }, n = () => {
    e.removeEventListener("click", t, !0);
  };
  e.addEventListener("click", t, !0), setTimeout(n, 0);
}
let be = {
  cursorFlags: 0,
  state: "inactive"
};
const yo = new jt();
function Pe() {
  return be;
}
function Ln(e) {
  return yo.addListener("change", e);
}
function Ar(e, t = [], n, o = !1) {
  const i = be, s = { ...be };
  s.cursorFlags = e, s.state === "active" && (s.didPointerMove ||= o, s.previews = t, n && (s.previewLayoutMap = n)), be = s, yo.emit("change", {
    prev: i,
    next: s
  });
}
function Xe(e) {
  const t = be;
  be = e, t.state === "active" && e.state !== "active" && t.didPointerMove && (t.hitRegions.forEach(({ separator: n }) => {
    n && n.element.ownerDocument.activeElement === n.element && n.element.blur();
  }), yn(t.ownerDocument)), yo.emit("change", {
    prev: t,
    next: e
  });
}
function kr(e) {
  be.state !== "active" || !be.previews.some((t) => t.separator === e) || Xe({
    ...be,
    previews: be.previews.map(
      (t) => t.separator === e ? { ...t } : t
    )
  });
}
function Or(e) {
  if (be.state === "inactive")
    return;
  const t = be.hitRegions.filter((o) => o.axis !== e), n = be.state === "active" && be.previews.some((o) => o.axis === e);
  if (!(t.length === be.hitRegions.length && !n))
    if (t.length === 0)
      Xe({ cursorFlags: 0, state: "inactive" });
    else if (be.state === "active") {
      const o = new Map(be.initialLayoutMap), i = new Map(be.previewLayoutMap);
      o.delete(e), i.delete(e), Xe({
        ...be,
        cursorFlags: 0,
        hitRegions: t,
        initialLayoutMap: o,
        previewLayoutMap: i,
        previews: be.previews.filter((s) => s.axis !== e)
      });
    } else
      Xe({ ...be, hitRegions: t });
}
const Nr = (e) => e, Yn = () => {
}, rs = 1, as = 2, cs = 4, ls = 8, li = 3, ui = 12;
let an;
function di() {
  return an === void 0 && (an = !1, typeof window < "u" && (window.navigator.userAgent.includes("Chrome") || window.navigator.userAgent.includes("Firefox")) && (an = !0)), an;
}
function $r({
  cursorFlags: e,
  axes: t,
  state: n
}) {
  let o = 0, i = 0;
  switch (n) {
    case "active":
    case "hover":
      t.forEach((s) => {
        if (!s.mutableState.disableCursor)
          switch (s.orientation) {
            case "horizontal": {
              o++;
              break;
            }
            case "vertical": {
              i++;
              break;
            }
          }
      });
  }
  if (!(o === 0 && i === 0)) {
    switch (n) {
      case "active": {
        if (e && di()) {
          const s = (e & rs) !== 0, r = (e & as) !== 0, a = (e & cs) !== 0, l = (e & ls) !== 0;
          if (s)
            return a ? "se-resize" : l ? "ne-resize" : "e-resize";
          if (r)
            return a ? "sw-resize" : l ? "nw-resize" : "w-resize";
          if (a)
            return "s-resize";
          if (l)
            return "n-resize";
        }
        break;
      }
    }
    return di() ? o > 0 && i > 0 ? "move" : o > 0 ? "ew-resize" : "ns-resize" : o > 0 && i > 0 ? "grab" : o > 0 ? "col-resize" : "row-resize";
  }
}
const fi = /* @__PURE__ */ new WeakMap();
function pi(e) {
  if (!e.defaultView || !e.adoptedStyleSheets)
    return;
  let { prevStyle: t, styleSheet: n } = fi.get(e) ?? {};
  n === void 0 && (n = new e.defaultView.CSSStyleSheet(), e.adoptedStyleSheets && (Object.isExtensible(e.adoptedStyleSheets) ? e.adoptedStyleSheets.push(n) : e.adoptedStyleSheets = [
    ...e.adoptedStyleSheets,
    n
  ]));
  let o = Pe();
  switch (o.state !== "inactive" && o.ownerDocument !== e && (o = { cursorFlags: 0, state: "inactive" }), o.state) {
    case "active":
    case "hover": {
      const i = $r({
        cursorFlags: o.cursorFlags,
        axes: o.hitRegions.map((r) => r.axis),
        state: o.state
      }), s = `*, *:hover {cursor: ${i} !important; }`;
      if (t === s)
        return;
      t = s, i ? n.cssRules.length === 0 ? n.insertRule(s) : n.replaceSync(s) : n.cssRules.length === 1 && n.deleteRule(0);
      break;
    }
    case "inactive": {
      t = void 0, n.cssRules.length === 1 && n.deleteRule(0);
      break;
    }
  }
  fi.set(e, {
    prevStyle: t,
    styleSheet: n
  });
}
function hi(e) {
  return e.state === "inactive" ? void 0 : e.ownerDocument;
}
function Br({
  next: e,
  prev: t
}) {
  const n = hi(t), o = hi(e);
  n && n !== o && pi(n), o && pi(o);
}
function ye(e, t) {
  const n = t === "horizontal" ? e.offsetWidth : e.offsetHeight;
  if (n === 0)
    return 1;
  const o = e.getBoundingClientRect(), i = t === "horizontal" ? o.width : o.height;
  return i <= 0 || Math.abs(i - n) < 1 ? 1 : i / n;
}
function qt({
  axis: e
}) {
  const { element: t, layoutStrategy: n, orientation: o, items: i } = e;
  if (n)
    return n.calculateAvailableSize();
  const s = ye(t, o);
  return i.reduce((r, a) => {
    const l = a.element.getBoundingClientRect(), c = (o === "horizontal" ? l.width : l.height) / s, u = o === "horizontal" ? a.element.offsetWidth : a.element.offsetHeight;
    return r += Math.abs(c - u) < 1 ? c : u, r;
  }, 0);
}
function vo(e, t) {
  const n = e.compareDocumentPosition(t);
  return n & Node.DOCUMENT_POSITION_DISCONNECTED ? 0 : n & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : n & Node.DOCUMENT_POSITION_PRECEDING ? 1 : 0;
}
function kt(e, t) {
  return Array.from(t).sort((n, o) => {
    const i = e === "horizontal" ? Fr(n, o) : _r(n, o);
    return i !== 0 ? i : vo(n.element, o.element);
  });
}
function Fr(e, t) {
  const n = e.element.offsetLeft - t.element.offsetLeft;
  return n !== 0 ? n : e.element.offsetWidth - t.element.offsetWidth;
}
function _r(e, t) {
  const n = e.element.offsetTop - t.element.offsetTop;
  return n !== 0 ? n : e.element.offsetHeight - t.element.offsetHeight;
}
function $e(e) {
  return e !== null && typeof e == "object" && "nodeType" in e && e.nodeType === Node.ELEMENT_NODE;
}
function us(e, t) {
  return {
    x: e.x >= t.left && e.x <= t.right ? 0 : Math.min(
      Math.abs(e.x - t.left),
      Math.abs(e.x - t.right)
    ),
    y: e.y >= t.top && e.y <= t.bottom ? 0 : Math.min(
      Math.abs(e.y - t.top),
      Math.abs(e.y - t.bottom)
    )
  };
}
function Wr({
  orientation: e,
  rects: t,
  targetRect: n
}) {
  const o = {
    x: n.x + n.width / 2,
    y: n.y + n.height / 2
  };
  let i, s = Number.MAX_VALUE;
  for (const r of t) {
    const { x: a, y: l } = us(o, r), c = e === "horizontal" ? a : l;
    c < s && (s = c, i = r);
  }
  return ae(i, "No rect found"), i;
}
function So({
  expandHitTargets: e = !0,
  axis: t,
  includeDisabled: n = !1
}) {
  if (t.layoutStrategy)
    return t.layoutStrategy.calculateHitRegions({
      expandHitTargets: e,
      axis: t,
      includeDisabled: n
    });
  const { element: o, orientation: i, items: s, separators: r } = t, a = kt(
    i,
    Array.from(o.children).filter($e).filter((w) => !w.hasAttribute("data-resize-preview")).map((w) => ({ element: w }))
  ).map(({ element: w }) => w), l = [];
  let c = !1, u = !1, d = -1, p, h = -1, f = 0, m, b, g = [];
  {
    let w = -1;
    for (const v of a)
      v.hasAttribute("data-panel") && (w++, v.hasAttribute("data-disabled") || (f++, d === -1 && (d = w), h = w));
  }
  if (n || f > 1) {
    let w = -1;
    for (const v of a)
      if (v.hasAttribute("data-panel")) {
        w++;
        const z = s.find(
          (M) => M.element === v
        );
        if (z) {
          const M = v.getBoundingClientRect();
          if (m && b) {
            const L = b;
            let W;
            if (u) {
              const U = i === "horizontal" ? new DOMRect(
                L.right,
                L.top,
                0,
                L.height
              ) : new DOMRect(
                L.left,
                L.bottom,
                L.width,
                0
              ), P = i === "horizontal" ? new DOMRect(M.left, M.top, 0, M.height) : new DOMRect(M.left, M.top, M.width, 0);
              switch (g.length) {
                case 0: {
                  W = [
                    U,
                    P
                  ];
                  break;
                }
                case 1: {
                  const T = g[0], C = Wr({
                    orientation: i,
                    rects: [L, M],
                    targetRect: T.element.getBoundingClientRect()
                  });
                  W = [
                    T,
                    C === L ? P : U
                  ];
                  break;
                }
                default: {
                  W = g;
                  break;
                }
              }
            } else
              g.length ? W = g : W = [
                i === "horizontal" ? new DOMRect(
                  L.right,
                  M.top,
                  M.left - L.right,
                  M.height
                ) : new DOMRect(
                  M.left,
                  L.bottom,
                  M.width,
                  M.top - L.bottom
                )
              ];
            for (const U of W) {
              const P = oo({
                expandHitTargets: e,
                axis: t,
                rect: "width" in U ? U : U.element.getBoundingClientRect()
              }), T = w <= d || w > h;
              (n || !c && !T) && (p ??= qt({ axis: t }) * ye(t.element, t.orientation), l.push({
                axis: t,
                axisSize: p,
                items: [m, z],
                separator: "width" in U ? void 0 : U,
                rect: P
              })), c = !1;
            }
          }
          u = !1, m = z, b = M, g = [];
        }
      } else if (v.hasAttribute("data-separator")) {
        v.ariaDisabled !== null && (c = !0);
        const z = r.find(
          (M) => M.element === v
        );
        z ? g.push(z) : (m = void 0, g = []);
      } else
        u = !0;
  }
  return l;
}
function wo(e) {
  return e.ownerDocument.defaultView ?? window;
}
function Gr(e, t) {
  const n = wo(e).getComputedStyle(e), o = parseFloat(n.fontSize);
  return t * o;
}
function Hr(e, t) {
  const n = getComputedStyle(e.ownerDocument.documentElement), o = parseFloat(n.fontSize);
  return t * o;
}
function Vr(e, t) {
  return t / 100 * wo(e).innerHeight;
}
function jr(e, t) {
  return t / 100 * wo(e).innerWidth;
}
function xo(e) {
  switch (typeof e) {
    case "number":
      return [e, "px"];
    case "string": {
      const t = parseFloat(e);
      return e.endsWith("%") ? [t, "%"] : e.endsWith("px") ? [t, "px"] : e.endsWith("rem") ? [t, "rem"] : e.endsWith("em") ? [t, "em"] : e.endsWith("vh") ? [t, "vh"] : e.endsWith("vw") ? [t, "vw"] : [t, "%"];
    }
  }
}
function lt({
  axisSize: e,
  itemElement: t,
  styleProp: n
}) {
  let o;
  const [i, s] = xo(n);
  switch (s) {
    case "%": {
      o = i / 100 * e;
      break;
    }
    case "px": {
      o = i;
      break;
    }
    case "rem": {
      o = Hr(t, i);
      break;
    }
    case "em": {
      o = Gr(t, i);
      break;
    }
    case "vh": {
      o = Vr(t, i);
      break;
    }
    case "vw": {
      o = jr(t, i);
      break;
    }
  }
  return o;
}
function we(e) {
  return parseFloat(e.toFixed(3));
}
function zo(e, t = qt({ axis: e })) {
  const { items: n } = e;
  return t === 0 ? n.map((o) => ({
    groupResizeBehavior: o.constraintProps.groupResizeBehavior,
    collapsedSize: 0,
    collapsible: o.constraintProps.collapsible === !0,
    defaultSize: void 0,
    disabled: o.constraintProps.disabled,
    minSize: 0,
    maxSize: 100,
    itemId: o.id
  })) : n.map((o) => {
    const { element: i, constraintProps: s } = o;
    let r = 0;
    if (s.collapsedSize !== void 0) {
      const d = lt({
        axisSize: t,
        itemElement: i,
        styleProp: s.collapsedSize
      });
      r = we(d / t * 100);
    }
    let a;
    if (s.collapsedThreshold !== void 0) {
      const d = lt({
        axisSize: t,
        itemElement: i,
        styleProp: s.collapsedThreshold
      });
      a = we(d / t * 100);
    }
    let l;
    if (s.defaultSize !== void 0) {
      const d = lt({
        axisSize: t,
        itemElement: i,
        styleProp: s.defaultSize
      });
      l = we(d / t * 100);
    }
    let c = 0;
    if (s.minSize !== void 0) {
      const d = lt({
        axisSize: t,
        itemElement: i,
        styleProp: s.minSize
      });
      c = we(d / t * 100);
    }
    let u = 100;
    if (s.maxSize !== void 0) {
      const d = lt({
        axisSize: t,
        itemElement: i,
        styleProp: s.maxSize
      });
      u = we(d / t * 100);
    }
    return {
      groupResizeBehavior: s.groupResizeBehavior,
      collapsedSize: r,
      collapsedThreshold: a,
      collapsible: s.collapsible === !0,
      defaultSize: l,
      disabled: s.disabled,
      minSize: c,
      maxSize: u,
      itemId: o.id
    };
  });
}
let je = /* @__PURE__ */ new Map();
const To = new jt();
let Nt = 0;
const fn = [];
let pn;
function En() {
  Nt++;
}
function ds() {
  for (let e = 0; e < fn.length; e++)
    try {
      To.emit("axisChange", fn[e]);
    } catch (t) {
      pn ??= { error: t };
    }
  fn.length = 0;
}
function Rn() {
  if (Nt === 1 && ds(), Nt--, Nt === 0 && pn) {
    const { error: e } = pn;
    throw pn = void 0, e;
  }
}
function qr(e) {
  je = new Map(je), je.delete(e);
}
function zt(e, t) {
  for (const [n] of je)
    if (n.id === e)
      return n;
}
function Re(e, t) {
  for (const [n, o] of je)
    if (n.id === e)
      return o;
  if (t)
    throw Error(`Could not find data for Group with id ${e}`);
}
function Je() {
  return je;
}
function Et(e, t) {
  return To.addListener("axisChange", (n) => {
    n.axis.id === e && t(n);
  });
}
function Ke(e, t, n) {
  const o = je.get(e);
  je = new Map(je), je.set(e, t);
  const i = {
    axis: e,
    isUserInteraction: n?.isUserInteraction === !0,
    prev: o,
    next: t
  };
  Nt > 0 ? fn.push(i) : To.emit("axisChange", i);
}
function fs(e, t) {
  ds(), Xe({
    cursorFlags: 0,
    state: "inactive"
  }), e.hitRegions.forEach((n) => {
    if (!t.has(n.axis))
      return;
    const o = Re(n.axis.id, !0);
    Ke(n.axis, o, {
      isUserInteraction: !0
    });
  });
}
function ps(e, { pointerId: t, pointerType: n }) {
  return t === e.pointerId || // There is only one pen, but it may be assigned a new pointerId each time it comes into range
  n === "pen" && e.pointerType === "pen";
}
function Ut(e, t, n = {}) {
  return e.ownerDocument === t && (n.pointerId === void 0 || ps(e, n));
}
function Ur(e, t) {
  if (e.length !== t.length)
    return !1;
  for (let n = 0; n < e.length; n++)
    if (e[n] != t[n])
      return !1;
  return !0;
}
function me(e, t, n = 0) {
  return Math.abs(we(e) - we(t)) <= n;
}
function De(e, t) {
  return me(e, t) ? 0 : e > t ? 1 : -1;
}
function ut({
  overrideDisabledItems: e,
  itemConstraints: t,
  prevSize: n,
  size: o
}) {
  const {
    collapsedSize: i = 0,
    collapsedThreshold: s,
    collapsible: r,
    disabled: a,
    maxSize: l = 100,
    minSize: c = 0
  } = t;
  if (a && !e)
    return n;
  if (De(o, c) < 0)
    if (r) {
      const u = s ?? (c - i) / 2, d = De(n, i) <= 0, p = d ? i + u : c - u, h = De(o, p);
      De(o, i) <= 0 || h < 0 || s !== void 0 && d && h === 0 ? o = i : o = c;
    } else
      o = c;
  return o = Math.min(l, o), o = we(o), o;
}
function Bt({
  delta: e,
  initialLayout: t,
  itemConstraints: n,
  pivotIndices: o,
  prevLayout: i,
  trigger: s
}) {
  if (me(e, 0))
    return t;
  const r = s === "imperative-api", a = n.map(
    ({ itemId: f }) => t[f]
  ), l = n.map(
    ({ itemId: f }) => i[f]
  ), c = [...a], [u, d] = o;
  ae(u != null, "Invalid first pivot index"), ae(d != null, "Invalid second pivot index");
  let p = 0;
  switch (s) {
    case "keyboard": {
      {
        const f = e < 0 ? d : u, m = n[f];
        ae(
          m,
          `Panel constraints not found for index ${f}`
        );
        const {
          collapsedSize: b = 0,
          collapsible: g,
          minSize: w = 0
        } = m;
        if (g) {
          const v = a[f];
          if (ae(
            v != null,
            `Previous layout not found for panel index ${f}`
          ), me(v, b)) {
            const z = w - v;
            De(z, Math.abs(e)) > 0 && (e = e < 0 ? 0 - z : z);
          }
        }
      }
      {
        const f = e < 0 ? u : d, m = n[f];
        ae(
          m,
          `No panel constraints found for index ${f}`
        );
        const {
          collapsedSize: b = 0,
          collapsible: g,
          minSize: w = 0
        } = m;
        if (g) {
          const v = a[f];
          if (ae(
            v != null,
            `Previous layout not found for panel index ${f}`
          ), me(v, w)) {
            const z = v - b;
            De(z, Math.abs(e)) > 0 && (e = e < 0 ? 0 - z : z);
          }
        }
      }
      break;
    }
    default: {
      const f = e < 0 ? d : u, m = n[f];
      ae(
        m,
        `Panel constraints not found for index ${f}`
      );
      const b = a[f], { collapsedSize: g, collapsedThreshold: w, collapsible: v, minSize: z } = m;
      if (v && De(b, z) < 0) {
        const M = z - g, L = w ?? M / 2, W = b + Math.abs(e);
        if (De(W, z) < 0) {
          const U = De(Math.abs(e), L), P = w === void 0 && e < 0;
          U > 0 || U === 0 && P ? e = e < 0 ? -M : M : e = 0;
        }
      }
      break;
    }
  }
  {
    const f = e < 0 ? 1 : -1;
    let m = e < 0 ? d : u, b = 0;
    for (; ; ) {
      const w = a[m];
      ae(
        w != null,
        `Previous layout not found for panel index ${m}`
      );
      const z = ut({
        overrideDisabledItems: r,
        itemConstraints: n[m],
        prevSize: w,
        size: 100
      }) - w;
      if (b += z, m += f, m < 0 || m >= n.length)
        break;
    }
    const g = Math.min(Math.abs(e), Math.abs(b));
    e = e < 0 ? 0 - g : g;
  }
  {
    let m = e < 0 ? u : d;
    for (; m >= 0 && m < n.length; ) {
      const b = Math.abs(e) - Math.abs(p), g = a[m];
      ae(
        g != null,
        `Previous layout not found for panel index ${m}`
      );
      const w = g - b, v = ut({
        overrideDisabledItems: r,
        itemConstraints: n[m],
        prevSize: g,
        size: w
      });
      if (!me(g, v) && (p += g - v, c[m] = v, De(p, Math.abs(e)) >= 0))
        break;
      e < 0 ? m-- : m++;
    }
  }
  if (Ur(l, c))
    return i;
  {
    const f = e < 0 ? d : u, m = a[f];
    ae(
      m != null,
      `Previous layout not found for panel index ${f}`
    );
    const b = m + p, g = ut({
      overrideDisabledItems: r,
      itemConstraints: n[f],
      prevSize: m,
      size: b
    });
    if (c[f] = g, !me(g, b)) {
      let w = b - g, z = e < 0 ? d : u;
      for (; z >= 0 && z < n.length; ) {
        const M = c[z];
        ae(
          M != null,
          `Previous layout not found for panel index ${z}`
        );
        const L = M + w, W = ut({
          overrideDisabledItems: r,
          itemConstraints: n[z],
          prevSize: M,
          size: L
        });
        if (me(M, W) || (w -= W - M, c[z] = W), me(w, 0))
          break;
        e > 0 ? z-- : z++;
      }
    }
  }
  const h = c.reduce((f, m) => m + f, 0);
  return me(h, 100, 0.1) ? c.reduce((f, m, b) => (f[n[b].itemId] = m, f), {}) : i;
}
function He(e, t) {
  if (Object.keys(e).length !== Object.keys(t).length)
    return !1;
  for (const n in e)
    if (t[n] === void 0 || De(e[n], t[n]) !== 0)
      return !1;
  return !0;
}
function Io(e) {
  En();
  try {
    Yr(e);
  } finally {
    Rn();
  }
}
function Yr({
  commit: e,
  event: t,
  hitRegions: n,
  initialLayoutMap: o,
  mountedAxes: i,
  pointerDownAtPoint: s,
  prevCursorFlags: r
}) {
  let a = 0;
  const l = Pe();
  let c = l.state === "active" ? l.previews : [];
  const u = new Map(
    l.state === "active" ? l.previewLayoutMap : void 0
  );
  n.forEach((h) => {
    const { axis: f, axisSize: m } = h, { orientation: b, items: g } = f;
    if (e && f.resizePreviewMode !== "separator")
      return;
    const { disableCursor: w } = f.mutableState;
    let v = 0;
    s ? b === "horizontal" ? v = (t.clientX - s.x) / m * 100 : v = (t.clientY - s.y) / m * 100 : b === "horizontal" ? v = t.clientX < 0 ? -100 : 100 : v = t.clientY < 0 ? -100 : 100;
    const z = o.get(f), M = i.get(f);
    if (!z || !M)
      return;
    const {
      defaultLayoutDeferred: L,
      derivedItemConstraints: W,
      axisSize: U,
      layout: P,
      separatorToItems: T
    } = M;
    if (W && P && T) {
      const C = f.resizePreviewMode === "separator" ? u.get(f) ?? P : P, D = Bt({
        delta: v,
        initialLayout: z,
        itemConstraints: W,
        pivotIndices: h.items.map((V) => g.indexOf(V)),
        prevLayout: C,
        trigger: "mouse-or-touch"
      });
      if (f.resizePreviewMode === "separator" && !e && !He(D, C)) {
        u.set(f, D);
        let V = 0;
        const O = g.map((N) => (V += D[N.id] - z[N.id], V * (m / 100)));
        c = c.map((N) => {
          if (N.axis !== f)
            return N;
          const H = O[N.itemIndex];
          return H === N.offset ? N : { ...N, offset: H };
        });
      }
      if (He(D, C) && v !== 0 && !w)
        switch (b) {
          case "horizontal": {
            a |= v < 0 ? rs : as;
            break;
          }
          case "vertical": {
            a |= v < 0 ? cs : ls;
            break;
          }
        }
      (f.resizePreviewMode !== "separator" || e) && !He(D, P) && Ke(h.axis, {
        defaultLayoutDeferred: L,
        derivedItemConstraints: W,
        axisSize: U,
        layout: D,
        requestedAxisSize: U,
        requestedLayout: D,
        separatorToItems: T
      });
    }
  });
  let d = 0;
  t.movementX === 0 ? d |= r & li : d |= a & li, t.movementY === 0 ? d |= r & ui : d |= a & ui;
  const p = l.state === "active" && (t.clientX !== l.pointerDownAtPoint.x || t.clientY !== l.pointerDownAtPoint.y);
  Ar(d, c, u, p);
}
function hs(e, t) {
  const n = Pe();
  if (n.state !== "active" || !Ut(n, e, t))
    return;
  const o = Je();
  En();
  try {
    Io({
      commit: !0,
      event: t,
      hitRegions: n.hitRegions,
      initialLayoutMap: n.initialLayoutMap,
      mountedAxes: o,
      pointerDownAtPoint: n.pointerDownAtPoint,
      prevCursorFlags: n.cursorFlags
    }), n.hitRegions.length > 0 && t.preventDefault?.(), fs(n, o);
  } finally {
    Rn();
  }
}
function mi(e) {
  if (e.defaultPrevented)
    return;
  const { clientX: t, clientY: n, movementX: o, movementY: i } = e;
  hs(e.currentTarget, {
    clientX: t,
    clientY: n,
    movementX: o,
    movementY: i
  });
}
function Xr(e, t, n) {
  let o, i = {
    x: 1 / 0,
    y: 1 / 0
  };
  for (const s of t) {
    const r = us(n, s.rect);
    switch (e) {
      case "horizontal": {
        (r.x < i.x || r.x === i.x && r.y <= i.y) && (o = s, i = r);
        break;
      }
      case "vertical": {
        (r.y < i.y || r.y === i.y && r.x <= i.x) && (o = s, i = r);
        break;
      }
    }
  }
  return o ? {
    distance: i,
    hitRegion: o
  } : void 0;
}
function Kr(e, t) {
  const { coarse: n, fine: o } = e.resizeTargetMinimumSize, i = Math.max(n, o), s = e.element.getBoundingClientRect();
  return t.x >= s.left - i && t.x <= s.right + i && t.y >= s.top - i && t.y <= s.bottom + i;
}
function ms(e) {
  return e !== null && typeof e == "object" && "nodeType" in e && e.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
}
function Jr(e, t) {
  if (e === t) throw new Error("Cannot compare node with itself");
  const n = {
    a: yi(e),
    b: yi(t)
  };
  let o;
  for (; n.a.at(-1) === n.b.at(-1); )
    o = n.a.pop(), n.b.pop();
  ae(
    o,
    "Stacking order can only be calculated for elements with a common ancestor"
  );
  const i = {
    a: bi(gi(n.a)),
    b: bi(gi(n.b))
  };
  if (i.a === i.b) {
    const s = o.childNodes, r = {
      a: n.a.at(-1),
      b: n.b.at(-1)
    };
    let a = s.length;
    for (; a--; ) {
      const l = s[a];
      if (l === r.a) return 1;
      if (l === r.b) return -1;
    }
  }
  return Math.sign(i.a - i.b);
}
const Zr = /\b(?:position|zIndex|opacity|transform|webkitTransform|mixBlendMode|filter|webkitFilter|isolation)\b/;
function Qr(e) {
  const t = getComputedStyle(gs(e) ?? e).display;
  return t === "flex" || t === "inline-flex";
}
function ea(e) {
  const t = getComputedStyle(e);
  return !!(t.position === "fixed" || t.zIndex !== "auto" && (t.position !== "static" || Qr(e)) || +t.opacity < 1 || "transform" in t && t.transform !== "none" || "webkitTransform" in t && t.webkitTransform !== "none" || "mixBlendMode" in t && t.mixBlendMode !== "normal" || "filter" in t && t.filter !== "none" || "webkitFilter" in t && t.webkitFilter !== "none" || "isolation" in t && t.isolation === "isolate" || Zr.test(t.willChange) || t.webkitOverflowScrolling === "touch");
}
function gi(e) {
  let t = e.length;
  for (; t--; ) {
    const n = e[t];
    if (ae(n, "Missing node"), ea(n)) return n;
  }
  return null;
}
function bi(e) {
  return e && Number(getComputedStyle(e).zIndex) || 0;
}
function yi(e) {
  const t = [];
  for (; e; )
    t.push(e), e = gs(e);
  return t;
}
function gs(e) {
  const { parentNode: t } = e;
  return ms(t) ? t.host : t;
}
function ta(e, t) {
  return e.x < t.x + t.width && e.x + e.width > t.x && e.y < t.y + t.height && e.y + e.height > t.y;
}
function na(e) {
  try {
    return e.matches(":modal");
  } catch {
    return !1;
  }
}
function oa({
  axisElement: e,
  hitRegion: t,
  pointerEventTarget: n
}) {
  if ($e(n)) {
    const o = n.closest("dialog");
    if (o && !o.contains(e) && na(o))
      return !1;
  }
  if (!$e(n) || n.contains(e) || e.contains(n) || !n.isConnected || !e.isConnected)
    return !0;
  if (Jr(n, e) > 0) {
    let o = n;
    for (; o; ) {
      if (o.contains(e))
        return !0;
      if (ta(o.getBoundingClientRect(), t))
        return !1;
      o = o.parentElement;
    }
  }
  return !0;
}
function Co(e, t, n) {
  const o = [];
  return t.forEach((i, s) => {
    if (s.disabled || s.element.ownerDocument !== n)
      return;
    const r = { x: e.clientX, y: e.clientY };
    if (!Kr(s, r))
      return;
    const a = So({ axis: s }), l = Xr(s.orientation, a, r);
    l && l.distance.x <= 0 && l.distance.y <= 0 && oa({
      axisElement: s.element,
      hitRegion: l.hitRegion.rect,
      pointerEventTarget: e.target
    }) && o.push(l.hitRegion);
  }), o;
}
function bs(e) {
  let t = 0, n = 0;
  const o = {};
  for (const s of e)
    if (s.defaultSize !== void 0) {
      t++;
      const r = we(s.defaultSize);
      n += r, o[s.itemId] = r;
    } else
      o[s.itemId] = void 0;
  const i = e.length - t;
  if (i !== 0) {
    const s = we((100 - n) / i);
    for (const r of e)
      r.defaultSize === void 0 && (o[r.itemId] = s);
  }
  return o;
}
function ia(e, t) {
  const n = e.map((i) => i.id), o = Object.keys(t);
  if (n.length !== o.length)
    return !1;
  for (const i of n)
    if (!o.includes(i))
      return !1;
  return !0;
}
function ys({
  axis: e,
  itemConstraints: t
}) {
  const n = e.items.map(({ id: i }) => i).join(","), o = e.mutableState.defaultLayout;
  return e.mutableState.layouts[n] ?? (o && ia(e.items, o) ? o : bs(t));
}
function Dn(e, t) {
  if (Object.keys(e).length !== Object.keys(t).length)
    return !1;
  for (const o in e)
    if (e[o] !== t[o])
      return !1;
  return !0;
}
function sa(e, t) {
  return e.length !== t.length ? !1 : e.every((n, o) => Dn(n, t[o]));
}
function tt({
  layout: e,
  itemConstraints: t
}) {
  const n = t.map(({ itemId: r }) => e[r]), o = [...n], i = o.reduce(
    (r, a) => r + a,
    0
  );
  if (Object.keys(e).length !== t.length)
    throw Error(
      `Invalid ${t.length} panel layout: ${Object.values(e).map((r) => `${r}%`).join(", ")}`
    );
  if (!me(i, 100) && o.length > 0)
    for (let r = 0; r < t.length; r++) {
      const a = o[r];
      ae(a != null, `No layout data found for index ${r}`);
      const l = 100 / i * a;
      o[r] = l;
    }
  let s = 0;
  for (let r = 0; r < t.length; r++) {
    const a = n[r];
    ae(a != null, `No layout data found for index ${r}`);
    const l = o[r];
    ae(l != null, `No layout data found for index ${r}`);
    const c = ut({
      overrideDisabledItems: !0,
      itemConstraints: t[r],
      prevSize: a,
      size: l
    });
    l != c && (s += l - c, o[r] = c);
  }
  if (!me(s, 0))
    for (let r = 0; r < t.length; r++) {
      const a = o[r];
      ae(a != null, `No layout data found for index ${r}`);
      const l = a + s, c = ut({
        overrideDisabledItems: !0,
        itemConstraints: t[r],
        prevSize: a,
        size: l
      });
      if (a !== c && (s -= c - a, o[r] = c, me(s, 0)))
        break;
    }
  return o.reduce((r, a, l) => (r[t[l].itemId] = a, r), {});
}
function vs({
  itemIds: e,
  layout: t
}) {
  return tt({
    layout: t,
    itemConstraints: e.map((n) => ({
      collapsedSize: 0,
      collapsible: !1,
      defaultSize: void 0,
      disabled: void 0,
      itemId: n,
      maxSize: 100,
      minSize: 0
    }))
  });
}
function ra({
  axis: e,
  nextAxisSize: t,
  prevAxisSize: n,
  prevLayout: o
}) {
  if (n <= 0 || t <= 0 || n === t)
    return o;
  let i = 0, s = 0, r = !1;
  const a = /* @__PURE__ */ new Map(), l = [];
  for (const d of e.items) {
    const p = o[d.id] ?? 0;
    switch (d.constraintProps.groupResizeBehavior) {
      case "preserve-pixel-size": {
        r = !0;
        const h = p / 100 * n, f = we(
          h / t * 100
        );
        a.set(d.id, f), i += f;
        break;
      }
      case "preserve-relative-size":
      default: {
        l.push(d.id), s += p;
        break;
      }
    }
  }
  if (!r || l.length === 0)
    return o;
  const c = 100 - i, u = { ...o };
  if (a.forEach((d, p) => {
    u[p] = d;
  }), s > 0)
    for (const d of l) {
      const p = o[d] ?? 0;
      u[d] = we(
        p / s * c
      );
    }
  else {
    const d = we(c / l.length);
    for (const p of l)
      u[p] = d;
  }
  return u;
}
function Lo({
  axis: e,
  axisState: t
}) {
  const n = qt({ axis: e });
  if (n === 0)
    return;
  const o = zo(e, n);
  let i = t.requestedAxisSize, s = t.requestedLayout;
  t.defaultLayoutDeferred && (i = n, s = vs({
    itemIds: e.items.map(({ id: c }) => c),
    layout: ys({
      axis: e,
      itemConstraints: o
    })
  }));
  const r = ra({
    axis: e,
    nextAxisSize: n,
    prevAxisSize: i,
    prevLayout: s
  }), a = tt({
    layout: r,
    itemConstraints: o
  });
  return {
    changed: t.defaultLayoutDeferred || !He(t.layout, a) || !sa(
      t.derivedItemConstraints,
      o
    ) || t.axisSize !== n,
    state: {
      defaultLayoutDeferred: !1,
      derivedItemConstraints: o,
      axisSize: n,
      layout: a,
      requestedAxisSize: i,
      requestedLayout: s,
      separatorToItems: t.separatorToItems
    }
  };
}
function Eo({
  axisId: e,
  itemId: t
}) {
  const n = () => {
    const c = Je();
    for (const [u, d] of c)
      if (u.id === e)
        return { axis: u, ...d };
    throw Error(`Group ${e} not found`);
  }, o = () => {
    const c = n().derivedItemConstraints.find(
      (u) => u.itemId === t
    );
    if (c !== void 0)
      return c;
    throw Error(`Panel constraints not found for Panel ${t}`);
  }, i = () => {
    const { axis: c, ...u } = n(), d = Lo({ axis: c, axisState: u }), p = d?.state ?? u, h = p.derivedItemConstraints.find(
      (m) => m.itemId === t
    );
    if (h === void 0)
      throw Error(`Panel constraints not found for Panel ${t}`);
    const f = p.layout[t];
    if (f === void 0)
      throw Error(`Layout not found for Panel ${t}`);
    return {
      axis: c,
      changed: d?.changed === !0,
      itemConstraints: h,
      itemSize: f,
      state: p
    };
  }, s = () => {
    const c = n().axis.items.find((u) => u.id === t);
    if (c !== void 0)
      return c;
    throw Error(`Layout not found for Panel ${t}`);
  }, r = () => {
    const c = n().layout[t];
    if (c !== void 0)
      return c;
    throw Error(`Layout not found for Panel ${t}`);
  }, a = ({
    allowPartialSize: c = !1,
    nextSize: u,
    items: d,
    prevLayout: p,
    derivedItemConstraints: h
  }) => {
    const f = p[t], m = d.findIndex((T) => T.id === t), b = m === 0, g = m === d.length - 1;
    if (g && u < f && (b || d.slice(0, m).every((T, C) => {
      const D = h[C];
      return D?.collapsible && me(D.collapsedSize, p[D.itemId]);
    }))) {
      const T = d.slice(0, m).reduce((C, D) => C + p[D.id], 0);
      return {
        ...p,
        [t]: we(100 - T)
      };
    }
    const v = h[m], z = ut({
      overrideDisabledItems: !0,
      itemConstraints: v,
      prevSize: f,
      size: u
    }), M = { ...p };
    let L = z - f;
    for (const T of b ? [1] : g ? [-1] : [1, -1])
      for (let C = m + T; C >= 0 && C < d.length && !me(L, 0); C += T) {
        const D = h[C], V = M[D.itemId];
        if (vn(D, M) || (L > 0 ? De(V, D.minSize) <= 0 : De(V, D.maxSize) >= 0))
          continue;
        const O = L > 0 ? Math.max(D.minSize, V - L) : Math.min(D.maxSize, V - L);
        L -= V - O, M[D.itemId] = we(O);
      }
    if (M[t] = we(z - L), me(L, 0) || c && De(M[t], v.minSize) >= 0)
      return M;
    const W = (T, C, D) => {
      const V = T === "after" ? 1 : -1, O = (H) => {
        for (let B = m + V; B >= 0 && B < d.length; B += V) {
          const I = h[B];
          if (!vn(I, C) && H(I))
            return B;
        }
      }, N = O(
        ({ itemId: H, maxSize: B, minSize: I }) => D > 0 ? De(C[H], I) > 0 : De(C[H], B) < 0
      ) ?? O(() => !0) ?? m + V;
      return Bt({
        delta: T === "after" ? D : -D,
        initialLayout: C,
        itemConstraints: h,
        pivotIndices: T === "after" ? [m, N] : [N, m],
        prevLayout: C,
        trigger: "imperative-api"
      });
    };
    if (b || g)
      return W(
        g ? "before" : "after",
        p,
        u - f
      );
    const U = (T) => {
      const C = W(T, p, u - f), D = u - C[t];
      return me(D, 0) ? C : W(
        T === "after" ? "before" : "after",
        C,
        D
      );
    }, P = U("after");
    if (vi({
      itemConstraints: h,
      itemId: t,
      nextLayout: P,
      prevLayout: p
    })) {
      const T = U("before");
      if (!vi({
        itemConstraints: h,
        itemId: t,
        nextLayout: T,
        prevLayout: p
      }))
        return T;
    }
    return P;
  }, l = (c, { axis: u, changed: d, itemSize: p, state: h }, { allowPartialSize: f = !1 } = {}) => {
    if (c === p)
      return;
    const { derivedItemConstraints: m, axisSize: b, layout: g } = h, w = a({
      allowPartialSize: f,
      nextSize: c,
      items: u.items,
      prevLayout: g,
      derivedItemConstraints: m
    }), v = tt({
      layout: w,
      itemConstraints: m
    });
    (d || !He(g, v)) && Ke(u, {
      ...h,
      layout: v,
      requestedAxisSize: b,
      requestedLayout: v
    });
  };
  return {
    collapse: () => {
      const c = i(), { collapsible: u, collapsedSize: d } = c.itemConstraints, { mutableValues: p } = s(), h = c.itemSize;
      u && h !== d && (p.expandToSize = h, l(d, c));
    },
    expand: () => {
      const c = i(), { collapsible: u, collapsedSize: d, minSize: p } = c.itemConstraints, { mutableValues: h } = s(), f = c.itemSize;
      if (u && f === d) {
        let m = h.expandToSize ?? p;
        m === 0 && (m = 1), l(m, c, { allowPartialSize: !0 });
      }
    },
    getSize: () => {
      const { axis: c } = n(), u = r(), { element: d } = s(), p = c.layoutStrategy ? c.layoutStrategy.getItemSizeInPixels(t) : c.orientation === "horizontal" ? d.offsetWidth : d.offsetHeight;
      return {
        asPercentage: u,
        inPixels: p
      };
    },
    isCollapsed: () => {
      const { collapsible: c, collapsedSize: u } = o(), d = r();
      return c && me(u, d);
    },
    resize: (c) => {
      const u = i(), { axisSize: d } = u.state, { element: p } = s(), h = lt({
        axisSize: d,
        itemElement: p,
        styleProp: c
      }), f = we(h / d * 100);
      l(f, u);
    }
  };
}
function vn({ collapsedSize: e, collapsible: t, itemId: n }, o) {
  return t && me(o[n], e);
}
function vi({
  itemConstraints: e,
  itemId: t,
  nextLayout: n,
  prevLayout: o
}) {
  return e.some(
    (i) => i.itemId !== t && vn(i, o) !== vn(i, n)
  );
}
function Si(e) {
  if (e.defaultPrevented)
    return;
  const t = Je();
  Co(
    e,
    t,
    e.currentTarget
  ).forEach((o) => {
    if (o.separator && !o.separator.disableDoubleClick) {
      const i = o.items.find(
        (s) => s.constraintProps.defaultSize !== void 0
      );
      if (i) {
        const s = i.constraintProps.defaultSize, r = Eo({
          axisId: o.axis.id,
          itemId: i.id
        });
        r && s !== void 0 && (r.resize(s), e.preventDefault());
      }
    }
  });
}
function wi({
  axis: e,
  axisState: t,
  delta: n,
  separator: o
}) {
  const i = t.separatorToItems.get(o);
  ae(i, "Matching panels not found");
  const s = i.map((c) => e.items.indexOf(c)), r = t.defaultLayoutDeferred ? {} : t.layout, a = Bt({
    delta: n,
    initialLayout: r,
    itemConstraints: t.derivedItemConstraints,
    pivotIndices: s,
    prevLayout: r,
    trigger: "keyboard"
  }), l = tt({
    layout: a,
    itemConstraints: t.derivedItemConstraints
  });
  He(r, l) || Ke(
    e,
    {
      defaultLayoutDeferred: t.defaultLayoutDeferred,
      derivedItemConstraints: t.derivedItemConstraints,
      axisSize: t.axisSize,
      layout: l,
      requestedAxisSize: t.axisSize,
      requestedLayout: l,
      separatorToItems: t.separatorToItems
    },
    // Keyboard resizes (arrow keys, Home/End, Enter collapse/expand) originate
    // from a real DOM event on the separator, so they are user interactions
    // just like pointer drags. This function is only reached from
    // onDocumentKeyDown. See #716.
    { isUserInteraction: !0 }
  );
}
function aa(e) {
  const t = Je();
  for (const [n] of t)
    if (n.separators.some(
      (o) => o.element === e
    ))
      return n;
  throw Error("Could not find parent Group for separator element");
}
function ca(e) {
  return e.separators.filter((t) => !t.disabled);
}
function xi(e) {
  if (e.defaultPrevented)
    return;
  const t = e.currentTarget, n = aa(t);
  if (n.disabled)
    return;
  const o = n.separators.find(
    (s) => s.element === t
  );
  if (ae(o, "Matching separator not found"), o.disabled)
    return;
  const i = (s) => wi({
    axis: n,
    axisState: Re(n.id, !0),
    delta: s,
    separator: o
  });
  switch (e.key) {
    case "ArrowDown": {
      e.preventDefault(), n.orientation === "vertical" && i(5);
      break;
    }
    case "ArrowLeft": {
      e.preventDefault(), n.orientation === "horizontal" && i(-5);
      break;
    }
    case "ArrowRight": {
      e.preventDefault(), n.orientation === "horizontal" && i(5);
      break;
    }
    case "ArrowUp": {
      e.preventDefault(), n.orientation === "vertical" && i(-5);
      break;
    }
    case "End": {
      e.preventDefault(), i(100);
      break;
    }
    case "Enter": {
      e.preventDefault();
      const s = Re(n.id, !0), { derivedItemConstraints: r, layout: a, separatorToItems: l } = s, c = l.get(o);
      ae(c, "Matching panels not found");
      const u = c[0], d = r.find(
        (p) => p.itemId === u.id
      );
      if (ae(d, "Panel metadata not found"), d.collapsible) {
        const p = a[u.id], h = d.collapsedSize === p ? n.mutableState.expandedItemSizes[u.id] ?? d.minSize : d.collapsedSize;
        wi({
          axis: n,
          axisState: s,
          delta: h - p,
          separator: o
        });
      }
      break;
    }
    case "F6": {
      e.preventDefault();
      const s = ca(n).map(
        (c) => c.element
      ), r = s.findIndex(
        (c) => c === e.currentTarget
      );
      ae(r !== -1, "Index not found");
      const a = e.shiftKey ? r > 0 ? r - 1 : s.length - 1 : r + 1 < s.length ? r + 1 : 0;
      s[a].focus({
        preventScroll: !0
      });
      break;
    }
    case "Home": {
      e.preventDefault(), i(-100);
      break;
    }
  }
}
function Dt(e, t) {
  const n = Pe();
  if (n.state !== "active" || !Ut(n, e, t))
    return !1;
  const o = Je();
  En();
  try {
    n.previewLayoutMap.forEach((i, s) => {
      const r = o.get(s);
      s.resizePreviewMode === "separator" && r && !He(i, r.layout) && Ke(s, {
        ...r,
        layout: i,
        requestedAxisSize: r.axisSize,
        requestedLayout: i
      });
    }), fs(n, o);
  } finally {
    Rn();
  }
  return !0;
}
function zi(e) {
  const t = Pe();
  if (t.state !== "active")
    return;
  const n = t.hitRegions.flatMap(
    ({ separator: o }) => o ? [o.element] : []
  );
  !n.some((o) => o === e.target) || n.some(
    (o) => o.hasPointerCapture?.(e.pointerId)
  ) || Dt(e.currentTarget, e);
}
function Ti(e) {
  Dt(e.currentTarget, e);
}
function la(e, t) {
  const { element: n, orientation: o, items: i } = e, s = n.getBoundingClientRect(), r = o === "horizontal";
  return So({
    expandHitTargets: !1,
    axis: e,
    includeDisabled: !0
  }).map(({ items: l, rect: c, separator: u }, d) => {
    const p = i.indexOf(l[0]), h = r ? c.left + c.width / 2 : c.top + c.height / 2;
    return {
      active: t.some((m) => {
        if (m.axis !== e || m.items[0] !== l[0])
          return !1;
        if (u || m.separator)
          return m.separator === u;
        const b = r ? m.rect.left + m.rect.width / 2 : m.rect.top + m.rect.height / 2;
        return me(h, b);
      }),
      axis: e,
      key: u ? `separator-${u.id}` : `panel-${l[0].id}-${d}`,
      offset: 0,
      itemIndex: p,
      rect: new DOMRect(
        (r && !u ? h : c.left) - s.left - n.clientLeft + n.scrollLeft,
        (!r && !u ? h : c.top) - s.top - n.clientTop + n.scrollTop,
        r && !u ? 0 : c.width,
        !r && !u ? 0 : c.height
      ),
      separator: u
    };
  });
}
function Ii(e) {
  if (e.defaultPrevented)
    return;
  if (e.pointerType === "mouse" && e.button > 0)
    return;
  const t = Pe();
  if (t.state === "active") {
    ps(t, e) && Dt(
      t.ownerDocument,
      t
    );
    return;
  }
  const n = Je(), o = Co(
    e,
    n,
    e.currentTarget
  );
  if (o.length === 0)
    return;
  const i = /* @__PURE__ */ new Map();
  let s = !1;
  o.forEach((a) => {
    a.separator && (s || (s = !0, a.separator.element.focus({
      // @ts-expect-error https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#browser_compatibility
      focusVisible: !1,
      preventScroll: !0
    })));
    const l = n.get(a.axis);
    l && i.set(a.axis, l.layout);
  });
  const r = Array.from(i.keys()).flatMap(
    (a) => a.resizePreviewMode === "separator" ? la(a, o) : []
  );
  Xe({
    cursorFlags: 0,
    didPointerMove: !1,
    hitRegions: o,
    initialLayoutMap: i,
    ownerDocument: e.currentTarget,
    pointerDownAtPoint: { x: e.clientX, y: e.clientY },
    pointerId: e.pointerId,
    pointerType: e.pointerType,
    previewLayoutMap: new Map(i),
    previews: r,
    state: "active"
  }), e.preventDefault();
}
function Ci(e) {
  const t = e.currentTarget, n = Je(), o = Pe();
  switch (o.state) {
    case "active": {
      if (!Ut(o, t, e))
        return;
      Io({
        commit: !1,
        event: e,
        hitRegions: o.hitRegions,
        initialLayoutMap: o.initialLayoutMap,
        mountedAxes: n,
        prevCursorFlags: o.cursorFlags
      });
    }
  }
}
function ua(e, t) {
  if (e.length !== t.length)
    return !1;
  for (let n = 0; n < e.length; n++) {
    const o = e[n], i = t[n];
    if (o.axis !== i.axis || o.separator !== i.separator || o.items[0] !== i.items[0] || o.items[1] !== i.items[1])
      return !1;
  }
  return !0;
}
function Li(e) {
  if (e.defaultPrevented)
    return;
  const t = e.currentTarget, n = Pe(), o = Je();
  switch (n.state) {
    case "active": {
      if (!Ut(n, t, e))
        return;
      if (
        // Skip this check for "pointerleave" events, else Firefox triggers a false positive (see #514)
        e.buttons === 0
      ) {
        Dt(t, e);
        return;
      }
      for (const i of n.hitRegions)
        if (i.separator) {
          const { element: s } = i.separator;
          s.isConnected && !s.hasPointerCapture?.(e.pointerId) && s.setPointerCapture?.(e.pointerId);
        }
      Io({
        commit: !1,
        event: e,
        hitRegions: n.hitRegions,
        initialLayoutMap: n.initialLayoutMap,
        mountedAxes: o,
        pointerDownAtPoint: n.pointerDownAtPoint,
        prevCursorFlags: n.cursorFlags
      });
      break;
    }
    default: {
      const i = Co(
        e,
        o,
        t
      );
      i.length === 0 ? n.state !== "inactive" && Xe({
        cursorFlags: 0,
        state: "inactive"
      }) : (n.state !== "hover" || n.ownerDocument !== t || !ua(n.hitRegions, i)) && Xe({
        cursorFlags: 0,
        hitRegions: i,
        ownerDocument: t,
        state: "hover"
      });
      break;
    }
  }
}
function Ei(e) {
  const t = e.relatedTarget;
  if ($e(t) && t.localName === "iframe") {
    const n = Pe();
    switch (n.state) {
      case "hover":
        n.ownerDocument === e.currentTarget && Xe({
          cursorFlags: 0,
          state: "inactive"
        });
    }
  }
}
function Ri(e) {
  e.defaultPrevented || e.pointerType === "mouse" && e.button > 0 || hs(e.currentTarget, e);
}
function Di(e) {
  e.target === e.currentTarget && Dt(e.currentTarget.document);
}
function Mi(e) {
  Dt(e.currentTarget.document);
}
function da(e, t, n) {
  const o = n[0];
  if (!o)
    return;
  const i = e.items.find((d) => d.element === t);
  if (!i || !i.onResize)
    return;
  const s = qt({ axis: e }), r = e.orientation === "horizontal" ? i.element.offsetWidth : i.element.offsetHeight, a = e.orientation === "horizontal" ? o.inlineSize : o.blockSize, l = Number.isFinite(a) && a > 0 && Math.abs(a - r) < 1 ? a : r, c = i.mutableValues.prevSize, u = {
    asPercentage: we(l / s * 100),
    // Rounded, for compatibility
    inPixels: r
  };
  i.mutableValues.prevSize = u, i.onResize(u, i.id, c);
}
const vt = /* @__PURE__ */ new Map();
let Pi = !1;
function Ss(e) {
  let t = !0;
  ae(
    e.element.ownerDocument.defaultView,
    "Cannot register an unmounted Group"
  );
  const n = e.element.ownerDocument.defaultView.ResizeObserver, o = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), s = new n((f) => {
    let m;
    En();
    try {
      for (const b of f) {
        const { borderBoxSize: g, target: w } = b;
        if (w === e.element) {
          if (t) {
            const v = Re(e.id);
            if (!v)
              break;
            const z = Lo({ axis: e, axisState: v });
            if (!z)
              break;
            if (!z.changed)
              continue;
            Ke(e, z.state);
          }
        } else
          try {
            da(e, w, g);
          } catch (v) {
            m ??= { error: v };
          }
      }
    } finally {
      Rn();
    }
    if (m)
      throw m.error;
  });
  s.observe(e.element), e.items.forEach((f) => {
    ae(
      !o.has(f.id),
      `Panel ids must be unique; id "${f.id}" was used more than once`
    ), o.add(f.id), f.onResize && s.observe(f.element);
  });
  const r = qt({ axis: e }), a = zo(e, r), l = ys({
    axis: e,
    itemConstraints: a
  }), c = tt({
    layout: l,
    itemConstraints: a
  }), u = e.element.ownerDocument, d = u.defaultView;
  vt.set(
    u,
    (vt.get(u) ?? 0) + 1
  );
  const p = /* @__PURE__ */ new Map();
  return So({ axis: e, includeDisabled: !0 }).forEach((f) => {
    f.separator && p.set(f.separator, f.items);
  }), Ke(e, {
    defaultLayoutDeferred: r === 0,
    derivedItemConstraints: a,
    axisSize: r,
    layout: c,
    requestedAxisSize: r,
    requestedLayout: vs({
      itemIds: e.items.map(({ id: f }) => f),
      layout: l
    }),
    separatorToItems: p
  }), e.separators.forEach((f) => {
    ae(
      !i.has(f.id),
      `Separator ids must be unique; id "${f.id}" was used more than once`
    ), i.add(f.id), f.element.addEventListener("keydown", xi);
  }), Pi || (Pi = !0, Ln(Br)), vt.get(u) === 1 && (u.addEventListener("contextmenu", mi, !0), u.addEventListener("dblclick", Si, !0), u.addEventListener(
    "lostpointercapture",
    zi,
    !0
  ), u.addEventListener(
    "pointercancel",
    Ti,
    !0
  ), u.addEventListener("pointerdown", Ii, !0), u.addEventListener("pointerleave", Ci), u.addEventListener("pointermove", Li), u.addEventListener("pointerout", Ei), u.addEventListener("pointerup", Ri, !0), d?.addEventListener("blur", Di), d?.addEventListener("pagehide", Mi)), function() {
    t = !1, vt.set(
      u,
      Math.max(0, (vt.get(u) ?? 0) - 1)
    ), qr(e), Or(e), e.separators.forEach((m) => {
      m.element.removeEventListener("keydown", xi);
    }), vt.get(u) || (u.removeEventListener(
      "contextmenu",
      mi,
      !0
    ), u.removeEventListener(
      "dblclick",
      Si,
      !0
    ), u.removeEventListener(
      "lostpointercapture",
      zi,
      !0
    ), u.removeEventListener(
      "pointercancel",
      Ti,
      !0
    ), u.removeEventListener(
      "pointerdown",
      Ii,
      !0
    ), u.removeEventListener("pointerleave", Ci), u.removeEventListener("pointermove", Li), u.removeEventListener("pointerout", Ei), u.removeEventListener("pointerup", Ri, !0), d?.removeEventListener("blur", Di), d?.removeEventListener("pagehide", Mi)), s.disconnect();
  };
}
function hn({
  axisId: e
}) {
  const t = () => {
    const n = Je();
    for (const [o, i] of n)
      if (o.id === e)
        return { axis: o, ...i };
    throw Error(`Could not find Group with id "${e}"`);
  };
  return {
    getLayout() {
      const { defaultLayoutDeferred: n, layout: o } = t();
      return n ? {} : o;
    },
    setLayout(n) {
      const { axis: o, ...i } = t(), s = Lo({ axis: o, axisState: i }), r = s?.state ?? i, {
        defaultLayoutDeferred: a,
        derivedItemConstraints: l,
        axisSize: c,
        layout: u
      } = r, d = tt({
        layout: n,
        itemConstraints: l
      });
      return a ? u : ((s?.changed || !He(u, d)) && Ke(o, {
        ...r,
        layout: d,
        requestedAxisSize: c,
        requestedLayout: d
      }), d);
    }
  };
}
function ws({
  derivedItemConstraints: e,
  axis: t,
  layout: n,
  prevLayout: o,
  requestedLayout: i
}) {
  const s = t.items.map(({ id: r }) => r).join(",");
  t.mutableState.layouts[s] = i, o && e.forEach((r) => {
    if (r.collapsible) {
      const a = me(
        r.collapsedSize,
        n[r.itemId]
      ), l = me(
        r.collapsedSize,
        o[r.itemId]
      );
      a && !l && (t.mutableState.expandedItemSizes[r.itemId] = o[r.itemId]);
    }
  });
}
function xs() {
  const [e, t] = oe({}), n = te(() => t({}), []);
  return [e, n];
}
function zs({
  initialLayout: e,
  layoutsEqual: t,
  onLayoutChange: n,
  onLayoutChanged: o
}) {
  const i = J({
    onLayoutChange: e,
    onLayoutChanged: e
  }), s = Se((a) => {
    t(i.current.onLayoutChange, a) || (i.current.onLayoutChange = a, n?.(a));
  }), r = Se(
    (a, l, c) => {
      t(i.current.onLayoutChanged, a) || (i.current.onLayoutChanged = a, o?.(a, { isUserInteraction: l, requestedLayout: c }));
    }
  );
  return { onLayoutChangeStable: s, onLayoutChangedStable: r };
}
function Sn({
  isCompleted: e,
  isUserInteraction: t,
  layout: n,
  onLayoutChange: o,
  onLayoutChanged: i,
  requestedLayout: s
}) {
  try {
    o(n);
  } finally {
    e && i(n, t, s);
  }
}
function Mn(e) {
  const t = J({ ...e });
  return ue(() => {
    for (const n in e)
      t.current[n] = e[n];
  }, [e]), t.current;
}
const Ro = Ge(null), xt = ["column", "row"], Pn = Ge(null);
function cn(e) {
  return e === "column" ? "columns" : "rows";
}
function fa({
  layout: e,
  itemConstraints: t,
  itemId: n,
  itemIndex: o
}) {
  let i, s;
  const r = e[n], a = t.find(
    (l) => l.itemId === n
  );
  if (a) {
    const l = a.maxSize, c = a.collapsible ? a.collapsedSize : a.minSize, u = [o, o + 1];
    s = tt({
      layout: Bt({
        delta: c - r,
        initialLayout: e,
        itemConstraints: t,
        pivotIndices: u,
        prevLayout: e
      }),
      itemConstraints: t
    })[n], i = tt({
      layout: Bt({
        delta: l - r,
        initialLayout: e,
        itemConstraints: t,
        pivotIndices: u,
        prevLayout: e
      }),
      itemConstraints: t
    })[n];
  }
  return {
    valueControls: n,
    valueMax: i,
    valueMin: s,
    valueNow: r
  };
}
function Ts({
  attributes: e,
  axisId: t,
  axisOrientation: n,
  children: o,
  className: i,
  "data-testid": s,
  disableCursor: r,
  disabled: a,
  disableDoubleClick: l,
  elementRef: c,
  id: u,
  isSharedHitRegion: d,
  preview: p,
  registerSeparator: h,
  requiredStyle: f,
  style: m,
  styleDefaults: b,
  tabIndex: g = 0,
  updateSeparatorProps: w
}) {
  const v = Mn({
    disabled: a,
    disableDoubleClick: l,
    children: o,
    className: i,
    preview: p,
    style: m
  }), [z, M] = oe({}), [L, W] = oe("inactive"), [U, P] = oe(!1), T = J(null), C = J(null), D = it(T, c), V = n === "horizontal" ? "vertical" : "horizontal";
  ue(() => {
    const H = T.current;
    if (H !== null) {
      const B = {
        disabled: v.disabled,
        disableDoubleClick: v.disableDoubleClick,
        element: H,
        id: u,
        get children() {
          return v.children;
        },
        get className() {
          return v.className;
        },
        get preview() {
          return v.preview;
        },
        get style() {
          return v.style;
        }
      };
      C.current = B;
      const I = h(B), G = Ln(
        (se) => {
          W(
            se.next.state !== "inactive" && se.next.hitRegions.some(
              (ie) => ie.separator === B || (d?.(ie) ?? !1)
            ) ? se.next.state : "inactive"
          );
        }
      ), _ = Et(
        t,
        (se) => {
          const { derivedItemConstraints: ie, layout: re, separatorToItems: Q } = se.next, ce = Q.get(B);
          if (ce) {
            const E = ce[0], q = ie.findIndex(
              (k) => k.itemId === E.id
            ), { layoutStrategy: R } = se.axis, S = {
              ...fa({
                layout: re,
                itemConstraints: ie,
                itemId: E.id,
                itemIndex: q
              }),
              // Items without DOM elements of their own (e.g. Grid tracks) control other elements
              ...R?.getItemAriaControls && {
                valueControls: R.getItemAriaControls(
                  E.id
                )
              }
            };
            M(
              (k) => Dn(k, S) ? k : S
            );
          }
        }
      );
      return () => {
        C.current = null, G(), _(), I();
      };
    }
  }, [t, u, d, h, v]), ue(() => {
    const H = C.current;
    H && kr(H);
  }, [p]), Be(() => {
    w(u, { disabled: a, disableDoubleClick: l });
  }, [a, l, u, w]);
  let O;
  a && !r && (O = "not-allowed");
  let N;
  if (a)
    N = "disabled";
  else
    switch (L) {
      case "active": {
        N = "active";
        break;
      }
      default:
        U ? N = "focus" : N = L;
    }
  return /* @__PURE__ */ j(
    "div",
    {
      ...e,
      "aria-controls": z.valueControls,
      "aria-disabled": a || void 0,
      "aria-orientation": V,
      "aria-valuemax": z.valueMax,
      "aria-valuemin": z.valueMin,
      "aria-valuenow": z.valueNow,
      children: o,
      className: i,
      "data-separator": N,
      "data-testid": s,
      id: u,
      onBlur: () => P(!1),
      onFocus: () => P(!0),
      ref: D,
      role: "separator",
      style: {
        ...b,
        cursor: O,
        ...m,
        ...f,
        // Inform the browser that the library is handling touch events for this element
        // See github.com/bvaughn/react-resizable-panels/issues/662
        touchAction: "none"
      },
      tabIndex: a ? void 0 : g
    }
  );
}
function Ot(e) {
  return e === "column" ? "row" : "column";
}
function pa(e) {
  const {
    children: t,
    className: n,
    disabled: o,
    elementRef: i,
    style: s,
    type: r
  } = e, [a, l, c] = e.type === "column" ? [e.column, e.row, e.rowSpan] : [e.row, e.column, e.columnSpan], u = l ?? 0, d = ft(void 0), {
    getDisableCursor: p,
    getResizeAxisId: h,
    gutters: f,
    registerSeparator: m,
    separatorPlacements: b,
    trackCounts: g,
    updateSeparatorProps: w
  } = is(), v = h(r), z = Ot(r), M = g[z], L = !!o || !bo(a, g[r]);
  let W = !0;
  for (const D of b.values())
    if (D.axis === r && D.index === a && !D.disabled && D.crossStart < u) {
      W = !1;
      break;
    }
  const U = te(
    (D) => D.axis.id === v && D.axis.items.indexOf(D.items[1]) === a,
    [v, a]
  ), P = te(
    (D) => m(
      {
        axis: r,
        crossSpan: c,
        crossStart: u,
        disabled: !!o,
        index: a
      },
      D
    ),
    [r, c, u, o, a, m]
  ), T = Lr(a), C = Er({
    crossCount: M,
    crossSpan: c,
    crossStart: u,
    hasGutters: f[z]
  });
  return /* @__PURE__ */ j(
    Ts,
    {
      axisId: v,
      axisOrientation: r === "column" ? "horizontal" : "vertical",
      className: n,
      disableCursor: p(),
      disabled: L,
      disableDoubleClick: void 0,
      elementRef: i,
      id: d,
      isSharedHitRegion: U,
      registerSeparator: P,
      requiredStyle: {
        gridColumn: r === "column" ? T : C,
        gridRow: r === "row" ? T : C
      },
      style: s,
      tabIndex: W ? 0 : -1,
      updateSeparatorProps: w,
      children: t
    }
  );
}
const ha = /* @__PURE__ */ Object.assign(pa, {
  displayName: "Gridline"
});
function Is(e, t) {
  xr.forEach(e, (n) => {
    if (ns(n))
      if (n.type === ha) {
        const { type: o } = n.props;
        o === "column" ? t.column = !0 : o === "row" && (t.row = !0);
      } else // Fragments
      typeof n.type == "symbol" && n.props !== null && typeof n.props == "object" && "children" in n.props && Is(n.props.children, t);
  });
}
function ma(e, t) {
  if (t)
    return e.map(
      (s) => `minmax(0, ${t[s.id] ?? 1}fr)`
    );
  const n = e.map(
    (s) => s.defaultSize === void 0 ? void 0 : xo(s.defaultSize)
  );
  let o = 100, i = 0;
  return n.forEach((s) => {
    s === void 0 ? i++ : s[1] === "%" && (o -= s[0]);
  }), n.map((s) => {
    if (s === void 0)
      return `minmax(0, ${Math.max(0, o) / Math.max(1, i)}fr)`;
    const [r, a] = s;
    return a === "%" ? `minmax(0, ${r}fr)` : `${r}${a}`;
  });
}
function ga({
  cells: e,
  separatorPlacements: t,
  trackCounts: n
}) {
  const o = [];
  for (const a of e)
    xt.forEach((l) => {
      const [c, u] = Lt(a, l), d = n[l];
      (!Number.isInteger(c) || !Number.isInteger(u) || c < 0 || u < 1 || c + u > d) && o.push(
        `Invalid Cell ${l} placement (${l}: ${c}, ${l}Span: ${u}); Grid has ${d} ${l}s`
      );
    });
  const i = ({
    axis: a,
    crossSpan: l,
    crossStart: c,
    disabled: u,
    index: d
  }) => {
    const p = Ot(a);
    let h = `type="${a}" ${a}={${d}}`;
    return (c !== 0 || l !== void 0) && (h += ` ${p}={${c}}`), l !== void 0 && (h += ` ${p}Span={${l}}`), u && (h += " disabled"), `<Gridline ${h} />`;
  }, s = Array.from(t.values()).filter(
    (a) => {
      const { axis: l, crossSpan: c, crossStart: u, index: d } = a, p = Ot(l), h = n[l], f = n[p];
      let m = !0;
      return bo(d, h) || (o.push(
        `Invalid ${l} Gridline ${l} (${d}); must be between 1 and ${h - 1}`
      ), m = !1), !Number.isInteger(u) || u < 0 || u >= f ? (o.push(
        `Invalid ${l} Gridline ${p} (${u}); must be between 0 and ${f - 1}`
      ), m = !1) : c !== void 0 && (!Number.isInteger(c) || c < 1 || u + c > f) && (o.push(
        `Invalid ${l} Gridline ${p}Span (${c}); Grid has ${f} ${p}s`
      ), m = !1), m;
    }
  ), r = (a) => {
    const l = n[Ot(a.axis)];
    return [
      a.crossStart,
      a.crossSpan === void 0 ? l : a.crossStart + a.crossSpan
    ];
  };
  return s.forEach((a, l) => {
    const { axis: c, index: u } = a, [d, p] = r(a);
    for (const h of e) {
      const [f, m, b, g] = Lt(
        h,
        c
      );
      if (f < u && u < f + m && b < p && d < b + g) {
        const w = Ot(c);
        o.push(
          `${i(a)} overlaps a Cell that spans across it (${c}: ${f}, ${c}Span: ${m}, ${w}: ${b}, ${w}Span: ${g}); use the ${w} and ${w}Span props to render gridlines beside the Cell instead`
        );
      }
    }
    for (const h of s.slice(l + 1))
      if (h.axis === c && h.index === u) {
        const [f, m] = r(h);
        f < p && d < m && o.push(`${i(a)} overlaps ${i(h)}`);
      }
  }), o;
}
function ba(e, t) {
  return He(e.columns, t.columns) && He(e.rows, t.rows);
}
const ya = { columns: {}, rows: {} };
function va({
  children: e,
  className: t,
  columns: n,
  defaultLayout: o,
  disableCursor: i,
  disabled: s,
  elementRef: r,
  gridRef: a,
  id: l,
  onLayoutChange: c,
  onLayoutChanged: u,
  resizeTargetMinimumSize: d = {
    coarse: 20,
    fine: 10
  },
  rows: p,
  style: h,
  ...f
}) {
  const m = ft(l), b = te(
    (R) => `${m}:${cn(R)}`,
    [m]
  ), g = Ai(n, "columns"), w = Ai(p, "rows"), v = (R) => R === "column" ? g : w, { onLayoutChangeStable: z, onLayoutChangedStable: M } = zs({
    initialLayout: ya,
    layoutsEqual: ba,
    onLayoutChange: c,
    onLayoutChanged: u
  }), L = J(null), W = it(L, r), [U, P] = xs(), T = J({
    cells: [],
    column: { expandedItemSizes: {}, layouts: {} },
    loggedErrors: /* @__PURE__ */ new Set(),
    row: { expandedItemSizes: {}, layouts: {} },
    separators: /* @__PURE__ */ new Map()
  }), C = { column: !1, row: !1 };
  for (const R of T.current.separators.values())
    C[R.axis] = !0;
  Is(e, C);
  const D = Mn({
    defaultLayout: o,
    disableCursor: i,
    resizeTargetMinimumSize: d
  }), V = Se(() => !!D.disableCursor), O = te(
    (R) => {
      const S = T.current;
      return S.cells = [...S.cells, R], P(), () => {
        S.cells = S.cells.filter(
          (k) => k !== R
        ), P();
      };
    },
    [P]
  ), N = te(
    (R, S) => {
      const k = T.current;
      return k.separators = new Map(k.separators), k.separators.set(S, R), P(), () => {
        k.separators = new Map(k.separators), k.separators.delete(S), P();
      };
    },
    [P]
  ), H = te(
    (R, {
      disabled: S,
      disableDoubleClick: k
    }) => {
      for (const A of T.current.separators.keys())
        A.id === R && (A.disabled = S, A.disableDoubleClick = k);
    },
    []
  ), B = T.current.separators, I = pe(
    () => ({
      getDisableCursor: V,
      getResizeAxisId: b,
      gutters: {
        column: C.column,
        row: C.row
      },
      registerCell: O,
      registerSeparator: N,
      separatorPlacements: B,
      trackCounts: {
        column: g.length,
        row: w.length
      },
      updateSeparatorProps: H
    }),
    [
      g.length,
      V,
      b,
      C.column,
      C.row,
      O,
      N,
      w.length,
      B,
      H
    ]
  ), G = J([]);
  ue(() => {
    const R = L.current;
    if (R === null)
      return;
    const S = T.current;
    if (process.env.NODE_ENV !== "production") {
      const K = ga({
        cells: S.cells,
        separatorPlacements: S.separators,
        trackCounts: { column: g.length, row: w.length }
      });
      K.forEach((ne) => {
        S.loggedErrors.has(ne) || console.error(ne);
      }), S.loggedErrors = new Set(K);
    }
    const k = (K) => Array.from(S.separators.entries()).filter(([, ne]) => ne.axis === K).sort(([, ne], [, Le]) => ne.index - Le.index).map(([ne]) => ne), A = (K) => {
      const [ne, Le] = K === "column" ? [g, w] : [w, g], xe = ne.map((le) => le.id), Ne = b(K), he = k(K), Te = he.length > 0, ge = ne.map(
        ({ id: le, ...ze }, Ie) => ({
          // Tracks don't have DOM elements of their own;
          // the Grid element is used to resolve relative size constraints (e.g. "em")
          element: R,
          id: xe[Ie],
          idIsStable: !0,
          mutableValues: {
            expandToSize: void 0,
            prevSize: void 0
          },
          onResize: void 0,
          constraintProps: ze
        })
      ), _e = () => {
        const le = [];
        if (Te) {
          for (const [ze, Ie] of S.separators)
            if (Ie.axis === K && bo(Ie.index, ne.length)) {
              const We = ze.element.getBoundingClientRect();
              le[Ie.index] = Math.max(
                le[Ie.index] ?? 0,
                K === "column" ? We.width : We.height
              );
            }
        }
        return le.filter((ze) => ze !== void 0);
      }, Ae = () => Pr({
        axis: K,
        element: R,
        getGutterSizes: _e,
        hasGutters: Te,
        layout: Re(Ne)?.layout,
        trackIds: xe
      });
      let ke;
      const de = () => {
        const { cells: le } = S;
        return ke?.cells !== le && (ke = { ariaControls: void 0, cells: le, slots: void 0 }), ke;
      }, pt = () => {
        const le = de();
        if (!le.ariaControls) {
          const ze = xe.map(() => []);
          for (const Ie of le.cells) {
            const [We, Zt] = Lt(Ie, K);
            if (Ie.element.id)
              for (let gt = Math.max(0, We); gt < Math.min(xe.length, We + Zt); gt++)
                ze[gt].push(Ie.element.id);
          }
          le.ariaControls = new Map(
            xe.map((Ie, We) => [
              Ie,
              ze[We].join(" ") || void 0
            ])
          );
        }
        return le.ariaControls;
      }, ht = () => {
        const le = de();
        return le.slots ??= ss({
          axis: K,
          cells: le.cells,
          crossTrackCount: Le.length,
          trackCount: ne.length
        }), le.slots;
      };
      let mt;
      const at = D.defaultLayout?.[cn(K)];
      if (at !== void 0 && Object.keys(at).length === xe.length) {
        mt = {};
        for (const le of xe) {
          const ze = at[le];
          ze !== void 0 && (mt[le] = ze);
        }
      }
      return {
        disabled: !!s,
        element: R,
        id: Ne,
        layoutStrategy: {
          getItemAriaControls: (le) => pt().get(le),
          calculateAvailableSize: () => Ae().availableSize,
          calculateHitRegions: ({
            expandHitTargets: le,
            axis: ze,
            includeDisabled: Ie
          }) => Mr({
            axis: K,
            cells: S.cells,
            crossTrackCount: Le.length,
            expandHitTargets: le,
            getAxisSize: () => Ae().availableSize * ye(ze.element, ze.orientation),
            getSlots: ht,
            includeDisabled: Ie,
            resizeAxis: ze,
            separatorPlacements: S.separators
          }),
          getItemSizeInPixels: (le) => Ae().trackSizes[xe.indexOf(le)] ?? 0
        },
        mutableState: {
          defaultLayout: mt,
          disableCursor: !!D.disableCursor,
          expandedItemSizes: S[K].expandedItemSizes,
          layouts: S[K].layouts
        },
        orientation: K === "column" ? "horizontal" : "vertical",
        items: ge,
        resizePreviewMode: "panel",
        get resizeTargetMinimumSize() {
          return D.resizeTargetMinimumSize;
        },
        separators: he
      };
    }, F = xt.map(A);
    G.current = F;
    const Y = F.map((K) => Ss(K)), X = () => {
      const [K, ne] = F.map(
        (Le) => Re(Le.id)
      );
      if (!(!K || !ne || K.defaultLayoutDeferred || ne.defaultLayoutDeferred))
        return {
          layout: { columns: K.layout, rows: ne.layout },
          requestedLayout: {
            columns: K.requestedLayout,
            rows: ne.requestedLayout
          }
        };
    };
    {
      const K = X();
      if (K)
        try {
          Sn({
            isCompleted: !0,
            // Initial mount is not a user interaction (#716).
            isUserInteraction: !1,
            layout: K.layout,
            onLayoutChange: z,
            onLayoutChanged: M,
            requestedLayout: K.requestedLayout
          });
        } catch (ne) {
          throw G.current = [], Y.forEach((Le) => Le()), ne;
        }
    }
    const Z = F.map(
      (K) => Et(K.id, (ne) => {
        const {
          defaultLayoutDeferred: Le,
          derivedItemConstraints: xe,
          layout: Ne,
          requestedLayout: he
        } = ne.next;
        if (Le || xe.length === 0)
          return;
        ws({
          derivedItemConstraints: xe,
          axis: K,
          layout: Ne,
          prevLayout: ne.prev?.layout,
          requestedLayout: he
        });
        const Te = X();
        if (Te) {
          const ge = Pe(), _e = ge.state !== "active" || !ge.hitRegions.some(
            (Ae) => F.includes(Ae.axis)
          );
          Sn({
            isCompleted: _e,
            isUserInteraction: ne.isUserInteraction,
            layout: Te.layout,
            onLayoutChange: z,
            onLayoutChanged: M,
            requestedLayout: Te.requestedLayout
          });
        }
      })
    );
    return () => {
      G.current = [], Y.forEach((K) => K()), Z.forEach((K) => K());
    };
  }, [
    g,
    s,
    b,
    m,
    M,
    z,
    w,
    U,
    D
  ]), Be(() => {
    G.current.forEach((R) => {
      R.mutableState.defaultLayout = o?.[R.orientation === "horizontal" ? "columns" : "rows"], R.mutableState.disableCursor = !!i;
    });
  });
  const _ = pe(() => {
    const R = () => {
      const [A, F] = xt.map(b);
      return !zt(A) || !zt(F) ? { columns: {}, rows: {} } : {
        columns: hn({
          axisId: A
        }).getLayout(),
        rows: hn({ axisId: F }).getLayout()
      };
    }, S = (A) => A.map((F) => `"${F}"`).join(", "), k = (A, F) => {
      const Y = b(A), X = () => {
        const Z = zt(Y);
        return ae(Z, `Grid "${m}" has not been mounted`), ae(
          Z.items.some((K) => K.id === F),
          `Grid "${m}" no longer contains a ${A} with id "${F}"; ${A} ids are ${S(Z.items.map((K) => K.id))}`
        ), Eo({ axisId: Y, itemId: F });
      };
      return {
        collapse: () => X().collapse(),
        expand: () => X().expand(),
        getSize: () => X().getSize(),
        isCollapsed: () => X().isCollapsed(),
        resize: (Z) => X().resize(Z)
      };
    };
    return {
      getLayout: R,
      getTrackById: (A, F) => {
        const Y = A === "column" ? g : w, X = `${F}`;
        return ae(
          Y.some((Z) => Z.id === X),
          `Grid "${m}" does not contain a ${A} with id "${X}"; ${A} ids are ${S(Y.map((Z) => Z.id))}`
        ), k(A, X);
      },
      getTrackByIndex: (A, F) => {
        const Y = A === "column" ? g : w, X = Number.isInteger(F) ? Y[F] : void 0;
        return ae(
          X,
          `Grid "${m}" does not contain a ${A} at index ${F}; it has ${Y.length} ${A}s`
        ), k(A, X.id);
      },
      setLayout: (A) => (xt.forEach((F) => {
        const Y = A[cn(F)], X = b(F);
        Y && zt(X) && hn({ axisId: X }).setLayout(Y);
      }), R())
    };
  }, [g, b, m, w]);
  Cn(a, () => _, [_]);
  const se = J(_);
  ue(() => {
    se.current = _;
  });
  const ie = pe(
    () => ({
      getLayout: () => se.current.getLayout(),
      getTrackById: (R, S) => se.current.getTrackById(R, S),
      getTrackByIndex: (R, S) => se.current.getTrackByIndex(R, S),
      id: m,
      setLayout: (R) => se.current.setLayout(R)
    }),
    [m]
  ), re = () => xt.map((R) => {
    const S = Re(b(R)), k = v(R);
    return (S && !S.defaultLayoutDeferred ? k.map((F) => `minmax(0, ${S.layout[F.id] ?? 1}fr)`) : ma(
      k,
      o?.[cn(R)]
    )).join(C[R] ? " auto " : " ");
  }).join("|"), Q = te(
    (R) => {
      const S = xt.map(
        (k) => Et(b(k), R)
      );
      return () => S.forEach((k) => k());
    },
    [b]
  ), ce = ot(
    Q,
    re,
    re
  ), [E, q] = ce.split("|");
  return /* @__PURE__ */ j(os.Provider, { value: I, children: /* @__PURE__ */ j(
    "div",
    {
      ...f,
      className: t,
      "data-grid": !0,
      "data-testid": Rt(f, l),
      id: m,
      ref: W,
      style: {
        height: "100%",
        width: "100%",
        overflow: "hidden",
        ...h,
        display: "grid",
        gridTemplateColumns: E,
        gridTemplateRows: q,
        // Inform the browser that the library is handling touch events for this element
        // NOTE This is not an inherited style
        touchAction: "none"
      },
      children: /* @__PURE__ */ j(Ro.Provider, { value: null, children: /* @__PURE__ */ j(Pn.Provider, { value: ie, children: e }) })
    }
  ) });
}
const Il = /* @__PURE__ */ Object.assign(va, {
  displayName: "Grid"
});
function Ai(e, t) {
  const n = JSON.stringify(e);
  return pe(() => {
    const o = typeof e == "number" ? Array.from({ length: e }, (i, s) => ({ id: `${s}` })) : e.map((i, s) => ({
      ...i,
      id: `${i.id ?? s}`
    }));
    return ae(
      o.length > 0,
      `Grid must have at least one track; "${t}" is ${n}`
    ), o;
  }, [n]);
}
function An() {
  return () => {
  };
}
function Cl({
  id: e,
  onlySaveAfterUserInteractions: t,
  storage: n = localStorage
}) {
  const o = `react-resizable-panels:grid:${e}`, i = ot(
    An,
    () => n.getItem(o),
    () => n.getItem(o)
  ), s = pe(() => {
    if (i)
      try {
        const a = JSON.parse(i);
        if (a !== null && typeof a == "object")
          return a;
      } catch {
      }
  }, [i]), r = te(
    (a, l) => {
      if (!(t && !l.isUserInteraction))
        try {
          n.setItem(
            o,
            JSON.stringify(l.requestedLayout ?? a)
          );
        } catch (c) {
          console.error(c);
        }
    },
    [t, n, o]
  );
  return {
    /**
     * Pass this value to `Grid` as the `defaultLayout` prop.
     */
    defaultLayout: s,
    /**
     * Attach this callback on the `Grid` as the `onLayoutChanged` prop.
     */
    onLayoutChanged: r
  };
}
function Ll() {
  return oe(null);
}
function El() {
  return J(null);
}
function Rl() {
  return fe(Pn);
}
function Sa(e) {
  for (let t = 1; t < e.length; t++)
    if (vo(e[t - 1], e[t]) > 0)
      return !1;
  return !0;
}
function wa({
  separator: e
}) {
  const { element: t } = e, n = J(null);
  return ue(() => {
    const o = t.cloneNode(!0), i = [t, ...t.querySelectorAll("*")], s = [o, ...o.querySelectorAll("*")], r = t.ownerDocument.defaultView;
    return i.forEach((a, l) => {
      const c = s[l], { style: u } = c;
      if (u) {
        const d = r.getComputedStyle(a);
        for (let p = 0; p < d.length; p++) {
          const h = d.item(p);
          u.setProperty(h, d.getPropertyValue(h));
        }
      }
      c.removeAttribute("data-testid"), c.removeAttribute("id");
    }), Object.assign(o.style, {
      boxSizing: "border-box",
      height: "100%",
      margin: "0",
      position: "static",
      transform: "none",
      width: "100%"
    }), n.current.appendChild(o), () => o.remove();
  }, [t]), /* @__PURE__ */ j(
    "div",
    {
      ref: n,
      style: {
        height: "100%",
        opacity: 0.65,
        pointerEvents: "none",
        width: "100%"
      }
    }
  );
}
function kn() {
  const e = fe(Ro);
  return ae(
    e,
    "Group Context not found; did you render a Panel or Separator outside of a Group?"
  ), e;
}
function xa(e) {
  const { registerOverlay: t } = kn(), n = J(e);
  Dn(n.current, e) || (n.current = e);
  const o = n.current;
  return ue(
    () => t(o),
    [t, o]
  ), null;
}
const za = /* @__PURE__ */ Object.assign(
  xa,
  {
    displayName: "SeparatorOverlay"
  }
);
function Ta({
  active: e,
  orientation: t,
  style: n,
  ...o
}) {
  let i;
  switch (t) {
    case "horizontal": {
      i = {
        height: "100%",
        minWidth: "1px"
      };
      break;
    }
    case "vertical": {
      i = {
        minHeight: "1px",
        width: "100%"
      };
      break;
    }
  }
  return /* @__PURE__ */ j(
    "div",
    {
      ...o,
      "data-separator-overlay": e ? "active" : "inactive",
      style: {
        ...i,
        ...n,
        flexShrink: 0,
        pointerEvents: "none"
      }
    }
  );
}
function Ia({
  overlay: e,
  preview: t
}) {
  const { axis: n, offset: o, rect: i, separator: s } = t, r = n.orientation === "horizontal";
  let a = s?.preview, l = e;
  return ns(a) && a.type === za && (l = a.props, a = void 0), a == null && (l ? a = /* @__PURE__ */ j(
    Ta,
    {
      ...l,
      active: t.active,
      orientation: n.orientation
    }
  ) : s && (a = /* @__PURE__ */ j(wa, { separator: s }))), /* @__PURE__ */ j(
    "div",
    {
      "aria-hidden": "true",
      "data-resize-preview": !0,
      inert: !0,
      style: {
        height: i.height,
        left: i.left,
        pointerEvents: "none",
        position: "absolute",
        top: i.top,
        transform: r ? `translateX(${o}px)` : `translateY(${o}px)`,
        width: i.width
      },
      children: a
    }
  );
}
function Ca(e) {
  return Array.from(e).sort(vo);
}
const On = Ge(null);
function La(e, t) {
  const n = J({
    getLayout: () => ({}),
    setLayout: Nr
  });
  return Cn(t, () => n.current, []), ue(() => {
    Object.assign(
      n.current,
      hn({ axisId: e })
    );
  }), n;
}
function Ea({
  groupId: e,
  resizePreviewMode: t
}) {
  const [n, o] = oe([]), i = J(n);
  return ue(() => {
    const s = (a) => {
      const l = zt(e), c = t === "separator" && a.state === "active" ? a.previews.filter(
        (d) => d.axis === l && (d.active || !me(d.offset, 0))
      ) : [], u = i.current;
      u.length === c.length && c.every(
        (d, p) => d === u[p]
      ) || (i.current = c, o(c));
    };
    if (t !== "separator") {
      s(Pe());
      return;
    }
    const r = Ln(
      ({ next: a }) => s(a)
    );
    return s(Pe()), r;
  }, [e, t]), n;
}
function Ra({
  children: e,
  className: t,
  defaultLayout: n,
  disableCursor: o,
  disabled: i,
  elementRef: s,
  groupRef: r,
  id: a,
  onLayoutChange: l,
  onLayoutChanged: c,
  orientation: u = "horizontal",
  resizePreviewMode: d = "panel",
  resizeTargetMinimumSize: p = {
    coarse: 20,
    fine: 10
  },
  style: h,
  ...f
}) {
  const { onLayoutChangeStable: m, onLayoutChangedStable: b } = zs({
    initialLayout: {},
    layoutsEqual: He,
    onLayoutChange: l,
    onLayoutChanged: c
  }), g = ft(a), [w, v] = oe(), z = Ea({
    groupId: g,
    resizePreviewMode: d
  }), M = J(null), [L, W] = xs(), U = J([]), P = J({
    lastExpandedPanelSizes: {},
    layouts: {},
    panels: [],
    separators: []
  }), T = it(M, s), C = La(g, r), D = pe(
    () => ({
      getLayout: () => C.current.getLayout(),
      id: g,
      orientation: u,
      setLayout: (B) => C.current.setLayout(B)
    }),
    [g, C, u]
  ), V = Se(
    (B, I) => {
      const G = Re(B);
      if (G)
        return {
          flexGrow: G.layout[I] ?? 1
        };
      if (n?.[I])
        return {
          flexGrow: n?.[I]
        };
    }
  ), O = Mn({
    defaultLayout: n,
    disableCursor: o,
    resizeTargetMinimumSize: p
  }), N = pe(
    () => ({
      get disableCursor() {
        return !!O.disableCursor;
      },
      getPanelStyles: V,
      id: g,
      orientation: u,
      registerPanel: (B) => {
        const I = P.current;
        return I.panels = kt(u, [
          ...I.panels,
          B
        ]), W(), () => {
          I.panels = I.panels.filter(
            (G) => G !== B
          ), W();
        };
      },
      registerOverlay: (B) => (v(B), () => {
        v(void 0);
      }),
      registerSeparator: (B) => {
        const I = P.current;
        return I.separators = kt(u, [
          ...I.separators,
          B
        ]), W(), () => {
          I.separators = I.separators.filter(
            (G) => G !== B
          ), W();
        };
      },
      updatePanelProps: (B, { disabled: I }) => {
        const _ = P.current.panels.find(
          (re) => re.id === B
        );
        if (!_ || _.constraintProps.disabled === I)
          return;
        _.constraintProps.disabled = I;
        const se = zt(g), ie = Re(g);
        se && ie && Ke(se, {
          ...ie,
          derivedItemConstraints: zo(se)
        });
      },
      updateSeparatorProps: (B, {
        disabled: I,
        disableDoubleClick: G
      }) => {
        const se = P.current.separators.find(
          (ie) => ie.id === B
        );
        se && (se.disabled = I, se.disableDoubleClick = G);
      }
    }),
    [V, g, W, u, O]
  ), H = J(null);
  return ue(() => {
    const B = M.current;
    if (B === null)
      return;
    const I = P.current;
    I.panels = kt(
      u,
      I.panels
    ), I.separators = kt(
      u,
      I.separators
    ), U.current = Ca([
      ...I.panels.map(({ element: q }) => q),
      ...I.separators.map(({ element: q }) => q)
    ]);
    let G;
    if (O.defaultLayout !== void 0 && Object.keys(O.defaultLayout).length === I.panels.length) {
      G = {};
      for (const q of I.panels) {
        const R = O.defaultLayout[q.id];
        R !== void 0 && (G[q.id] = R);
      }
    }
    const _ = {
      disabled: !!i,
      element: B,
      id: g,
      mutableState: {
        defaultLayout: G,
        disableCursor: !!O.disableCursor,
        expandedItemSizes: P.current.lastExpandedPanelSizes,
        layouts: P.current.layouts
      },
      orientation: u,
      items: I.panels,
      resizePreviewMode: d,
      get resizeTargetMinimumSize() {
        return O.resizeTargetMinimumSize;
      },
      separators: I.separators
    };
    H.current = _;
    const se = Ss(_), {
      defaultLayoutDeferred: ie,
      derivedItemConstraints: re,
      layout: Q,
      requestedLayout: ce
    } = Re(_.id, !0);
    if (!ie && re.length > 0)
      try {
        Sn({
          isCompleted: !0,
          // Initial mount is not a user interaction (#716).
          isUserInteraction: !1,
          layout: Q,
          onLayoutChange: m,
          onLayoutChanged: b,
          requestedLayout: ce
        });
      } catch (q) {
        throw H.current = null, se(), q;
      }
    const E = Et(g, (q) => {
      const {
        defaultLayoutDeferred: R,
        derivedItemConstraints: S,
        layout: k,
        requestedLayout: A
      } = q.next;
      if (R || S.length === 0)
        return;
      ws({
        derivedItemConstraints: S,
        axis: _,
        layout: k,
        prevLayout: q.prev?.layout,
        requestedLayout: A
      });
      const F = Pe(), Y = F.state !== "active" || !F.hitRegions.some((X) => X.axis === _);
      Sn({
        isCompleted: Y,
        isUserInteraction: q.isUserInteraction,
        layout: k,
        onLayoutChange: m,
        onLayoutChanged: b,
        requestedLayout: A
      });
    });
    return () => {
      H.current = null, se(), E();
    };
  }, [
    i,
    g,
    b,
    m,
    u,
    L,
    d,
    O
  ]), ue(() => {
    Sa(U.current) || W();
  }), Be(() => {
    const B = H.current;
    B && (B.mutableState.defaultLayout = n, B.mutableState.disableCursor = !!o);
  }), /* @__PURE__ */ j(On.Provider, { value: D, children: /* @__PURE__ */ j(Ro.Provider, { value: N, children: /* @__PURE__ */ qe(
    "div",
    {
      ...f,
      className: t,
      "data-group": !0,
      "data-testid": Rt(f, a),
      id: g,
      ref: T,
      style: {
        height: "100%",
        width: "100%",
        overflow: "hidden",
        position: d === "separator" ? "relative" : void 0,
        ...h,
        display: "flex",
        flexDirection: u === "horizontal" ? "row" : "column",
        flexWrap: "nowrap",
        // Inform the browser that the library is handling touch events for this element
        // but still allow users to scroll content within panels in the non-resizing direction
        // NOTE This is not an inherited style
        // See github.com/bvaughn/react-resizable-panels/issues/662
        touchAction: u === "horizontal" ? "pan-y" : "pan-x"
      },
      children: [
        e,
        z.map((B) => /* @__PURE__ */ j(
          Ia,
          {
            overlay: w,
            preview: B
          },
          B.key
        ))
      ]
    }
  ) }) });
}
const Da = /* @__PURE__ */ Object.assign(Ra, {
  displayName: "Group"
});
function mn(e, t) {
  return `react-resizable-panels:${[e, ...t].join(":")}`;
}
function Ma({
  id: e,
  panelIds: t,
  storage: n
}) {
  const o = mn(e, []), i = n.getItem(o);
  if (i)
    try {
      const s = JSON.parse(i);
      if (t) {
        const r = t.join(","), a = s[r];
        if (a && Array.isArray(a.layout) && t.length === a.layout.length) {
          const l = {};
          for (let c = 0; c < t.length; c++)
            l[t[c]] = a.layout[c];
          return l;
        }
      } else {
        const r = Object.keys(s);
        if (r.length === 1) {
          const a = s[r[0]];
          if (a && Array.isArray(a.layout)) {
            const l = r[0].split(",");
            if (l.length === a.layout.length) {
              const c = {};
              for (let u = 0; u < l.length; u++)
                c[l[u]] = a.layout[u];
              return c;
            }
          }
        }
      }
    } catch {
    }
}
function Dl({
  debounceSaveMs: e = 100,
  onlySaveAfterUserInteractions: t,
  panelIds: n,
  storage: o = localStorage,
  ...i
}) {
  const s = n !== void 0, r = "id" in i ? i.id : i.groupId, a = mn(r, n ?? []), l = ot(
    An,
    () => o.getItem(a),
    () => o.getItem(a)
  ), c = pe(() => {
    if (l) {
      const b = JSON.parse(l), g = Object.values(b);
      if (Array.from(g).every((w) => typeof w == "number"))
        return b;
    }
  }, [l]), u = pe(() => {
    if (!c)
      return Ma({
        id: r,
        panelIds: n,
        storage: o
      });
  }, [c, r, n, o]), d = c ?? u, p = J(null), h = te(() => {
    const b = p.current;
    b && (p.current = null, clearTimeout(b));
  }, []);
  ts(() => () => {
    h();
  }, [h]);
  const f = te(
    // The hook persists every layout commit -- including library-driven ones --
    // because it owns its own storage and the goal is to remember whatever
    // layout the user is currently looking at. Consumers that only want to
    // persist on user interaction should branch on `isUserInteraction` in
    // their own callback (see #716) rather than via this hook.
    (b, g) => {
      if (t && !g.isUserInteraction)
        return;
      h();
      const w = g.requestedLayout ?? b;
      let v;
      s ? v = mn(r, Object.keys(w)) : v = mn(r, []);
      try {
        o.setItem(v, JSON.stringify(w));
      } catch (z) {
        console.error(z);
      }
    },
    [
      h,
      s,
      r,
      t,
      o
    ]
  ), m = te(
    (b) => {
      h(), e === 0 ? f(b, { isUserInteraction: !1 }) : p.current = setTimeout(() => {
        f(b, { isUserInteraction: !1 });
      }, e);
    },
    [h, e, f]
  );
  return {
    /**
     * Pass this value to `Group` as the `defaultLayout` prop.
     */
    defaultLayout: d,
    /**
     * Attach this callback on the `Group` as the `onLayoutChange` prop.
     *
     * @deprecated Use the {@link onLayoutChanged} prop instead.
     */
    onLayoutChange: m,
    /**
     * Attach this callback on the `Group` as the `onLayoutChanged` prop.
     */
    onLayoutChanged: f
  };
}
function Ml() {
  return oe(null);
}
function Pa() {
  return J(null);
}
function Pl() {
  return fe(On);
}
const Nn = Ge(null);
function Aa(e, t) {
  const { id: n } = kn(), o = J({
    collapse: Yn,
    expand: Yn,
    getSize: () => ({
      asPercentage: 0,
      inPixels: 0
    }),
    isCollapsed: () => !1,
    resize: Yn
  });
  return Cn(t, () => o.current, []), ue(() => {
    Object.assign(
      o.current,
      Eo({ axisId: n, itemId: e })
    );
  }), o;
}
function ka({
  children: e,
  className: t,
  collapsedSize: n = "0%",
  collapsedThreshold: o,
  collapsible: i = !1,
  defaultSize: s,
  disabled: r,
  elementRef: a,
  groupResizeBehavior: l = "preserve-relative-size",
  id: c,
  maxSize: u = "100%",
  minSize: d = "0%",
  onResize: p,
  panelRef: h,
  style: f,
  ...m
}) {
  const b = bn(c), g = ft(c), w = Mn({
    disabled: r
  }), v = J(null), z = it(v, a), {
    getPanelStyles: M,
    id: L,
    orientation: W,
    registerPanel: U,
    updatePanelProps: P
  } = kn(), T = p != null, C = Se(
    (I, G, _) => {
      p?.(I, c, _);
    }
  );
  ue(() => {
    const I = v.current;
    if (I !== null) {
      const G = {
        element: I,
        id: g,
        idIsStable: b,
        mutableValues: {
          expandToSize: void 0,
          prevSize: void 0
        },
        onResize: T ? C : void 0,
        constraintProps: {
          groupResizeBehavior: l,
          collapsedSize: n,
          collapsedThreshold: o,
          collapsible: i,
          defaultSize: s,
          disabled: w.disabled,
          maxSize: u,
          minSize: d
        }
      };
      return U(G);
    }
  }, [
    l,
    n,
    o,
    i,
    s,
    T,
    g,
    b,
    u,
    d,
    C,
    U,
    w
  ]), Be(() => {
    P(g, { disabled: r });
  }, [r, g, P]);
  const D = Aa(g, h), V = pe(
    () => ({
      collapse: () => D.current.collapse(),
      expand: () => D.current.expand(),
      getSize: () => D.current.getSize(),
      groupId: L,
      id: g,
      isCollapsed: () => D.current.isCollapsed(),
      resize: (I) => D.current.resize(I)
    }),
    [L, g, D]
  ), O = te(
    (I) => Et(L, I),
    [L]
  ), N = () => M(L, g)?.flexGrow, H = ot(O, N, N);
  let B;
  return H !== void 0 ? B = { flexGrow: H } : s !== void 0 ? B = {
    flexGrow: void 0,
    flexShrink: void 0,
    flexBasis: s
  } : B = { flexGrow: 1 }, /* @__PURE__ */ j(
    "div",
    {
      ...m,
      "data-disabled": r || void 0,
      "data-panel": !0,
      "data-testid": Rt(m, c),
      id: g,
      ref: z,
      style: {
        ...Na,
        display: "flex",
        flexBasis: 0,
        flexShrink: 1,
        overflow: "visible",
        ...B
      },
      children: /* @__PURE__ */ j(
        "div",
        {
          className: t,
          style: {
            maxHeight: "100%",
            maxWidth: "100%",
            flexGrow: 1,
            overflow: "auto",
            ...f,
            // Inform the browser that the library is handling touch events for this element
            // but still allow users to scroll content within panels in the non-resizing direction
            // NOTE This is not an inherited style
            // See github.com/bvaughn/react-resizable-panels/issues/662
            touchAction: W === "horizontal" ? "pan-y" : "pan-x"
          },
          children: /* @__PURE__ */ j(Nn.Provider, { value: V, children: e })
        }
      )
    }
  );
}
const Oa = /* @__PURE__ */ Object.assign(ka, {
  displayName: "Panel"
}), Na = {
  minHeight: 0,
  maxHeight: "100%",
  height: "auto",
  minWidth: 0,
  maxWidth: "100%",
  width: "auto",
  border: "none",
  borderWidth: 0,
  padding: 0,
  margin: 0
};
function Al() {
  return oe(null);
}
function kl() {
  return J(null);
}
function Ol() {
  return fe(Nn);
}
const $a = { flexBasis: "auto" }, Ba = { flexGrow: 0, flexShrink: 0 };
function Fa({
  children: e,
  className: t,
  disabled: n,
  disableDoubleClick: o,
  elementRef: i,
  id: s,
  preview: r,
  style: a,
  ...l
}) {
  const c = ft(s), {
    disableCursor: u,
    id: d,
    orientation: p,
    registerSeparator: h,
    updateSeparatorProps: f
  } = kn();
  return /* @__PURE__ */ j(
    Ts,
    {
      attributes: l,
      axisId: d,
      axisOrientation: p,
      className: t,
      "data-testid": Rt(l, s),
      disableCursor: u,
      disabled: n,
      disableDoubleClick: o,
      elementRef: i,
      id: c,
      preview: r,
      registerSeparator: h,
      requiredStyle: Ba,
      style: a,
      styleDefaults: $a,
      updateSeparatorProps: f,
      children: e
    }
  );
}
const _a = /* @__PURE__ */ Object.assign(Fa, {
  displayName: "Separator"
}), ki = /* @__PURE__ */ new Set();
function Fe(e) {
  ki.has(e) || (ki.add(e), console.warn(`react-resizable-panels: ${e}`));
}
const Mt = Ge(null), Yt = Ge(null);
function Ft(e) {
  return e.type === "split" ? { ...e, children: e.children.map(Ft) } : { ...e, tabs: e.tabs.map((t) => ({ ...t })) };
}
function Oe(e) {
  const t = { ...e, root: Ft(e.root) };
  return e.floating && (t.floating = e.floating.map(Ft)), t;
}
function Xt(e) {
  return e.type === "tabset" ? [e] : e.children.flatMap((t) => Xt(t));
}
function Cs(e) {
  const t = Xt(e.root);
  return e.floating ? [...t, ...e.floating] : t;
}
function nt(e, t) {
  return Cs(e).find(
    ({ tabs: n }) => n.some(({ id: o }) => o === t)
  );
}
function _t(e, t) {
  return nt(e, t)?.tabs.find(
    ({ id: n }) => n === t
  );
}
function Do(e, t) {
  if (e.type === "tabset") {
    if (e.tabs.some(({ id: s }) => s === e.selectedId) || (e.selectedId = e.tabs[0]?.id), e.collapsible || delete e.collapsed, e.recentTabIds !== void 0) {
      const s = Array.isArray(e.recentTabIds) ? e.recentTabIds.filter(
        (r, a, l) => l.indexOf(r) === a && e.tabs.some((c) => c.id === r)
      ) : [];
      s.length > 0 ? e.recentTabIds = s : delete e.recentTabIds;
    }
    return e.tabs.length > 0 || t || e.keepWhenEmpty ? e : null;
  }
  const n = [];
  for (const s of e.children) {
    const r = Do(s, !1);
    if (r !== null)
      if (r.type === "split" && r.orientation === e.orientation)
        for (const a of r.children)
          n.push({
            ...a,
            size: typeof a.size == "number" && typeof r.size == "number" ? a.size * r.size / 100 : void 0
          });
      else
        n.push(r);
  }
  if (n.length === 0)
    return null;
  if (n.length === 1)
    return { ...n[0], size: e.size };
  const o = (s) => s.type === "tabset" && !!s.collapsed;
  n.every(o) && delete n[n.length - 1].collapsed;
  const i = n.filter((s) => !o(s));
  if (i.every(({ size: s }) => typeof s == "number")) {
    const s = i.reduce((r, { size: a }) => r + a, 0);
    if (s > 0)
      for (const r of i)
        r.size = r.size / s * 100;
  }
  return { ...e, children: n };
}
const Ls = 320, Es = 240;
function Wa(e) {
  const t = e;
  delete t.collapsible, delete t.size;
  const n = t.collapsed === !0;
  return t.x = ln(t.x) ? t.x : 0, t.y = ln(t.y) ? t.y : 0, t.width = ln(t.width) && t.width > 0 ? t.width : Ls, t.height = ln(t.height) && t.height > 0 ? t.height : Es, Do(t, !1) ? (n && (t.collapsed = !0), t) : null;
}
function ln(e) {
  return typeof e == "number" && Number.isFinite(e);
}
function Me(e) {
  const t = Do(e.root, !0) ?? {
    id: e.root.id,
    tabs: [],
    type: "tabset"
  };
  t.type === "tabset" && delete t.collapsed;
  const n = { root: t, version: 1 }, o = (e.floating ?? []).flatMap((i) => {
    const s = Wa(i);
    return s ? [s] : [];
  });
  return o.length > 0 && (n.floating = o), e.maximizedTabsetId !== void 0 && // A root tabset is the only tabset, so it can't be maximized (e.g. after the other tabsets are closed);
  // nor can a floating tabset
  t.type === "split" && Xt(t).some(({ id: i }) => i === e.maximizedTabsetId) && (n.maximizedTabsetId = e.maximizedTabsetId), n;
}
function Rs(e, t) {
  const n = e.recentTabIds?.find(
    (i) => i !== t && e.tabs.some((s) => s.id === i)
  );
  if (n !== void 0)
    return n;
  const o = e.tabs.findIndex(({ id: i }) => i === t);
  return (e.tabs[o + 1] ?? e.tabs[o - 1])?.id;
}
function wn(e, t) {
  const n = e.tabs.findIndex(({ id: o }) => o === t);
  n < 0 || (e.selectedId === t && (e.selectedId = Rs(e, t)), e.tabs.splice(n, 1));
}
function $t(e, t) {
  if (!_t(e, t))
    return e;
  const n = Oe(e), o = nt(n, t);
  return o && wn(o, t), Me(n);
}
function un(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function $n({ children: e, className: t, style: n, title: o }, i) {
  return {
    children: un(e, i),
    className: un(t, i),
    style: un(n, i),
    title: un(o, i)
  };
}
function xn(e, t) {
  return t[e.id] ?? !!e.collapsed;
}
function Mo(e) {
  const t = fe(Yt), n = J(null), o = () => {
    const i = t ? e(t.getState()) : null, s = n.current;
    return s && (s.value === i || s.value !== null && i !== null && Dn(s.value, i)) ? s.value : (n.current = { value: i }, i);
  };
  return ot(
    t?.subscribe ?? An,
    o,
    o
  );
}
function Ga() {
  const t = fe(Mt)?.id;
  return Mo(
    ({ collapseOverrides: n, disabled: o, model: i, modelIndex: s }) => {
      const r = t !== void 0 ? s.tabsetsByTabId.get(t) : void 0, a = r?.tabs.find(({ id: u }) => u === t);
      if (!r || !a)
        return null;
      const l = r.selectedId === a.id, c = i.maximizedTabsetId;
      return {
        isCloseDisabled: o || !!a.disableClose,
        isDragDisabled: o || !!a.disableDrag,
        isSelected: l,
        // A maximized tabset is shown expanded, even if it's collapsed
        isVisible: l && (c === void 0 ? !xn(r, n) : c === r.id),
        tabsetId: r.id
      };
    }
  );
}
function Ha({
  "aria-label": e,
  children: t = "×",
  className: n,
  onClick: o,
  style: i,
  title: s,
  ...r
}) {
  const a = fe(Yt), l = fe(Mt), c = Ga(), u = l?.id, d = Mo(({ modelIndex: f }) => {
    const m = u !== void 0 ? f.tabsById.get(u) : void 0;
    return m ? { title: m.title ?? m.id } : null;
  });
  if (!a || !l)
    process.env.NODE_ENV !== "production" && Fe("TabCloseButton must be rendered within a tab (see renderTab)");
  else if (c?.isCloseDisabled)
    return null;
  const p = d?.title ?? "tab", h = $n(
    { children: t, className: n, style: i, title: s },
    { tabTitle: p }
  );
  return /* @__PURE__ */ j(
    "button",
    {
      "aria-label": e ?? `Close ${p}`,
      tabIndex: -1,
      type: "button",
      ...r,
      className: h.className,
      style: h.style,
      title: h.title,
      onClick: (f) => {
        o?.(f), !f.defaultPrevented && a && l && a.updateModel(
          "close",
          !0,
          (m) => $t(m, l.id)
        );
      },
      children: h.children
    }
  );
}
const Va = /* @__PURE__ */ Object.assign(
  Ha,
  {
    displayName: "TabCloseButton"
  }
), st = Ge(null);
function Po(e, t) {
  return !!t.collapsible && !!e && e.children.some(
    (n) => n.id !== t.id && !(n.type === "tabset" && n.collapsed)
  );
}
function ja(e) {
  const t = {
    floatingTabsetIds: /* @__PURE__ */ new Set(),
    nodeIds: /* @__PURE__ */ new Set(),
    parentsById: /* @__PURE__ */ new Map(),
    tabsetsById: /* @__PURE__ */ new Map(),
    tabsetsByTabId: /* @__PURE__ */ new Map(),
    tabsById: /* @__PURE__ */ new Map()
  }, n = (o) => {
    if (t.nodeIds.add(o.id), o.type === "tabset") {
      t.tabsetsById.set(o.id, o);
      for (const i of o.tabs)
        t.tabsetsByTabId.set(i.id, o), t.tabsById.set(i.id, i);
    } else
      for (const i of o.children)
        t.parentsById.set(i.id, o), n(i);
  };
  n(e.root);
  for (const o of e.floating ?? [])
    t.floatingTabsetIds.add(o.id), n(o);
  return t;
}
const Oi = /* @__PURE__ */ new WeakMap();
function Ee(e) {
  let t = Oi.get(e);
  return t || (t = ja(e), Oi.set(e, t)), t;
}
function Ao(e, t, n, o) {
  return Ee(e).floatingTabsetIds.has(t.id) ? n || !!t.disableDrag : n || !!t.disableDrag || t.tabs.some(({ disableDrag: i }) => i) || e.root.id === t.id && (o === void 0 || !!t.keepWhenEmpty) || e.maximizedTabsetId !== void 0;
}
function ko() {
  const t = fe(st)?.id;
  return Mo(
    ({
      activeTabsetId: n,
      collapseOverrides: o,
      collapseToFit: i,
      disabled: s,
      dragGroup: r,
      model: a,
      modelIndex: l
    }) => {
      const c = t !== void 0 ? l.tabsetsById.get(t) : void 0;
      return c ? {
        isActive: n === c.id,
        isCollapsed: xn(c, o),
        isCollapsedToFit: xn(c, o) && i[c.id] === !0,
        isCollapsible: !!c.collapsed || l.floatingTabsetIds.has(c.id) || Po(l.parentsById.get(c.id), c),
        isDragDisabled: Ao(
          a,
          c,
          s,
          r
        ),
        isFloating: l.floatingTabsetIds.has(c.id),
        isMaximized: a.maximizedTabsetId === c.id,
        isRoot: a.root.id === c.id,
        selectedTabId: c.selectedId
      } : null;
    }
  );
}
function dt(e, t) {
  if (e.type === "split")
    for (const n of e.children) {
      if (n.id === t)
        return e;
      const o = dt(n, t);
      if (o)
        return o;
    }
}
function Ce(e, t) {
  return Cs(e).find(({ id: n }) => n === t);
}
function Kt(e, t) {
  return !!e.floating?.includes(
    t
  );
}
function Ds(e, t) {
  const n = Ce(e, t);
  if (!n || n.collapsed || !(Kt(e, n) || Po(dt(e.root, t), n)))
    return e;
  const o = Oe(e), i = Ce(o, t);
  return i && (i.collapsed = !0), Me(o);
}
function Ms(e, t) {
  const n = Ce(e, t);
  if (!n?.collapsed)
    return !1;
  delete n.collapsed;
  const o = n.size, i = dt(e.root, t)?.children.filter(
    (s) => s !== n && !(s.type === "tabset" && s.collapsed)
  ) ?? [];
  if (typeof o == "number" && o < 100 && i.every((s) => typeof s.size == "number"))
    for (const s of i)
      s.size = s.size * (100 - o) / 100;
  return !0;
}
function Bn(e, t) {
  if (!Ce(e, t)?.collapsed)
    return e;
  const n = Oe(e);
  return Ms(n, t), Me(n);
}
function qa({
  "aria-label": e = "Collapse tabset",
  children: t,
  className: n,
  onClick: o,
  style: i,
  title: s,
  ...r
}) {
  const a = fe(Yt), l = fe(st), c = ko();
  if ((!a || !l) && process.env.NODE_ENV !== "production" && Fe(
    "TabsetCollapseButton must be rendered within a tabset (see renderTabsetToolbar)"
  ), !c?.isCollapsible || c.isMaximized)
    return null;
  const { isCollapsed: u, isCollapsedToFit: d, selectedTabId: p } = c, h = $n(
    { children: t, className: n, style: i, title: s },
    { isCollapsed: u, isCollapsedToFit: d }
  );
  return /* @__PURE__ */ j(
    "button",
    {
      "aria-controls": a && p !== void 0 ? a.getTabPanelId(p) : void 0,
      "aria-disabled": d || void 0,
      "aria-expanded": !u,
      "aria-label": e,
      type: "button",
      ...r,
      className: h.className,
      onClick: (f) => {
        if (o?.(f), !f.defaultPrevented && !d && a && l) {
          const m = l.id;
          u ? a.updateModel(
            "expand",
            !0,
            (b) => Bn(b, m)
          ) : a.updateModel(
            "collapse",
            !0,
            (b) => Ds(b, m)
          );
        }
      },
      style: h.style,
      title: h.title,
      children: h.children
    }
  );
}
const Nl = /* @__PURE__ */ Object.assign(
  qa,
  {
    displayName: "TabsetCollapseButton"
  }
);
function Ua({
  children: e,
  className: t,
  style: n,
  title: o,
  ...i
}) {
  const s = fe(st), r = ko();
  s || process.env.NODE_ENV !== "production" && Fe(
    "TabsetDragHandle must be rendered within a tabset's header (see renderTabsetToolbar)"
  );
  const a = r?.isDragDisabled ?? !0, l = $n(
    { children: e, className: t, style: n, title: o },
    { isDisabled: a }
  );
  return /* @__PURE__ */ j(
    "div",
    {
      "data-disabled": a || void 0,
      "data-tabset-drag-handle": "",
      ...i,
      className: l.className,
      style: a ? l.style : { touchAction: "none", ...l.style },
      title: l.title,
      children: l.children
    }
  );
}
const $l = /* @__PURE__ */ Object.assign(
  Ua,
  {
    displayName: "TabsetDragHandle"
  }
);
function Ps(e, t) {
  return e.maximizedTabsetId === t || // The only tabset in a workspace already fills it
  e.root.id === t || // Floating tabsets can't be maximized
  !Xt(e.root).some(({ id: n }) => n === t) ? e : { ...e, maximizedTabsetId: t };
}
function As(e) {
  if (e.maximizedTabsetId === void 0)
    return e;
  const t = { ...e };
  return delete t.maximizedTabsetId, t;
}
function Ya({
  "aria-label": e = "Maximize tabset",
  children: t,
  className: n,
  onClick: o,
  style: i,
  title: s,
  ...r
}) {
  const a = fe(Yt), l = fe(st), c = ko();
  if ((!a || !l) && process.env.NODE_ENV !== "production" && Fe(
    "TabsetMaximizeButton must be rendered within a tabset (see renderTabsetToolbar)"
  ), !c || c.isRoot || c.isFloating)
    return null;
  const { isMaximized: u } = c, d = $n(
    { children: t, className: n, style: i, title: s },
    { isMaximized: u }
  );
  return /* @__PURE__ */ j(
    "button",
    {
      "aria-label": e,
      "aria-pressed": u,
      type: "button",
      ...r,
      className: d.className,
      onClick: (p) => {
        if (o?.(p), !p.defaultPrevented && a && l) {
          const h = l.id;
          u ? a.updateModel("restore", !0, As) : a.updateModel(
            "maximize",
            !0,
            (f) => Ps(f, h)
          );
        }
      },
      style: d.style,
      title: d.title,
      children: d.children
    }
  );
}
const Bl = /* @__PURE__ */ Object.assign(
  Ya,
  {
    displayName: "TabsetMaximizeButton"
  }
);
function Fl() {
  return fe(Mt);
}
function _l() {
  return fe(st);
}
const Oo = Ge(
  null
);
function Wl() {
  return fe(Oo);
}
function Gl() {
  const e = fe(Oo), t = fe(st)?.id, n = te(
    (i) => e && t !== void 0 ? e.subscribeToTabListFreeSpace(t, i) : () => {
    },
    [t, e]
  );
  return ot(n, () => e && t !== void 0 ? e.getTabListFreeSpace(t) : void 0, Xa);
}
function Xa() {
}
function Hl() {
  return oe(null);
}
function Vl() {
  return J(null);
}
const ks = Ge(
  null
);
function Ka(e, {
  getChromeSize: t,
  getCollapsedSize: n,
  getContentMaximumSize: o,
  getContentMinimumSize: i,
  getSeparatorsSize: s
}) {
  const r = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map(), c = (d) => {
    let p, h;
    if (d.type === "tabset") {
      const f = t(d.id) ?? { height: 0, width: 0 }, m = i(d), b = o(d);
      r.set(d.id, b), h = {
        height: m.height + f.height,
        width: m.width + f.width
      }, p = {
        height: b.height + f.height,
        width: b.width + f.width
      };
    } else {
      const f = d.orientation === "horizontal" ? "width" : "height", m = f === "width" ? "height" : "width", b = s(d.id) ?? 0;
      let g = 0, w = 0, v = 0, z = 1 / 0;
      for (const M of d.children) {
        const L = c(M);
        if (M.type === "tabset" && M.collapsed) {
          const W = n(M.id) ?? 0;
          g += W, v += W, z = Math.min(z, L.max[m]);
        } else
          g += L.min[f], w = Math.max(w, L.min[m]), v += L.max[f], z = Math.min(z, L.max[m]);
      }
      h = { [f]: g + b, [m]: w }, p = { [f]: v + b, [m]: z };
    }
    return l.set(d.id, h), a.set(d.id, p), { max: p, min: h };
  }, u = (d, p) => {
    const h = a.get(d.id);
    if (d.type === "tabset") {
      const f = r.get(d.id);
      for (const m of ["height", "width"])
        !p[m] && Number.isFinite(f[m]) && process.env.NODE_ENV !== "production" && Fe(
          `Tabset "${d.id}" can't be limited to its ${m === "height" ? "maxHeight" : "maxWidth"}, since nothing else can take up the rest of the space (e.g. every other tabset in its split has a maximum ${m}, or it fills the workspace)`
        );
    } else {
      const f = d.orientation === "horizontal" ? "width" : "height", m = f === "width" ? "height" : "width", b = d.children.filter(
        (g) => !(g.type === "tabset" && g.collapsed) && !Number.isFinite(a.get(g.id)[f])
      ).map(({ id: g }) => g);
      for (const g of d.children) {
        const w = b.some((v) => v !== g.id);
        u(g, {
          [f]: w || p[f],
          [m]: p[m]
        });
      }
    }
    a.set(d.id, {
      height: p.height ? h.height : 1 / 0,
      width: p.width ? h.width : 1 / 0
    });
  };
  return c(e), u(e, { height: !1, width: !1 }), { maximumSizes: a, minimumSizes: l };
}
function ro(e, t) {
  return e === void 0 || t === void 0 ? e === t : "edge" in e || "edge" in t ? "edge" in e && "edge" in t && e.edge === t.edge : e.tabsetId !== t.tabsetId ? !1 : "index" in e && "index" in t ? e.index === t.index : "region" in e && "region" in t ? e.region === t.region : !1;
}
function Ja() {
  const e = new jt();
  let t = { dragSource: void 0, dropTarget: void 0 };
  return {
    getState: () => t,
    setDragSource: (n) => {
      t.dragSource !== n && (t = { ...t, dragSource: n }, e.emit("change", void 0));
    },
    setDropTarget: (n) => {
      ro(t.dropTarget, n) || (t = { ...t, dropTarget: n }, e.emit("change", void 0));
    },
    subscribe: (n) => e.addListener("change", n)
  };
}
function Za() {
  const e = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), o = (i, s) => {
    if (e.get(i) === s)
      return;
    s === void 0 ? e.delete(i) : e.set(i, s);
    const r = t.get(i);
    if (!r)
      return;
    let a;
    for (const l of Array.from(r))
      try {
        l(s);
      } catch (c) {
        a ??= { error: c };
      }
    if (a)
      throw a.error;
  };
  return {
    get: (i) => e.get(i),
    retain: (i) => (n.set(i, (n.get(i) ?? 0) + 1), () => {
      n.set(i, n.get(i) - 1), queueMicrotask(() => {
        n.get(i) || (n.delete(i), o(i, void 0));
      });
    }),
    set: o,
    subscribe: (i, s) => {
      let r = t.get(i);
      return r || (r = /* @__PURE__ */ new Set(), t.set(i, r)), r.add(s), () => {
        r.delete(s), r.size === 0 && t.get(i) === r && t.delete(i);
      };
    }
  };
}
function Qa() {
  const e = /* @__PURE__ */ new Map();
  return {
    get: (t) => {
      const n = e.get(t);
      if (n) {
        for (const o of n)
          if (o.tabset)
            return o;
      }
    },
    register: (t, n) => {
      let o = e.get(t);
      o || (o = /* @__PURE__ */ new Set(), e.set(t, o)), o.add(n);
      const i = o;
      return () => {
        i.delete(n), i.size === 0 && e.get(t) === i && e.delete(t);
      };
    }
  };
}
function ec(e, t, n) {
  const o = new jt();
  let i = e, s = e;
  return {
    getState: () => s,
    getTabPanelId: n,
    notify: () => {
      i !== s && (i = s, o.emit("change", void 0));
    },
    setState: (r) => {
      s = r;
    },
    subscribe: (r) => o.addListener("change", r),
    updateModel: t
  };
}
function zn(e, t) {
  const n = nt(e, t);
  if (!n || n.selectedId === t)
    return e;
  const o = Oe(e), i = nt(o, t);
  return i && (i.selectedId = t), o;
}
function tc(e, t, {
  index: n,
  select: o = !0,
  tabsetId: i
} = {}) {
  if (_t(e, t.id))
    return { added: !1, model: zn(e, t.id) };
  const s = Oe(e);
  let r = Ce(s, i);
  r || (i !== void 0 && process.env.NODE_ENV !== "production" && Fe(
    `Tabset "${i}" not found in workspace model; adding tab to the first tabset instead`
  ), r = Xt(s.root)[0]);
  const a = n === void 0 ? r.tabs.length : Math.max(0, Math.min(n, r.tabs.length));
  return r.tabs.splice(a, 0, { ...t }), (o || r.selectedId === void 0) && (r.selectedId = t.id), { added: !0, model: Me(s) };
}
function Xn(e, t) {
  if (!Ce(e, t))
    return e;
  const n = Oe(e), o = Ce(n, t);
  return o && (o.tabs = [], o.selectedId = void 0, delete o.keepWhenEmpty), Me(n);
}
function Jt() {
  return Array.from(
    crypto.getRandomValues(new Uint8Array(16)),
    (e) => e.toString(16).padStart(2, "0")
  ).join("");
}
function nc(e, t) {
  let n;
  if (t.type === "tab") {
    const o = _t(e, t.tabId);
    if (!o)
      return;
    n = {
      id: Jt(),
      selectedId: o.id,
      tabs: [{ ...o }],
      type: "tabset"
    };
  } else {
    const o = Ce(e, t.tabsetId);
    if (!o)
      return;
    const {
      height: i,
      width: s,
      x: r,
      y: a,
      ...l
    } = Ft(o);
    n = l, delete n.collapsed, delete n.size;
  }
  return Me({ root: n });
}
function Wt(e, t) {
  return {
    id: Jt(),
    selectedId: e[0]?.id,
    size: t,
    tabs: e,
    type: "tabset"
  };
}
function oc(e, t, n) {
  const o = nt(e, t);
  if (!o || Kt(e, o) && o.tabs.length === 1 && !o.keepWhenEmpty)
    return e;
  const i = Oe(e), s = nt(i, t), r = s?.tabs.find(({ id: u }) => u === t);
  if (!s || !r)
    return e;
  wn(s, t);
  const { size: a, ...l } = Wt([r]), c = {
    ...l,
    ...n
  };
  return i.floating = [...i.floating ?? [], c], Me(i);
}
function ic(e, t, n) {
  const o = Ce(e, t);
  if (!o || Kt(e, o))
    return e;
  const i = Oe(e), s = Ce(i, t), r = dt(i.root, t);
  if (!s || !r)
    return e;
  r.children.splice(r.children.indexOf(s), 1);
  const { collapsed: a, collapsible: l, size: c, ...u } = s, d = {
    ...u,
    ...n
  };
  return i.floating = [...i.floating ?? [], d], i.maximizedTabsetId === t && delete i.maximizedTabsetId, Me(i);
}
function Os(e) {
  return Tn(e) && ao(e.root) && (e.floating === void 0 || Array.isArray(e.floating) && e.floating.every(
    (t) => Tn(t) && t.type === "tabset" && ao(t)
  ));
}
function Tn(e) {
  return typeof e == "object" && e !== null;
}
function Ni(e) {
  return e === void 0 || typeof e == "string";
}
function ao(e) {
  if (!Tn(e) || !Ni(e.id))
    return !1;
  switch (e.type) {
    case "split":
      return (e.orientation === "horizontal" || e.orientation === "vertical") && Array.isArray(e.children) && e.children.every(ao);
    case "tabset":
      return Array.isArray(e.tabs) && e.tabs.every(
        (t) => Tn(t) && typeof t.id == "string" && // Titles are rendered (e.g. by the default tab), so other values would throw
        Ni(t.title)
      );
    default:
      return !1;
  }
}
function $i(e) {
  return Os(e) ? e : (process.env.NODE_ENV !== "production" && Fe("Invalid workspace model; using an empty workspace instead"), { root: { tabs: [], type: "tabset" }, version: 1 });
}
function sc(e, t, n) {
  const { nodeIds: o, tabsetsByTabId: i } = Ee(e), s = (a) => o.has(a) || i.has(a);
  return t.type === "tab" ? s(t.tab.id) : ("edge" in n || "region" in n && n.region !== "center") && s(t.tabset.id) || t.tabset.tabs.some(({ id: a }) => s(a));
}
function rc(e, t, n, o) {
  const i = o === "left" || o === "right" ? "horizontal" : "vertical", s = o === "left" || o === "top", r = dt(e, t.id);
  if (r && r.orientation === i) {
    const l = r.children.indexOf(t);
    return typeof t.size == "number" ? (t.size /= 2, n.size = t.size) : n.size = void 0, r.children.splice(s ? l : l + 1, 0, n), e;
  }
  const a = {
    children: s ? [n, t] : [t, n],
    id: Jt(),
    orientation: i,
    size: t.size,
    type: "split"
  };
  return t.size = 50, n.size = 50, r ? (r.children[r.children.indexOf(t)] = a, e) : a;
}
function Fn(e, t, n, o, {
  expandCollapsedDestination: i = !0
} = {}) {
  if ("index" in o || o.region === "center") {
    const s = "index" in o ? Math.max(0, Math.min(o.index, t.tabs.length)) : t.tabs.length;
    if (t.tabs.splice(s, 0, ...n.tabs), t.selectedId = n.selectedId ?? n.tabs[0].id, n.recentTabIds && (t.recentTabIds = [
      ...t.recentTabIds ?? [],
      ...n.recentTabIds
    ]), t.collapsed && i) {
      const r = Me(e);
      return Ms(r, t.id) ? Me(r) : r;
    }
  } else
    delete n.collapsed, e.root = rc(e.root, t, n, o.region), e.maximizedTabsetId === t.id && (e.maximizedTabsetId = void 0);
  return Me(e);
}
function Gt(e, t, n) {
  const o = n === "left" || n === "right" ? "horizontal" : "vertical", i = n === "left" || n === "top";
  delete t.collapsed;
  const s = Me(e), { root: r } = s;
  if (r.type === "split" && r.orientation === o) {
    const a = r.children.filter(
      (l) => l.type !== "tabset" || !l.collapsed
    );
    t.size = a.every(({ size: l }) => typeof l == "number") ? 100 / a.length : void 0, i ? r.children.unshift(t) : r.children.push(t);
  } else {
    r.size = 50, t.size = 50;
    const a = {
      children: i ? [t, r] : [r, t],
      id: Jt(),
      orientation: o,
      type: "split"
    };
    s.root = a;
  }
  return Me(s);
}
function _n(e, t, n) {
  return "region" in n && n.region !== "center" && Kt(e, t) ? { region: "center", tabsetId: n.tabsetId } : n;
}
function ac(e, t, n) {
  const o = Oe(e);
  if ("edge" in n)
    return Gt(o, Wt([{ ...t }]), n.edge);
  const i = Ce(o, n.tabsetId);
  return i ? Fn(
    o,
    i,
    Wt([{ ...t }]),
    _n(o, i, n)
  ) : e;
}
function cc(e, t, n) {
  const o = Oe(e), i = Ft(t);
  if (delete i.size, "edge" in n)
    return Gt(o, i, n.edge);
  const s = Ce(o, n.tabsetId);
  if (!s)
    return e;
  const r = _n(o, s, n);
  return ("index" in r || r.region === "center") && t.tabs.length === 0 ? e : Fn(o, s, i, r);
}
function No(e, t, n) {
  if (e.type === "tabset")
    return e.id === t.id;
  const o = n === "left" || n === "right" ? "horizontal" : "vertical";
  return e.orientation !== o ? !1 : (n === "left" || n === "top" ? e.children[0] : e.children[e.children.length - 1])?.id === t.id;
}
function co(e, t, n) {
  const o = Oe(e), i = nt(o, t);
  if (!i)
    return e;
  const s = i.tabs.findIndex(({ id: u }) => u === t), r = i.tabs[s];
  if ("edge" in n)
    return i.tabs.length === 1 && !i.keepWhenEmpty && No(o.root, i, n.edge) ? e : (wn(i, t), Gt(o, Wt([r]), n.edge));
  const a = Ce(o, n.tabsetId);
  if (!a)
    return e;
  const l = _n(o, a, n);
  let c = l;
  if ("index" in l || l.region === "center") {
    if (i === a) {
      let u = "index" in l ? Math.max(0, Math.min(l.index, a.tabs.length)) : a.tabs.length;
      if (u > s && u--, u === s && a.selectedId === t)
        return e;
      c = { index: u, tabsetId: a.id };
    }
  } else if (
    // Splitting a tabset with its only tab would leave the layout unchanged (unless the tabset is kept when empty)
    i === a && i.tabs.length === 1 && !i.keepWhenEmpty
  )
    return e;
  return wn(i, t), Fn(
    o,
    a,
    Wt([r]),
    c,
    {
      expandCollapsedDestination: i !== a
    }
  );
}
function Bi(e, t) {
  const n = e.floating?.indexOf(t) ?? -1;
  if (!e.floating || n < 0)
    return;
  const [o] = e.floating.splice(n, 1), { height: i, width: s, x: r, y: a, ...l } = o;
  return l;
}
function lo(e, t, n) {
  const o = Oe(e), i = Ce(o, t);
  if (!i)
    return e;
  if ("edge" in n) {
    const l = Bi(o, i);
    if (l)
      return Gt(o, l, n.edge);
    const c = dt(o.root, i.id);
    return !c || No(o.root, i, n.edge) ? e : (c.children.splice(c.children.indexOf(i), 1), Gt(o, i, n.edge));
  }
  const s = Ce(o, n.tabsetId);
  if (!s || i === s)
    return e;
  const r = _n(o, s, n);
  let a;
  if ("index" in r || r.region === "center") {
    if (i.tabs.length === 0)
      return e;
    a = { ...i }, i.tabs = [], i.selectedId = void 0;
  } else {
    const l = Bi(o, i);
    if (l)
      a = l;
    else {
      const c = dt(o.root, i.id);
      if (!c)
        return e;
      c.children.splice(c.children.indexOf(i), 1), a = i;
    }
  }
  return Fn(o, s, a, r);
}
function lc(e, t) {
  const n = /* @__PURE__ */ new Set(), o = (i) => {
    n.add(i.id), i.type === "split" && i.children.forEach(o);
  };
  o(t);
  for (const i of e)
    i.id !== void 0 && n.add(i.id);
  return e.map((i, s) => {
    let r = i.id;
    if (r === void 0) {
      const a = `floating-${s}`;
      r = a;
      let l = 1;
      for (; n.has(r); )
        l++, r = `${a}-${l}`;
      n.add(r);
    }
    return { ...i, id: r, tabs: i.tabs.map((a) => ({ ...a })) };
  });
}
function uc(e) {
  const t = /* @__PURE__ */ new Set(), n = (s) => {
    s.id !== void 0 && t.add(s.id), s.type === "split" && s.children.forEach(n);
  };
  n(e);
  const o = (s, r) => {
    if (s.id !== void 0)
      return s.id;
    const a = `${s.type}-${r.length > 0 ? r.join("-") : "root"}`;
    let l = a, c = 1;
    for (; t.has(l); )
      c++, l = `${a}-${c}`;
    return t.add(l), l;
  }, i = (s, r) => s.type === "split" ? {
    ...s,
    children: s.children.map(
      (a, l) => i(a, [...r, l])
    ),
    id: o(s, r)
  } : {
    ...s,
    id: o(s, r),
    tabs: s.tabs.map((a) => ({ ...a }))
  };
  return i(e, []);
}
function dc(e) {
  const t = /* @__PURE__ */ new Set(), n = (i) => {
    t.has(i) && process.env.NODE_ENV !== "production" && Fe(`Duplicate id found in workspace model: "${i}"`), t.add(i);
  }, o = (i) => {
    n(i.id), i.type === "split" ? i.children.forEach(o) : i.tabs.forEach(({ id: s }) => n(s));
  };
  o(e.root), e.floating?.forEach(o);
}
function In(e) {
  e.version !== 1 && process.env.NODE_ENV !== "production" && Fe(`Unsupported workspace model version: ${e.version}`);
  const t = uc(e.root), n = Me({
    floating: Array.isArray(e.floating) ? lc(e.floating, t) : void 0,
    maximizedTabsetId: e.maximizedTabsetId,
    root: t
  });
  return process.env.NODE_ENV !== "production" && dc(n), n;
}
function fc(e, t, n) {
  if (!_t(e, t))
    return e;
  const o = Oe(e), i = _t(o, t);
  return i && Object.assign(i, n), o;
}
function Kn(e, t) {
  const n = uo(e.root, t), o = e.floating?.map(
    (s) => uo(s, t)
  ), i = !!o?.some(
    (s, r) => s !== e.floating?.[r]
  );
  return n === e.root && !i ? e : i ? { ...e, floating: o, root: n } : { ...e, root: n };
}
function uo(e, t) {
  if (e.type === "split") {
    const i = e.children.map((s) => uo(s, t));
    return i.every((s, r) => s === e.children[r]) ? e : { ...e, children: i };
  }
  const n = e.recentTabIds, o = e.selectedId;
  if (t === "adjacent" || // A tabset without a selected tab has no tabs to remember
  o === void 0) {
    if (n === void 0)
      return e;
    const { recentTabIds: i, ...s } = e;
    return s;
  }
  return n?.[0] === o ? e : {
    ...e,
    recentTabIds: [
      o,
      ...(n ?? []).filter((i) => i !== o)
    ]
  };
}
function Ns(e, t, n) {
  if (!Ce(e, t))
    return e;
  const o = Oe(e), i = Ce(o, t);
  if (i)
    if (Kt(o, i))
      Object.assign(i, n);
    else {
      const { height: s, width: r, x: a, y: l, ...c } = n;
      Object.assign(i, c);
    }
  return Me(o);
}
const $s = Ge(null);
function rt(e) {
  const t = fe(ks);
  return ae(t, `${e} must be rendered within a Workspace`), t;
}
function Wn(e) {
  const t = fe($s);
  return ae(t, `${e} must be rendered within a tabset`), t;
}
const pc = /* @__PURE__ */ zr(
  function({
    render: t,
    tab: n
  }) {
    return t(n);
  },
  (e, t) => e.render === t.render && e.tab.id === t.tab.id && e.tab.data === t.tab.data && e.tab.title === t.tab.title && e.tab.disableClose === t.tab.disableClose && e.tab.disableDrag === t.tab.disableDrag
), hc = /* @__PURE__ */ Object.assign(
  pc,
  { displayName: "Workspace.MemoizedContent" }
);
function mc({
  hiddenTabBehavior: e,
  renderTabContent: t,
  tab: n
}) {
  const {
    classNames: o,
    getTabHandle: i,
    getTabHost: s,
    getTabsetHandle: r,
    modelIndex: a,
    styles: l
  } = rt("TabContent"), c = a.tabsetsByTabId.get(n.id);
  if (!c)
    return null;
  const u = c.selectedId === n.id;
  let d = null;
  if ((e !== "unmount" || u) && (d = /* @__PURE__ */ j(hc, { render: t, tab: n }), e === "activity")) {
    const f = Sr.Activity;
    f ? d = /* @__PURE__ */ j(f, { mode: u ? "visible" : "hidden", children: d }) : process.env.NODE_ENV !== "production" && Fe(
      'hiddenTabBehavior "activity" requires React 19.2 or newer; falling back to "keep-mounted"'
    );
  }
  const { panelId: p, tabElementId: h } = s(n.id);
  return /* @__PURE__ */ j(
    "div",
    {
      "aria-labelledby": h,
      className: o?.tabContent,
      "data-tab-content": "",
      id: p,
      role: "tabpanel",
      style: l?.tabContent,
      children: /* @__PURE__ */ j(st.Provider, { value: r(c.id), children: /* @__PURE__ */ j(Mt.Provider, { value: i(n.id), children: d }) })
    }
  );
}
const Bs = /* @__PURE__ */ Object.assign(mc, {
  displayName: "Workspace.TabContent"
});
function Fs(e, t, n) {
  return n.width <= 0 || n.height <= 0 ? e : {
    x: Fi(e.x, t.left, t.width, n.width),
    y: Fi(e.y, t.top, t.height, n.height)
  };
}
function Fi(e, t, n, o) {
  return Math.max(0 - t, Math.min(e, o - n - t));
}
function fo(e, t) {
  return Array.from(e.querySelectorAll(t)).find(
    (n) => n.closest("[data-tabset-id]") === e
  );
}
function _s(e) {
  const t = e.querySelector("[data-tabset-id]"), n = t ? fo(t, "[data-tabset-header]") : void 0;
  if (!n)
    return;
  const o = ye(e, "horizontal"), i = ye(e, "vertical"), s = e.getBoundingClientRect(), r = n.getBoundingClientRect();
  return {
    height: r.height / i,
    left: (r.left - s.left) / o,
    top: (r.top - s.top) / i,
    width: r.width / o
  };
}
const gc = 3, po = "data-floating-gesture", Ws = {
  bottom: "ns-resize",
  "bottom-left": "nesw-resize",
  "bottom-right": "nwse-resize",
  left: "ew-resize",
  right: "ew-resize",
  top: "ns-resize",
  "top-left": "nwse-resize",
  "top-right": "nesw-resize"
};
function bc({
  getMinimumSize: e,
  updateModel: t
}) {
  const n = J(null);
  return Be(() => () => n.current?.(), []), te(
    (o, i, s) => {
      const r = vc(s.currentTarget, o), a = r?.parentElement;
      if (!r || !a)
        return;
      n.current?.();
      const l = s.currentTarget, c = l.ownerDocument, u = c.defaultView, { clientX: d, clientY: p, pointerId: h } = s;
      l.setPointerCapture?.(h);
      const f = ye(r, "horizontal"), m = ye(r, "vertical"), b = { height: a.offsetHeight, width: a.offsetWidth }, g = {
        height: r.offsetHeight,
        width: r.offsetWidth,
        x: r.offsetLeft,
        y: r.offsetTop
      }, w = _s(r) ?? {
        height: 0,
        left: 0,
        top: 0,
        width: 0
      }, v = e(o), z = yc(i), M = Object.fromEntries(
        z.map((N) => [N, r.style[Jn[N]]])
      ), L = {
        cursor: c.documentElement.style.cursor,
        userSelect: c.body.style.userSelect
      };
      let W = !1, U = g;
      const P = (N) => {
        if (N.pointerId !== h)
          return;
        const { clientX: H, clientY: B } = N;
        if (!W) {
          if (Math.hypot(H - d, B - p) < gc)
            return;
          W = !0, r.setAttribute(po, ""), c.body.style.userSelect = "none", i !== "move" && (c.documentElement.style.cursor = Ws[i]);
        }
        const I = (H - d) / f, G = (B - p) / m;
        U = i === "move" ? {
          ...g,
          ...Fs(
            { x: g.x + I, y: g.y + G },
            w,
            b
          )
        } : Sc(g, i, I, G, v, b);
        for (const _ of z)
          r.style[Jn[_]] = `${U[_]}px`;
      }, T = (N) => {
        if (n.current = null, c.removeEventListener("pointermove", P), c.removeEventListener("pointerup", C), c.removeEventListener("pointercancel", D), c.removeEventListener("keydown", V, !0), u?.removeEventListener("blur", O), r.removeAttribute(po), !!W)
          if (c.body.style.userSelect = L.userSelect, c.documentElement.style.cursor = L.cursor, yn(c), N) {
            const H = Object.fromEntries(
              z.map((B) => [B, Math.round(U[B])])
            );
            t(
              i === "move" ? "move" : "resize",
              !0,
              (B) => Ee(B).floatingTabsetIds.has(o) ? Ns(B, o, H) : B
            );
          } else
            for (const H of z)
              r.style[Jn[H]] = M[H] ?? "";
      }, C = (N) => {
        N.pointerId === h && T(!0);
      }, D = (N) => {
        N.pointerId === h && T(!1);
      }, V = (N) => {
        N.key === "Escape" && (W && (N.preventDefault(), N.stopPropagation()), T(!1));
      }, O = () => T(!1);
      n.current = () => T(!1), c.addEventListener("pointermove", P), c.addEventListener("pointerup", C), c.addEventListener("pointercancel", D), c.addEventListener("keydown", V, !0), u?.addEventListener("blur", O);
    },
    [e, t]
  );
}
const Jn = {
  height: "height",
  width: "width",
  x: "left",
  y: "top"
};
function yc(e) {
  if (e === "move")
    return ["x", "y"];
  const t = [];
  return e.includes("left") ? t.push("x", "width") : e.includes("right") && t.push("width"), e.includes("top") ? t.push("y", "height") : e.includes("bottom") && t.push("height"), t;
}
function vc(e, t) {
  let n = e.closest("[data-floating-tabset]");
  for (; n && n.dataset.floatingTabset !== t; )
    n = n.parentElement?.closest("[data-floating-tabset]") ?? null;
  return n;
}
function Sc(e, t, n, o, i, s) {
  let { height: r, width: a, x: l, y: c } = e;
  const u = e.x + e.width, d = e.y + e.height;
  return t.includes("left") ? (l = Math.max(
    Math.min(e.x + n, u - i.width),
    Math.min(0, e.x)
  ), a = u - l) : t.includes("right") && (a = Math.min(
    Math.max(e.width + n, i.width),
    Math.max(s.width - e.x, e.width)
  )), t.includes("top") ? (c = Math.max(
    Math.min(e.y + o, d - i.height),
    Math.min(0, e.y)
  ), r = d - c) : t.includes("bottom") && (r = Math.min(
    Math.max(e.height + o, i.height),
    Math.max(s.height - e.y, e.height)
  )), { height: r, width: a, x: l, y: c };
}
let ho = null;
const $o = new jt();
function gn() {
  return ho;
}
function Qe(e) {
  ho !== e && (ho = e, $o.emit("change", e));
}
function Gs(e, t) {
  e.lastDocument !== t && (e.lastDocument = t, $o.emit("change", e));
}
function Hs(e) {
  return $o.addListener("change", e);
}
const wc = "react-resizable-panels-workspace", Ht = 1, xc = 50, zc = 5e3;
let Tt = null, _i = 0, Zn = null, Ct = null;
const Bo = /* @__PURE__ */ new Map();
let Qn = { id: "", time: 0 };
function Gn(e) {
  try {
    return Tt?.postMessage(e), Tt !== null;
  } catch {
    return !1;
  }
}
function Vs() {
  if (Ct) {
    const { id: e } = Ct;
    Ct = null, Gn({ id: e, type: "end", version: Ht }), setTimeout(() => Bo.delete(e), zc);
  }
}
function Tc(e) {
  Ct && e !== Ct && Vs();
}
function Ic(e) {
  const t = e.data;
  if (t?.version !== Ht)
    return;
  const n = gn();
  switch (t.type) {
    case "start": {
      const { dragGroup: o, id: i, node: s, source: r } = t;
      Qe({
        dragGroup: o,
        hasSource: () => !0,
        id: i,
        isDropped: !1,
        isRemote: !0,
        isShared: !0,
        lastDocument: void 0,
        lastDragover: void 0,
        lastMoveStep: 0,
        lastRemoteDragoverTime: Date.now(),
        node: s,
        previewOwners: /* @__PURE__ */ new Map(),
        removeFromSource: () => Gn({ id: i, type: "remove", version: Ht }),
        source: r,
        // Not the owner of any workspace in this page, so drops are handled as transfers from another workspace
        sourceOwner: {}
      });
      break;
    }
    case "over": {
      n?.id === t.id && (n.lastRemoteDragoverTime = Date.now(), Gs(n, void 0));
      break;
    }
    case "remove": {
      const o = Bo.get(t.id);
      o && !o.isDropped && (o.isDropped = !0, n === o && Qe(null), o.removeFromSource());
      break;
    }
    case "end": {
      n?.isRemote && n.id === t.id && Qe(null);
      break;
    }
  }
}
function Cc() {
  if (typeof BroadcastChannel > "u")
    return () => {
    };
  _i++ === 0 && (Tt = new BroadcastChannel(wc), Tt.addEventListener("message", Ic), Zn = Hs(Tc));
  let e = !0;
  return () => {
    e && (e = !1, --_i === 0 && (Tt?.close(), Tt = null, Zn?.(), Zn = null));
  };
}
function Lc(e) {
  Vs();
  const { dragGroup: t, id: n, node: o, source: i } = e;
  return Gn({
    dragGroup: t,
    id: n,
    node: o,
    source: i,
    type: "start",
    version: Ht
  }) ? (e.isShared = !0, Ct = e, Bo.set(n, e), !0) : !1;
}
function Ec(e) {
  const t = Date.now();
  e.isShared && (Qn.id !== e.id || t - Qn.time >= xc) && (Qn = { id: e.id, time: t }, Gn({ id: e.id, type: "over", version: Ht }));
}
const Wi = /* @__PURE__ */ new WeakMap();
function mo(e, t) {
  if (!e)
    return;
  let n = Wi.get(e);
  if (!n) {
    const { margin: s, translate: r } = e.style;
    e.style.margin = "0", e.style.transform = "none", e.style.translate = "none";
    const a = e.getBoundingClientRect();
    n = {
      scaleX: ye(e, "horizontal"),
      scaleY: ye(e, "vertical"),
      x: a.left,
      y: a.top
    }, Wi.set(e, n), e.style.margin = s, e.style.translate = r;
  }
  const o = (t.clientX - n.x) / n.scaleX, i = (t.clientY - n.y) / n.scaleY;
  e.style.transform = `translate(${o}px, ${i}px)`;
}
const Rc = 0.25;
function js(e, t, n) {
  const o = e.width > 0 ? (t - e.left) / e.width : 0.5, i = e.height > 0 ? (n - e.top) / e.height : 0.5, s = {
    bottom: 1 - i,
    left: o,
    right: 1 - o,
    top: i
  }, r = Object.keys(s).reduce(
    (a, l) => s[l] < s[a] ? l : a,
    "left"
  );
  return s[r] < Rc ? r : "center";
}
function et(e) {
  return e?.ownerDocument.defaultView?.getComputedStyle(e).direction === "rtl";
}
function qs(e, t, n) {
  const o = e.dataset.orientation === "vertical", i = !o && et(e), s = Array.from(
    e.querySelectorAll("[data-tab]")
  ).filter((a) => a.closest("[data-tab-list]") === e), r = s.findIndex((a) => {
    const l = a.getBoundingClientRect();
    if (o)
      return n < l.top + l.height / 2;
    const c = l.left + l.width / 2;
    return i ? t > c : t < c;
  });
  return r === -1 ? s.length : r;
}
const Gi = 16;
function Dc({
  clientX: e,
  clientY: t,
  element: n,
  layoutElement: o,
  rootElement: i
}) {
  const s = ye(i, "horizontal"), r = ye(i, "vertical"), a = i.getBoundingClientRect(), l = i.ownerDocument.defaultView?.getComputedStyle(i), c = (g) => parseFloat(l?.[`border${g}Width`] ?? "") || 0;
  if (e < a.left + c("Left") * s || e > a.right - c("Right") * s || t < a.top + c("Top") * r || t > a.bottom - c("Bottom") * r)
    return;
  const u = o.getBoundingClientRect(), d = {
    bottom: u.bottom - t,
    left: e - u.left,
    right: u.right - e,
    top: t - u.top
  }, p = Mc(n, i), h = p ? 0 : Gi * s, f = p ? 0 : Gi * r, m = {
    bottom: f,
    left: h,
    right: h,
    top: f
  };
  let b;
  for (const g of Object.keys(d))
    d[g] < m[g] && (b === void 0 || d[g] < d[b]) && (b = g);
  return b;
}
function Mc(e, t) {
  return e.closest("[data-tabset-header]")?.closest("[data-workspace]") === t;
}
function It(e, t) {
  if (!t || "index" in e)
    return e;
  if ("edge" in e)
    switch (e.edge) {
      case "left":
        return { edge: "right" };
      case "right":
        return { edge: "left" };
      default:
        return e;
    }
  switch (e.region) {
    case "left":
      return { ...e, region: "right" };
    case "right":
      return { ...e, region: "left" };
    default:
      return e;
  }
}
function Hi({
  clientX: e,
  clientY: t,
  isExternal: n = !1,
  model: o,
  rootElement: i,
  source: s,
  tabsetElements: r
}) {
  const a = i.getRootNode(), l = (ms(a) ? a : i.ownerDocument).elementFromPoint(e, t);
  if (!l || !i.contains(l))
    return;
  const c = Ee(o), u = Pc({
    clientX: e,
    clientY: t,
    element: l,
    isExternal: n,
    model: o,
    rootElement: i,
    source: s
  });
  if (u)
    return { edge: u };
  let d = l.closest("[data-tabset-id]");
  for (; d && d.closest("[data-workspace]") !== i; )
    d = d.parentElement?.closest("[data-tabset-id]") ?? null;
  const p = d?.dataset.tabsetId, h = p !== void 0 ? c.tabsetsById.get(p) : void 0;
  if (!d || !h || o.maximizedTabsetId !== void 0 && o.maximizedTabsetId !== h.id && !c.floatingTabsetIds.has(h.id))
    return;
  const f = r?.get(h.id), { tabList: m, tabPanels: b } = f?.tabset === d ? { tabList: f.tabList, tabPanels: f.panels } : {
    tabList: fo(d, "[data-tab-list]"),
    tabPanels: fo(d, "[data-tab-panels]")
  }, g = (h.tabs.length > 0 || !!h.keepWhenEmpty) && !c.floatingTabsetIds.has(h.id);
  if (s.type === "tabset")
    return Oc({
      clientX: e,
      clientY: t,
      element: l,
      isExternal: n,
      isMoveOnly: !n && !!c.tabsetsById.get(s.tabsetId)?.keepWhenEmpty,
      isSplittable: g,
      sourceTabsetId: s.tabsetId,
      tabList: m,
      tabPanels: b,
      tabsetId: h.id
    });
  if (m?.contains(l))
    return {
      index: qs(m, e, t),
      tabsetId: h.id
    };
  if (b?.contains(l)) {
    const w = !n && h.tabs.some(({ id: M }) => M === s.tabId), z = g && (!!h.keepWhenEmpty || !(h.tabs.length === 1 && w)) ? js(b.getBoundingClientRect(), e, t) : "center";
    return z === "center" && w ? void 0 : { region: z, tabsetId: h.id };
  }
}
function Pc({
  clientX: e,
  clientY: t,
  element: n,
  isExternal: o,
  model: i,
  rootElement: s,
  source: r
}) {
  if (i.maximizedTabsetId !== void 0 || i.root.type !== "split" || Ac(n, s))
    return;
  const a = kc(s), l = a ? Dc({
    clientX: e,
    clientY: t,
    element: n,
    layoutElement: a,
    rootElement: s
  }) : void 0;
  if (!l || o)
    return l;
  const c = It({ edge: l }, et(s)), u = "edge" in c ? c.edge : l, d = Ee(i), p = r.type === "tabset" ? d.tabsetsById.get(r.tabsetId) : d.tabsetsByTabId.get(r.tabId);
  if (!(p && (r.type === "tabset" || p.tabs.length === 1 && !p.keepWhenEmpty) && No(i.root, p, u)))
    return l;
}
function Ac(e, t) {
  let n = e.closest("[data-floating-tabset]");
  for (; n; ) {
    if (n.closest("[data-workspace]") === t)
      return !0;
    n = n.parentElement?.closest("[data-floating-tabset]") ?? null;
  }
  return !1;
}
function kc(e) {
  return Array.from(e.children).find(
    (t) => t.hasAttribute("data-workspace-layout")
  );
}
function Oc({
  clientX: e,
  clientY: t,
  element: n,
  isExternal: o,
  isMoveOnly: i,
  isSplittable: s,
  sourceTabsetId: r,
  tabList: a,
  tabPanels: l,
  tabsetId: c
}) {
  if (!(!o && c === r)) {
    if (a?.contains(n))
      return i ? void 0 : { index: qs(a, e, t), tabsetId: c };
    if (l?.contains(n)) {
      const u = s ? js(l.getBoundingClientRect(), e, t) : "center";
      return u === "center" && i ? void 0 : { region: u, tabsetId: c };
    }
  }
}
const Nc = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", Vi = /* @__PURE__ */ new WeakMap();
function ji(e) {
  let t = Vi.get(e);
  return t || (t = e.createElement("img"), t.src = Nc, Vi.set(e, t)), t;
}
const qi = 250, $c = 20;
function Bc(e, t) {
  const { isDropped: n, lastDragover: o, lastMoveStep: i, lastRemoteDragoverTime: s } = e;
  if (n || !o || t - o.time < qi || t - s < qi)
    return !1;
  const { clientX: r, clientY: a, view: l } = o;
  return Math.min(
    r,
    a,
    l.innerWidth - r,
    l.innerHeight - a
  ) <= Math.max(i * 2, $c);
}
function Fc(e, t, n) {
  return e ? t < 0 || n < 0 || t >= e.innerWidth || n >= e.innerHeight : !1;
}
const _c = 5, Us = "application/x-react-resizable-panels-workspace", Ui = (e) => `${Us};id=${e}`;
function Wc({
  canTearOff: e,
  disableDragBetweenApps: t,
  dragGroup: n,
  dragStore: o,
  getDragNode: i,
  getModel: s,
  getRootElement: r,
  isDropDisabled: a,
  isExternalDropDisabled: l,
  onDrop: c,
  onTearOff: u,
  onTransferIn: d,
  onTransferOut: p,
  rootElement: h,
  tabsetElements: f
}) {
  const [m, b] = oe(), g = te(
    (G) => {
      b(G), o.setDragSource(G);
    },
    [o]
  ), w = o.setDropTarget, [v, z] = oe(!1), [M, L] = oe(!1), [W, U] = oe(), [P, T] = oe(!1), [C] = oe(() => ({})), D = J(null), V = J({ clientX: 0, clientY: 0 }), O = J(null);
  Be(() => () => O.current?.(), []);
  const N = te(
    (G, _, se) => {
      const ie = _.ownerDocument, re = _.getAttribute("draggable");
      _.draggable = !0;
      let Q = null;
      const ce = () => {
        O.current === k && (O.current = null), _.removeEventListener("dragstart", q), _.removeEventListener("dragend", R), ie.removeEventListener("pointerup", S), ie.removeEventListener("pointercancel", S), re === null ? _.removeAttribute("draggable") : _.setAttribute("draggable", re);
      }, E = (A) => {
        const F = A.target;
        return F === _ || !!F && _.contains(F) && F.getAttribute?.("draggable") !== "true";
      }, q = (A) => {
        if (!E(A)) {
          ce();
          return;
        }
        ie.removeEventListener("pointerup", S), ie.removeEventListener("pointercancel", S);
        const F = i(G), { dataTransfer: Y } = A;
        if (!F || !Y) {
          A.preventDefault(), ce();
          return;
        }
        Y.effectAllowed = "move";
        const X = Jt();
        Y.setData(Us, ""), Y.setData(Ui(X), ""), Y.setDragImage(ji(ie), 0, 0), Q = {
          dragGroup: se,
          hasSource: () => i(G) !== void 0,
          id: X,
          isDropped: !1,
          isRemote: !1,
          isShared: !1,
          lastDocument: ie,
          lastDragover: void 0,
          lastMoveStep: 0,
          lastRemoteDragoverTime: 0,
          node: F,
          previewOwners: /* @__PURE__ */ new Map([[ie, C]]),
          removeFromSource: () => p(G),
          source: G,
          sourceOwner: C
        }, V.current = {
          clientX: A.clientX,
          clientY: A.clientY
        }, g(G), L(!0), U(F), t || Lc(Q), Qe(Q);
      }, R = (A) => {
        if (!E(A))
          return;
        const F = Q;
        if (ce(), !(!F || gn() !== F) && (Qe(null), e(G) && Bc(F, Date.now()))) {
          const { lastDragover: Y } = F, X = A.screenX === 0 && A.screenY === 0;
          u(
            G,
            X && Y ? {
              screenX: Y.view.screenX + Y.clientX,
              screenY: Y.view.screenY + Y.clientY
            } : { screenX: A.screenX, screenY: A.screenY }
          );
        }
      }, S = () => ce(), k = () => {
        ce(), Q && gn() === Q && Qe(null);
      };
      O.current = k, _.addEventListener("dragstart", q), _.addEventListener("dragend", R), ie.addEventListener("pointerup", S), ie.addEventListener("pointercancel", S);
    },
    [
      e,
      t,
      i,
      u,
      p,
      C,
      g
    ]
  );
  Be(() => {
    if (n === void 0 || !h)
      return;
    const G = h.ownerDocument, _ = G.defaultView;
    ji(G);
    const se = t ? void 0 : Cc(), ie = (R) => {
      const S = gn();
      return S?.dragGroup !== n || S.isRemote && (t || !Array.from(R.dataTransfer?.types ?? []).includes(
        Ui(S.id)
      )) ? null : S.hasSource() ? S : (Qe(null), null);
    };
    let re = null;
    const Q = (R, S) => {
      const k = R.composedPath()[0];
      if (typeof k?.closest != "function" || k.closest("[data-workspace]") !== h)
        return;
      const A = s(), F = Hi({
        clientX: R.clientX,
        clientY: R.clientY,
        model: A,
        isExternal: S.sourceOwner !== C,
        rootElement: h,
        source: S.source,
        tabsetElements: f
      });
      if (F)
        return (re?.drag !== S || re.model !== A || !ro(re.target, F)) && (re = {
          drag: S,
          isDisabled: S.sourceOwner === C ? a(S.source, F) : l(S.node, F),
          model: A,
          target: F
        }), re.isDisabled ? void 0 : re.target;
    }, ce = (R) => {
      const S = ie(R);
      if (!S)
        return;
      const { clientX: k, clientY: A } = R, F = S.lastDragover;
      _ && (F?.view !== _ || F.clientX !== k || F.clientY !== A) ? (F?.view === _ && (S.lastMoveStep = Math.hypot(
        k - F.clientX,
        A - F.clientY
      )), S.lastDragover = {
        clientX: k,
        clientY: A,
        time: Date.now(),
        view: _
      }) : F && (F.time = Date.now()), Gs(S, G), Ec(S), T(!0), S.previewOwners.has(G) || S.previewOwners.set(G, C), S.previewOwners.get(G) === C && (V.current = { clientX: k, clientY: A }, mo(D.current, V.current), U(S.node));
      const Y = Q(R, S);
      Y && (R.preventDefault(), R.dataTransfer && (R.dataTransfer.dropEffect = "move")), w(Y);
    }, E = (R) => {
      const S = ie(R), k = S ? Q(R, S) : void 0;
      !S || !k || (R.preventDefault(), S.isDropped = !0, Qe(null), S.sourceOwner === C ? c(S.source, k) : d(S.node, k) && S.removeFromSource());
    }, q = Hs((R) => {
      R?.dragGroup !== n ? (g(void 0), w(void 0), T(!1), L(!1), U(void 0)) : R.lastDocument !== G && (w(void 0), T(!1), U(void 0));
    });
    return G.addEventListener("dragenter", ce), G.addEventListener("dragover", ce), G.addEventListener("drop", E), () => {
      se?.(), q(), G.removeEventListener("dragenter", ce), G.removeEventListener("dragover", ce), G.removeEventListener("drop", E);
    };
  }, [
    t,
    n,
    s,
    a,
    l,
    c,
    d,
    C,
    h,
    g,
    w,
    f
  ]);
  const H = te(
    (G, _) => {
      const se = r();
      if (!se)
        return;
      const ie = Pe();
      if (ie.state === "active" && Ut(
        ie,
        _.currentTarget.ownerDocument,
        _
      ))
        return;
      if (O.current?.(), n !== void 0 && _.pointerType !== "touch" && _.pointerType !== "pen") {
        N(G, _.currentTarget, n);
        return;
      }
      const re = _.currentTarget, Q = re.ownerDocument, { clientX: ce, clientY: E, pointerId: q } = _;
      re.setPointerCapture?.(q);
      let R = !1, S = !1, k, A;
      const F = {
        cursor: Q.documentElement.style.cursor,
        sourceCursor: re.style.cursor,
        userSelect: Q.body.style.userSelect
      }, Y = (he) => {
        Q.documentElement.style.cursor = he ?? F.cursor, re.style.cursor = he ?? F.sourceCursor;
      }, X = (he) => {
        if (he.pointerId !== q)
          return;
        const { clientX: Te, clientY: ge } = he;
        if (!R) {
          if (Math.hypot(Te - ce, ge - E) < _c)
            return;
          R = !0, Q.body.style.userSelect = "none", g(G);
        }
        V.current = { clientX: Te, clientY: ge }, mo(D.current, V.current);
        const _e = Fc(xe, Te, ge), Ae = _e && e(G);
        S !== Ae && (S = Ae, z(Ae));
        const ke = _e ? void 0 : Hi({
          clientX: Te,
          clientY: ge,
          model: s(),
          rootElement: se,
          source: G,
          tabsetElements: f
        });
        if (!ro(A, ke)) {
          A = ke;
          const de = ke !== void 0 && a(G, ke);
          k = de ? void 0 : ke, Y(de ? "not-allowed" : void 0), w(k);
        }
      }, Z = (he, {
        isPointerDown: Te = !1,
        screenPoint: ge
      } = {}) => {
        if (O.current = null, Q.removeEventListener("pointermove", X), Q.removeEventListener("pointerup", K), Q.removeEventListener("pointercancel", ne), Q.removeEventListener("keydown", Le, !0), xe?.removeEventListener("blur", Ne), R) {
          if (Q.body.style.userSelect = F.userSelect, Y(void 0), g(void 0), w(void 0), z(!1), Te) {
            const _e = (Ae) => {
              Ae.pointerId === q && (Q.removeEventListener("pointerup", _e), Q.removeEventListener("pointercancel", _e), yn(Q));
            };
            Q.addEventListener("pointerup", _e), Q.addEventListener("pointercancel", _e);
          } else
            yn(Q);
          he && (S && ge ? u(G, ge) : k && c(G, k));
        }
      }, K = (he) => {
        if (he.pointerId === q) {
          const { screenX: Te, screenY: ge } = he;
          Z(!0, { screenPoint: { screenX: Te, screenY: ge } });
        }
      }, ne = (he) => {
        he.pointerId === q && Z(!1);
      }, Le = (he) => {
        he.key === "Escape" && (R && (he.preventDefault(), he.stopPropagation()), Z(!1, { isPointerDown: !0 }));
      }, xe = Q.defaultView, Ne = () => Z(!1);
      O.current = () => Z(!1), Q.addEventListener("pointermove", X), Q.addEventListener("pointerup", K), Q.addEventListener("pointercancel", ne), Q.addEventListener("keydown", Le, !0), xe?.addEventListener("blur", Ne);
    },
    [
      e,
      n,
      s,
      r,
      a,
      c,
      u,
      g,
      w,
      N,
      f
    ]
  ), B = te(
    (G, _) => H({ tabId: G, type: "tab" }, _),
    [H]
  ), I = te(
    (G, _) => H({ tabsetId: G, type: "tabset" }, _),
    [H]
  );
  return {
    dragSource: m,
    isNativeDragOver: P,
    isNativeDragSource: M,
    isTearOff: v,
    nativePreviewNode: W,
    previewElementRef: D,
    previewPointRef: V,
    startTabDrag: B,
    startTabsetDrag: I
  };
}
const dn = 24;
function Yi(e, t, n = {}) {
  let o = {
    height: Es,
    width: Ls,
    x: dn,
    y: dn
  };
  if (e) {
    const i = e.offsetWidth, s = e.offsetHeight;
    if (t) {
      const l = ye(e, "horizontal"), c = ye(e, "vertical"), u = e.getBoundingClientRect(), d = t.getBoundingClientRect();
      if (d.width > 0 && d.height > 0) {
        const p = t.hasAttribute("data-tabset-collapsed");
        o = {
          height: p ? o.height : d.height / c,
          width: p ? o.width : d.width / l,
          x: (d.left - u.left) / l + dn,
          y: (d.top - u.top) / c + dn
        };
      }
    }
    const r = n.width ?? Math.min(o.width, i || o.width), a = n.height ?? Math.min(o.height, s || o.height);
    i > 0 && s > 0 && (o = {
      height: a,
      width: r,
      x: Math.max(0, Math.min(o.x, i - r)),
      y: Math.max(0, Math.min(o.y, s - a))
    });
  }
  return { ...o, ...Gc(n) };
}
function Gc(e) {
  const t = {};
  for (const n of ["height", "width", "x", "y"])
    typeof e[n] == "number" && (t[n] = e[n]);
  return t;
}
function Hc(e, t) {
  const n = e.floating, o = n?.findIndex(({ id: i }) => i === t) ?? -1;
  return !n || o < 0 || o === n.length - 1 ? e : {
    ...e,
    floating: [
      ...n.slice(0, o),
      ...n.slice(o + 1),
      n[o]
    ]
  };
}
const Ys = Ge({ isOverflowing: !1, orientation: "horizontal" });
function Vt(e, t) {
  const n = () => t(e.getState());
  return ot(e.subscribe, n, n);
}
const Vc = 'button, [role="button"], [data-tab-ignore]';
function eo(e) {
  const t = e.target.closest?.(Vc);
  return !!t && t !== e.currentTarget && e.currentTarget.contains(t);
}
function jc({ tab: e }) {
  const {
    classNames: t,
    disabled: n,
    dragStore: o,
    getTabHandle: i,
    getTabHost: s,
    modelIndex: r,
    renderTab: a,
    requestFocus: l,
    startTabDrag: c,
    styles: u,
    takeFocusRequest: d,
    updateModel: p
  } = rt("Tab"), {
    isCollapsed: h,
    tabPlacement: f,
    tabset: m
  } = Wn("Tab"), { isOverflowing: b, orientation: g } = fe(Ys), w = J(null), v = te((I) => {
    w.current = I;
  }, []), z = r.tabsetsByTabId.get(e.id) ?? m, M = z.tabs.findIndex(({ id: I }) => I === e.id), L = z.tabs[M] ?? e, W = z.selectedId === L.id, U = n || !!L.disableClose, P = n || !!L.disableDrag;
  let T = u?.tab?.touchAction;
  P || (b ? T = g === "horizontal" ? "pan-x" : "pan-y" : T = "none");
  const C = Vt(o, ({ dropTarget: I }) => {
    if (!(I === void 0 || !("index" in I) || I.tabsetId !== z.id)) {
      if (I.index === M)
        return "before";
      if (I.index === z.tabs.length && M === z.tabs.length - 1)
        return "after";
    }
  }), D = Vt(
    o,
    ({ dragSource: I }) => I?.type === "tab" && I.tabId === L.id
  );
  ue(() => {
    d(L.id) && w.current?.focus();
  }), ue(() => {
    const I = w.current;
    I ? !P && // Environments without touch-action support (e.g. jsdom) can't be checked
    "touchAction" in I.style && I.style.touchAction !== T && process.env.NODE_ENV !== "production" && Fe(
      "The element returned by renderTab replaced props.style (rather than merging it, e.g. style={{ ...props.style, padding: 4 }}); tabs can't be dragged by touch without its touch-action"
    ) : process.env.NODE_ENV !== "production" && Fe(
      "The element returned by renderTab must receive its props (including ref); otherwise tabs can't be selected, dragged, or focused"
    );
  }, [P, T]);
  const { panelId: V, tabElementId: O } = s(L.id), N = () => h && z.collapsed ? p(
    "expand",
    !0,
    (I) => Bn(zn(I, L.id), z.id)
  ) : p("select", !0, (I) => zn(I, L.id)), H = (I) => {
    if (I.target !== I.currentTarget)
      return;
    const G = I.currentTarget.closest("[data-tab-list]"), _ = G ? Array.from(G.querySelectorAll("[data-tab]")).filter(
      (ce) => ce.closest("[data-tab-list]") === G
    ) : [], se = _.indexOf(I.currentTarget), ie = (ce) => {
      I.preventDefault(), _[(ce + _.length) % _.length]?.focus();
    };
    let [re, Q] = g === "horizontal" ? ["ArrowLeft", "ArrowRight"] : ["ArrowUp", "ArrowDown"];
    switch (g === "horizontal" && et(G) && ([re, Q] = [Q, re]), I.key) {
      case re: {
        ie(se - 1);
        break;
      }
      case Q: {
        ie(se + 1);
        break;
      }
      case "Home": {
        ie(0);
        break;
      }
      case "End": {
        ie(_.length - 1);
        break;
      }
      case "Enter":
      case " ": {
        I.preventDefault(), N();
        break;
      }
      case "Backspace":
      case "Delete": {
        if (!U) {
          I.preventDefault();
          const ce = W ? Rs(z, L.id) : (z.tabs[M + 1] ?? z.tabs[M - 1])?.id;
          ce !== void 0 && l(ce), p("close", !0, (E) => $t(E, L.id));
        }
        break;
      }
    }
  }, B = {
    "aria-controls": V,
    "aria-selected": W,
    className: t?.tab,
    "data-drop-after": C === "after" || void 0,
    "data-drop-before": C === "before" || void 0,
    "data-tab": "",
    "data-tab-dragging": D || void 0,
    "data-tab-id": L.id,
    "data-tab-placement": f,
    "data-tabset-collapsed": h || void 0,
    "data-tab-selected": W || void 0,
    id: O,
    onClick: (I) => {
      eo(I) || N();
    },
    onKeyDown: (I) => {
      eo(I) || H(I);
    },
    onPointerDown: (I) => {
      I.button === 0 && !P && !eo(I) && c(L.id, I);
    },
    ref: v,
    role: "tab",
    style: {
      ...u?.tab,
      touchAction: T,
      // Suppress the long-press menu on iOS, which would interrupt touch drags
      WebkitTouchCallout: "none"
    },
    // Only the selected tab is in the page's tab order; arrow keys move focus between tabs
    tabIndex: W ? 0 : -1
  };
  return /* @__PURE__ */ j(Mt.Provider, { value: i(L.id), children: a ? a(L, B) : /* @__PURE__ */ qe("div", { ...B, children: [
    L.title ?? L.id,
    /* @__PURE__ */ j(Va, {})
  ] }) });
}
const qc = /* @__PURE__ */ Object.assign(jc, {
  displayName: "Workspace.Tab"
});
function Xs(e) {
  const t = [];
  for (const n of e.children) {
    if (!$e(n))
      continue;
    const o = n.ownerDocument.defaultView?.getComputedStyle(n);
    o?.display === "contents" ? t.push(...Xs(n)) : n.offsetParent !== null && o?.position !== "absolute" && o?.position !== "fixed" && t.push(n);
  }
  return t;
}
function Uc(e) {
  const t = e.dataset.orientation === "vertical", n = e.parentElement, o = ye(
    n && $e(n) ? n : e,
    t ? "vertical" : "horizontal"
  ), i = Array.from(e.children).filter(
    (a) => $e(a) && a.offsetParent !== null
  ), s = Xi(e, i, t, o);
  let r = 0;
  if (n) {
    const a = e.getBoundingClientRect(), [l, c] = t ? [a.left, a.right] : [a.top, a.bottom], u = Xs(n).filter((d) => {
      if (d === e)
        return !0;
      const p = d.getBoundingClientRect(), [h, f] = t ? [p.left, p.right] : [p.top, p.bottom];
      return c > l ? h < c && f > l : h <= l && f >= l;
    });
    r = Math.max(
      0,
      -Xi(n, u, t, o)
    );
  }
  return Math.round(s - r);
}
function Xi(e, t, n, o) {
  const i = (f) => f.ownerDocument.defaultView?.getComputedStyle(f), s = (f, m) => parseFloat(f?.getPropertyValue(m) ?? "") || 0, [r, a] = n ? ["top", "bottom"] : ["left", "right"], l = i(e), c = e.getBoundingClientRect(), u = (n ? c.height : c.width) / o - s(l, `border-${r}-width`) - s(l, `border-${a}-width`) - s(l, `padding-${r}`) - s(l, `padding-${a}`);
  let d, p;
  for (const f of t) {
    const m = f.getBoundingClientRect(), b = n ? m.top : m.left, g = n ? m.bottom : m.right;
    (!d || b < d.position) && (d = { element: f, position: b }), (!p || g > p.position) && (p = { element: f, position: g });
  }
  if (!d || !p)
    return u;
  const h = s(i(d.element), `margin-${r}`) + s(i(p.element), `margin-${a}`);
  return u - h - (p.position - d.position) / o;
}
function Yc({ children: e }) {
  const {
    classNames: t,
    disabled: n,
    dragGroup: o,
    model: i,
    styles: s,
    tabListFreeSpaceStore: r
  } = rt("TabList"), { isCollapsed: a, setTabListElement: l, tabPlacement: c, tabset: u } = Wn("TabList"), d = c === "left" || c === "right" ? "vertical" : "horizontal", p = J(null), h = it(p, l), [f, m] = oe(!1), b = u.id;
  ue(() => {
    const v = p.current;
    if (!v)
      return;
    const z = () => {
      const T = v.dataset.orientation === "vertical", C = Math.abs(
        T ? v.scrollTop : v.scrollLeft
      ), D = T ? v.scrollHeight - v.offsetHeight : v.scrollWidth - v.offsetWidth;
      v.toggleAttribute("data-overflow-start", C > 1), v.toggleAttribute("data-overflow-end", D - C > 1), m(D > 1);
    };
    let M;
    const L = () => {
      z();
      const T = Uc(v);
      T !== M && (M = T, v.style.setProperty("--tab-list-free-space", `${T}px`)), r.set(b, T);
    };
    let W = null, U = null;
    z();
    let P = !1;
    return queueMicrotask(() => {
      const T = v.ownerDocument.defaultView;
      if (P || !T)
        return;
      const C = v.parentElement, D = (O) => {
        if (T.getComputedStyle(O).display === "contents") {
          U?.observe(O, { childList: !0 });
          for (const N of O.children)
            $e(N) && D(N);
        } else
          W?.observe(O);
      }, V = (O) => {
        W?.unobserve(O);
        for (const N of O.children)
          $e(N) && V(N);
      };
      W = T.ResizeObserver ? new T.ResizeObserver(L) : null, U = T.MutationObserver ? new T.MutationObserver((O) => {
        for (const N of O) {
          for (const H of N.addedNodes)
            if ($e(H))
              N.target === v ? W?.observe(H) : D(H);
            else continue;
          for (const H of N.removedNodes)
            $e(H) && V(H);
        }
        L();
      }) : null, W?.observe(v);
      for (const O of v.children)
        W?.observe(O);
      if (U?.observe(v, { childList: !0 }), C) {
        W?.observe(C);
        for (const O of C.children)
          $e(O) && O !== v && D(O);
        U?.observe(C, { childList: !0 });
      }
      L();
    }), v.addEventListener("scroll", z, { passive: !0 }), () => {
      P = !0, W?.disconnect(), U?.disconnect(), v.removeEventListener("scroll", z);
    };
  }, [d, r, b]), ue(
    () => r.retain(b),
    [r, b]
  );
  let g = s?.tabList?.touchAction;
  Ao(i, u, n, o) || (f ? g = d === "horizontal" ? "pan-x" : "pan-y" : g = "none");
  const w = pe(
    () => ({ isOverflowing: f, orientation: d }),
    [f, d]
  );
  return /* @__PURE__ */ j(Ys.Provider, { value: w, children: /* @__PURE__ */ j(
    "div",
    {
      "aria-orientation": d,
      className: t?.tabList,
      "data-orientation": d,
      "data-tab-list": !0,
      "data-tab-placement": c,
      "data-tabset-collapsed": a || void 0,
      ref: h,
      role: "tablist",
      style: { ...s?.tabList, touchAction: g },
      children: e
    }
  ) });
}
const Xc = /* @__PURE__ */ Object.assign(Yc, {
  displayName: "Workspace.TabList"
});
function Kc() {
  const {
    classNames: e,
    getHiddenTabBehavior: t,
    getTabHost: n,
    isHydrating: o,
    renderEmptyTabset: i,
    renderTabContent: s,
    shouldServerRenderTabContent: r,
    styles: a
  } = rt("TabPanels"), { isCollapsed: l, setPanelsElement: c, tabPlacement: u, tabset: d } = Wn("TabPanels"), p = J(null), h = it(p, c);
  ue(() => {
    const b = p.current;
    if (b && !o)
      for (const g of d.tabs) {
        const { element: w } = n(g.id);
        w && (w.parentElement !== b && b.appendChild(w), w.style.display = g.id === d.selectedId ? "contents" : "none");
      }
  });
  const f = d.tabs.find(({ id: b }) => b === d.selectedId), m = o && f && r(f) ? f : void 0;
  return /* @__PURE__ */ qe(
    "div",
    {
      className: e?.tabPanels,
      "data-tab-panels": !0,
      "data-tab-placement": u,
      "data-tabset-collapsed": l || void 0,
      ref: h,
      style: {
        position: "relative",
        ...a?.tabPanels,
        ...l && { display: "none" }
      },
      children: [
        d.tabs.length === 0 && i?.(d),
        m && /* @__PURE__ */ j("div", { style: { display: "contents" }, children: /* @__PURE__ */ j(
          Bs,
          {
            hiddenTabBehavior: t(m),
            renderTabContent: s,
            tab: m
          }
        ) })
      ]
    }
  );
}
const Ki = /* @__PURE__ */ Object.assign(Kc, {
  displayName: "Workspace.TabPanels"
});
function Ks(e, t) {
  return t === e || t.hasAttribute("data-tab-list") && t.closest("[data-tabset-header]") === e;
}
function Jc(e, t) {
  const n = Array.from(
    e.querySelectorAll("[data-tabset-drag-handle]")
  ).filter((o) => o.closest("[data-tabset-header]") === e);
  return n.length > 0 ? n.some((o) => o.contains(t)) : Ks(e, t);
}
function Zc() {
  const {
    activeTabsetId: e,
    classNames: t,
    disabled: n,
    dragGroup: o,
    dragStore: i,
    model: s,
    modelIndex: r,
    renderTabsetToolbar: a,
    setActiveTabsetId: l,
    startFloatingGesture: c,
    startTabsetDrag: u,
    styles: d,
    updateModel: p
  } = rt("TabsetView"), {
    isCollapsed: h,
    setHeaderElement: f,
    setTabsetElement: m,
    tabPlacement: b,
    tabset: g
  } = Wn("TabsetView"), w = Vt(
    i,
    ({ dragSource: L }) => L?.type === "tabset" && L.tabsetId === g.id
  ), v = r.floatingTabsetIds.has(g.id), z = Ao(
    s,
    g,
    n,
    o
  ), M = /* @__PURE__ */ qe(
    "div",
    {
      className: t?.header,
      "data-tab-placement": b,
      "data-tabset-collapsed": h || void 0,
      "data-tabset-header": !0,
      onClick: (L) => {
        h && Ks(L.currentTarget, L.target) && p("expand", !0, (W) => Bn(W, g.id));
      },
      onPointerDown: (L) => {
        L.button === 0 && !z && Jc(L.currentTarget, L.target) && (v ? c(g.id, "move", L) : u(g.id, L));
      },
      ref: f,
      style: d?.header,
      children: [
        /* @__PURE__ */ j(Xc, { children: g.tabs.map((L) => /* @__PURE__ */ j(qc, { tab: L }, L.id)) }),
        a && /* @__PURE__ */ j(
          "div",
          {
            className: t?.toolbar,
            "data-tab-placement": b,
            "data-tabset-collapsed": h || void 0,
            "data-tabset-toolbar": !0,
            style: d?.toolbar,
            children: a(g)
          }
        )
      ]
    }
  );
  return /* @__PURE__ */ j(
    "div",
    {
      className: t?.tabset,
      "data-tab-placement": b,
      "data-tabset": !0,
      "data-tabset-active": e === g.id || void 0,
      "data-tabset-collapsed": h || void 0,
      "data-tabset-dragging": w || void 0,
      "data-tabset-floating": v || void 0,
      "data-tabset-id": g.id,
      "data-tabset-maximized": s.maximizedTabsetId === g.id || void 0,
      onFocusCapture: () => l(g.id),
      onPointerDownCapture: () => l(g.id),
      ref: m,
      style: d?.tabset,
      children: b === "bottom" || b === "right" ? /* @__PURE__ */ qe(si, { children: [
        /* @__PURE__ */ j(Ki, {}),
        M
      ] }) : /* @__PURE__ */ qe(si, { children: [
        M,
        /* @__PURE__ */ j(Ki, {})
      ] })
    }
  );
}
const Qc = /* @__PURE__ */ Object.assign(Zc, {
  displayName: "Workspace.TabsetView"
});
function el(e, t) {
  const n = e.getBoundingClientRect(), o = t.getBoundingClientRect();
  return {
    height: Math.max(
      0,
      Math.round(
        (n.height - o.height) / ye(e, "vertical")
      )
    ),
    width: Math.max(
      0,
      Math.round(
        (n.width - o.width) / ye(e, "horizontal")
      )
    )
  };
}
function tl(e, t, n) {
  const o = t.dataset.tabPlacement === "left" || t.dataset.tabPlacement === "right", i = o ? "width" : "height", s = t.style, r = s.flex, a = s[i];
  s.flex = "none", s[i] = "max-content";
  const l = t.getBoundingClientRect();
  s.flex = r, s[i] = a;
  const c = o ? l.width / ye(t, "horizontal") : l.height / ye(t, "vertical"), u = e.ownerDocument.defaultView?.getComputedStyle(e), d = n === "horizontal" ? ["left", "right"] : ["top", "bottom"];
  let p = 0;
  for (const h of d)
    p += (parseFloat(u?.getPropertyValue(`padding-${h}`) ?? "") || 0) + (parseFloat(
      u?.getPropertyValue(`border-${h}-width`) ?? ""
    ) || 0);
  return Math.round(c + p);
}
function nl({
  isMaximizedOverlay: e = !1,
  tabset: t
}) {
  const {
    collapseOverrides: n,
    collapsePreview: o,
    getTabsetHandle: i,
    model: s,
    modelIndex: r,
    outerParents: a,
    reportChromeSize: l,
    reportCollapsedSize: c,
    tabPlacement: u,
    tabsetElements: d
  } = rt("TabsetSlot"), p = r.parentsById.get(t.id), h = p?.orientation, f = !e && xn(t, n), m = o[t.id] !== void 0;
  let b = t.tabPlacement ?? u;
  if (f && p) {
    const O = p.children[p.children.length - 1]?.id === t.id, N = b === "left" || b === "right";
    h === "horizontal" && !N ? b = O ? "right" : "left" : h === "vertical" && N && (b = O ? "bottom" : "top");
  }
  const [g, w] = oe(
    null
  ), [v, z] = oe(null), [M, L] = oe(
    null
  ), [W] = oe(() => ({
    panels: null,
    tabList: null,
    tabset: null
  })), U = te(
    (O) => {
      W.tabset = O, w(O);
    },
    [W]
  ), P = te(
    (O) => {
      W.panels = O, L(O);
    },
    [W]
  ), T = te(
    (O) => {
      W.tabList = O;
    },
    [W]
  );
  ue(
    () => d.register(t.id, W),
    [W, t.id, d]
  );
  const C = t.collapsible && !e ? h : void 0, D = J(null);
  ue(() => {
    if (!g || !M)
      return;
    const O = () => {
      if (!m) {
        if (!f) {
          const H = M.getBoundingClientRect();
          (h === "horizontal" ? H.width <= 0 : h === "vertical" ? H.height <= 0 : H.width <= 0 || H.height <= 0) || l(
            t.id,
            el(g, M)
          );
        }
        if (v && C) {
          const H = tl(
            g,
            v,
            C
          ), B = D.current;
          f ? (D.current = {
            orientation: C,
            size: H
          }, c(t.id, H)) : B?.orientation !== C && c(t.id, H);
        }
      }
    };
    O();
    const N = g.ownerDocument.defaultView?.ResizeObserver;
    if (N) {
      const H = new N(O);
      return H.observe(g), H.observe(M), v && H.observe(v), () => {
        H.disconnect();
      };
    }
  }, [
    C,
    v,
    f,
    m,
    h,
    M,
    l,
    c,
    b,
    t.id,
    g
  ]);
  const V = pe(
    () => ({
      isCollapsed: f,
      setHeaderElement: z,
      setPanelsElement: P,
      setTabListElement: T,
      setTabsetElement: U,
      tabPlacement: b,
      tabset: t
    }),
    [
      f,
      P,
      T,
      U,
      b,
      t
    ]
  );
  return !e && s.maximizedTabsetId === t.id ? null : /* @__PURE__ */ j(Pn.Provider, { value: a.grid, children: /* @__PURE__ */ j(On.Provider, { value: a.group, children: /* @__PURE__ */ j(Nn.Provider, { value: a.panel, children: /* @__PURE__ */ j(Mt.Provider, { value: null, children: /* @__PURE__ */ j(st.Provider, { value: i(t.id), children: /* @__PURE__ */ j($s.Provider, { value: V, children: /* @__PURE__ */ j(Qc, {}) }) }) }) }) }) });
}
const Fo = /* @__PURE__ */ Object.assign(nl, {
  displayName: "Workspace.TabsetSlot"
}), Ji = [
  "top",
  "right",
  "bottom",
  "left",
  "top-left",
  "top-right",
  "bottom-right",
  "bottom-left"
], to = 8, Zi = 12;
function ol({
  floating: e,
  layoutElementRef: t
}) {
  const [n, o] = oe(null);
  ue(() => {
    const a = t.current;
    if (!a)
      return;
    const l = () => o((u) => {
      const d = {
        height: a.offsetHeight,
        left: a.offsetLeft,
        top: a.offsetTop,
        width: a.offsetWidth
      };
      return u && u.height === d.height && u.left === d.left && u.top === d.top && u.width === d.width ? u : d;
    });
    l();
    const c = a.ownerDocument.defaultView?.ResizeObserver;
    if (c) {
      const u = new c(l);
      return u.observe(a), a.parentElement && u.observe(a.parentElement), () => {
        u.disconnect();
      };
    }
  }, [t]);
  const i = J([]), s = e.map(({ id: a }) => a), r = [
    ...i.current.filter((a) => s.includes(a)),
    ...s.filter((a) => !i.current.includes(a))
  ];
  return i.current = r, /* @__PURE__ */ j(
    "div",
    {
      "data-workspace-floating": !0,
      style: {
        // Floating tabsets stay within the workspace (e.g. the rest of one moved below its bottom edge isn't shown over the page beneath it)
        overflow: "hidden",
        pointerEvents: "none",
        position: "absolute",
        zIndex: 1,
        ...n ? {
          height: n.height,
          left: n.left,
          top: n.top,
          width: n.width
        } : { inset: 0 }
      },
      children: r.map((a) => {
        const l = s.indexOf(a);
        return /* @__PURE__ */ j(
          il,
          {
            layoutBox: n,
            stackIndex: l,
            tabset: e[l]
          },
          a
        );
      })
    }
  );
}
function il({
  layoutBox: e,
  stackIndex: t,
  tabset: n
}) {
  const {
    classNames: o,
    disabled: i,
    startFloatingGesture: s,
    styles: r,
    tabPlacement: a,
    updateModel: l
  } = rt("FloatingTabset"), c = i || !!n.disableDrag, u = !!n.collapsed, d = n.tabPlacement ?? a, p = d === "left" || d === "right", h = u ? Ji.filter(
    (w) => p ? w === "top" || w === "bottom" : w === "left" || w === "right"
  ) : Ji, f = J(null), m = e?.width, b = e?.height;
  ue(() => {
    const w = f.current;
    if (!w || m === void 0 || b === void 0 || w.hasAttribute(po))
      return;
    const v = _s(w);
    if (!v)
      return;
    const { x: z, y: M } = Fs(
      { x: n.x, y: n.y },
      v,
      { height: b, width: m }
    );
    w.style.left = `${z}px`, w.style.top = `${M}px`;
  });
  const g = n.id;
  return Be(() => {
    const w = f.current;
    if (!w)
      return;
    const v = () => l("raise", !0, (z) => Hc(z, g));
    return w.addEventListener("pointerdown", v, !0), () => {
      w.removeEventListener("pointerdown", v, !0);
    };
  }, [g, l]), /* @__PURE__ */ qe(
    "div",
    {
      className: o?.floatingTabset,
      "data-floating-tabset": n.id,
      "data-tabset-collapsed": u || void 0,
      ref: f,
      style: {
        ...r?.floatingTabset,
        height: u && !p ? "auto" : n.height,
        left: n.x,
        pointerEvents: "auto",
        position: "absolute",
        top: n.y,
        width: u && p ? "auto" : n.width,
        zIndex: t + 1
      },
      children: [
        /* @__PURE__ */ j(Fo, { tabset: n }),
        !c && h.map((w) => /* @__PURE__ */ j(
          "div",
          {
            className: o?.floatingResizeHandle,
            "data-floating-resize-handle": w,
            onPointerDown: (v) => {
              v.button === 0 && s(n.id, w, v);
            },
            style: {
              ...r?.floatingResizeHandle,
              ...sl(w)
            }
          },
          w
        ))
      ]
    }
  );
}
function sl(e) {
  const t = -to / 2, n = {
    cursor: Ws[e],
    position: "absolute",
    touchAction: "none"
  };
  return e.includes("-") ? {
    ...n,
    height: Zi,
    width: Zi,
    zIndex: 1,
    [e.startsWith("top") ? "top" : "bottom"]: t,
    [e.endsWith("left") ? "left" : "right"]: t
  } : e === "top" || e === "bottom" ? { ...n, [e]: t, height: to, left: 0, right: 0 } : { ...n, [e]: t, bottom: 0, top: 0, width: to };
}
const rl = /* @__PURE__ */ Object.assign(
  ol,
  { displayName: "Workspace.FloatingTabsets" }
);
function go(e, t) {
  if (e.type === "split") {
    if (e.id === t)
      return e;
    for (const n of e.children) {
      const o = go(n, t);
      if (o)
        return o;
    }
  }
}
function al(e, t, n, o, i) {
  const s = go(e.root, t);
  if (!s || s.children.length !== Object.keys(n).length || s.children.some(({ id: c }) => n[c] === void 0))
    return e;
  const r = Oe(e), a = go(r.root, t);
  if (!a)
    return e;
  let l = !1;
  for (const c of a.children) {
    if (i?.has(c.id))
      continue;
    const u = c.type === "tabset" && (o ? o.has(c.id) : !!c.collapsed);
    c.type === "tabset" && u !== !!c.collapsed && (l = !0, u ? c.collapsed = !0 : delete c.collapsed), u || (c.size = n[c.id] ?? c.size);
  }
  return l || (i?.size ?? 0) > 0 || a.children.some((c) => c.type === "tabset" && c.collapsed) ? Me(r) : r;
}
function Qi(e, t, n) {
  const o = bs(
    e.map((l) => {
      const c = n[l.itemId];
      return typeof c == "number" ? { ...l, defaultSize: c } : l;
    })
  );
  let i = 0;
  const s = [];
  for (const l of e)
    t.has(l.itemId) ? i += l.collapsedSize : s.push(l);
  const r = cl(
    s.map(({ itemId: l, maxSize: c, minSize: u }) => ({
      maxSize: c,
      minSize: u,
      weight: o[l]
    })),
    Math.max(0, 100 - i)
  ), a = {};
  for (const { collapsedSize: l, itemId: c } of e)
    a[c] = we(
      t.has(c) ? l : r[s.findIndex((u) => u.itemId === c)]
    );
  return a;
}
function cl(e, t) {
  const n = (r, a) => {
    const l = r.reduce((c, u) => c + u, 0);
    return r.map(
      (c) => l > 0 ? c / l * a : a / r.length
    );
  }, o = /* @__PURE__ */ new Map();
  for (; o.size < e.length; ) {
    const r = e.map((p, h) => ({ ...p, index: h })).filter(({ index: p }) => !o.has(p)), a = t - Array.from(o.values()).reduce((p, h) => p + h, 0), l = n(
      r.map(({ weight: p }) => p),
      a
    );
    let c = 0;
    const u = [];
    if (r.forEach(({ index: p, maxSize: h, minSize: f }, m) => {
      const b = l[m], g = Math.min(h, Math.max(f, b));
      g !== b && (c += g - b, u.push({ index: p, isMinimum: g > b, size: g }));
    }), u.length === 0) {
      r.forEach(
        ({ index: p }, h) => o.set(p, l[h])
      );
      break;
    }
    let d = 0;
    for (const { index: p, isMinimum: h, size: f } of u)
      (c === 0 || c > 0 === h) && (o.set(p, f), d++);
    if (d === 0)
      for (const { index: p, size: h } of u)
        o.set(p, h);
  }
  const i = e.map((r, a) => o.get(a)), s = i.reduce((r, a) => r + a, 0);
  return Math.abs(s - t) > 1e-3 ? n(
    e.map(({ weight: r }) => r),
    t
  ) : i;
}
function ll(e, t) {
  let n = !1;
  for (const o of e) {
    if (o.type !== "tabset")
      continue;
    const i = t.has(o.id);
    if (i !== !!o.collapsed) {
      if (!i)
        return "expand";
      n = !0;
    }
  }
  return n ? "collapse" : "resize";
}
function ul({ split: e }) {
  const {
    classNames: t,
    collapsedSizes: n,
    collapseToFit: o,
    disabled: i,
    id: s,
    maximumSizes: r,
    minimumSizes: a,
    renderSeparator: l,
    reportCollapsePreview: c,
    reportCollapseToFit: u,
    reportSeparatorsSize: d,
    resizePreviewMode: p,
    splitGeneration: h,
    styles: f,
    updateModel: m
  } = rt("SplitView"), b = `${s}-${e.id}`, g = (E) => `${s}:${E}`, w = Pa(), [v, z] = oe(null), M = J(null), L = te((E) => {
    M.current = E, z(E);
  }, []), W = () => {
    const E = M.current;
    return E ? e.orientation === "horizontal" ? E.offsetWidth : E.offsetHeight : 0;
  }, U = e.children.map(({ id: E }) => E).join(), P = e.children.map(({ id: E }) => g(E)).join(), T = new Set(
    e.children.filter((E) => E.type === "tabset" && E.collapsed).map(({ id: E }) => g(E))
  ), C = e.children.filter((E) => E.type === "tabset" && E.collapsed).map(({ id: E }) => `${E}=${n[E] ?? 0}`).join(), D = `${h}:${e.orientation}:${U}:${C}`, V = J(null), [, O] = oe(0), N = () => {
    const E = Re(b);
    return !E || E.defaultLayoutDeferred || E.derivedItemConstraints.map(({ itemId: q }) => q).join() !== P ? null : `${D}|${E.derivedItemConstraints.filter(({ itemId: q }) => T.has(q)).map(({ collapsedSize: q }) => q).join()}`;
  }, H = () => {
    const E = {};
    for (const q of e.children)
      E[g(q.id)] = q.size;
    return E;
  }, B = (E) => {
    const q = Re(b)?.derivedItemConstraints ?? [], R = /* @__PURE__ */ new Set();
    for (const { id: S } of e.children) {
      const k = g(S), A = q.find(({ itemId: F }) => F === k);
      A?.collapsible && E[k] !== void 0 && E[k] <= A.collapsedSize + 0.01 && R.add(S);
    }
    return R;
  }, I = (E, q) => {
    const R = B(E), S = {};
    for (const k of e.children)
      if (k.type === "tabset") {
        const A = R.has(k.id);
        S[k.id] = q || A !== !!k.collapsed ? A : void 0;
      }
    return S;
  }, G = () => {
    const E = Pe();
    return E.state === "active" && E.hitRegions.some((q) => q.axis.id === b);
  }, _ = Se(
    (E) => c(
      I(E, !0)
    )
  ), se = (E) => {
    G() || u(I(E, !1));
  }, ie = J(null), re = J(null), Q = Se(() => {
    const E = N();
    if (E === null || V.current !== E || G())
      return;
    const q = W(), R = re.current;
    if (re.current = q, R === null || R === q)
      return;
    const { derivedItemConstraints: S, layout: k } = Re(b), A = Qi(
      S,
      T,
      H()
    ), F = B(k);
    e.children.some((X) => {
      const Z = g(X.id);
      return X.type === "tabset" && F.has(X.id) !== !!X.collapsed || typeof X.size == "number" && !me(k[Z], A[Z], 0.01);
    }) && w.current?.setLayout(A);
  }), ce = e.children.some(
    (E) => E.type === "tabset" && E.collapsible
  );
  return Be(
    () => Et(b, ({ axis: E, next: q, prev: R }) => {
      R?.derivedItemConstraints !== q.derivedItemConstraints && (Q(), ce && O((k) => k + 1));
      const S = Pe();
      ce && S.state === "active" && S.hitRegions.some((k) => k.axis === E) && _(q.layout);
    }),
    [
      Q,
      b,
      ce,
      _
    ]
  ), ue(() => {
    const E = N();
    if (E === null || (V.current !== E && (V.current = E, w.current?.setLayout(
      Qi(
        Re(b).derivedItemConstraints,
        T,
        H()
      )
    ), re.current = W()), G()))
      return;
    const { derivedItemConstraints: q } = Re(b), R = ie.current, S = W(), { layout: k } = Re(b);
    (R?.constraints !== q || R.layout !== k || R.size !== S || R.structureKey !== D) && (ie.current = {
      constraints: q,
      layout: k,
      size: S,
      structureKey: D
    }, se(k));
  }), ue(() => {
    const E = v?.ownerDocument.defaultView;
    if (!v || !E)
      return;
    const q = (A) => $e(A) && A.hasAttribute("data-separator"), R = () => {
      let A = 0, F = 0;
      const Y = E.getComputedStyle(v), X = parseFloat(
        e.orientation === "horizontal" ? Y.columnGap : Y.rowGap
      ) || 0;
      for (const Z of v.children)
        if ($e(Z) && Z.hasAttribute("data-panel") && F++, q(Z))
          if (F++, "offsetWidth" in Z) {
            const { offsetHeight: K, offsetWidth: ne } = Z;
            A += e.orientation === "horizontal" ? ne : K;
          } else {
            const K = Z.getBoundingClientRect();
            A += e.orientation === "horizontal" ? K.width : K.height;
          }
      A += X * Math.max(0, F - 1), d(e.id, A);
    }, S = E.ResizeObserver ? new E.ResizeObserver(R) : null;
    S?.observe(v);
    for (const A of v.children)
      q(A) && S?.observe(A);
    const k = E.MutationObserver ? new E.MutationObserver((A) => {
      for (const F of A)
        F.addedNodes.forEach((Y) => {
          q(Y) && S?.observe(Y);
        }), F.removedNodes.forEach((Y) => {
          q(Y) && S?.unobserve(Y);
        });
      R();
    }) : null;
    return k?.observe(v, { childList: !0 }), R(), () => {
      S?.disconnect(), k?.disconnect();
    };
  }, [
    t?.split,
    v,
    d,
    e.id,
    e.orientation,
    f?.split
  ]), /* @__PURE__ */ j(
    Da,
    {
      className: t?.split,
      "data-split": "",
      "data-split-id": e.id,
      disabled: i,
      elementRef: L,
      groupRef: w,
      id: b,
      onLayoutChanged: (E, { isUserInteraction: q, requestedLayout: R }) => {
        if (q) {
          const S = R ?? E, k = {};
          for (const { id: X } of e.children) {
            const Z = S[g(X)];
            Z !== void 0 && (k[X] = Z);
          }
          const A = B(E), F = /* @__PURE__ */ new Set();
          for (const X of A)
            o[X] === !0 && (A.delete(X), F.add(X));
          const Y = ll(e.children, A);
          m(
            Y,
            !0,
            (X) => al(
              X,
              e.id,
              k,
              A,
              F
            )
          );
        } else {
          const S = N();
          S !== null && V.current === S ? se(E) : O((k) => k + 1);
        }
      },
      orientation: e.orientation,
      resizePreviewMode: p,
      style: f?.split,
      children: e.children.map((E, q) => {
        const R = a.get(E.id), S = e.orientation === "horizontal" ? R?.width : R?.height, k = r.get(E.id), A = e.orientation === "horizontal" ? k?.width : k?.height;
        return /* @__PURE__ */ qe(Tr, { children: [
          q > 0 && (l ? l(e.orientation) : /* @__PURE__ */ j(_a, {})),
          /* @__PURE__ */ j(
            Oa,
            {
              collapsedSize: E.type === "tabset" && E.collapsible ? `${n[E.id] ?? 0}px` : void 0,
              collapsible: E.type === "tabset" && (!!E.collapsed || Po(e, E)),
              defaultSize: typeof E.size == "number" ? `${E.size}%` : E.size,
              id: g(E.id),
              maxSize: A !== void 0 && Number.isFinite(A) ? `${Math.max(A, S ?? 0)}px` : void 0,
              minSize: S || void 0,
              children: /* @__PURE__ */ j(Js, { node: E })
            }
          )
        ] }, E.id);
      })
    }
  );
}
const dl = /* @__PURE__ */ Object.assign(ul, {
  displayName: "Workspace.SplitView"
});
function fl({ node: e }) {
  return e.type === "split" ? /* @__PURE__ */ j(dl, { split: e }) : /* @__PURE__ */ j(Fo, { tabset: e });
}
const Js = /* @__PURE__ */ Object.assign(fl, {
  displayName: "Workspace.NodeView"
});
function St(e, t) {
  const n = Object.keys(e).filter(
    (i) => !t.has(i)
  );
  if (n.length === 0)
    return e;
  const o = { ...e };
  for (const i of n)
    delete o[i];
  return o;
}
function es(e, t) {
  let n = e;
  for (const [o, i] of Object.entries(t))
    e[o] !== i && (n === e && (n = { ...e }), i === void 0 ? delete n[o] : n[o] = i);
  return n;
}
function wt(e, t) {
  if (e === void 0)
    return;
  if (typeof e != "string") {
    process.env.NODE_ENV !== "production" && Fe(
      `Workspace tabset sizes (e.g. minWidth or maxWidth) must be strings with units (e.g. "200px"); received ${e}`
    );
    return;
  }
  const [n, o] = xo(e);
  switch (o) {
    case "%": {
      process.env.NODE_ENV !== "production" && Fe(
        `Workspace tabset sizes (e.g. minWidth or maxWidth) must use absolute units (px, em, rem, vh, or vw); received "${e}". Use "vw" or "vh" for sizes relative to the viewport.`
      );
      return;
    }
    case "px":
      return n;
    default:
      return t ? lt({
        axisSize: 0,
        itemElement: t,
        styleProp: e
      }) : void 0;
  }
}
function pl({
  children: e,
  className: t,
  dragType: n,
  elementRef: o,
  isTearOff: i,
  pointRef: s,
  style: r
}) {
  const a = J(null);
  return ue(() => (o.current = a.current, mo(a.current, s.current), () => {
    o.current = null;
  }), [o, s]), /* @__PURE__ */ j(
    "div",
    {
      className: t,
      "data-drag-preview": !0,
      "data-drag-type": n,
      "data-tear-off": i || void 0,
      ref: a,
      style: {
        zIndex: 2,
        ...r,
        left: 0,
        pointerEvents: "none",
        position: "fixed",
        top: 0
      },
      children: e
    }
  );
}
const hl = /* @__PURE__ */ Object.assign(pl, {
  displayName: "Workspace.DragPreview"
});
function ml(e, t, n, o = !1) {
  const i = t === "left" || t === "right" ? "horizontal" : "vertical", s = It({ edge: t }, o), r = "edge" in s ? s.edge : t;
  let a, l;
  if (n?.type === "tab" ? (a = co(e, n.tabId, { edge: r }), l = nt(a, n.tabId)?.id) : n?.type === "tabset" && (a = lo(e, n.tabsetId, { edge: r }), l = n.tabsetId), a !== void 0 && a !== e) {
    const { root: u } = a, d = u.type === "split" && u.orientation === i ? u.children.find(({ id: p }) => p === l) : void 0;
    if (typeof d?.size == "number")
      return d.size / 100;
  }
  const { root: c } = e;
  return c.type === "split" && c.orientation === i ? 1 / (c.children.filter(
    (d) => d.type !== "tabset" || !d.collapsed
  ).length + 1) : 0.5;
}
function gl(e, t) {
  return e === void 0 || t === void 0 ? e === t : e.bottom === t.bottom && e.left === t.left && e.right === t.right && e.top === t.top;
}
function bl(e, t, n, o = 0.5) {
  const i = e.getBoundingClientRect(), s = t.getBoundingClientRect(), r = ye(e, "horizontal"), a = ye(e, "vertical");
  let l = (s.left - i.left) / r, c = (s.top - i.top) / a, u = s.width / r, d = s.height / a;
  switch (n) {
    case "bottom": {
      c += d * (1 - o), d *= o;
      break;
    }
    case "left": {
      u *= o;
      break;
    }
    case "right": {
      l += u * (1 - o), u *= o;
      break;
    }
    case "top": {
      d *= o;
      break;
    }
  }
  return {
    bottom: i.height / a - c - d,
    left: l,
    right: i.width / r - l - u,
    top: c
  };
}
function yl({
  className: e,
  dragStore: t,
  layoutElementRef: n,
  model: o,
  style: i,
  tabsetElements: s
}) {
  const r = Vt(t, (f) => f.dropTarget), a = Vt(t, (f) => f.dragSource), l = J(null), [c, u] = oe(), d = r && "region" in r ? r.region : void 0, p = r && "tabsetId" in r ? r.tabsetId : void 0, h = r && "edge" in r ? r.edge : void 0;
  return ue(() => {
    const f = l.current, m = h ? n.current : d && p ? s.get(p)?.panels : void 0, b = h ?? d;
    if (!f || !m || !b)
      return;
    const g = h ? ml(
      o,
      h,
      a,
      et(n.current)
    ) : void 0, w = () => {
      if (!m.isConnected)
        return;
      const z = bl(
        f,
        m,
        b,
        g
      );
      u(
        (M) => gl(M, z) ? M : z
      );
    };
    w();
    const v = f.ownerDocument.defaultView?.ResizeObserver;
    if (v) {
      const z = new v(w);
      return z.observe(f), z.observe(m), () => {
        z.disconnect();
      };
    }
  }, [
    a,
    h,
    n,
    o,
    d,
    s,
    p
  ]), /* @__PURE__ */ j(
    "div",
    {
      ref: l,
      style: {
        inset: 0,
        pointerEvents: "none",
        position: "absolute",
        zIndex: 1
      },
      children: /* @__PURE__ */ j(
        "div",
        {
          className: e,
          "data-drop-indicator": !0,
          "data-edge": h,
          "data-region": d,
          style: {
            ...i,
            ...c,
            ...!d && !h && { opacity: 0 },
            pointerEvents: "none",
            position: "absolute"
          }
        }
      )
    }
  );
}
const vl = /* @__PURE__ */ Object.assign(
  yl,
  {
    displayName: "Workspace.DropIndicator"
  }
);
function Sl({
  className: e,
  classNames: t,
  defaultModel: n,
  disabled: o = !1,
  disableDragBetweenApps: i = !1,
  disableDrop: s,
  dragGroup: r,
  elementRef: a,
  hiddenTabBehavior: l = "keep-mounted",
  id: c,
  onModelChanged: u,
  onTearOff: d,
  renderDragPreview: p,
  renderEmptyTabset: h,
  renderSeparator: f,
  renderTab: m,
  renderTabContent: b,
  renderTabsetDragPreview: g,
  renderTabsetToolbar: w,
  resizePreviewMode: v,
  serverRenderTabContent: z = !1,
  style: M,
  styles: L,
  tabPlacement: W = "top",
  tabRemovalSelectionBehavior: U = "adjacent",
  tabsetMinHeight: P,
  tabsetMinWidth: T,
  workspaceRef: C,
  ...D
}) {
  const V = ft(c), O = fe(Pn), N = fe(On), H = fe(Nn), B = pe(
    () => ({ grid: O, group: N, panel: H }),
    [O, N, H]
  ), [I, G] = oe(
    () => Kn(
      In($i(n)),
      U
    )
  ), _ = J(I), [se, ie] = oe(0), [re, Q] = oe(), ce = J(void 0), E = te((y) => {
    ce.current !== y && (ce.current = y, Q(y));
  }, []), q = Se(
    (...y) => u?.(...y)
  ), R = Se(
    () => U
  ), S = te(
    (y, x, $) => {
      const ee = R(), ve = Kn(_.current, ee), Ye = $(ve);
      if (Ye !== ve) {
        const ct = Kn(Ye, ee);
        _.current = ct, G(ct), q(ct, {
          isUserInteraction: x,
          reason: y
        });
      }
    },
    [R, q]
  ), [k] = oe(Za), [A] = oe(Ja), [F] = oe(Qa), Y = J(null), X = J(null), Z = pe(() => {
    const y = () => {
      const x = ce.current;
      return x !== void 0 && Ee(_.current).tabsetsById.has(x) ? x : void 0;
    };
    return {
      addTab: (x, $ = {}) => {
        const ee = tc(_.current, x, {
          ...$,
          tabsetId: $.tabsetId ?? y()
        });
        return S(ee.added ? "add" : "select", !1, () => ee.model), ee.added;
      },
      closeTab: (x) => S("close", !1, ($) => $t($, x)),
      closeTabset: (x) => S("close", !1, ($) => Xn($, x)),
      collapseTabset: (x) => S(
        "collapse",
        !1,
        ($) => Ds($, x)
      ),
      expandTabset: (x) => S("expand", !1, ($) => Bn($, x)),
      floatTab: (x, $) => S("float", !1, (ee) => {
        const ve = Ee(ee).tabsetsByTabId.get(x)?.id;
        return oc(
          ee,
          x,
          Yi(
            X.current,
            ve !== void 0 ? F.get(ve)?.tabset : void 0,
            $
          )
        );
      }),
      floatTabset: (x, $) => S(
        "float",
        !1,
        (ee) => ic(
          ee,
          x,
          Yi(
            X.current,
            F.get(x)?.tabset,
            $
          )
        )
      ),
      getActiveTabsetId: y,
      getModel: () => _.current,
      getTabListFreeSpace: (x) => k.get(x),
      maximizeTabset: (x) => S(
        "maximize",
        !1,
        ($) => Ps($, x)
      ),
      moveTab: (x, $) => S(
        "move",
        !1,
        (ee) => co(
          ee,
          x,
          It($, et(Y.current))
        )
      ),
      moveTabset: (x, $) => S(
        "move",
        !1,
        (ee) => lo(
          ee,
          x,
          It($, et(Y.current))
        )
      ),
      restoreTabset: () => S("restore", !1, As),
      selectTab: (x) => S("select", !1, ($) => zn($, x)),
      setModel: (x) => (S(
        "set-model",
        !1,
        () => In($i(x))
      ), ie(($) => $ + 1), _.current),
      subscribeToTabListFreeSpace: (x, $) => k.subscribe(x, $),
      updateTab: (x, $) => S("update", !1, (ee) => fc(ee, x, $)),
      updateTabset: (x, $) => S(
        "update",
        !1,
        (ee) => Ns(ee, x, $)
      )
    };
  }, [k, F, S]);
  Cn(
    C,
    () => Z,
    [Z]
  );
  const K = pe(
    () => ({ ...Z, id: V }),
    [Z, V]
  ), [ne] = oe(() => ({
    tabs: /* @__PURE__ */ new Map(),
    tabsets: /* @__PURE__ */ new Map()
  })), Le = te(
    (y) => {
      let x = ne.tabs.get(y);
      return x || (x = {
        close: () => Z.closeTab(y),
        float: ($) => Z.floatTab(y, $),
        getTabsetId: () => Ee(_.current).tabsetsByTabId.get(y)?.id ?? "",
        id: y,
        isSelected: () => Ee(_.current).tabsetsByTabId.get(y)?.selectedId === y,
        select: () => Z.selectTab(y),
        workspaceId: V
      }, ne.tabs.set(y, x)), x;
    },
    [Z, ne, V]
  ), xe = te(
    (y) => {
      let x = ne.tabsets.get(y);
      return x || (x = {
        addTab: ($, ee = {}) => Z.addTab($, { ...ee, tabsetId: y }),
        close: () => Z.closeTabset(y),
        collapse: () => Z.collapseTabset(y),
        expand: () => Z.expandTabset(y),
        float: ($) => Z.floatTabset(y, $),
        id: y,
        isCollapsed: () => !!Ee(_.current).tabsetsById.get(y)?.collapsed,
        isFloating: () => Ee(_.current).floatingTabsetIds.has(y),
        isMaximized: () => _.current.maximizedTabsetId === y,
        maximize: () => Z.maximizeTabset(y),
        restore: () => {
          _.current.maximizedTabsetId === y && Z.restoreTabset();
        },
        workspaceId: V
      }, ne.tabsets.set(y, x)), x;
    },
    [Z, ne, V]
  ), [Ne, he] = oe(null), Te = it(
    Y,
    he,
    a
  ), [ge] = oe(() => /* @__PURE__ */ new Map()), _e = J(0), Ae = Ne?.ownerDocument, ke = te(
    (y) => {
      let x = ge.get(y);
      if (!x) {
        const $ = ++_e.current;
        x = {
          element: null,
          panelId: `${V}-tab-panel-${$}`,
          tabElementId: `${V}-tab-${$}`
        }, ge.set(y, x);
      }
      return !x.element && Ae && (x.element = Ae.createElement("div")), x;
    },
    [V, Ae, ge]
  ), de = Ee(I);
  Be(() => {
    for (const [y, x] of ge)
      de.tabsById.has(y) || (x.element?.remove(), ge.delete(y), ne.tabs.delete(y));
    for (const y of ne.tabs.keys())
      de.tabsById.has(y) || ne.tabs.delete(y);
    for (const y of ne.tabsets.keys())
      de.tabsetsById.has(y) || ne.tabsets.delete(y);
  }, [ne, de, ge]);
  const pt = ot(
    An,
    () => !1,
    () => !0
  ), ht = te(
    (y) => typeof l == "function" ? l(y) : l,
    [l]
  ), mt = te(
    (y) => typeof z == "function" ? z(y) : z,
    [z]
  ), [at, le] = oe({}), [ze, Ie] = oe({}), [We, Zt] = oe({}), gt = te(
    (y, x) => le(
      ($) => $[y]?.height === x.height && $[y]?.width === x.width ? $ : { ...$, [y]: x }
    ),
    []
  ), [bt, Hn] = oe({}), _o = te(
    (y) => Hn((x) => es(x, y)),
    []
  ), [Wo, Go] = oe({}), Ho = te(
    (y) => Go((x) => es(x, y)),
    []
  ), Qt = pe(
    () => new Set(de.parentsById.keys()),
    [de]
  ), Ze = pe(
    () => St(Wo, Qt),
    [Wo, Qt]
  ), en = pe(
    () => Object.keys(Ze).length === 0 ? bt : Object.keys(bt).length === 0 ? Ze : { ...Ze, ...bt },
    [bt, Ze]
  );
  Be(
    () => Ln(({ next: y, prev: x }) => {
      x.state === "active" && y.state !== "active" && Hn(
        ($) => Object.keys($).length > 0 ? {} : $
      );
    }),
    []
  );
  const Vo = te(
    (y, x) => Zt(
      ($) => $[y] === x ? $ : { ...$, [y]: x }
    ),
    []
  ), jo = te(
    (y, x) => Ie(
      ($) => $[y] === x ? $ : { ...$, [y]: x }
    ),
    []
  );
  Be(() => {
    le((y) => St(y, de.nodeIds)), Ie((y) => St(y, de.nodeIds)), Zt((y) => St(y, de.nodeIds)), Hn((y) => St(y, de.nodeIds)), Go((y) => St(y, Qt));
  }, [de, Qt]);
  const [Vn, Zs] = oe(null);
  Be(() => {
    if (!Ne)
      return;
    const y = () => Zs({ element: Ne });
    y();
    const x = Ne.ownerDocument.defaultView;
    return x?.addEventListener("resize", y), () => {
      x?.removeEventListener("resize", y);
    };
  }, [Ne]);
  const { maximumSizes: qo, minimumSizes: Uo } = pe(() => {
    const y = Vn?.element ?? null;
    return Ka(I.root, {
      getChromeSize: (x) => at[x],
      getCollapsedSize: (x) => We[x],
      getContentMaximumSize: (x) => ({
        height: wt(x.maxHeight, y) ?? 1 / 0,
        width: wt(x.maxWidth, y) ?? 1 / 0
      }),
      getContentMinimumSize: (x) => ({
        height: wt(x.minHeight ?? P, y) ?? 0,
        width: wt(x.minWidth ?? T, y) ?? 0
      }),
      getSeparatorsSize: (x) => ze[x]
    });
  }, [
    at,
    We,
    I.root,
    ze,
    P,
    T,
    Vn
  ]), Qs = Se(
    (y) => {
      const x = Ee(_.current).tabsetsById.get(y), $ = at[y] ?? { height: 0, width: 0 }, ee = Vn?.element ?? null;
      return {
        height: $.height + (wt(x?.minHeight ?? P, ee) ?? 0),
        width: $.width + (wt(x?.minWidth ?? T, ee) ?? 0)
      };
    }
  ), Yo = bc({
    getMinimumSize: Qs,
    updateModel: S
  }), Xo = Se(
    (y) => {
      const { tabsById: x, tabsetsById: $ } = Ee(_.current);
      if (y.type === "tab") {
        const ve = x.get(y.tabId);
        return ve ? { tab: ve, type: "tab" } : void 0;
      }
      const ee = $.get(y.tabsetId);
      return ee ? { tabset: ee, type: "tabset" } : void 0;
    }
  ), Ko = (y, x, $) => {
    if (typeof s != "function")
      return !!s;
    const ee = _.current;
    if (y.type === "tab")
      return s({
        model: ee,
        source: x,
        tab: y.tab,
        tabset: void 0,
        target: $
      });
    const ve = y.tabset;
    return ve.tabs.length === 0 ? s({ model: ee, source: x, tab: void 0, tabset: ve, target: $ }) : ve.tabs.some(
      (Ye, ct) => s({
        model: ee,
        source: x,
        tab: Ye,
        tabset: ve,
        target: "index" in $ ? { ...$, index: $.index + ct } : $
      })
    );
  }, er = Se(
    (y, x) => {
      if (typeof s != "function")
        return !!s;
      const $ = Xo(y);
      return $ ? Ko($, "local", x) : !0;
    }
  ), tr = Se(
    (y, x) => o || y.type === "tabset" && !!y.tabset.keepWhenEmpty || sc(_.current, y, x) || Ko(y, "external", x)
  ), nr = te(
    (y, x) => S("move", !0, ($) => {
      const ee = It(
        x,
        et(Y.current)
      );
      return y.type === "tab" ? co($, y.tabId, ee) : lo($, y.tabsetId, ee);
    }),
    [S]
  ), Jo = Se((y) => {
    if (!d)
      return !1;
    const { tabsById: x, tabsetsById: $ } = Ee(_.current);
    if (y.type === "tab")
      return x.has(y.tabId);
    const ee = $.get(y.tabsetId);
    return !!ee && !ee.keepWhenEmpty;
  }), or = Se(
    (y, { screenX: x, screenY: $ }) => {
      if (!d || !Jo(y))
        return;
      const ee = _.current, ve = nc(ee, y);
      if (!ve)
        return;
      const { tabsById: Ye, tabsetsById: ct, tabsetsByTabId: yr } = Ee(ee), sn = y.type === "tab" ? {
        tab: Ye.get(y.tabId),
        tabset: yr.get(y.tabId),
        type: "tab"
      } : {
        tabset: ct.get(y.tabsetId),
        type: "tabset"
      }, oi = F.get(sn.tabset.id)?.tabset?.getBoundingClientRect(), vr = {
        ...sn.type === "tab" ? { tab: sn.tab, type: "tab" } : { tabset: sn.tabset, type: "tabset" },
        height: oi?.height ?? 0,
        model: ve,
        screenX: x,
        screenY: $,
        width: oi?.width ?? 0
      };
      d(vr) === !0 && S(
        "tear-off",
        !0,
        (ii) => y.type === "tab" ? $t(ii, y.tabId) : Xn(ii, y.tabsetId)
      );
    }
  ), ir = Se(
    (y, x) => {
      let $ = !1;
      return S("transfer", !0, (ee) => {
        const ve = It(
          x,
          et(Y.current)
        ), Ye = y.type === "tab" ? ac(ee, y.tab, ve) : cc(ee, y.tabset, ve);
        return $ = Ye !== ee, Ye;
      }), $;
    }
  ), sr = Se(
    (y) => S(
      "transfer",
      !0,
      (x) => y.type === "tab" ? $t(x, y.tabId) : Xn(x, y.tabsetId)
    )
  ), rr = te(() => _.current, []), ar = te(() => Y.current, []), {
    dragSource: Pt,
    isNativeDragOver: cr,
    isNativeDragSource: lr,
    isTearOff: jn,
    nativePreviewNode: tn,
    previewElementRef: ur,
    previewPointRef: dr,
    startTabDrag: Zo,
    startTabsetDrag: Qo
  } = Wc({
    canTearOff: Jo,
    disableDragBetweenApps: i,
    dragGroup: r,
    dragStore: A,
    getDragNode: Xo,
    getModel: rr,
    getRootElement: ar,
    isDropDisabled: er,
    isExternalDropDisabled: tr,
    onDrop: nr,
    onTearOff: or,
    onTransferIn: ir,
    onTransferOut: sr,
    rootElement: Ne,
    tabsetElements: F
  }), qn = J(void 0), ei = te((y) => {
    qn.current = y;
  }, []), ti = te((y) => qn.current === y ? (qn.current = void 0, !0) : !1, []), fr = pe(
    () => ({
      activeTabsetId: re,
      collapsedSizes: We,
      collapseOverrides: en,
      collapsePreview: bt,
      collapseToFit: Ze,
      disabled: o,
      dragGroup: r,
      dragStore: A,
      getTabHandle: Le,
      getTabHost: ke,
      getHiddenTabBehavior: ht,
      getTabsetHandle: xe,
      id: V,
      isHydrating: pt,
      maximumSizes: qo,
      minimumSizes: Uo,
      model: I,
      modelIndex: de,
      outerParents: B,
      classNames: t,
      renderEmptyTabset: h,
      renderSeparator: f,
      renderTab: m,
      renderTabContent: b,
      renderTabsetToolbar: w,
      reportChromeSize: gt,
      reportCollapsePreview: _o,
      reportCollapseToFit: Ho,
      reportCollapsedSize: Vo,
      reportSeparatorsSize: jo,
      requestFocus: ei,
      resizePreviewMode: v,
      setActiveTabsetId: E,
      shouldServerRenderTabContent: mt,
      splitGeneration: se,
      startFloatingGesture: Yo,
      startTabDrag: Zo,
      startTabsetDrag: Qo,
      styles: L,
      tabListFreeSpaceStore: k,
      tabPlacement: W,
      tabsetElements: F,
      takeFocusRequest: ti,
      updateModel: S
    }),
    [
      re,
      We,
      en,
      bt,
      Ze,
      o,
      r,
      A,
      Le,
      ke,
      ht,
      xe,
      V,
      pt,
      qo,
      Uo,
      I,
      de,
      B,
      t,
      h,
      f,
      m,
      b,
      w,
      gt,
      _o,
      Ho,
      Vo,
      jo,
      ei,
      v,
      E,
      mt,
      se,
      Yo,
      Zo,
      Qo,
      L,
      k,
      W,
      F,
      ti,
      S
    ]
  ), Un = pe(
    () => ({
      activeTabsetId: re,
      collapseOverrides: en,
      collapseToFit: Ze,
      disabled: o,
      dragGroup: r,
      model: I,
      modelIndex: de
    }),
    [
      re,
      en,
      Ze,
      o,
      r,
      I,
      de
    ]
  ), pr = Se(
    (y) => ke(y).panelId
  ), [nn] = oe(
    () => ec(Un, S, pr)
  );
  nn.setState(Un), ue(() => {
    nn.notify();
  }, [nn, Un]);
  const At = I.maximizedTabsetId !== void 0 ? de.tabsetsById.get(I.maximizedTabsetId) : void 0;
  ue(() => {
    X.current?.toggleAttribute("inert", !!At);
  }, [At]);
  const hr = pe(() => /* @__PURE__ */ j(Js, { node: I.root }), [I.root]), mr = pe(
    () => At && /* @__PURE__ */ j(
      "div",
      {
        "data-workspace-maximized": !0,
        style: { inset: 0, position: "absolute", zIndex: 1 },
        children: /* @__PURE__ */ j(Fo, { isMaximizedOverlay: !0, tabset: At })
      }
    ),
    [At]
  ), gr = pe(
    () => I.floating && /* @__PURE__ */ j(
      rl,
      {
        floating: I.floating,
        layoutElementRef: X
      }
    ),
    [I.floating]
  ), br = pe(
    () => pt ? null : Array.from(de.tabsById.values(), (y) => {
      const x = ke(y.id).element;
      return x ? Ir(
        /* @__PURE__ */ j(
          Bs,
          {
            hiddenTabBehavior: ht(y),
            renderTabContent: b,
            tab: y
          }
        ),
        x,
        y.id
      ) : null;
    }),
    [
      ht,
      ke,
      pt,
      de,
      b
    ]
  );
  let yt, Ue;
  tn ? tn.type === "tab" ? yt = tn.tab : Ue = tn.tabset : lr || (yt = Pt?.type === "tab" ? de.tabsById.get(Pt.tabId) : void 0, Ue = Pt?.type === "tabset" ? de.tabsetsById.get(Pt.tabsetId) : void 0);
  const ni = (y, x = 0) => {
    if (p)
      return p(y, { isTearOff: jn });
    const $ = y.title ?? y.id;
    return x > 0 ? `${$} (+${x})` : $;
  };
  let on = null;
  if (yt)
    on = ni(yt);
  else if (Ue)
    if (g)
      on = g(
        Ue,
        { isTearOff: jn }
      );
    else {
      const y = Ue.tabs.find(
        ({ id: x }) => x === Ue.selectedId
      );
      on = y ? ni(y, Ue.tabs.length - 1) : Ue.id;
    }
  return /* @__PURE__ */ j(Oo.Provider, { value: K, children: /* @__PURE__ */ j(Yt.Provider, { value: nn, children: /* @__PURE__ */ qe(ks.Provider, { value: fr, children: [
    /* @__PURE__ */ qe(
      "div",
      {
        ...D,
        className: e,
        "data-testid": Rt(D, c),
        "data-workspace": !0,
        id: V,
        ref: Te,
        style: { position: "relative", ...M },
        children: [
          /* @__PURE__ */ j(
            "div",
            {
              "data-workspace-layout": !0,
              ref: X,
              style: { height: "100%", width: "100%" },
              children: hr
            }
          ),
          mr,
          gr,
          (Pt !== void 0 || cr) && /* @__PURE__ */ j(
            vl,
            {
              className: t?.dropIndicator,
              dragStore: A,
              layoutElementRef: X,
              model: I,
              style: L?.dropIndicator,
              tabsetElements: F
            }
          ),
          (yt || Ue) && /* @__PURE__ */ j(
            hl,
            {
              className: t?.dragPreview,
              dragType: yt ? "tab" : "tabset",
              elementRef: ur,
              isTearOff: jn,
              pointRef: dr,
              style: L?.dragPreview,
              children: on
            }
          )
        ]
      }
    ),
    br
  ] }) }) });
}
const jl = /* @__PURE__ */ Object.assign(Sl, {
  displayName: "Workspace"
});
function ql(e, {
  mapTab: t
} = {}) {
  if (!Os(e) || e.version !== 1)
    return null;
  if (!t)
    return In(e);
  const n = (s) => s.flatMap((r) => {
    const a = t(r);
    return a ? [a] : [];
  }), o = (s) => s.type === "split" ? { ...s, children: s.children.map(o) } : { ...s, tabs: n(s.tabs) }, i = {
    ...e,
    floating: e.floating?.map((s) => ({
      ...s,
      tabs: n(s.tabs)
    })),
    root: o(e.root)
  };
  return In(i);
}
export {
  Tl as Cell,
  Il as Grid,
  ha as Gridline,
  Da as Group,
  Oa as Panel,
  _a as Separator,
  za as SeparatorOverlay,
  Va as TabCloseButton,
  Nl as TabsetCollapseButton,
  $l as TabsetDragHandle,
  Bl as TabsetMaximizeButton,
  jl as Workspace,
  Dr as isCoarsePointer,
  ql as normalizeWorkspaceModel,
  Cl as useDefaultGridLayout,
  Dl as useDefaultLayout,
  Ll as useGridCallbackRef,
  El as useGridRef,
  Ml as useGroupCallbackRef,
  Pa as useGroupRef,
  Al as usePanelCallbackRef,
  kl as usePanelRef,
  Rl as useParentGrid,
  Pl as useParentGroup,
  Ol as useParentPanel,
  Fl as useParentTab,
  Ga as useParentTabState,
  _l as useParentTabset,
  ko as useParentTabsetState,
  Wl as useParentWorkspace,
  Gl as useTabListFreeSpace,
  Hl as useWorkspaceCallbackRef,
  Vl as useWorkspaceRef
};
//# sourceMappingURL=react-resizable-panels.js.map
