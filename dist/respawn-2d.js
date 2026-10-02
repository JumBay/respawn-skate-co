//#region 2d/src/styles.css?inline
var e = "#141416", t = "#C8FF2E", n = "#FF6A1A", r = "#F3F0E8", i = "\"Anton\",Impact,\"Haettenschweiler\",\"Futura Condensed ExtraBold\",\"Arial Narrow\",sans-serif", a = Math.PI * 2, o = (e, t, n) => e < t ? t : e > n ? n : e, s = /* @__PURE__ */ new Map();
function c(e, t) {
	let n = e + t, r = s.get(n);
	if (r) return r;
	let i = parseInt(String(e).slice(1), 16), a = i >> 16, o = i >> 8 & 255, c = i & 255;
	if (t < 1) a *= t, o *= t, c *= t;
	else {
		let e = t - 1;
		a += (255 - a) * e, o += (255 - o) * e, c += (255 - c) * e;
	}
	return r = "rgb(" + (a | 0) + "," + (o | 0) + "," + (c | 0) + ")", s.set(n, r), r;
}
function l(e) {
	let t = parseInt(String(e).slice(1), 16);
	return (.3 * (t >> 16) + .59 * (t >> 8 & 255) + .11 * (t & 255)) / 255;
}
function u(e, t, n, r, i, a) {
	e.beginPath(), e.roundRect ? e.roundRect(t, n, r, i, a) : e.rect(t, n, r, i);
}
function d(t, n, r) {
	t.fillStyle = n, t.fill(), t.strokeStyle = e, t.lineWidth = r || 2.2, t.stroke();
}
function f(t, n, r, i, a) {
	t.beginPath(), t.moveTo(n[0], n[1]);
	for (let e = 2; e < n.length; e += 2) t.lineTo(n[e], n[e + 1]);
	t.strokeStyle = e, t.lineWidth = r + (a == null ? 4.4 : a * 2), t.stroke(), t.strokeStyle = i, t.lineWidth = r, t.stroke();
}
var p = (e, t, n, r) => {
	let i = Math.cos(t), a = Math.sin(t);
	return {
		x: e.x + n * i - r * a,
		y: e.y + n * a + r * i
	};
};
function m(e, t, n, r) {
	e.beginPath();
	for (let i = 0; i < 8; i++) {
		let a = Math.PI / 8 + i * Math.PI / 4;
		e.lineTo(t + Math.cos(a) * r, n + Math.sin(a) * r);
	}
	e.closePath();
}
function h(e, t, n, r, i, a, s, c) {
	let l = n - e, u = r - t, d = o(Math.hypot(l, u) || .001, Math.abs(i - a) + .5, i + a - .2), f = Math.atan2(u, l), p = Math.acos(o((i * i + d * d - a * a) / (2 * i * d), -1, 1)), m = {
		x: e + Math.cos(f + p) * i,
		y: t + Math.sin(f + p) * i
	}, h = {
		x: e + Math.cos(f - p) * i,
		y: t + Math.sin(f - p) * i
	}, g = s === "down" ? m.y > h.y ? m : h : (m.x - h.x) * c > 0 ? m : h, _ = n - g.x, v = r - g.y, y = Math.hypot(_, v) || 1;
	return {
		j: g,
		e: {
			x: g.x + _ / y * a,
			y: g.y + v / y * a
		}
	};
}
var g = {
	g: "tshirt",
	c: [
		"#E9E4D8",
		"#C9C3B5",
		"#2A2A2E"
	],
	motif: null
}, _ = {
	g: "jeans",
	c: [
		"#2E3140",
		"#22242F",
		"#55586A"
	],
	motif: null
}, v = {
	g: "low",
	c: [
		"#3A3A40",
		"#F3F0E8",
		"#77777E"
	]
};
function y(n, i, o) {
	n.lineCap = "round", n.lineJoin = "round", i.board.show && ee(n, i.board, o);
	let s = i.hip, m = i.lean, y = o.gender === "f", S = o.bottom || _, C = o.top || g, w = o.feet || v, T = w.g === "high", te = T ? 11 : 7.5, ne = [{
		h: p(s, m, -7, 2),
		f: i.fb,
		side: -1
	}, {
		h: p(s, m, 7, 2),
		f: i.ff,
		side: 1
	}], re = (t, r) => {
		n.save(), n.translate(t.x, t.y), n.rotate(i.shoeAng || 0);
		let o = T ? 13 : 9.5, [s, u, f] = w.c;
		n.beginPath(), n.moveTo(-11, 0), n.lineTo(-11, -o * .55), n.quadraticCurveTo(-11, -o, -6, -o), n.lineTo(6, -o), n.quadraticCurveTo(11, -o, 11, -o * .55), n.lineTo(11, 0), n.closePath(), d(n, s, 2.2), n.fillStyle = u, n.fillRect(-10, -3.6, 20, 3.2), n.strokeStyle = e, n.lineWidth = 1.4, n.beginPath(), n.moveTo(-10, -3.8), n.lineTo(10, -3.8), n.stroke(), T && (n.fillStyle = f, n.fillRect(-9.5, -o + 4, 19, 2.6)), n.strokeStyle = l(s) > .5 ? c(s, .6) : c(s, 1.9), n.lineWidth = 1.3, n.beginPath();
		for (let e = 0; e < 3; e++) n.moveTo(-3.5, -o + 2.5 + e * 2.2), n.lineTo(3.5, -o + 2.5 + e * 2.2);
		n.stroke(), !T && l(f) > .5 && (n.fillStyle = f, n.beginPath(), n.arc(r * 6, -5.8, 1.6, 0, a), n.fill()), n.restore();
	}, E = S.c[0], D = c(S.c[0], .82), O = S.g === "shorts";
	for (let e of ne) {
		let t = {
			x: e.f.x,
			y: e.f.y - te
		}, n = h(e.h.x, e.h.y, t.x, t.y, 34, 33, "out", e.side);
		e.k = n.j, e.a = n.e;
	}
	if (!O) for (let e of ne) re(e.f, e.side);
	for (let t of ne) {
		let i = t.h, a = t.k, s = t.a;
		if (O) f(n, [
			a.x,
			a.y,
			s.x,
			s.y
		], 9.5, o.skin), n.strokeStyle = r, n.lineWidth = 10.5, n.beginPath(), n.moveTo(s.x, s.y), n.lineTo(s.x + (a.x - s.x) * .22, s.y + (a.y - s.y) * .22), n.stroke(), re(t.f, t.side), f(n, [
			i.x,
			i.y,
			a.x,
			a.y,
			a.x + (s.x - a.x) * .28,
			a.y + (s.y - a.y) * .28
		], 17, E);
		else {
			let r = S.wide ? 15.5 : 15, o = S.wide ? 16.5 : 14;
			n.beginPath(), n.moveTo(i.x, i.y), n.lineTo(a.x, a.y), n.lineTo(s.x, s.y), n.strokeStyle = e, n.lineWidth = o + 4.4, n.stroke(), n.strokeStyle = E, n.lineWidth = r, n.beginPath(), n.moveTo(i.x, i.y), n.lineTo(a.x, a.y), n.stroke(), n.lineWidth = o, n.beginPath(), n.moveTo(a.x, a.y), n.lineTo(s.x, s.y), n.stroke();
			let c = s.x - a.x, l = s.y - a.y, f = Math.hypot(c, l) || 1;
			if (n.strokeStyle = D, n.lineWidth = o + .5, n.lineCap = "butt", n.beginPath(), n.moveTo(s.x - c / f * 5, s.y - l / f * 5), n.lineTo(s.x - c / f, s.y - l / f), n.stroke(), n.lineCap = "round", S.g === "jeans" && (n.strokeStyle = S.c[2], n.globalAlpha = .55, n.lineWidth = .9, n.beginPath(), n.moveTo(i.x + t.side * 5, i.y + 3), n.lineTo(a.x + t.side * 6, a.y), n.lineTo(s.x + t.side * 6, s.y - 4), n.stroke(), n.globalAlpha = 1), S.g === "cargo") {
				let r = i.x + (a.x - i.x) * .62, o = i.y + (a.y - i.y) * .62, s = Math.atan2(a.y - i.y, a.x - i.x);
				n.save(), n.translate(r + t.side * 3, o), n.rotate(s - Math.PI / 2), u(n, -4.5, -5.5, 9, 11, 2), d(n, S.c[1], 1.3), n.beginPath(), n.moveTo(-4.5, -2), n.lineTo(4.5, -2), n.strokeStyle = e, n.lineWidth = 1, n.stroke(), n.restore();
			}
		}
		if (o.knees) {
			let e = Math.atan2(s.y - a.y, s.x - a.x);
			n.save(), n.translate(a.x + (s.x - a.x) * .12, a.y + (s.y - a.y) * .12), n.rotate(e - Math.PI / 2), u(n, -9, -6, 18, 15, 6), d(n, o.knees.c[0], 2), u(n, -7, -5, 14, 11, 5), d(n, o.knees.c[1], 1.4), n.fillStyle = "rgba(255,255,255,.25)", n.fillRect(-4, -3, 6, 2), n.restore();
		}
	}
	n.save(), n.translate(s.x, s.y), n.rotate(m);
	let k = C.g, [A, ie, j] = C.c, M = y ? 13 : 15, N = k === "hoodie" || k === "jacket", P = N ? M + 1.5 : M + .5;
	if (o.bag > 0) {
		let e = 1 + Math.min(o.bag, 8) * .09;
		u(n, -P - 5 * e, -44 - 6 * e, 2 * P + 10 * e, 40 * e, 8), d(n, "#2A2A2E", 2.2), n.strokeStyle = t, n.lineWidth = 1.6, n.beginPath(), n.moveTo(-P - 2 * e, -42 - 6 * e), n.lineTo(P + 2 * e, -42 - 6 * e), n.stroke();
	}
	(k === "crop" || k === "hoodiecrop") && (n.beginPath(), n.moveTo(-12, 4), n.lineTo(-11, -22), n.lineTo(11, -22), n.lineTo(12, 4), n.closePath(), d(n, o.skin, 2.2));
	let F = S.hw ? -7 : -2;
	n.beginPath(), n.moveTo(-14, F), n.lineTo(14, F), n.lineTo(15, 9), n.quadraticCurveTo(0, 13, -15, 9), n.closePath(), d(n, E, 2.2), n.fillStyle = c(E, .7), n.fillRect(-13.5, F + .5, 27, 2.8), S.g === "jeans" && (n.fillStyle = S.c[2], n.fillRect(-2, F + .3, 4, 3.2));
	let I = k === "crop" ? -17 : k === "hoodiecrop" ? -6 : N ? 8 : 5, L = N ? 15 : 13.5;
	k === "hoodie" && (n.beginPath(), n.ellipse(-6, -44, 11, 8, -.3, 0, a), d(n, c(A, .85), 2.2)), n.beginPath(), n.moveTo(-L, I), n.quadraticCurveTo(-L - 2, -16, -P, -34), n.quadraticCurveTo(-P + 1, -41, -6, -42.5), n.lineTo(6, -42.5), n.quadraticCurveTo(P - 1, -41, P, -34), n.quadraticCurveTo(L + 2, -16, L, I), n.quadraticCurveTo(0, I + 2.5, -L, I), n.closePath(), d(n, A, 2.2), n.save(), n.clip(), n.fillStyle = "rgba(0,0,0,.14)", n.fillRect(-L - 3, -44, 6, 60), n.fillStyle = "rgba(255,255,255,.06)", n.fillRect(L - 6, -44, 6, 60), n.restore(), (k === "hoodie" || k === "hoodiecrop") && (n.fillStyle = c(A, .8), n.fillRect(-L + .5, I - 4, 2 * L - 1, 3.6)), k === "hoodie" && (n.beginPath(), n.moveTo(-9, -3), n.lineTo(9, -3), n.lineTo(7, -14), n.lineTo(-7, -14), n.closePath(), n.fillStyle = c(A, .88), n.fill(), n.strokeStyle = "rgba(0,0,0,.5)", n.lineWidth = 1.2, n.stroke()), k === "jacket" && (n.strokeStyle = j, n.lineWidth = 1.2, n.beginPath(), n.moveTo(0, -41), n.lineTo(0, I), n.stroke()), N ? (n.beginPath(), n.ellipse(0, -41.5, 9.5, 4.6, 0, 0, a), d(n, k === "hoodie" ? c(A, .75) : ie, 2)) : (n.beginPath(), n.moveTo(-5.5, -42.4), n.quadraticCurveTo(0, -36, 5.5, -42.4), n.closePath(), d(n, o.skin, 1.8)), k === "hoodie" && (n.strokeStyle = j, n.lineWidth = 1.5, n.beginPath(), n.moveTo(-3, -38), n.lineTo(-3.6, -29), n.moveTo(3, -38), n.lineTo(3.6, -30), n.stroke()), b(n, C.motif, j, A, k), o.bag > 0 && (n.strokeStyle = "#2A2A2E", n.lineWidth = 3.4, n.beginPath(), n.moveTo(-P + 3, -38), n.lineTo(-L + 2, -12), n.moveTo(P - 3, -38), n.lineTo(L - 2, -12), n.stroke()), n.restore();
	let ae = p(s, m, -P + 3, -36), oe = p(s, m, P - 3, -36), se = [{
		s: ae,
		h: i.hb,
		pref: i.eb,
		side: -1
	}, {
		s: oe,
		h: i.hf,
		pref: i.ef,
		side: 1
	}], ce = N || k === "hoodiecrop";
	for (let e of se) {
		let t = h(e.s.x, e.s.y, e.h.x, e.h.y, 22, 21, e.pref, e.side), r = t.j, i = t.e;
		if (ce) {
			f(n, [
				e.s.x,
				e.s.y,
				r.x,
				r.y,
				i.x,
				i.y
			], 11, A);
			let t = i.x - r.x, a = i.y - r.y, o = Math.hypot(t, a) || 1;
			if (n.strokeStyle = c(A, .75), n.lineWidth = 11, n.lineCap = "butt", n.beginPath(), n.moveTo(i.x - t / o * 5, i.y - a / o * 5), n.lineTo(i.x - t / o * 1.5, i.y - a / o * 1.5), n.stroke(), n.lineCap = "round", k === "jacket") {
				let t = e.s.x + (r.x - e.s.x) * .5, i = e.s.y + (r.y - e.s.y) * .5;
				n.strokeStyle = j, n.lineWidth = 11, n.lineCap = "butt", n.beginPath(), n.moveTo(t, i), n.lineTo(t + (r.x - e.s.x) * .15, i + (r.y - e.s.y) * .15), n.stroke(), n.lineCap = "round";
			}
		} else f(n, [
			e.s.x,
			e.s.y,
			r.x,
			r.y,
			i.x,
			i.y
		], 8.5, o.skin), f(n, [
			e.s.x,
			e.s.y,
			e.s.x + (r.x - e.s.x) * .62,
			e.s.y + (r.y - e.s.y) * .62
		], 13, A);
		o.elbows && (n.save(), n.translate(r.x, r.y), n.rotate(Math.atan2(i.y - r.y, i.x - r.x)), u(n, -5, -7, 11, 14, 5), d(n, o.elbows.c[1], 1.8), n.fillStyle = "rgba(255,255,255,.25)", n.fillRect(-2, -5, 4, 2), n.restore()), o.wrists && (n.save(), n.translate(i.x - (i.x - r.x) * .22, i.y - (i.y - r.y) * .22), n.rotate(Math.atan2(i.y - r.y, i.x - r.x)), u(n, -5, -6, 9, 12, 2.5), d(n, o.wrists.c[0], 1.6), n.fillStyle = o.wrists.c[1], n.fillRect(-3.5, -5, 2.4, 10), n.restore()), n.beginPath(), n.arc(i.x, i.y, 5.4, 0, a), d(n, o.skin, 2.1);
	}
	let R = p(s, m, 0, -41), z = p(s, m, 1.5, -57);
	N || f(n, [
		R.x,
		R.y,
		z.x,
		z.y + 6
	], 8, o.skin, 1.6), x(n, z.x, z.y, m * .45 + i.tilt, i, o);
}
function b(n, o, s, c, l) {
	if (o) {
		if (o === "R" || o === "reflect") {
			if (o === "reflect") {
				let e = l === "jacket" ? 15 : 13.5;
				n.fillStyle = s, n.fillRect(-e - 1, -30, 2 * e + 2, 4.2), n.fillStyle = "rgba(255,255,255,.7)", n.fillRect(-e - 1, -30, 2 * e + 2, 1.2);
			}
			let r = o === "R" ? 0 : 6, i = o === "R" ? -25 : -35, a = o === "R" ? 7.5 : 3.6;
			m(n, r, i, a), d(n, t, o === "R" ? 1.6 : 1), n.fillStyle = e, n.font = a * 1.6 + "px \"Anton\",Impact,\"Haettenschweiler\",\"Futura Condensed ExtraBold\",\"Arial Narrow\",sans-serif", n.textAlign = "center", n.textBaseline = "middle", n.fillText("R", r, i + .5);
		} else if (o === "lamp") n.strokeStyle = s, n.fillStyle = s, n.lineWidth = 1.6, n.beginPath(), n.moveTo(-6, -16), n.lineTo(-6, -33), n.lineTo(-1, -33), n.stroke(), n.fillRect(-2.5, -34, 5, 3), n.globalAlpha = .45, n.beginPath(), n.moveTo(-2, -31), n.lineTo(2, -31), n.lineTo(7, -18), n.lineTo(-7, -18), n.fill(), n.globalAlpha = 1;
		else if (o === "cone") n.beginPath(), n.moveTo(-6.5, -14), n.lineTo(-1.5, -33), n.lineTo(1.5, -33), n.lineTo(6.5, -14), n.closePath(), d(n, s, 1.3), n.fillStyle = r, n.fillRect(-4.2, -25, 8.4, 3), n.fillStyle = s, n.fillRect(-9, -14.5, 18, 2.6), n.strokeStyle = e, n.lineWidth = 1, n.strokeRect(-9, -14.5, 18, 2.6);
		else if (o === "night") n.fillStyle = s, n.beginPath(), n.arc(5, -30, 5, 0, a), n.fill(), n.fillStyle = c, n.beginPath(), n.arc(7.4, -31.5, 4.3, 0, a), n.fill(), n.font = "4.5px " + i, n.textAlign = "center", n.fillStyle = s, n.fillText("NIGHT", -3, -18);
		else if (o === "pixel") {
			n.fillStyle = s;
			for (let e = 0; e < 4; e++) for (let t = 0; t < 3; t++) (e + t) % 2 == 0 && n.fillRect(-6 + e * 3, -30 + t * 3, 2.6, 2.6);
		}
	}
}
function x(n, r, i, o, s, l) {
	n.save(), n.translate(r, i), n.rotate(o);
	let f = l.gender === "f", p = l.helmet ? {
		g: "helmet",
		c: l.helmet.c
	} : l.head, m = p ? p.g : null;
	if (f) {
		let r = s.pony.x, i = s.pony.y;
		n.beginPath(), n.moveTo(-7, -15), n.bezierCurveTo(-24 + r * .3, -17 + i * .2, -28 + r * .6, 0 + i * .5, -23 + r, 15 + i), n.bezierCurveTo(-21 + r * .7, 4 + i * .5, -17 + r * .3, -4, -12, -3), n.closePath(), d(n, l.hair, 2), n.fillStyle = t, n.beginPath(), n.ellipse(-12, -11, 2.2, 3.6, .5, 0, a), n.fill(), n.strokeStyle = e, n.lineWidth = 1, n.stroke();
	}
	n.beginPath(), n.ellipse(0, 0, 13.5, 15, 0, 0, a), d(n, l.skin, 2.3), n.beginPath(), n.ellipse(-6, 2, 3.4, 4.4, 0, 0, a), d(n, l.skin, 1.6), n.fillStyle = l.skinSh, n.beginPath(), n.ellipse(-6, 2.3, 1.4, 2.2, 0, 0, a), n.fill(), n.beginPath(), f ? (n.moveTo(-13.5, 6), n.bezierCurveTo(-17, -14, -2, -21, 9, -15), n.quadraticCurveTo(15.5, -10, 13.5, -4), n.quadraticCurveTo(7, -11, 1, -8.5), n.quadraticCurveTo(-5, -6, -8.5, 4), n.closePath()) : (n.moveTo(-13.5, 3), n.bezierCurveTo(-16, -14, -3, -21, 9, -16), n.lineTo(13, -11), n.lineTo(9, -10.5), n.lineTo(7, -12.5), n.lineTo(4.5, -9.5), n.lineTo(1.5, -11.5), n.quadraticCurveTo(-6, -7, -8.5, 3), n.closePath()), d(n, l.hair, 2);
	let h = s.blink ? .35 : 2.5;
	if (n.fillStyle = e, n.beginPath(), n.ellipse(4.2, -1, 1.7, h, 0, 0, a), n.ellipse(10.6, -1.4, 1.6, h * .95, 0, 0, a), n.fill(), s.blink || (n.fillStyle = "#fff", n.beginPath(), n.arc(4.7, -1.9, .6, 0, a), n.arc(11, -2.3, .55, 0, a), n.fill()), n.strokeStyle = e, n.lineWidth = 1.3, n.beginPath(), n.moveTo(2, -6), n.lineTo(6.3, -6.6), n.moveTo(9.2, -6.9), n.lineTo(12.6, -6.2), n.stroke(), n.strokeStyle = l.skinSh, n.lineWidth = 1.5, n.beginPath(), n.moveTo(13.6, 0), n.quadraticCurveTo(16, 4, 13, 4.6), n.stroke(), n.strokeStyle = l.lip, n.lineWidth = 1.5, n.beginPath(), n.moveTo(6, 8.2), n.quadraticCurveTo(9, s.smile ? 11.5 : 9.8, 11.6, 7.6), n.stroke(), n.fillStyle = "rgba(255,110,90,.22)", n.beginPath(), n.arc(2.5, 4.5, 2.6, 0, a), n.fill(), p) {
		let [t, , r] = p.c;
		if (m === "cap") n.beginPath(), n.moveTo(-14.2, -3), n.bezierCurveTo(-15.5, -21, 11, -23, 13.6, -5), n.quadraticCurveTo(0, -7.5, -14.2, -3), n.closePath(), d(n, t, 2.2), n.strokeStyle = "rgba(255,255,255,.1)", n.lineWidth = 1, n.beginPath(), n.moveTo(0, -19), n.quadraticCurveTo(2, -12, 1.5, -6), n.stroke(), n.beginPath(), n.moveTo(8, -6.5), n.quadraticCurveTo(20, -9, 27, -3.5), n.quadraticCurveTo(19, -1.5, 8, -3.5), n.closePath(), d(n, c(t, .7), 2), u(n, 1, -14, 7.5, 5.5, 1.2), d(n, r, 1.2), n.beginPath(), n.arc(-1, -19.6, 1.6, 0, a), d(n, t, 1);
		else if (m === "beanie") {
			n.beginPath(), n.moveTo(-15, -6), n.bezierCurveTo(-16.5, -30, 13.5, -31, 15, -6), n.closePath(), d(n, t, 2.2), n.strokeStyle = c(t, .82), n.lineWidth = 1.1, n.beginPath();
			for (let e = -10; e <= 10; e += 4) n.moveTo(e, -9), n.lineTo(e * .8, -23);
			n.stroke(), u(n, -16, -13.5, 32, 7.5, 3), d(n, c(t, .9), 2), n.fillStyle = r, n.fillRect(4, -12, 6, 4.5);
		} else m === "helmet" && (n.beginPath(), n.moveTo(-16.5, 3), n.bezierCurveTo(-19, -28, 15, -31, 16.5, -8), n.lineTo(14, -7), n.quadraticCurveTo(-2, -8, -16.5, 3), n.closePath(), d(n, t, 2.3), n.strokeStyle = r, n.lineWidth = 3, n.beginPath(), n.moveTo(-13, -14), n.quadraticCurveTo(-1, -24, 11, -15), n.stroke(), n.fillStyle = "rgba(255,255,255,.14)", n.beginPath(), n.ellipse(-4, -16, 6, 2.5, -.3, 0, a), n.fill(), n.strokeStyle = e, n.lineWidth = 1.4, n.beginPath(), n.moveTo(-9, -4), n.quadraticCurveTo(-6, 10, 4, 13.5), n.stroke());
	}
	n.restore();
}
var S = [];
for (let e = -47; e <= 47; e += 4.7) S.push(e);
var C = (e) => {
	let t = Math.abs(e);
	return t > 33 ? (t - 33) * .6 : 0;
}, w = {
	c: [
		"#141416",
		"#C9A26B",
		t
	],
	motif: "lamp"
};
function ee(t, n, i) {
	t.save(), t.translate(n.x, n.y), t.rotate(n.pitch);
	let o = Math.cos(n.roll), s = Math.sin(n.roll), l = Math.cos(n.yaw);
	Math.abs(l) < .24 && (l = l < 0 ? -.24 : .24);
	let u = 2.6, f = [], p = [];
	for (let e of S) {
		let t = -C(e) * o + u * .5 * o, n = 11 * Math.abs(s) + u * .5 * Math.abs(o) + .3;
		f.push(e * l, t - n), p.push(e * l, t + n);
	}
	let m = i.wheels ? i.wheels.c[0] : r, h = i.bearings ? i.bearings.c[1] : "rgba(0,0,0,.25)", g = i.trucks ? i.trucks.c : ["#B9BEC4", "#8A8F95"], _ = i.deck || w, v = i.griptape ? i.griptape.c : [
		"#1C1C1F",
		"#1C1C1F",
		"#E8E1D0"
	], y = (n) => {
		let r = (n ? 27 : -27) * l, i = u * o;
		for (let e of [-1, 1]) {
			let n = i + 13 * o + e * 10 * s;
			t.beginPath(), t.ellipse(r, n, 6.2 * Math.max(.35, Math.abs(l)), 6.2 * Math.max(.55, Math.abs(o)), 0, 0, a), d(t, e * s > 0 ? c(m, .7) : m, 1.8), t.fillStyle = h, t.beginPath(), t.arc(r, n, 1.9, 0, a), t.fill();
		}
		t.strokeStyle = e, t.lineWidth = 5.2, t.beginPath(), t.moveTo(r, i), t.lineTo(r, i + 11 * o), t.stroke(), t.strokeStyle = g[0], t.lineWidth = 3, t.stroke(), t.beginPath(), t.moveTo(r - 6 * Math.abs(l), i + 1.5 * o), t.lineTo(r + 6 * Math.abs(l), i + 1.5 * o), t.strokeStyle = e, t.lineWidth = 4, t.stroke(), t.strokeStyle = g[1], t.lineWidth = 2, t.stroke();
	};
	o >= 0 && (y(!1), y(!0)), t.beginPath(), t.moveTo(f[0], f[1]);
	for (let e = 2; e < f.length; e += 2) t.lineTo(f[e], f[e + 1]);
	for (let e = p.length - 2; e >= 0; e -= 2) t.lineTo(p[e], p[e + 1]);
	if (t.closePath(), Math.abs(s) < .28) {
		t.fillStyle = _.c[1], t.fill(), t.save(), t.clip(), t.fillStyle = v[0];
		let n = o >= 0 ? -1 : 1;
		t.beginPath();
		for (let e = 0; e < f.length; e += 2) {
			let r = o >= 0 ? f[e + 1] : p[e + 1];
			t.lineTo(f[e], r + n * -1.8);
		}
		for (let e = f.length - 2; e >= 0; e -= 2) {
			let r = o >= 0 ? f[e + 1] : p[e + 1];
			t.lineTo(f[e], r - n * 1.4);
		}
		t.fill(), t.restore(), t.strokeStyle = e, t.lineWidth = 2, t.stroke();
	} else if (s > 0) {
		t.fillStyle = v[0], t.fill(), t.save(), t.clip(), t.fillStyle = v[2] || "rgba(255,255,255,.1)", t.globalAlpha = .18;
		for (let e = 0; e < 14; e++) t.fillRect(-40 + e * 6, -8 + e * 7 % 9, 1.2, 1.2);
		t.globalAlpha = 1, t.restore(), t.strokeStyle = e, t.lineWidth = 2, t.stroke();
	} else t.save(), t.clip(), t.translate(0, u * .5 * o), t.transform(l, 0, 0, -s, 0, 0), T(t, _), t.restore(), t.strokeStyle = e, t.lineWidth = 2, t.stroke();
	o < 0 && (y(!1), y(!0)), t.restore();
}
function T(n, a) {
	let [o, , s] = a.c;
	n.fillStyle = o, n.fillRect(-52, -16, 104, 32);
	let c = a.motif;
	if (c === "lamp") n.strokeStyle = s, n.lineWidth = 2.6, n.beginPath(), n.moveTo(-30, 6), n.lineTo(22, 6), n.lineTo(22, -2), n.stroke(), n.fillStyle = s, n.fillRect(18, -5, 9, 4), n.globalAlpha = .4, n.beginPath(), n.moveTo(19, -1), n.lineTo(26, -1), n.lineTo(40, 10), n.lineTo(8, 10), n.fill(), n.globalAlpha = 1, m(n, -38, 0, 5), n.fill();
	else if (c === "cone") {
		n.fillStyle = s;
		for (let e of [-1, 1]) n.fillRect(e * 36 - 3, -14, 6, 28), n.fillRect(e * 44 - 1.5, -14, 3, 28);
		n.beginPath(), n.moveTo(-20, -9), n.lineTo(-20, 9), n.lineTo(22, 1.5), n.lineTo(22, -1.5), n.closePath(), n.fill(), n.fillStyle = r, n.fillRect(-6, -6, 5, 12), n.fillRect(6, -3.5, 4, 7);
	} else if (c === "pixel") {
		let e = [
			"0110110",
			"1111111",
			"1111111",
			"0111110",
			"0011100",
			"0001000"
		];
		for (let r = 0; r < e.length; r++) for (let i = 0; i < 7; i++) e[r][i] === "1" && (n.fillStyle = r < 2 ? t : s, n.fillRect(-36 + i * 3.2, -9 + r * 3.2, 3, 3));
		n.fillStyle = s;
		for (let e = 0; e < 9; e++) for (let t = 0; t < 2; t++) (e + t) % 2 == 0 && n.fillRect(-4 + e * 4, -5 + t * 6, 3.4, 3.4);
		n.fillStyle = t, n.fillRect(34, -10, 3, 20);
	} else if (c === "R") m(n, 0, 0, 9), n.fillStyle = s, n.fill(), n.fillStyle = e, n.font = "14px " + i, n.textAlign = "center", n.textBaseline = "middle", n.fillText("R", 0, 1);
	else {
		n.fillStyle = s;
		for (let e = -3; e <= 3; e++) n.fillRect(e * 12 - 2, -14, 4, 28);
	}
}
function te(t, n, i = !0) {
	let o = n.deck || w, s = n.wheels ? n.wheels.c[0] : r, c = n.trucks ? n.trucks.c : ["#C3C8CE", "#8A8F95"];
	if (i) for (let e of [-31, 31]) for (let n of [-1, 1]) u(t, e - 5.5, n * 14.5 - 5, 11, 10, 3), d(t, s, 2), t.fillStyle = "rgba(0,0,0,.2)", t.fillRect(e - 5.5, n * 14.5 - .6, 11, 1.2);
	if (t.beginPath(), t.moveTo(-34, -15), t.lineTo(34, -15), t.bezierCurveTo(52, -15, 53, 15, 34, 15), t.lineTo(-34, 15), t.bezierCurveTo(-53, 15, -52, -15, -34, -15), t.closePath(), t.save(), t.clip(), T(t, o), t.fillStyle = "rgba(255,255,255,.08)", t.fillRect(-52, -15, 104, 4), t.restore(), t.strokeStyle = o.c[1], t.lineWidth = 3.5, t.stroke(), t.strokeStyle = e, t.lineWidth = 2, t.stroke(), i) for (let e of [-31, 31]) u(t, e - 4, -11, 8, 22, 3), d(t, c[0], 1.8), t.fillStyle = c[1], t.fillRect(e - 1, -9, 2, 18), t.beginPath(), t.arc(e, 0, 3, 0, a), d(t, c[1], 1.4);
}
function ne(e, t, n, i) {
	let [o, s, f] = n.c, p = n.motif;
	e.save(), e.lineJoin = "round", e.lineCap = "round";
	let m = t.gabarit;
	if (m === "tshirt" || m === "hoodie" || m === "jacket") {
		let n = !!(t.specs && t.specs.crop), r = m !== "tshirt", i = n ? 64 : 84;
		e.beginPath(), e.moveTo(36, 18), e.lineTo(18, 24), e.lineTo(r ? 8 : 10, r ? 74 : 46), e.lineTo(r ? 20 : 24, r ? 76 : 50), e.lineTo(28, 40), e.lineTo(28, i), e.lineTo(72, i), e.lineTo(72, 40), e.lineTo(r ? 80 : 76, r ? 76 : 50), e.lineTo(r ? 92 : 90, r ? 74 : 46), e.lineTo(82, 24), e.lineTo(64, 18), e.quadraticCurveTo(50, 28, 36, 18), e.closePath(), d(e, o, 3), m === "hoodie" && (e.beginPath(), e.ellipse(50, 20, 15, 7, 0, 0, a), d(e, c(o, .8), 2.5), n || (u(e, 37, 58, 26, 14, 4), d(e, c(o, .88), 2)), e.strokeStyle = f, e.lineWidth = 2, e.beginPath(), e.moveTo(46, 26), e.lineTo(45, 38), e.moveTo(54, 26), e.lineTo(55, 38), e.stroke()), m === "jacket" && (e.strokeStyle = f, e.lineWidth = 2, e.beginPath(), e.moveTo(50, 22), e.lineTo(50, i), e.stroke()), e.save(), e.translate(50, 70), e.scale(1.35, 1.35), b(e, p, f, o, m === "jacket" ? "jacket" : "tshirt"), e.restore();
	} else if (m === "jeans" || m === "cargo" || m === "shorts") {
		let t = m === "shorts" ? 56 : 90;
		if (e.beginPath(), e.moveTo(28, 10), e.lineTo(72, 10), e.lineTo(78, t), e.lineTo(54, t), e.lineTo(50, 34), e.lineTo(46, t), e.lineTo(22, t), e.closePath(), d(e, o, 3), e.fillStyle = c(o, .7), e.fillRect(29, 11, 42, 6), m === "jeans" && (e.strokeStyle = f, e.lineWidth = 1.4, e.beginPath(), e.moveTo(34, 18), e.lineTo(30, t - 2), e.moveTo(66, 18), e.lineTo(70, t - 2), e.stroke()), m === "cargo") for (let t of [27, 61]) u(e, t, 46, 13, 15, 2), d(e, s, 2);
	} else if (m === "cap") e.beginPath(), e.moveTo(18, 62), e.bezierCurveTo(16, 22, 74, 18, 76, 60), e.closePath(), d(e, o, 3), e.beginPath(), e.moveTo(60, 58), e.quadraticCurveTo(84, 54, 94, 66), e.quadraticCurveTo(80, 70, 60, 64), e.closePath(), d(e, c(o, .7), 2.5), u(e, 38, 36, 16, 12, 2), d(e, f, 2);
	else if (m === "beanie") {
		e.beginPath(), e.moveTo(20, 60), e.bezierCurveTo(16, 8, 84, 8, 80, 60), e.closePath(), d(e, o, 3), e.strokeStyle = c(o, .8), e.lineWidth = 2, e.beginPath();
		for (let t = 30; t <= 70; t += 8) e.moveTo(t, 54), e.lineTo(t, 24);
		e.stroke(), u(e, 16, 54, 68, 18, 6), d(e, c(o, .9), 3), e.fillStyle = f, e.fillRect(56, 58, 12, 9);
	} else if (m === "helmet") e.beginPath(), e.moveTo(14, 70), e.bezierCurveTo(10, 10, 90, 10, 86, 62), e.lineTo(80, 64), e.quadraticCurveTo(46, 58, 14, 70), e.closePath(), d(e, o, 3), e.strokeStyle = f, e.lineWidth = 6, e.beginPath(), e.moveTo(24, 40), e.quadraticCurveTo(50, 18, 76, 38), e.stroke();
	else if (m === "sneakers_low" || m === "sneakers_high") {
		let t = m === "sneakers_high";
		e.beginPath(), e.moveTo(12, 74), e.lineTo(12, t ? 22 : 44), e.lineTo(t ? 40 : 34, t ? 20 : 40), e.quadraticCurveTo(54, 50, 74, 54), e.quadraticCurveTo(92, 58, 90, 74), e.closePath(), d(e, o, 3), u(e, 10, 70, 82, 10, 3), d(e, s, 2.5), t && (e.fillStyle = f, e.fillRect(14, 30, 26, 6)), e.strokeStyle = l(o) > .5 ? c(o, .55) : r, e.lineWidth = 2, e.beginPath();
		for (let t = 0; t < 3; t++) e.moveTo(42 + t * 7, 46 + t * 3), e.lineTo(48 + t * 7, 42 + t * 3);
		e.stroke(), l(f) > .4 && !t && (e.fillStyle = f, e.beginPath(), e.arc(30, 58, 5, 0, a), e.fill());
	} else if (m === "kneepads" || m === "elbowpads") u(e, 24, 14, 52, 74, 22), d(e, o, 3), u(e, 31, 22, 38, 46, 16), d(e, s, 2.5), e.fillStyle = "rgba(255,255,255,.3)", e.fillRect(38, 28, 14, 5), e.fillStyle = f, e.fillRect(24, 74, 52, 5);
	else if (m === "wristguards") u(e, 26, 12, 48, 78, 10), d(e, o, 3), u(e, 40, 16, 10, 70, 4), d(e, s, 2), e.fillStyle = s, e.fillRect(28, 30, 44, 4), e.fillRect(28, 66, 44, 4);
	else if (m === "deck" || m === "complete") e.translate(50, 50), e.rotate(-Math.PI / 4), e.scale(.82, .82), te(e, {
		deck: n,
		wheels: m === "complete" ? { c: ["#F3F0E8"] } : null
	}, m === "complete");
	else if (m === "wheels") for (let [t, n] of [[34, 40], [62, 62]]) e.beginPath(), e.arc(t, n, 24, 0, a), d(e, o, 3), e.beginPath(), e.arc(t, n, 9, 0, a), d(e, s, 2);
	else if (m === "trucks") u(e, 12, 30, 76, 14, 6), d(e, o, 3), u(e, 36, 44, 28, 24, 4), d(e, s, 3), e.fillStyle = f, e.beginPath(), e.arc(50, 37, 4, 0, a), e.fill();
	else if (m === "bearings") for (let [t, n] of [[36, 40], [64, 60]]) e.beginPath(), e.arc(t, n, 20, 0, a), d(e, o, 3), e.beginPath(), e.arc(t, n, 12, 0, a), d(e, s, 2), e.beginPath(), e.arc(t, n, 5, 0, a), d(e, f, 2);
	else if (m === "griptape") {
		e.save(), e.translate(50, 50), e.rotate(-.3), u(e, -22, -40, 44, 80, 8), d(e, o, 3), e.fillStyle = f, e.globalAlpha = .35;
		for (let t = 0; t < 40; t++) e.fillRect(-18 + t * 13 % 36, -36 + t * 29 % 72, 2, 2);
		e.globalAlpha = 1, e.restore();
	} else (m === "look" || t.slot === "pack") && (t.pack_items || []).slice(0, 3).forEach((t, n) => {
		let r = i && i.get(t);
		r && (e.save(), e.translate(6 + n * 22, 6 + n % 2 * 14), e.scale(.62, .62), ne(e, r, {
			c: [
				r.colors.primary,
				r.colors.secondary,
				r.colors.accent
			],
			motif: null
		}, i), e.restore());
	});
	e.restore();
}
function re(t, i) {
	t.beginPath(), t.arc(0, 0, 22, 0, a), d(t, i === "boost" ? n : "#7C5CFF", 3), t.fillStyle = r, t.strokeStyle = e, t.lineWidth = 2, i === "boost" ? (t.beginPath(), t.moveTo(3, -15), t.lineTo(-9, 2), t.lineTo(-1, 2), t.lineTo(-4, 15), t.lineTo(9, -3), t.lineTo(1, -3), t.closePath(), t.fill(), t.stroke()) : (t.lineWidth = 7, t.strokeStyle = r, t.beginPath(), t.arc(0, -2, 9, Math.PI, 0), t.lineTo(9, 9), t.moveTo(-9, -2), t.lineTo(-9, 9), t.stroke(), t.fillStyle = e, t.fillRect(-12.5, 6, 7, 5), t.fillRect(5.5, 6, 7, 5));
}
var E = {
	shop_id: 426026,
	generated_at: "2026-10-01T14:26:05+00:00",
	products: [
		{
			id: 1,
			name: "T-shirt skate oversize Spawn Point, coton épais noir",
			url: "/t-shirt-skate-oversize-spawn-point-noir",
			price_ttc: 35,
			slot: "top",
			gabarit: "tshirt",
			gender: "unisex",
			colors: {
				primary: "#1A1A1D",
				secondary: "#1A1A1D",
				accent: "#C8FF2E"
			},
			sizes: [
				{
					label: "XS",
					variation_id: 1,
					stock: 6
				},
				{
					label: "S",
					variation_id: 2,
					stock: 12
				},
				{
					label: "M",
					variation_id: 3,
					stock: 15
				},
				{
					label: "L",
					variation_id: 4,
					stock: 14
				},
				{
					label: "XL",
					variation_id: 5,
					stock: 8
				},
				{
					label: "XXL",
					variation_id: 6,
					stock: 4
				}
			],
			specs: {},
			badge: "new",
			pack_items: [],
			exclusive_unlock: null,
			cart_field: "prodVar[1-1]"
		},
		{
			id: 2,
			name: "T-shirt skate Cône, coton craie et imprimé orange",
			url: "/t-shirt-skate-cone-craie",
			price_ttc: 32,
			slot: "top",
			gabarit: "tshirt",
			gender: "unisex",
			colors: {
				primary: "#E9E4D8",
				secondary: "#C9C3B5",
				accent: "#FF6A1A"
			},
			sizes: [
				{
					label: "XS",
					variation_id: 1,
					stock: 5
				},
				{
					label: "S",
					variation_id: 2,
					stock: 10
				},
				{
					label: "M",
					variation_id: 3,
					stock: 12
				},
				{
					label: "L",
					variation_id: 4,
					stock: 0
				},
				{
					label: "XL",
					variation_id: 5,
					stock: 7
				},
				{
					label: "XXL",
					variation_id: 6,
					stock: 3
				}
			],
			specs: {},
			badge: null,
			pack_items: [],
			exclusive_unlock: null,
			cart_field: "prodVar[1-1]"
		},
		{
			id: 3,
			name: "T-shirt crop femme Lampadaire, vert acide",
			url: "/t-shirt-crop-femme-lampadaire-vert-acide",
			price_ttc: 29,
			slot: "top",
			gabarit: "tshirt",
			gender: "women",
			colors: {
				primary: "#C8FF2E",
				secondary: "#9CC71E",
				accent: "#141416"
			},
			sizes: [
				{
					label: "XS",
					variation_id: 1,
					stock: 9
				},
				{
					label: "S",
					variation_id: 2,
					stock: 14
				},
				{
					label: "M",
					variation_id: 3,
					stock: 11
				},
				{
					label: "L",
					variation_id: 4,
					stock: 7
				},
				{
					label: "XL",
					variation_id: 5,
					stock: 4
				},
				{
					label: "XXL",
					variation_id: 6,
					stock: 2
				}
			],
			specs: { crop: !0 },
			badge: null,
			pack_items: [],
			exclusive_unlock: null,
			cart_field: "prodVar[1-1]"
		},
		{
			id: 4,
			name: "Hoodie skate Respawn brodé, molleton noir et vert acide",
			url: "/hoodie-skate-respawn-noir-vert-acide",
			price_ttc: 79,
			slot: "top",
			gabarit: "hoodie",
			gender: "unisex",
			colors: {
				primary: "#18181B",
				secondary: "#18181B",
				accent: "#C8FF2E"
			},
			sizes: [
				{
					label: "XS",
					variation_id: 1,
					stock: 4
				},
				{
					label: "S",
					variation_id: 2,
					stock: 9
				},
				{
					label: "M",
					variation_id: 3,
					stock: 0
				},
				{
					label: "L",
					variation_id: 4,
					stock: 6
				},
				{
					label: "XL",
					variation_id: 5,
					stock: 5
				},
				{
					label: "XXL",
					variation_id: 6,
					stock: 2
				}
			],
			specs: {},
			badge: "drop",
			pack_items: [],
			exclusive_unlock: null,
			cart_field: "prodVar[1-1]"
		},
		{
			id: 5,
			name: "Hoodie court femme Night Session, gris béton chiné",
			url: "/hoodie-court-femme-night-session-gris-beton",
			price_ttc: 75,
			slot: "top",
			gabarit: "hoodie",
			gender: "women",
			colors: {
				primary: "#8B8D93",
				secondary: "#6F7177",
				accent: "#FF6A1A"
			},
			sizes: [
				{
					label: "XS",
					variation_id: 1,
					stock: 7
				},
				{
					label: "S",
					variation_id: 2,
					stock: 10
				},
				{
					label: "M",
					variation_id: 3,
					stock: 8
				},
				{
					label: "L",
					variation_id: 4,
					stock: 5
				},
				{
					label: "XL",
					variation_id: 5,
					stock: 3
				},
				{
					label: "XXL",
					variation_id: 6,
					stock: 0
				}
			],
			specs: { crop: !0 },
			badge: null,
			pack_items: [],
			exclusive_unlock: null,
			cart_field: "prodVar[1-1]"
		},
		{
			id: 6,
			name: "Veste coach Halogène coupe-vent noire, bande réfléchissante",
			url: "/veste-coach-halogene-coupe-vent-noire",
			price_ttc: 109,
			slot: "top",
			gabarit: "jacket",
			gender: "unisex",
			colors: {
				primary: "#151517",
				secondary: "#0A0A0C",
				accent: "#CFD3D6"
			},
			sizes: [
				{
					label: "XS",
					variation_id: 1,
					stock: 2
				},
				{
					label: "S",
					variation_id: 2,
					stock: 4
				},
				{
					label: "M",
					variation_id: 3,
					stock: 5
				},
				{
					label: "L",
					variation_id: 4,
					stock: 4
				},
				{
					label: "XL",
					variation_id: 5,
					stock: 0
				},
				{
					label: "XXL",
					variation_id: 6,
					stock: 1
				}
			],
			specs: {},
			badge: "limited",
			pack_items: [],
			exclusive_unlock: "Trouver la cassette cachée",
			cart_field: "prodVar[1-1]"
		},
		{
			id: 7,
			name: "Jean baggy homme Ledge, denim brut indigo 14 oz",
			url: "/jean-baggy-homme-ledge-denim-brut",
			price_ttc: 89,
			slot: "bottom",
			gabarit: "jeans",
			gender: "men",
			colors: {
				primary: "#1F2F57",
				secondary: "#16223F",
				accent: "#D9A441"
			},
			sizes: [
				{
					label: "36",
					variation_id: 7,
					stock: 3
				},
				{
					label: "38",
					variation_id: 8,
					stock: 6
				},
				{
					label: "40",
					variation_id: 9,
					stock: 0
				},
				{
					label: "42",
					variation_id: 10,
					stock: 9
				},
				{
					label: "44",
					variation_id: 11,
					stock: 6
				},
				{
					label: "46",
					variation_id: 12,
					stock: 3
				}
			],
			specs: {},
			badge: null,
			pack_items: [],
			exclusive_unlock: null,
			cart_field: "prodVar[1-1]"
		},
		{
			id: 8,
			name: "Jean large femme Manual, taille haute bleu délavé",
			url: "/jean-large-femme-manual-taille-haute",
			price_ttc: 85,
			slot: "bottom",
			gabarit: "jeans",
			gender: "women",
			colors: {
				primary: "#7A9CC6",
				secondary: "#5F82AE",
				accent: "#E8C88A"
			},
			sizes: [
				{
					label: "36",
					variation_id: 7,
					stock: 8
				},
				{
					label: "38",
					variation_id: 8,
					stock: 10
				},
				{
					label: "40",
					variation_id: 9,
					stock: 7
				},
				{
					label: "42",
					variation_id: 10,
					stock: 5
				},
				{
					label: "44",
					variation_id: 11,
					stock: 3
				},
				{
					label: "46",
					variation_id: 12,
					stock: 2
				}
			],
			specs: { fit: "wide" },
			badge: null,
			pack_items: [],
			exclusive_unlock: null,
			cart_field: "prodVar[1-1]"
		},
		{
			id: 9,
			name: "Pantalon cargo skate Grind, toile kaki olive à poches",
			url: "/pantalon-cargo-skate-grind-kaki",
			price_ttc: 79,
			slot: "bottom",
			gabarit: "cargo",
			gender: "unisex",
			colors: {
				primary: "#5B6236",
				secondary: "#454A28",
				accent: "#2D311A"
			},
			sizes: [
				{
					label: "36",
					variation_id: 7,
					stock: 5
				},
				{
					label: "38",
					variation_id: 8,
					stock: 9
				},
				{
					label: "40",
					variation_id: 9,
					stock: 12
				},
				{
					label: "42",
					variation_id: 10,
					stock: 11
				},
				{
					label: "44",
					variation_id: 11,
					stock: 6
				},
				{
					label: "46",
					variation_id: 12,
					stock: 0
				}
			],
			specs: {},
			badge: "new",
			pack_items: [],
			exclusive_unlock: null,
			cart_field: "prodVar[1-1]"
		},
		{
			id: 10,
			name: "Short skate Bowl en denim noir, coupe large au genou",
			url: "/short-skate-bowl-denim-noir",
			price_ttc: 49,
			slot: "bottom",
			gabarit: "shorts",
			gender: "unisex",
			colors: {
				primary: "#1C1C1F",
				secondary: "#121214",
				accent: "#77777E"
			},
			sizes: [
				{
					label: "36",
					variation_id: 7,
					stock: 6
				},
				{
					label: "38",
					variation_id: 8,
					stock: 8
				},
				{
					label: "40",
					variation_id: 9,
					stock: 10
				},
				{
					label: "42",
					variation_id: 10,
					stock: 8
				},
				{
					label: "44",
					variation_id: 11,
					stock: 4
				},
				{
					label: "46",
					variation_id: 12,
					stock: 2
				}
			],
			specs: {},
			badge: null,
			pack_items: [],
			exclusive_unlock: null,
			cart_field: "prodVar[1-1]"
		},
		{
			id: 11,
			name: "Casquette 5 pans Respawn, coton noir et patch vert acide",
			url: "/casquette-5-pans-respawn-noir",
			price_ttc: 35,
			slot: "head",
			gabarit: "cap",
			gender: "unisex",
			colors: {
				primary: "#161618",
				secondary: "#161618",
				accent: "#C8FF2E"
			},
			sizes: [{
				label: "Unique",
				variation_id: null,
				stock: 24
			}],
			specs: {},
			badge: "drop",
			pack_items: [],
			exclusive_unlock: null,
			cart_field: null
		},
		{
			id: 12,
			name: "Bonnet côtelé docker Lampadaire, orange cône",
			url: "/bonnet-cotele-docker-lampadaire-orange",
			price_ttc: 25,
			slot: "head",
			gabarit: "beanie",
			gender: "unisex",
			colors: {
				primary: "#FF6A1A",
				secondary: "#D9560F",
				accent: "#141416"
			},
			sizes: [{
				label: "Unique",
				variation_id: null,
				stock: 30
			}],
			specs: {},
			badge: null,
			pack_items: [],
			exclusive_unlock: null,
			cart_field: null
		},
		{
			id: 13,
			name: "Sneakers skate basses Ollie Lo, suède noir semelle vulcanisée",
			url: "/sneakers-skate-basses-ollie-lo-noir",
			price_ttc: 85,
			slot: "feet",
			gabarit: "sneakers_low",
			gender: "unisex",
			colors: {
				primary: "#1B1B1E",
				secondary: "#F3F0E8",
				accent: "#2E2E33"
			},
			sizes: [
				{
					label: "36",
					variation_id: 1,
					stock: 3
				},
				{
					label: "37",
					variation_id: 2,
					stock: 4
				},
				{
					label: "38",
					variation_id: 3,
					stock: 6
				},
				{
					label: "39",
					variation_id: 4,
					stock: 7
				},
				{
					label: "40",
					variation_id: 5,
					stock: 8
				},
				{
					label: "41",
					variation_id: 6,
					stock: 9
				},
				{
					label: "42",
					variation_id: 7,
					stock: 0
				},
				{
					label: "43",
					variation_id: 8,
					stock: 7
				},
				{
					label: "44",
					variation_id: 9,
					stock: 5
				},
				{
					label: "45",
					variation_id: 10,
					stock: 3
				},
				{
					label: "46",
					variation_id: 11,
					stock: 2
				}
			],
			specs: {},
			badge: null,
			pack_items: [],
			exclusive_unlock: null,
			cart_field: "prodVar[1-2]"
		},
		{
			id: 14,
			name: "Sneakers skate basses Kickflip Lo, toile craie et vert acide",
			url: "/sneakers-skate-basses-kickflip-lo-craie",
			price_ttc: 85,
			slot: "feet",
			gabarit: "sneakers_low",
			gender: "unisex",
			colors: {
				primary: "#ECE6D8",
				secondary: "#C98A3A",
				accent: "#C8FF2E"
			},
			sizes: [
				{
					label: "36",
					variation_id: 1,
					stock: 5
				},
				{
					label: "37",
					variation_id: 2,
					stock: 6
				},
				{
					label: "38",
					variation_id: 3,
					stock: 7
				},
				{
					label: "39",
					variation_id: 4,
					stock: 0
				},
				{
					label: "40",
					variation_id: 5,
					stock: 6
				},
				{
					label: "41",
					variation_id: 6,
					stock: 5
				},
				{
					label: "42",
					variation_id: 7,
					stock: 5
				},
				{
					label: "43",
					variation_id: 8,
					stock: 4
				},
				{
					label: "44",
					variation_id: 9,
					stock: 3
				},
				{
					label: "45",
					variation_id: 10,
					stock: 2
				},
				{
					label: "46",
					variation_id: 11,
					stock: 1
				}
			],
			specs: {},
			badge: "new",
			pack_items: [],
			exclusive_unlock: null,
			cart_field: "prodVar[1-2]"
		},
		{
			id: 15,
			name: "Sneakers skate montantes Bowl Hi, cuir noir et orange cône",
			url: "/sneakers-skate-montantes-bowl-hi-noir-orange",
			price_ttc: 95,
			slot: "feet",
			gabarit: "sneakers_high",
			gender: "unisex",
			colors: {
				primary: "#141416",
				secondary: "#F3F0E8",
				accent: "#FF6A1A"
			},
			sizes: [
				{
					label: "36",
					variation_id: 1,
					stock: 2
				},
				{
					label: "37",
					variation_id: 2,
					stock: 3
				},
				{
					label: "38",
					variation_id: 3,
					stock: 4
				},
				{
					label: "39",
					variation_id: 4,
					stock: 4
				},
				{
					label: "40",
					variation_id: 5,
					stock: 5
				},
				{
					label: "41",
					variation_id: 6,
					stock: 0
				},
				{
					label: "42",
					variation_id: 7,
					stock: 5
				},
				{
					label: "43",
					variation_id: 8,
					stock: 4
				},
				{
					label: "44",
					variation_id: 9,
					stock: 3
				},
				{
					label: "45",
					variation_id: 10,
					stock: 2
				},
				{
					label: "46",
					variation_id: 11,
					stock: 1
				}
			],
			specs: {},
			badge: "limited",
			pack_items: [],
			exclusive_unlock: "Passer un gap nommé",
			cart_field: "prodVar[1-2]"
		},
		{
			id: 16,
			name: "Casque de skate Respawn, coque ABS noir mat",
			url: "/casque-skate-respawn-noir-mat",
			price_ttc: 59,
			slot: "helmet",
			gabarit: "helmet",
			gender: "unisex",
			colors: {
				primary: "#1E1E21",
				secondary: "#050506",
				accent: "#C8FF2E"
			},
			sizes: [
				{
					label: "S",
					variation_id: 2,
					stock: 8
				},
				{
					label: "M",
					variation_id: 3,
					stock: 12
				},
				{
					label: "L",
					variation_id: 4,
					stock: 7
				}
			],
			specs: {},
			badge: null,
			pack_items: [],
			exclusive_unlock: null,
			cart_field: "prodVar[1-1]"
		},
		{
			id: 17,
			name: "Genouillères skate Drop In, coque orange et mousse épaisse",
			url: "/genouilleres-skate-drop-in",
			price_ttc: 45,
			slot: "knees",
			gabarit: "kneepads",
			gender: "unisex",
			colors: {
				primary: "#111113",
				secondary: "#FF6A1A",
				accent: "#888888"
			},
			sizes: [
				{
					label: "S",
					variation_id: 2,
					stock: 9
				},
				{
					label: "M",
					variation_id: 3,
					stock: 11
				},
				{
					label: "L",
					variation_id: 4,
					stock: 0
				}
			],
			specs: {},
			badge: null,
			pack_items: [],
			exclusive_unlock: null,
			cart_field: "prodVar[1-1]"
		},
		{
			id: 18,
			name: "Coudières skate Slam, coque orange et néoprène noir",
			url: "/coudieres-skate-slam",
			price_ttc: 35,
			slot: "elbows",
			gabarit: "elbowpads",
			gender: "unisex",
			colors: {
				primary: "#111113",
				secondary: "#FF6A1A",
				accent: "#888888"
			},
			sizes: [
				{
					label: "S",
					variation_id: 2,
					stock: 8
				},
				{
					label: "M",
					variation_id: 3,
					stock: 10
				},
				{
					label: "L",
					variation_id: 4,
					stock: 6
				}
			],
			specs: {},
			badge: null,
			pack_items: [],
			exclusive_unlock: null,
			cart_field: "prodVar[1-1]"
		},
		{
			id: 19,
			name: "Protège-poignets skate Wrist Save, attelle vert acide",
			url: "/protege-poignets-skate-wrist-save",
			price_ttc: 25,
			slot: "wrists",
			gabarit: "wristguards",
			gender: "unisex",
			colors: {
				primary: "#161618",
				secondary: "#C8FF2E",
				accent: "#0C0C0E"
			},
			sizes: [
				{
					label: "S",
					variation_id: 2,
					stock: 10
				},
				{
					label: "M",
					variation_id: 3,
					stock: 14
				},
				{
					label: "L",
					variation_id: 4,
					stock: 9
				}
			],
			specs: {},
			badge: null,
			pack_items: [],
			exclusive_unlock: null,
			cart_field: "prodVar[1-1]"
		},
		{
			id: 20,
			name: "Plateau de skate Lampadaire, érable 7 plis, 7,75\" à 8,5\"",
			url: "/plateau-skate-lampadaire",
			price_ttc: 69,
			slot: "deck",
			gabarit: "deck",
			gender: "unisex",
			colors: {
				primary: "#141416",
				secondary: "#C9A26B",
				accent: "#C8FF2E"
			},
			sizes: [
				{
					label: "7,75\"",
					variation_id: 1,
					stock: 5
				},
				{
					label: "8\"",
					variation_id: 2,
					stock: 9
				},
				{
					label: "8,25\"",
					variation_id: 3,
					stock: 0
				},
				{
					label: "8,5\"",
					variation_id: 4,
					stock: 4
				}
			],
			specs: {
				length_in: "31,5 à 32,3",
				wheelbase_in: 14.25,
				plies: 7,
				concave: "moyen"
			},
			badge: "drop",
			pack_items: [],
			exclusive_unlock: null,
			cart_field: "prodVar[1-3]"
		},
		{
			id: 21,
			name: "Plateau de skate Cône, érable 7 plis graphisme orange",
			url: "/plateau-skate-cone",
			price_ttc: 65,
			slot: "deck",
			gabarit: "deck",
			gender: "unisex",
			colors: {
				primary: "#2A2A2E",
				secondary: "#C9A26B",
				accent: "#FF6A1A"
			},
			sizes: [
				{
					label: "7,75\"",
					variation_id: 1,
					stock: 7
				},
				{
					label: "8\"",
					variation_id: 2,
					stock: 10
				},
				{
					label: "8,25\"",
					variation_id: 3,
					stock: 8
				},
				{
					label: "8,5\"",
					variation_id: 4,
					stock: 5
				}
			],
			specs: {
				length_in: "31,5 à 32,3",
				wheelbase_in: 14.25,
				plies: 7,
				concave: "moyen"
			},
			badge: null,
			pack_items: [],
			exclusive_unlock: null,
			cart_field: "prodVar[1-3]"
		},
		{
			id: 22,
			name: "Plateau de skate Game Over, érable 7 plis pixel art",
			url: "/plateau-skate-game-over",
			price_ttc: 69,
			slot: "deck",
			gabarit: "deck",
			gender: "unisex",
			colors: {
				primary: "#141416",
				secondary: "#C9A26B",
				accent: "#FF6A1A"
			},
			sizes: [
				{
					label: "7,75\"",
					variation_id: 1,
					stock: 2
				},
				{
					label: "8\"",
					variation_id: 2,
					stock: 4
				},
				{
					label: "8,25\"",
					variation_id: 3,
					stock: 3
				},
				{
					label: "8,5\"",
					variation_id: 4,
					stock: 1
				}
			],
			specs: {
				length_in: "31,5 à 32,3",
				wheelbase_in: 14.25,
				plies: 7,
				concave: "moyen"
			},
			badge: "limited",
			pack_items: [],
			exclusive_unlock: "Collecter les lettres S-K-A-T-E",
			cart_field: "prodVar[1-3]"
		},
		{
			id: 23,
			name: "Roues de skate Street 52 mm 101A, uréthane craie, jeu de 4",
			url: "/roues-skate-street-52mm-101a",
			price_ttc: 45,
			slot: "wheels",
			gabarit: "wheels",
			gender: "unisex",
			colors: {
				primary: "#F3F0E8",
				secondary: "#1D1D21",
				accent: "#77777E"
			},
			sizes: [{
				label: "Unique",
				variation_id: null,
				stock: 18
			}],
			specs: {
				diameter_mm: 52,
				durometer: "101A"
			},
			badge: "new",
			pack_items: [],
			exclusive_unlock: null,
			cart_field: null
		},
		{
			id: 24,
			name: "Roues de skate Bowl 56 mm 95A, uréthane vert acide, jeu de 4",
			url: "/roues-skate-bowl-56mm-95a-vert",
			price_ttc: 49,
			slot: "wheels",
			gabarit: "wheels",
			gender: "unisex",
			colors: {
				primary: "#C8FF2E",
				secondary: "#1D1D21",
				accent: "#77777E"
			},
			sizes: [{
				label: "Unique",
				variation_id: null,
				stock: 12
			}],
			specs: {
				diameter_mm: 56,
				durometer: "95A"
			},
			badge: null,
			pack_items: [],
			exclusive_unlock: null,
			cart_field: null
		},
		{
			id: 25,
			name: "Trucks de skate Halogène, aluminium brut, la paire",
			url: "/trucks-skate-halogene-aluminium",
			price_ttc: 69,
			slot: "trucks",
			gabarit: "trucks",
			gender: "unisex",
			colors: {
				primary: "#B9BEC4",
				secondary: "#8A8F95",
				accent: "#141416"
			},
			sizes: [{
				label: "139 mm",
				variation_id: 1,
				stock: 10
			}, {
				label: "149 mm",
				variation_id: 2,
				stock: 8
			}],
			specs: {
				height_mm: 53,
				bushings: "92A",
				axle_mm: [139, 149]
			},
			badge: null,
			pack_items: [],
			exclusive_unlock: null,
			cart_field: "prodVar[1-4]"
		},
		{
			id: 26,
			name: "Roulements de skate Spin, acier pré-lubrifié, jeu de 8",
			url: "/roulements-skate-spin-jeu-de-8",
			price_ttc: 29,
			slot: "bearings",
			gabarit: "bearings",
			gender: "unisex",
			colors: {
				primary: "#C3C7CC",
				secondary: "#C8FF2E",
				accent: "#0A0A0C"
			},
			sizes: [{
				label: "Unique",
				variation_id: null,
				stock: 40
			}],
			specs: { format: "608" },
			badge: null,
			pack_items: [],
			exclusive_unlock: null,
			cart_field: null
		},
		{
			id: 27,
			name: "Grip de skate Night, feuille noire 9\" x 33\" anti-bulles",
			url: "/grip-skate-night-noir",
			price_ttc: 12,
			slot: "griptape",
			gabarit: "griptape",
			gender: "unisex",
			colors: {
				primary: "#0D0D0F",
				secondary: "#0D0D0F",
				accent: "#E8E1D0"
			},
			sizes: [{
				label: "Unique",
				variation_id: null,
				stock: 50
			}],
			specs: { size_in: "9 x 33" },
			badge: null,
			pack_items: [],
			exclusive_unlock: null,
			cart_field: null
		},
		{
			id: 28,
			name: "Look complet Spawn Point : tee, cargo et casquette",
			url: "/look-complet-spawn-point",
			price_ttc: 129,
			slot: "pack",
			gabarit: "look",
			gender: "unisex",
			colors: {
				primary: "#1A1A1D",
				secondary: "#5B6236",
				accent: "#C8FF2E"
			},
			sizes: [
				{
					label: "XS",
					variation_id: 1,
					stock: 4
				},
				{
					label: "S",
					variation_id: 2,
					stock: 6
				},
				{
					label: "M",
					variation_id: 3,
					stock: 8
				},
				{
					label: "L",
					variation_id: 4,
					stock: 7
				},
				{
					label: "XL",
					variation_id: 5,
					stock: 4
				},
				{
					label: "XXL",
					variation_id: 6,
					stock: 0
				}
			],
			specs: { bottom_size_equivalence: {
				XS: "36",
				S: "38",
				M: "40",
				L: "42",
				XL: "44",
				XXL: "46"
			} },
			badge: "drop",
			pack_items: [
				1,
				9,
				11
			],
			exclusive_unlock: null,
			cart_field: "prodVar[1-1]"
		},
		{
			id: 29,
			name: "Look complet Night Session femme : hoodie court, jean, bonnet",
			url: "/look-complet-night-session-femme",
			price_ttc: 159,
			slot: "pack",
			gabarit: "look",
			gender: "women",
			colors: {
				primary: "#8B8D93",
				secondary: "#7A9CC6",
				accent: "#FF6A1A"
			},
			sizes: [
				{
					label: "XS",
					variation_id: 1,
					stock: 5
				},
				{
					label: "S",
					variation_id: 2,
					stock: 7
				},
				{
					label: "M",
					variation_id: 3,
					stock: 6
				},
				{
					label: "L",
					variation_id: 4,
					stock: 4
				},
				{
					label: "XL",
					variation_id: 5,
					stock: 2
				},
				{
					label: "XXL",
					variation_id: 6,
					stock: 0
				}
			],
			specs: { bottom_size_equivalence: {
				XS: "36",
				S: "38",
				M: "40",
				L: "42",
				XL: "44",
				XXL: "46"
			} },
			badge: "new",
			pack_items: [
				5,
				8,
				12
			],
			exclusive_unlock: null,
			cart_field: "prodVar[1-1]"
		},
		{
			id: 30,
			name: "Kit protections skate Full Pad : casque, genoux, coudes, poignets",
			url: "/kit-protections-skate-full-pad",
			price_ttc: 135,
			slot: "pack",
			gabarit: "look",
			gender: "unisex",
			colors: {
				primary: "#1E1E21",
				secondary: "#FF6A1A",
				accent: "#C8FF2E"
			},
			sizes: [
				{
					label: "S",
					variation_id: 2,
					stock: 5
				},
				{
					label: "M",
					variation_id: 3,
					stock: 7
				},
				{
					label: "L",
					variation_id: 4,
					stock: 3
				}
			],
			specs: {},
			badge: null,
			pack_items: [
				16,
				17,
				18,
				19
			],
			exclusive_unlock: null,
			cart_field: "prodVar[1-1]"
		},
		{
			id: 31,
			name: "Skate complet Lampadaire monté, plateau 7,75\" à 8,5\"",
			url: "/skate-complet-lampadaire-monte",
			price_ttc: 179,
			slot: "pack",
			gabarit: "complete",
			gender: "unisex",
			colors: {
				primary: "#141416",
				secondary: "#B9BEC4",
				accent: "#F3F0E8"
			},
			sizes: [
				{
					label: "7,75\"",
					variation_id: 1,
					stock: 3
				},
				{
					label: "8\"",
					variation_id: 2,
					stock: 6
				},
				{
					label: "8,25\"",
					variation_id: 3,
					stock: 4
				},
				{
					label: "8,5\"",
					variation_id: 4,
					stock: 2
				}
			],
			specs: {
				deck: "Lampadaire",
				trucks_axle_by_width: {
					"7,75\"": 139,
					"8\"": 139,
					"8,25\"": 149,
					"8,5\"": 149
				},
				diameter_mm: 52,
				durometer: "101A"
			},
			badge: null,
			pack_items: [
				20,
				25,
				23,
				26,
				27
			],
			exclusive_unlock: null,
			cart_field: "prodVar[1-3]"
		},
		{
			id: 32,
			name: "Pack Remise à neuf : roues Street, roulements Spin et grip",
			url: "/pack-remise-a-neuf-roues-roulements-grip",
			price_ttc: 75,
			slot: "pack",
			gabarit: "look",
			gender: "unisex",
			colors: {
				primary: "#F3F0E8",
				secondary: "#C8FF2E",
				accent: "#0D0D0F"
			},
			sizes: [{
				label: "Unique",
				variation_id: null,
				stock: 15
			}],
			specs: {},
			badge: null,
			pack_items: [
				23,
				26,
				27
			],
			exclusive_unlock: null,
			cart_field: null
		}
	]
};
//#endregion
//#region 2d/src/catalog-norm.js
function D(e) {
	let t = (e.products || []).map((e) => ({
		...e,
		colors: {
			primary: "#2a2a2e",
			secondary: "#141416",
			accent: "#C8FF2E",
			...e.colors || {}
		},
		sizes: (e.sizes || []).map((e) => ({
			...e,
			stock: e.stock == null ? 99 : e.stock
		})),
		specs: e.specs || {},
		pack_items: e.pack_items || []
	}));
	return {
		raw: e,
		products: t,
		byId: new Map(t.map((e) => [e.id, e])),
		categories: e.categories || []
	};
}
//#endregion
//#region 2d/src/looks.js
var O = D(E);
function k(e) {
	let t = String(e.name || "").toLowerCase();
	return /game ?over|pixel/.test(t) ? "pixel" : /halog|réfléchiss|reflechiss/.test(t) ? "reflect" : /night/.test(t) ? "night" : /cône|cone/.test(t) ? "cone" : /lampadaire|spawn point/.test(t) ? "lamp" : /respawn/.test(t) ? "R" : e.slot === "deck" ? "stripes" : null;
}
var A = (e) => [
	e.colors.primary,
	e.colors.secondary,
	e.colors.accent
];
function ie(e) {
	if (!e) return null;
	let t = e.gabarit, n = e.specs || {}, r = {
		id: e.id,
		c: A(e),
		motif: k(e)
	};
	switch (e.slot) {
		case "top": return {
			...r,
			g: t === "hoodie" ? n.crop ? "hoodiecrop" : "hoodie" : t === "jacket" ? "jacket" : n.crop ? "crop" : "tshirt"
		};
		case "bottom": return {
			...r,
			g: t === "shorts" ? "shorts" : t === "cargo" ? "cargo" : "jeans",
			hw: e.gender === "women" || n.fit === "wide",
			wide: n.fit === "wide" || e.gender === "men"
		};
		case "head": return {
			...r,
			g: t === "beanie" ? "beanie" : "cap"
		};
		case "feet": return {
			...r,
			g: t === "sneakers_high" ? "high" : "low"
		};
		default: return r;
	}
}
var j = [
	"head",
	"helmet",
	"top",
	"bottom",
	"feet",
	"knees",
	"elbows",
	"wrists",
	"deck",
	"wheels",
	"trucks",
	"bearings",
	"griptape"
], M = [
	"helmet",
	"knees",
	"elbows",
	"wrists"
], N = [
	"trucks",
	"bearings",
	"griptape"
], P = [{
	s: "#EDB990",
	sh: "#CF936B",
	hair: "#3A2216",
	lip: "#B86A5A"
}, {
	s: "#8B593A",
	sh: "#6B4128",
	hair: "#140E0B",
	lip: "#5E3324"
}];
function F(e, t = 0) {
	let n = P[e.skin] || P[0], r = {
		gender: e.gender === "m" ? "m" : "f",
		skin: n.s,
		skinSh: n.sh,
		hair: n.hair,
		lip: n.lip,
		bag: t
	};
	for (let t of j) r[t] = e.wear && e.wear[t] ? ie(O.byId.get(e.wear[t])) : null;
	return r.helmet && (r.head = null), r;
}
function I(e) {
	let t = {}, n = [];
	for (let r of e) {
		let e = O.byId.get(Number(r.id));
		if (!e) continue;
		let i = e.slot === "pack" && e.pack_items.length ? e.pack_items : [e.id], a = Math.max(1, Math.min(20, Number(r.qty) || 1));
		for (let e = 0; e < a; e++) for (let e of i) {
			let r = O.byId.get(e);
			r && (j.includes(r.slot) && !t[r.slot] ? t[r.slot] = r.id : n.push(r.id));
		}
	}
	return {
		wear: t,
		bag: n
	};
}
var L = {
	tshirt: "Tee",
	hoodie: "Hoodie",
	jacket: "Veste",
	jeans: "Jean",
	cargo: "Cargo",
	shorts: "Short",
	cap: "Casquette",
	beanie: "Bonnet",
	sneakers_low: "",
	sneakers_high: "",
	helmet: "Casque",
	kneepads: "Genouillères",
	elbowpads: "Coudières",
	wristguards: "Poignets",
	deck: "Plateau",
	wheels: "Roues",
	trucks: "Trucks",
	bearings: "Roulements",
	griptape: "Grip",
	look: "Look",
	complete: "Skate complet"
}, ae = /^(t-shirt|tee|crop|femme|homme|oversize|skate|de|hoodie|court|veste|coach|jean|baggy|large|pantalon|cargo|short|casquette|5|pans|bonnet|côtelé|docker|sneakers|basses|montantes|casque|genouillères|coudières|protège-poignets|plateau|roues|trucks|roulements|grip|look|complet|kit|protections|pack)$/i, oe = (e) => {
	let t = String(e.name).split(/[,:]/)[0].split(/\s+/), n = 0;
	for (; n < t.length - 1 && ae.test(t[n]);) n++;
	let r = [];
	for (let e of t.slice(n)) if (r.length && /^[a-zà-ÿ]/.test(e) && !/^(mm|à|neuf|in)$/i.test(e) || (r.push(e), r.length >= 3)) break;
	let i = L[e.gabarit] ?? "";
	return e.gabarit === "tshirt" && e.specs && e.specs.crop && (i = "Crop"), e.slot === "pack" && /kit/i.test(e.name) && (i = "Kit"), e.slot === "pack" && /^pack/i.test(e.name) && (i = "Pack"), ((i ? i + " " : "") + r.join(" ")).trim();
};
//#endregion
//#region 2d/src/track.js
function se(e) {
	return () => {
		e |= 0, e = e + 1831565813 | 0;
		let t = Math.imul(e ^ e >>> 15, 1 | e);
		return t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t, ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
var ce = (e, t, n) => e < t ? t : e > n ? n : e, R = [
	"Gap du canal",
	"Canal de minuit",
	"Gap Respawn",
	"Gap des docks"
], z = 2150;
function le(e) {
	let t = se(e >>> 0 || 1), n = {
		seed: e,
		segs: [],
		ledges: [],
		rails: [],
		cones: [],
		walls: [],
		lamps: [],
		gaps: [],
		stairs: [],
		hints: [],
		props: [],
		items: [],
		x: -1500,
		y: 0
	}, r = (e, t, r) => {
		n.segs.push({
			x0: n.x,
			y0: n.y,
			x1: e,
			y1: t,
			kind: r
		}), n.x = e, n.y = t;
	}, i = () => 600 + 260 * ce(n.x / 42e3, 0, 1) + 90, a = (e) => r(n.x + e * (i() / 640), n.y, "flat"), o = (e) => n.lamps.push({
		x: e,
		y: n.y
	}), s = (e, r, i) => n.walls.push({
		x0: e,
		x1: r,
		y: n.y,
		h: i || 170 + t() * 60,
		g: Math.floor(t() * 5)
	}), c = (e) => n.hints.push({
		x: n.x - 250,
		k: e
	}), l = (e) => e[Math.floor(t() * e.length)], u = (e, r, i, a) => n.items.push({
		k: e,
		x: r,
		y: i,
		ph: t() * 6,
		...a
	}), d = (e, t, n, r, i = 5) => {
		for (let a = 0; a < i; a++) {
			let o = (a + .5) / i;
			u("coin", e + o * n, t - 4 * r * o * (1 - o) - 70);
		}
	}, f = (e, t, n, r) => {
		for (let i = 0; i < r; i++) u("coin", e + (t - e) * (i + .5) / r, n);
	}, p = 0, m = 0, h = "SKATE", g = {
		2: "cone",
		6: "rail",
		11: "stairs",
		16: "gap",
		21: "gap"
	}, _ = () => g[p] && m < 5, v = {
		cone() {
			a(240);
			let e = t() < .45 ? 2 : 1;
			t() < .5 && s(n.x - 200, n.x + 420);
			let r = n.x + 60;
			for (let t = 0; t < e; t++) n.cones.push({
				x: r + t * 44,
				y: n.y,
				hit: 0
			});
			_() ? u("letter", r + 20, n.y - 255, { ch: h[m++] }) : d(r - 160, n.y, 380, 150, 6), a(e * 44 + 400), t() < .5 && o(n.x - 200);
		},
		ledge() {
			a(220);
			let e = 300 + (t() * 160 | 0), r = l([
				"beton",
				"banc",
				"manny"
			]);
			t() < .7 && s(n.x - 160, n.x + e + 160);
			let i = {
				x0: n.x,
				x1: n.x + e,
				y: n.y,
				top: n.y - (r === "manny" ? 34 : 44),
				style: r
			};
			n.ledges.push(i), f(i.x0 + 30, i.x1 - 20, i.top - 80, 5), a(e + 330), o(n.x - 120);
		},
		rail() {
			a(220);
			let e = 360 + (t() * 180 | 0);
			t() < .5 && s(n.x - 100, n.x + e + 100), n.rails.push({
				x0: n.x,
				y0: n.y - 56,
				x1: n.x + e,
				y1: n.y - 56,
				style: t() < .5 ? "rond" : "plat"
			});
			let r = _();
			r && u("letter", n.x + e * .75, n.y - 56 - 95, { ch: h[m++] }), f(n.x + 30, n.x + e * (r ? .6 : .95), n.y - 56 - 85, r ? 4 : 6), a(e + 340);
		},
		stairs(e) {
			a(280), o(n.x - 180);
			let i = 5 + (t() * 4 | 0), s = n.x, c = n.y;
			if (r(s + i * 30, c + i * 19, "stairs"), n.stairs.push({
				x0: s,
				y0: c,
				n: i,
				run: 30,
				rise: 19
			}), e) {
				let e = {
					x0: s - 24,
					y0: c - 50 - 456 / 30,
					x1: s + i * 30 - 6,
					y1: c + i * 19 - 50 - 114 / 30,
					style: "main"
				};
				n.rails.push(e);
				for (let t = 0; t < 4; t++) {
					let n = (t + .5) / 4;
					u("coin", e.x0 + (e.x1 - e.x0) * n, e.y0 + (e.y1 - e.y0) * n - 85);
				}
			}
			_() ? u("letter", s + i * 30 * .5, c - 230, { ch: h[m++] }) : e || d(s - 40, c, i * 30 + 200, 200, 5), n.cassetteAt === p && u("cassette", s + i * 30 * .55, c - 300), a(500);
		},
		gap() {
			a(260);
			let e = n.x, t = n.y;
			r(e + 120, t - 46, "kick");
			let s = n.x;
			n.y = t + 170, r(s + 300, t + 170, "pit"), n.y = t, n.gaps.push({
				x0: s,
				x1: s + 300,
				y: t,
				name: R[n.gaps.length % R.length]
			});
			let c = i();
			if (_()) u("letter", s + c * (m === 4 ? .456 : .34), t - (m === 4 ? 410 : 350), { ch: h[m++] });
			else for (let e = 0; e < 6; e++) {
				let n = .08 + e * .11;
				u("coin", s + c * n, t - 46 - (720 * n - .5 * z * n * n) - 70);
			}
			n.cassetteAt === p && u("cassette", s + c * .456, t - 415), a(520), o(n.x - 300);
		},
		bank() {
			a(180), r(n.x + 300, n.y - 120, "bank"), f(n.x - 280, n.x - 20, n.y + 40, 4), a(380), o(n.x - 200);
		},
		drop() {
			a(300), n.props.push({
				k: "drop",
				x: n.x,
				y: n.y
			}), n.y += 100, d(n.x - 40, n.y - 100, 360, 100, 5), a(480);
		},
		combo() {
			a(200), n.ledges.push({
				x0: n.x,
				x1: n.x + 280,
				y: n.y,
				top: n.y - 44,
				style: "beton"
			}), s(n.x - 100, n.x + 280 + 700), f(n.x + 20, n.x + 280 - 20, n.y - 44 - 80, 4), a(530), n.rails.push({
				x0: n.x,
				y0: n.y - 56,
				x1: n.x + 380,
				y1: n.y - 56,
				style: "rond"
			}), f(n.x + 20, n.x + 380 - 20, n.y - 56 - 85, 5), a(720);
		},
		bonus(e) {
			a(260), u(e, n.x, n.y - 70), a(240);
		}
	};
	n.cassetteAt = t() < .45 ? 12 + Math.floor(t() * 18) : -1, r(-1100, 0, "flat"), r(200, 0, "flat"), n.introWall = {
		x0: -1250,
		x1: -60,
		y: 0
	}, o(-1150), o(60), n.props.push({
		k: "bin",
		x: -760,
		y: 0
	}, {
		k: "hydrant",
		x: -140,
		y: 0
	}), c("ollie"), v.cone(), v.cone(), c("grind"), v.ledge(), v.rail(), c("flip"), v.stairs(!1), c("kick"), v.gap(), c("perfect"), v.bank(), v.stairs(!0), v.combo();
	let y = [
		"cone",
		"ledge",
		"rail",
		"stairs",
		"stairsR",
		"gap",
		"combo",
		"drop",
		"ledge",
		"rail",
		"gap"
	];
	for (; n.x < 64e3;) {
		p++;
		let e = l(y);
		p % 7 == 3 ? e = "boost" : p % 11 == 6 && (e = "magnet"), g[p] ? e = g[p] : n.cassetteAt === p ? e = t() < .5 ? "stairs" : "gap" : n.y > 140 && t() < .8 && e !== "boost" && e !== "magnet" && (e = "bank"), n.y < -120 && e === "bank" && (e = "rail"), e === "stairsR" ? v.stairs(!0) : e === "boost" || e === "magnet" ? v.bonus(e) : v[e]();
	}
	return a(4e3), n.grind = [...n.ledges.map((e) => ({
		x0: e.x0,
		x1: e.x1,
		y0: e.top,
		y1: e.top,
		o: e,
		kind: "ledge"
	})), ...n.rails.map((e) => ({
		x0: e.x0,
		x1: e.x1,
		y0: e.y0,
		y1: e.y1,
		o: e,
		kind: "rail"
	}))].sort((e, t) => e.x0 - t.x0), n.items.sort((e, t) => e.x - t.x), n.items.forEach((e, t) => {
		e.i = t;
	}), n;
}
function ue(e, t) {
	let n = e.segs, r = 0, i = n.length - 1;
	for (; r < i;) {
		let e = r + i + 1 >> 1;
		n[e].x0 <= t ? r = e : i = e - 1;
	}
	return r;
}
function B(e, t) {
	let n = e.segs[ue(e, t)], r = n.x1 > n.x0 ? ce((t - n.x0) / (n.x1 - n.x0), 0, 1) : 0;
	return {
		y: n.y0 + (n.y1 - n.y0) * r,
		ang: Math.atan2(n.y1 - n.y0, n.x1 - n.x0),
		s: n
	};
}
var de = (e, t) => e.y0 + (e.y1 - e.y0) * (e.x1 > e.x0 ? ce((t - e.x0) / (e.x1 - e.x0), 0, 1) : 0);
function fe(e = /* @__PURE__ */ new Date()) {
	let t = e.toISOString().slice(0, 10), n = 2166136261;
	for (let e of t) n = Math.imul(n ^ e.charCodeAt(0), 16777619);
	return n >>> 0 || 1;
}
var pe = 1 / 120, me = .05, he = 2150, ge = 560, _e = 820, ve = .17, ye = 6, V = 25, be = {
	l: {
		n: "Kickflip",
		pts: 90,
		dur: .4,
		roll: 1,
		yaw: 0
	},
	r: {
		n: "Heelflip",
		pts: 90,
		dur: .4,
		roll: -1,
		yaw: 0
	},
	d: {
		n: "Pop Shove-it",
		pts: 70,
		dur: .38,
		roll: 0,
		yaw: .5
	},
	u: {
		n: "360 Flip",
		pts: 160,
		dur: .5,
		roll: 1,
		yaw: 1
	}
}, xe = {
	none: "Indy",
	l: "Melon",
	r: "Mute",
	u: "Stalefish",
	d: "Nosegrab"
}, Se = {
	rail: {
		none: "50-50",
		d: "Boardslide",
		l: "5-0",
		r: "Nosegrind",
		u: "Feeble"
	},
	ledge: {
		none: "50-50",
		d: "Lipslide",
		l: "5-0",
		r: "Crooked",
		u: "Smith"
	}
}, H = (e, t, n) => e + (t - e) * n, Ce = (e, t, n) => e < t ? t : e > n ? n : e, we = (e) => 1 - (1 - e) * (1 - e), Te = (e) => Math.round(e * 1e3 / 120), Ee = (e) => Math.round(e * 120 / 1e3), De = new Proxy({}, { get: () => () => {} });
function Oe(e, { fx: t = De, dropProduct: n = null, record: r = !1 } = {}) {
	let i = (t) => B(e, t), a = {
		tick: 0,
		t: 0,
		clock: 0,
		ending: 0,
		done: !1,
		combo: null,
		trickScore: 0,
		bestCombo: 0,
		bestNames: "",
		perfects: 0,
		tricks: 0,
		slowAt: 6,
		boostT: 0,
		magnetT: 0,
		coins: 0,
		letters: "",
		cassette: !1,
		drop: null,
		dropCaught: !1,
		taken: /* @__PURE__ */ new Set(),
		cones: /* @__PURE__ */ new Set(),
		events: [],
		inputs: [],
		x0: -380,
		distPts: 0,
		speedPts: 0,
		topKmh: 0,
		score: 0,
		lastJoint: 0,
		hintI: 0,
		result: null
	}, o = {}, s = {
		down: !1,
		pressEvt: !1,
		relEvt: !1,
		flick: null,
		dir: {
			l: 0,
			r: 0,
			u: 0,
			d: 0
		}
	}, c = (e, t) => {
		a.events.length < 3e3 && a.events.push([
			Te(a.tick),
			e,
			t ?? null
		]);
	};
	function l(e) {
		let t = i(e), n = o.speedBonus || 0;
		Object.assign(o, {
			x: e,
			y: t.y,
			vx: 560,
			vy: 0,
			state: "ride",
			ang: t.ang,
			bodyAng: t.ang,
			crouch: .2,
			popT: 9,
			airT: 0,
			landT: 9,
			flip: null,
			flipQ: null,
			grab: null,
			grind: null,
			bailT: 0,
			inv: 0,
			pressAir: !1,
			lastPress: -9,
			holdFrom: -9,
			linkT: 0,
			airTricks: 0,
			popped: !1,
			kick: null,
			stairsOver: null,
			bb: null,
			ponyY: 0,
			ponyV: 0,
			lastFlip: null,
			flipCount: 0,
			jitter: 0,
			speedBonus: n,
			landVy: 0
		});
	}
	l(-380), o.speedBonus = 0, o.vx = 420;
	function u() {
		let e = s.dir;
		return e.d ? "d" : e.l ? "l" : e.r ? "r" : e.u ? "u" : null;
	}
	function d(e, n, r) {
		a.combo || (a.combo = {
			names: [],
			pts: 0,
			mult: 0
		});
		let i = a.combo;
		i.names.push(e), i.pts += n, i.mult += 1, a.tricks++, o.speedBonus = Math.min(320, o.speedBonus + 7), r !== !1 && t.trick(e, n, o.x, o.y), i.mult >= a.slowAt && (a.slowAt = i.mult < 10 ? 10 : i.mult + 5, t.slowmo(Math.min(ye, i.mult))), t.combo(f());
	}
	let f = () => a.combo ? {
		names: a.combo.names,
		pts: a.combo.pts,
		mult: Math.min(ye, a.combo.mult)
	} : null;
	function p() {
		let e = a.combo;
		if (!e) return;
		a.combo = null;
		let n = Math.round(e.pts * Math.min(ye, e.mult));
		a.trickScore += n, n > a.bestCombo && (a.bestCombo = n, a.bestNames = e.names.slice(-8).join(" + ") + (e.names.length > 8 ? " …" : "")), c("combo", n), t.bank(n, e.mult, o.x, o.y), a.slowAt = 6, t.combo(null, { banked: n });
	}
	function m() {
		a.combo && (a.combo = null, a.slowAt = 6, t.combo(null, { lost: !0 }));
	}
	let h = () => 560 + 180 * Ce(a.t / 60, 0, 1) + o.speedBonus + (a.boostT > 0 ? 240 : 0);
	function g(n) {
		let r = H(ge, _e, we(Ce((a.clock - Math.max(o.holdFrom, o.lastPress)) / .32, 0, 1))), i = Math.min(0, o.vx * Math.tan(o.ang));
		o.grind && x(), o.vy = i - r * (n ? .85 : 1), o.state = "air", o.popT = 0, o.airT = 0, o.popped = !n, o.airTricks = 0, o.pressAir = !1, o.lastFlip = null, o.flipCount = 0, o.crouch = .9, o.stairsOver = e.stairs.find((e) => e.x0 > o.x - 10 && e.x0 < o.x + 260) || null, t.pop(o.x, o.y);
	}
	function _(e) {
		let n = be[e];
		o.flip = {
			d: e,
			f: n,
			t: 0,
			dur: n.dur
		}, t.flip();
	}
	function v(e) {
		let t = o.flip.f, n = t.n, r = t.pts;
		o.lastFlip === t.n ? (o.flipCount++, n = (o.flipCount === 2 ? "Double " : o.flipCount === 3 ? "Triple " : "Quad ") + t.n, r = Math.round(r * 1.4 * o.flipCount)) : o.flipCount = 1, o.lastFlip = t.n, e && (r = Math.round(r * .5)), o.flip = null, o.airTricks++, d(n, r);
	}
	function y() {
		let e = o.grab;
		o.grab = null, e && (o.airTricks++, d(e.name + " Grab", Math.round(60 + e.t * 220)));
	}
	function b(e) {
		o.flip && v(o.flip.t / o.flip.dur < .6), o.grab && y();
		let n = u() || "none", r = Se[e.kind][n] || Se[e.kind].none;
		o.state = "grind", o.grind = {
			g: e,
			t: 0,
			name: r,
			d: n
		}, o.y = de(e, o.x), o.vy = 0, o.crouch = .7, o.landT = 0, t.grindIn(o.x, o.y);
	}
	function x() {
		let e = o.grind;
		e && (o.grind = null, d(e.name, Math.round(70 + e.t * 160)));
	}
	function S(e) {
		o.y = e.y, o.ang = e.ang, o.state = "ride", o.vy = 0;
		let n = "ok";
		o.flip && (v(o.flip.t / o.flip.dur < .6), n = "limite"), o.flipQ = null, o.grab && (y(), n = "rattrape");
		let r = a.clock - o.lastPress;
		if (o.pressAir && r >= 0 && r <= ve && n === "ok" && (n = "perfect"), o.popped && o.airTricks === 0 && (d("Ollie", 30, !1), o.airTricks++), o.kick) {
			let e = o.kick;
			o.x > e.x1 && (d(e.name, 200), c("gap", e.name), o.speedBonus = Math.min(320, o.speedBonus + 10)), o.kick = null;
		}
		if (o.stairsOver) {
			let e = o.stairsOver;
			o.x > e.x0 + e.n * e.run && d(e.n + "|steps", 60 + e.n * 15), o.stairsOver = null;
		}
		a.combo && (n === "perfect" && (a.combo.pts += 40, a.combo.mult += 1, a.perfects++, o.speedBonus = Math.min(320, o.speedBonus + 18), t.combo(f())), t.grade(n, o.x, o.y), o.linkT = n === "perfect" ? 1.15 : .75), o.landT = 0, o.crouch = 1, o.popped = !1, o.airTricks = 0, o.pressAir = !1, o.holdFrom = a.clock, t.land(Ce((o.landVy || 800) / 1600, 0, 1), o.x, o.y, o.vx);
	}
	function C() {
		o.state === "bail" || o.inv > 0 || (o.state = "bail", o.bailT = 0, o.flip = null, o.grab = null, o.grind = null, o.speedBonus = 0, a.boostT = 0, o.bb = {
			x: o.x,
			y: o.y - 8,
			vx: o.vx * .6,
			vy: -520,
			rot: 0,
			vr: 14
		}, o.vy = -420, m(), c("bail"), t.bail(o.x, o.y));
	}
	function w() {
		let n = o.x + 240;
		for (let t = 0; t < 20; t++) {
			let t = !1;
			for (let r of e.ledges) n > r.x0 - 60 && n < r.x1 + 40 && (n = r.x1 + 90, t = !0);
			let r = i(n).s;
			if (r.kind !== "flat" && (n = r.x1 + 60, t = !0), !t) break;
		}
		let r = o.vx;
		l(n), o.vx = Math.max(420, r * .7), o.inv = 1.3, t.respawn(o.x, o.y);
	}
	function ee() {
		let r = e.gaps.find((e) => e.x0 > o.x + 900);
		if (r) a.drop = {
			x: r.x0 + o.vx * .45,
			y: r.y - 392,
			id: n
		};
		else {
			let t = e.rails.find((e) => e.x0 > o.x + 900) || {
				x1: o.x + 2e3,
				y1: i(o.x + 2e3).y - 56
			};
			a.drop = {
				x: t.x1 + 30,
				y: t.y1 - 190,
				id: n
			};
		}
		c("dropSpawn", n), t.dropSpawn(a.drop);
	}
	function T(n) {
		let r = a.magnetT > 0 ? 170 : 0, i = o.x - 60 - r, s = o.x + 60 + r, l = o.y - 160 - (o.state === "grind" ? 12 : 19) - r, u = o.y + 10 + r;
		if (o.state === "bail") return;
		for (let n of e.items) {
			if (n.x > s + 40) break;
			if (n.x < i - 40 || a.taken.has(n.i)) continue;
			let e = n.k === "coin" ? 14 : n.k === "letter" || n.k === "cassette" ? 24 : 22;
			n.x + e > i && n.x - e < s && n.y + e > l && n.y - e < u && (a.taken.add(n.i), n.k === "coin" ? (a.coins++, a.trickScore += V, a.combo && (a.combo.pts += 5)) : n.k === "letter" ? (a.letters.includes(n.ch) || (a.letters += n.ch), c("letter", n.ch)) : n.k === "cassette" ? (a.cassette = !0, c("cassette")) : n.k === "boost" ? (a.boostT = 3.2, c("boost")) : n.k === "magnet" && (a.magnetT = 7, c("magnet")), t.collect(n, a));
		}
		let d = a.drop;
		d && !a.dropCaught && Math.abs(d.x - o.x) < 70 && d.y + 34 > o.y - 170 && d.y - 34 < o.y + 10 && (a.dropCaught = !0, c("drop", d.id), t.collect({
			k: "drop",
			x: d.x,
			y: d.y,
			id: d.id
		}, a));
	}
	function te(n) {
		let r = o, c = s.pressEvt, l = s.relEvt, d = s.flick;
		s.pressEvt = s.relEvt = !1, s.flick = null, c && (r.lastPress = a.clock, r.pressAir = r.state === "air"), r.inv > 0 && (r.inv -= n), !a.combo && r.state === "ride" && (r.speedBonus = Math.max(0, r.speedBonus - 4 * n)), r.state !== "bail" && (r.vx = H(r.vx, a.ending > 0 ? 0 : h(), n * (a.ending > 0 ? 1.4 : a.boostT > 0 ? 3 : .9)));
		let f = r.vy;
		if (r.state === "ride") {
			if (r.landT += n, r.crouch = H(r.crouch, s.down ? 1 : .18, 1 - Math.exp(-n * (s.down ? 14 : 7))), l && a.ending <= 0) {
				g(!1);
				return;
			}
			let o = r.x, c = r.x + r.vx * n, u = i(o).s, d = i(c), f = d.s;
			if (f !== u) {
				if (u.kind === "kick") {
					let n = s.down;
					r.x = u.x1, r.y = u.y1, r.vy = n ? -980 : -720, r.state = "air", r.popT = n ? 0 : 9, r.airT = 0, r.airTricks = 0, r.popped = !1, r.kick = e.gaps.find((e) => Math.abs(e.x0 - u.x1) < 2) || null, r.lastFlip = null, r.flipCount = 0, n && (s.down = !1, r.pressAir = !1, t.kickPop());
					return;
				}
				if (f.kind === "stairs" || f.y0 > u.y1 + 3) {
					r.state = "air", r.vy = Math.max(0, r.vx * Math.tan(r.ang)), r.popT = 9, r.airT = 0, r.airTricks = 0, r.popped = !1, r.lastFlip = null, r.flipCount = 0, r.stairsOver = f.kind === "stairs" && e.stairs.find((e) => e.x0 === f.x0) || null, r.x = c;
					return;
				}
				if (f.y0 < u.y1 - 3) {
					C();
					return;
				}
			}
			for (let t of e.ledges) if (o < t.x0 && c >= t.x0 && r.y > t.top + 2) {
				C();
				return;
			}
			r.x = c, r.y = d.y, r.ang = d.ang, f.kind === "stairs" ? (r.jitter = Math.floor(r.x / 30) % 2 * 2, Math.floor(c / 30) !== Math.floor(o / 30) && t.clack()) : r.jitter = 0;
			let m = Math.floor(c / 200);
			m !== a.lastJoint && (a.lastJoint = m, f.kind === "flat" && m % 3 != 0 && t.clack()), a.combo && (s.down && (r.linkT = Math.max(r.linkT, .25)), r.linkT -= n, (r.linkT <= 0 && !s.down || r.linkT < -1.2) && p());
		} else if (r.state === "air") {
			r.airT += n, r.popT += n, r.vy = Math.min(r.vy + he * n, 2600);
			let t = r.x, o = r.y;
			if (r.x += r.vx * n, r.y += r.vy * n, r.crouch = H(r.crouch, .55, 1 - Math.exp(-n * 6)), d && (!r.flip && !r.grab ? _(d) : r.flip && (r.flipQ = d)), r.flip && (r.flip.t += n, r.flip.t >= r.flip.dur && (v(!1), r.flipQ && (_(r.flipQ), r.flipQ = null))), s.down && r.pressAir && !r.flip && a.clock - r.lastPress > .16 && r.airT > .1 ? (r.grab || (r.grab = {
				t: 0,
				name: xe[u() || "none"] || "Indy"
			}), r.grab.t += n) : r.grab && !s.down && y(), r.vy > -80) for (let n of e.grind) {
				if (n.x0 > r.x + 20) break;
				if (n.x1 < r.x - 2) continue;
				let e = de(n, r.x);
				if ((o <= de(n, t) + 3 && r.y >= e - 1 || n.kind === "ledge" && t < n.x0 && r.x >= n.x0 && r.y > n.y0 && r.y - n.y0 < 28) && r.x < n.x1 - 24) {
					b(n);
					return;
				}
			}
			for (let n of e.ledges) if (t < n.x0 && r.x >= n.x0 && r.y > n.top + 2) {
				if (r.y - n.top < 28) {
					r.y = n.top, b(e.grind.find((e) => e.o === n));
					return;
				}
				C();
				return;
			}
			let c = i(r.x);
			if (r.y >= c.y) {
				let e = i(t);
				r.landVy = r.vy, o <= c.y + 2 || c.s === e.s || r.y - c.y < 36 ? S(c) : C();
			}
		} else if (r.state === "grind") {
			let e = r.grind, i = e.g;
			if (e.t += n, r.crouch = H(r.crouch, .42, 1 - Math.exp(-n * 8)), r.x += r.vx * n, r.y = de(i, r.x), r.ang = Math.atan2(i.y1 - i.y0, i.x1 - i.x0), t.sparks(r.x, r.y, e.d, r.vx), l) {
				g(!0);
				return;
			}
			r.x >= i.x1 && (x(), r.state = "air", r.vy = r.vx * Math.tan(r.ang) - 40, r.popT = 9, r.airT = 0, r.airTricks = 1, r.popped = !1, r.lastFlip = null, r.flipCount = 0);
		} else if (r.state === "bail") {
			r.bailT += n, r.vy += he * n, r.x += r.vx * .5 * n, r.y += r.vy * n, r.vx *= .25 ** n;
			let e = i(r.x);
			r.y > e.y && (r.y = e.y, r.vy = -r.vy * .35, Math.abs(r.vy) < 60 && (r.vy = 0));
			let t = r.bb;
			if (t) {
				t.vy += he * n, t.x += t.vx * n, t.y += t.vy * n, t.rot += t.vr * n;
				let e = i(t.x);
				t.y > e.y - 6 && (t.y = e.y - 6, t.vy = -t.vy * .4, t.vr *= .6, t.vx *= .7);
			}
			r.bailT > 1.05 && w();
		}
		let m = (r.vy - f) / n;
		r.ponyV += (-r.ponyY * 90 - r.ponyV * 9 - m * .02) * n, r.ponyY = Ce(r.ponyY + r.ponyV * n, -16, 16);
		for (let n of e.cones) a.cones.has(n) || Math.abs(r.x - n.x) > 16 || r.y <= n.y - 30 || r.state === "bail" || (a.cones.add(n), t.cone(n, r.vx));
		T(n);
		let ee = r.state === "air" ? Ce(Math.atan2(r.vy, r.vx) * .25, -.25, .35) : r.ang;
		r.bodyAng = H(r.bodyAng, ee, 1 - Math.exp(-n * (r.state === "air" ? 5 : 14)));
	}
	function ne(e) {
		r && a.inputs.length < 6e3 && a.inputs.push([
			Te(a.tick),
			e.k,
			+!!e.down
		]), e.k === "a" ? e.down && !s.down ? (s.down = !0, s.pressEvt = !0) : !e.down && s.down && (s.down = !1, s.relEvt = !0) : s.dir[e.k] != null && (e.down ? (s.dir[e.k] = 1, s.flick = e.k) : s.dir[e.k] = 0);
	}
	function re() {
		a.done = !0, a.score = Math.round(a.trickScore + a.speedPts + a.distPts);
		let n = Math.round(Math.max(0, o.x - a.x0));
		a.result = {
			score: a.score,
			trickScore: a.trickScore,
			speedPts: Math.round(a.speedPts),
			distPts: Math.round(a.distPts),
			meters: Math.round(n / 80),
			topKmh: Math.round(a.topKmh),
			bestCombo: a.bestCombo,
			bestNames: a.bestNames,
			tricks: a.tricks,
			perfects: a.perfects,
			coins: a.coins,
			letters: a.letters,
			cassette: a.cassette,
			dropCaught: a.dropCaught,
			dropId: a.drop ? a.drop.id : null,
			proof: {
				seed: e.seed >>> 0,
				duration_ms: Te(a.tick),
				score: a.score,
				distance: n,
				coins: a.coins,
				letters: a.letters.length,
				cassette: a.cassette,
				drop_caught: a.dropCaught,
				max_speed: Math.round(a.topKmh),
				events: a.events.slice(),
				inputs: a.inputs.slice()
			}
		}, t.done(a.result);
	}
	function E(e) {
		if (a.done) {
			o.state !== "bail" && (o.vx = H(o.vx, 0, pe * 1.4)), o.x += o.vx * pe;
			let e = i(o.x);
			o.state === "ride" && (o.y = e.y);
			return;
		}
		if (e) for (let t of e) ne(t);
		a.tick++, a.clock = a.tick * pe;
		let r = pe;
		if (a.boostT > 0 && (a.boostT -= r), a.magnetT > 0 && (a.magnetT -= r), a.ending <= 0) a.t = a.clock, a.t >= 60 && (a.t = 60, a.ending = r, s.down && (s.down = !1, s.relEvt = !1), t.timeUp());
		else if (a.ending += r, o.state === "ride" && a.ending > .25 || a.ending > 2.6) {
			o.state === "grind" && x(), p(), re();
			return;
		}
		!a.drop && n && a.t >= 47 && ee(), te(r);
		let c = o.vx * me;
		a.ending <= 0 && (a.topKmh = Math.max(a.topKmh, c), a.speedPts += Math.max(0, c - 28) * 10 * r, a.distPts = Math.max(0, (o.x - a.x0) / 80) * 3), a.score = Math.round(a.trickScore + a.speedPts + a.distPts);
	}
	return {
		S: a,
		P: o,
		IN: s,
		step: E,
		apply: ne,
		heldDir: u,
		comboView: f,
		get kmh() {
			return o.vx * me;
		}
	};
}
function ke(e, t, n = {}) {
	let r = Oe(e, n), i = 0, a = /* @__PURE__ */ new Map();
	for (let [e, n, r] of t) {
		let t = Ee(e);
		a.has(t) || a.set(t, []), a.get(t).push({
			k: n,
			down: !!r
		});
	}
	for (; !r.S.done && i < 7920;) r.step(a.get(r.S.tick) || null), i++;
	return r;
}
//#endregion
//#region src/core/storage.js
var Ae = "respawn:";
function je(e, t) {
	try {
		let n = window.localStorage.getItem(Ae + e);
		return n == null ? t : JSON.parse(n);
	} catch {
		return t;
	}
}
function Me(e, t) {
	try {
		return window.localStorage.setItem(Ae + e, JSON.stringify(t)), !0;
	} catch {
		return !1;
	}
}
//#endregion
//#region 2d/src/i18n.js
var U = {
	exit: "Sortir · Mode boutique",
	exitShort: "Sortir",
	exitCart: "Retour au panier",
	exitProduct: "Retour à la fiche",
	soundOn: "Son",
	soundOff: "Muet",
	lang: "EN",
	kicker: "Garde-robe · vrais produits",
	title1: "Compose",
	title2: "ton",
	title3: "rider",
	women: "Femme",
	men: "Homme",
	skinLight: "Peau claire",
	skinDark: "Peau foncée",
	slot_head: "Tête",
	slot_top: "Haut",
	slot_bottom: "Bas",
	slot_feet: "Pieds",
	slot_deck: "Plateau",
	slot_wheels: "Roues",
	slot_protect: "Protections",
	slot_mount: "Montage",
	slot_looks: "Looks complets",
	none: "Rien",
	sizes: "Mes tailles",
	sizesHint: "Servent à tout ajout au panier depuis le jeu.",
	size_top: "Haut",
	size_bottom: "Bas",
	size_shoe: "Pointure",
	size_protect: "Protections",
	size_deck: "Plateau",
	sizeOk: "Taille {s}",
	sizeSwap: "{w} épuisée → {s}",
	sizeOut: "Épuisé",
	sizeUnique: "Taille unique",
	outfit: "Ton outfit",
	articles: "{n} article",
	articlesP: "{n} articles",
	buy: "Acheter cet outfit",
	buyShort: "Acheter",
	ride: "Ride",
	added: "✓ Dans le panier",
	addedToast: "{n} article(s) ajouté(s) au panier",
	addedMock: "(démo : rien n’est envoyé hors de la boutique)",
	addFail: "Ajout impossible pour : {list}",
	locked: "Exclusif",
	lockedHint: "À attraper en run pour le débloquer",
	lockedSkip: "Exclusifs non débloqués laissés de côté : {list}",
	keysHint: "Espace : maintenir puis relâcher = ollie · ← → ↑ ↓ flips · atterris sur un rail = grind",
	score: "Score",
	speed: "km/h",
	loot: "Butin",
	pause: "Pause",
	resume: "Reprendre",
	restart: "Recommencer",
	wardrobe: "Garde-robe",
	music: "Musique",
	musicOn: "Musique : oui",
	musicOff: "Musique : non",
	controls: "Maintiens Espace (ou le doigt) puis relâche : ollie. En l’air : flèches ou glisser = flips, garder appuyé = grab. Appuie juste avant de toucher le sol : PERFECT.",
	rotateTitle: "Tourne ton téléphone",
	rotateText: "Le run est bien plus lisible à l’horizontale.",
	rotatePlay: "Jouer quand même",
	endKicker: "Fin du run",
	points: "points",
	record: "Record perso",
	bdTricks: "Figures",
	bdSpeed: "Vitesse",
	bdDist: "Distance",
	topSpeed: "Vitesse max",
	bestCombo: "Meilleur combo",
	perfects: "Perfect",
	bestChain: "Meilleur enchaînement",
	again: "Rejouer",
	share: "Partager",
	challenge: "Défier un ami",
	lootTitle: "Ton butin",
	lootN: "{n} article",
	lootNP: "{n} articles",
	lootEmpty: "Rien attrapé cette fois : vise les objets en hauteur et sur les rails.",
	tryOn: "Essayer",
	addCart: "Ajouter au panier",
	addAll: "Tout ajouter",
	codeTitle: "Code promo gagné",
	codeDemo: "Mode démo : code fictif, aucune remise réelle.",
	codeCopy: "Copier",
	codeCopied: "Code copié",
	codeWait: "Vérification du run…",
	codeFail: "Récompense non validée",
	excl: "Exclusif débloqué",
	exclText: "{name} : achat débloqué",
	tier_bronze: "Jeton bronze",
	tier_silver: "Jeton argent",
	tier_gold: "Jeton or",
	vestKicker: "Vestiaire",
	vestTitle: "Ton skater porte ton panier",
	vestWorn: "Sur ton skater",
	vestBag: "Sac à dos",
	vestBagEmpty: "Sac à dos vide : tout est porté.",
	vestEmpty: "Ton panier est vide.",
	vestRide: "Rider avec cette tenue",
	tryKicker: "Essayage",
	tryText: "Le produit est sur ton skater. Change le reste, puis ride.",
	shareTitle: "Mon run Respawn",
	shareText: "{score} points sur Respawn Street Run. Tu me bats ?",
	copied: "Lien copié",
	pngSaved: "Image enregistrée",
	challengeFrom: "{name} te défie : {score} points à battre",
	challengeBeat: "Défi battu !",
	challengeLost: "Défi : encore {d} points",
	hint_ollie: "<em>Maintiens</em> puis <em>relâche</em> : OLLIE (plus haut si tu tiens)",
	hint_ollieT: "<em>Maintiens le doigt</em> puis <em>relâche</em> : OLLIE",
	hint_grind: "Atterris sur le muret ou le rail : <em>GRIND</em> · ramasse les pièces et les lettres S-K-A-T-E",
	hint_flip: "En l’air : <em>← → ↑ ↓</em> = FLIPS · garde appuyé = GRAB",
	hint_flipT: "En l’air : <em>glisse le doigt</em> = FLIPS · garde-le appuyé = GRAB",
	hint_perfect: "Appuie <em>juste avant</em> le sol : <em>PERFECT</em> = plus de vitesse",
	hint_kick: "Garde appuyé sur le tremplin : <em>décollage géant</em> (le DROP est tout en haut !)",
	perfect: "PERFECT !",
	good: "BIEN",
	sketchy: "LIMITE",
	caught: "RATTRAPÉ",
	ouch: "AÏE !",
	respawn: "RESPAWN",
	respawnSub: "on ne lâche rien",
	timeUp: "TEMPS !",
	go: "GO !",
	goSub: "60 secondes",
	combo: "COMBO",
	steps: "{n} marches",
	boost: "BOOST !",
	magnet: "AIMANT !",
	paused: "PAUSE",
	demoMode: "mode démo",
	dropSub: "une caisse t’attend en hauteur",
	dropCaught: "DROP ATTRAPÉ !",
	skateDone: "S-K-A-T-E complet !",
	cassette: "CASSETTE !",
	ghost: "fantôme",
	modeDaily: "Défi du jour",
	modeFree: "Libre",
	leaderboard: "Classement",
	lbDay: "Jour",
	lbWeek: "Semaine",
	lbAll: "Tout",
	lbMe: "Ta place",
	lbGap: "à {d} points du n° {r}",
	lbFirst: "Tu es n° 1 !",
	lbEmpty: "Pas encore de score sur cette période.",
	lbOffline: "Classement indisponible hors ligne.",
	draw: "Tirage de la semaine",
	drawEnds: "tirage le {d}",
	tickets: "{n} ticket",
	ticketsP: "{n} tickets",
	ticketGain: "+{n} ticket",
	streak: "{n} jour d’affilée",
	streakP: "{n} jours d’affilée",
	lastWinner: "Dernier gagnant : {p} ({lot})",
	offline: "Mode hors ligne : pas de classement ni de codes cette fois. Ton run compte quand même pour ton record.",
	refused: "Run non validé par le serveur ({r}) : pas de récompense.",
	rewardsTitle: "Tes gains",
	noReward: "Pas de gain ce run : complète S-K-A-T-E, attrape le DROP ou vise un gros score.",
	rw_skate: "S-K-A-T-E complet",
	rw_score: "Gros score",
	rw_drop: "Drop",
	claimBtn: "Récupérer mon code",
	email: "Ton e-mail",
	newsletter: "Je m’inscris à la newsletter Respawn",
	rules: "J’accepte le {link}",
	rulesLink: "règlement du jeu",
	claimGo: "Recevoir le code",
	claimErr_already_claimed: "Ce gain a déjà été récupéré avec cet e-mail.",
	claimErr_invalid_reward: "Ce gain n’est pas valable.",
	claimErr_rate_limited: "Trop d’essais, réessaie dans un moment.",
	claimErr_consent_required: "Coche l’acceptation du règlement.",
	claimErr_invalid_email: "E-mail invalide.",
	claimErr_out_of_codes: "Plus de code disponible pour ce gain, désolé.",
	claimErr: "Impossible de récupérer le code ({r}).",
	emailBad: "E-mail invalide.",
	rulesNeeded: "Coche l’acceptation du règlement.",
	codeValid: "valable jusqu’au {d}",
	applyCart: "Appliquer au panier",
	seeProduct: "Voir le produit",
	nlOk: "Confirme ton inscription dans l’e-mail qu’on vient de t’envoyer.",
	drawEligible: "Laisse ton e-mail en récupérant un gain pour participer au tirage.",
	pseudoTitle: "Ton pseudo",
	pseudoText: "Pour apparaître au classement (3 à 12 caractères).",
	pseudoOk: "Valider",
	pseudoErr: "Pseudo refusé ({r}).",
	beat: "Bats {name} : {score}",
	challengeFriend: "Défie un pote",
	ghostVs: "Fantôme",
	rankLine: "Classement : n° {d} du jour · n° {w} de la semaine"
}, Ne = {
	exit: "Exit · Shop mode",
	exitShort: "Exit",
	exitCart: "Back to cart",
	exitProduct: "Back to product",
	soundOn: "Sound",
	soundOff: "Muted",
	lang: "FR",
	kicker: "Wardrobe · real products",
	title1: "Build",
	title2: "your",
	title3: "rider",
	women: "Woman",
	men: "Man",
	skinLight: "Light skin",
	skinDark: "Dark skin",
	slot_head: "Head",
	slot_top: "Top",
	slot_bottom: "Bottom",
	slot_feet: "Shoes",
	slot_deck: "Deck",
	slot_wheels: "Wheels",
	slot_protect: "Protection",
	slot_mount: "Setup",
	slot_looks: "Full looks",
	none: "None",
	sizes: "My sizes",
	sizesHint: "Used for everything added to cart from the game.",
	size_top: "Top",
	size_bottom: "Bottom",
	size_shoe: "Shoe",
	size_protect: "Pads",
	size_deck: "Deck",
	sizeOk: "Size {s}",
	sizeSwap: "{w} sold out → {s}",
	sizeOut: "Sold out",
	sizeUnique: "One size",
	outfit: "Your outfit",
	articles: "{n} item",
	articlesP: "{n} items",
	buy: "Buy this outfit",
	buyShort: "Buy",
	ride: "Ride",
	added: "✓ In your cart",
	addedToast: "{n} item(s) added to cart",
	addedMock: "(demo: nothing is sent outside the shop)",
	addFail: "Could not add: {list}",
	locked: "Exclusive",
	lockedHint: "Catch it during a run to unlock it",
	lockedSkip: "Locked exclusives left out: {list}",
	keysHint: "Space: hold then release = ollie · ← → ↑ ↓ flips · land on a rail = grind",
	score: "Score",
	speed: "km/h",
	loot: "Loot",
	pause: "Pause",
	resume: "Resume",
	restart: "Restart",
	wardrobe: "Wardrobe",
	music: "Music",
	musicOn: "Music: on",
	musicOff: "Music: off",
	controls: "Hold Space (or your finger) then release: ollie. In the air: arrows or swipe = flips, keep holding = grab. Press just before landing: PERFECT.",
	rotateTitle: "Turn your phone",
	rotateText: "The run reads much better in landscape.",
	rotatePlay: "Play anyway",
	endKicker: "Run over",
	points: "points",
	record: "Personal best",
	bdTricks: "Tricks",
	bdSpeed: "Speed",
	bdDist: "Distance",
	topSpeed: "Top speed",
	bestCombo: "Best combo",
	perfects: "Perfect",
	bestChain: "Best line",
	again: "Play again",
	share: "Share",
	challenge: "Challenge a friend",
	lootTitle: "Your loot",
	lootN: "{n} item",
	lootNP: "{n} items",
	lootEmpty: "Nothing caught this time: aim for items up high and over rails.",
	tryOn: "Try on",
	addCart: "Add to cart",
	addAll: "Add all",
	codeTitle: "Promo code won",
	codeDemo: "Demo mode: fake code, no real discount.",
	codeCopy: "Copy",
	codeCopied: "Code copied",
	codeWait: "Checking your run…",
	codeFail: "Reward not validated",
	excl: "Exclusive unlocked",
	exclText: "{name}: now available",
	tier_bronze: "Bronze token",
	tier_silver: "Silver token",
	tier_gold: "Gold token",
	vestKicker: "Locker room",
	vestTitle: "Your skater wears your cart",
	vestWorn: "On your skater",
	vestBag: "Backpack",
	vestBagEmpty: "Empty backpack: everything is worn.",
	vestEmpty: "Your cart is empty.",
	vestRide: "Ride in this outfit",
	tryKicker: "Try-on",
	tryText: "The product is on your skater. Change the rest, then ride.",
	shareTitle: "My Respawn run",
	shareText: "{score} points on Respawn Street Run. Can you beat me?",
	copied: "Link copied",
	pngSaved: "Image saved",
	challengeFrom: "{name} challenges you: beat {score} points",
	challengeBeat: "Challenge beaten!",
	challengeLost: "Challenge: {d} points to go",
	hint_ollie: "<em>Hold</em> then <em>release</em>: OLLIE (higher if you hold)",
	hint_ollieT: "<em>Hold your finger</em> then <em>release</em>: OLLIE",
	hint_grind: "Land on the ledge or rail: <em>GRIND</em> · grab coins and S-K-A-T-E letters",
	hint_flip: "In the air: <em>← → ↑ ↓</em> = FLIPS · keep holding = GRAB",
	hint_flipT: "In the air: <em>swipe</em> = FLIPS · keep holding = GRAB",
	hint_perfect: "Press <em>just before</em> landing: <em>PERFECT</em> = more speed",
	hint_kick: "Hold on the kicker: <em>giant launch</em> (the DROP is way up!)",
	perfect: "PERFECT!",
	good: "NICE",
	sketchy: "SKETCHY",
	caught: "SLOPPY",
	ouch: "OUCH!",
	respawn: "RESPAWN",
	respawnSub: "never give up",
	timeUp: "TIME!",
	go: "GO!",
	goSub: "60 seconds",
	combo: "COMBO",
	steps: "{n} stairs",
	boost: "BOOST!",
	magnet: "MAGNET!",
	paused: "PAUSED",
	demoMode: "demo mode",
	dropSub: "a crate is waiting up high",
	dropCaught: "DROP CAUGHT!",
	skateDone: "S-K-A-T-E complete!",
	cassette: "CASSETTE!",
	ghost: "ghost",
	modeDaily: "Daily challenge",
	modeFree: "Free",
	leaderboard: "Leaderboard",
	lbDay: "Day",
	lbWeek: "Week",
	lbAll: "All time",
	lbMe: "Your rank",
	lbGap: "{d} points behind #{r}",
	lbFirst: "You are #1!",
	lbEmpty: "No score yet for this period.",
	lbOffline: "Leaderboard unavailable offline.",
	draw: "Weekly draw",
	drawEnds: "draw on {d}",
	tickets: "{n} ticket",
	ticketsP: "{n} tickets",
	ticketGain: "+{n} ticket",
	streak: "{n} day streak",
	streakP: "{n} day streak",
	lastWinner: "Last winner: {p} ({lot})",
	offline: "Offline mode: no leaderboard or codes this time. Your run still counts for your best.",
	refused: "Run not validated by the server ({r}): no reward.",
	rewardsTitle: "Your rewards",
	noReward: "No reward this run: complete S-K-A-T-E, catch the DROP or go for a big score.",
	rw_skate: "S-K-A-T-E complete",
	rw_score: "Big score",
	rw_drop: "Drop",
	claimBtn: "Get my code",
	email: "Your e-mail",
	newsletter: "Sign me up to the Respawn newsletter",
	rules: "I accept the {link}",
	rulesLink: "game rules",
	claimGo: "Get the code",
	claimErr_already_claimed: "This reward was already claimed with this e-mail.",
	claimErr_invalid_reward: "This reward is not valid.",
	claimErr_rate_limited: "Too many tries, try again later.",
	claimErr_consent_required: "Please accept the rules.",
	claimErr_invalid_email: "Invalid e-mail.",
	claimErr_out_of_codes: "No code left for this reward, sorry.",
	claimErr: "Could not get the code ({r}).",
	emailBad: "Invalid e-mail.",
	rulesNeeded: "Please accept the rules.",
	codeValid: "valid until {d}",
	applyCart: "Apply to cart",
	seeProduct: "See the product",
	nlOk: "Confirm your sign-up in the e-mail we just sent you.",
	drawEligible: "Leave your e-mail when claiming a reward to enter the draw.",
	pseudoTitle: "Your nickname",
	pseudoText: "To appear on the leaderboard (3 to 12 characters).",
	pseudoOk: "Save",
	pseudoErr: "Nickname refused ({r}).",
	beat: "Beat {name}: {score}",
	challengeFriend: "Challenge a friend",
	ghostVs: "Ghost",
	rankLine: "Rank: #{d} today · #{w} this week"
}, W = (() => {
	let e = je("lang", null);
	return e === "fr" || e === "en" ? e : /^fr/i.test(navigator.language || "fr") ? "fr" : "en";
})(), Pe = /* @__PURE__ */ new Set(), Fe = () => W;
function Ie(e) {
	W = e === "en" ? "en" : "fr", Me("lang", W), Pe.forEach((e) => e(W));
}
var Le = (e) => (Pe.add(e), () => Pe.delete(e));
function G(e, t) {
	let n = (W === "en" ? Ne : U)[e] ?? U[e] ?? e;
	if (t) for (let [e, r] of Object.entries(t)) n = n.replaceAll("{" + e + "}", r);
	return n;
}
var K = (e) => Math.round(e).toLocaleString(W === "en" ? "en-US" : "fr-FR").replace(/ | /g, " "), q = (e) => (Math.round(e * 100) / 100).toLocaleString(W === "en" ? "en-IE" : "fr-FR", {
	style: "currency",
	currency: "EUR",
	minimumFractionDigits: e % 1 ? 2 : 0
}), Re = (e, t, n) => e + (t - e) * n, ze = (e, t, n) => (n = o((n - e) / (t - e), 0, 1), n * n * (3 - 2 * n)), Be = (e) => 1 - (1 - e) * (1 - e), Ve = 2150, He = (e) => String(e).replace(/(\d+)\|steps/g, (e, t) => G("steps", { n: t }));
function Ue(s, { audio: c, hooks: l = {}, autopilot: f = !1 } = {}) {
	let p = s.getContext("2d", { alpha: !1 }), m = c.SFX, h = 0, g = 0, _ = 1, v = 1, b = 1, x = {}, S = le(1), C = Oe(S), w = C.P, T = C.IN, E = null, D = null, k = null, A = null, j = (e) => B(S, e), M = (e) => ue(S, e), N = {
		mode: "scene",
		t: 0,
		ts: 1,
		slowT: 0,
		zoom: 1,
		shake: 0,
		shx: 0,
		shy: 0,
		cam: {
			x: 0,
			y: 0,
			s: 1
		},
		wipe: -1,
		wipeTo: null,
		big: null,
		hop: 0,
		paused: !1,
		boostT: 0,
		magnetT: 0,
		acc: 0,
		scene: { rect: null },
		hintI: 0
	}, P = {
		hip: {
			x: 0,
			y: 0
		},
		fb: {
			x: 0,
			y: 0
		},
		ff: {
			x: 0,
			y: 0
		},
		hb: {
			x: 0,
			y: 0
		},
		hf: {
			x: 0,
			y: 0
		},
		eb: "down",
		ef: "down",
		lean: 0,
		tilt: 0,
		board: {
			x: 0,
			y: 0,
			pitch: 0,
			roll: 0,
			yaw: 0,
			show: 1
		},
		pony: {
			x: 0,
			y: 0
		},
		blink: 0
	}, F = [], I = [], L = /* @__PURE__ */ new Map(), ae = null, ce = null, R = 0, z = 0, fe = 0, he = !1, ge = !1, _e = /* @__PURE__ */ new Map(), ve = /* @__PURE__ */ new Map(), ye = 1, V = [], be = [];
	function xe(e, t, n, r) {
		let i = 2 ** (Math.ceil(Math.log2(Math.max(.25, ye)) * 2) / 2), a = e + "@" + i, o = ve.get(a);
		if (!o) {
			ve.size > 80 && ve.clear(), o = document.createElement("canvas"), o.width = Math.ceil(t * i), o.height = Math.ceil(n * i);
			let e = o.getContext("2d");
			e.scale(i, i), e.translate(t / 2, n / 2), r(e), ve.set(a, o);
		}
		return o;
	}
	function Se() {
		let e = s.getBoundingClientRect();
		h = Math.max(1, e.width), g = Math.max(1, e.height), _ = Math.min(window.devicePixelRatio || 1, 2), h * g * _ * _ > 52e5 && (_ = Math.max(1, Math.sqrt(52e5 / (h * g)))), v = Math.min(_, 1.5), s.width = Math.round(h * _), s.height = Math.round(g * _), b = Math.min(g / 620, h / (g > h ? 560 : 980)), we();
	}
	function H(e, t, n) {
		n = n || v;
		let r = document.createElement("canvas");
		r.width = Math.max(1, Math.ceil(e * n)), r.height = Math.max(1, Math.ceil(t * n));
		let i = r.getContext("2d");
		return i.setTransform(n, 0, 0, n, 0, 0), [r, i];
	}
	function Ce(e, t, n, r, i) {
		e.beginPath(), e.moveTo(t - r / 2 + i, n - i / 2), e.lineTo(t + r / 2 - i, n - i / 2), e.arc(t + r / 2 - i, n, i / 2, -Math.PI / 2, Math.PI / 2), e.lineTo(t - r / 2 + i, n + i / 2), e.arc(t - r / 2 + i, n, i / 2, Math.PI / 2, Math.PI * 1.5), e.fill();
	}
	function we() {
		let e = se(11), t, n, r;
		[t, n] = H(h, g, 1), r = n.createLinearGradient(0, 0, 0, g), r.addColorStop(0, "#1F1438"), r.addColorStop(.28, "#4A1E5C"), r.addColorStop(.5, "#9C3460"), r.addColorStop(.66, "#E25A4E"), r.addColorStop(.8, "#FF9A52"), r.addColorStop(1, "#FFC874"), n.fillStyle = r, n.fillRect(0, 0, h, g), x.skyD = t, [t, n] = H(h, g, 1), r = n.createLinearGradient(0, 0, 0, g), r.addColorStop(0, "#05061A"), r.addColorStop(.4, "#140F33"), r.addColorStop(.7, "#2D1846"), r.addColorStop(1, "#5B2448"), n.fillStyle = r, n.fillRect(0, 0, h, g);
		for (let t = 0; t < 160; t++) {
			let t = e() * h, r = e() * g * .55;
			n.fillStyle = "rgba(243,240,232," + (.25 + e() * .6).toFixed(2) + ")";
			let i = e() < .08 ? 2 : 1.2;
			n.fillRect(t, r, i, i);
		}
		x.skyN = t;
		let i = Math.round(110 * b);
		[t, n] = H(i * 5, i * 5);
		let o = i * 2.5;
		r = n.createRadialGradient(o, o, i * .6, o, o, i * 2.5), r.addColorStop(0, "rgba(255,190,120,.55)"), r.addColorStop(1, "rgba(255,140,80,0)"), n.fillStyle = r, n.fillRect(0, 0, i * 5, i * 5), r = n.createLinearGradient(0, o - i, 0, o + i), r.addColorStop(0, "#FFF4C2"), r.addColorStop(.6, "#FFC067"), r.addColorStop(1, "#FF7A45"), n.fillStyle = r, n.beginPath(), n.arc(o, o, i, 0, a), n.fill(), n.globalCompositeOperation = "destination-out";
		for (let e = 0; e < 6; e++) n.fillRect(0, o + i * (.12 + e * .15), i * 5, i * (.025 + e * .016));
		n.globalCompositeOperation = "source-over", x.sun = t, x.sunR = i;
		let s = Math.ceil(Math.max(h, 1100) * 1.3);
		x.TW = s, [t, n] = H(s, g * .6);
		for (let t = 0; t < 9; t++) {
			let t = e() * s, i = g * (.08 + e() * .38), a = (160 + e() * 320) * b, o = (10 + e() * 14) * b;
			for (let e of [
				0,
				-s,
				s
			]) r = n.createLinearGradient(0, i - o, 0, i + o), r.addColorStop(0, "rgba(255,170,140,.55)"), r.addColorStop(1, "rgba(150,60,110,.35)"), n.fillStyle = r, Ce(n, t + e, i, a, o), Ce(n, t + e + a * .25, i - o * .7, a * .5, o * .8);
		}
		x.clouds = t, x.far = Te(s, e, {
			minH: 110,
			maxH: 300,
			minW: 44,
			maxW: 120,
			col1: "#9A4776",
			col2: "#C8607A",
			win: "rgba(255,214,150,.45)",
			winP: .05,
			base: 420,
			detail: 0
		}), x.mid = Te(s, e, {
			minH: 150,
			maxH: 360,
			minW: 70,
			maxW: 170,
			col1: "#40204F",
			col2: "#56285E",
			base: 470,
			detail: 1,
			glow: !0
		}), x.near = je(s, e), [t, n] = H(h / 4, g / 4, 1), r = n.createRadialGradient(h / 8, g / 8, Math.min(h, g) / 12, h / 8, g / 8, Math.max(h, g) / 5.2), r.addColorStop(0, "rgba(0,0,0,0)"), r.addColorStop(1, "rgba(6,4,14,.55)"), n.fillStyle = r, n.fillRect(0, 0, h / 4, g / 4), x.vig = t, _e.clear();
	}
	function Te(e, i, a) {
		let o = b, s = a.base * o, c = s - 60 * o, [l, u] = H(e, s), [d, f] = a.glow ? H(e, s) : [null, null], p = -20 * o, m = [];
		for (; p < e;) {
			let e = (a.minW + i() * (a.maxW - a.minW)) * o, t = (a.minH + i() * (a.maxH - a.minH)) * o;
			m.push({
				x: p,
				w: e,
				h: t
			}), p += e * (.86 + i() * .2);
		}
		let h = u.createLinearGradient(0, c - a.maxH * o, 0, c);
		h.addColorStop(0, a.col1), h.addColorStop(1, a.col2);
		for (let t of m) for (let n of [0, -e]) {
			let e = t.x + n, r = c - t.h;
			if (u.fillStyle = h, u.fillRect(e, r, t.w, t.h + 70 * o), a.detail) {
				if (u.fillStyle = a.col1, i() < .45) {
					let n = 14 * o, a = e + t.w * (.2 + i() * .5);
					u.fillRect(a, r - 26 * o, n, 20 * o), u.fillRect(a - 2 * o, r - 30 * o, n + 4 * o, 5 * o), u.fillRect(a + 2 * o, r - 6 * o, 2 * o, 6 * o), u.fillRect(a + n - 4 * o, r - 6 * o, 2 * o, 6 * o);
				}
				i() < .5 && u.fillRect(e + t.w * .7, r - 10 * o, 18 * o, 10 * o), i() < .3 && u.fillRect(e + t.w * .4, r - 48 * o, 2 * o, 48 * o), u.fillStyle = "rgba(255,255,255,.035)", u.fillRect(e, r, 4 * o, t.h);
			}
			if (a.win) {
				u.fillStyle = a.win;
				for (let n = r + 10 * o; n < c - 8 * o; n += 13 * o) for (let r = e + 6 * o; r < e + t.w - 8 * o; r += 11 * o) i() < a.winP && u.fillRect(r, n, 4 * o, 6 * o);
			}
			if (f) for (let n = r + 16 * o; n < c - 12 * o; n += 19 * o) for (let r = e + 9 * o; r < e + t.w - 12 * o; r += 15 * o) i() < .07 && (f.fillStyle = i() < .8 ? "rgba(255,196,110,.85)" : "rgba(140,240,255,.7)", f.fillRect(r, n, 6 * o, 9 * o));
		}
		let g = 0;
		if (f) {
			let e = m[Math.floor(m.length * .35)] || m[0];
			g = e.x + e.w * .5, De(u, f, g, c - e.h - 20 * o, o, "RESPAWN", t, 34);
			let i = m[Math.floor(m.length * .78)] || m[1];
			Ae(u, f, i.x + i.w - 14 * o, c - i.h + 40 * o, o, "SKATE", n);
			let a = m[Math.floor(m.length * .12)] || m[0];
			De(u, f, a.x + a.w * .5, c - a.h - 16 * o, o, "24/7", r, 20);
		}
		return {
			c: l,
			gc: d,
			h: s,
			base: c,
			signX: g
		};
	}
	function De(e, t, n, r, i, a, o, s) {
		let c = s * i;
		t.font = c + "px \"Anton\",Impact,\"Haettenschweiler\",\"Futura Condensed ExtraBold\",\"Arial Narrow\",sans-serif";
		let l = t.measureText(a).width;
		e.fillStyle = "#2A1733", e.fillRect(n - l / 2 - 8 * i, r - c * .95, l + 16 * i, c * 1.1), e.fillRect(n - l / 2, r, 3 * i, 20 * i), e.fillRect(n + l / 2 - 3 * i, r, 3 * i, 20 * i), t.save(), t.textAlign = "center", t.shadowColor = o, t.shadowBlur = 18 * i, t.fillStyle = o, t.fillText(a, n, r - c * .12), t.shadowBlur = 6 * i, t.fillText(a, n, r - c * .12), t.shadowBlur = 0, t.fillStyle = "rgba(255,255,255,.55)", t.globalAlpha = .5, t.fillText(a, n, r - c * .12), t.restore();
	}
	function Ae(e, t, n, r, i, a, o) {
		let s = 18 * i;
		e.fillStyle = "#2A1733", e.fillRect(n - 12 * i, r - 4 * i, 24 * i, a.length * s * .95 + 8 * i), t.save(), t.font = s + "px \"Anton\",Impact,\"Haettenschweiler\",\"Futura Condensed ExtraBold\",\"Arial Narrow\",sans-serif", t.textAlign = "center", t.shadowColor = o, t.shadowBlur = 14 * i, t.fillStyle = o;
		for (let e = 0; e < a.length; e++) t.fillText(a[e], n, r + s * .85 + e * s * .95);
		t.restore();
	}
	function je(e, t) {
		let n = b, r = 340 * n, i = r - 50 * n, [o, s] = H(e, r), [c, l] = H(e, r), u = "#22142C";
		s.fillStyle = u, s.fillRect(0, i, e, 60 * n);
		let d = [], f = 0;
		for (; f < e - 60 * n;) d.push({
			x: f,
			t: t()
		}), f += (90 + t() * 170) * n;
		for (let t of d) for (let r of [
			0,
			-e,
			e
		]) {
			let o = t.x + r;
			if (!(o < -300 * n || o > e + 300 * n)) {
				if (t.t < .42) {
					let e = (120 + t.t * 260) * n;
					s.fillStyle = u, s.fillRect(o - 4 * n, i - e * .55, 8 * n, e * .55);
					for (let t = 0; t < 5; t++) {
						let r = t / 5 * a, c = (26 + t * 37 % 17) * n;
						s.beginPath(), s.arc(o + Math.cos(r) * 22 * n, i - e * .62 + Math.sin(r) * 16 * n - 10 * n, c, 0, a), s.fill();
					}
					s.beginPath(), s.arc(o, i - e * .78, 32 * n, 0, a), s.fill();
				} else if (t.t < .7) {
					let e = 230 * n;
					s.fillStyle = u, s.fillRect(o - 2.5 * n, i - e, 5 * n, e), s.fillRect(o - 2.5 * n, i - e, 30 * n, 4 * n), s.fillRect(o + 20 * n, i - e - 2 * n, 16 * n, 8 * n);
					let t = l.createRadialGradient(o + 28 * n, i - e + 6 * n, 0, o + 28 * n, i - e + 6 * n, 70 * n);
					t.addColorStop(0, "rgba(255,214,140,.9)"), t.addColorStop(.12, "rgba(255,190,110,.45)"), t.addColorStop(1, "rgba(255,170,90,0)"), l.fillStyle = t, l.fillRect(o - 50 * n, i - e - 70 * n, 160 * n, 140 * n), l.fillStyle = "rgba(255,200,120,.08)", l.beginPath(), l.moveTo(o + 22 * n, i - e + 6 * n), l.lineTo(o + 34 * n, i - e + 6 * n), l.lineTo(o + 90 * n, i), l.lineTo(o - 34 * n, i), l.fill();
				} else if (t.t < .85) {
					let e = 110 * n, t = 70 * n;
					s.fillStyle = u, s.beginPath(), s.moveTo(o, i), s.quadraticCurveTo(o + e * .9, i, o + e, i - t), s.lineTo(o + e + 8 * n, i - t), s.lineTo(o + e + 8 * n, i), s.fill(), s.fillRect(o + e, i - t - 14 * n, 2 * n, 14 * n), s.fillRect(o + e - 2 * n, i - t - 14 * n, 14 * n, 2 * n);
				} else {
					let e = 180 * n, t = 60 * n;
					s.strokeStyle = u, s.lineWidth = 1.2 * n, s.globalAlpha = .8, s.beginPath();
					for (let r = 0; r <= e; r += 9 * n) s.moveTo(o + r, i), s.lineTo(o + r + t * .5, i - t), s.moveTo(o + r + t * .5, i), s.lineTo(o + r, i - t);
					s.stroke(), s.globalAlpha = 1, s.fillStyle = u;
					for (let r = 0; r <= e; r += 60 * n) s.fillRect(o + r, i - t - 4 * n, 4 * n, t + 4 * n);
					s.fillRect(o, i - t - 4 * n, e, 3 * n);
				}
			}
		}
		return {
			c: o,
			gc: c,
			h: r,
			base: i
		};
	}
	let Me = {
		ArrowLeft: "l",
		ArrowRight: "r",
		ArrowUp: "u",
		ArrowDown: "d",
		KeyA: "l",
		KeyD: "r",
		KeyW: "u",
		KeyS: "d",
		KeyQ: "l",
		KeyZ: "u"
	}, U = {
		down: !1,
		tx: 0,
		ty: 0,
		swiped: null
	}, Ne = (e, t) => {
		N.mode === "run" && !N.paused && V.push({
			k: e,
			down: t
		});
	};
	function W(e) {
		if (N.mode !== "run" || N.paused) return !1;
		if (e.code === "Space" || e.code === "Enter") return e.preventDefault(), e.repeat || (c.unlock(), Ne("a", !0)), !0;
		let t = Me[e.code];
		return t ? (e.preventDefault(), e.repeat || Ne(t, !0), !0) : !1;
	}
	function Pe(e) {
		(e.code === "Space" || e.code === "Enter") && N.mode === "run" && (e.preventDefault(), Ne("a", !1));
		let t = Me[e.code];
		t && Ne(t, !1);
	}
	let Fe = (e) => {
		if (!(N.mode !== "run" || N.paused)) {
			e.preventDefault();
			try {
				s.setPointerCapture(e.pointerId);
			} catch {}
			c.unlock(), U.down = !0, U.tx = e.clientX, U.ty = e.clientY, U.swiped = null, Ne("a", !0);
		}
	}, Ie = (e) => {
		if (!U.down || N.mode !== "run") return;
		let t = e.clientX - U.tx, n = e.clientY - U.ty;
		!U.swiped && Math.hypot(t, n) > 26 && (U.swiped = Math.abs(t) > Math.abs(n) ? t < 0 ? "l" : "r" : n < 0 ? "u" : "d", Ne(U.swiped, !0));
	}, Le = () => {
		U.down && (U.down = !1, U.swiped && Ne(U.swiped, !1), Ne("a", !1));
	};
	s.addEventListener("pointerdown", Fe), s.addEventListener("pointermove", Ie), s.addEventListener("pointerup", Le), s.addEventListener("pointercancel", Le), s.addEventListener("contextmenu", (e) => e.preventDefault());
	function K() {
		T.down && V.push({
			k: "a",
			down: !1
		});
		for (let e of [
			"l",
			"r",
			"u",
			"d"
		]) T.dir[e] && V.push({
			k: e,
			down: !1
		});
		U.down = !1;
	}
	function q(e) {
		F.length > 260 && F.shift(), F.push(e);
	}
	function Ue(e, t, n, r, i, a, o) {
		I.push({
			text: e,
			x: t,
			y: n,
			col: r || "#F3F0E8",
			size: i || 26,
			t: 0,
			life: a || 1.1,
			sub: o
		});
	}
	function We(e, t, n, r) {
		N.big = {
			text: e,
			col: t || "#C8FF2E",
			sub: n,
			t: 0,
			life: r || 1.2
		};
	}
	let J = (e, t, n, r) => {
		for (let i = 0; i < n; i++) q({
			x: e + (Math.random() - .5) * 70,
			y: t,
			vx: (Math.random() - .5) * 360 + (r || 0) * .15,
			vy: -Math.random() * 160,
			life: .5 + Math.random() * .3,
			t: 0,
			k: "dust",
			s: 7 + Math.random() * 10
		});
	}, Ge = (e, t, n, r) => {
		for (let i = 0; i < n; i++) q({
			x: e,
			y: t,
			vx: (Math.random() - .5) * 600,
			vy: (Math.random() - .5) * 600,
			life: .6,
			t: 0,
			k: "star",
			c: r || "#C8FF2E"
		});
	}, Ke = {
		trick(e, t, n, i) {
			Ue(He(e).toUpperCase(), n + 10, i - 175, r, 24, 1, "+" + t);
		},
		slowmo(e) {
			N.slowT = .55, m.slow(), We(G("combo") + " ×" + e, t, "", 1.1), N.shake = Math.max(N.shake, 7);
			for (let e = 0; e < 34; e++) q({
				x: w.x,
				y: w.y - 80,
				vx: (Math.random() - .5) * 900,
				vy: -200 - Math.random() * 700,
				life: 1.2,
				t: 0,
				k: "conf",
				c: [
					t,
					n,
					r
				][e % 3],
				s: 4 + Math.random() * 4,
				rot: Math.random() * 6,
				vr: (Math.random() - .5) * 20
			});
		},
		combo(e, t) {
			l.onCombo && l.onCombo(e ? {
				...e,
				names: e.names.map(He)
			} : null, t);
		},
		bank(e, n, r, i) {
			n > 1 && (m.bank(n), Ue("+" + e, r + 40, i - 230, t, 30, 1.2));
		},
		pop(e, t) {
			m.pop();
			for (let n = 0; n < 6; n++) q({
				x: e - 30,
				y: t,
				vx: -200 - Math.random() * 200,
				vy: -Math.random() * 120,
				life: .45,
				t: 0,
				k: "dust",
				s: 8 + Math.random() * 8
			});
		},
		flip() {
			m.flip();
		},
		grindIn(e, t) {
			m.grindIn(), N.shake = Math.max(N.shake, 2.5);
			for (let n = 0; n < 10; n++) q({
				x: e,
				y: t,
				vx: (Math.random() - .3) * 500,
				vy: -Math.random() * 400,
				life: .35,
				t: 0,
				k: "spark"
			});
		},
		sparks(e, t, n, r) {
			if (!(Math.random() < .5)) for (let i = 0; i < 2; i++) q({
				x: e + (n === "l" ? -28 : n === "r" ? 26 : 0) + (Math.random() - .5) * 20,
				y: t - 2,
				vx: -r * .5 - Math.random() * 260,
				vy: -60 - Math.random() * 360,
				life: .28 + Math.random() * .25,
				t: 0,
				k: "spark"
			});
		},
		grade(e, i, a) {
			if (e === "perfect") {
				m.perfect(), Ue(G("perfect"), i, a - 120, t, 34, 1);
				for (let e = 0; e < 14; e++) q({
					x: i + (Math.random() - .5) * 60,
					y: a,
					vx: (Math.random() - .5) * 300,
					vy: -100 - Math.random() * 300,
					life: .6,
					t: 0,
					k: "star",
					c: t
				});
			} else e === "limite" ? Ue(G("sketchy"), i, a - 120, n, 24, .8) : e === "rattrape" ? Ue(G("caught"), i, a - 120, n, 24, .8) : Ue(G("good"), i, a - 120, r, 20, .7);
		},
		land(e, t, n, r) {
			m.land(e), N.shake = Math.max(N.shake, 2 + e * 5), J(t, n, 12, r);
		},
		bail(e, t) {
			m.bail(), N.shake = 10, Ue(G("ouch"), e, t - 170, n, 34, .9), l.onBail && l.onBail();
		},
		respawn(e, n) {
			We(G("respawn"), t, G("respawnSub"), 1.1), m.go(), Ge(e, n - 60, 24);
		},
		kickPop() {
			m.pop(), N.shake = 4;
		},
		clack() {
			m.clack();
		},
		cone(e, t) {
			L.set(e, {
				x: e.x,
				y: e.y,
				vx: t * .8 + 200,
				vy: -480 - Math.random() * 200,
				rot: 0,
				vr: 10 + Math.random() * 10,
				hit: 1
			}), m.cone(), N.shake = Math.max(N.shake, 3), Ue("TOC !", e.x, e.y - 60, n, 20, .6);
		},
		dropSpawn(e) {
			We("DROP", n, G("dropSub"), 1.4), m.boost(), l.onCollect && l.onCollect("dropSpawn", e);
		},
		collect(e, r) {
			if (e.k === "coin") {
				m.coin();
				for (let t = 0; t < 5; t++) q({
					x: e.x,
					y: e.y,
					vx: (Math.random() - .5) * 260,
					vy: (Math.random() - .5) * 260,
					life: .35,
					t: 0,
					k: "star",
					c: "#FFD54A"
				});
			} else if (e.k === "letter") m.loot(), We("SKATE".split("").map((e) => r.letters.includes(e) ? e : "_").join(" "), t, r.letters.length === 5 ? G("skateDone") : "", 1.3), Ge(e.x, e.y, 20);
			else if (e.k === "cassette") m.token(), We(G("cassette"), "#B9A6FF", "", 1.3), Ge(e.x, e.y, 26, "#B9A6FF");
			else if (e.k === "boost") m.boost(), We(G("boost"), n, "", .8), N.shake = 4;
			else if (e.k === "magnet") m.magnet(), We(G("magnet"), "#B9A6FF", "", .8);
			else if (e.k === "drop") {
				m.token();
				let t = O.byId.get(e.id);
				We(G("dropCaught"), "#FFD54A", t ? oe(t) : "", 1.6), N.shake = 8, Ge(e.x, e.y, 40, "#FFD54A");
			}
			l.onCollect && l.onCollect(e.k, e, r);
		},
		timeUp() {
			We(G("timeUp"), n, "", 1.3), K();
		},
		done(e) {
			N.mode = "end", l.onEnd && l.onEnd(e);
		}
	};
	function qe(e, t = w, n = T) {
		let r = P, i = t.crouch, s = -63 + 20 * i, c = 1 + 3 * i, l = .05 + .16 * i, u = r.board;
		u.x = 0, u.y = 0, u.pitch = 0, u.roll = 0, u.yaw = 0, u.show = 1;
		let d = -24, f = 22, p = 0, m = 0, h = 1, g = Math.sin(e * 2.6) * 3, _ = {
			x: -40,
			y: -76 + g
		}, v = {
			x: 39,
			y: -72 - g
		}, y = "down", b = "down", x = 0;
		if (t.state === "ride" && t.landT < .28 && (s += 6 * (1 - t.landT / .28)), t.state === "ride" && n.down && (_ = {
			x: -34,
			y: -60
		}, v = {
			x: 36,
			y: -56
		}), t.state === "air") {
			let e = o(t.popT / .34, 0, 1);
			if (u.pitch = t.popT < .34 ? -.6 * Math.sin(Math.PI * e) : 0, s = -48, l = .1, _ = {
				x: -44,
				y: -100 + g
			}, v = {
				x: 44,
				y: -96 - g
			}, x = -.06, t.popT < .12 && (s = -62, l = .02), t.flip) {
				let e = o(t.flip.t / t.flip.dur, 0, 1), n = e < .5 ? 2 * e * e : 1 - 2 * (1 - e) * (1 - e);
				u.roll = t.flip.f.roll * a * n, u.yaw = t.flip.f.yaw * a * n, u.y = Math.sin(Math.PI * e) * 9, u.pitch = 0, h = 0, d = -27, f = 25, p = -4 - 6 * Math.sin(Math.PI * e), m = -5 - 6 * Math.sin(Math.PI * e), _ = {
					x: -48,
					y: -108
				}, v = {
					x: 46,
					y: -104
				};
			}
			if (t.grab) {
				s = -38, u.y = -6, u.pitch = -.14, l = .18;
				let e = t.grab.name;
				e === "Melon" || e === "Stalefish" ? (_ = {
					x: -10,
					y: -2
				}, y = "out", v = {
					x: 46,
					y: -106
				}) : (v = {
					x: 8,
					y: -2
				}, b = "out", _ = {
					x: -46,
					y: -106
				}), x = .1;
			}
		}
		if (t.state === "grind") {
			let e = t.grind.d;
			_ = {
				x: -50,
				y: -86 + g * .6
			}, v = {
				x: 48,
				y: -88 - g * .6
			}, s = -52, e === "l" ? u.pitch = -.2 : e === "r" ? (u.pitch = .18, l = .22) : e === "d" ? (u.yaw = Math.PI / 2, u.roll = .42, d = -10, f = 9, l = -.06, s = -50, _ = {
				x: -52,
				y: -96
			}, v = {
				x: 52,
				y: -70
			}) : e === "u" && (u.pitch = .1, u.yaw = .5);
		}
		if (h) {
			let e = Math.cos(u.pitch), t = Math.sin(u.pitch), n = u.yaw === Math.PI / 2 ? 1 : Math.max(.45, Math.abs(Math.cos(u.yaw))), r = (t) => u.x + t * n * e, i = (e) => u.y + e * n * t;
			p = i(d), m = i(f), d = r(d), f = r(f);
		}
		return r.hip.x = c, r.hip.y = s, r.lean = l, r.fb.x = d, r.fb.y = p, r.ff.x = f, r.ff.y = m, r.hb = _, r.hf = v, r.eb = y, r.ef = b, r.tilt = x, r.pony.x = -(t.vx / 600) * 3, r.pony.y = t.ponyY, r.shoeAng = h ? u.pitch : 0, r.blink = +(e % 3.7 < .12), r.smile = t.state !== "bail", r;
	}
	function Je(e) {
		let t = P, n = Math.sin(e * 2);
		return t.hip.x = 0, t.hip.y = -75 + n * .5, t.lean = -.02, t.fb.x = -17, t.fb.y = 0, t.ff.x = 17, t.ff.y = 0, t.hb = {
			x: -22,
			y: -68 + n
		}, t.eb = "out", t.hf = {
			x: 43,
			y: -106
		}, t.ef = "down", t.tilt = Math.sin(e * .7) * .04, t.shoeAng = 0, t.board.show = 0, t.pony.x = Math.sin(e * 1.3) * 2, t.pony.y = Math.sin(e * 2.1) * 2, t.blink = +(e % 4.1 < .12), t.smile = !0, t;
	}
	let Ye = () => N.mode === "run" || N.mode === "end" ? .1 + .8 * ze(0, 1, N.t / 60) : .42;
	function Xe(e, t, n) {
		p.setTransform(_, 0, 0, _, 0, 0), p.drawImage(x.skyD, 0, 0, h, g);
		let r = x.sunR, i = g * (.5 + .28 * n);
		p.globalAlpha = 1 - n * .6, p.drawImage(x.sun, h * .64 - r * 2.5, i - r * 2.5, r * 5, r * 5), p.globalAlpha = 1, n > 0 && (p.globalAlpha = ze(.05, .9, n), p.drawImage(x.skyN, 0, 0, h, g), p.globalAlpha = 1);
		let a = x.TW, s = t + .7 * g / b, c = (t, n, r, i, c) => {
			let l = i - n - o(s * b * c, -g * .25, g * .4), u = -(e * b * r % a);
			for (u > 0 && (u -= a); u < h; u += a) p.drawImage(t, u, l, a, n);
		};
		p.globalAlpha = .8, c(x.clouds, g * .6, .015, g * .6, .01), p.globalAlpha = 1;
		let l = g * .72;
		c(x.far.c, x.far.h, .05, l + 40 * b, .03), c(x.mid.c, x.mid.h, .16, l + 70 * b, .1), p.fillStyle = "rgba(12,8,30," + (n * .42).toFixed(3) + ")", p.fillRect(0, 0, h, g), p.globalAlpha = .55 + .45 * n, c(x.mid.gc, x.mid.h, .16, l + 70 * b, .1), p.globalAlpha = 1, c(x.near.c, x.near.h, .42, l + 110 * b, .3);
		{
			let e = l + 110 * b - o(s * b * .3, -g * .25, g * .4) - 2;
			e < g && (p.fillStyle = "#22142C", p.fillRect(0, e, h, g - e));
		}
		p.globalAlpha = .3 + .7 * n, c(x.near.gc, x.near.h, .42, l + 110 * b, .3), p.globalAlpha = 1;
	}
	let Ze = (e) => p.setTransform(_ * e.s, 0, 0, _ * e.s, _ * (-e.x * e.s + N.shx), _ * (-e.y * e.s + N.shy)), Qe = [
		{
			t: "RIDE",
			a: "#C8FF2E",
			b: "#5BD16A"
		},
		{
			t: "OLLIE",
			a: "#FF6A1A",
			b: "#FFC24A"
		},
		{
			t: "GRIND",
			a: "#FF5FA2",
			b: "#FF9A52"
		},
		{
			t: "SK8",
			a: "#7FE3FF",
			b: "#C8FF2E"
		},
		{
			t: "STREET",
			a: "#F3F0E8",
			b: "#FF6A1A"
		}
	];
	function Y(e, t, n, r, i) {
		let a = Qe[r % Qe.length], o = i * (a.t.length * .62 + 1), s = i * 1.7;
		e.drawImage(xe("g" + r % Qe.length + "|" + Math.round(i), o, s, (e) => $e(e, a, i)), t - o / 2, n - s / 2, o, s);
	}
	function $e(t, n, i) {
		t.save(), t.globalAlpha = .62, t.rotate(-.06), t.font = i + "px \"Anton\",Impact,\"Haettenschweiler\",\"Futura Condensed ExtraBold\",\"Arial Narrow\",sans-serif", t.textAlign = "center", t.textBaseline = "middle", t.lineJoin = "round", t.strokeStyle = "rgba(0,0,0,.35)", t.lineWidth = i * .28, t.strokeText(n.t, 4, 5), t.strokeStyle = r, t.lineWidth = i * .26, t.strokeText(n.t, 0, 0), t.strokeStyle = e, t.lineWidth = i * .15, t.strokeText(n.t, 0, 0);
		let a = t.createLinearGradient(0, -i * .45, 0, i * .45);
		a.addColorStop(0, n.a), a.addColorStop(1, n.b), t.fillStyle = a, t.fillText(n.t, 0, 0), t.fillStyle = n.b;
		for (let e = 0; e < 4; e++) t.fillRect(-i * .6 + e * i * .4, i * .36, i * .035, i * (.12 + e * 7 % 5 * .05));
		t.restore();
	}
	function et(e, t, n, r, i, a) {
		let o = Math.sin(i * 23) > .97 || Math.sin(i * 7.3) > .995 ? .55 : 1, s = Math.round(a * 10) / 10, c = r * 7.4, l = r * 2.4;
		e.drawImage(xe("n" + r + "|" + o + "|" + s, c, l, (e) => tt(e, r, o, s)), t - c / 2, n - l / 2, c, l);
	}
	function tt(e, r, i, a) {
		e.save(), e.font = r + "px \"Anton\",Impact,\"Haettenschweiler\",\"Futura Condensed ExtraBold\",\"Arial Narrow\",sans-serif", e.textAlign = "center", e.textBaseline = "middle", e.lineJoin = "round";
		let o = e.measureText("RESPAWN").width;
		u(e, -o / 2 - r * .9, -r * .72, o + r * 1.5, r * 1.4, r * .18), e.fillStyle = "#1A1420", e.fill(), e.strokeStyle = "#2E2533", e.lineWidth = 3, e.stroke();
		let s = (.55 + .45 * a) * i;
		e.globalAlpha = .13 * s, e.strokeStyle = t, e.lineWidth = r * .55, e.strokeText("RESPAWN", r * .3, 0), e.globalAlpha = .25 * s, e.lineWidth = r * .25, e.strokeText("RESPAWN", r * .3, 0), e.globalAlpha = 1, e.lineWidth = r * .09, e.strokeStyle = i < 1 ? "#7A9A2A" : t, e.strokeText("RESPAWN", r * .3, 0), e.lineWidth = r * .03, e.strokeStyle = "rgba(255,255,255," + (.8 * s).toFixed(2) + ")", e.strokeText("RESPAWN", r * .3, 0);
		let c = -o / 2 - r * .25;
		e.beginPath();
		for (let t = 0; t < 8; t++) {
			let n = Math.PI / 8 + t * Math.PI / 4;
			e.lineTo(c + Math.cos(n) * r * .42, Math.sin(n) * r * .42);
		}
		e.closePath(), e.globalAlpha = .2, e.strokeStyle = n, e.lineWidth = r * .3, e.stroke(), e.globalAlpha = 1, e.lineWidth = r * .07, e.stroke(), e.lineWidth = r * .025, e.strokeStyle = "rgba(255,240,220,.85)", e.stroke(), e.font = r * .55 + "px \"Anton\",Impact,\"Haettenschweiler\",\"Futura Condensed ExtraBold\",\"Arial Narrow\",sans-serif", e.fillStyle = n, e.fillText("R", c, r * .03), e.restore();
	}
	function nt(e, t, n, r, i, a) {
		let o = r - i, s = e.createLinearGradient(0, o, 0, r);
		s.addColorStop(0, "#4A4450"), s.addColorStop(1, "#2C2931"), e.fillStyle = s, e.fillRect(t, o, n - t, i), e.fillStyle = "#37323D", e.fillRect(t - 6, o - 10, n - t + 12, 12), e.fillStyle = "rgba(255,170,130,.35)", e.fillRect(t - 6, o - 10, n - t + 12, 2), e.strokeStyle = "rgba(0,0,0,.22)", e.lineWidth = 2, e.beginPath();
		for (let i = t + 120; i < n; i += 120) e.moveTo(i, o), e.lineTo(i, r);
		if (e.stroke(), e.fillStyle = "rgba(0,0,0,.25)", e.fillRect(t, r - 26, n - t, 26), a >= 0) {
			let r = Math.max(1, Math.floor((n - t) / 420));
			for (let s = 0; s < r; s++) Y(e, t + (n - t) * (s + .5) / r, o + i * .45, a + s, Math.min(70, i * .36));
		}
	}
	function rt(e, t, n, r) {
		e.fillStyle = "#16131B", e.fillRect(t - 4, n - 300, 8, 300), e.fillRect(t - 7, n - 16, 14, 16), e.fillRect(t - 4, n - 300, 46, 6), e.fillStyle = "#24202A", e.fillRect(t + 30, n - 300 - 4, 24, 11);
		let i = .25 + .75 * r, a = e.createRadialGradient(t + 42, n - 300 + 8, 2, t + 42, n - 300 + 8, 70);
		a.addColorStop(0, "rgba(255,226,160," + i.toFixed(2) + ")"), a.addColorStop(.25, "rgba(255,190,110," + (i * .35).toFixed(2) + ")"), a.addColorStop(1, "rgba(255,170,90,0)"), e.fillStyle = a, e.fillRect(t - 30, n - 300 - 62, 144, 140), e.fillStyle = "rgba(255,210,140," + (i * .07).toFixed(3) + ")", e.beginPath(), e.moveTo(t + 32, n - 300 + 7), e.lineTo(t + 52, n - 300 + 7), e.lineTo(t + 170, n), e.lineTo(t - 86, n), e.fill(), e.fillStyle = "#FFE9B8", e.globalAlpha = i, e.fillRect(t + 32, n - 300 + 6, 20, 2.5), e.globalAlpha = 1;
	}
	function it(r, i) {
		if (i.k === "bin") u(r, i.x - 16, i.y - 48, 32, 48, 4), d(r, "#2F4A3A", 2.2), r.fillStyle = "#253B2E", r.fillRect(i.x - 14, i.y - 38, 28, 4), u(r, i.x - 19, i.y - 54, 38, 8, 3), d(r, "#3A5A47", 2);
		else if (i.k === "hydrant") u(r, i.x - 8, i.y - 34, 16, 34, 4), d(r, n, 2.2), u(r, i.x - 13, i.y - 26, 26, 7, 3), d(r, "#D9560F", 2), r.beginPath(), r.arc(i.x, i.y - 36, 7, Math.PI, 0), d(r, "#D9560F", 2);
		else if (i.k === "drop") {
			r.fillStyle = t, r.fillRect(i.x - 60, i.y - 3, 60, 3), r.fillStyle = e;
			for (let e = 0; e < 6; e++) r.fillRect(i.x - 58 + e * 10, i.y - 3, 5, 3);
		}
	}
	function at(e, n, r, i) {
		let o = e.createLinearGradient(0, Math.min(n.y0, n.y1), 0, Math.min(n.y0, n.y1) + 320);
		if (o.addColorStop(0, "#3A3741"), o.addColorStop(.06, "#2C2A31"), o.addColorStop(.45, "#1E1D22"), o.addColorStop(1, "#141416"), n.kind === "pit") {
			let t = n.y0 - 170, a = e.createLinearGradient(0, t, 0, n.y0);
			a.addColorStop(0, "#17151B"), a.addColorStop(1, "#0E0D11"), e.fillStyle = a, e.fillRect(n.x0, t, n.x1 - n.x0, n.y0 - t);
			let o = n.y0 - 34, s = e.createLinearGradient(0, o, 0, n.y0);
			s.addColorStop(0, "#1E4A5A"), s.addColorStop(1, "#0B1E28"), e.fillStyle = s, e.fillRect(n.x0, o, n.x1 - n.x0, 40), e.strokeStyle = "rgba(255,160,110,.45)", e.lineWidth = 2, e.beginPath();
			for (let t = 0; t < 7; t++) {
				let r = n.x0 + (t * 53 + i * 40) % (n.x1 - n.x0 - 30);
				e.moveTo(r, o + 5 + t % 3 * 7), e.lineTo(r + 18 + t % 2 * 10, o + 5 + t % 3 * 7);
			}
			e.stroke(), e.fillStyle = "#141416", e.fillRect(n.x0, n.y0 + 4, n.x1 - n.x0, r - n.y0), e.fillStyle = "#24222A", e.fillRect(n.x0, t, 8, 170), e.fillRect(n.x1 - 8, t, 8, 170), e.fillStyle = "rgba(255,170,130,.4)", e.fillRect(n.x1 - 8, t, 8, 2);
			return;
		}
		if (e.beginPath(), n.kind === "stairs") {
			let t = S.stairs.find((e) => e.x0 === n.x0);
			e.moveTo(n.x0, n.y0);
			for (let r = 0; r < t.n; r++) e.lineTo(n.x0 + r * t.run, n.y0 + (r + 1) * t.rise), e.lineTo(n.x0 + (r + 1) * t.run, n.y0 + (r + 1) * t.rise);
			e.lineTo(n.x1, r), e.lineTo(n.x0, r), e.closePath(), e.fillStyle = o, e.fill(), e.strokeStyle = "#5A5462", e.lineWidth = 3, e.beginPath();
			for (let r = 0; r < t.n; r++) {
				let i = n.y0 + (r + 1) * t.rise;
				e.moveTo(n.x0 + r * t.run, i), e.lineTo(n.x0 + (r + 1) * t.run, i);
			}
			e.stroke(), e.strokeStyle = "rgba(255,170,130,.5)", e.lineWidth = 1.2, e.stroke(), e.fillStyle = "rgba(0,0,0,.25)";
			for (let r = 0; r < t.n; r++) e.fillRect(n.x0 + r * t.run, n.y0 + r * t.rise + 1.5, 2.5, t.rise);
			return;
		}
		if (e.moveTo(n.x0, n.y0), e.lineTo(n.x1, n.y1), e.lineTo(n.x1, r), e.lineTo(n.x0, r), e.closePath(), e.fillStyle = o, e.fill(), n.kind === "kick") e.beginPath(), e.moveTo(n.x0, n.y0), e.lineTo(n.x1, n.y1), e.lineTo(n.x1, n.y0), e.closePath(), e.fillStyle = "#3C424A", e.fill(), e.strokeStyle = "#2A2F35", e.lineWidth = 2.5, e.beginPath(), e.moveTo(n.x0 + 40, n.y0), e.lineTo(n.x0 + 40, n.y0 - (n.y0 - n.y1) * .33), e.moveTo(n.x0 + 80, n.y0), e.lineTo(n.x0 + 80, n.y0 - (n.y0 - n.y1) * .66), e.moveTo(n.x0 + 40, n.y0), e.lineTo(n.x0 + 80, n.y0 - (n.y0 - n.y1) * .66), e.stroke(), e.fillStyle = "#3C424A", e.fillRect(n.x1 - 6, n.y1, 6, n.y0 - n.y1 + 170), e.strokeStyle = t, e.lineWidth = 3, e.beginPath(), e.moveTo(n.x1 - 14, n.y1 + 5.5), e.lineTo(n.x1, n.y1), e.stroke();
		else if (e.beginPath(), e.moveTo(n.x0, n.y0 + 2), e.lineTo(n.x1, n.y1 + 2), e.lineTo(n.x1, n.y1 + 30), e.lineTo(n.x0, n.y0 + 30), e.closePath(), e.fillStyle = "#423E49", e.fill(), e.fillStyle = "rgba(0,0,0,.28)", e.beginPath(), e.moveTo(n.x0, n.y0 + 30), e.lineTo(n.x1, n.y1 + 30), e.lineTo(n.x1, n.y1 + 36), e.lineTo(n.x0, n.y0 + 36), e.fill(), n.kind === "flat") {
			e.strokeStyle = "rgba(0,0,0,.4)", e.lineWidth = 2, e.beginPath();
			for (let t = Math.ceil(n.x0 / 160) * 160; t < n.x1; t += 160) e.moveTo(t, n.y0 + 3), e.lineTo(t, n.y0 + 30);
			e.stroke(), e.fillStyle = "rgba(255,255,255,.05)", e.fillRect(n.x0, n.y0 + 3, n.x1 - n.x0, 4), e.fillStyle = "rgba(243,240,232,.10)";
			for (let t = Math.ceil(n.x0 / 150) * 150; t < n.x1 - 70; t += 150) e.fillRect(t, n.y0 + 128, 70, 7);
			e.fillStyle = "rgba(255,106,26,.16)", e.fillRect(n.x0, n.y0 + 52, n.x1 - n.x0, 3);
			for (let t = Math.ceil(n.x0 / 1100) * 1100; t < n.x1 - 40; t += 1100) e.fillStyle = "rgba(0,0,0,.28)", e.beginPath(), e.ellipse(t + 20, n.y0 + 90, 26, 5, 0, 0, a), e.fill();
		}
		e.strokeStyle = n.kind === "kick" ? "#9AA2AC" : "#55505D", e.lineWidth = 4, e.beginPath(), e.moveTo(n.x0, n.y0), e.lineTo(n.x1, n.y1), e.stroke(), e.strokeStyle = "rgba(255,176,130,.55)", e.lineWidth = 1.3, e.beginPath(), e.moveTo(n.x0, n.y0 - 1.5), e.lineTo(n.x1, n.y1 - 1.5), e.stroke();
	}
	function ot(n, r) {
		let i = r.y - r.top, o = r.x1 - r.x0;
		if (n.fillStyle = "rgba(0,0,0,.3)", n.beginPath(), n.ellipse(r.x0 + o / 2, r.y, o / 2 + 16, 6, 0, 0, a), n.fill(), r.style === "banc") {
			n.fillStyle = "#2A2A2E";
			for (let e = r.x0 + 24; e < r.x1 - 10; e += Math.max(60, (o - 48) / 3)) n.fillRect(e, r.top, 8, i);
			n.fillRect(r.x1 - 32, r.top, 8, i), u(n, r.x0, r.top - 2, o, 11, 3), d(n, "#8A5A3A", 2.2), n.fillStyle = "#B9BEC4", n.fillRect(r.x0, r.top - 3, o, 3);
		} else {
			let a = n.createLinearGradient(0, r.top, 0, r.y);
			if (a.addColorStop(0, r.style === "manny" ? "#3A3F2B" : "#5D5866"), a.addColorStop(1, r.style === "manny" ? "#262A1B" : "#38343F"), n.beginPath(), n.rect(r.x0, r.top, o, i), n.fillStyle = a, n.fill(), n.strokeStyle = e, n.lineWidth = 2.2, n.stroke(), r.style === "manny") n.fillStyle = t, n.globalAlpha = .85, n.fillRect(r.x0 + 6, r.top + i * .45, o - 12, 4), n.globalAlpha = 1;
			else {
				n.fillStyle = "rgba(0,0,0,.18)";
				for (let e = r.x0 + 60; e < r.x1; e += 90) n.fillRect(e, r.top + 4, 2, i - 4);
				n.fillStyle = "rgba(255,255,255,.08)", n.fillRect(r.x0 + 2, r.top + 3, o - 4, 5);
			}
			st(n, r.x0, r.x1, r.top);
		}
	}
	function st(t, n, r, i) {
		t.fillStyle = "#C9CED4", t.fillRect(n - 2, i - 3, r - n + 4, 4.5), t.fillStyle = "rgba(255,255,255,.6)", t.fillRect(n - 2, i - 3, r - n + 4, 1.2), t.strokeStyle = e, t.lineWidth = 1.4, t.strokeRect(n - 2, i - 3, r - n + 4, 4.5);
	}
	function ct(r, i, a, o) {
		let s = i.style === "plat" ? t : i.style === "main" ? "#B9BEC4" : n, c = de(i, a), l = de(i, o);
		r.beginPath(), r.moveTo(a, c), r.lineTo(o, l), r.strokeStyle = e, r.lineWidth = i.style === "plat" ? 9 : 8.5, r.lineCap = i.style === "plat" ? "butt" : "round", r.stroke(), r.strokeStyle = s, r.lineWidth = i.style === "plat" ? 5 : 4.6, r.stroke(), r.strokeStyle = "rgba(255,255,255,.55)", r.lineWidth = 1.2, r.beginPath(), r.moveTo(a + 4, c - 1.2), r.lineTo(o - 4, l - 1.2), r.stroke(), r.lineCap = "round";
	}
	function lt(t, n) {
		t.strokeStyle = e, t.lineWidth = 7, t.beginPath();
		let r = n.x1 - n.x0, i = Math.max(2, Math.round(r / 150) + 1), a = [];
		for (let e = 0; e < i; e++) a.push(n.x0 + 12 + (r - 24) * e / (i - 1));
		for (let e of a) t.moveTo(e, de(n, e)), t.lineTo(e, j(e).y);
		t.stroke(), t.strokeStyle = "#3A3540", t.lineWidth = 4, t.stroke();
		for (let e of a) t.fillStyle = "#2A2630", t.fillRect(e - 7, j(e).y - 4, 14, 4);
		ct(t, n, n.x0, n.x1);
	}
	function ut(e, t) {
		let i = L.get(t), o = i || t;
		e.save(), e.translate(o.x, o.y), i && e.rotate(i.rot), i || (e.fillStyle = "rgba(0,0,0,.3)", e.beginPath(), e.ellipse(0, 0, 18, 4, 0, 0, a), e.fill()), u(e, -15, -5, 30, 5, 1.5), d(e, "#C2420E", 2), e.beginPath(), e.moveTo(-11, -5), e.lineTo(-3.5, -34), e.lineTo(3.5, -34), e.lineTo(11, -5), e.closePath(), d(e, n, 2.2), e.fillStyle = r, e.beginPath(), e.moveTo(-7.4, -16), e.lineTo(-5.4, -24), e.lineTo(5.4, -24), e.lineTo(7.4, -16), e.closePath(), e.fill(), e.restore();
	}
	function dt(e) {
		let t = _e.get(e);
		if (t) return t;
		let n = O.byId.get(e), [r, i] = H(100, 100, Math.min(2.5, b * _ * .9));
		return n && ne(i, n, ie(n), O.byId), _e.set(e, r), r;
	}
	function ft(t, n, r) {
		let o = Math.cos(n * 4 + r);
		t.save(), t.scale(Math.max(.18, Math.abs(o)), 1), t.beginPath(), t.arc(0, 0, 12, 0, a), d(t, "#C98A1A", 2.2), t.beginPath(), t.arc(0, -1, 9.5, 0, a), t.fillStyle = "#FFD54A", t.fill(), Math.abs(o) > .4 && (t.fillStyle = e, t.font = "12px " + i, t.textAlign = "center", t.textBaseline = "middle", t.fillText("R", 0, 0)), t.restore();
	}
	function pt(n, o, s) {
		let c = Math.sin(s * 3 + o.ph) * 4;
		if (n.save(), n.translate(o.x, o.y + c), o.k === "coin") ft(n, s, o.ph);
		else if (o.k === "boost" || o.k === "magnet") re(n, o.k);
		else if (o.k === "letter") {
			let r = n.createRadialGradient(0, 0, 4, 0, 0, 58);
			r.addColorStop(0, "rgba(200,255,46,.5)"), r.addColorStop(1, "rgba(200,255,46,0)"), n.fillStyle = r, n.fillRect(-58, -58, 116, 116), n.rotate(Math.sin(s * 2 + o.ph) * .12), u(n, -24, -26, 48, 52, 10), d(n, t, 3), n.fillStyle = e, n.font = "40px " + i, n.textAlign = "center", n.textBaseline = "middle", n.fillText(o.ch, 0, 2);
		} else if (o.k === "cassette") {
			n.globalAlpha = .55 + .45 * Math.abs(Math.sin(s * 2.5)), u(n, -26, -17, 52, 34, 5), d(n, "#2A2A2E", 2.6), u(n, -20, -12, 40, 13, 3), d(n, "#B9A6FF", 1.6);
			for (let e of [-10, 10]) n.beginPath(), n.arc(e, -5.5, 4, 0, a), d(n, r, 1.4);
			n.fillStyle = "#B9A6FF", n.fillRect(-14, 6, 28, 5), n.globalAlpha = 1;
		}
		n.restore();
	}
	function mt(t, r, a) {
		let o = Math.sin(a * 2.4) * 6;
		t.save(), t.translate(r.x, r.y + o);
		let s = t.createRadialGradient(0, 0, 10, 0, 0, 110);
		s.addColorStop(0, "rgba(255,213,74,.55)"), s.addColorStop(1, "rgba(255,213,74,0)"), t.fillStyle = s, t.fillRect(-110, -110, 220, 220), t.strokeStyle = "rgba(255,213,74,.5)", t.lineWidth = 2;
		for (let e = 0; e < 8; e++) {
			let n = a * .6 + e * Math.PI / 4;
			t.beginPath(), t.moveTo(Math.cos(n) * 46, Math.sin(n) * 46), t.lineTo(Math.cos(n) * 78, Math.sin(n) * 78), t.stroke();
		}
		u(t, -36, -36, 72, 72, 6), d(t, "#9A6A3A", 3), t.strokeStyle = "#6E4724", t.lineWidth = 3, t.beginPath(), t.moveTo(-34, -34), t.lineTo(34, 34), t.moveTo(34, -34), t.lineTo(-34, 34), t.stroke(), u(t, -36, -36, 72, 72, 6), t.strokeStyle = e, t.lineWidth = 3, t.stroke(), u(t, -25, -25, 50, 50, 9), d(t, "#E4DFD3", 2.2), r.id && t.drawImage(dt(r.id), -22, -22, 44, 44), u(t, -30, 30, 60, 18, 5), d(t, n, 2), t.fillStyle = e, t.font = "14px " + i, t.textAlign = "center", t.textBaseline = "middle", t.fillText("DROP -20 %", 0, 39.5), t.restore();
	}
	function ht(e, t, n) {
		let r = e.x - 40, i = e.x + h / e.s + 40, a = e.y + g / e.s + 40;
		Ze(e);
		let o = p;
		o.lineCap = "round", o.lineJoin = "round";
		let s = S.introWall;
		s && s.x1 > r && s.x0 < i && (nt(o, s.x0, s.x1, s.y, 175, -1), o.fillStyle = "#211B26", o.fillRect(-470, -230, 6, 60), o.fillRect(-290, -230, 6, 60), et(o, -380, -262, 40, t, n), Y(o, -1e3, -86, 3, 58), Y(o, -140, -86, 1, 50));
		for (let e of S.walls) e.x1 >= r && e.x0 <= i && nt(o, e.x0, e.x1, e.y, e.h, e.g);
		for (let e of S.lamps) e.x > r - 200 && e.x < i + 200 && rt(o, e.x, e.y, n);
		for (let e of S.props) e.x > r - 60 && e.x < i + 60 && it(o, e);
		let c = M(r), l = M(i);
		for (let e = c; e <= l; e++) at(o, S.segs[e], a, t);
		for (let e of S.ledges) e.x1 >= r && e.x0 <= i && ot(o, e);
		for (let e of S.rails) e.x1 >= r && e.x0 <= i && lt(o, e);
		for (let e of S.cones) e.x > r - 200 && e.x < i + 200 && ut(o, e);
		if (N.mode !== "scene") {
			let e = C.S.taken;
			for (let n of S.items) {
				if (n.x > i + 80) break;
				n.x > r - 80 && !e.has(n.i) && pt(o, n, t);
			}
			let n = C.S.drop;
			n && !C.S.dropCaught && n.x > r - 120 && n.x < i + 120 && mt(o, n, t);
		}
	}
	function gt(e) {
		for (let [t, n] of L) {
			if (n.hit > 1) continue;
			n.vy += Ve * e, n.x += n.vx * e, n.y += n.vy * e, n.rot += n.vr * e;
			let t = j(n.x).y;
			n.y > t && n.vy > 0 && (n.y = t, n.vy *= -.35, n.vx *= .6, n.vr *= .5, Math.abs(n.vy) < 80 && (n.vy = 0, n.hit = 2, n.rot = Math.PI / 2 * (n.rot > 0 ? 1 : -1)));
		}
	}
	function _t(e) {
		for (let t = F.length - 1; t >= 0; t--) {
			let n = F[t];
			if (n.t += e, n.t >= n.life) {
				F.splice(t, 1);
				continue;
			}
			n.x += n.vx * e, n.y += n.vy * e, n.k === "dust" ? (n.vx *= .92, n.vy *= .9) : n.vy += Ve * .6 * e, n.rot != null && (n.rot += n.vr * e);
		}
		for (let t = I.length - 1; t >= 0; t--) I[t].t += e, I[t].t >= I[t].life && I.splice(t, 1);
	}
	function vt(e) {
		for (let t of F) {
			let n = t.t / t.life;
			if (t.k === "dust") e.globalAlpha = (1 - n) * .5, e.fillStyle = "#B9AFB8", e.beginPath(), e.arc(t.x, t.y, t.s * (.5 + n), 0, a), e.fill();
			else if (t.k === "spark") e.globalAlpha = 1 - n, e.strokeStyle = n < .35 ? "#FFF8D8" : n < .7 ? "#FFC24A" : "#FF6A1A", e.lineWidth = 2.8 - n * 1.6, e.beginPath(), e.moveTo(t.x, t.y), e.lineTo(t.x - t.vx * .035, t.y - t.vy * .035), e.stroke();
			else if (t.k === "conf") e.globalAlpha = 1 - n * n, e.fillStyle = t.c, e.save(), e.translate(t.x, t.y), e.rotate(t.rot), e.fillRect(-t.s / 2, -t.s / 4, t.s, t.s / 2), e.restore();
			else if (t.k === "star") {
				e.globalAlpha = 1 - n, e.fillStyle = t.c;
				let r = 4 * (1 - n) + 1;
				e.fillRect(t.x - r / 2, t.y - r * 1.5, r, r * 3), e.fillRect(t.x - r * 1.5, t.y - r / 2, r * 3, r);
			}
		}
		e.globalAlpha = 1;
	}
	function yt(n) {
		p.setTransform(_, 0, 0, _, 0, 0), p.textAlign = "center", p.textBaseline = "middle", p.lineJoin = "round";
		for (let r of I) {
			let i = r.t / r.life, a = (r.x - n.x) * n.s, s = (r.y - n.y) * n.s - i * 40, c = i < .15 ? Be(i / .15) * 1.15 : i < .25 ? 1.15 - (i - .15) * 1.5 : 1, l = i > .75 ? 1 - (i - .75) / .25 : 1, u = r.size * o(n.s * 1.05, .85, 1.6) * c;
			p.globalAlpha = l, p.font = u + "px \"Anton\",Impact,\"Haettenschweiler\",\"Futura Condensed ExtraBold\",\"Arial Narrow\",sans-serif", p.strokeStyle = e, p.lineWidth = u * .22, p.strokeText(r.text, a, s), p.fillStyle = r.col, p.fillText(r.text, a, s), r.sub && (p.font = u * .62 + "px \"Anton\",Impact,\"Haettenschweiler\",\"Futura Condensed ExtraBold\",\"Arial Narrow\",sans-serif", p.lineWidth = u * .16, p.strokeText(r.sub, a, s + u * .8), p.fillStyle = t, p.fillText(r.sub, a, s + u * .8));
		}
		p.globalAlpha = 1;
		let i = N.big;
		if (i) {
			let t = i.t / i.life, n = t < .12 ? Be(t / .12) * 1.2 : t < .22 ? 1.2 - (t - .12) * 2 : 1, a = t > .7 ? 1 - (t - .7) / .3 : 1, o = Math.min(h * .12, g * .15) * n;
			p.globalAlpha = a, p.font = o + "px \"Anton\",Impact,\"Haettenschweiler\",\"Futura Condensed ExtraBold\",\"Arial Narrow\",sans-serif", p.save(), p.translate(h / 2, Math.max(g * .42, o * .6 + 150)), p.rotate(-.05), p.strokeStyle = e, p.lineWidth = o * .16, p.strokeText(i.text, 0, 0), p.fillStyle = i.col, p.fillText(i.text, 0, 0), i.sub && (p.font = o * .26 + "px \"Anton\",Impact,\"Haettenschweiler\",\"Futura Condensed ExtraBold\",\"Arial Narrow\",sans-serif", p.lineWidth = o * .06, p.strokeText(i.sub.toUpperCase(), 0, o * .62), p.fillStyle = r, p.fillText(i.sub.toUpperCase(), 0, o * .62)), p.restore(), p.globalAlpha = 1;
		}
	}
	let bt = [];
	for (let e = 0; e < 18; e++) bt.push({
		x: Math.random(),
		y: .3 + Math.random() * .66,
		l: .08 + Math.random() * .16,
		s: .8 + Math.random() * .8
	});
	function X(e) {
		if (!(e <= .01)) {
			p.setTransform(_, 0, 0, _, 0, 0), p.lineCap = "round";
			for (let t of bt) t.x -= 1 / 60 * t.s * 2.4 * (.6 + e), t.x + t.l < -.05 && (t.x = 1 + Math.random() * .3, t.y = .3 + Math.random() * .66), p.strokeStyle = "rgba(243,240,232," + (e * .09 * t.s).toFixed(3) + ")", p.lineWidth = 1.5 + t.s, p.beginPath(), p.moveTo(t.x * h, t.y * g), p.lineTo((t.x + t.l * (.5 + e)) * h, t.y * g), p.stroke();
		}
	}
	function Z(e) {
		p.setTransform(_, 0, 0, _, 0, 0), p.fillStyle = "#09070D";
		let t = 2600, n = e * 1.35 % t;
		for (let [e, r] of [
			[300, 0],
			[1250, 1],
			[1900, 0],
			[2350, 2]
		]) {
			let i = e - n;
			i < -300 && (i += t), i > 2300 && (i -= t);
			let o = i * b, s = g;
			if (!(o < -200 || o > h + 200)) {
				if (r === 0) p.fillRect(o, s - 70 * b, 14 * b, 70 * b), p.beginPath(), p.arc(o + 7 * b, s - 70 * b, 7 * b, 0, a), p.fill();
				else if (r === 1) {
					p.beginPath();
					for (let e = 0; e < 5; e++) p.arc(o + e * 26 * b, s - (20 + e * 13 % 25) * b, (30 + e % 2 * 10) * b, 0, a);
					p.fill();
				} else p.fillRect(o, s - 40 * b, 200 * b, 5 * b), p.fillRect(o + 10 * b, s - 40 * b, 6 * b, 40 * b), p.fillRect(o + 180 * b, s - 40 * b, 6 * b, 40 * b);
			}
		}
	}
	function xt() {
		let e = N.scene.rect || {
			x: 0,
			y: 0,
			w: h,
			h: g
		}, t = Math.min(e.h / 440, e.w / 320), n = e.x + e.w * .5, r = e.y + e.h * .82;
		return {
			x: -375 - n / t,
			y: -r / t,
			s: t
		};
	}
	function St() {
		let e = x.TW, t = h + (e - h) / 2;
		return ((x.mid.signX - t) % e + e) % e / (b * .16);
	}
	function Q(e, t, n, r, i) {
		if (t.state === "bail") {
			let i = t.bb;
			i && (e.save(), e.translate(i.x, i.y), e.rotate(i.rot), ee(e, {
				x: 0,
				y: 0,
				pitch: 0,
				roll: 0,
				yaw: 0
			}, r), e.restore());
			let a = qe(R, t, n);
			a.board.show = 0;
			let o = t.bailT;
			a.hb = {
				x: -46,
				y: -110 + Math.sin(o * 20) * 10
			}, a.hf = {
				x: 44,
				y: -40 + Math.cos(o * 18) * 10
			}, a.fb = {
				x: -30,
				y: -10
			}, a.ff = {
				x: 30,
				y: -30
			}, a.hip.y = -50, e.save(), e.translate(t.x, t.y - 60), e.rotate(Math.min(o * 9, Math.PI * 1.6)), e.translate(0, 40), y(e, a, r), e.restore();
			return;
		}
		if (!i && t.inv > 0 && Math.floor(R * 14) % 2 == 0) return;
		let a = qe(R, t, n), o = t.state === "grind" && t.grind.d === "d", s = t.state === "grind" ? o ? 3 : 12 : 19;
		if (e.save(), e.translate(t.x, t.y - (t.jitter || 0) - s), e.rotate(t.bodyAng), y(e, a, r), e.restore(), o && !i) {
			let n = t.grind.g;
			n.kind === "rail" ? ct(e, n.o, Math.max(n.x0, t.x - 16), Math.min(n.x1, t.x + 16)) : st(e, Math.max(n.x0, t.x - 14), Math.min(n.x1, t.x + 14), n.y0);
		}
	}
	function Ct() {
		let n = Ye(), r = N.mode === "scene", s = r ? xt() : N.cam;
		ye = s.s * _, Xe(r ? St() + R * 2 : s.x, s.y, n), ht(s, R, n);
		let c = p;
		if (r) {
			c.fillStyle = "rgba(0,0,0,.35)", c.beginPath(), c.ellipse(-370, 0, 62, 7, 0, 0, a), c.fill(), vt(c);
			let e = N.hop > 0 ? Math.sin(Math.PI * (1 - N.hop / .35)) * 12 : 0;
			ae && (c.save(), c.translate(-330, -52 - e * .3), c.rotate(-Math.PI / 2 + .1), te(c, ae), c.restore(), c.save(), c.translate(-380, -e), y(c, Je(R), ae), c.restore());
		} else {
			if (E && ce) {
				let t = E.P;
				c.save(), c.globalAlpha = .36, Q(c, t, E.IN, ce, !0), c.restore(), c.font = "15px " + i, c.textAlign = "center", c.lineJoin = "round", c.strokeStyle = e, c.lineWidth = 4, c.globalAlpha = .85;
				let n = (k && k.pseudo ? k.pseudo : G("ghost")).toUpperCase();
				c.strokeText(n, t.x, t.y - 178), c.fillStyle = "#B9E8FF", c.fillText(n, t.x, t.y - 178), c.globalAlpha = 1;
			}
			vt(c);
			let t = j(w.x).y;
			c.fillStyle = "rgba(0,0,0," + (.32 * o(1 - (t - w.y) / 300, 0, 1)).toFixed(2) + ")", c.beginPath(), c.ellipse(w.x, t, 50 * o(1 - (t - w.y) / 400, .4, 1), 6, 0, 0, a), c.fill(), Q(c, w, T, ae, !1), N.magnetT > 0 && (c.strokeStyle = "rgba(185,166,255," + (.25 + .15 * Math.sin(R * 10)).toFixed(2) + ")", c.lineWidth = 3, c.beginPath(), c.arc(w.x, w.y - 80, 150 + Math.sin(R * 6) * 8, 0, a), c.stroke()), Z(s.x), X(N.mode === "run" ? o((w.vx - 480) / 260, 0, 1) * .8 + (w.state === "air" ? .25 : 0) + (N.slowT > 0 ? .6 : 0) + (N.boostT > 0 ? .7 : 0) : 0);
		}
		if (yt(s), p.setTransform(_, 0, 0, _, 0, 0), p.drawImage(x.vig, 0, 0, h, g), N.slowT > 0 && (p.fillStyle = "rgba(200,255,46," + (.06 * Math.min(1, N.slowT * 4)).toFixed(3) + ")", p.fillRect(0, 0, h, g)), N.boostT > 0 && (p.fillStyle = "rgba(255,106,26," + (.05 * Math.min(1, N.boostT)).toFixed(3) + ")", p.fillRect(0, 0, h, g)), N.wipe >= 0) {
			let n = (N.wipe * 2.4 - 1.2) * h;
			p.fillStyle = t, p.beginPath(), p.moveTo(n, 0), p.lineTo(n + h * .9, 0), p.lineTo(n + h * .6, g), p.lineTo(n - h * .3, g), p.fill(), p.fillStyle = e, p.beginPath(), p.moveTo(n + h * .05, 0), p.lineTo(n + h * .75, 0), p.lineTo(n + h * .45, g), p.lineTo(n - h * .25, g), p.fill();
		}
	}
	let wt = 0;
	function Tt(e) {
		if (R += e, N.big && (N.big.t += e, N.big.t >= N.big.life && (N.big = null)), N.wipe >= 0) {
			if (N.wipe += e / .5, N.wipe >= .5 && N.wipeTo) {
				let e = N.wipeTo;
				N.wipeTo = null, e();
			}
			N.wipe >= 1 && (N.wipe = -1);
		}
		if (N.shake = Math.max(0, N.shake - e * 30), N.shx = (Math.random() - .5) * N.shake, N.shy = (Math.random() - .5) * N.shake, N.mode === "scene") {
			N.hop = Math.max(0, N.hop - e), _t(e), c.loops(0, 0, 0);
			return;
		}
		N.slowT > 0 && (N.slowT -= e), N.ts = Re(N.ts, N.slowT > 0 ? .3 : 1, 1 - Math.exp(-e * (N.slowT > 0 ? 20 : 6))), N.zoom = Re(N.zoom, (N.slowT > 0 ? 1.07 : 1) * (1 - .1 * o((w.vx - 650) / 400, 0, 1)), 1 - Math.exp(-e * 4)), N.acc += e * N.ts;
		let t = 0;
		for (; N.acc >= .008333333333333333 && t < 10;) {
			for (N.acc -= pe, t++, f && !A && N.mode === "run" && ++wt & 1 && Nt(); be.length && be[0].at <= C.S.tick;) V.push(be.shift().e);
			let e = A ? A.get(C.S.tick) || null : V.length ? V.splice(0) : null;
			A && (V.length = 0), C.step(e), E && (E.step(D.get(E.S.tick) || null), C.S.done || (N.ghostDiff = Math.max(N.ghostDiff, Math.abs(E.P.x - w.x) + Math.abs(E.P.y - w.y))));
		}
		t >= 10 && (N.acc = 0);
		let n = C.S;
		N.t = n.t, N.boostT = n.boostT, N.magnetT = n.magnetT;
		let r = e * N.ts;
		gt(r), _t(r);
		let i = N.cam, a = b * N.zoom;
		i.s = a;
		let s = h / a, u = g / a;
		i.x = w.x - s * (h > g ? .28 : .22);
		let d = j(w.x).y, p = j(w.x + 380).y, m = Math.min(d, (d + p) / 2) - u * (h > g ? .7 : .62), _ = w.y - 150 - u * .14;
		_ < m && (m = _), i.y = Re(i.y, m, 1 - Math.exp(-r * (w.state === "air" ? 9 : 5)));
		let v = w.vx / 700;
		if (c.loops(N.mode === "run" && w.state === "ride" ? .1 * v : 0, w.state === "grind" ? .12 : 0, w.state === "air" ? .05 + .05 * v : .012), N.mode === "run") {
			let e = S.hints[N.hintI];
			e && w.x > e.x && (N.hintI++, l.onHint && l.onHint(e.k)), l.onTick && l.onTick({
				score: n.score,
				left: Math.max(0, 60 - n.t),
				kmh: w.vx * me,
				boost: n.boostT > 0,
				magnet: n.magnetT > 0,
				coins: n.coins,
				letters: n.letters,
				ghost: E ? E.S.score : null
			});
		}
	}
	function Et(e) {
		z = requestAnimationFrame(Et);
		let t = e - fe;
		if (t < 1e3 / 60 - 2) return;
		fe = e;
		let n = Math.min(t / 1e3, 1 / 24);
		if (!N.paused) Tt(n);
		else if (Math.floor(e / 100) === Math.floor((e - t) / 100)) return;
		Ct();
	}
	function Dt() {
		he || ge || (he = !0, fe = performance.now(), z = requestAnimationFrame(Et));
	}
	function Ot() {
		he = !1, cancelAnimationFrame(z), z = 0;
	}
	let $ = {
		pressAt: 0,
		flicked: 0,
		cap: 0
	}, kt = () => {
		T.down || (V.push({
			k: "a",
			down: !0
		}), $.pressAt = C.S.clock);
	}, At = () => {
		T.down && V.push({
			k: "a",
			down: !1
		});
	}, jt = (e) => {
		V.push({
			k: e,
			down: !0
		}), be.push({
			at: C.S.tick + 3,
			e: {
				k: e,
				down: !1
			}
		});
	};
	function Mt() {
		let e = w.x, t = w.y, n = w.vy;
		for (let r = 0; r < 2.5; r += 1 / 60) {
			n += Ve / 60, e += w.vx / 60;
			let i = t;
			t += n / 60;
			for (let a of S.grind) {
				if (a.x0 > e + 20) break;
				if (a.x1 < e) continue;
				let o = de(a, e);
				if (i <= o && t >= o && n > -80 && e < a.x1 - 24) return {
					t: r,
					grind: 1
				};
			}
			if (t >= j(e).y) return {
				t: r,
				grind: 0
			};
		}
		return { t: 2.5 };
	}
	function Nt() {
		let e = w, t = C.S;
		if ($.cap || ($.cap = 4 + (Math.random() * 7 | 0)), e.state === "ride") {
			if (t.drop && !t.dropCaught && j(e.x + 30).s.kind === "kick") {
				kt();
				return;
			}
			$.flicked = 0;
			let n = null;
			for (let t of S.grind) if (t.x0 > e.x + 20) {
				n = {
					x: t.x0,
					h: e.y - t.y0
				};
				break;
			}
			for (let r of S.cones) if (!t.cones.has(r) && r.x > e.x + 20 && (!n || r.x < n.x)) {
				n = {
					x: r.x - 30,
					h: 40
				};
				break;
			}
			for (let t of S.stairs) if (t.x0 > e.x + 10 && (!n || t.x0 < n.x)) {
				n = {
					x: t.x0 - 10,
					h: 0
				};
				break;
			}
			for (let t of S.segs) if (t.kind === "kick" && t.x0 > e.x && (!n || t.x0 < n.x)) {
				n = {
					x: t.x0,
					h: -1,
					s: t
				};
				break;
			}
			if (n) {
				let r = n.x - e.x;
				n.h === -1 ? r < 150 && (t.drop || Math.random() < .02) && kt() : r < e.vx * .42 && r > e.vx * .08 && kt(), T.down && n.h >= 0 && r < e.vx * .17 && t.clock - $.pressAt > .08 && At(), T.down && r < 0 && n.h >= 0 && At();
			}
			t.combo && t.combo.mult < $.cap && !T.down && e.linkT < .5 && (!n || n.x - e.x > e.vx * .75) && kt(), T.down && t.combo && (!n || n.h >= 0 && n.x - e.x > e.vx * .75) && t.clock - $.pressAt > .22 && At(), t.combo || ($.cap = 0);
		} else if (e.state === "air") {
			let n = Mt();
			!e.flip && !e.grab && n.t > .48 && $.flicked < 2 && e.airT > .04 && (jt([
				"l",
				"r",
				"u",
				"d",
				"l"
			][Math.random() * 5 | 0]), $.flicked++), T.down && !e.grab && t.clock - $.pressAt > .05 && e.airT < .2 && At(), !n.grind && n.t < .1 && !T.down && !e.flip && e.airT > .15 && (!t.combo || t.combo.mult < $.cap) && kt();
		} else e.state === "grind" && e.grind.g.x1 - e.x < e.vx * .22 && (T.down ? t.clock - $.pressAt > .06 && At() : kt());
	}
	let Pt = (e) => {
		let t = /* @__PURE__ */ new Map();
		for (let [n, r, i] of e) {
			let e = Ee(n);
			t.has(e) || t.set(e, []), t.get(e).push({
				k: r,
				down: !!i
			});
		}
		return t;
	};
	function Ft(e, n, r, i = null) {
		return e = e >>> 0 || 1, S = le(e), C = Oe(S, {
			fx: Ke,
			dropProduct: i,
			record: !0
		}), w = C.P, T = C.IN, E = null, D = null, k = null, n && n.seed >>> 0 === e && Array.isArray(n.inputs) && n.inputs.length && (E = Oe(S, { dropProduct: i }), k = n, D = Pt(n.inputs)), A = r ? Pt(r) : null, Object.assign(N, {
			mode: "run",
			t: 0,
			ts: 1,
			slowT: 0,
			zoom: 1,
			paused: !1,
			boostT: 0,
			magnetT: 0,
			acc: 0,
			hintI: 0,
			ghostDiff: 0
		}), V.length = 0, be.length = 0, F.length = 0, I.length = 0, L.clear(), U.down = !1, N.cam.y = j(-380).y - g / b * (h > g ? .7 : .62), N.cam.x = w.x, We(G("go"), t, G("goSub"), 1), m.go(), Ke.combo(null), {
			seed: e,
			drop: i,
			ghost: !!E
		};
	}
	return {
		G: N,
		get P() {
			return w;
		},
		get TR() {
			return S;
		},
		get sim() {
			return C;
		},
		get ghost() {
			return E;
		},
		resize: Se,
		start: Dt,
		stop: Ot,
		render: Ct,
		get running() {
			return he;
		},
		setLook(e) {
			ae = e;
		},
		setGhostLook(e) {
			ce = e;
		},
		hop() {
			N.hop = .35;
			for (let e = 0; e < 10; e++) q({
				x: -380 + (Math.random() - .5) * 60,
				y: -90 + (Math.random() - .5) * 80,
				vx: (Math.random() - .5) * 200,
				vy: -80 - Math.random() * 200,
				life: .6,
				t: 0,
				k: "star",
				c: t
			});
		},
		confetti() {
			let e = N.mode === "scene" ? -380 : w.x, i = N.mode === "scene" ? -90 : w.y - 80;
			for (let a = 0; a < 40; a++) q({
				x: e,
				y: i,
				vx: (Math.random() - .5) * 700,
				vy: -200 - Math.random() * 600,
				life: 1.3,
				t: 0,
				k: "conf",
				c: [
					t,
					n,
					r
				][a % 3],
				s: 5 + Math.random() * 4,
				rot: Math.random() * 6,
				vr: (Math.random() - .5) * 20
			});
		},
		showScene(e) {
			N.mode = "scene", N.paused = !1, N.scene.rect = e, F.length = 0, I.length = 0, S = le(1), C = Oe(S), w = C.P, T = C.IN, E = null;
		},
		setSceneRect(e) {
			N.scene.rect = e;
		},
		wipe(e) {
			N.wipe = 0, N.wipeTo = e;
		},
		startRun: Ft,
		setPaused(e) {
			N.paused = !!e, e && K();
		},
		onKeyDown: W,
		onKeyUp: Pe,
		rebuild() {
			h && we();
		},
		iconCanvas: dt,
		replay(e, t, n = null) {
			return ke(le(e >>> 0), t, { dropProduct: n }).S.result;
		},
		destroy() {
			ge = !0, Ot(), s.removeEventListener("pointerdown", Fe), s.removeEventListener("pointermove", Ie), s.removeEventListener("pointerup", Le), s.removeEventListener("pointercancel", Le);
		}
	};
}
//#endregion
//#region 2d/src/audio.js
function We({ muted: e = !1, music: t = !0 } = {}) {
	let n = null, r, i, a, o, s, c, l = 0, u = 0, d = 0, f = t, p = e, m = !1;
	function h() {
		if (n) return !0;
		let e = window.AudioContext || window.webkitAudioContext;
		if (!e) return !1;
		try {
			n = new e();
		} catch {
			return !1;
		}
		r = n.createGain(), r.gain.value = p ? 0 : .8;
		let t = n.createDynamicsCompressor();
		r.connect(t).connect(n.destination), i = n.createGain(), i.gain.value = f ? .55 : 0, i.connect(r);
		let l = n.sampleRate * 2, u = n.createBuffer(1, l, n.sampleRate), d = u.getChannelData(0), m = 0;
		for (let e = 0; e < l; e++) {
			let t = Math.random() * 2 - 1;
			m = (m + .02 * t) / 1.02, d[e] = t * .6 + m * 3;
		}
		a = u;
		let h = (e, t, i) => {
			let a = n.createBufferSource();
			a.buffer = u, a.loop = !0;
			let o = n.createBiquadFilter();
			o.type = e, o.frequency.value = t, o.Q.value = i;
			let s = n.createGain();
			return s.gain.value = 0, a.connect(o).connect(s).connect(r), a.start(), {
				g: s,
				fl: o
			};
		};
		return o = h("bandpass", 380, .8), s = h("bandpass", 2900, 7), c = h("lowpass", 700, .4), !0;
	}
	function g() {
		h() && n.state === "suspended" && n.resume().catch(() => {});
	}
	function _(e, t, r) {
		if (!n) return;
		let i = n.currentTime;
		o.g.gain.setTargetAtTime(e, i, .05), s.g.gain.setTargetAtTime(t, i, .03), c.g.gain.setTargetAtTime(r, i, .15);
	}
	function v(e, t, i, a, o, s, c) {
		if (!n) return;
		let l = n.currentTime + (s || 0), u = n.createOscillator(), d = n.createGain();
		u.type = i || "sine", u.frequency.setValueAtTime(e, l), o && u.frequency.exponentialRampToValueAtTime(o, l + t), d.gain.setValueAtTime(0, l), d.gain.linearRampToValueAtTime(a || .2, l + .005), d.gain.exponentialRampToValueAtTime(.001, l + t), u.connect(d).connect(c || r), u.start(l), u.stop(l + t + .02);
	}
	function y(e, t, i, o, s, c, l, u) {
		if (!n) return;
		let d = n.currentTime + (l || 0), f = n.createBufferSource();
		f.buffer = a;
		let p = n.createBiquadFilter();
		p.type = t, p.frequency.setValueAtTime(i, d), c && p.frequency.exponentialRampToValueAtTime(c, d + e), p.Q.value = o || 1;
		let m = n.createGain();
		m.gain.setValueAtTime(s || .3, d), m.gain.exponentialRampToValueAtTime(.001, d + e), f.connect(p).connect(m).connect(u || r), f.start(d, Math.random() * 1.5), f.stop(d + e + .02);
	}
	let b = {
		pop() {
			y(.07, "highpass", 1800, .7, .55), v(170, .09, "sine", .35, 55);
		},
		land(e) {
			e = Math.max(0, Math.min(1, e)), v(110, .16, "sine", .25 + .3 * e, 38), y(.14, "lowpass", 900, .7, .3 + .3 * e);
		},
		flip() {
			y(.2, "bandpass", 700, 2, .18, 3200);
		},
		perfect() {
			v(988, .12, "triangle", .18), v(1480, .22, "triangle", .16, 0, .06);
		},
		bank(e) {
			let t = [
				523,
				659,
				784,
				1047
			];
			for (let n = 0; n < Math.min(4, 1 + (e / 3 | 0)); n++) v(t[n], .18, "square", .06, 0, n * .055);
		},
		slow() {
			v(70, .7, "sine", .5, 40), y(.6, "lowpass", 400, .5, .25, 120);
		},
		cone() {
			v(620, .06, "triangle", .25, 300), y(.05, "bandpass", 1500, 3, .25);
		},
		bail() {
			y(.35, "lowpass", 600, .6, .7, 150), v(220, .4, "sawtooth", .08, 60);
		},
		clack() {
			y(.03, "bandpass", 2200, 4, .12);
		},
		ui() {
			v(880, .05, "triangle", .12, 1200);
		},
		buy() {
			[
				784,
				988,
				1175,
				1568
			].forEach((e, t) => v(e, .25, "triangle", .14, 0, t * .07)), y(.5, "highpass", 5e3, 1, .08, 9e3, .2);
		},
		grindIn() {
			y(.08, "bandpass", 3200, 5, .35), v(1900, .05, "square", .04);
		},
		go() {
			v(440, .12, "square", .07), v(880, .25, "square", .07, 0, .12);
		},
		coin() {
			v(1568, .06, "square", .05), v(2093, .09, "square", .05, 0, .04);
		},
		loot() {
			[
				1047,
				1319,
				1568
			].forEach((e, t) => v(e, .16, "triangle", .13, 0, t * .045));
		},
		token() {
			[
				784,
				1047,
				1319,
				1568,
				2093
			].forEach((e, t) => v(e, .3, "triangle", .13, 0, t * .06)), y(.6, "highpass", 6e3, 1, .1, 1e4, .15);
		},
		boost() {
			v(220, .5, "sawtooth", .09, 880), y(.5, "bandpass", 600, 1, .25, 4e3);
		},
		magnet() {
			v(300, .35, "sine", .2, 600), v(450, .35, "sine", .12, 900, .05);
		},
		pause() {
			v(660, .08, "triangle", .1, 440);
		}
	}, x = 60 / 96 / 2, S = [
		57,
		53,
		48,
		55
	], C = [
		[
			0,
			3,
			7
		],
		[
			0,
			4,
			7
		],
		[
			0,
			4,
			7
		],
		[
			0,
			4,
			7
		]
	], w = (e) => 440 * 2 ** ((e - 69) / 12);
	function ee(e) {
		let t = n.createOscillator(), r = n.createGain();
		t.frequency.setValueAtTime(140, e), t.frequency.exponentialRampToValueAtTime(42, e + .18), r.gain.setValueAtTime(.9, e), r.gain.exponentialRampToValueAtTime(.001, e + .28), t.connect(r).connect(i), t.start(e), t.stop(e + .3);
	}
	function T(e, t, r, o, s) {
		let c = n.createBufferSource();
		c.buffer = a;
		let l = n.createBiquadFilter();
		l.type = s || "highpass", l.frequency.value = r;
		let u = n.createGain();
		u.gain.setValueAtTime(o, e), u.gain.exponentialRampToValueAtTime(.001, e + t), c.connect(l).connect(u).connect(i), c.start(e, Math.random()), c.stop(e + t + .02);
	}
	function te(e, t, r, a, o) {
		let s = n.createOscillator(), c = n.createGain();
		s.type = a, s.frequency.value = w(t), c.gain.setValueAtTime(0, e), c.gain.linearRampToValueAtTime(o, e + .02), c.gain.exponentialRampToValueAtTime(.001, e + r), s.connect(c).connect(i), s.start(e), s.stop(e + r + .05);
	}
	function ne() {
		if (n && m) for (; u < n.currentTime + .25;) {
			let e = u, t = d % 16, n = Math.floor(d / 16) % 4, r = S[n];
			if ((t === 0 || t === 7 || t === 10) && ee(e), (t === 4 || t === 12) && (T(e, .16, 1400, .35, "bandpass"), T(e, .09, 4e3, .15)), t % 2 == 0 && T(e, .04, 8e3, t % 4 == 2 ? .09 : .05), (t === 0 || t === 3 || t === 8 || t === 11 || t === 14) && te(e, r - 24 + (t === 14 ? 7 : 0), x * 1.8, "triangle", .32), t === 0) for (let t of C[n]) te(e, r + t, x * 14, "sine", .05);
			(t === 6 || t === 13) && te(e, r + 12 + C[n][(d >> 4) % 3], x * 1.2, "triangle", .04), u += x * (t % 2 == 0 ? 1.08 : .92), d++;
		}
	}
	function re() {
		n && !m && (m = !0, u = n.currentTime + .05, d = 0, clearInterval(l), l = setInterval(ne, 60));
	}
	function E() {
		m = !1, clearInterval(l);
	}
	return {
		unlock: g,
		loops: _,
		SFX: new Proxy(b, { get: (e, t) => (...r) => {
			n && !p && e[t] && e[t](...r);
		} }),
		startMusic: re,
		stopMusic: E,
		setMuted(e) {
			p = e, r && (r.gain.value = e ? 0 : .8);
		},
		setMusic(e) {
			f = e, i && i.gain.setTargetAtTime(e ? .55 : 0, n.currentTime, .1);
		},
		suspend() {
			n && n.state === "running" && n.suspend().catch(() => {});
		},
		resume() {
			n && n.state === "suspended" && n.resume().catch(() => {});
		},
		dispose() {
			if (E(), n) try {
				n.close();
			} catch {}
			n = null;
		},
		get muted() {
			return p;
		},
		get music() {
			return f;
		}
	};
}
//#endregion
//#region 2d/src/rewards.js
var J = null;
function Ge() {
	let e = je("device", null);
	return typeof e == "string" && /^[0-9a-f-]{36}$/i.test(e) ? e : (e = J || Ke(), J = e, Me("device", e), e);
}
function Ke() {
	if (typeof crypto < "u" && crypto.randomUUID) return crypto.randomUUID();
	let e = /* @__PURE__ */ new Uint8Array(16);
	(crypto || window.msCrypto).getRandomValues(e), e[6] = e[6] & 15 | 64, e[8] = e[8] & 63 | 128;
	let t = [...e].map((e) => e.toString(16).padStart(2, "0")).join("");
	return `${t.slice(0, 8)}-${t.slice(8, 12)}-${t.slice(12, 16)}-${t.slice(16, 20)}-${t.slice(20)}`;
}
var qe = (e) => btoa(unescape(encodeURIComponent(e))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""), Je = (e) => decodeURIComponent(escape(atob(e.replace(/-/g, "+").replace(/_/g, "/"))));
function Ye({ seed: e, score: t, ref: n, name: r, run: i, shopUrl: a = "/" }) {
	let o = new URL(a, location.href);
	return o.search = "?play=1", o.hash = "rs=" + qe(JSON.stringify({
		v: 3,
		s: e >>> 0,
		sc: Math.round(t) || 0,
		n: r || void 0,
		r: n || void 0,
		run: i || void 0
	})), o.href;
}
function Xe(e = location.hash) {
	if (!e || e.indexOf("#rs=") !== 0) return null;
	try {
		let t = JSON.parse(Je(e.slice(4)));
		return !t || t.v !== 2 && t.v !== 3 || !(t.s >>> 0) ? null : {
			s: t.s >>> 0,
			sc: Number(t.sc) || 0,
			n: t.n ? String(t.n).slice(0, 12) : null,
			r: t.r ? String(t.r).slice(0, 40) : null,
			run: t.run ? String(t.run).slice(0, 40) : null
		};
	} catch {
		return null;
	}
}
async function Ze(e, t, n = "/") {
	if (e === !1) return {
		ok: !1,
		reason: "disabled"
	};
	try {
		if (typeof e == "function") return await e(t), { ok: !0 };
		let r = new URL(n, location.href), i = await (await fetch(new URL("/form/token.php", r).href, { credentials: "same-origin" })).text(), a = new URLSearchParams({
			n: t,
			"com[newsletter_form_do_not_fill]": "",
			"com[secureTokenNewsletterForm]": i.trim()
		});
		return await fetch(new URL("/newsletter.php", r).href, {
			method: "POST",
			body: a,
			credentials: "same-origin",
			redirect: "manual"
		}), { ok: !0 };
	} catch (e) {
		return {
			ok: !1,
			reason: String(e && e.message || e)
		};
	}
}
//#endregion
//#region 2d/src/rewards-supabase.js
function Qe({ url: e, anonKey: t, fetchImpl: n, timeoutMs: r = 8e3 } = {}) {
	if (!e) throw Error("createSupabaseServer : url requise");
	let i = e.replace(/\/$/, "") + "/functions/v1/", a = n || ((...e) => fetch(...e)), o = t ? {
		apikey: t,
		Authorization: "Bearer " + t
	} : {};
	async function s(e, { body: t, query: n } = {}) {
		let s = typeof AbortController < "u" ? new AbortController() : null, c = setTimeout(() => s && s.abort(), r);
		try {
			let r = n ? "?" + new URLSearchParams(Object.entries(n).filter(([, e]) => e != null && e !== "")).toString() : "", c = await a(i + e + r, t ? {
				method: "POST",
				headers: {
					...o,
					"Content-Type": "application/json"
				},
				body: JSON.stringify(t),
				signal: s && s.signal
			} : {
				method: "GET",
				headers: o,
				signal: s && s.signal
			}), l = await c.json().catch(() => ({}));
			return !c.ok && !l.reason && (l.reason = "http_" + c.status), l;
		} finally {
			clearTimeout(c);
		}
	}
	return {
		kind: "supabase",
		runStart: ({ device_id: e, mode: t, referrer: n, seed: r }) => s("run-start", { body: {
			device_id: e,
			mode: t,
			...n ? { referrer: n } : {},
			...r ? { seed: r } : {}
		} }),
		runFinish: ({ run_id: e, device_id: t, proof: n }) => s("run-finish", { body: {
			run_id: e,
			device_id: t,
			proof: n
		} }),
		pseudo: ({ device_id: e, pseudo: t }) => s("pseudo", { body: {
			device_id: e,
			pseudo: t
		} }),
		claim: ({ run_id: e, device_id: t, email: n, newsletter: r, reward: i }) => s("claim", { body: {
			run_id: e,
			device_id: t,
			email: n,
			consent_rules: !0,
			newsletter: !!r,
			reward: i
		} }),
		leaderboard: ({ period: e, device_id: t }) => s("leaderboard", { query: {
			period: e,
			device_id: t
		} }),
		ghost: ({ run_id: e, ref: t, device_id: n, best: r }) => s("ghost", { query: e ? { run_id: e } : t ? {
			ref: t,
			best: 1
		} : {
			device_id: n,
			best: r ? 1 : null
		} }),
		drawInfo: ({ device_id: e } = {}) => s("draw-info", { query: { device_id: e } }),
		keepalive: () => s("keepalive", {})
	};
}
//#endregion
//#region src/data/catalog.js
var Y = (e) => String(e).replace(",", ".").replace(/["″]/g, "").replace(/\s*mm$/, "").trim().toUpperCase();
function $e(e) {
	return e.slot === "top" || e.slot === "pack" && e.cart_field === "prodVar[1-1]" && e.sizes.some((e) => /^X?S$|^M$|^X*L$/.test(e.label)) && !["helmet", "knees"].includes(e.slot) ? "top" : e.slot === "bottom" ? "bottom" : e.slot === "feet" ? "shoe" : [
		"helmet",
		"knees",
		"elbows",
		"wrists"
	].includes(e.slot) ? "protect" : e.slot === "deck" || e.gabarit === "complete" ? "deck" : e.slot === "trucks" ? "axle" : null;
}
var et = {
	XS: "36",
	S: "38",
	M: "40",
	L: "42",
	XL: "44",
	XXL: "46"
}, tt = {
	"7.75": "139",
	"8.0": "139",
	8: "139",
	"8.25": "149",
	"8.5": "149"
};
function nt(e, t) {
	let n = t.sizes || {}, r = $e(e);
	if (e.slot === "pack" && e.sizes.length && e.sizes.every((e) => /^[SML]$/.test(e.label)) && (r = "protect"), !r) return e.sizes.length ? e.sizes[0].label : null;
	let i = r === "axle" ? tt[Y(n.deck || "8.25")] : n[r];
	return r === "bottom" && i && !/^\d+$/.test(i) && e.sizes.some((e) => /^\d+$/.test(e.label)) && (i = et[i] || i), i;
}
function rt(e, t) {
	if (!e.sizes.length) return {
		size: null,
		exact: !0,
		available: !0
	};
	let n = nt(e, t), r = e.sizes.map((e) => Y(e.label)), i = n == null ? -1 : r.indexOf(Y(n));
	if (i < 0 && e.sizes.length === 1 && (i = 0), i < 0) {
		let t = parseFloat(Y(n || ""));
		if (isNaN(t)) i = Math.floor(e.sizes.length / 2);
		else {
			let e = 0, n = Infinity;
			r.forEach((r, i) => {
				let a = Math.abs(parseFloat(r) - t);
				a < n && (n = a, e = i);
			}), i = e;
		}
	}
	if (e.sizes[i].stock > 0) return {
		size: e.sizes[i],
		exact: Y(e.sizes[i].label) === Y(n || e.sizes[i].label),
		available: !0
	};
	for (let t = 1; t < e.sizes.length; t++) for (let n of [i + t, i - t]) if (e.sizes[n] && e.sizes[n].stock > 0) return {
		size: e.sizes[n],
		exact: !1,
		available: !0,
		wanted: e.sizes[i].label
	};
	return {
		size: e.sizes[i],
		exact: !1,
		available: !1,
		wanted: e.sizes[i].label
	};
}
//#endregion
//#region src/shop-bridge.js
function it({ catalog: e, shopUrl: t = "/", mode: n, onAdd: r } = {}) {
	let i = location.hostname, a = /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(i) || i.endsWith(".local"), o = n ? n === "live" : !a, s = new URL(t, location.href), c = new URL("/panier.php?ajax", s).href, l = je("cart-journal", []), u = Promise.resolve();
	function d(...e) {
		console.info("[respawn:panier]", ...e);
	}
	async function f(e, t, n = 1) {
		let r = new FormData();
		if (r.append("id_prod", String(e.id)), r.append("nb_prod", String(n)), e.cart_field && t && t.variation_id != null && r.append(e.cart_field, String(t.variation_id)), !o) return d("(factice)", "POST", c, Object.fromEntries(r.entries())), await new Promise((e) => setTimeout(e, 250)), !0;
		let i = await fetch(c, {
			method: "POST",
			body: r,
			credentials: "same-origin",
			redirect: "follow",
			headers: { "X-Requested-With": "XMLHttpRequest" }
		}), a = i.ok ? (await i.text()).trim() : "";
		return a === "1" || (d("refusé", i.status, a.slice(0, 120)), !1);
	}
	function p(t, n, i) {
		let a = e.byId.get(Number(t));
		if (!a) return Promise.resolve({
			ok: !1,
			reason: "unknown"
		});
		let s = null, c = null;
		if (a.sizes.length && (n != null && (s = a.sizes.find((e) => String(e.label) === String(n)) || null), !s || s.stock <= 0)) {
			let e = rt(a, i || { sizes: {} });
			if (!e.available) return Promise.resolve({
				ok: !1,
				reason: "out_of_stock",
				product: a
			});
			s && s.label !== e.size.label ? c = {
				want: s.label,
				got: e.size.label
			} : !e.exact && e.wanted && (c = {
				want: e.wanted,
				got: e.size.label
			}), s = e.size;
		}
		let d = u.then(async () => {
			try {
				let e = await f(a, s);
				if (e) {
					l.push({
						id: a.id,
						name: a.name,
						size: s ? s.label : null,
						price: a.price_ttc,
						at: Date.now()
					}), Me("cart-journal", l.slice(-50));
					try {
						r && r({
							id: a.id,
							name: a.name,
							size: s ? s.label : null,
							price: a.price_ttc,
							mock: !o
						});
					} catch {}
				}
				return {
					ok: e,
					reason: e ? null : "refused",
					product: a,
					size: s && s.label,
					swapped: c,
					mock: !o
				};
			} catch (e) {
				return {
					ok: !1,
					reason: "network",
					product: a,
					error: String(e)
				};
			}
		});
		return u = d.catch(() => {}), d;
	}
	async function m(e, t) {
		let n = [];
		for (let r of e) {
			let e = typeof r == "object" ? r.id : r, i = typeof r == "object" ? r.size : null;
			n.push(await p(e, i, t));
		}
		return n;
	}
	function h() {
		return l.slice();
	}
	return {
		addToCart: p,
		addLookToCart: m,
		getCartContents: h,
		cartUrl: () => new URL("/p/cart.html", s).href,
		live: o
	};
}
//#endregion
//#region 2d/src/main.js
var at = () => !!je("exited", !1), ot = () => Me("exited", !1), st = "2d-2", ct = {
	top: [
		"XS",
		"S",
		"M",
		"L",
		"XL",
		"XXL"
	],
	bottom: [
		"36",
		"38",
		"40",
		"42",
		"44",
		"46"
	],
	shoe: [
		"36",
		"37",
		"38",
		"39",
		"40",
		"41",
		"42",
		"43",
		"44",
		"45",
		"46"
	],
	protect: [
		"S",
		"M",
		"L"
	],
	deck: [
		"7.75",
		"8",
		"8.25",
		"8.5"
	]
}, lt = {
	v: 1,
	gender: "f",
	skin: 0,
	wear: {
		head: 11,
		top: 4,
		bottom: 8,
		feet: 14,
		deck: 20,
		wheels: 24
	},
	sizes: {
		top: "M",
		bottom: "40",
		shoe: "40",
		protect: "M",
		deck: "8.25"
	},
	best: 0,
	unlocked: [],
	muted: !1,
	music: !0,
	pid: "",
	rotateOk: !1,
	mode: "daily",
	bestRun: null,
	streak: 0,
	email: "",
	pseudo: "",
	tickets: 0
}, ut = [
	{
		k: "head",
		ids: () => O.products.filter((e) => e.slot === "head").map((e) => e.id),
		none: !0
	},
	{
		k: "top",
		ids: () => pt("top")
	},
	{
		k: "bottom",
		ids: () => pt("bottom")
	},
	{
		k: "feet",
		ids: () => dt("feet")
	},
	{
		k: "deck",
		ids: () => dt("deck")
	},
	{
		k: "wheels",
		ids: () => dt("wheels")
	},
	{
		k: "protect",
		multi: M,
		ids: () => O.products.filter((e) => M.includes(e.slot)).map((e) => e.id)
	},
	{
		k: "mount",
		multi: N,
		ids: () => O.products.filter((e) => N.includes(e.slot)).map((e) => e.id)
	},
	{
		k: "looks",
		pack: !0,
		ids: () => dt("pack")
	}
];
function dt(e) {
	return O.products.filter((t) => t.slot === e).map((e) => e.id);
}
var ft = null;
function pt(e) {
	let t = ft && ft.gender === "m" ? "men" : "women";
	return O.products.filter((t) => t.slot === e).sort((e, n) => (n.gender === t) - (e.gender === t)).map((e) => e.id);
}
var mt = {
	sound: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 9v6h4l5 4V5L8 9z\" fill=\"currentColor\"/><path d=\"M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12\"/></svg>",
	mute: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 9v6h4l5 4V5L8 9z\" fill=\"currentColor\"/><path d=\"M16 9l6 6M22 9l-6 6\"/></svg>",
	shop: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linejoin=\"round\"><path d=\"M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z\"/><path d=\"M9 8V6a3 3 0 0 1 6 0v2\"/></svg>",
	pause: "<svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><rect x=\"6\" y=\"5\" width=\"4\" height=\"14\" rx=\"1\"/><rect x=\"14\" y=\"5\" width=\"4\" height=\"14\" rx=\"1\"/></svg>",
	play: "<svg viewBox=\"0 0 20 20\"><path d=\"M5 3l11 7-11 7z\" fill=\"currentColor\"/></svg>",
	lock: "<svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M7 10V7a5 5 0 0 1 10 0v3h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zm2 0h6V7a3 3 0 0 0-6 0z\"/></svg>",
	logo: "<svg viewBox=\"0 0 64 64\" aria-hidden=\"true\"><path d=\"M20 3h24l17 17v24L44 61H20L3 44V20z\" fill=\"#C8FF2E\" stroke=\"#141416\" stroke-width=\"3\"/><path d=\"M22 47V17h13.5c6.5 0 10.5 3.6 10.5 9.3 0 4.2-2.3 7.2-6.1 8.4L46.5 47h-7.6l-5.8-11.4H29V47zm7-17.3h6c2.6 0 4-1.3 4-3.4s-1.4-3.4-4-3.4h-6z\" fill=\"#141416\"/></svg>"
};
function ht() {
	try {
		if (document.fonts && document.fonts.check("12px Anton") && document.fonts.check("12px \"Space Grotesk\"")) return Promise.resolve();
		if (!document.querySelector("link[data-respawn-fonts]")) {
			let e = document.createElement("link");
			e.rel = "stylesheet", e.dataset.respawnFonts = "1", e.href = "https://fonts.googleapis.com/css2?family=Anton&family=Space+Grotesk:wght@400;600;700&display=swap", document.head.appendChild(e);
		}
		return Promise.all([document.fonts.load("40px Anton"), document.fonts.load("700 14px \"Space Grotesk\"")]).catch(() => {});
	} catch {
		return Promise.resolve();
	}
}
async function gt(n, a = {}) {
	let o = a.shopUrl || "/", s = a.vestiaire ? "vestiaire" : a.tryOn ? "tryOn" : "home", c = new URLSearchParams(location.search), l = !!a.autopilot || c.has("auto"), u = null, d = null, f = !1;
	a.overlay || !n ? (u = document.createElement("div"), u.className = "rs-layer rs-layer-2d", u.setAttribute("role", "region"), u.setAttribute("aria-label", "Respawn Skate Co."), Object.assign(u.style, {
		position: "fixed",
		inset: "0",
		zIndex: String(a.zIndex || 2147483e3),
		background: "#141416"
	}), (n || document.body).appendChild(u), n = u, d = document.documentElement.style.overflow, document.documentElement.style.overflow = "hidden") : getComputedStyle(n).position === "static" && (n.style.position = "relative");
	let p = document.createElement("div");
	Object.assign(p.style, {
		position: "absolute",
		inset: "0"
	}), n.appendChild(p);
	let m = p.attachShadow ? p.attachShadow({ mode: "open" }) : p, h = ht(), g = (e, t = {}) => {
		try {
			a.onEvent && a.onEvent(e, t);
		} catch {}
		try {
			window.dispatchEvent(new CustomEvent("respawn:" + e, { detail: t }));
		} catch {}
	}, _ = je("p2d", null) || {}, v = {
		...structuredClone(lt),
		..._,
		wear: {
			...lt.wear,
			..._.wear || {}
		},
		sizes: {
			...lt.sizes,
			..._.sizes || {}
		}
	};
	v.pid || (v.pid = Math.random().toString(36).slice(2, 10)), ft = v;
	let b = () => Me("p2d", v), x = O.products.filter((e) => e.exclusive_unlock).map((e) => e.id), S = (e) => x.includes(e) && !v.unlocked.includes(e), C = () => ({ sizes: v.sizes }), w = it({
		catalog: O,
		shopUrl: o,
		mode: a.cartMode,
		onAdd: (e) => g("cartAdd", e)
	}), ee = Ge(), T = null;
	try {
		T = a.server || (a.supabase && a.supabase.url ? Qe(a.supabase) : null);
	} catch {
		T = null;
	}
	let re = (e, t) => Promise.race([Promise.resolve(e), new Promise((e, n) => setTimeout(() => n(/* @__PURE__ */ Error("timeout")), t))]), E = async (e, t, n = 6e3) => {
		if (!T || !T[e]) return null;
		try {
			return await re(T[e](t), n);
		} catch (e) {
			return {
				reason: String(e && e.message || e),
				_err: !0
			};
		}
	}, D = Xe(), k = null, A = document.createElement("div");
	A.className = "r2d", A.lang = Fe();
	let j = document.createElement("style");
	j.textContent = ":host{all:initial}.r2d{--asphalt:#141416;--beton:#2a2a2e;--beton2:#1d1d20;--acid:#c8ff2e;--cone:#ff6a1a;--craie:#f3f0e8;--craie2:#b9b5ab;--display:\"Anton\",Impact,Haettenschweiler,\"Futura Condensed ExtraBold\",\"Arial Narrow\",sans-serif;--text:\"Space Grotesk\",ui-sans-serif,system-ui,-apple-system,\"Segoe UI\",Roboto,\"Helvetica Neue\",Arial,sans-serif;background:var(--asphalt);color:var(--craie);font:15px/1.35 var(--text);-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;overscroll-behavior:none;position:absolute;top:0;bottom:0;left:0;right:0;overflow:hidden}:where(.r2d *){box-sizing:border-box;margin:0;padding:0}:where(.r2d) :where(button,select){font:inherit;color:inherit;cursor:pointer;background:0 0;border:0}.r2d :focus-visible{outline:3px solid var(--acid);outline-offset:2px}.r2d canvas.scene{touch-action:none;width:100%;height:100%;display:block;position:absolute;top:0;bottom:0;left:0;right:0}.hidden{display:none!important}.disp{font-family:var(--display);text-transform:uppercase;letter-spacing:.01em;font-weight:400}.top{top:max(12px,env(safe-area-inset-top));right:max(12px,env(safe-area-inset-right));z-index:20;align-items:center;gap:8px;display:flex;position:absolute}.chip{letter-spacing:.02em;white-space:nowrap;background:#141416c7;border:1px solid #f3f0e829;border-radius:12px;justify-content:center;align-items:center;gap:7px;min-width:42px;height:42px;padding:0 13px;font-size:13px;font-weight:700;display:flex}.chip svg{flex:none;width:19px;height:19px}.chip:hover{border-color:#f3f0e866}.chip-exit{background:var(--craie);color:#141416;border-color:var(--craie)}.chip-exit:hover{background:#fff}.chip .lbs{display:none}.brand{left:max(18px,env(safe-area-inset-left));top:max(14px,env(safe-area-inset-top));z-index:5;pointer-events:none;align-items:center;gap:10px;display:flex;position:absolute}.brand svg{filter:drop-shadow(0 2px #00000059);width:40px;height:40px}.brand b{font-family:var(--display);letter-spacing:.04em;font-size:24px;font-weight:400;line-height:.9;display:block}.brand span{letter-spacing:.32em;color:var(--acid);margin-top:3px;font-size:10.5px;font-weight:700;display:block}.brand em{letter-spacing:.14em;color:var(--craie2);text-transform:uppercase;margin-top:3px;font-size:10px;font-style:normal;display:block}.panel{z-index:4;background:linear-gradient(#141416f2,#111113f7);border-left:1px solid #f3f0e814;flex-direction:column;width:min(480px,47vw);animation:.45s cubic-bezier(.2,.9,.25,1) slideIn;display:flex;position:absolute;top:0;bottom:0;right:0}@keyframes slideIn{0%{opacity:0;transform:translate(40px)}to{opacity:1;transform:none}}.panel-scroll{touch-action:pan-y;scrollbar-width:thin;scrollbar-color:#333 transparent;flex:1;padding:70px 22px 10px;overflow-y:auto}.kicker{letter-spacing:.26em;color:var(--acid);text-transform:uppercase;font-size:11px;font-weight:700}.panel h1{font-family:var(--display);text-transform:uppercase;margin:6px 0 14px;font-size:38px;font-weight:400;line-height:.95}.panel h1 i{color:var(--acid);font-style:normal}.lead{color:var(--craie2);margin:-6px 0 14px;font-size:13px}.row{flex-wrap:wrap;align-items:center;gap:10px;margin:0 0 14px;display:flex}.seg{background:#1d1d20;border:1px solid #f3f0e814;border-radius:999px;padding:3px;display:flex}.seg button{color:var(--craie2);border-radius:999px;min-height:36px;padding:8px 16px;font-size:13px;font-weight:700}.seg button.on{background:var(--craie);color:#141416}.skins{gap:8px;margin-left:auto;display:flex}.skins button{border:2.5px solid #0000;border-radius:50%;width:32px;height:32px;box-shadow:0 0 0 1.5px #f3f0e833}.skins button.on{border-color:var(--acid)}.sizes{background:#1a1a1d;border:1px solid #f3f0e814;border-radius:14px;margin:0 0 16px;padding:10px 12px 12px}.sizes summary{cursor:pointer;letter-spacing:.2em;text-transform:uppercase;color:var(--craie);justify-content:space-between;align-items:center;min-height:30px;font-size:12px;font-weight:800;list-style:none;display:flex}.sizes summary::-webkit-details-marker{display:none}.sizes summary small{letter-spacing:0;text-transform:none;color:var(--acid);font-size:12px;font-weight:600}.sizes .grid{grid-template-columns:repeat(5,1fr);gap:6px;margin-top:8px;display:grid}.sizes label{letter-spacing:.12em;text-transform:uppercase;color:var(--craie2);flex-direction:column;gap:4px;font-size:10px;font-weight:700;display:flex}.sizes select{height:36px;color:var(--craie);letter-spacing:0;-webkit-appearance:auto;appearance:auto;background:#26262a;border:1px solid #f3f0e826;border-radius:8px;padding:0 6px;font-size:14px;font-weight:700}.sizes p{color:var(--craie2);margin-top:8px;font-size:11.5px}.slot{margin:0 0 13px}.slot-h{justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:7px;display:flex}.slot-h b{letter-spacing:.24em;color:var(--craie2);text-transform:uppercase;white-space:nowrap;font-size:11px;font-weight:700}.slot-h span{color:var(--craie);opacity:.8;white-space:nowrap;text-overflow:ellipsis;font-size:12px;overflow:hidden}.slot-h span.warn{color:var(--cone);opacity:1}.slot-h span.ok{color:var(--acid);opacity:1}.chips{grid-template-columns:repeat(4,1fr);gap:7px;display:grid}.chipp{text-align:left;background:#1d1d20;border:1.5px solid #f3f0e812;border-radius:12px;flex-direction:column;align-items:flex-start;gap:3px;min-height:96px;padding:6px 8px 8px;transition:transform .15s,border-color .15s,background .15s;display:flex;position:relative}.chipp:hover{border-color:#f3f0e838;transform:translateY(-2px)}.chipp.on{border-color:var(--acid);background:#23261a;box-shadow:0 0 0 3px #c8ff2e1f}.chipp canvas{border-radius:9px;align-self:center;width:46px;height:46px;margin-bottom:2px}.chipp .nm{-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:11px;font-weight:700;line-height:1.12;display:-webkit-box;overflow:hidden}.chipp .pr{color:var(--craie2);font-variant-numeric:tabular-nums;font-size:11.5px}.chipp.on .pr{color:var(--acid)}.chipp .bd{letter-spacing:.1em;text-transform:uppercase;border-radius:4px;padding:2px 4px;font-size:8px;font-weight:800;position:absolute;top:5px;right:5px}.chipp .lock{color:#141416;background:#ffd54a;border-radius:5px;place-items:center;width:18px;height:18px;display:grid;position:absolute;top:5px;left:5px}.chipp .lock svg{width:12px;height:12px}.chipp.none .ph{background:repeating-linear-gradient(45deg,#2a2a2e 0 4px,#1d1d20 4px 8px);border-radius:50%;align-self:center;width:44px;height:44px}.bd.drop{background:var(--cone);color:#141416}.bd.limited{background:var(--craie);color:#141416}.bd.new{background:var(--acid);color:#141416}.panel-foot{padding:12px 22px max(16px,env(safe-area-inset-bottom));background:#141416;border-top:1px solid #f3f0e814}.total{color:var(--craie2);justify-content:space-between;align-items:baseline;margin-bottom:10px;font-size:13px;display:flex}.total b{color:var(--craie);font-size:15px}.total .eur{font-family:var(--display);color:var(--acid);letter-spacing:.02em;font-size:26px}.ctas{grid-template-columns:1fr 1fr;gap:10px;display:grid}.btn{min-height:52px;font-family:var(--display);letter-spacing:.04em;text-transform:uppercase;text-align:center;border-radius:12px;justify-content:center;align-items:center;gap:8px;padding:0 14px;font-size:19px;line-height:1;transition:transform .12s,filter .12s,background .2s;display:flex}.btn:active{transform:scale(.97)}.btn svg{flex:none;width:18px;height:18px}.btn-buy{color:var(--craie);border:2px solid var(--cone)}.btn-buy:hover{background:#ff6a1a1f}.btn-buy.ok{background:var(--cone);color:#141416}.btn-ride{background:var(--acid);color:#141416;box-shadow:0 6px #6d8f0d,0 10px 24px #c8ff2e40}.btn-ride:hover{filter:brightness(1.07)}.btn-ghost{border:2px solid #f3f0e840}.btn-ghost:hover{border-color:var(--craie)}.btn-sm{border-radius:10px;min-height:38px;padding:0 12px;font-size:15px}.keys{left:max(18px,env(safe-area-inset-left));bottom:max(14px,env(safe-area-inset-bottom));z-index:3;color:var(--craie2);pointer-events:none;max-width:calc(100% - min(480px,47vw) - 40px);font-size:12px;position:absolute}.hud{pointer-events:none;z-index:3;position:absolute;top:0;bottom:0;left:0;right:0}.h-score{left:max(18px,env(safe-area-inset-left));top:max(14px,env(safe-area-inset-top));position:absolute}.h-score small{letter-spacing:.3em;color:var(--acid);font-size:10.5px;font-weight:700;display:block}.h-score b{font-family:var(--display);font-variant-numeric:tabular-nums;text-shadow:0 3px #00000073;font-size:44px;font-weight:400;line-height:1;display:block}.h-loot{background:#141416b3;border:1px solid #f3f0e826;border-radius:999px;align-items:center;gap:6px;margin-top:6px;padding:4px 10px 4px 8px;font-size:14px;font-weight:800;display:inline-flex}.h-loot svg{width:16px;height:16px}.h-loot.bump{animation:.4s bump}@keyframes bump{40%{background:var(--acid);color:#141416;transform:scale(1.3)}}.h-time{left:50%;top:max(16px,env(safe-area-inset-top));align-items:center;gap:10px;display:flex;position:absolute;transform:translate(-50%)}.h-time .bar{background:#1414168c;border-radius:9px;width:min(240px,26vw);height:8px;overflow:hidden;box-shadow:inset 0 0 0 1px #f3f0e826}.h-time i{background:linear-gradient(90deg,var(--cone),var(--acid));transform-origin:0;border-radius:9px;width:100%;height:100%;display:block}.h-time b{font-family:var(--display);font-variant-numeric:tabular-nums;text-shadow:0 2px #0006;min-width:34px;font-size:26px;font-weight:400}.h-time b.low{color:var(--cone)}.combo{left:50%;top:max(56px,calc(env(safe-area-inset-top) + 42px));text-align:center;width:min(70vw,720px);transition:opacity .25s,transform .35s;position:absolute;transform:translate(-50%)}.combo .names{letter-spacing:.06em;text-shadow:0 2px #00000080;white-space:nowrap;text-overflow:ellipsis;text-transform:uppercase;font-size:12.5px;font-weight:700;overflow:hidden}.combo .pts{font-family:var(--display);text-shadow:0 3px #00000073;font-size:32px;line-height:1.05}.combo .pts span{color:var(--acid);margin-left:6px}.combo.idle{opacity:0;transform:translate(-50%)translateY(-8px)}.combo.bank .pts{color:var(--acid)}.combo.lost .pts{color:var(--cone);text-decoration:line-through}.speedo{right:max(18px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));background:conic-gradient(from 225deg,var(--acid) calc(var(--p,0)*270deg),#f3f0e81f 0 270deg,transparent 0);filter:drop-shadow(0 4px 10px #0006);border-radius:50%;place-items:center;width:112px;height:112px;display:grid;position:absolute}.speedo:before{content:\"\";background:#141416e0;border-radius:50%;position:absolute;top:9px;bottom:9px;left:9px;right:9px}.speedo div{text-align:center;line-height:1;position:relative}.speedo b{font-family:var(--display);font-variant-numeric:tabular-nums;font-size:38px;font-weight:400;display:block}.speedo small{letter-spacing:.2em;color:var(--craie2);font-size:10px;font-weight:800}.speedo.hot b{color:var(--cone)}.fx{right:max(140px,calc(env(safe-area-inset-right) + 140px));bottom:max(22px,env(safe-area-inset-bottom));gap:6px;display:flex;position:absolute}.fx span{letter-spacing:.08em;background:var(--cone);color:#141416;border-radius:999px;padding:5px 10px;font-size:12px;font-weight:800}.fx span.mag{background:#b9a6ff}.tuto{left:50%;bottom:max(24px,env(safe-area-inset-bottom));text-align:center;background:#141416cc;border:1px solid #f3f0e824;border-radius:12px;max-width:min(560px,60vw);padding:10px 16px;font-size:14px;font-weight:600;transition:opacity .3s,transform .3s;position:absolute;transform:translate(-50%)}.tuto.off{opacity:0;transform:translate(-50%)translateY(10px)}.tuto em{color:var(--acid);font-style:normal;font-weight:800}.modal{z-index:10;background:radial-gradient(#1414168c,#141416e6);justify-content:center;align-items:center;padding:66px 16px 16px;animation:.35s fade;display:flex;position:absolute;top:0;bottom:0;left:0;right:0}@keyframes fade{0%{opacity:0}to{opacity:1}}.card{scrollbar-width:thin;scrollbar-color:#333 transparent;background:#141416;border:1px solid #f3f0e81f;border-radius:20px;width:min(620px,100%);max-height:100%;padding:24px 24px 20px;animation:.5s cubic-bezier(.2,1.4,.4,1) pop;position:relative;overflow-y:auto;box-shadow:0 30px 80px #00000080}.card:before{content:\"\";background:repeating-linear-gradient(-45deg,var(--acid) 0 14px,#141416 14px 28px);border-radius:20px 20px 0 0;height:6px;position:absolute;top:0;bottom:auto;left:0;right:0}.card.small{text-align:center;width:min(400px,100%)}@keyframes pop{0%{opacity:0;transform:scale(.88)translateY(20px)}to{opacity:1;transform:none}}.card h2{font-family:var(--display);text-transform:uppercase;margin:6px 0 12px;font-size:40px;font-weight:400;line-height:1}.card p{color:var(--craie2);margin-bottom:14px;font-size:14px}.stack{gap:10px;display:grid}.big{font-family:var(--display);font-variant-numeric:tabular-nums;margin:6px 0 2px;font-size:clamp(54px,12vw,88px);line-height:.9}.rec{letter-spacing:.2em;background:var(--acid);color:#141416;vertical-align:middle;border-radius:5px;margin-left:8px;padding:3px 8px;font-size:11px;font-weight:800;display:inline-block}.stats{grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0 10px;display:grid}.stats div{background:#1d1d20;border-radius:12px;padding:9px 12px}.stats small{letter-spacing:.18em;color:var(--craie2);text-transform:uppercase;font-size:10px;font-weight:700;display:block}.stats b{font-family:var(--display);font-variant-numeric:tabular-nums;font-size:26px;font-weight:400}.stats.bd b{color:var(--acid);font-size:22px}.note{color:var(--craie2);margin:0 0 12px;font-size:12.5px;line-height:1.45}.note b{color:var(--craie)}.sect{justify-content:space-between;align-items:center;gap:8px;margin:14px 0 6px;display:flex}.sect h3{letter-spacing:.22em;text-transform:uppercase;font-size:12px;font-weight:800}.loot{gap:8px;margin-bottom:10px;display:grid}.lootrow{background:#1d1d20;border-radius:12px;grid-template-columns:48px 1fr auto;align-items:center;gap:10px;padding:6px 8px;display:grid}.lootrow canvas{border-radius:10px;width:48px;height:48px}.lootrow .nm{font-size:13px;font-weight:700;line-height:1.2}.lootrow .nm small{color:var(--craie2);font-size:12px;font-weight:600;display:block}.lootrow .acts{gap:6px;display:flex}.lootrow.ex{box-shadow:inset 0 0 0 2px #ffd54a}.reward{box-shadow:inset 0 0 0 2px var(--tier,#ffd54a);background:#1d1d20;border-radius:12px;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:8px;padding:12px 14px;display:flex}.reward .coin{background:var(--tier);width:38px;height:38px;font-family:var(--display);color:#141416;border-radius:50%;place-items:center;font-size:18px;display:grid;box-shadow:inset 0 -4px #00000040}.reward .lbl{flex:1;min-width:140px;font-size:13px;font-weight:700}.reward .lbl small{color:var(--craie2);font-weight:600;display:block}.reward code{letter-spacing:.06em;-webkit-user-select:all;user-select:all;background:#141416;border:1px dashed #f3f0e859;border-radius:8px;padding:9px 12px;font:800 18px/1 ui-monospace,Menlo,monospace}.endbtns{z-index:2;background:#141416;grid-template-columns:1.3fr 1fr;gap:10px;margin-top:6px;padding:10px 0 12px;display:grid;position:sticky;bottom:-20px;box-shadow:0 -12px 16px #141416}.sharebtns{grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;display:grid}.shopline{color:var(--craie2);background:#1d1d20;border-radius:12px;justify-content:space-between;align-items:center;gap:10px;margin-top:12px;padding:10px 12px;font-size:13px;display:flex}.shopline b{color:var(--craie)}.toast{z-index:30;background:var(--craie);color:#141416;opacity:0;pointer-events:none;text-align:center;border-radius:12px;max-width:90%;padding:12px 18px;font-size:14px;font-weight:700;transition:all .3s;position:absolute;bottom:110px;left:50%;transform:translate(-50%)translateY(20px);box-shadow:0 10px 30px #0006}.toast.on{opacity:1;transform:translate(-50%)}kbd{min-width:22px;font:700 11px var(--text);color:inherit;text-align:center;background:#f3f0e81f;border:1px solid #f3f0e833;border-bottom-width:2.5px;border-radius:5px;padding:2px 6px;display:inline-block}.btn-ride kbd{background:#14141626;border-color:#1414164d}.challenge{background:#c8ff2e1a;border:1px solid #c8ff2e59;border-radius:12px;margin:0 0 12px;padding:10px 12px;font-size:13px;font-weight:700}.vlist{flex-wrap:wrap;gap:8px;margin:6px 0 12px;display:flex}.vlist div{text-align:center;width:76px;color:var(--craie2);flex-direction:column;align-items:center;font-size:10.5px;line-height:1.15;display:flex}.vlist canvas{border-radius:12px;width:56px;height:56px;margin-bottom:4px}@media (max-aspect-ratio:1){.panel{border-top:1px solid #f3f0e81a;border-left:0;border-radius:20px 20px 0 0;width:auto;height:57%;animation-name:slideUp;top:auto;left:0}@keyframes slideUp{0%{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}.panel-scroll{padding:16px 14px 6px}.panel h1{margin-bottom:10px;font-size:28px}.chips{touch-action:pan-x;scrollbar-width:none;grid-template-columns:none;grid-auto-columns:96px;grid-auto-flow:column;padding-bottom:4px;overflow-x:auto}.sizes .grid{grid-template-columns:repeat(3,1fr)}.panel-foot{padding:10px 14px max(12px,env(safe-area-inset-bottom))}.keys,.brand em{display:none}.btn{font-size:16px}.h-score b{font-size:32px}.brand b{font-size:19px}.brand svg{width:32px;height:32px}.chip .lbl{display:none}.chip-exit .lbs{display:inline}.speedo{width:88px;height:88px}.speedo b{font-size:28px}.fx{right:118px}.tuto{max-width:92vw;font-size:13px;bottom:120px}.combo{width:92vw;top:96px}.h-time{top:auto;bottom:max(16px,env(safe-area-inset-bottom));left:max(16px,env(safe-area-inset-left));transform:none}.h-time .bar{width:110px}}@media (max-height:520px) and (min-aspect-ratio:1){.brand em{display:none}.brand svg{width:30px;height:30px}.brand b{font-size:18px}.panel-scroll{padding:60px 14px 6px}.panel h1{margin-bottom:8px;font-size:24px}.lead{display:none}.chips{touch-action:pan-x;scrollbar-width:none;grid-template-columns:none;grid-auto-columns:92px;grid-auto-flow:column;overflow-x:auto}.chipp{min-height:84px}.chipp canvas{width:36px;height:36px}.row,.slot{margin-bottom:8px}.slot-h span{max-width:55%}.sizes .grid{grid-template-columns:repeat(5,1fr)}.sizes select{height:32px}.panel-foot{padding:8px 14px 10px}.btn{min-height:42px;font-size:16px}.keys,.chip .lbl{display:none}.chip-exit .lbs{display:inline}.h-score b{font-size:30px}.speedo{width:84px;height:84px}.speedo b{font-size:27px}.fx{right:112px}.card{padding:16px}.big{font-size:52px}.stats{margin:8px 0 6px}.card h2{font-size:30px}.modal{padding-top:58px}}@media (prefers-reduced-motion:reduce){.r2d *{transition:none!important;animation:none!important}}.h-row{flex-wrap:wrap;align-items:center;gap:8px;margin-top:6px;display:flex}.h-loot{margin-top:0}.h-loot .coin{background:#ffd54a;border-radius:50%;width:14px;height:14px;box-shadow:inset 0 -2px #c98a1a}.h-skate{gap:3px;display:inline-flex}.h-skate i{font-style:normal;font-family:var(--display);color:#f3f0e859;background:#141416b3;border:1px solid #f3f0e826;border-radius:5px;place-items:center;width:21px;height:24px;font-size:15px;display:grid}.h-skate i.on{background:var(--acid);color:#141416;border-color:var(--acid)}.h-ghost{color:#b9e8ff;background:#b9e8ff29;border:1px solid #b9e8ff59;border-radius:999px;margin-top:6px;padding:3px 9px;font-size:12px;font-weight:800;display:inline-block}.h-ghost.ahead{color:var(--acid);background:#c8ff2e1a;border-color:#c8ff2e66}.drawbox{background:#1a1a1d;border:1px solid #ffd54a4d;border-radius:14px;align-items:center;gap:12px;margin:0 0 14px;padding:10px 12px;display:flex}.drawbox img{object-fit:cover;background:#e4dfd3;border-radius:10px;width:52px;height:52px}.drawbox .txt{min-width:0;color:var(--craie2);flex-direction:column;flex:1;gap:2px;font-size:12.5px;display:flex}.drawbox .txt small{letter-spacing:.2em;text-transform:uppercase;color:#ffd54a;font-size:10px;font-weight:800}.drawbox .txt b{color:var(--craie);font-size:14px}.drawbox .lw{font-size:11.5px}.streak{font-family:var(--display);color:var(--cone);align-items:center;gap:2px;font-size:22px;display:flex}.streak i svg{width:26px;height:26px;animation:1.2s ease-in-out infinite alternate flame;display:block}@keyframes flame{to{transform:scale(1.12)rotate(-4deg)}}.rewards{gap:8px;margin-bottom:8px;display:grid}.reward canvas{border-radius:9px;width:42px;height:42px}.reward .claim,.reward .codeview{flex-basis:100%}.claim{gap:8px;margin-top:4px;display:grid}.claim input[type=email],.claim input[type=text]{height:44px;color:var(--craie);font:600 15px var(--text);-webkit-user-select:text;user-select:text;background:#141416;border:1px solid #f3f0e840;border-radius:10px;padding:0 12px}.chk{color:var(--craie);cursor:pointer;align-items:flex-start;gap:9px;font-size:13px;line-height:1.35;display:flex}.chk input{width:20px;height:20px;accent-color:var(--acid);flex:none;margin-top:1px}.chk a{color:var(--acid)}.err{color:var(--cone);min-height:0;font-size:12.5px;font-weight:700}.codeview{gap:8px;display:grid}.cv-top,.cv-acts{flex-wrap:wrap;align-items:center;gap:8px;display:flex}.ticketfx{color:#141416;background:#ffd54a;border-radius:999px;margin:0 0 10px;padding:6px 12px;font-size:14px;font-weight:900;animation:1.2s cubic-bezier(.2,1.6,.4,1) tick;display:inline-block}@keyframes tick{0%{opacity:0;transform:scale(.3)rotate(-10deg)}60%{opacity:1;transform:scale(1.15)rotate(3deg)}to{transform:none}}.lblist{gap:4px;margin:10px 0;list-style:none;display:grid}.lblist li{background:#1d1d20;border-radius:10px;grid-template-columns:48px 1fr auto;align-items:center;gap:8px;padding:8px 12px;font-size:14px;display:grid}.lblist li.me{box-shadow:inset 0 0 0 2px var(--acid);background:#23261a}.lblist .rk{font-family:var(--display);color:var(--craie2);font-size:18px}.lblist .ps{text-overflow:ellipsis;white-space:nowrap;font-weight:700;overflow:hidden}.lblist .ps em{background:var(--cone);color:#141416;border-radius:4px;margin-left:6px;padding:2px 5px;font-size:10px;font-style:normal;font-weight:800}.lblist b{font-family:var(--display);font-variant-numeric:tabular-nums;font-size:20px;font-weight:400}.lb .seg,.card>.seg{margin-bottom:6px}.pseudobox{box-shadow:inset 0 0 0 2px var(--acid);background:#1d1d20;border-radius:12px;margin:10px 0;padding:12px 14px}.pseudobox h3{letter-spacing:.2em;text-transform:uppercase;font-size:12px;font-weight:800}.lblist .ps em.medal{vertical-align:-2px;background:#e7a06a;border-radius:50%;width:14px;height:14px;padding:0;display:inline-block;box-shadow:inset 0 -2px #00000040}.lblist .ps em.medal.gold{background:#ffd54a}.lblist .ps em.medal.silver{background:#dde3ea}.lblist .ps em.medal.bronze{background:#e7a06a}", m.append(j, A);
	let M = (e, t = {}, ...n) => {
		let r = document.createElement(e);
		for (let [e, n] of Object.entries(t)) e === "class" ? r.className = n : e === "html" ? r.innerHTML = n : e.startsWith("on") ? r.addEventListener(e.slice(2).toLowerCase(), n) : n != null && n !== !1 && r.setAttribute(e, n === !0 ? "" : n);
		for (let e of n.flat()) e != null && e !== !1 && r.append(e);
		return r;
	}, N = M("canvas", {
		class: "scene",
		"aria-label": "Respawn Street Run"
	}), L = M("div", {
		class: "brand",
		html: mt.logo + "<div><b>RESPAWN</b><span>SKATE CO.</span><em>Street Run</em></div>"
	}), ae = M("div", { class: "top" }), se = M("div", {
		class: "toast",
		role: "status",
		"aria-live": "polite"
	});
	A.append(N, L, ae, se);
	let ce = 0;
	function R(e, t = 2600) {
		se.textContent = e, se.classList.add("on"), clearTimeout(ce), ce = setTimeout(() => se.classList.remove("on"), t);
	}
	let z = We({
		muted: v.muted,
		music: v.music
	}), le = (e, t = 56) => {
		let n = document.createElement("canvas"), r = Math.min(window.devicePixelRatio || 1, 2);
		n.width = n.height = Math.round(t * r);
		let i = n.getContext("2d");
		i.scale(t * r / 100, t * r / 100);
		let a = i.createLinearGradient(0, 0, 0, 100);
		a.addColorStop(0, "#ECE8DE"), a.addColorStop(1, "#CFC9BC"), i.fillStyle = a, i.beginPath(), i.roundRect ? i.roundRect(0, 0, 100, 100, 18) : i.rect(0, 0, 100, 100), i.fill();
		let o = O.byId.get(e);
		return o && (i.translate(8, 8), i.scale(.84, .84), ne(i, o, ie(o), O.byId)), n;
	}, ue = 0, B = Ue(N, {
		audio: z,
		autopilot: l,
		hooks: {
			onTick: pt,
			onCombo: gt,
			onHint: vt,
			onEnd: kt,
			onCollect: bt
		}
	}), de = () => B.setLook(F(v, s === "vestiaire" && X === "vest" ? ue : 0)), pe = M("button", {
		class: "chip",
		onClick: () => Ie(Fe() === "fr" ? "en" : "fr")
	}), me = M("button", {
		class: "chip",
		onClick: () => {
			v.muted = !v.muted, z.setMuted(v.muted), z.unlock(), b(), _e();
		}
	}), he = M("button", {
		class: "chip hidden",
		"aria-label": G("pause"),
		html: mt.pause,
		onClick: () => Tt()
	}), ge = M("a", {
		class: "chip chip-exit",
		href: o,
		onClick: (e) => {
			e.preventDefault(), ve();
		}
	});
	ae.append(pe, me, he, ge);
	function _e() {
		pe.textContent = G("lang"), pe.setAttribute("aria-label", Fe() === "fr" ? "English" : "Français"), me.innerHTML = (v.muted ? mt.mute : mt.sound) + "<span class=\"lbl\">" + G(v.muted ? "soundOff" : "soundOn") + "</span>", me.setAttribute("aria-pressed", String(!v.muted)), he.setAttribute("aria-label", G("pause"));
		let e = s === "vestiaire" ? "exitCart" : s === "tryOn" ? "exitProduct" : "exit";
		ge.innerHTML = mt.shop + "<span class=\"lbl\">" + G(e) + "</span><span class=\"lbs\">" + (e === "exit" ? G("exitShort") : G(e).split(" ").slice(-1)[0]) + "</span>", ge.setAttribute("aria-label", G(e));
	}
	function ve() {
		a.remember !== !1 && s === "home" && Me("exited", !0), g("exit", { context: s }), a.onExit ? a.onExit() : u ? Yt.destroy() : location.href = o;
	}
	let ye = M("aside", {
		class: "panel",
		"aria-label": G("kicker")
	}), V = M("div", { class: "keys" });
	A.append(ye, V);
	function be() {
		return Object.values(v.wear).filter(Boolean);
	}
	function xe(e) {
		return e.pack_items.length && e.pack_items.every((e) => be().includes(e));
	}
	function Se() {
		let e = be().filter((e) => !S(e)), t = [];
		for (let n of O.products.filter((e) => e.slot === "pack" && e.pack_items.length)) n.pack_items.every((t) => e.includes(t)) && (t.push(n.id), e = e.filter((e) => !n.pack_items.includes(e)));
		return [...t, ...e];
	}
	let H = (e) => e.reduce((e, t) => e + (O.byId.get(t) ? O.byId.get(t).price_ttc : 0), 0);
	function Ce(e) {
		let t = O.byId.get(e);
		if (!t) return {
			text: "",
			cls: ""
		};
		if (!t.sizes.length || t.sizes.length === 1 && /unique/i.test(t.sizes[0].label)) return {
			text: G("sizeUnique"),
			cls: ""
		};
		let n = rt(t, C());
		return n.available ? !n.exact && n.wanted ? {
			text: G("sizeSwap", {
				w: n.wanted,
				s: n.size.label
			}),
			cls: "warn"
		} : {
			text: G("sizeOk", { s: n.size.label }),
			cls: "ok"
		} : {
			text: G("sizeOut"),
			cls: "warn"
		};
	}
	function we(e, t, n) {
		let r = e ? O.byId.get(e) : null, i = M("button", {
			class: "chipp" + (t ? " on" : "") + (r ? "" : " none"),
			"aria-pressed": String(!!t),
			title: r ? `${r.name} · ${q(r.price_ttc)}${S(e) ? " · " + G("lockedHint") : ""}` : G("none"),
			onClick: n
		});
		return r ? i.append(le(e, 44)) : i.append(M("span", { class: "ph" })), i.append(M("span", { class: "nm" }, r ? oe(r) : G("none")), M("span", { class: "pr" }, r ? q(r.price_ttc) : "—")), r && r.badge && i.append(M("span", { class: "bd " + r.badge }, {
			drop: "Drop",
			limited: "Limited",
			new: "New"
		}[r.badge] || r.badge)), r && S(e) && i.append(M("span", {
			class: "lock",
			title: G("lockedHint"),
			html: mt.lock
		})), i;
	}
	function Te() {
		let e = s === "tryOn" ? O.byId.get(Number(a.tryOn)) : null;
		ye.innerHTML = "";
		let t = M("div", { class: "panel-scroll" });
		if (t.append(M("div", { class: "kicker" }, G(e ? "tryKicker" : "kicker"))), t.append(M("h1", { html: e ? oe(e) : `${G("title1")}<br>${G("title2")} <i>${G("title3")}</i>` })), e && t.append(M("p", { class: "lead" }, G("tryText"))), D && t.append(M("div", { class: "challenge" }, G("beat", {
			name: D.n || "Rider",
			score: K(D.sc || 0)
		}))), !e) {
			let e = M("div", {
				class: "seg",
				role: "group",
				"aria-label": "Mode"
			}, ...["daily", "free"].map((e) => M("button", {
				class: v.mode === e ? "on" : "",
				"aria-pressed": String(v.mode === e),
				onClick: () => {
					v.mode = e, b(), Te(), z.SFX.ui();
				}
			}, G(e === "daily" ? "modeDaily" : "modeFree"))));
			t.append(M("div", { class: "row" }, e, M("button", {
				class: "btn btn-ghost btn-sm",
				style: "margin-left:auto",
				onClick: () => Rt()
			}, G("leaderboard")))), t.append(Mt());
		}
		let n = M("div", {
			class: "seg",
			role: "group",
			"aria-label": "Silhouette"
		}, ...["f", "m"].map((e) => M("button", {
			class: v.gender === e ? "on" : "",
			"aria-pressed": String(v.gender === e),
			onClick: () => {
				v.gender = e, De();
			}
		}, G(e === "f" ? "women" : "men")))), r = M("div", { class: "skins" }, ...P.map((e, t) => M("button", {
			class: v.skin === t ? "on" : "",
			style: "background:" + e.s,
			"aria-label": G(t ? "skinDark" : "skinLight"),
			"aria-pressed": String(v.skin === t),
			onClick: () => {
				v.skin = t, De();
			}
		})));
		t.append(M("div", { class: "row" }, n, r));
		let i = M("details", { class: "sizes" });
		je("sizesOpen", A.clientWidth >= 600) && (i.open = !0), i.addEventListener("toggle", () => Me("sizesOpen", i.open));
		let o = Object.entries(v.sizes).map(([e, t]) => e === "deck" ? t + "\"" : t).join(" · ");
		i.append(M("summary", {}, G("sizes"), M("small", {}, o)));
		let c = M("div", { class: "grid" });
		for (let [e, t] of Object.entries(ct)) {
			let n = M("select", {
				"aria-label": G("size_" + e),
				onChange: (t) => {
					v.sizes[e] = t.target.value, b(), Te(), z.SFX.ui();
				}
			});
			for (let r of t) {
				let t = M("option", { value: r }, e === "deck" ? r.replace(".", Fe() === "fr" ? "," : ".") + "\"" : r);
				String(v.sizes[e]) === r && (t.selected = !0), n.append(t);
			}
			c.append(M("label", {}, G("size_" + e), n));
		}
		i.append(c, M("p", {}, G("sizesHint"))), t.append(i);
		for (let e of ut) {
			let n = e.ids();
			if (!n.length) continue;
			let r = M("div", { class: "slot" }), i = {
				text: "",
				cls: ""
			};
			if (!e.multi && !e.pack) {
				let t = v.wear[e.k];
				i = t ? {
					...Ce(t),
					text: oe(O.byId.get(t)) + " · " + Ce(t).text
				} : {
					text: G("none"),
					cls: ""
				}, t && S(t) && (i = {
					text: G("lockedHint"),
					cls: "warn"
				});
			} else if (e.multi) {
				let e = n.filter((e) => v.wear[O.byId.get(e).slot] === e);
				i = {
					text: e.length ? e.map((e) => Ce(e).text).join(" · ") : G("none"),
					cls: ""
				};
			}
			r.append(M("div", { class: "slot-h" }, M("b", {}, G("slot_" + e.k)), M("span", { class: i.cls }, i.text)));
			let a = M("div", { class: "chips" });
			for (let t of n) {
				let n = O.byId.get(t);
				e.pack ? a.append(we(t, xe(n), () => {
					for (let e of n.pack_items) {
						let t = O.byId.get(e);
						t && (v.wear[t.slot] = e);
					}
					De();
				})) : e.multi ? a.append(we(t, v.wear[n.slot] === t, () => {
					v.wear[n.slot] = v.wear[n.slot] === t ? null : t, De();
				})) : a.append(we(t, v.wear[e.k] === t, () => {
					v.wear[e.k] = t, e.k === "head" && (v.wear.helmet = null), De();
				}));
			}
			e.none && a.append(we(0, !v.wear[e.k] && !v.wear.helmet, () => {
				v.wear[e.k] = null, v.wear.helmet = null, De();
			})), r.append(a), t.append(r);
		}
		let l = Se(), u = l.length, d = M("div", { class: "panel-foot" }, M("div", { class: "total" }, M("span", {}, G("outfit") + " : ", M("b", {}, G(u > 1 ? "articlesP" : "articles", { n: u }))), M("span", { class: "eur" }, q(H(l)))), M("div", { class: "ctas" }, M("button", {
			class: "btn btn-buy",
			id: "buy",
			onClick: (e) => Oe(e.currentTarget)
		}, G("buy")), M("button", {
			class: "btn btn-ride",
			onClick: () => $(),
			html: G("ride") + " " + mt.play
		})));
		ye.append(t, d), V.textContent = G("keysHint"), t.scrollTop = Ee, t.addEventListener("scroll", () => {
			Ee = t.scrollTop;
		});
	}
	let Ee = 0;
	function De() {
		b(), de(), Te(), B.hop(), z.unlock(), z.SFX.ui();
	}
	async function Oe(e, t) {
		z.unlock();
		let n = t || Se(), r = (t ? [] : be()).filter(S);
		if (!n.length) return;
		e && (e.disabled = !0, e.classList.add("ok"), e.textContent = "…");
		let i = await w.addLookToCart(n, C()), a = i.filter((e) => e.ok), o = i.filter((e) => !e.ok);
		z.SFX.buy(), B.confetti();
		let s = G("addedToast", { n: a.length });
		a.some((e) => e.mock) && (s += " " + G("addedMock")), o.length && (s += " · " + G("addFail", { list: o.map((e) => e.product ? oe(e.product) : "?").join(", ") })), r.length && (s += " · " + G("lockedSkip", { list: r.map((e) => oe(O.byId.get(e))).join(", ") })), R(s, 4200), g("buyOutfit", {
			items: n,
			added: a.length,
			failed: o.length
		}), e && (e.textContent = G("added"), setTimeout(() => {
			e.disabled = !1, e.classList.remove("ok"), e.textContent = e.dataset.label || G("buy");
		}, 2200));
	}
	let ke = M("div", { class: "hud hidden" }), Ae = M("b", {}, "0"), U = M("span", {
		class: "h-loot",
		html: "<i class=\"coin\"></i><span>0</span>"
	}), Ne = M("span", { class: "h-skate" }, ..."SKATE".split("").map((e) => M("i", {}, e))), W = M("span", { class: "h-ghost hidden" }), Pe = M("i"), Re = M("b", {}, "60"), ze = M("div", { class: "names" }), Be = M("b", {}, "0"), Ve = M("span"), J = M("div", { class: "combo idle" }, ze, M("div", { class: "pts" }, Be, Ve)), Ke = M("b", {}, "0"), qe = M("div", {
		class: "speedo",
		role: "img",
		"aria-label": "km/h"
	}, M("div", {}, Ke, M("small", {}, "KM/H"))), Je = M("div", { class: "fx" }), Y = M("div", { class: "tuto off" });
	ke.append(M("div", { class: "h-score" }, M("small", {}, G("score").toUpperCase()), Ae, M("div", { class: "h-row" }, U, Ne), W), M("div", { class: "h-time" }, M("div", { class: "bar" }, Pe), Re), J, qe, Je, Y), A.append(ke);
	let $e = -1, et = -1, tt = -1, nt = "", at = 0, ot = -1, dt = null;
	function pt(e) {
		e.score !== et && (et = e.score, Ae.textContent = K(e.score)), Pe.style.transform = "scaleX(" + (e.left / 60).toFixed(4) + ")";
		let t = Math.ceil(e.left);
		t !== $e && ($e = t, Re.textContent = t, Re.classList.toggle("low", t <= 10));
		let n = Math.round(e.kmh);
		if (n !== tt && (tt = n, Ke.textContent = n, qe.style.setProperty("--p", Math.min(1, Math.max(0, (n - 20) / 40)).toFixed(3)), qe.classList.toggle("hot", n >= 48)), e.coins !== ot && (ot = e.coins, U.lastChild.textContent = e.coins), e.letters !== dt && (dt = e.letters, [...Ne.children].forEach((t) => t.classList.toggle("on", e.letters.includes(t.textContent)))), e.ghost != null) {
			let t = e.score - e.ghost;
			W.classList.remove("hidden"), W.textContent = G("ghostVs") + " " + (t >= 0 ? "+" : "−") + K(Math.abs(t)), W.classList.toggle("ahead", t >= 0);
		} else W.classList.add("hidden");
		let r = (e.boost ? "b" : "") + (e.magnet ? "m" : "");
		r !== nt && (nt = r, Je.innerHTML = (e.boost ? "<span>BOOST</span>" : "") + (e.magnet ? "<span class=\"mag\">" + G("magnet").replace(/\s*!$/, "") + "</span>" : "")), at > 0 && (at -= 1 / 60, at <= 0 && Y.classList.add("off"));
	}
	function gt(e, t) {
		if (t && t.banked != null) {
			J.classList.add("bank"), Be.textContent = "+" + K(t.banked), Ve.textContent = "", setTimeout(() => {
				J.classList.remove("bank"), B.sim.S.combo || J.classList.add("idle");
			}, 650);
			return;
		}
		if (t && t.lost) {
			J.classList.add("lost"), setTimeout(() => {
				J.classList.remove("lost"), J.classList.add("idle");
			}, 700);
			return;
		}
		if (!e) {
			!J.classList.contains("bank") && !J.classList.contains("lost") && J.classList.add("idle");
			return;
		}
		J.classList.remove("idle", "bank", "lost"), ze.textContent = e.names.slice(-5).join(" + "), Be.textContent = K(e.pts), Ve.textContent = "× " + e.mult;
	}
	let _t = matchMedia("(pointer:coarse)").matches;
	function vt(e) {
		let t = "hint_" + e + (_t && (e === "ollie" || e === "flip") ? "T" : "");
		Y.innerHTML = G(t), Y.classList.remove("off"), at = 4.2;
	}
	function yt(e) {
		!v.unlocked.includes(e) && O.byId.get(e) && (v.unlocked.push(e), b(), g("exclusiveUnlocked", { id: e }), g("objectiveUnlocked", {
			id: "exclusive-" + e,
			first: !0,
			products: [e]
		}), R(G("excl") + " : " + oe(O.byId.get(e)), 3200));
	}
	function bt(e, t, n) {
		e === "letter" ? (g("letter", {
			ch: t.ch,
			letters: n.letters
		}), n.letters.length === 5 && yt(22)) : e === "cassette" ? (g("cassette", {}), yt(6)) : e === "drop" ? g("dropCaught", { product_id: t.id }) : e === "dropSpawn" ? g("dropSpawn", { product_id: t.id }) : (e === "boost" || e === "magnet") && g("bonus", { kind: e });
	}
	let X = "wardrobe", Z = null, xt = 0, St = null, Q = null;
	function Ct() {
		Z && (Z.remove(), Z = null);
	}
	function wt(e, t) {
		Ct(), Z = M("div", {
			class: "modal",
			role: "dialog",
			"aria-modal": "true"
		}, e), t && Z.classList.add(t), A.append(Z);
		let n = e.querySelector("button");
		if (n) try {
			n.focus({ preventScroll: !0 });
		} catch {}
		return Z;
	}
	function Tt() {
		if (X !== "run" || B.G.paused) return;
		B.setPaused(!0), z.SFX.pause(), z.stopMusic(), g("pause", {});
		let e = M("button", {
			class: "btn btn-ghost",
			onClick: () => {
				v.music = !v.music, z.setMusic(v.music), b(), e.textContent = G(v.music ? "musicOn" : "musicOff");
			}
		}, G(v.music ? "musicOn" : "musicOff"));
		wt(M("div", { class: "card small" }, M("h2", {}, G("pause")), M("p", {}, G("controls")), M("div", { class: "stack" }, M("button", {
			class: "btn btn-ride",
			onClick: Et
		}, G("resume")), M("button", {
			class: "btn btn-ghost",
			onClick: () => {
				Ct(), $(!0);
			}
		}, G("restart")), e, M("button", {
			class: "btn btn-ghost",
			onClick: () => {
				Ct(), Dt();
			}
		}, G("wardrobe")))));
	}
	function Et() {
		Ct(), B.setPaused(!1), v.muted || z.startMusic();
	}
	function Dt(e) {
		if (X = "wardrobe", Ct(), ke.classList.add("hidden"), he.classList.add("hidden"), L.classList.remove("hidden"), ye.classList.remove("hidden"), V.classList.remove("hidden"), z.stopMusic(), z.loops(0, 0, 0), e) {
			let t = O.byId.get(e);
			if (t) {
				if (t.slot === "pack") for (let e of t.pack_items) {
					let t = O.byId.get(e);
					t && (v.wear[t.slot] = e);
				}
				else v.wear[t.slot] = t.id;
				b();
			}
		}
		de(), Te(), B.showScene(Ot()), g("shopOpen", { context: s });
	}
	function Ot() {
		let e = A.getBoundingClientRect(), t = e.width >= e.height;
		if (X === "vest") return t ? {
			x: 0,
			y: 0,
			w: e.width * .5,
			h: e.height
		} : {
			x: 0,
			y: 0,
			w: e.width,
			h: e.height * .44
		};
		let n = t ? Math.min(480, e.width * .47) : 0;
		return t ? {
			x: 0,
			y: 0,
			w: e.width - n,
			h: e.height
		} : {
			x: 0,
			y: 0,
			w: e.width,
			h: e.height * .43
		};
	}
	async function $(e) {
		z.unlock();
		let t = A.getBoundingClientRect();
		if (!e && t.height > t.width && t.width < 600 && !v.rotateOk) {
			wt(M("div", { class: "card small" }, M("h2", {}, G("rotateTitle")), M("p", {}, G("rotateText")), M("button", {
				class: "btn btn-ride",
				onClick: () => {
					v.rotateOk = !0, b(), Ct(), $();
				}
			}, G("rotatePlay"))));
			return;
		}
		Ct(), z.SFX.go();
		try {
			document.activeElement && A.contains(document.activeElement) && document.activeElement.blur();
		} catch {}
		let n = D ? "free" : v.mode, r = null;
		if (T) {
			let e = await E("runStart", {
				device_id: ee,
				mode: n,
				referrer: D && D.r ? D.r : void 0,
				seed: D ? D.s : void 0
			}, 5e3);
			e && e.run_id && e.seed != null && (r = {
				...e,
				online: !0
			}, e.player && (e.player.ref && (v.ref = e.player.ref), e.player.pseudo && (v.pseudo = e.player.pseudo), b()));
		}
		r || (r = {
			run_id: null,
			seed: D ? D.s : n === "daily" ? fe() : Math.random() * 2 ** 31 >>> 0 || 1,
			mode: n,
			online: !1
		}), r.prize && (k = {
			...k || {},
			prize: r.prize,
			ends_at: r.prize.ends_at || k && k.ends_at
		});
		let i = null;
		if (D && T && (D.run || D.r)) {
			let e = await E("ghost", D.run ? { run_id: D.run } : { ref: D.r }, 3500);
			e && e.inputs && e.seed >>> 0 == r.seed >>> 0 && (i = {
				...e,
				pseudo: e.pseudo || D.n
			});
		}
		!i && v.bestRun && v.bestRun.seed >>> 0 == r.seed >>> 0 && (i = {
			...v.bestRun,
			pseudo: v.pseudo || G("ghost")
		}), Q = r, B.wipe(() => {
			X = "run", ye.classList.add("hidden"), V.classList.add("hidden"), L.classList.add("hidden"), ke.classList.remove("hidden"), he.classList.remove("hidden"), de(), B.setGhostLook(jt(v.gender === "f" ? "m" : "f"));
			let e = B.startRun(r.seed, i, null, r.drop && r.drop.product_id ? Number(r.drop.product_id) : null);
			v.muted || z.startMusic(), g("runStart", {
				run_id: r.run_id,
				seed: r.seed,
				mode: n,
				online: r.online,
				ghost: e.ghost,
				drop_product: e.drop
			});
		});
	}
	function kt(e) {
		St = e, X = "end", xt = performance.now(), z.stopMusic(), he.classList.add("hidden");
		let t = e.score > (v.best || 0) && e.score > 0;
		t && (v.best = e.score);
		let n = v.bestRun;
		if ((!n || n.seed !== e.proof.seed || e.score > n.score) && (v.bestRun = {
			seed: e.proof.seed,
			inputs: e.proof.inputs,
			score: e.score,
			drop: e.dropId
		}), e.proof.events.some((e) => e[1] === "gap") && yt(15), b(), window.__r2dCheck) {
			let t = B.replay(e.proof.seed, e.proof.inputs, e.dropId);
			window.__r2dCheck(t && t.score === e.score && t.proof.distance === e.proof.distance, t, e);
		}
		g("runEnd", {
			run_id: Q && Q.run_id,
			score: e.score,
			distance: e.proof.distance,
			max_speed: e.topKmh,
			coins: e.coins,
			letters: e.letters,
			cassette: e.cassette,
			drop_caught: e.dropCaught,
			online: !!(Q && Q.online)
		});
		let r = Q && Q.online && Q.run_id ? E("runFinish", {
			run_id: Q.run_id,
			device_id: ee,
			proof: e.proof
		}, 9e3) : Promise.resolve(null);
		setTimeout(() => Pt(e, t, r), 700);
	}
	let At = (e) => {
		try {
			return new Date(e).toLocaleDateString(Fe() === "en" ? "en-GB" : "fr-FR", {
				day: "numeric",
				month: "long",
				year: "numeric"
			});
		} catch {
			return e;
		}
	};
	function jt(e) {
		let t = F({
			...lt,
			gender: e
		}, 0), n = [
			"#A9DDF3",
			"#7FC0DC",
			"#E8F8FF"
		];
		for (let e of Object.keys(t)) t[e] && typeof t[e] == "object" && t[e].c && (t[e] = {
			...t[e],
			c: n
		});
		return {
			...t,
			skin: "#D4F1FF",
			skinSh: "#9FD3EC",
			hair: "#7FC0DC",
			lip: "#7FC0DC"
		};
	}
	function Mt(e) {
		let t = M("div", { class: "drawbox" }), n = () => {
			t.innerHTML = "";
			let n = k, r = n && n.prize;
			if (!r && !v.streak) {
				t.classList.add("hidden");
				return;
			}
			t.classList.remove("hidden"), r && r.image && t.append(M("img", {
				src: r.image,
				alt: "",
				loading: "lazy"
			}));
			let i = n && n.my_tickets != null ? n.my_tickets : null;
			t.append(M("div", { class: "txt" }, M("small", {}, G("draw")), M("b", {}, r ? r.title : ""), M("span", {}, [n && n.ends_at ? G("drawEnds", { d: At(n.ends_at) }) : null, i == null ? null : G(i > 1 ? "ticketsP" : "tickets", { n: i })].filter(Boolean).join(" · ")), n && n.eligible === !1 ? M("span", { class: "lw" }, G("drawEligible")) : null, n && n.last_winner ? M("span", { class: "lw" }, G("lastWinner", {
				p: n.last_winner.pseudo,
				lot: n.last_winner.prize
			})) : null)), v.streak > 0 && t.append(M("div", {
				class: "streak",
				title: G(v.streak > 1 ? "streakP" : "streak", { n: v.streak })
			}, M("i", { html: "<svg viewBox=\"0 0 24 24\"><path d=\"M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-6 1-9.5z\" fill=\"#FF6A1A\"/><path d=\"M12 13c1 1.5 2.4 2.3 2.4 4a2.4 2.4 0 0 1-4.8 0c0-1 .5-1.8 1.2-2.4.1.9.6 1.4 1.2 1.4z\" fill=\"#FFD54A\"/></svg>" }), M("b", {}, String(v.streak)))), e && t.append(e);
		};
		return n(), t._fill = n, t;
	}
	async function Nt() {
		if (!T) return;
		let e = await E("drawInfo", { device_id: ee }, 5e3);
		e && !e._err && (e.prize || e.ends_at) && (k = e, e.my_tickets != null && (v.tickets = e.my_tickets, b()), X === "wardrobe" && Te());
	}
	function Pt(e, t, n) {
		ke.classList.add("hidden");
		let r = M("div", { class: "big" }, "0"), i = M("div", { class: "card" }, M("div", {
			class: "kicker",
			style: "margin-top:6px"
		}, G("endKicker")), r, M("div", { style: "font-size:13px;color:var(--craie2)" }, G("points"), t ? M("span", { class: "rec" }, G("record")) : null));
		if (D && D.sc) {
			let t = D.sc - e.score;
			i.append(M("div", {
				class: "challenge",
				style: "margin-top:10px"
			}, t < 0 ? G("challengeBeat") : G("challengeLost", { d: K(t) })));
		}
		i.append(M("div", { class: "stats bd" }, M("div", {}, M("small", {}, G("bdTricks")), M("b", {}, K(e.trickScore))), M("div", {}, M("small", {}, G("bdSpeed")), M("b", {}, K(e.speedPts))), M("div", {}, M("small", {}, G("bdDist")), M("b", {}, K(e.distPts))))), i.append(M("div", { class: "stats" }, M("div", {}, M("small", {}, G("topSpeed")), M("b", {}, e.topKmh + " km/h")), M("div", {}, M("small", {}, "S-K-A-T-E"), M("b", {}, e.letters.length + "/5" + (e.cassette ? " + K7" : ""))), M("div", {}, M("small", {}, G("bestCombo")), M("b", {}, K(e.bestCombo))))), e.bestNames && i.append(M("div", { class: "note" }, M("b", {}, G("bestChain") + " : "), e.bestNames.split(" + ").map(He).join(" + ")));
		let a = M("div", { class: "note" }, Q && Q.online ? G("codeWait") : G("offline")), o = M("div", { class: "rewards" }), s = M("div", { class: "ticketfx hidden" });
		i.append(M("div", { class: "sect" }, M("h3", {}, G("rewardsTitle")), M("button", {
			class: "btn btn-ghost btn-sm",
			onClick: () => Rt()
		}, G("leaderboard"))), a, o, s);
		let c = Mt();
		i.append(c), i.append(M("div", { class: "endbtns" }, M("button", {
			class: "btn btn-ride",
			onClick: () => $(!0),
			html: G("again") + " <kbd>Espace</kbd>"
		}), M("button", {
			class: "btn btn-ghost",
			onClick: () => Dt()
		}, G("wardrobe")))), i.append(M("div", { class: "sharebtns" }, M("button", {
			class: "btn btn-ghost btn-sm",
			onClick: () => Ht(e)
		}, G("challengeFriend")), M("button", {
			class: "btn btn-ghost btn-sm",
			onClick: () => Vt(e)
		}, G("share"))));
		let l = Se();
		i.append(M("div", { class: "shopline" }, M("span", {}, G("outfit") + " : ", M("b", {}, G(l.length > 1 ? "articlesP" : "articles", { n: l.length }) + " · " + q(H(l)))), M("button", {
			class: "btn btn-buy btn-sm",
			onClick: (e) => Oe(e.currentTarget)
		}, G("buyShort")))), wt(i);
		let u = performance.now(), d = () => {
			let t = Math.min(1, (performance.now() - u) / 900);
			r.textContent = K(e.score * (1 - (1 - t) * (1 - t))), t < 1 && !f && requestAnimationFrame(d);
		};
		d(), Promise.resolve(n).then((e) => {
			if (f || !Q || !Q.online) return;
			if (!e || e._err) {
				a.textContent = G("offline");
				return;
			}
			if (e.accepted === !1) {
				a.textContent = G("refused", { r: e.reason || "?" });
				return;
			}
			a.textContent = e.ranks ? G("rankLine", {
				d: e.ranks.day ?? "–",
				w: e.ranks.week ?? "–"
			}) : "", e.streak != null && (v.streak = e.streak, b()), e.tickets_earned > 0 && (s.textContent = G("ticketGain", { n: e.tickets_earned }) + (e.tickets_earned > 1 ? "s" : ""), s.classList.remove("hidden"), z.SFX.token(), v.tickets = (v.tickets || 0) + e.tickets_earned, k && (k.my_tickets = (k.my_tickets || 0) + e.tickets_earned)), c._fill();
			let t = Array.isArray(e.rewards) ? e.rewards : [];
			t.length || o.append(M("div", { class: "note" }, G("noReward")));
			for (let e of t) o.append(Ft(e));
			g("runFinished", {
				accepted: e.accepted !== !1,
				score: e.score,
				ranks: e.ranks,
				tickets_earned: e.tickets_earned,
				streak: e.streak,
				rewards: t.map((e) => ({
					kind: e.kind,
					product_id: e.product_id
				}))
			}), e.needs_pseudo && Lt(), Nt();
		});
	}
	function Ft(e) {
		let t = {
			skate: "#C8FF2E",
			score: "#DDE3EA",
			drop: "#FFD54A"
		}[e.kind] || "#FFD54A", n = e.product_id ? O.byId.get(Number(e.product_id)) : null, r = M("div", {
			class: "reward",
			style: "--tier:" + t
		}, n ? le(n.id, 42) : M("div", { class: "coin" }, "%"), M("div", { class: "lbl" }, e.label || G("rw_" + e.kind), M("small", {}, G("rw_" + e.kind) + (n ? " · " + oe(n) : "")))), i = M("button", {
			class: "btn btn-ride btn-sm",
			onClick: () => {
				i.remove(), r.append(s());
			}
		}, G("claimBtn"));
		r.append(i);
		function s() {
			let t = M("form", {
				class: "claim",
				novalidate: !0
			}), r = M("input", {
				type: "email",
				required: !0,
				autocomplete: "email",
				placeholder: G("email"),
				"aria-label": G("email"),
				value: v.email || ""
			}), i = M("input", { type: "checkbox" }), s = M("input", {
				type: "checkbox",
				required: !0
			}), c = a.rulesUrl ? M("a", {
				href: a.rulesUrl,
				target: "_blank",
				rel: "noopener"
			}, G("rulesLink")) : M("span", {}, G("rulesLink")), l = M("label", { class: "chk" }, s, M("span", {}, ...G("rules", { link: "\0" }).split("\0").flatMap((e, t) => t ? [c, e] : [e]))), u = M("div", { class: "err" }), d = M("button", {
				class: "btn btn-ride btn-sm",
				type: "submit"
			}, G("claimGo"));
			return t.append(r, M("label", { class: "chk" }, i, M("span", {}, G("newsletter"))), l, u, d), t.addEventListener("submit", async (c) => {
				c.preventDefault(), u.textContent = "";
				let l = r.value.trim();
				if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(l)) {
					u.textContent = G("emailBad"), r.focus();
					return;
				}
				if (!s.checked) {
					u.textContent = G("rulesNeeded");
					return;
				}
				d.disabled = !0, d.textContent = "…";
				let f = await E("claim", {
					run_id: Q.run_id,
					device_id: ee,
					email: l,
					newsletter: i.checked,
					reward: {
						kind: e.kind,
						...e.product_id ? { product_id: e.product_id } : {}
					}
				}, 9e3);
				if (!f || !f.ok || !f.code) {
					d.disabled = !1, d.textContent = G("claimGo");
					let e = f && f.reason || "?";
					u.textContent = G("claimErr_" + e) === "claimErr_" + e ? G("claimErr", { r: e }) : G("claimErr_" + e);
					return;
				}
				if (v.email = l, b(), t.replaceWith(It(f, n)), g("rewardClaimed", {
					kind: e.kind,
					product_id: e.product_id || null,
					newsletter: i.checked
				}), i.checked) {
					let e = await Ze(a.newsletter, l, o);
					g("newsletter", {
						ok: !!e.ok,
						reason: e.reason || null
					}), e.ok && R(G("nlOk"), 5e3);
				}
			}), setTimeout(() => r.focus(), 50), t;
		}
		return r;
	}
	function It(e, t) {
		let n = M("code", { tabindex: "0" }, e.code), r = M("button", {
			type: "button",
			class: "btn btn-ghost btn-sm",
			onClick: async () => {
				try {
					await navigator.clipboard.writeText(e.code), R(G("codeCopied"));
				} catch {
					let e = document.createRange();
					e.selectNodeContents(n);
					let t = getSelection();
					t.removeAllRanges(), t.addRange(e);
				}
			}
		}, G("codeCopy"));
		return M("div", { class: "codeview" }, M("div", { class: "cv-top" }, n, r), M("div", {
			class: "note",
			style: "margin:0"
		}, [
			e.label,
			e.value == null ? null : typeof e.value == "number" ? "-" + e.value + " %" : e.value,
			e.expires_at ? G("codeValid", { d: At(e.expires_at) }) : null
		].filter(Boolean).join(" · ")), M("div", { class: "cv-acts" }, e.apply_url ? M("a", {
			class: "btn btn-ride btn-sm",
			href: new URL(e.apply_url, new URL(o, location.href)).href,
			target: "_top"
		}, G("applyCart")) : null, t && t.url ? M("a", {
			class: "btn btn-ghost btn-sm",
			href: new URL(t.url, new URL(o, location.href)).href,
			target: "_top"
		}, G("seeProduct")) : null));
	}
	function Lt() {
		let e = M("input", {
			type: "text",
			minlength: 3,
			maxlength: 12,
			autocomplete: "nickname",
			"aria-label": G("pseudoTitle"),
			value: v.pseudo || ""
		}), t = M("div", { class: "err" }), n = M("button", {
			class: "btn btn-ride",
			type: "submit"
		}, G("pseudoOk")), r = M("form", { class: "claim" }, e, t, n), i = M("div", { class: "pseudobox" }, M("h3", {}, G("pseudoTitle")), M("p", { class: "note" }, G("pseudoText")), r), a = Z && Z.querySelector(".card");
		a && a.insertBefore(i, a.children[3] || null), r.addEventListener("submit", async (r) => {
			r.preventDefault();
			let a = e.value.trim();
			if (a.length < 3 || a.length > 12) {
				t.textContent = G("pseudoErr", { r: "3-12" });
				return;
			}
			n.disabled = !0;
			let o = await E("pseudo", {
				device_id: ee,
				pseudo: a
			}, 6e3);
			n.disabled = !1, o && o.ok ? (v.pseudo = o.pseudo || a, b(), i.replaceWith(M("div", { class: "note" }, "✓ " + v.pseudo)), g("pseudoSet", { pseudo: v.pseudo })) : t.textContent = G("pseudoErr", { r: o && o.reason || "?" });
		}), setTimeout(() => e.focus(), 60);
	}
	async function Rt(e = "day") {
		let t = Z ? Z.firstChild : null, n = X, r = M("div", { class: "lb" }, M("div", { class: "note" }, G(T ? "codeWait" : "lbOffline"))), i = M("div", { class: "seg" }, ...[
			["day", "lbDay"],
			["week", "lbWeek"],
			["all", "lbAll"]
		].map(([t, n]) => M("button", {
			class: t === e ? "on" : "",
			onClick: () => Rt(t)
		}, G(n)))), a = M("button", {
			class: "btn btn-ghost",
			onClick: () => {
				Ct(), t && n === "end" && (Z = M("div", {
					class: "modal",
					role: "dialog",
					"aria-modal": "true"
				}, t), A.append(Z));
			}
		}, Fe() === "en" ? "Back" : "Retour"), o = M("div", { class: "card" }, M("div", {
			class: "kicker",
			style: "margin-top:6px"
		}, "Respawn Street Run"), M("h2", {}, G("leaderboard")), i, r, M("div", { class: "endbtns" }, M("button", {
			class: "btn btn-ride",
			onClick: () => $(!0)
		}, G("again")), a));
		if (Ct(), Z = M("div", {
			class: "modal",
			role: "dialog",
			"aria-modal": "true"
		}, o), A.append(Z), t && (Z._prev = t), g("leaderboardOpen", { period: e }), !T) return;
		let s = await E("leaderboard", {
			period: e,
			device_id: ee
		}, 6e3);
		if (r.innerHTML = "", !s || s._err) {
			r.append(M("div", { class: "note" }, G("lbOffline")));
			return;
		}
		let c = s.me || null, l = s.top || [];
		l.length || r.append(M("div", { class: "note" }, G("lbEmpty")));
		let u = M("ol", { class: "lblist" });
		for (let e of l.slice(0, 10)) u.append(M("li", { class: e.me || c && c.rank === e.rank ? "me" : "" }, M("span", { class: "rk" }, "#" + e.rank), M("span", { class: "ps" }, e.pseudo || "—", e.badge ? M("em", { class: "medal " + e.badge }, "") : null), M("b", {}, K(e.score))));
		if (r.append(u), c && c.rank) {
			let e = M("ol", { class: "lblist near" });
			c.above && e.append(M("li", {}, M("span", { class: "rk" }, "#" + (c.rank - 1)), M("span", { class: "ps" }, c.above.pseudo), M("b", {}, K(c.above.score)))), e.append(M("li", { class: "me" }, M("span", { class: "rk" }, "#" + c.rank), M("span", { class: "ps" }, v.pseudo || (l.find((e) => e.me) || {}).pseudo || c.pseudo || G("lbMe")), M("b", {}, K(c.score)))), c.below && e.append(M("li", {}, M("span", { class: "rk" }, "#" + (c.rank + 1)), M("span", { class: "ps" }, c.below.pseudo), M("b", {}, K(c.below.score)))), r.append(M("div", { class: "sect" }, M("h3", {}, G("lbMe") + " : #" + c.rank)), e, M("div", { class: "challenge" }, c.rank === 1 ? G("lbFirst") : G("lbGap", {
				d: K(s.gap_to_next == null ? c.above ? c.above.score - c.score : 0 : s.gap_to_next),
				r: c.rank - 1
			})));
		}
	}
	function zt(n) {
		let a = 1080, o = 1350, s = document.createElement("canvas");
		s.width = a, s.height = o;
		let c = s.getContext("2d"), l = c.createLinearGradient(0, 0, 0, o);
		l.addColorStop(0, "#1F1438"), l.addColorStop(.45, "#9C3460"), l.addColorStop(.75, "#FF9A52"), l.addColorStop(1, "#FFC874"), c.fillStyle = l, c.fillRect(0, 0, a, o), c.fillStyle = "rgba(20,20,22,.9)", c.fillRect(0, o * .72, a, o * .28), c.fillStyle = "#FFE9A8", c.globalAlpha = .85, c.beginPath(), c.arc(a * .72, o * .5, 170, 0, Math.PI * 2), c.fill(), c.globalAlpha = 1, c.fillStyle = "#2A1733";
		for (let e = 0; e < 9; e++) c.fillRect(e * 125 - 20, o * .72 - 120 - e * 97 % 260, 110, 400);
		let u = F(v, 0);
		c.save(), c.translate(a * .42, o * .72), c.scale(3.4, 3.4), c.save(), c.translate(50, -52), c.rotate(-Math.PI / 2 + .1), te(c, u), c.restore(), y(c, {
			hip: {
				x: 0,
				y: -75
			},
			lean: -.02,
			fb: {
				x: -17,
				y: 0
			},
			ff: {
				x: 17,
				y: 0
			},
			hb: {
				x: -22,
				y: -68
			},
			eb: "out",
			hf: {
				x: 43,
				y: -106
			},
			ef: "down",
			tilt: 0,
			shoeAng: 0,
			board: { show: 0 },
			pony: {
				x: 0,
				y: 0
			},
			blink: 0,
			smile: !0
		}, u), c.restore(), c.textAlign = "left", c.fillStyle = t, c.font = "64px " + i, c.fillText("RESPAWN", 64, 110), c.fillStyle = r, c.font = "30px " + i, c.fillText("STREET RUN", 66, 152), c.font = "170px " + i, c.fillStyle = r, c.strokeStyle = e, c.lineWidth = 14, c.lineJoin = "round";
		let d = K(n.score);
		return c.strokeText(d, 60, 1162), c.fillText(d, 60, 1162), c.font = "700 34px \"Space Grotesk\", system-ui, sans-serif", c.fillStyle = t, c.fillText(`${n.topKmh} km/h · combo ${K(n.bestCombo)} · S-K-A-T-E ${n.letters.length}/5`, 64, 1222), v.pseudo && (c.font = "44px " + i, c.fillStyle = r, c.textAlign = "right", c.fillText(v.pseudo.toUpperCase(), 1016, 110), c.textAlign = "left"), c.font = "700 30px \"Space Grotesk\", system-ui, sans-serif", c.fillStyle = r, c.fillText(Fe() === "en" ? "Beat my score →" : "Bats mon score →", 64, 1300), s;
	}
	let Bt = (e) => Ye({
		seed: e.proof.seed,
		score: e.score,
		ref: v.ref || void 0,
		name: v.pseudo || void 0,
		run: Q && Q.online ? Q.run_id : void 0,
		shopUrl: o
	});
	async function Vt(e) {
		let t = zt(e), n = Bt(e);
		g("share", {
			kind: "card",
			score: e.score,
			link: n
		});
		let r = await new Promise((e) => t.toBlob(e, "image/png"));
		try {
			let t = new File([r], "respawn-run.png", { type: "image/png" });
			if (navigator.canShare && navigator.canShare({ files: [t] })) {
				await navigator.share({
					files: [t],
					title: G("shareTitle"),
					text: G("shareText", { score: K(e.score) }) + " " + n
				});
				return;
			}
		} catch (e) {
			if (e && e.name === "AbortError") return;
		}
		let i = document.createElement("a");
		i.href = URL.createObjectURL(r), i.download = "respawn-run.png", i.click(), setTimeout(() => URL.revokeObjectURL(i.href), 4e3), R(G("pngSaved"));
	}
	async function Ht(e) {
		let t = Bt(e);
		g("share", {
			kind: "challenge",
			score: e.score,
			link: t
		});
		try {
			if (_t && navigator.share) {
				await navigator.share({
					url: t,
					text: G("shareText", { score: K(e.score) })
				});
				return;
			}
			await navigator.clipboard.writeText(t), R(G("copied"));
		} catch (e) {
			e && e.name !== "AbortError" && R(t, 6e3);
		}
	}
	function Ut() {
		X = "vest";
		let e = a.vestiaire && a.vestiaire.items || [], t = I(e);
		ue = t.bag.length, B.setLook(F({
			...v,
			wear: t.wear
		}, ue)), ye.classList.add("hidden"), V.classList.add("hidden"), B.showScene(Ot());
		let n = Object.values(t.wear), r = M("div", { class: "card" }, M("div", {
			class: "kicker",
			style: "margin-top:6px"
		}, G("vestKicker")), M("h2", {}, G("vestTitle")));
		e.length || r.append(M("p", {}, G("vestEmpty"))), r.append(M("div", { class: "sect" }, M("h3", {}, G("vestWorn") + " · " + n.length)), M("div", { class: "vlist" }, ...n.map((e) => M("div", {}, le(e, 56), oe(O.byId.get(e)))))), r.append(M("div", { class: "sect" }, M("h3", {}, G("vestBag") + " · " + t.bag.length)), t.bag.length ? M("div", { class: "vlist" }, ...t.bag.map((e) => M("div", {}, le(e, 56), oe(O.byId.get(e))))) : M("div", { class: "note" }, G("vestBagEmpty"))), r.append(M("div", { class: "endbtns" }, M("button", {
			class: "btn btn-ride",
			onClick: () => {
				for (let [e, n] of Object.entries(t.wear)) v.wear[e] = n;
				b(), Dt(), $();
			}
		}, G("vestRide")), M("button", {
			class: "btn btn-ghost",
			onClick: ve
		}, G("exitCart"))));
		let i = wt(r);
		i.style.justifyContent = innerWidth >= innerHeight ? "flex-end" : "center", i.style.alignItems = innerWidth >= innerHeight ? "center" : "flex-end", i.style.background = "transparent", r.style.width = innerWidth >= innerHeight ? "min(520px,48%)" : "100%", r.style.maxHeight = innerWidth >= innerHeight ? "100%" : "56%", g("shopOpen", {
			context: "vestiaire",
			worn: n.length,
			bag: t.bag.length
		});
	}
	function Wt(e) {
		if (f) return;
		let t = e.composedPath ? e.composedPath()[0] : e.target;
		if (!(t && /INPUT|TEXTAREA|SELECT/.test(t.tagName || ""))) {
			if (e.code === "KeyM" && !e.target.closest?.("input,select,textarea")) {
				v.muted = !v.muted, z.setMuted(v.muted), b(), _e();
				return;
			}
			if (X === "run") {
				if (e.code === "Escape" || e.code === "KeyP") {
					e.preventDefault(), B.G.paused ? Et() : Tt();
					return;
				}
				if (B.G.paused) return;
				B.onKeyDown(e);
				return;
			}
			if (X === "end" && B.G.mode === "end" && (e.code === "Space" || e.code === "Enter" || e.code === "KeyR") && performance.now() - xt > 1500) {
				let t = m.activeElement;
				if (e.code !== "KeyR" && t && t.tagName === "BUTTON" && !t.classList.contains("btn-ride")) return;
				e.preventDefault(), $(!0);
				return;
			}
			X === "wardrobe" && !Z && e.code === "Enter" && !(m.activeElement && /BUTTON|SELECT|SUMMARY/.test(m.activeElement.tagName)) && (e.preventDefault(), $());
		}
	}
	let Gt = (e) => B.onKeyUp(e);
	window.addEventListener("keydown", Wt), window.addEventListener("keyup", Gt);
	let Kt = () => {
		document.hidden ? (B.stop(), z.suspend(), X === "run" && Tt()) : (B.start(), z.resume());
	};
	document.addEventListener("visibilitychange", Kt);
	let qt = new ResizeObserver(() => {
		B.resize(), (X === "wardrobe" || X === "vest") && B.setSceneRect(Ot());
	});
	qt.observe(A);
	let Jt = Le(() => {
		A.lang = Fe(), _e(), X === "wardrobe" && Te();
	});
	document.addEventListener("pointerdown", () => z.unlock(), { once: !0 }), _e(), B.resize(), s === "vestiaire" ? Ut() : s === "tryOn" ? Dt(Number(a.tryOn)) : Dt(), B.start(), h.then(() => {
		f || (B.rebuild(), X === "wardrobe" && Te());
	}), g("ready", {
		context: s,
		version: st,
		online: !!T,
		device_id: ee
	}), Nt();
	let Yt = {
		get engine() {
			return B;
		},
		bridge: () => w,
		pause: () => Tt(),
		openWardrobe: (e) => Dt(e),
		openShop: (e) => Dt(e),
		openLeaderboard: (e) => Rt(e),
		challengeLink: () => St ? Bt(St) : null,
		destroy() {
			f || (f = !0, B.destroy(), z.dispose(), qt.disconnect(), Jt(), window.removeEventListener("keydown", Wt), window.removeEventListener("keyup", Gt), document.removeEventListener("visibilitychange", Kt), p.remove(), u && (u.remove(), document.documentElement.style.overflow = d || ""), g("destroy", {}));
		}
	};
	return (l || c.has("debug")) && (window.__r2d = {
		api: Yt,
		engine: B,
		profile: v,
		CAT: O
	}), Yt;
}
//#endregion
export { ot as clearExited, gt as mount, st as version, at as wasExited };
