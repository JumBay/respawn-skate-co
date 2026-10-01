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
	n.lineCap = "round", n.lineJoin = "round", i.board.show && te(n, i.board, o);
	let s = i.hip, m = i.lean, y = o.gender === "f", x = o.bottom || _, S = o.top || g, C = o.feet || v, w = C.g === "high", ne = w ? 11 : 7.5, re = [{
		h: p(s, m, -7, 2),
		f: i.fb,
		side: -1
	}, {
		h: p(s, m, 7, 2),
		f: i.ff,
		side: 1
	}], T = (t, r) => {
		n.save(), n.translate(t.x, t.y), n.rotate(i.shoeAng || 0);
		let o = w ? 13 : 9.5, [s, u, f] = C.c;
		n.beginPath(), n.moveTo(-11, 0), n.lineTo(-11, -o * .55), n.quadraticCurveTo(-11, -o, -6, -o), n.lineTo(6, -o), n.quadraticCurveTo(11, -o, 11, -o * .55), n.lineTo(11, 0), n.closePath(), d(n, s, 2.2), n.fillStyle = u, n.fillRect(-10, -3.6, 20, 3.2), n.strokeStyle = e, n.lineWidth = 1.4, n.beginPath(), n.moveTo(-10, -3.8), n.lineTo(10, -3.8), n.stroke(), w && (n.fillStyle = f, n.fillRect(-9.5, -o + 4, 19, 2.6)), n.strokeStyle = l(s) > .5 ? c(s, .6) : c(s, 1.9), n.lineWidth = 1.3, n.beginPath();
		for (let e = 0; e < 3; e++) n.moveTo(-3.5, -o + 2.5 + e * 2.2), n.lineTo(3.5, -o + 2.5 + e * 2.2);
		n.stroke(), !w && l(f) > .5 && (n.fillStyle = f, n.beginPath(), n.arc(r * 6, -5.8, 1.6, 0, a), n.fill()), n.restore();
	}, ie = x.c[0], E = c(x.c[0], .82), ae = x.g === "shorts";
	for (let e of re) {
		let t = {
			x: e.f.x,
			y: e.f.y - ne
		}, n = h(e.h.x, e.h.y, t.x, t.y, 34, 33, "out", e.side);
		e.k = n.j, e.a = n.e;
	}
	if (!ae) for (let e of re) T(e.f, e.side);
	for (let t of re) {
		let i = t.h, a = t.k, s = t.a;
		if (ae) f(n, [
			a.x,
			a.y,
			s.x,
			s.y
		], 9.5, o.skin), n.strokeStyle = r, n.lineWidth = 10.5, n.beginPath(), n.moveTo(s.x, s.y), n.lineTo(s.x + (a.x - s.x) * .22, s.y + (a.y - s.y) * .22), n.stroke(), T(t.f, t.side), f(n, [
			i.x,
			i.y,
			a.x,
			a.y,
			a.x + (s.x - a.x) * .28,
			a.y + (s.y - a.y) * .28
		], 17, ie);
		else {
			let r = x.wide ? 15.5 : 15, o = x.wide ? 16.5 : 14;
			n.beginPath(), n.moveTo(i.x, i.y), n.lineTo(a.x, a.y), n.lineTo(s.x, s.y), n.strokeStyle = e, n.lineWidth = o + 4.4, n.stroke(), n.strokeStyle = ie, n.lineWidth = r, n.beginPath(), n.moveTo(i.x, i.y), n.lineTo(a.x, a.y), n.stroke(), n.lineWidth = o, n.beginPath(), n.moveTo(a.x, a.y), n.lineTo(s.x, s.y), n.stroke();
			let c = s.x - a.x, l = s.y - a.y, f = Math.hypot(c, l) || 1;
			if (n.strokeStyle = E, n.lineWidth = o + .5, n.lineCap = "butt", n.beginPath(), n.moveTo(s.x - c / f * 5, s.y - l / f * 5), n.lineTo(s.x - c / f, s.y - l / f), n.stroke(), n.lineCap = "round", x.g === "jeans" && (n.strokeStyle = x.c[2], n.globalAlpha = .55, n.lineWidth = .9, n.beginPath(), n.moveTo(i.x + t.side * 5, i.y + 3), n.lineTo(a.x + t.side * 6, a.y), n.lineTo(s.x + t.side * 6, s.y - 4), n.stroke(), n.globalAlpha = 1), x.g === "cargo") {
				let r = i.x + (a.x - i.x) * .62, o = i.y + (a.y - i.y) * .62, s = Math.atan2(a.y - i.y, a.x - i.x);
				n.save(), n.translate(r + t.side * 3, o), n.rotate(s - Math.PI / 2), u(n, -4.5, -5.5, 9, 11, 2), d(n, x.c[1], 1.3), n.beginPath(), n.moveTo(-4.5, -2), n.lineTo(4.5, -2), n.strokeStyle = e, n.lineWidth = 1, n.stroke(), n.restore();
			}
		}
		if (o.knees) {
			let e = Math.atan2(s.y - a.y, s.x - a.x);
			n.save(), n.translate(a.x + (s.x - a.x) * .12, a.y + (s.y - a.y) * .12), n.rotate(e - Math.PI / 2), u(n, -9, -6, 18, 15, 6), d(n, o.knees.c[0], 2), u(n, -7, -5, 14, 11, 5), d(n, o.knees.c[1], 1.4), n.fillStyle = "rgba(255,255,255,.25)", n.fillRect(-4, -3, 6, 2), n.restore();
		}
	}
	n.save(), n.translate(s.x, s.y), n.rotate(m);
	let D = S.g, [O, k, A] = S.c, oe = y ? 13 : 15, j = D === "hoodie" || D === "jacket", M = j ? oe + 1.5 : oe + .5;
	if (o.bag > 0) {
		let e = 1 + Math.min(o.bag, 8) * .09;
		u(n, -M - 5 * e, -44 - 6 * e, 2 * M + 10 * e, 40 * e, 8), d(n, "#2A2A2E", 2.2), n.strokeStyle = t, n.lineWidth = 1.6, n.beginPath(), n.moveTo(-M - 2 * e, -42 - 6 * e), n.lineTo(M + 2 * e, -42 - 6 * e), n.stroke();
	}
	(D === "crop" || D === "hoodiecrop") && (n.beginPath(), n.moveTo(-12, 4), n.lineTo(-11, -22), n.lineTo(11, -22), n.lineTo(12, 4), n.closePath(), d(n, o.skin, 2.2));
	let N = x.hw ? -7 : -2;
	n.beginPath(), n.moveTo(-14, N), n.lineTo(14, N), n.lineTo(15, 9), n.quadraticCurveTo(0, 13, -15, 9), n.closePath(), d(n, ie, 2.2), n.fillStyle = c(ie, .7), n.fillRect(-13.5, N + .5, 27, 2.8), x.g === "jeans" && (n.fillStyle = x.c[2], n.fillRect(-2, N + .3, 4, 3.2));
	let P = D === "crop" ? -17 : D === "hoodiecrop" ? -6 : j ? 8 : 5, F = j ? 15 : 13.5;
	D === "hoodie" && (n.beginPath(), n.ellipse(-6, -44, 11, 8, -.3, 0, a), d(n, c(O, .85), 2.2)), n.beginPath(), n.moveTo(-F, P), n.quadraticCurveTo(-F - 2, -16, -M, -34), n.quadraticCurveTo(-M + 1, -41, -6, -42.5), n.lineTo(6, -42.5), n.quadraticCurveTo(M - 1, -41, M, -34), n.quadraticCurveTo(F + 2, -16, F, P), n.quadraticCurveTo(0, P + 2.5, -F, P), n.closePath(), d(n, O, 2.2), n.save(), n.clip(), n.fillStyle = "rgba(0,0,0,.14)", n.fillRect(-F - 3, -44, 6, 60), n.fillStyle = "rgba(255,255,255,.06)", n.fillRect(F - 6, -44, 6, 60), n.restore(), (D === "hoodie" || D === "hoodiecrop") && (n.fillStyle = c(O, .8), n.fillRect(-F + .5, P - 4, 2 * F - 1, 3.6)), D === "hoodie" && (n.beginPath(), n.moveTo(-9, -3), n.lineTo(9, -3), n.lineTo(7, -14), n.lineTo(-7, -14), n.closePath(), n.fillStyle = c(O, .88), n.fill(), n.strokeStyle = "rgba(0,0,0,.5)", n.lineWidth = 1.2, n.stroke()), D === "jacket" && (n.strokeStyle = A, n.lineWidth = 1.2, n.beginPath(), n.moveTo(0, -41), n.lineTo(0, P), n.stroke()), j ? (n.beginPath(), n.ellipse(0, -41.5, 9.5, 4.6, 0, 0, a), d(n, D === "hoodie" ? c(O, .75) : k, 2)) : (n.beginPath(), n.moveTo(-5.5, -42.4), n.quadraticCurveTo(0, -36, 5.5, -42.4), n.closePath(), d(n, o.skin, 1.8)), D === "hoodie" && (n.strokeStyle = A, n.lineWidth = 1.5, n.beginPath(), n.moveTo(-3, -38), n.lineTo(-3.6, -29), n.moveTo(3, -38), n.lineTo(3.6, -30), n.stroke()), b(n, S.motif, A, O, D), o.bag > 0 && (n.strokeStyle = "#2A2A2E", n.lineWidth = 3.4, n.beginPath(), n.moveTo(-M + 3, -38), n.lineTo(-F + 2, -12), n.moveTo(M - 3, -38), n.lineTo(F - 2, -12), n.stroke()), n.restore();
	let se = p(s, m, -M + 3, -36), ce = p(s, m, M - 3, -36), le = [{
		s: se,
		h: i.hb,
		pref: i.eb,
		side: -1
	}, {
		s: ce,
		h: i.hf,
		pref: i.ef,
		side: 1
	}], ue = j || D === "hoodiecrop";
	for (let e of le) {
		let t = h(e.s.x, e.s.y, e.h.x, e.h.y, 22, 21, e.pref, e.side), r = t.j, i = t.e;
		if (ue) {
			f(n, [
				e.s.x,
				e.s.y,
				r.x,
				r.y,
				i.x,
				i.y
			], 11, O);
			let t = i.x - r.x, a = i.y - r.y, o = Math.hypot(t, a) || 1;
			if (n.strokeStyle = c(O, .75), n.lineWidth = 11, n.lineCap = "butt", n.beginPath(), n.moveTo(i.x - t / o * 5, i.y - a / o * 5), n.lineTo(i.x - t / o * 1.5, i.y - a / o * 1.5), n.stroke(), n.lineCap = "round", D === "jacket") {
				let t = e.s.x + (r.x - e.s.x) * .5, i = e.s.y + (r.y - e.s.y) * .5;
				n.strokeStyle = A, n.lineWidth = 11, n.lineCap = "butt", n.beginPath(), n.moveTo(t, i), n.lineTo(t + (r.x - e.s.x) * .15, i + (r.y - e.s.y) * .15), n.stroke(), n.lineCap = "round";
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
		], 13, O);
		o.elbows && (n.save(), n.translate(r.x, r.y), n.rotate(Math.atan2(i.y - r.y, i.x - r.x)), u(n, -5, -7, 11, 14, 5), d(n, o.elbows.c[1], 1.8), n.fillStyle = "rgba(255,255,255,.25)", n.fillRect(-2, -5, 4, 2), n.restore()), o.wrists && (n.save(), n.translate(i.x - (i.x - r.x) * .22, i.y - (i.y - r.y) * .22), n.rotate(Math.atan2(i.y - r.y, i.x - r.x)), u(n, -5, -6, 9, 12, 2.5), d(n, o.wrists.c[0], 1.6), n.fillStyle = o.wrists.c[1], n.fillRect(-3.5, -5, 2.4, 10), n.restore()), n.beginPath(), n.arc(i.x, i.y, 5.4, 0, a), d(n, o.skin, 2.1);
	}
	let I = p(s, m, 0, -41), L = p(s, m, 1.5, -57);
	j || f(n, [
		I.x,
		I.y,
		L.x,
		L.y + 6
	], 8, o.skin, 1.6), ee(n, L.x, L.y, m * .45 + i.tilt, i, o);
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
function ee(n, r, i, o, s, l) {
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
var x = [];
for (let e = -47; e <= 47; e += 4.7) x.push(e);
var S = (e) => {
	let t = Math.abs(e);
	return t > 33 ? (t - 33) * .6 : 0;
}, C = {
	c: [
		"#141416",
		"#C9A26B",
		t
	],
	motif: "lamp"
};
function te(t, n, i) {
	t.save(), t.translate(n.x, n.y), t.rotate(n.pitch);
	let o = Math.cos(n.roll), s = Math.sin(n.roll), l = Math.cos(n.yaw);
	Math.abs(l) < .24 && (l = l < 0 ? -.24 : .24);
	let u = 2.6, f = [], p = [];
	for (let e of x) {
		let t = -S(e) * o + u * .5 * o, n = 11 * Math.abs(s) + u * .5 * Math.abs(o) + .3;
		f.push(e * l, t - n), p.push(e * l, t + n);
	}
	let m = i.wheels ? i.wheels.c[0] : r, h = i.bearings ? i.bearings.c[1] : "rgba(0,0,0,.25)", g = i.trucks ? i.trucks.c : ["#B9BEC4", "#8A8F95"], _ = i.deck || C, v = i.griptape ? i.griptape.c : [
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
	} else t.save(), t.clip(), t.translate(0, u * .5 * o), t.transform(l, 0, 0, -s, 0, 0), w(t, _), t.restore(), t.strokeStyle = e, t.lineWidth = 2, t.stroke();
	o < 0 && (y(!1), y(!0)), t.restore();
}
function w(n, a) {
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
function ne(t, n, i = !0) {
	let o = n.deck || C, s = n.wheels ? n.wheels.c[0] : r, c = n.trucks ? n.trucks.c : ["#C3C8CE", "#8A8F95"];
	if (i) for (let e of [-31, 31]) for (let n of [-1, 1]) u(t, e - 5.5, n * 14.5 - 5, 11, 10, 3), d(t, s, 2), t.fillStyle = "rgba(0,0,0,.2)", t.fillRect(e - 5.5, n * 14.5 - .6, 11, 1.2);
	if (t.beginPath(), t.moveTo(-34, -15), t.lineTo(34, -15), t.bezierCurveTo(52, -15, 53, 15, 34, 15), t.lineTo(-34, 15), t.bezierCurveTo(-53, 15, -52, -15, -34, -15), t.closePath(), t.save(), t.clip(), w(t, o), t.fillStyle = "rgba(255,255,255,.08)", t.fillRect(-52, -15, 104, 4), t.restore(), t.strokeStyle = o.c[1], t.lineWidth = 3.5, t.stroke(), t.strokeStyle = e, t.lineWidth = 2, t.stroke(), i) for (let e of [-31, 31]) u(t, e - 4, -11, 8, 22, 3), d(t, c[0], 1.8), t.fillStyle = c[1], t.fillRect(e - 1, -9, 2, 18), t.beginPath(), t.arc(e, 0, 3, 0, a), d(t, c[1], 1.4);
}
function re(e, t, n, i) {
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
	else if (m === "deck" || m === "complete") e.translate(50, 50), e.rotate(-Math.PI / 4), e.scale(.82, .82), ne(e, {
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
		r && (e.save(), e.translate(6 + n * 22, 6 + n % 2 * 14), e.scale(.62, .62), re(e, r, {
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
var T = {
	bronze: ["#D98A4A", "#8A4E22"],
	silver: ["#DDE3EA", "#7E8894"],
	gold: ["#FFD54A", "#B07A10"]
};
function ie(t, n, r, o) {
	let [s, c] = T[n] || T.bronze, l = Math.cos(r * 3);
	t.save(), t.scale(Math.max(.15, Math.abs(l)), 1), t.beginPath(), t.arc(0, 0, 26, 0, a), d(t, c, 3), t.beginPath(), t.arc(0, -1.5, 22, 0, a), t.fillStyle = s, t.fill(), t.strokeStyle = "rgba(255,255,255,.5)", t.lineWidth = 2, t.beginPath(), t.arc(0, -1.5, 17, -2.6, -.8), t.stroke(), t.fillStyle = e, t.font = "18px " + i, t.textAlign = "center", t.textBaseline = "middle", t.fillText(o || "%", 0, 0), t.restore();
}
function E(t, i) {
	t.beginPath(), t.arc(0, 0, 22, 0, a), d(t, i === "boost" ? n : "#7C5CFF", 3), t.fillStyle = r, t.strokeStyle = e, t.lineWidth = 2, i === "boost" ? (t.beginPath(), t.moveTo(3, -15), t.lineTo(-9, 2), t.lineTo(-1, 2), t.lineTo(-4, 15), t.lineTo(9, -3), t.lineTo(1, -3), t.closePath(), t.fill(), t.stroke()) : (t.lineWidth = 7, t.strokeStyle = r, t.beginPath(), t.arc(0, -2, 9, Math.PI, 0), t.lineTo(9, 9), t.moveTo(-9, -2), t.lineTo(-9, 9), t.stroke(), t.fillStyle = e, t.fillRect(-12.5, 6, 7, 5), t.fillRect(5.5, 6, 7, 5));
}
var ae = {
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
var O = D(ae);
function k(e) {
	let t = String(e.name || "").toLowerCase();
	return /game ?over|pixel/.test(t) ? "pixel" : /halog|réfléchiss|reflechiss/.test(t) ? "reflect" : /night/.test(t) ? "night" : /cône|cone/.test(t) ? "cone" : /lampadaire|spawn point/.test(t) ? "lamp" : /respawn/.test(t) ? "R" : e.slot === "deck" ? "stripes" : null;
}
var A = (e) => [
	e.colors.primary,
	e.colors.secondary,
	e.colors.accent
];
function oe(e) {
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
	for (let t of j) r[t] = e.wear && e.wear[t] ? oe(O.byId.get(e.wear[t])) : null;
	return r.helmet && (r.head = null), r;
}
function se(e) {
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
var ce = {
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
}, le = /^(t-shirt|tee|crop|femme|homme|oversize|skate|de|hoodie|court|veste|coach|jean|baggy|large|pantalon|cargo|short|casquette|5|pans|bonnet|côtelé|docker|sneakers|basses|montantes|casque|genouillères|coudières|protège-poignets|plateau|roues|trucks|roulements|grip|look|complet|kit|protections|pack)$/i, ue = (e) => {
	let t = String(e.name).split(/[,:]/)[0].split(/\s+/), n = 0;
	for (; n < t.length - 1 && le.test(t[n]);) n++;
	let r = [];
	for (let e of t.slice(n)) if (r.length && /^[a-zà-ÿ]/.test(e) && !/^(mm|à|neuf|in)$/i.test(e) || (r.push(e), r.length >= 3)) break;
	let i = ce[e.gabarit] ?? "";
	return e.gabarit === "tshirt" && e.specs && e.specs.crop && (i = "Crop"), e.slot === "pack" && /kit/i.test(e.name) && (i = "Kit"), e.slot === "pack" && /^pack/i.test(e.name) && (i = "Pack"), ((i ? i + " " : "") + r.join(" ")).trim();
}, I = "respawn:";
function L(e, t) {
	try {
		let n = window.localStorage.getItem(I + e);
		return n == null ? t : JSON.parse(n);
	} catch {
		return t;
	}
}
function de(e, t) {
	try {
		return window.localStorage.setItem(I + e, JSON.stringify(t)), !0;
	} catch {
		return !1;
	}
}
//#endregion
//#region 2d/src/i18n.js
var R = {
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
	hint_grind: "Atterris sur le muret ou le rail : <em>GRIND</em> · attrape ce qui flotte au-dessus",
	hint_flip: "En l’air : <em>← → ↑ ↓</em> = FLIPS · garde appuyé = GRAB",
	hint_flipT: "En l’air : <em>glisse le doigt</em> = FLIPS · garde-le appuyé = GRAB",
	hint_perfect: "Appuie <em>juste avant</em> le sol : <em>PERFECT</em> = plus de vitesse",
	hint_kick: "Garde appuyé sur le tremplin : <em>décollage géant</em> (jetons en hauteur !)",
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
	demoMode: "mode démo"
}, fe = {
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
	hint_grind: "Land on the ledge or rail: <em>GRIND</em> · grab what floats above",
	hint_flip: "In the air: <em>← → ↑ ↓</em> = FLIPS · keep holding = GRAB",
	hint_flipT: "In the air: <em>swipe</em> = FLIPS · keep holding = GRAB",
	hint_perfect: "Press <em>just before</em> landing: <em>PERFECT</em> = more speed",
	hint_kick: "Hold on the kicker: <em>giant launch</em> (tokens up high!)",
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
	demoMode: "demo mode"
}, z = (() => {
	let e = L("lang", null);
	return e === "fr" || e === "en" ? e : /^fr/i.test(navigator.language || "fr") ? "fr" : "en";
})(), B = /* @__PURE__ */ new Set(), V = () => z;
function pe(e) {
	z = e === "en" ? "en" : "fr", de("lang", z), B.forEach((e) => e(z));
}
var me = (e) => (B.add(e), () => B.delete(e));
function H(e, t) {
	let n = (z === "en" ? fe : R)[e] ?? R[e] ?? e;
	if (t) for (let [e, r] of Object.entries(t)) n = n.replaceAll("{" + e + "}", r);
	return n;
}
var U = (e) => Math.round(e).toLocaleString(z === "en" ? "en-US" : "fr-FR").replace(/ | /g, " "), he = (e) => (Math.round(e * 100) / 100).toLocaleString(z === "en" ? "en-IE" : "fr-FR", {
	style: "currency",
	currency: "EUR",
	minimumFractionDigits: e % 1 ? 2 : 0
}), W = (e, t, n) => e + (t - e) * n, ge = (e, t, n) => (n = o((n - e) / (t - e), 0, 1), n * n * (3 - 2 * n)), _e = (e) => 1 - (1 - e) * (1 - e);
function ve(e) {
	return () => {
		e |= 0, e = e + 1831565813 | 0;
		let t = Math.imul(e ^ e >>> 15, 1 | e);
		return t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t, ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
var G = 2150, ye = 560, be = 820, xe = .17, Se = .05, Ce = {
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
}, we = {
	none: "Indy",
	l: "Melon",
	r: "Mute",
	u: "Stalefish",
	d: "Nosegrab"
}, Te = {
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
}, Ee = [
	"Gap du canal",
	"Canal de minuit",
	"Gap Respawn",
	"Gap des docks"
], De = 6;
function K(s, { audio: c, hooks: l = {}, autopilot: f = !1, exclusives: p = [], lootPool: m = [] } = {}) {
	let h = s.getContext("2d", { alpha: !1 }), g = c.SFX, _ = 0, v = 0, b = 1, ee = 1, x = 1, S = {}, C = {}, w = {
		mode: "scene",
		t: 0,
		clock: 0,
		score: 0,
		trickScore: 0,
		combo: null,
		bestCombo: 0,
		bestNames: "",
		perfects: 0,
		tricks: 0,
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
		ending: 0,
		hintI: 0,
		big: null,
		hop: 0,
		lastJoint: 0,
		slowAt: 6,
		paused: !1,
		loot: [],
		topKmh: 0,
		x0: 0,
		distPts: 0,
		speedPts: 0,
		boostT: 0,
		magnetT: 0,
		seed: 1,
		inputs: [],
		catches: [],
		scene: {
			look: null,
			rect: null,
			kind: "wardrobe"
		}
	}, T = {}, ae = {
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
	}, D = [], k = [], A = {
		down: !1,
		pressEvt: !1,
		relEvt: !1,
		flick: null,
		dir: {
			l: 0,
			r: 0,
			u: 0,
			d: 0
		},
		tx: 0,
		ty: 0,
		swiped: !1,
		tdx: 0,
		tdy: 0
	}, j = null, M = 0, N = 0, P = 0, F = !1, se = !1, ce = /* @__PURE__ */ new Map(), le = /* @__PURE__ */ new Map(), I = 1;
	function L(e, t, n, r) {
		let i = 2 ** (Math.ceil(Math.log2(Math.max(.25, I)) * 2) / 2), a = e + "@" + i, o = le.get(a);
		if (!o) {
			le.size > 80 && le.clear(), o = document.createElement("canvas"), o.width = Math.ceil(t * i), o.height = Math.ceil(n * i);
			let e = o.getContext("2d");
			e.scale(i, i), e.translate(t / 2, n / 2), r(e), le.set(a, o);
		}
		return o;
	}
	function de() {
		let e = s.getBoundingClientRect();
		_ = Math.max(1, e.width), v = Math.max(1, e.height), b = Math.min(window.devicePixelRatio || 1, 2), _ * v * b * b > 52e5 && (b = Math.max(1, Math.sqrt(52e5 / (_ * v)))), ee = Math.min(b, 1.5), s.width = Math.round(_ * b), s.height = Math.round(v * b), x = Math.min(v / 620, _ / (v > _ ? 560 : 980)), z();
	}
	function R(e, t, n) {
		n = n || ee;
		let r = document.createElement("canvas");
		r.width = Math.max(1, Math.ceil(e * n)), r.height = Math.max(1, Math.ceil(t * n));
		let i = r.getContext("2d");
		return i.setTransform(n, 0, 0, n, 0, 0), [r, i];
	}
	function fe(e, t, n, r, i) {
		e.beginPath(), e.moveTo(t - r / 2 + i, n - i / 2), e.lineTo(t + r / 2 - i, n - i / 2), e.arc(t + r / 2 - i, n, i / 2, -Math.PI / 2, Math.PI / 2), e.lineTo(t - r / 2 + i, n + i / 2), e.arc(t - r / 2 + i, n, i / 2, Math.PI / 2, Math.PI * 1.5), e.fill();
	}
	function z() {
		let e = ve(11), t, n, r;
		[t, n] = R(_, v, 1), r = n.createLinearGradient(0, 0, 0, v), r.addColorStop(0, "#1F1438"), r.addColorStop(.28, "#4A1E5C"), r.addColorStop(.5, "#9C3460"), r.addColorStop(.66, "#E25A4E"), r.addColorStop(.8, "#FF9A52"), r.addColorStop(1, "#FFC874"), n.fillStyle = r, n.fillRect(0, 0, _, v), S.skyD = t, [t, n] = R(_, v, 1), r = n.createLinearGradient(0, 0, 0, v), r.addColorStop(0, "#05061A"), r.addColorStop(.4, "#140F33"), r.addColorStop(.7, "#2D1846"), r.addColorStop(1, "#5B2448"), n.fillStyle = r, n.fillRect(0, 0, _, v);
		for (let t = 0; t < 160; t++) {
			let t = e() * _, r = e() * v * .55;
			n.fillStyle = "rgba(243,240,232," + (.25 + e() * .6).toFixed(2) + ")";
			let i = e() < .08 ? 2 : 1.2;
			n.fillRect(t, r, i, i);
		}
		S.skyN = t;
		let i = Math.round(110 * x);
		[t, n] = R(i * 5, i * 5);
		let o = i * 2.5;
		r = n.createRadialGradient(o, o, i * .6, o, o, i * 2.5), r.addColorStop(0, "rgba(255,190,120,.55)"), r.addColorStop(1, "rgba(255,140,80,0)"), n.fillStyle = r, n.fillRect(0, 0, i * 5, i * 5), r = n.createLinearGradient(0, o - i, 0, o + i), r.addColorStop(0, "#FFF4C2"), r.addColorStop(.6, "#FFC067"), r.addColorStop(1, "#FF7A45"), n.fillStyle = r, n.beginPath(), n.arc(o, o, i, 0, a), n.fill(), n.globalCompositeOperation = "destination-out";
		for (let e = 0; e < 6; e++) n.fillRect(0, o + i * (.12 + e * .15), i * 5, i * (.025 + e * .016));
		n.globalCompositeOperation = "source-over", S.sun = t, S.sunR = i;
		let s = Math.ceil(Math.max(_, 1100) * 1.3);
		S.TW = s, [t, n] = R(s, v * .6);
		for (let t = 0; t < 9; t++) {
			let t = e() * s, i = v * (.08 + e() * .38), a = (160 + e() * 320) * x, o = (10 + e() * 14) * x;
			for (let e of [
				0,
				-s,
				s
			]) r = n.createLinearGradient(0, i - o, 0, i + o), r.addColorStop(0, "rgba(255,170,140,.55)"), r.addColorStop(1, "rgba(150,60,110,.35)"), n.fillStyle = r, fe(n, t + e, i, a, o), fe(n, t + e + a * .25, i - o * .7, a * .5, o * .8);
		}
		S.clouds = t, S.far = B(s, e, {
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
		}), S.mid = B(s, e, {
			minH: 150,
			maxH: 360,
			minW: 70,
			maxW: 170,
			col1: "#40204F",
			col2: "#56285E",
			base: 470,
			detail: 1,
			glow: !0
		}), S.near = me(s, e), [t, n] = R(_ / 4, v / 4, 1), r = n.createRadialGradient(_ / 8, v / 8, Math.min(_, v) / 12, _ / 8, v / 8, Math.max(_, v) / 5.2), r.addColorStop(0, "rgba(0,0,0,0)"), r.addColorStop(1, "rgba(6,4,14,.55)"), n.fillStyle = r, n.fillRect(0, 0, _ / 4, v / 4), S.vig = t, ce.clear();
	}
	function B(e, i, a) {
		let o = x, s = a.base * o, c = s - 60 * o, [l, u] = R(e, s), [d, f] = a.glow ? R(e, s) : [null, null], p = -20 * o, m = [];
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
			g = e.x + e.w * .5, V(u, f, g, c - e.h - 20 * o, o, "RESPAWN", t, 34);
			let i = m[Math.floor(m.length * .78)] || m[1];
			pe(u, f, i.x + i.w - 14 * o, c - i.h + 40 * o, o, "SKATE", n);
			let a = m[Math.floor(m.length * .12)] || m[0];
			V(u, f, a.x + a.w * .5, c - a.h - 16 * o, o, "24/7", r, 20);
		}
		return {
			c: l,
			gc: d,
			h: s,
			base: c,
			signX: g
		};
	}
	function V(e, t, n, r, i, a, o, s) {
		let c = s * i;
		t.font = c + "px \"Anton\",Impact,\"Haettenschweiler\",\"Futura Condensed ExtraBold\",\"Arial Narrow\",sans-serif";
		let l = t.measureText(a).width;
		e.fillStyle = "#2A1733", e.fillRect(n - l / 2 - 8 * i, r - c * .95, l + 16 * i, c * 1.1), e.fillRect(n - l / 2, r, 3 * i, 20 * i), e.fillRect(n + l / 2 - 3 * i, r, 3 * i, 20 * i), t.save(), t.textAlign = "center", t.shadowColor = o, t.shadowBlur = 18 * i, t.fillStyle = o, t.fillText(a, n, r - c * .12), t.shadowBlur = 6 * i, t.fillText(a, n, r - c * .12), t.shadowBlur = 0, t.fillStyle = "rgba(255,255,255,.55)", t.globalAlpha = .5, t.fillText(a, n, r - c * .12), t.restore();
	}
	function pe(e, t, n, r, i, a, o) {
		let s = 18 * i;
		e.fillStyle = "#2A1733", e.fillRect(n - 12 * i, r - 4 * i, 24 * i, a.length * s * .95 + 8 * i), t.save(), t.font = s + "px \"Anton\",Impact,\"Haettenschweiler\",\"Futura Condensed ExtraBold\",\"Arial Narrow\",sans-serif", t.textAlign = "center", t.shadowColor = o, t.shadowBlur = 14 * i, t.fillStyle = o;
		for (let e = 0; e < a.length; e++) t.fillText(a[e], n, r + s * .85 + e * s * .95);
		t.restore();
	}
	function me(e, t) {
		let n = x, r = 340 * n, i = r - 50 * n, [o, s] = R(e, r), [c, l] = R(e, r), u = "#22142C";
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
	function U(e) {
		let t = ve(e);
		Object.assign(C, {
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
		});
		let n = (e, t, n) => {
			C.segs.push({
				x0: C.x,
				y0: C.y,
				x1: e,
				y1: t,
				kind: n
			}), C.x = e, C.y = t;
		}, r = () => 600 + 260 * o(C.x / 42e3, 0, 1) + 90, i = (e) => e * (r() / 640), a = (e) => n(C.x + i(e), C.y, "flat"), s = (e) => C.lamps.push({
			x: e,
			y: C.y
		}), c = (e, n, r) => C.walls.push({
			x0: e,
			x1: n,
			y: C.y,
			h: r || 170 + t() * 60,
			g: Math.floor(t() * 5)
		}), l = (e) => C.hints.push({
			x: C.x - 250,
			k: e
		}), u = (e) => e[Math.floor(t() * e.length)], d = (e, n, r, i) => C.items.push({
			k: e,
			x: n,
			y: r,
			ox: n,
			oy: r,
			taken: !1,
			ph: t() * 6,
			...i
		}), f = (e, t) => {
			m.length && d("prod", e, t, { id: u(m) });
		}, h = 0, g = {
			cone() {
				a(240);
				let e = t() < .45 ? 2 : 1;
				t() < .5 && c(C.x - 200, C.x + 420);
				for (let t = 0; t < e; t++) C.cones.push({
					x: C.x + 60 + t * 44,
					y: C.y,
					hit: 0
				});
				t() < .2 ? d("token", C.x + 70, C.y - 262, { tier: "bronze" }) : t() < .3 && f(C.x + 70, C.y - 200), a(e * 44 + 400), t() < .5 && s(C.x - 200);
			},
			ledge() {
				a(220);
				let e = 300 + (t() * 160 | 0), n = u([
					"beton",
					"banc",
					"manny"
				]);
				t() < .7 && c(C.x - 160, C.x + e + 160);
				let r = {
					x0: C.x,
					x1: C.x + e,
					y: C.y,
					top: C.y - (n === "manny" ? 34 : 44),
					style: n
				};
				C.ledges.push(r), t() < .42 && f(C.x + e * .6, r.top - 95), a(e + 330), s(C.x - 120);
			},
			rail() {
				a(220);
				let e = 360 + (t() * 180 | 0);
				t() < .5 && c(C.x - 100, C.x + e + 100), C.rails.push({
					x0: C.x,
					y0: C.y - 56,
					x1: C.x + e,
					y1: C.y - 56,
					style: t() < .5 ? "rond" : "plat"
				}), t() < .45 && f(C.x + e * .7, C.y - 56 - 92), a(e + 340);
			},
			stairs(e) {
				a(280), s(C.x - 180);
				let r = 5 + (t() * 4 | 0), i = C.x, o = C.y;
				if (n(i + r * 30, o + r * 19, "stairs"), C.stairs.push({
					x0: i,
					y0: o,
					n: r,
					run: 30,
					rise: 19
				}), e) {
					let e = {
						x0: i - 24,
						y0: o - 50 - 456 / 30,
						x1: i + r * 30 - 6,
						y1: o + r * 19 - 50 - 114 / 30,
						style: "main"
					};
					C.rails.push(e), C.exclAt === h ? d("excl", e.x1 + 40, e.y1 - 120, { id: C.excl }) : t() < .5 && f(e.x1 - 30, e.y1 - 95);
				} else t() < .5 && f(i + r * 30 * .5, o - 210);
				a(500);
			},
			gap() {
				a(260);
				let e = C.x, i = C.y;
				n(e + 120, i - 46, "kick");
				let o = C.x;
				C.y = i + 170, n(o + 300, i + 170, "pit"), C.y = i, C.gaps.push({
					x0: o,
					x1: o + 300,
					y: i,
					name: Ee[C.gaps.length % Ee.length]
				});
				let c = r(), l = t();
				C.exclAt === h ? d("excl", o + c * .45, i - 400, { id: C.excl }) : l < .09 ? d("token", o + c * .456, i - 418, { tier: "gold" }) : l < .36 ? d("token", o + c * .34, i - 352, { tier: "silver" }) : f(o + c * .3, i - 230), a(520), s(C.x - 300);
			},
			bank() {
				a(180), n(C.x + 300, C.y - 120, "bank"), a(380), s(C.x - 200);
			},
			drop() {
				a(300), C.props.push({
					k: "drop",
					x: C.x,
					y: C.y
				}), C.y += 100, a(480);
			},
			combo() {
				a(200), C.ledges.push({
					x0: C.x,
					x1: C.x + 280,
					y: C.y,
					top: C.y - 44,
					style: "beton"
				}), c(C.x - 100, C.x + 280 + 700), a(530), C.rails.push({
					x0: C.x,
					y0: C.y - 56,
					x1: C.x + 380,
					y1: C.y - 56,
					style: "rond"
				}), t() < .5 && f(C.x + 190, C.y - 150), a(720);
			},
			bonus(e) {
				a(260), d(e, C.x, C.y - 70), a(240);
			}
		};
		C.excl = p.length && t() < .35 ? u(p) : null, C.exclAt = C.excl ? 14 + Math.floor(t() * 20) : -1, n(-1100, 0, "flat"), n(200, 0, "flat"), C.introWall = {
			x0: -1250,
			x1: -60,
			y: 0
		}, s(-1150), s(60), C.props.push({
			k: "bin",
			x: -760,
			y: 0
		}, {
			k: "hydrant",
			x: -140,
			y: 0
		}), l("ollie"), g.cone(), g.cone(), l("grind"), g.ledge(), g.rail(), l("flip"), g.stairs(!1), l("kick"), g.gap(), l("perfect"), g.bank(), g.stairs(!0), g.combo();
		let _ = [
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
		for (; C.x < 64e3;) {
			h++;
			let e = u(_);
			h % 7 == 3 ? e = "boost" : h % 11 == 6 && (e = "magnet"), C.exclAt === h && !["stairsR", "gap"].includes(e) && (e = t() < .5 ? "stairsR" : "gap"), C.y > 140 && t() < .8 && e !== "boost" && e !== "magnet" && (e = "bank"), C.y < -120 && e === "bank" && (e = "rail"), e === "stairsR" ? g.stairs(!0) : e === "boost" || e === "magnet" ? g.bonus(e) : g[e]();
		}
		a(4e3), C.grind = [...C.ledges.map((e) => ({
			x0: e.x0,
			x1: e.x1,
			y0: e.top,
			y1: e.top,
			o: e,
			kind: "ledge"
		})), ...C.rails.map((e) => ({
			x0: e.x0,
			x1: e.x1,
			y0: e.y0,
			y1: e.y1,
			o: e,
			kind: "rail"
		}))].sort((e, t) => e.x0 - t.x0), C.items.sort((e, t) => e.x - t.x);
	}
	function he(e) {
		let t = C.segs, n = 0, r = t.length - 1;
		for (; n < r;) {
			let i = n + r + 1 >> 1;
			t[i].x0 <= e ? n = i : r = i - 1;
		}
		return n;
	}
	function K(e) {
		let t = C.segs[he(e)], n = t.x1 > t.x0 ? o((e - t.x0) / (t.x1 - t.x0), 0, 1) : 0;
		return {
			y: t.y0 + (t.y1 - t.y0) * n,
			ang: Math.atan2(t.y1 - t.y0, t.x1 - t.x0),
			s: t
		};
	}
	let Oe = (e, t) => e.y0 + (e.y1 - e.y0) * (e.x1 > e.x0 ? o((t - e.x0) / (e.x1 - e.x0), 0, 1) : 0), ke = {
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
	}, Ae = (e) => {
		w.mode === "run" && w.inputs.length < 4e3 && w.inputs.push([Math.round(w.clock * 1e3), e]);
	};
	function je() {
		A.down || (A.down = !0, A.pressEvt = !0, c.unlock(), Ae("p"));
	}
	function Me() {
		A.down && (A.down = !1, A.relEvt = !0, Ae("r"));
	}
	function Ne(e) {
		A.flick = e, Ae("f" + e);
	}
	function Pe(e) {
		if (w.mode !== "run" || w.paused) return !1;
		if (e.code === "Space" || e.code === "Enter") return e.preventDefault(), e.repeat || je(), !0;
		let t = ke[e.code];
		return t ? (e.preventDefault(), e.repeat || (A.dir[t] = 1, Ne(t)), !0) : !1;
	}
	function Fe(e) {
		(e.code === "Space" || e.code === "Enter") && w.mode === "run" && (e.preventDefault(), Me());
		let t = ke[e.code];
		t && (A.dir[t] = 0);
	}
	let Ie = (e) => {
		if (!(w.mode !== "run" || w.paused)) {
			e.preventDefault();
			try {
				s.setPointerCapture(e.pointerId);
			} catch {}
			A.tx = e.clientX, A.ty = e.clientY, A.swiped = !1, A.tdx = A.tdy = 0, je();
		}
	}, q = (e) => {
		if (!A.down || w.mode !== "run") return;
		let t = e.clientX - A.tx, n = e.clientY - A.ty;
		A.tdx = t, A.tdy = n, !A.swiped && Math.hypot(t, n) > 26 && (A.swiped = !0, Ne(Math.abs(t) > Math.abs(n) ? t < 0 ? "l" : "r" : n < 0 ? "u" : "d"));
	}, Le = () => {
		w.mode === "run" && Me();
	};
	s.addEventListener("pointerdown", Ie), s.addEventListener("pointermove", q), s.addEventListener("pointerup", Le), s.addEventListener("pointercancel", Le), s.addEventListener("contextmenu", (e) => e.preventDefault());
	function Re() {
		let e = A.dir;
		return e.d ? "d" : e.l ? "l" : e.r ? "r" : e.u ? "u" : A.down && Math.hypot(A.tdx, A.tdy) > 26 ? Math.abs(A.tdx) > Math.abs(A.tdy) ? A.tdx < 0 ? "l" : "r" : A.tdy < 0 ? "u" : "d" : null;
	}
	function J(e) {
		D.length > 260 && D.shift(), D.push(e);
	}
	function Y(e, t, n, r, i, a, o) {
		k.push({
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
	function ze(e, t, n, r) {
		w.big = {
			text: e,
			col: t || "#C8FF2E",
			sub: n,
			t: 0,
			life: r || 1.2
		};
	}
	let Be = (e) => l.onCombo && l.onCombo(w.combo ? {
		names: w.combo.names,
		pts: w.combo.pts,
		mult: Math.min(De, w.combo.mult)
	} : null, e);
	function Ve(e, t, n) {
		w.combo || (w.combo = {
			names: [],
			pts: 0,
			mult: 0
		});
		let i = w.combo;
		i.names.push(e), i.pts += t, i.mult += 1, w.tricks++, T.speedBonus = Math.min(320, T.speedBonus + 7), n !== !1 && Y(e.toUpperCase(), T.x + 10, T.y - 175, r, 24, 1, "+" + t), i.mult >= w.slowAt && (w.slowAt = i.mult < 10 ? 10 : i.mult + 5, He(i.mult)), Be();
	}
	function He(e) {
		w.slowT = .55, g.slow(), ze(H("combo") + " ×" + Math.min(De, e), t, "", 1.1), w.shake = Math.max(w.shake, 7);
		for (let e = 0; e < 34; e++) J({
			x: T.x,
			y: T.y - 80,
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
	}
	function Ue() {
		let e = w.combo;
		if (!e) return;
		w.combo = null;
		let n = Math.round(e.pts * Math.min(De, e.mult));
		w.trickScore += n, n > w.bestCombo && (w.bestCombo = n, w.bestNames = e.names.slice(-8).join(" + ") + (e.names.length > 8 ? " …" : "")), e.mult > 1 && (g.bank(e.mult), Y("+" + n, T.x + 40, T.y - 230, t, 30, 1.2)), Be({ banked: n }), w.slowAt = 6;
	}
	function We() {
		w.combo && (w.combo = null, w.slowAt = 6, Be({ lost: !0 }));
	}
	function Ge() {
		return 560 + 180 * o(w.t / 60, 0, 1) + T.speedBonus + (w.boostT > 0 ? 240 : 0);
	}
	function Ke(e) {
		let t = K(e);
		Object.assign(T, {
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
			speedBonus: T.speedBonus || 0,
			landVy: 0
		});
	}
	function qe(e, t) {
		let n = W(ye, be, _e(o((w.clock - Math.max(T.holdFrom, T.lastPress)) / .32, 0, 1))), r = Math.min(0, T.vx * Math.tan(T.ang));
		T.grind && Ze(), T.vy = r - n * (e ? .85 : 1), T.state = "air", T.popT = 0, T.airT = 0, T.popped = !e, T.airTricks = 0, T.pressAir = !1, T.lastFlip = null, T.flipCount = 0, T.crouch = .9, T.stairsOver = C.stairs.find((e) => e.x0 > T.x - 10 && e.x0 < T.x + 260) || null, g.pop();
		for (let e = 0; e < 6; e++) J({
			x: T.x - 30,
			y: T.y,
			vx: -200 - Math.random() * 200,
			vy: -Math.random() * 120,
			life: .45,
			t: 0,
			k: "dust",
			s: 8 + Math.random() * 8
		});
	}
	function Je(e) {
		let t = Ce[e];
		T.flip = {
			d: e,
			f: t,
			t: 0,
			dur: t.dur
		}, g.flip();
	}
	function Ye(e) {
		let t = T.flip.f, n = t.n, r = t.pts;
		T.lastFlip === t.n ? (T.flipCount++, n = (T.flipCount === 2 ? "Double " : T.flipCount === 3 ? "Triple " : "Quad ") + t.n, r = Math.round(r * 1.4 * T.flipCount)) : T.flipCount = 1, T.lastFlip = t.n, e && (r = Math.round(r * .5)), T.flip = null, T.airTricks++, Ve(n, r);
	}
	function X() {
		let e = T.grab;
		T.grab = null, e && (T.airTricks++, Ve(e.name + " Grab", Math.round(60 + e.t * 220)));
	}
	function Xe(e) {
		T.flip && Ye(T.flip.t / T.flip.dur < .6), T.grab && X();
		let t = Re() || "none", n = Te[e.kind][t] || Te[e.kind].none;
		T.state = "grind", T.grind = {
			g: e,
			t: 0,
			name: n,
			d: t
		}, T.y = Oe(e, T.x), T.vy = 0, T.crouch = .7, T.landT = 0, g.grindIn(), w.shake = Math.max(w.shake, 2.5);
		for (let e = 0; e < 10; e++) J({
			x: T.x,
			y: T.y,
			vx: (Math.random() - .3) * 500,
			vy: -Math.random() * 400,
			life: .35,
			t: 0,
			k: "spark"
		});
	}
	function Ze() {
		let e = T.grind;
		e && (T.grind = null, Ve(e.name, Math.round(70 + e.t * 160)));
	}
	function Qe(e) {
		T.y = e.y, T.ang = e.ang, T.state = "ride", T.vy = 0;
		let i = "ok";
		T.flip && (Ye(T.flip.t / T.flip.dur < .6), i = "limite"), T.flipQ = null, T.grab && (X(), i = "rattrape");
		let a = w.clock - T.lastPress;
		if (T.pressAir && a >= 0 && a <= xe && i === "ok" && (i = "perfect"), T.popped && T.airTricks === 0 && (Ve("Ollie", 30, !1), T.airTricks++), T.kick) {
			let e = T.kick;
			T.x > e.x1 && (Ve(e.name, 200), T.speedBonus = Math.min(320, T.speedBonus + 10)), T.kick = null;
		}
		if (T.stairsOver) {
			let e = T.stairsOver;
			T.x > e.x0 + e.n * e.run && Ve(H("steps", { n: e.n }), 60 + e.n * 15), T.stairsOver = null;
		}
		if (w.combo && (T.airTricks > 0 || w.combo)) {
			if (i === "perfect") {
				w.combo.pts += 40, w.combo.mult += 1, w.perfects++, T.speedBonus = Math.min(320, T.speedBonus + 18), g.perfect(), Y(H("perfect"), T.x, T.y - 120, t, 34, 1), Be();
				for (let e = 0; e < 14; e++) J({
					x: T.x + (Math.random() - .5) * 60,
					y: T.y,
					vx: (Math.random() - .5) * 300,
					vy: -100 - Math.random() * 300,
					life: .6,
					t: 0,
					k: "star",
					c: t
				});
			} else i === "limite" ? Y(H("sketchy"), T.x, T.y - 120, n, 24, .8) : i === "rattrape" ? Y(H("caught"), T.x, T.y - 120, n, 24, .8) : Y(H("good"), T.x, T.y - 120, r, 20, .7);
			T.linkT = i === "perfect" ? 1.15 : .75;
		}
		T.landT = 0, T.crouch = 1, T.popped = !1, T.airTricks = 0, T.pressAir = !1, T.holdFrom = w.clock;
		let s = o((T.landVy || 800) / 1600, 0, 1);
		g.land(s), w.shake = Math.max(w.shake, 2 + s * 5);
		for (let e = 0; e < 12; e++) J({
			x: T.x + (Math.random() - .5) * 70,
			y: T.y,
			vx: (Math.random() - .5) * 360 + T.vx * .15,
			vy: -Math.random() * 160,
			life: .5 + Math.random() * .3,
			t: 0,
			k: "dust",
			s: 7 + Math.random() * 10
		});
	}
	function $e() {
		T.state === "bail" || T.inv > 0 || (T.state = "bail", T.bailT = 0, T.flip = null, T.grab = null, T.grind = null, T.speedBonus = 0, w.boostT = 0, T.bb = {
			x: T.x,
			y: T.y - 8,
			vx: T.vx * .6,
			vy: -520,
			rot: 0,
			vr: 14
		}, T.vy = -420, We(), g.bail(), w.shake = 10, Y(H("ouch"), T.x, T.y - 170, n, 34, .9), l.onBail && l.onBail());
	}
	function et() {
		let e = T.x + 240;
		for (let t = 0; t < 20; t++) {
			let t = !1;
			for (let n of C.ledges) e > n.x0 - 60 && e < n.x1 + 40 && (e = n.x1 + 90, t = !0);
			let n = K(e).s;
			if (n.kind !== "flat" && (e = n.x1 + 60, t = !0), !t) break;
		}
		let n = T.vx;
		Ke(e), T.vx = Math.max(420, n * .7), T.inv = 1.3, ze(H("respawn"), t, H("respawnSub"), 1.1), g.go();
		for (let e = 0; e < 24; e++) J({
			x: T.x,
			y: T.y - 60,
			vx: (Math.random() - .5) * 500,
			vy: (Math.random() - .5) * 500,
			life: .6,
			t: 0,
			k: "star",
			c: t
		});
	}
	function tt(e) {
		let t = T.x - 60, n = T.x + 60, r = T.y - 160 - (T.state === "grind" ? 12 : 19), i = T.y + 10, a = w.magnetT > 0;
		for (let o of C.items) {
			if (o.x > T.x + 420) break;
			if (o.taken || o.x < T.x - 400) continue;
			a && Math.abs(o.x - T.x) < 340 && (o.x = W(o.x, T.x, 1 - Math.exp(-e * 7)), o.y = W(o.y, T.y - 80, 1 - Math.exp(-e * 7)));
			let s = o.k === "token" || o.k === "excl" ? 26 : 22;
			o.x + s > t && o.x - s < n && o.y + s > r && o.y - s < i && T.state !== "bail" && nt(o);
		}
	}
	function nt(e) {
		e.taken = !0;
		let r = Math.round(w.clock * 1e3);
		for (let n = 0; n < 20; n++) J({
			x: e.x,
			y: e.y,
			vx: (Math.random() - .5) * 600,
			vy: (Math.random() - .5) * 600,
			life: .6,
			t: 0,
			k: "star",
			c: e.k === "token" ? "#FFD54A" : t
		});
		if (e.k === "boost") {
			w.boostT = 3.2, g.boost(), ze(H("boost"), n, "", .8), w.shake = 4, w.catches.push([r, "boost"]);
			return;
		}
		if (e.k === "magnet") {
			w.magnetT = 7, g.magnet(), ze(H("magnet"), "#B9A6FF", "", .8), w.catches.push([r, "magnet"]);
			return;
		}
		let i = {
			k: e.k,
			id: e.id,
			tier: e.tier,
			ms: r
		};
		if (w.loot.push(i), w.catches.push([
			r,
			e.k,
			e.tier || e.id
		]), e.k === "token") g.token(), ze(H("tier_" + e.tier).toUpperCase(), e.tier === "gold" ? "#FFD54A" : e.tier === "silver" ? "#DDE3EA" : "#E7A06A", "", 1.2), w.shake = 6;
		else {
			g.loot();
			let n = O.byId.get(e.id);
			Y("+ " + (n ? ue(n) : "").toUpperCase(), e.x, e.y - 50, e.k === "excl" ? "#FFD54A" : t, 20, 1.3, e.k === "excl" ? "EXCLU !" : H("loot").toUpperCase());
		}
		l.onCatch && l.onCatch(i);
	}
	function rt(e) {
		let t = T, r = A.pressEvt, i = A.relEvt, a = A.flick;
		A.pressEvt = A.relEvt = !1, A.flick = null, r && (t.lastPress = w.clock, t.pressAir = t.state === "air"), t.inv > 0 && (t.inv -= e), !w.combo && t.state === "ride" && (t.speedBonus = Math.max(0, t.speedBonus - 4 * e)), t.state !== "bail" && (t.vx = W(t.vx, w.ending > 0 ? 0 : Ge(), e * (w.ending > 0 ? 1.4 : w.boostT > 0 ? 3 : .9)));
		let s = t.vy;
		if (t.state === "ride") {
			if (t.landT += e, t.crouch = W(t.crouch, A.down ? 1 : .18, 1 - Math.exp(-e * (A.down ? 14 : 7))), i && w.ending <= 0) {
				qe(!1);
				return;
			}
			let n = t.x, r = t.x + t.vx * e, a = K(n).s, o = K(r), s = o.s;
			if (s !== a) {
				if (a.kind === "kick") {
					let e = A.down;
					t.x = a.x1, t.y = a.y1, t.vy = e ? -980 : -720, t.state = "air", t.popT = e ? 0 : 9, t.airT = 0, t.airTricks = 0, t.popped = !1, t.kick = C.gaps.find((e) => Math.abs(e.x0 - a.x1) < 2) || null, t.lastFlip = null, t.flipCount = 0, e && (g.pop(), A.down = !1, t.pressAir = !1, w.shake = 4);
					return;
				}
				if (s.kind === "stairs" || s.y0 > a.y1 + 3) {
					t.state = "air", t.vy = Math.max(0, t.vx * Math.tan(t.ang)), t.popT = 9, t.airT = 0, t.airTricks = 0, t.popped = !1, t.lastFlip = null, t.flipCount = 0, t.stairsOver = s.kind === "stairs" && C.stairs.find((e) => e.x0 === s.x0) || null, t.x = r;
					return;
				}
				if (s.y0 < a.y1 - 3) {
					$e();
					return;
				}
			}
			for (let e of C.ledges) if (n < e.x0 && r >= e.x0 && t.y > e.top + 2) {
				$e();
				return;
			}
			t.x = r, t.y = o.y, t.ang = o.ang, s.kind === "stairs" ? (t.jitter = Math.floor(t.x / 30) % 2 * 2, Math.floor(r / 30) !== Math.floor(n / 30) && g.clack()) : t.jitter = 0;
			let c = Math.floor(r / 200);
			c !== w.lastJoint && (w.lastJoint = c, s.kind === "flat" && Math.random() < .7 && g.clack()), w.combo && (A.down && (t.linkT = Math.max(t.linkT, .25)), t.linkT -= e, (t.linkT <= 0 && !A.down || t.linkT < -1.2) && Ue());
		} else if (t.state === "air") {
			t.airT += e, t.popT += e, t.vy = Math.min(t.vy + G * e, 2600);
			let n = t.x, r = t.y;
			if (t.x += t.vx * e, t.y += t.vy * e, t.crouch = W(t.crouch, .55, 1 - Math.exp(-e * 6)), a && (!t.flip && !t.grab ? Je(a) : t.flip && (t.flipQ = a)), t.flip && (t.flip.t += e, t.flip.t >= t.flip.dur && (Ye(!1), t.flipQ && (Je(t.flipQ), t.flipQ = null))), A.down && t.pressAir && !t.flip && w.clock - t.lastPress > .16 && t.airT > .1 ? (t.grab || (t.grab = {
				t: 0,
				name: we[Re() || "none"] || "Indy"
			}), t.grab.t += e) : t.grab && !A.down && X(), t.vy > -80) for (let e of C.grind) {
				if (e.x0 > t.x + 20) break;
				if (e.x1 < t.x - 2) continue;
				let i = Oe(e, t.x);
				if ((r <= Oe(e, n) + 3 && t.y >= i - 1 || e.kind === "ledge" && n < e.x0 && t.x >= e.x0 && t.y > e.y0 && t.y - e.y0 < 28) && t.x < e.x1 - 24) {
					Xe(e);
					return;
				}
			}
			for (let e of C.ledges) if (n < e.x0 && t.x >= e.x0 && t.y > e.top + 2) {
				if (t.y - e.top < 28) {
					t.y = e.top, Xe(C.grind.find((t) => t.o === e));
					return;
				}
				$e();
				return;
			}
			let i = K(t.x);
			if (t.y >= i.y) {
				let e = K(n);
				t.landVy = t.vy, r <= i.y + 2 || i.s === e.s || t.y - i.y < 36 ? Qe(i) : $e();
			}
		} else if (t.state === "grind") {
			let n = t.grind, r = n.g;
			n.t += e, t.crouch = W(t.crouch, .42, 1 - Math.exp(-e * 8)), t.x += t.vx * e, t.y = Oe(r, t.x), t.ang = Math.atan2(r.y1 - r.y0, r.x1 - r.x0);
			for (let e = 0; e < 2; e++) J({
				x: t.x + (n.d === "l" ? -28 : n.d === "r" ? 26 : 0) + (Math.random() - .5) * 20,
				y: t.y - 2,
				vx: -t.vx * .5 - Math.random() * 260,
				vy: -60 - Math.random() * 360,
				life: .28 + Math.random() * .25,
				t: 0,
				k: "spark"
			});
			if (i) {
				qe(!0);
				return;
			}
			t.x >= r.x1 && (Ze(), t.state = "air", t.vy = t.vx * Math.tan(t.ang) - 40, t.popT = 9, t.airT = 0, t.airTricks = 1, t.popped = !1, t.lastFlip = null, t.flipCount = 0);
		} else if (t.state === "bail") {
			t.bailT += e, t.vy += G * e, t.x += t.vx * .5 * e, t.y += t.vy * e, t.vx *= .25 ** e;
			let n = K(t.x);
			t.y > n.y && (t.y = n.y, t.vy = -t.vy * .35, Math.abs(t.vy) < 60 && (t.vy = 0));
			let r = t.bb;
			if (r) {
				r.vy += G * e, r.x += r.vx * e, r.y += r.vy * e, r.rot += r.vr * e;
				let t = K(r.x);
				r.y > t.y - 6 && (r.y = t.y - 6, r.vy = -r.vy * .4, r.vr *= .6, r.vx *= .7);
			}
			t.bailT > 1.05 && et();
		}
		let c = (t.vy - s) / Math.max(e, 1e-4);
		t.ponyV += (-t.ponyY * 90 - t.ponyV * 9 - c * .02) * e, t.ponyY = o(t.ponyY + t.ponyV * e, -16, 16);
		for (let e of C.cones) e.hit || Math.abs(t.x - e.x) > 16 || t.y <= e.y - 30 || t.state === "bail" || (e.hit = 1, e.vx = t.vx * .8 + 200, e.vy = -480 - Math.random() * 200, e.rot = 0, e.vr = 10 + Math.random() * 10, g.cone(), w.shake = Math.max(w.shake, 3), Y("TOC !", e.x, e.y - 60, n, 20, .6));
		tt(e);
		let l = t.state === "air" ? o(Math.atan2(t.vy, t.vx) * .25, -.25, .35) : t.ang;
		t.bodyAng = W(t.bodyAng, l, 1 - Math.exp(-e * (t.state === "air" ? 5 : 14)));
	}
	function it(e) {
		let t = T, n = ae, r = t.crouch, i = -63 + 20 * r, s = 1 + 3 * r, c = .05 + .16 * r, l = n.board;
		l.x = 0, l.y = 0, l.pitch = 0, l.roll = 0, l.yaw = 0, l.show = 1;
		let u = -24, d = 22, f = 0, p = 0, m = 1, h = Math.sin(e * 2.6) * 3, g = {
			x: -40,
			y: -76 + h
		}, _ = {
			x: 39,
			y: -72 - h
		}, v = "down", y = "down", b = 0;
		if (t.state === "ride" && t.landT < .28 && (i += 6 * (1 - t.landT / .28)), t.state === "ride" && A.down && (g = {
			x: -34,
			y: -60
		}, _ = {
			x: 36,
			y: -56
		}), t.state === "air") {
			let e = o(t.popT / .34, 0, 1);
			if (l.pitch = t.popT < .34 ? -.6 * Math.sin(Math.PI * e) : 0, i = -48, c = .1, g = {
				x: -44,
				y: -100 + h
			}, _ = {
				x: 44,
				y: -96 - h
			}, b = -.06, t.popT < .12 && (i = -62, c = .02), t.flip) {
				let e = o(t.flip.t / t.flip.dur, 0, 1), n = e < .5 ? 2 * e * e : 1 - 2 * (1 - e) * (1 - e);
				l.roll = t.flip.f.roll * a * n, l.yaw = t.flip.f.yaw * a * n, l.y = Math.sin(Math.PI * e) * 9, l.pitch = 0, m = 0, u = -27, d = 25, f = -4 - 6 * Math.sin(Math.PI * e), p = -5 - 6 * Math.sin(Math.PI * e), g = {
					x: -48,
					y: -108
				}, _ = {
					x: 46,
					y: -104
				};
			}
			if (t.grab) {
				i = -38, l.y = -6, l.pitch = -.14, c = .18;
				let e = t.grab.name;
				e === "Melon" || e === "Stalefish" ? (g = {
					x: -10,
					y: -2
				}, v = "out", _ = {
					x: 46,
					y: -106
				}) : (_ = {
					x: 8,
					y: -2
				}, y = "out", g = {
					x: -46,
					y: -106
				}), b = .1;
			}
		}
		if (t.state === "grind") {
			let e = t.grind.d;
			g = {
				x: -50,
				y: -86 + h * .6
			}, _ = {
				x: 48,
				y: -88 - h * .6
			}, i = -52, e === "l" ? l.pitch = -.2 : e === "r" ? (l.pitch = .18, c = .22) : e === "d" ? (l.yaw = Math.PI / 2, l.roll = .42, u = -10, d = 9, c = -.06, i = -50, g = {
				x: -52,
				y: -96
			}, _ = {
				x: 52,
				y: -70
			}) : e === "u" && (l.pitch = .1, l.yaw = .5);
		}
		if (m) {
			let e = Math.cos(l.pitch), t = Math.sin(l.pitch), n = l.yaw === Math.PI / 2 ? 1 : Math.max(.45, Math.abs(Math.cos(l.yaw))), r = (t) => l.x + t * n * e, i = (e) => l.y + e * n * t;
			f = i(u), p = i(d), u = r(u), d = r(d);
		}
		return n.hip.x = s, n.hip.y = i, n.lean = c, n.fb.x = u, n.fb.y = f, n.ff.x = d, n.ff.y = p, n.hb = g, n.hf = _, n.eb = v, n.ef = y, n.tilt = b, n.pony.x = -(t.vx / 600) * 3, n.pony.y = t.ponyY, n.shoeAng = m ? l.pitch : 0, n.blink = +(e % 3.7 < .12), n.smile = !!w.combo, n;
	}
	function at(e) {
		let t = ae, n = Math.sin(e * 2);
		return t.hip.x = 0, t.hip.y = -75 + n * .5, t.lean = -.02, t.fb.x = -17, t.fb.y = 0, t.ff.x = 17, t.ff.y = 0, t.hb = {
			x: -22,
			y: -68 + n
		}, t.eb = "out", t.hf = {
			x: 43,
			y: -106
		}, t.ef = "down", t.tilt = Math.sin(e * .7) * .04, t.shoeAng = 0, t.board.show = 0, t.pony.x = Math.sin(e * 1.3) * 2, t.pony.y = Math.sin(e * 2.1) * 2, t.blink = +(e % 4.1 < .12), t.smile = !0, t;
	}
	let ot = () => w.mode === "run" || w.mode === "end" ? .1 + .8 * ge(0, 1, w.t / 60) : .42;
	function st(e, t, n) {
		h.setTransform(b, 0, 0, b, 0, 0), h.drawImage(S.skyD, 0, 0, _, v);
		let r = S.sunR, i = v * (.5 + .28 * n);
		h.globalAlpha = 1 - n * .6, h.drawImage(S.sun, _ * .64 - r * 2.5, i - r * 2.5, r * 5, r * 5), h.globalAlpha = 1, n > 0 && (h.globalAlpha = ge(.05, .9, n), h.drawImage(S.skyN, 0, 0, _, v), h.globalAlpha = 1);
		let a = S.TW, s = t + .7 * v / x, c = (t, n, r, i, c) => {
			let l = i - n - o(s * x * c, -v * .25, v * .4), u = -(e * x * r % a);
			for (u > 0 && (u -= a); u < _; u += a) h.drawImage(t, u, l, a, n);
		};
		h.globalAlpha = .8, c(S.clouds, v * .6, .015, v * .6, .01), h.globalAlpha = 1;
		let l = v * .72;
		c(S.far.c, S.far.h, .05, l + 40 * x, .03), c(S.mid.c, S.mid.h, .16, l + 70 * x, .1), h.fillStyle = "rgba(12,8,30," + (n * .42).toFixed(3) + ")", h.fillRect(0, 0, _, v), h.globalAlpha = .55 + .45 * n, c(S.mid.gc, S.mid.h, .16, l + 70 * x, .1), h.globalAlpha = 1, c(S.near.c, S.near.h, .42, l + 110 * x, .3);
		{
			let e = l + 110 * x - o(s * x * .3, -v * .25, v * .4) - 2;
			e < v && (h.fillStyle = "#22142C", h.fillRect(0, e, _, v - e));
		}
		h.globalAlpha = .3 + .7 * n, c(S.near.gc, S.near.h, .42, l + 110 * x, .3), h.globalAlpha = 1;
	}
	let ct = (e) => h.setTransform(b * e.s, 0, 0, b * e.s, b * (-e.x * e.s + w.shx), b * (-e.y * e.s + w.shy)), Z = [
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
	function Q(e, t, n, r, i) {
		let a = Z[r % Z.length], o = i * (a.t.length * .62 + 1), s = i * 1.7;
		e.drawImage(L("g" + r % Z.length + "|" + Math.round(i), o, s, (e) => lt(e, a, i)), t - o / 2, n - s / 2, o, s);
	}
	function lt(t, n, i) {
		t.save(), t.globalAlpha = .62, t.rotate(-.06), t.font = i + "px \"Anton\",Impact,\"Haettenschweiler\",\"Futura Condensed ExtraBold\",\"Arial Narrow\",sans-serif", t.textAlign = "center", t.textBaseline = "middle", t.lineJoin = "round", t.strokeStyle = "rgba(0,0,0,.35)", t.lineWidth = i * .28, t.strokeText(n.t, 4, 5), t.strokeStyle = r, t.lineWidth = i * .26, t.strokeText(n.t, 0, 0), t.strokeStyle = e, t.lineWidth = i * .15, t.strokeText(n.t, 0, 0);
		let a = t.createLinearGradient(0, -i * .45, 0, i * .45);
		a.addColorStop(0, n.a), a.addColorStop(1, n.b), t.fillStyle = a, t.fillText(n.t, 0, 0), t.fillStyle = n.b;
		for (let e = 0; e < 4; e++) t.fillRect(-i * .6 + e * i * .4, i * .36, i * .035, i * (.12 + e * 7 % 5 * .05));
		t.restore();
	}
	function ut(e, t, n, r, i, a) {
		let o = Math.sin(i * 23) > .97 || Math.sin(i * 7.3) > .995 ? .55 : 1, s = Math.round(a * 10) / 10, c = r * 7.4, l = r * 2.4;
		e.drawImage(L("n" + r + "|" + o + "|" + s, c, l, (e) => dt(e, r, o, s)), t - c / 2, n - l / 2, c, l);
	}
	function dt(e, r, i, a) {
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
	function ft(e, t, n, r, i, a) {
		let o = r - i, s = e.createLinearGradient(0, o, 0, r);
		s.addColorStop(0, "#4A4450"), s.addColorStop(1, "#2C2931"), e.fillStyle = s, e.fillRect(t, o, n - t, i), e.fillStyle = "#37323D", e.fillRect(t - 6, o - 10, n - t + 12, 12), e.fillStyle = "rgba(255,170,130,.35)", e.fillRect(t - 6, o - 10, n - t + 12, 2), e.strokeStyle = "rgba(0,0,0,.22)", e.lineWidth = 2, e.beginPath();
		for (let i = t + 120; i < n; i += 120) e.moveTo(i, o), e.lineTo(i, r);
		if (e.stroke(), e.fillStyle = "rgba(0,0,0,.25)", e.fillRect(t, r - 26, n - t, 26), a >= 0) {
			let r = Math.max(1, Math.floor((n - t) / 420));
			for (let s = 0; s < r; s++) Q(e, t + (n - t) * (s + .5) / r, o + i * .45, a + s, Math.min(70, i * .36));
		}
	}
	function pt(e, t, n, r) {
		e.fillStyle = "#16131B", e.fillRect(t - 4, n - 300, 8, 300), e.fillRect(t - 7, n - 16, 14, 16), e.fillRect(t - 4, n - 300, 46, 6), e.fillStyle = "#24202A", e.fillRect(t + 30, n - 300 - 4, 24, 11);
		let i = .25 + .75 * r, a = e.createRadialGradient(t + 42, n - 300 + 8, 2, t + 42, n - 300 + 8, 70);
		a.addColorStop(0, "rgba(255,226,160," + i.toFixed(2) + ")"), a.addColorStop(.25, "rgba(255,190,110," + (i * .35).toFixed(2) + ")"), a.addColorStop(1, "rgba(255,170,90,0)"), e.fillStyle = a, e.fillRect(t - 30, n - 300 - 62, 144, 140), e.fillStyle = "rgba(255,210,140," + (i * .07).toFixed(3) + ")", e.beginPath(), e.moveTo(t + 32, n - 300 + 7), e.lineTo(t + 52, n - 300 + 7), e.lineTo(t + 170, n), e.lineTo(t - 86, n), e.fill(), e.fillStyle = "#FFE9B8", e.globalAlpha = i, e.fillRect(t + 32, n - 300 + 6, 20, 2.5), e.globalAlpha = 1;
	}
	function mt(r, i) {
		if (i.k === "bin") u(r, i.x - 16, i.y - 48, 32, 48, 4), d(r, "#2F4A3A", 2.2), r.fillStyle = "#253B2E", r.fillRect(i.x - 14, i.y - 38, 28, 4), u(r, i.x - 19, i.y - 54, 38, 8, 3), d(r, "#3A5A47", 2);
		else if (i.k === "hydrant") u(r, i.x - 8, i.y - 34, 16, 34, 4), d(r, n, 2.2), u(r, i.x - 13, i.y - 26, 26, 7, 3), d(r, "#D9560F", 2), r.beginPath(), r.arc(i.x, i.y - 36, 7, Math.PI, 0), d(r, "#D9560F", 2);
		else if (i.k === "drop") {
			r.fillStyle = t, r.fillRect(i.x - 60, i.y - 3, 60, 3), r.fillStyle = e;
			for (let e = 0; e < 6; e++) r.fillRect(i.x - 58 + e * 10, i.y - 3, 5, 3);
		}
	}
	function ht(e, n, r, i) {
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
			let t = C.stairs.find((e) => e.x0 === n.x0);
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
	function gt(n, r) {
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
			_t(n, r.x0, r.x1, r.top);
		}
	}
	function _t(t, n, r, i) {
		t.fillStyle = "#C9CED4", t.fillRect(n - 2, i - 3, r - n + 4, 4.5), t.fillStyle = "rgba(255,255,255,.6)", t.fillRect(n - 2, i - 3, r - n + 4, 1.2), t.strokeStyle = e, t.lineWidth = 1.4, t.strokeRect(n - 2, i - 3, r - n + 4, 4.5);
	}
	function vt(r, i, a, o) {
		let s = i.style === "plat" ? t : i.style === "main" ? "#B9BEC4" : n, c = Oe(i, a), l = Oe(i, o);
		r.beginPath(), r.moveTo(a, c), r.lineTo(o, l), r.strokeStyle = e, r.lineWidth = i.style === "plat" ? 9 : 8.5, r.lineCap = i.style === "plat" ? "butt" : "round", r.stroke(), r.strokeStyle = s, r.lineWidth = i.style === "plat" ? 5 : 4.6, r.stroke(), r.strokeStyle = "rgba(255,255,255,.55)", r.lineWidth = 1.2, r.beginPath(), r.moveTo(a + 4, c - 1.2), r.lineTo(o - 4, l - 1.2), r.stroke(), r.lineCap = "round";
	}
	function yt(t, n) {
		t.strokeStyle = e, t.lineWidth = 7, t.beginPath();
		let r = n.x1 - n.x0, i = Math.max(2, Math.round(r / 150) + 1), a = [];
		for (let e = 0; e < i; e++) a.push(n.x0 + 12 + (r - 24) * e / (i - 1));
		for (let e of a) t.moveTo(e, Oe(n, e)), t.lineTo(e, K(e).y);
		t.stroke(), t.strokeStyle = "#3A3540", t.lineWidth = 4, t.stroke();
		for (let e of a) t.fillStyle = "#2A2630", t.fillRect(e - 7, K(e).y - 4, 14, 4);
		vt(t, n, n.x0, n.x1);
	}
	function bt(e, t) {
		e.save(), e.translate(t.x, t.y), t.hit && e.rotate(t.rot), t.hit || (e.fillStyle = "rgba(0,0,0,.3)", e.beginPath(), e.ellipse(0, 0, 18, 4, 0, 0, a), e.fill()), u(e, -15, -5, 30, 5, 1.5), d(e, "#C2420E", 2), e.beginPath(), e.moveTo(-11, -5), e.lineTo(-3.5, -34), e.lineTo(3.5, -34), e.lineTo(11, -5), e.closePath(), d(e, n, 2.2), e.fillStyle = r, e.beginPath(), e.moveTo(-7.4, -16), e.lineTo(-5.4, -24), e.lineTo(5.4, -24), e.lineTo(7.4, -16), e.closePath(), e.fill(), e.restore();
	}
	function xt(e) {
		let t = ce.get(e);
		if (t) return t;
		let n = O.byId.get(e), [r, i] = R(100, 100, Math.min(2.5, x * b * .9));
		return n && re(i, n, oe(n), O.byId), ce.set(e, r), r;
	}
	function St(n, r, a) {
		let o = Math.sin(a * 3 + r.ph) * 5;
		if (n.save(), n.translate(r.x, r.y + o), r.k === "token") {
			let e = n.createRadialGradient(0, 0, 4, 0, 0, 60);
			e.addColorStop(0, "rgba(255,220,120,.55)"), e.addColorStop(1, "rgba(255,220,120,0)"), n.fillStyle = e, n.fillRect(-60, -60, 120, 120), ie(n, r.tier, a + r.ph, "%");
		} else if (r.k === "boost" || r.k === "magnet") E(n, r.k);
		else {
			let o = r.k === "excl", s = 1 + Math.sin(a * 5 + r.ph) * .04;
			if (n.scale(s, s), o) {
				let e = n.createRadialGradient(0, 0, 6, 0, 0, 70);
				e.addColorStop(0, "rgba(255,213,74,.6)"), e.addColorStop(1, "rgba(255,213,74,0)"), n.fillStyle = e, n.fillRect(-70, -70, 140, 140);
			}
			u(n, -31, -31, 62, 62, 15), d(n, o ? "#FFD54A" : t, 3), u(n, -26, -26, 52, 52, 11), n.fillStyle = "#E4DFD3", n.fill(), n.drawImage(xt(r.id), -23, -23, 46, 46), o && (n.font = "11px " + i, n.textAlign = "center", n.fillStyle = "#FFD54A", n.strokeStyle = e, n.lineWidth = 3, n.strokeText("EXCLU", 0, -34), n.fillText("EXCLU", 0, -34));
		}
		n.restore();
	}
	function Ct(e, t, n) {
		let r = e.x - 40, i = e.x + _ / e.s + 40, a = e.y + v / e.s + 40;
		ct(e);
		let o = h;
		o.lineCap = "round", o.lineJoin = "round";
		let s = C.introWall;
		s && s.x1 > r && s.x0 < i && (ft(o, s.x0, s.x1, s.y, 175, -1), o.fillStyle = "#211B26", o.fillRect(-470, -230, 6, 60), o.fillRect(-290, -230, 6, 60), ut(o, -380, -262, 40, t, n), Q(o, -1e3, -86, 3, 58), Q(o, -140, -86, 1, 50));
		for (let e of C.walls) e.x1 >= r && e.x0 <= i && ft(o, e.x0, e.x1, e.y, e.h, e.g);
		for (let e of C.lamps) e.x > r - 200 && e.x < i + 200 && pt(o, e.x, e.y, n);
		for (let e of C.props) e.x > r - 60 && e.x < i + 60 && mt(o, e);
		let c = he(r), l = he(i);
		for (let e = c; e <= l; e++) ht(o, C.segs[e], a, t);
		for (let e of C.ledges) e.x1 >= r && e.x0 <= i && gt(o, e);
		for (let e of C.rails) e.x1 >= r && e.x0 <= i && yt(o, e);
		for (let e of C.cones) e.x > r - 200 && e.x < i && bt(o, e);
		if (w.mode !== "scene") for (let e of C.items) {
			if (e.x > i + 80) break;
			!e.taken && e.x > r - 80 && St(o, e, t);
		}
	}
	function wt(e) {
		for (let t of C.cones) {
			if (!t.hit || t.hit > 1) continue;
			t.vy += G * e, t.x += t.vx * e, t.y += t.vy * e, t.rot += t.vr * e;
			let n = K(t.x).y;
			t.y > n && t.vy > 0 && (t.y = n, t.vy *= -.35, t.vx *= .6, t.vr *= .5, Math.abs(t.vy) < 80 && (t.vy = 0, t.hit = 2, t.rot = Math.PI / 2 * (t.rot > 0 ? 1 : -1)));
		}
	}
	function Tt(e) {
		for (let t = D.length - 1; t >= 0; t--) {
			let n = D[t];
			if (n.t += e, n.t >= n.life) {
				D.splice(t, 1);
				continue;
			}
			n.x += n.vx * e, n.y += n.vy * e, n.k === "dust" ? (n.vx *= .92, n.vy *= .9) : n.vy += G * .6 * e, n.rot != null && (n.rot += n.vr * e);
		}
		for (let t = k.length - 1; t >= 0; t--) k[t].t += e, k[t].t >= k[t].life && k.splice(t, 1);
	}
	function Et(e) {
		for (let t of D) {
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
	function Dt(n) {
		h.setTransform(b, 0, 0, b, 0, 0), h.textAlign = "center", h.textBaseline = "middle", h.lineJoin = "round";
		for (let r of k) {
			let i = r.t / r.life, a = (r.x - n.x) * n.s, s = (r.y - n.y) * n.s - i * 40, c = i < .15 ? _e(i / .15) * 1.15 : i < .25 ? 1.15 - (i - .15) * 1.5 : 1, l = i > .75 ? 1 - (i - .75) / .25 : 1, u = r.size * o(n.s * 1.05, .85, 1.6) * c;
			h.globalAlpha = l, h.font = u + "px \"Anton\",Impact,\"Haettenschweiler\",\"Futura Condensed ExtraBold\",\"Arial Narrow\",sans-serif", h.strokeStyle = e, h.lineWidth = u * .22, h.strokeText(r.text, a, s), h.fillStyle = r.col, h.fillText(r.text, a, s), r.sub && (h.font = u * .62 + "px \"Anton\",Impact,\"Haettenschweiler\",\"Futura Condensed ExtraBold\",\"Arial Narrow\",sans-serif", h.lineWidth = u * .16, h.strokeText(r.sub, a, s + u * .8), h.fillStyle = t, h.fillText(r.sub, a, s + u * .8));
		}
		h.globalAlpha = 1;
		let i = w.big;
		if (i) {
			let t = i.t / i.life, n = t < .12 ? _e(t / .12) * 1.2 : t < .22 ? 1.2 - (t - .12) * 2 : 1, a = t > .7 ? 1 - (t - .7) / .3 : 1, o = Math.min(_ * .12, v * .15) * n;
			h.globalAlpha = a, h.font = o + "px \"Anton\",Impact,\"Haettenschweiler\",\"Futura Condensed ExtraBold\",\"Arial Narrow\",sans-serif", h.save(), h.translate(_ / 2, Math.max(v * .42, o * .6 + 150)), h.rotate(-.05), h.strokeStyle = e, h.lineWidth = o * .16, h.strokeText(i.text, 0, 0), h.fillStyle = i.col, h.fillText(i.text, 0, 0), i.sub && (h.font = o * .26 + "px \"Anton\",Impact,\"Haettenschweiler\",\"Futura Condensed ExtraBold\",\"Arial Narrow\",sans-serif", h.lineWidth = o * .06, h.strokeText(i.sub.toUpperCase(), 0, o * .62), h.fillStyle = r, h.fillText(i.sub.toUpperCase(), 0, o * .62)), h.restore(), h.globalAlpha = 1;
		}
	}
	let Ot = [];
	for (let e = 0; e < 18; e++) Ot.push({
		x: Math.random(),
		y: .3 + Math.random() * .66,
		l: .08 + Math.random() * .16,
		s: .8 + Math.random() * .8
	});
	function kt(e) {
		if (!(e <= .01)) {
			h.setTransform(b, 0, 0, b, 0, 0), h.lineCap = "round";
			for (let t of Ot) t.x -= 1 / 60 * t.s * 2.4 * (.6 + e), t.x + t.l < -.05 && (t.x = 1 + Math.random() * .3, t.y = .3 + Math.random() * .66), h.strokeStyle = "rgba(243,240,232," + (e * .09 * t.s).toFixed(3) + ")", h.lineWidth = 1.5 + t.s, h.beginPath(), h.moveTo(t.x * _, t.y * v), h.lineTo((t.x + t.l * (.5 + e)) * _, t.y * v), h.stroke();
		}
	}
	function At(e) {
		h.setTransform(b, 0, 0, b, 0, 0), h.fillStyle = "#09070D";
		let t = 2600, n = e * 1.35 % t;
		for (let [e, r] of [
			[300, 0],
			[1250, 1],
			[1900, 0],
			[2350, 2]
		]) {
			let i = e - n;
			i < -300 && (i += t), i > 2300 && (i -= t);
			let o = i * x, s = v;
			if (!(o < -200 || o > _ + 200)) {
				if (r === 0) h.fillRect(o, s - 70 * x, 14 * x, 70 * x), h.beginPath(), h.arc(o + 7 * x, s - 70 * x, 7 * x, 0, a), h.fill();
				else if (r === 1) {
					h.beginPath();
					for (let e = 0; e < 5; e++) h.arc(o + e * 26 * x, s - (20 + e * 13 % 25) * x, (30 + e % 2 * 10) * x, 0, a);
					h.fill();
				} else h.fillRect(o, s - 40 * x, 200 * x, 5 * x), h.fillRect(o + 10 * x, s - 40 * x, 6 * x, 40 * x), h.fillRect(o + 180 * x, s - 40 * x, 6 * x, 40 * x);
			}
		}
	}
	function jt() {
		let e = w.scene.rect || {
			x: 0,
			y: 0,
			w: _,
			h: v
		}, t = Math.min(e.h / 440, e.w / 320), n = e.x + e.w * .5, r = e.y + e.h * .82;
		return {
			x: -375 - n / t,
			y: -r / t,
			s: t
		};
	}
	function Mt() {
		let e = S.TW, t = _ + (e - _) / 2;
		return ((S.mid.signX - t) % e + e) % e / (x * .16);
	}
	function Nt() {
		let n = ot(), r = w.mode === "scene", i = r ? jt() : w.cam;
		I = i.s * b, st(r ? Mt() + M * 2 : i.x, i.y, n), Ct(i, M, n);
		let s = h;
		if (r) {
			s.fillStyle = "rgba(0,0,0,.35)", s.beginPath(), s.ellipse(-370, 0, 62, 7, 0, 0, a), s.fill(), Et(s);
			let e = w.hop > 0 ? Math.sin(Math.PI * (1 - w.hop / .35)) * 12 : 0;
			j && (s.save(), s.translate(-330, -52 - e * .3), s.rotate(-Math.PI / 2 + .1), ne(s, j), s.restore(), s.save(), s.translate(-380, -e), y(s, at(M), j), s.restore());
		} else {
			Et(s);
			let e = K(T.x).y;
			if (s.fillStyle = "rgba(0,0,0," + (.32 * o(1 - (e - T.y) / 300, 0, 1)).toFixed(2) + ")", s.beginPath(), s.ellipse(T.x, e, 50 * o(1 - (e - T.y) / 400, .4, 1), 6, 0, 0, a), s.fill(), T.state === "bail") {
				let e = T.bb;
				e && (s.save(), s.translate(e.x, e.y), s.rotate(e.rot), te(s, {
					x: 0,
					y: 0,
					pitch: 0,
					roll: 0,
					yaw: 0
				}, j), s.restore());
				let t = it(M);
				t.board.show = 0;
				let n = T.bailT;
				t.hb = {
					x: -46,
					y: -110 + Math.sin(n * 20) * 10
				}, t.hf = {
					x: 44,
					y: -40 + Math.cos(n * 18) * 10
				}, t.fb = {
					x: -30,
					y: -10
				}, t.ff = {
					x: 30,
					y: -30
				}, t.hip.y = -50, s.save(), s.translate(T.x, T.y - 60), s.rotate(Math.min(n * 9, Math.PI * 1.6)), s.translate(0, 40), y(s, t, j), s.restore();
			} else if (!(T.inv > 0 && Math.floor(M * 14) % 2 == 0)) {
				let e = it(M), t = T.state === "grind" && T.grind.d === "d", n = T.state === "grind" ? t ? 3 : 12 : 19;
				if (s.save(), s.translate(T.x, T.y - (T.jitter || 0) - n), s.rotate(T.bodyAng), y(s, e, j), s.restore(), t) {
					let e = T.grind.g;
					e.kind === "rail" ? vt(s, e.o, Math.max(e.x0, T.x - 16), Math.min(e.x1, T.x + 16)) : _t(s, Math.max(e.x0, T.x - 14), Math.min(e.x1, T.x + 14), e.y0);
				}
			}
			w.magnetT > 0 && (s.strokeStyle = "rgba(185,166,255," + (.25 + .15 * Math.sin(M * 10)).toFixed(2) + ")", s.lineWidth = 3, s.beginPath(), s.arc(T.x, T.y - 80, 110 + Math.sin(M * 6) * 8, 0, a), s.stroke()), At(i.x), kt(w.mode === "run" ? o((T.vx - 480) / 260, 0, 1) * .8 + (T.state === "air" ? .25 : 0) + (w.slowT > 0 ? .6 : 0) + (w.boostT > 0 ? .7 : 0) : 0);
		}
		if (Dt(i), h.setTransform(b, 0, 0, b, 0, 0), h.drawImage(S.vig, 0, 0, _, v), w.slowT > 0 && (h.fillStyle = "rgba(200,255,46," + (.06 * Math.min(1, w.slowT * 4)).toFixed(3) + ")", h.fillRect(0, 0, _, v)), w.boostT > 0 && (h.fillStyle = "rgba(255,106,26," + (.05 * Math.min(1, w.boostT)).toFixed(3) + ")", h.fillRect(0, 0, _, v)), w.wipe >= 0) {
			let n = (w.wipe * 2.4 - 1.2) * _;
			h.fillStyle = t, h.beginPath(), h.moveTo(n, 0), h.lineTo(n + _ * .9, 0), h.lineTo(n + _ * .6, v), h.lineTo(n - _ * .3, v), h.fill(), h.fillStyle = e, h.beginPath(), h.moveTo(n + _ * .05, 0), h.lineTo(n + _ * .75, 0), h.lineTo(n + _ * .45, v), h.lineTo(n - _ * .25, v), h.fill();
		}
	}
	function Pt(e) {
		if (M += e, w.big && (w.big.t += e, w.big.t >= w.big.life && (w.big = null)), w.wipe >= 0) {
			if (w.wipe += e / .5, w.wipe >= .5 && w.wipeTo) {
				let e = w.wipeTo;
				w.wipeTo = null, e();
			}
			w.wipe >= 1 && (w.wipe = -1);
		}
		if (w.shake = Math.max(0, w.shake - e * 30), w.shx = (Math.random() - .5) * w.shake, w.shy = (Math.random() - .5) * w.shake, w.mode === "scene") {
			w.hop = Math.max(0, w.hop - e), Tt(e), c.loops(0, 0, 0);
			return;
		}
		w.slowT > 0 && (w.slowT -= e), w.ts = W(w.ts, w.slowT > 0 ? .3 : 1, 1 - Math.exp(-e * (w.slowT > 0 ? 20 : 6))), w.zoom = W(w.zoom, (w.slowT > 0 ? 1.07 : 1) * (1 - .1 * o((T.vx - 650) / 400, 0, 1)), 1 - Math.exp(-e * 4));
		let t = e * w.ts;
		if (w.mode === "run") {
			f && Bt(), w.clock += t, w.boostT > 0 && (w.boostT -= t), w.magnetT > 0 && (w.magnetT -= t), w.ending <= 0 ? (w.t += t, w.t >= 60 && (w.t = 60, w.ending = .001, Me(), ze(H("timeUp"), n, "", 1.3))) : (w.ending += e, (T.state === "ride" && w.ending > .25 || w.ending > 2.6) && (T.state === "grind" && Ze(), Ue(), Ft()));
			let r = t > 1 / 50 ? 2 : 1;
			for (let e = 0; e < r; e++) rt(t / r);
			let i = T.vx * Se;
			w.ending <= 0 && (w.topKmh = Math.max(w.topKmh, i), w.speedPts += Math.max(0, i - 28) * 10 * t, w.distPts = Math.max(0, (T.x - w.x0) / 80) * 3), w.score = Math.round(w.trickScore + w.speedPts + w.distPts);
			let a = C.hints[w.hintI];
			a && T.x > a.x && (w.hintI++, l.onHint && l.onHint(a.k)), l.onTick && l.onTick({
				score: w.score,
				left: Math.max(0, 60 - w.t),
				kmh: i,
				boost: w.boostT > 0,
				magnet: w.magnetT > 0,
				loot: w.loot.length
			});
		} else w.mode === "end" && rt(t);
		wt(t), Tt(t);
		let r = w.cam, i = x * w.zoom;
		r.s = i;
		let a = _ / i, s = v / i;
		r.x = T.x - a * (_ > v ? .28 : .22);
		let u = K(T.x).y, d = K(T.x + 380).y, p = Math.min(u, (u + d) / 2) - s * (_ > v ? .7 : .62), m = T.y - 150 - s * .14;
		m < p && (p = m), r.y = W(r.y, p, 1 - Math.exp(-t * (T.state === "air" ? 9 : 5)));
		let h = T.vx / 700;
		c.loops(T.state === "ride" ? .1 * h : 0, T.state === "grind" ? .12 : 0, T.state === "air" ? .05 + .05 * h : .012);
	}
	function Ft() {
		w.mode = "end", w.score = Math.round(w.trickScore + w.speedPts + w.distPts);
		let e = {
			score: w.score,
			trickScore: w.trickScore,
			speedPts: Math.round(w.speedPts),
			distPts: Math.round(w.distPts),
			distance: Math.round(Math.max(0, T.x - w.x0) / 80),
			topKmh: Math.round(w.topKmh),
			bestCombo: w.bestCombo,
			bestNames: w.bestNames,
			tricks: w.tricks,
			perfects: w.perfects,
			loot: w.loot.slice(),
			seed: w.seed,
			proof: {
				seed: w.seed,
				duration: Math.round(w.clock * 1e3),
				score: w.score,
				distance: Math.round(Math.max(0, T.x - w.x0)),
				catches: w.catches.slice(),
				inputs: w.inputs.slice(),
				v: 1
			}
		};
		l.onEnd && l.onEnd(e);
	}
	function It(e) {
		N = requestAnimationFrame(It);
		let t = e - P;
		if (t < 1e3 / 60 - 2) return;
		P = e;
		let n = Math.min(t / 1e3, 1 / 24);
		if (!w.paused) Pt(n);
		else if (Math.floor(e / 100) === Math.floor((e - t) / 100)) return;
		Nt();
	}
	function Lt() {
		F || se || (F = !0, P = performance.now(), N = requestAnimationFrame(It));
	}
	function Rt() {
		F = !1, cancelAnimationFrame(N), N = 0;
	}
	let $ = {
		pressAt: 0,
		flicked: 0,
		cap: 0
	};
	function zt() {
		let e = T.x, t = T.y, n = T.vy;
		for (let r = 0; r < 2.5; r += 1 / 120) {
			n += G / 120, e += T.vx / 120;
			let i = t;
			t += n / 120;
			for (let a of C.grind) {
				if (a.x0 > e + 20) break;
				if (a.x1 < e) continue;
				let o = Oe(a, e);
				if (i <= o && t >= o && n > -80 && e < a.x1 - 24) return {
					t: r,
					grind: 1
				};
			}
			if (t >= K(e).y) return {
				t: r,
				grind: 0
			};
		}
		return { t: 2.5 };
	}
	function Bt() {
		let e = T, t = () => {
			A.down || (je(), $.pressAt = w.clock);
		}, n = () => {
			A.down && Me();
		};
		if ($.cap || ($.cap = 4 + (Math.random() * 7 | 0)), e.state === "ride") {
			$.flicked = 0;
			let r = null;
			for (let t of C.grind) if (t.x0 > e.x + 20) {
				r = {
					x: t.x0,
					h: e.y - t.y0
				};
				break;
			}
			for (let t of C.cones) if (!t.hit && t.x > e.x + 20 && (!r || t.x < r.x)) {
				r = {
					x: t.x - 30,
					h: 40
				};
				break;
			}
			for (let t of C.stairs) if (t.x0 > e.x + 10 && (!r || t.x0 < r.x)) {
				r = {
					x: t.x0 - 10,
					h: 0
				};
				break;
			}
			for (let t of C.segs) if (t.kind === "kick" && t.x0 > e.x && (!r || t.x0 < r.x)) {
				r = {
					x: t.x0,
					h: -1,
					s: t
				};
				break;
			}
			if (r) {
				let i = r.x - e.x;
				r.h === -1 ? i < 150 && Math.random() < .6 && t() : i < e.vx * .42 && i > e.vx * .08 && t(), A.down && r.h >= 0 && i < e.vx * .17 && w.clock - $.pressAt > .08 && n(), A.down && i < 0 && r.h >= 0 && n();
			}
			w.combo && w.combo.mult < $.cap && !A.down && e.linkT < .5 && (!r || r.x - e.x > e.vx * .75) && t(), A.down && w.combo && (!r || r.h >= 0 && r.x - e.x > e.vx * .75) && w.clock - $.pressAt > .22 && n(), w.combo || ($.cap = 0);
		} else if (e.state === "air") {
			let r = zt();
			!e.flip && !e.grab && r.t > .48 && $.flicked < 2 && e.airT > .04 && (Ne([
				"l",
				"r",
				"u",
				"d",
				"l"
			][Math.random() * 5 | 0]), $.flicked++), A.down && !e.grab && w.clock - $.pressAt > .05 && e.airT < .2 && n(), !r.grind && r.t < .1 && !A.down && !e.flip && e.airT > .15 && (!w.combo || w.combo.mult < $.cap) && t(), A.dir.d = r.grind && Math.random() < .3 ? 1 : 0;
		} else e.state === "grind" && (e.grind.g.x1 - e.x < e.vx * .22 && (A.down ? w.clock - $.pressAt > .06 && n() : t()), A.dir.d = 0);
	}
	function Vt(e) {
		w.seed = e >>> 0 || 1, U(w.seed), Object.assign(w, {
			mode: "run",
			t: 0,
			clock: 0,
			score: 0,
			trickScore: 0,
			combo: null,
			bestCombo: 0,
			bestNames: "",
			perfects: 0,
			tricks: 0,
			ts: 1,
			slowT: 0,
			zoom: 1,
			ending: 0,
			hintI: 0,
			slowAt: 6,
			paused: !1,
			loot: [],
			topKmh: 0,
			distPts: 0,
			speedPts: 0,
			boostT: 0,
			magnetT: 0,
			inputs: [],
			catches: []
		}), D.length = 0, k.length = 0, T.speedBonus = 0, Ke(-380), T.vx = 420, w.x0 = T.x, A.down = !1, w.cam.y = K(-380).y - v / x * (_ > v ? .7 : .62), w.cam.x = T.x, ze(H("go"), t, H("goSub"), 1), g.go(), Be();
	}
	return U(1), Ke(-380), {
		G: w,
		P: T,
		TR: C,
		IN: A,
		resize: de,
		start: Lt,
		stop: Rt,
		render: Nt,
		press: je,
		release: Me,
		get running() {
			return F;
		},
		setLook(e) {
			j = e;
		},
		hop() {
			w.hop = .35;
			for (let e = 0; e < 10; e++) J({
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
			let e = w.mode === "scene" ? -380 : T.x, i = w.mode === "scene" ? -90 : T.y - 80;
			for (let a = 0; a < 40; a++) J({
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
			w.mode = "scene", w.paused = !1, w.scene.rect = e, D.length = 0, k.length = 0, U(1);
		},
		setSceneRect(e) {
			w.scene.rect = e;
		},
		wipe(e) {
			w.wipe = 0, w.wipeTo = e;
		},
		startRun: Vt,
		setPaused(e) {
			w.paused = !!e, e && (Me(), A.dir.l = A.dir.r = A.dir.u = A.dir.d = 0);
		},
		onKeyDown: Pe,
		onKeyUp: Fe,
		rebuild() {
			_ && z();
		},
		iconCanvas: xt,
		destroy() {
			se = !0, Rt(), s.removeEventListener("pointerdown", Ie), s.removeEventListener("pointermove", q), s.removeEventListener("pointerup", Le), s.removeEventListener("pointercancel", Le);
		}
	};
}
//#endregion
//#region 2d/src/audio.js
function Oe({ muted: e = !1, music: t = !0 } = {}) {
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
	}, ee = 60 / 96 / 2, x = [
		57,
		53,
		48,
		55
	], S = [
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
	], C = (e) => 440 * 2 ** ((e - 69) / 12);
	function te(e) {
		let t = n.createOscillator(), r = n.createGain();
		t.frequency.setValueAtTime(140, e), t.frequency.exponentialRampToValueAtTime(42, e + .18), r.gain.setValueAtTime(.9, e), r.gain.exponentialRampToValueAtTime(.001, e + .28), t.connect(r).connect(i), t.start(e), t.stop(e + .3);
	}
	function w(e, t, r, o, s) {
		let c = n.createBufferSource();
		c.buffer = a;
		let l = n.createBiquadFilter();
		l.type = s || "highpass", l.frequency.value = r;
		let u = n.createGain();
		u.gain.setValueAtTime(o, e), u.gain.exponentialRampToValueAtTime(.001, e + t), c.connect(l).connect(u).connect(i), c.start(e, Math.random()), c.stop(e + t + .02);
	}
	function ne(e, t, r, a, o) {
		let s = n.createOscillator(), c = n.createGain();
		s.type = a, s.frequency.value = C(t), c.gain.setValueAtTime(0, e), c.gain.linearRampToValueAtTime(o, e + .02), c.gain.exponentialRampToValueAtTime(.001, e + r), s.connect(c).connect(i), s.start(e), s.stop(e + r + .05);
	}
	function re() {
		if (n && m) for (; u < n.currentTime + .25;) {
			let e = u, t = d % 16, n = Math.floor(d / 16) % 4, r = x[n];
			if ((t === 0 || t === 7 || t === 10) && te(e), (t === 4 || t === 12) && (w(e, .16, 1400, .35, "bandpass"), w(e, .09, 4e3, .15)), t % 2 == 0 && w(e, .04, 8e3, t % 4 == 2 ? .09 : .05), (t === 0 || t === 3 || t === 8 || t === 11 || t === 14) && ne(e, r - 24 + (t === 14 ? 7 : 0), ee * 1.8, "triangle", .32), t === 0) for (let t of S[n]) ne(e, r + t, ee * 14, "sine", .05);
			(t === 6 || t === 13) && ne(e, r + 12 + S[n][(d >> 4) % 3], ee * 1.2, "triangle", .04), u += ee * (t % 2 == 0 ? 1.08 : .92), d++;
		}
	}
	function T() {
		n && !m && (m = !0, u = n.currentTime + .05, d = 0, clearInterval(l), l = setInterval(re, 60));
	}
	function ie() {
		m = !1, clearInterval(l);
	}
	return {
		unlock: g,
		loops: _,
		SFX: new Proxy(b, { get: (e, t) => (...r) => {
			n && !p && e[t] && e[t](...r);
		} }),
		startMusic: T,
		stopMusic: ie,
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
			if (ie(), n) try {
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
var ke = (e, t) => Promise.race([e, new Promise((e, n) => setTimeout(() => n(/* @__PURE__ */ Error("timeout")), t))]), Ae = () => "local-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7), je = () => Math.random() * 2 ** 31 >>> 0 || 1;
function Me(e) {
	let t = !!(e && typeof e.claim == "function");
	return {
		demo: !t,
		async session(n = {}) {
			let r = n.challengeSeed >>> 0 || je();
			if (t && typeof e.session == "function") try {
				let t = await ke(Promise.resolve(e.session(n)), 4e3) || {};
				return {
					...t,
					runId: t.runId || Ae(),
					seed: t.seed >>> 0 || r
				};
			} catch {}
			return {
				runId: Ae(),
				seed: r,
				demo: !t
			};
		},
		async claim(n) {
			if (t) try {
				return await ke(Promise.resolve(e.claim(n)), 8e3) || { ok: !1 };
			} catch (e) {
				return {
					ok: !1,
					message: e && e.message === "timeout" ? null : String(e && e.message || e)
				};
			}
			return n.type === "code" ? {
				ok: !0,
				code: "CODE-DEMO",
				demo: !0
			} : {
				ok: !0,
				demo: !0
			};
		}
	};
}
var Ne = (e) => btoa(unescape(encodeURIComponent(e))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""), Pe = (e) => decodeURIComponent(escape(atob(e.replace(/-/g, "+").replace(/_/g, "/"))));
function Fe({ seed: e, score: t, ref: n, name: r, shopUrl: i = "/" }) {
	let a = new URL(i, location.href);
	return a.search = "?play=1", a.hash = "rs=" + Ne(JSON.stringify({
		v: 2,
		s: e >>> 0,
		sc: Math.round(t) || 0,
		r: n || void 0,
		n: r || void 0
	})), a.href;
}
function Ie(e = location.hash) {
	if (!e || e.indexOf("#rs=") !== 0) return null;
	try {
		let t = JSON.parse(Pe(e.slice(4)));
		return !t || t.v !== 2 || !(t.s >>> 0) ? null : {
			s: t.s >>> 0,
			sc: Number(t.sc) || 0,
			r: t.r ? String(t.r).slice(0, 40) : null,
			n: t.n ? String(t.n).slice(0, 24) : null
		};
	} catch {
		return null;
	}
}
//#endregion
//#region src/data/catalog.js
var q = (e) => String(e).replace(",", ".").replace(/["″]/g, "").replace(/\s*mm$/, "").trim().toUpperCase();
function Le(e) {
	return e.slot === "top" || e.slot === "pack" && e.cart_field === "prodVar[1-1]" && e.sizes.some((e) => /^X?S$|^M$|^X*L$/.test(e.label)) && !["helmet", "knees"].includes(e.slot) ? "top" : e.slot === "bottom" ? "bottom" : e.slot === "feet" ? "shoe" : [
		"helmet",
		"knees",
		"elbows",
		"wrists"
	].includes(e.slot) ? "protect" : e.slot === "deck" || e.gabarit === "complete" ? "deck" : e.slot === "trucks" ? "axle" : null;
}
var Re = {
	XS: "36",
	S: "38",
	M: "40",
	L: "42",
	XL: "44",
	XXL: "46"
}, J = {
	"7.75": "139",
	"8.0": "139",
	8: "139",
	"8.25": "149",
	"8.5": "149"
};
function Y(e, t) {
	let n = t.sizes || {}, r = Le(e);
	if (e.slot === "pack" && e.sizes.length && e.sizes.every((e) => /^[SML]$/.test(e.label)) && (r = "protect"), !r) return e.sizes.length ? e.sizes[0].label : null;
	let i = r === "axle" ? J[q(n.deck || "8.25")] : n[r];
	return r === "bottom" && i && !/^\d+$/.test(i) && e.sizes.some((e) => /^\d+$/.test(e.label)) && (i = Re[i] || i), i;
}
function ze(e, t) {
	if (!e.sizes.length) return {
		size: null,
		exact: !0,
		available: !0
	};
	let n = Y(e, t), r = e.sizes.map((e) => q(e.label)), i = n == null ? -1 : r.indexOf(q(n));
	if (i < 0 && e.sizes.length === 1 && (i = 0), i < 0) {
		let t = parseFloat(q(n || ""));
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
		exact: q(e.sizes[i].label) === q(n || e.sizes[i].label),
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
function Be({ catalog: e, shopUrl: t = "/", mode: n, onAdd: r } = {}) {
	let i = location.hostname, a = /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(i) || i.endsWith(".local"), o = n ? n === "live" : !a, s = new URL(t, location.href), c = new URL("/panier.php?ajax", s).href, l = L("cart-journal", []), u = Promise.resolve();
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
			let e = ze(a, i || { sizes: {} });
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
					}), de("cart-journal", l.slice(-50));
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
var Ve = () => !!L("exited", !1), He = () => de("exited", !1), Ue = "2d-1", We = {
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
}, Ge = {
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
	rotateOk: !1
}, Ke = [
	{
		k: "head",
		ids: () => O.products.filter((e) => e.slot === "head").map((e) => e.id),
		none: !0
	},
	{
		k: "top",
		ids: () => Ye("top")
	},
	{
		k: "bottom",
		ids: () => Ye("bottom")
	},
	{
		k: "feet",
		ids: () => qe("feet")
	},
	{
		k: "deck",
		ids: () => qe("deck")
	},
	{
		k: "wheels",
		ids: () => qe("wheels")
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
		ids: () => qe("pack")
	}
];
function qe(e) {
	return O.products.filter((t) => t.slot === e).map((e) => e.id);
}
var Je = null;
function Ye(e) {
	let t = Je && Je.gender === "m" ? "men" : "women";
	return O.products.filter((t) => t.slot === e).sort((e, n) => (n.gender === t) - (e.gender === t)).map((e) => e.id);
}
var X = {
	sound: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 9v6h4l5 4V5L8 9z\" fill=\"currentColor\"/><path d=\"M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12\"/></svg>",
	mute: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 9v6h4l5 4V5L8 9z\" fill=\"currentColor\"/><path d=\"M16 9l6 6M22 9l-6 6\"/></svg>",
	shop: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linejoin=\"round\"><path d=\"M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z\"/><path d=\"M9 8V6a3 3 0 0 1 6 0v2\"/></svg>",
	pause: "<svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><rect x=\"6\" y=\"5\" width=\"4\" height=\"14\" rx=\"1\"/><rect x=\"14\" y=\"5\" width=\"4\" height=\"14\" rx=\"1\"/></svg>",
	play: "<svg viewBox=\"0 0 20 20\"><path d=\"M5 3l11 7-11 7z\" fill=\"currentColor\"/></svg>",
	lock: "<svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M7 10V7a5 5 0 0 1 10 0v3h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zm2 0h6V7a3 3 0 0 0-6 0z\"/></svg>",
	logo: "<svg viewBox=\"0 0 64 64\" aria-hidden=\"true\"><path d=\"M20 3h24l17 17v24L44 61H20L3 44V20z\" fill=\"#C8FF2E\" stroke=\"#141416\" stroke-width=\"3\"/><path d=\"M22 47V17h13.5c6.5 0 10.5 3.6 10.5 9.3 0 4.2-2.3 7.2-6.1 8.4L46.5 47h-7.6l-5.8-11.4H29V47zm7-17.3h6c2.6 0 4-1.3 4-3.4s-1.4-3.4-4-3.4h-6z\" fill=\"#141416\"/></svg>"
}, Xe = {
	bronze: "#E7A06A",
	silver: "#DDE3EA",
	gold: "#FFD54A"
}, Ze = {
	bronze: 1,
	silver: 2,
	gold: 3
};
function Qe() {
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
async function $e(n, a = {}) {
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
	let m = p.attachShadow ? p.attachShadow({ mode: "open" }) : p, h = Qe(), g = (e, t = {}) => {
		try {
			a.onEvent && a.onEvent(e, t);
		} catch {}
		try {
			window.dispatchEvent(new CustomEvent("respawn:" + e, { detail: t }));
		} catch {}
	}, _ = L("p2d", null) || {}, v = {
		...structuredClone(Ge),
		..._,
		wear: {
			...Ge.wear,
			..._.wear || {}
		},
		sizes: {
			...Ge.sizes,
			..._.sizes || {}
		}
	};
	v.pid || (v.pid = Math.random().toString(36).slice(2, 10)), Je = v;
	let b = () => de("p2d", v), ee = O.products.filter((e) => e.exclusive_unlock).map((e) => e.id), x = (e) => ee.includes(e) && !v.unlocked.includes(e), S = () => ({ sizes: v.sizes }), C = Be({
		catalog: O,
		shopUrl: o,
		mode: a.cartMode,
		onAdd: (e) => g("cartAdd", e)
	}), te = Me(a.rewards), w = Ie(), T = document.createElement("div");
	T.className = "r2d", T.lang = V();
	let ie = document.createElement("style");
	ie.textContent = ":host{all:initial}.r2d{--asphalt:#141416;--beton:#2a2a2e;--beton2:#1d1d20;--acid:#c8ff2e;--cone:#ff6a1a;--craie:#f3f0e8;--craie2:#b9b5ab;--display:\"Anton\",Impact,Haettenschweiler,\"Futura Condensed ExtraBold\",\"Arial Narrow\",sans-serif;--text:\"Space Grotesk\",ui-sans-serif,system-ui,-apple-system,\"Segoe UI\",Roboto,\"Helvetica Neue\",Arial,sans-serif;background:var(--asphalt);color:var(--craie);font:15px/1.35 var(--text);-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;overscroll-behavior:none;position:absolute;top:0;bottom:0;left:0;right:0;overflow:hidden}:where(.r2d *){box-sizing:border-box;margin:0;padding:0}:where(.r2d) :where(button,select){font:inherit;color:inherit;cursor:pointer;background:0 0;border:0}.r2d :focus-visible{outline:3px solid var(--acid);outline-offset:2px}.r2d canvas.scene{touch-action:none;width:100%;height:100%;display:block;position:absolute;top:0;bottom:0;left:0;right:0}.hidden{display:none!important}.disp{font-family:var(--display);text-transform:uppercase;letter-spacing:.01em;font-weight:400}.top{top:max(12px,env(safe-area-inset-top));right:max(12px,env(safe-area-inset-right));z-index:20;align-items:center;gap:8px;display:flex;position:absolute}.chip{letter-spacing:.02em;white-space:nowrap;background:#141416c7;border:1px solid #f3f0e829;border-radius:12px;justify-content:center;align-items:center;gap:7px;min-width:42px;height:42px;padding:0 13px;font-size:13px;font-weight:700;display:flex}.chip svg{flex:none;width:19px;height:19px}.chip:hover{border-color:#f3f0e866}.chip-exit{background:var(--craie);color:#141416;border-color:var(--craie)}.chip-exit:hover{background:#fff}.chip .lbs{display:none}.brand{left:max(18px,env(safe-area-inset-left));top:max(14px,env(safe-area-inset-top));z-index:5;pointer-events:none;align-items:center;gap:10px;display:flex;position:absolute}.brand svg{filter:drop-shadow(0 2px #00000059);width:40px;height:40px}.brand b{font-family:var(--display);letter-spacing:.04em;font-size:24px;font-weight:400;line-height:.9;display:block}.brand span{letter-spacing:.32em;color:var(--acid);margin-top:3px;font-size:10.5px;font-weight:700;display:block}.brand em{letter-spacing:.14em;color:var(--craie2);text-transform:uppercase;margin-top:3px;font-size:10px;font-style:normal;display:block}.panel{z-index:4;background:linear-gradient(#141416f2,#111113f7);border-left:1px solid #f3f0e814;flex-direction:column;width:min(480px,47vw);animation:.45s cubic-bezier(.2,.9,.25,1) slideIn;display:flex;position:absolute;top:0;bottom:0;right:0}@keyframes slideIn{0%{opacity:0;transform:translate(40px)}to{opacity:1;transform:none}}.panel-scroll{touch-action:pan-y;scrollbar-width:thin;scrollbar-color:#333 transparent;flex:1;padding:70px 22px 10px;overflow-y:auto}.kicker{letter-spacing:.26em;color:var(--acid);text-transform:uppercase;font-size:11px;font-weight:700}.panel h1{font-family:var(--display);text-transform:uppercase;margin:6px 0 14px;font-size:38px;font-weight:400;line-height:.95}.panel h1 i{color:var(--acid);font-style:normal}.lead{color:var(--craie2);margin:-6px 0 14px;font-size:13px}.row{flex-wrap:wrap;align-items:center;gap:10px;margin:0 0 14px;display:flex}.seg{background:#1d1d20;border:1px solid #f3f0e814;border-radius:999px;padding:3px;display:flex}.seg button{color:var(--craie2);border-radius:999px;min-height:36px;padding:8px 16px;font-size:13px;font-weight:700}.seg button.on{background:var(--craie);color:#141416}.skins{gap:8px;margin-left:auto;display:flex}.skins button{border:2.5px solid #0000;border-radius:50%;width:32px;height:32px;box-shadow:0 0 0 1.5px #f3f0e833}.skins button.on{border-color:var(--acid)}.sizes{background:#1a1a1d;border:1px solid #f3f0e814;border-radius:14px;margin:0 0 16px;padding:10px 12px 12px}.sizes summary{cursor:pointer;letter-spacing:.2em;text-transform:uppercase;color:var(--craie);justify-content:space-between;align-items:center;min-height:30px;font-size:12px;font-weight:800;list-style:none;display:flex}.sizes summary::-webkit-details-marker{display:none}.sizes summary small{letter-spacing:0;text-transform:none;color:var(--acid);font-size:12px;font-weight:600}.sizes .grid{grid-template-columns:repeat(5,1fr);gap:6px;margin-top:8px;display:grid}.sizes label{letter-spacing:.12em;text-transform:uppercase;color:var(--craie2);flex-direction:column;gap:4px;font-size:10px;font-weight:700;display:flex}.sizes select{height:36px;color:var(--craie);letter-spacing:0;-webkit-appearance:auto;appearance:auto;background:#26262a;border:1px solid #f3f0e826;border-radius:8px;padding:0 6px;font-size:14px;font-weight:700}.sizes p{color:var(--craie2);margin-top:8px;font-size:11.5px}.slot{margin:0 0 13px}.slot-h{justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:7px;display:flex}.slot-h b{letter-spacing:.24em;color:var(--craie2);text-transform:uppercase;white-space:nowrap;font-size:11px;font-weight:700}.slot-h span{color:var(--craie);opacity:.8;white-space:nowrap;text-overflow:ellipsis;font-size:12px;overflow:hidden}.slot-h span.warn{color:var(--cone);opacity:1}.slot-h span.ok{color:var(--acid);opacity:1}.chips{grid-template-columns:repeat(4,1fr);gap:7px;display:grid}.chipp{text-align:left;background:#1d1d20;border:1.5px solid #f3f0e812;border-radius:12px;flex-direction:column;align-items:flex-start;gap:3px;min-height:96px;padding:6px 8px 8px;transition:transform .15s,border-color .15s,background .15s;display:flex;position:relative}.chipp:hover{border-color:#f3f0e838;transform:translateY(-2px)}.chipp.on{border-color:var(--acid);background:#23261a;box-shadow:0 0 0 3px #c8ff2e1f}.chipp canvas{border-radius:9px;align-self:center;width:46px;height:46px;margin-bottom:2px}.chipp .nm{-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:11px;font-weight:700;line-height:1.12;display:-webkit-box;overflow:hidden}.chipp .pr{color:var(--craie2);font-variant-numeric:tabular-nums;font-size:11.5px}.chipp.on .pr{color:var(--acid)}.chipp .bd{letter-spacing:.1em;text-transform:uppercase;border-radius:4px;padding:2px 4px;font-size:8px;font-weight:800;position:absolute;top:5px;right:5px}.chipp .lock{color:#141416;background:#ffd54a;border-radius:5px;place-items:center;width:18px;height:18px;display:grid;position:absolute;top:5px;left:5px}.chipp .lock svg{width:12px;height:12px}.chipp.none .ph{background:repeating-linear-gradient(45deg,#2a2a2e 0 4px,#1d1d20 4px 8px);border-radius:50%;align-self:center;width:44px;height:44px}.bd.drop{background:var(--cone);color:#141416}.bd.limited{background:var(--craie);color:#141416}.bd.new{background:var(--acid);color:#141416}.panel-foot{padding:12px 22px max(16px,env(safe-area-inset-bottom));background:#141416;border-top:1px solid #f3f0e814}.total{color:var(--craie2);justify-content:space-between;align-items:baseline;margin-bottom:10px;font-size:13px;display:flex}.total b{color:var(--craie);font-size:15px}.total .eur{font-family:var(--display);color:var(--acid);letter-spacing:.02em;font-size:26px}.ctas{grid-template-columns:1fr 1fr;gap:10px;display:grid}.btn{min-height:52px;font-family:var(--display);letter-spacing:.04em;text-transform:uppercase;text-align:center;border-radius:12px;justify-content:center;align-items:center;gap:8px;padding:0 14px;font-size:19px;line-height:1;transition:transform .12s,filter .12s,background .2s;display:flex}.btn:active{transform:scale(.97)}.btn svg{flex:none;width:18px;height:18px}.btn-buy{color:var(--craie);border:2px solid var(--cone)}.btn-buy:hover{background:#ff6a1a1f}.btn-buy.ok{background:var(--cone);color:#141416}.btn-ride{background:var(--acid);color:#141416;box-shadow:0 6px #6d8f0d,0 10px 24px #c8ff2e40}.btn-ride:hover{filter:brightness(1.07)}.btn-ghost{border:2px solid #f3f0e840}.btn-ghost:hover{border-color:var(--craie)}.btn-sm{border-radius:10px;min-height:38px;padding:0 12px;font-size:15px}.keys{left:max(18px,env(safe-area-inset-left));bottom:max(14px,env(safe-area-inset-bottom));z-index:3;color:var(--craie2);pointer-events:none;max-width:calc(100% - min(480px,47vw) - 40px);font-size:12px;position:absolute}.hud{pointer-events:none;z-index:3;position:absolute;top:0;bottom:0;left:0;right:0}.h-score{left:max(18px,env(safe-area-inset-left));top:max(14px,env(safe-area-inset-top));position:absolute}.h-score small{letter-spacing:.3em;color:var(--acid);font-size:10.5px;font-weight:700;display:block}.h-score b{font-family:var(--display);font-variant-numeric:tabular-nums;text-shadow:0 3px #00000073;font-size:44px;font-weight:400;line-height:1;display:block}.h-loot{background:#141416b3;border:1px solid #f3f0e826;border-radius:999px;align-items:center;gap:6px;margin-top:6px;padding:4px 10px 4px 8px;font-size:14px;font-weight:800;display:inline-flex}.h-loot svg{width:16px;height:16px}.h-loot.bump{animation:.4s bump}@keyframes bump{40%{background:var(--acid);color:#141416;transform:scale(1.3)}}.h-time{left:50%;top:max(16px,env(safe-area-inset-top));align-items:center;gap:10px;display:flex;position:absolute;transform:translate(-50%)}.h-time .bar{background:#1414168c;border-radius:9px;width:min(240px,26vw);height:8px;overflow:hidden;box-shadow:inset 0 0 0 1px #f3f0e826}.h-time i{background:linear-gradient(90deg,var(--cone),var(--acid));transform-origin:0;border-radius:9px;width:100%;height:100%;display:block}.h-time b{font-family:var(--display);font-variant-numeric:tabular-nums;text-shadow:0 2px #0006;min-width:34px;font-size:26px;font-weight:400}.h-time b.low{color:var(--cone)}.combo{left:50%;top:max(56px,calc(env(safe-area-inset-top) + 42px));text-align:center;width:min(70vw,720px);transition:opacity .25s,transform .35s;position:absolute;transform:translate(-50%)}.combo .names{letter-spacing:.06em;text-shadow:0 2px #00000080;white-space:nowrap;text-overflow:ellipsis;text-transform:uppercase;font-size:12.5px;font-weight:700;overflow:hidden}.combo .pts{font-family:var(--display);text-shadow:0 3px #00000073;font-size:32px;line-height:1.05}.combo .pts span{color:var(--acid);margin-left:6px}.combo.idle{opacity:0;transform:translate(-50%)translateY(-8px)}.combo.bank .pts{color:var(--acid)}.combo.lost .pts{color:var(--cone);text-decoration:line-through}.speedo{right:max(18px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));background:conic-gradient(from 225deg,var(--acid) calc(var(--p,0)*270deg),#f3f0e81f 0 270deg,transparent 0);filter:drop-shadow(0 4px 10px #0006);border-radius:50%;place-items:center;width:112px;height:112px;display:grid;position:absolute}.speedo:before{content:\"\";background:#141416e0;border-radius:50%;position:absolute;top:9px;bottom:9px;left:9px;right:9px}.speedo div{text-align:center;line-height:1;position:relative}.speedo b{font-family:var(--display);font-variant-numeric:tabular-nums;font-size:38px;font-weight:400;display:block}.speedo small{letter-spacing:.2em;color:var(--craie2);font-size:10px;font-weight:800}.speedo.hot b{color:var(--cone)}.fx{right:max(140px,calc(env(safe-area-inset-right) + 140px));bottom:max(22px,env(safe-area-inset-bottom));gap:6px;display:flex;position:absolute}.fx span{letter-spacing:.08em;background:var(--cone);color:#141416;border-radius:999px;padding:5px 10px;font-size:12px;font-weight:800}.fx span.mag{background:#b9a6ff}.tuto{left:50%;bottom:max(24px,env(safe-area-inset-bottom));text-align:center;background:#141416cc;border:1px solid #f3f0e824;border-radius:12px;max-width:min(560px,60vw);padding:10px 16px;font-size:14px;font-weight:600;transition:opacity .3s,transform .3s;position:absolute;transform:translate(-50%)}.tuto.off{opacity:0;transform:translate(-50%)translateY(10px)}.tuto em{color:var(--acid);font-style:normal;font-weight:800}.modal{z-index:10;background:radial-gradient(#1414168c,#141416e6);justify-content:center;align-items:center;padding:66px 16px 16px;animation:.35s fade;display:flex;position:absolute;top:0;bottom:0;left:0;right:0}@keyframes fade{0%{opacity:0}to{opacity:1}}.card{scrollbar-width:thin;scrollbar-color:#333 transparent;background:#141416;border:1px solid #f3f0e81f;border-radius:20px;width:min(620px,100%);max-height:100%;padding:24px 24px 20px;animation:.5s cubic-bezier(.2,1.4,.4,1) pop;position:relative;overflow-y:auto;box-shadow:0 30px 80px #00000080}.card:before{content:\"\";background:repeating-linear-gradient(-45deg,var(--acid) 0 14px,#141416 14px 28px);border-radius:20px 20px 0 0;height:6px;position:absolute;top:0;bottom:auto;left:0;right:0}.card.small{text-align:center;width:min(400px,100%)}@keyframes pop{0%{opacity:0;transform:scale(.88)translateY(20px)}to{opacity:1;transform:none}}.card h2{font-family:var(--display);text-transform:uppercase;margin:6px 0 12px;font-size:40px;font-weight:400;line-height:1}.card p{color:var(--craie2);margin-bottom:14px;font-size:14px}.stack{gap:10px;display:grid}.big{font-family:var(--display);font-variant-numeric:tabular-nums;margin:6px 0 2px;font-size:clamp(54px,12vw,88px);line-height:.9}.rec{letter-spacing:.2em;background:var(--acid);color:#141416;vertical-align:middle;border-radius:5px;margin-left:8px;padding:3px 8px;font-size:11px;font-weight:800;display:inline-block}.stats{grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0 10px;display:grid}.stats div{background:#1d1d20;border-radius:12px;padding:9px 12px}.stats small{letter-spacing:.18em;color:var(--craie2);text-transform:uppercase;font-size:10px;font-weight:700;display:block}.stats b{font-family:var(--display);font-variant-numeric:tabular-nums;font-size:26px;font-weight:400}.stats.bd b{color:var(--acid);font-size:22px}.note{color:var(--craie2);margin:0 0 12px;font-size:12.5px;line-height:1.45}.note b{color:var(--craie)}.sect{justify-content:space-between;align-items:center;gap:8px;margin:14px 0 6px;display:flex}.sect h3{letter-spacing:.22em;text-transform:uppercase;font-size:12px;font-weight:800}.loot{gap:8px;margin-bottom:10px;display:grid}.lootrow{background:#1d1d20;border-radius:12px;grid-template-columns:48px 1fr auto;align-items:center;gap:10px;padding:6px 8px;display:grid}.lootrow canvas{border-radius:10px;width:48px;height:48px}.lootrow .nm{font-size:13px;font-weight:700;line-height:1.2}.lootrow .nm small{color:var(--craie2);font-size:12px;font-weight:600;display:block}.lootrow .acts{gap:6px;display:flex}.lootrow.ex{box-shadow:inset 0 0 0 2px #ffd54a}.reward{box-shadow:inset 0 0 0 2px var(--tier,#ffd54a);background:#1d1d20;border-radius:12px;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:8px;padding:12px 14px;display:flex}.reward .coin{background:var(--tier);width:38px;height:38px;font-family:var(--display);color:#141416;border-radius:50%;place-items:center;font-size:18px;display:grid;box-shadow:inset 0 -4px #00000040}.reward .lbl{flex:1;min-width:140px;font-size:13px;font-weight:700}.reward .lbl small{color:var(--craie2);font-weight:600;display:block}.reward code{letter-spacing:.06em;-webkit-user-select:all;user-select:all;background:#141416;border:1px dashed #f3f0e859;border-radius:8px;padding:9px 12px;font:800 18px/1 ui-monospace,Menlo,monospace}.endbtns{z-index:2;background:#141416;grid-template-columns:1.3fr 1fr;gap:10px;margin-top:6px;padding:10px 0 12px;display:grid;position:sticky;bottom:-20px;box-shadow:0 -12px 16px #141416}.sharebtns{grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;display:grid}.shopline{color:var(--craie2);background:#1d1d20;border-radius:12px;justify-content:space-between;align-items:center;gap:10px;margin-top:12px;padding:10px 12px;font-size:13px;display:flex}.shopline b{color:var(--craie)}.toast{z-index:30;background:var(--craie);color:#141416;opacity:0;pointer-events:none;text-align:center;border-radius:12px;max-width:90%;padding:12px 18px;font-size:14px;font-weight:700;transition:all .3s;position:absolute;bottom:110px;left:50%;transform:translate(-50%)translateY(20px);box-shadow:0 10px 30px #0006}.toast.on{opacity:1;transform:translate(-50%)}kbd{min-width:22px;font:700 11px var(--text);color:inherit;text-align:center;background:#f3f0e81f;border:1px solid #f3f0e833;border-bottom-width:2.5px;border-radius:5px;padding:2px 6px;display:inline-block}.btn-ride kbd{background:#14141626;border-color:#1414164d}.challenge{background:#c8ff2e1a;border:1px solid #c8ff2e59;border-radius:12px;margin:0 0 12px;padding:10px 12px;font-size:13px;font-weight:700}.vlist{flex-wrap:wrap;gap:8px;margin:6px 0 12px;display:flex}.vlist div{text-align:center;width:76px;color:var(--craie2);flex-direction:column;align-items:center;font-size:10.5px;line-height:1.15;display:flex}.vlist canvas{border-radius:12px;width:56px;height:56px;margin-bottom:4px}@media (max-aspect-ratio:1){.panel{border-top:1px solid #f3f0e81a;border-left:0;border-radius:20px 20px 0 0;width:auto;height:57%;animation-name:slideUp;top:auto;left:0}@keyframes slideUp{0%{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}.panel-scroll{padding:16px 14px 6px}.panel h1{margin-bottom:10px;font-size:28px}.chips{touch-action:pan-x;scrollbar-width:none;grid-template-columns:none;grid-auto-columns:96px;grid-auto-flow:column;padding-bottom:4px;overflow-x:auto}.sizes .grid{grid-template-columns:repeat(3,1fr)}.panel-foot{padding:10px 14px max(12px,env(safe-area-inset-bottom))}.keys,.brand em{display:none}.btn{font-size:16px}.h-score b{font-size:32px}.brand b{font-size:19px}.brand svg{width:32px;height:32px}.chip .lbl{display:none}.chip-exit .lbs{display:inline}.speedo{width:88px;height:88px}.speedo b{font-size:28px}.fx{right:118px}.tuto{max-width:92vw;font-size:13px;bottom:120px}.combo{width:92vw;top:96px}.h-time{top:auto;bottom:max(16px,env(safe-area-inset-bottom));left:max(16px,env(safe-area-inset-left));transform:none}.h-time .bar{width:110px}}@media (max-height:520px) and (min-aspect-ratio:1){.brand em{display:none}.brand svg{width:30px;height:30px}.brand b{font-size:18px}.panel-scroll{padding:60px 14px 6px}.panel h1{margin-bottom:8px;font-size:24px}.lead{display:none}.chips{touch-action:pan-x;scrollbar-width:none;grid-template-columns:none;grid-auto-columns:92px;grid-auto-flow:column;overflow-x:auto}.chipp{min-height:84px}.chipp canvas{width:36px;height:36px}.row,.slot{margin-bottom:8px}.slot-h span{max-width:55%}.sizes .grid{grid-template-columns:repeat(5,1fr)}.sizes select{height:32px}.panel-foot{padding:8px 14px 10px}.btn{min-height:42px;font-size:16px}.keys,.chip .lbl{display:none}.chip-exit .lbs{display:inline}.h-score b{font-size:30px}.speedo{width:84px;height:84px}.speedo b{font-size:27px}.fx{right:112px}.card{padding:16px}.big{font-size:52px}.stats{margin:8px 0 6px}.card h2{font-size:30px}.modal{padding-top:58px}}@media (prefers-reduced-motion:reduce){.r2d *{transition:none!important;animation:none!important}}", m.append(ie, T);
	let E = (e, t = {}, ...n) => {
		let r = document.createElement(e);
		for (let [e, n] of Object.entries(t)) e === "class" ? r.className = n : e === "html" ? r.innerHTML = n : e.startsWith("on") ? r.addEventListener(e.slice(2).toLowerCase(), n) : n != null && n !== !1 && r.setAttribute(e, n === !0 ? "" : n);
		for (let e of n.flat()) e != null && e !== !1 && r.append(e);
		return r;
	}, ae = E("canvas", {
		class: "scene",
		"aria-label": "Respawn Street Run"
	}), D = E("div", {
		class: "brand",
		html: X.logo + "<div><b>RESPAWN</b><span>SKATE CO.</span><em>Street Run</em></div>"
	}), k = E("div", { class: "top" }), A = E("div", {
		class: "toast",
		role: "status",
		"aria-live": "polite"
	});
	T.append(ae, D, k, A);
	let j = 0;
	function M(e, t = 2600) {
		A.textContent = e, A.classList.add("on"), clearTimeout(j), j = setTimeout(() => A.classList.remove("on"), t);
	}
	let N = Oe({
		muted: v.muted,
		music: v.music
	}), ce = (e, t = 56) => {
		let n = document.createElement("canvas"), r = Math.min(window.devicePixelRatio || 1, 2);
		n.width = n.height = Math.round(t * r);
		let i = n.getContext("2d");
		i.scale(t * r / 100, t * r / 100);
		let a = i.createLinearGradient(0, 0, 0, 100);
		a.addColorStop(0, "#ECE8DE"), a.addColorStop(1, "#CFC9BC"), i.fillStyle = a, i.beginPath(), i.roundRect ? i.roundRect(0, 0, 100, 100, 18) : i.rect(0, 0, 100, 100), i.fill();
		let o = O.byId.get(e);
		return o && (i.translate(8, 8), i.scale(.84, .84), re(i, o, oe(o), O.byId)), n;
	}, le = 0, I = K(ae, {
		audio: N,
		autopilot: l,
		exclusives: ee.filter((e) => !v.unlocked.includes(e)),
		lootPool: O.products.filter((e) => !e.exclusive_unlock).map((e) => e.id),
		hooks: {
			onTick: it,
			onCombo: at,
			onHint: st,
			onEnd: vt,
			onCatch: ct
		}
	}), R = () => I.setLook(F(v, s === "vestiaire" && Z === "vest" ? le : 0)), fe = E("button", {
		class: "chip",
		onClick: () => pe(V() === "fr" ? "en" : "fr")
	}), z = E("button", {
		class: "chip",
		onClick: () => {
			v.muted = !v.muted, N.setMuted(v.muted), N.unlock(), b(), ge();
		}
	}), B = E("button", {
		class: "chip hidden",
		"aria-label": H("pause"),
		html: X.pause,
		onClick: () => pt()
	}), W = E("a", {
		class: "chip chip-exit",
		href: o,
		onClick: (e) => {
			e.preventDefault(), _e();
		}
	});
	k.append(fe, z, B, W);
	function ge() {
		fe.textContent = H("lang"), fe.setAttribute("aria-label", V() === "fr" ? "English" : "Français"), z.innerHTML = (v.muted ? X.mute : X.sound) + "<span class=\"lbl\">" + H(v.muted ? "soundOff" : "soundOn") + "</span>", z.setAttribute("aria-pressed", String(!v.muted)), B.setAttribute("aria-label", H("pause"));
		let e = s === "vestiaire" ? "exitCart" : s === "tryOn" ? "exitProduct" : "exit";
		W.innerHTML = X.shop + "<span class=\"lbl\">" + H(e) + "</span><span class=\"lbs\">" + (e === "exit" ? H("exitShort") : H(e).split(" ").slice(-1)[0]) + "</span>", W.setAttribute("aria-label", H(e));
	}
	function _e() {
		a.remember !== !1 && s === "home" && de("exited", !0), g("exit", { context: s }), a.onExit ? a.onExit() : u ? kt.destroy() : location.href = o;
	}
	let ve = E("aside", {
		class: "panel",
		"aria-label": H("kicker")
	}), G = E("div", { class: "keys" });
	T.append(ve, G);
	function ye() {
		return Object.values(v.wear).filter(Boolean);
	}
	function be(e) {
		return e.pack_items.length && e.pack_items.every((e) => ye().includes(e));
	}
	function xe() {
		let e = ye().filter((e) => !x(e)), t = [];
		for (let n of O.products.filter((e) => e.slot === "pack" && e.pack_items.length)) n.pack_items.every((t) => e.includes(t)) && (t.push(n.id), e = e.filter((e) => !n.pack_items.includes(e)));
		return [...t, ...e];
	}
	let Se = (e) => e.reduce((e, t) => e + (O.byId.get(t) ? O.byId.get(t).price_ttc : 0), 0);
	function Ce(e) {
		let t = O.byId.get(e);
		if (!t) return {
			text: "",
			cls: ""
		};
		if (!t.sizes.length || t.sizes.length === 1 && /unique/i.test(t.sizes[0].label)) return {
			text: H("sizeUnique"),
			cls: ""
		};
		let n = ze(t, S());
		return n.available ? !n.exact && n.wanted ? {
			text: H("sizeSwap", {
				w: n.wanted,
				s: n.size.label
			}),
			cls: "warn"
		} : {
			text: H("sizeOk", { s: n.size.label }),
			cls: "ok"
		} : {
			text: H("sizeOut"),
			cls: "warn"
		};
	}
	function we(e, t, n) {
		let r = e ? O.byId.get(e) : null, i = E("button", {
			class: "chipp" + (t ? " on" : "") + (r ? "" : " none"),
			"aria-pressed": String(!!t),
			title: r ? `${r.name} · ${he(r.price_ttc)}${x(e) ? " · " + H("lockedHint") : ""}` : H("none"),
			onClick: n
		});
		return r ? i.append(ce(e, 44)) : i.append(E("span", { class: "ph" })), i.append(E("span", { class: "nm" }, r ? ue(r) : H("none")), E("span", { class: "pr" }, r ? he(r.price_ttc) : "—")), r && r.badge && i.append(E("span", { class: "bd " + r.badge }, {
			drop: "Drop",
			limited: "Limited",
			new: "New"
		}[r.badge] || r.badge)), r && x(e) && i.append(E("span", {
			class: "lock",
			title: H("lockedHint"),
			html: X.lock
		})), i;
	}
	function Te() {
		let e = s === "tryOn" ? O.byId.get(Number(a.tryOn)) : null;
		ve.innerHTML = "";
		let t = E("div", { class: "panel-scroll" });
		t.append(E("div", { class: "kicker" }, H(e ? "tryKicker" : "kicker"))), t.append(E("h1", { html: e ? ue(e) : `${H("title1")}<br>${H("title2")} <i>${H("title3")}</i>` })), e && t.append(E("p", { class: "lead" }, H("tryText"))), w && t.append(E("div", { class: "challenge" }, H("challengeFrom", {
			name: w.n || "Rider",
			score: U(w.sc || 0)
		})));
		let n = E("div", {
			class: "seg",
			role: "group",
			"aria-label": "Silhouette"
		}, ...["f", "m"].map((e) => E("button", {
			class: v.gender === e ? "on" : "",
			"aria-pressed": String(v.gender === e),
			onClick: () => {
				v.gender = e, De();
			}
		}, H(e === "f" ? "women" : "men")))), r = E("div", { class: "skins" }, ...P.map((e, t) => E("button", {
			class: v.skin === t ? "on" : "",
			style: "background:" + e.s,
			"aria-label": H(t ? "skinDark" : "skinLight"),
			"aria-pressed": String(v.skin === t),
			onClick: () => {
				v.skin = t, De();
			}
		})));
		t.append(E("div", { class: "row" }, n, r));
		let i = E("details", { class: "sizes" });
		L("sizesOpen", T.clientWidth >= 600) && (i.open = !0), i.addEventListener("toggle", () => de("sizesOpen", i.open));
		let o = Object.entries(v.sizes).map(([e, t]) => e === "deck" ? t + "\"" : t).join(" · ");
		i.append(E("summary", {}, H("sizes"), E("small", {}, o)));
		let c = E("div", { class: "grid" });
		for (let [e, t] of Object.entries(We)) {
			let n = E("select", {
				"aria-label": H("size_" + e),
				onChange: (t) => {
					v.sizes[e] = t.target.value, b(), Te(), N.SFX.ui();
				}
			});
			for (let r of t) {
				let t = E("option", { value: r }, e === "deck" ? r.replace(".", V() === "fr" ? "," : ".") + "\"" : r);
				String(v.sizes[e]) === r && (t.selected = !0), n.append(t);
			}
			c.append(E("label", {}, H("size_" + e), n));
		}
		i.append(c, E("p", {}, H("sizesHint"))), t.append(i);
		for (let e of Ke) {
			let n = e.ids();
			if (!n.length) continue;
			let r = E("div", { class: "slot" }), i = {
				text: "",
				cls: ""
			};
			if (!e.multi && !e.pack) {
				let t = v.wear[e.k];
				i = t ? {
					...Ce(t),
					text: ue(O.byId.get(t)) + " · " + Ce(t).text
				} : {
					text: H("none"),
					cls: ""
				}, t && x(t) && (i = {
					text: H("lockedHint"),
					cls: "warn"
				});
			} else if (e.multi) {
				let e = n.filter((e) => v.wear[O.byId.get(e).slot] === e);
				i = {
					text: e.length ? e.map((e) => Ce(e).text).join(" · ") : H("none"),
					cls: ""
				};
			}
			r.append(E("div", { class: "slot-h" }, E("b", {}, H("slot_" + e.k)), E("span", { class: i.cls }, i.text)));
			let a = E("div", { class: "chips" });
			for (let t of n) {
				let n = O.byId.get(t);
				e.pack ? a.append(we(t, be(n), () => {
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
		let l = xe(), u = l.length, d = E("div", { class: "panel-foot" }, E("div", { class: "total" }, E("span", {}, H("outfit") + " : ", E("b", {}, H(u > 1 ? "articlesP" : "articles", { n: u }))), E("span", { class: "eur" }, he(Se(l)))), E("div", { class: "ctas" }, E("button", {
			class: "btn btn-buy",
			id: "buy",
			onClick: (e) => ke(e.currentTarget)
		}, H("buy")), E("button", {
			class: "btn btn-ride",
			onClick: () => _t(),
			html: H("ride") + " " + X.play
		})));
		ve.append(t, d), G.textContent = H("keysHint"), t.scrollTop = Ee, t.addEventListener("scroll", () => {
			Ee = t.scrollTop;
		});
	}
	let Ee = 0;
	function De() {
		b(), R(), Te(), I.hop(), N.unlock(), N.SFX.ui();
	}
	async function ke(e, t) {
		N.unlock();
		let n = t || xe(), r = (t ? [] : ye()).filter(x);
		if (!n.length) return;
		e && (e.disabled = !0, e.classList.add("ok"), e.textContent = "…");
		let i = await C.addLookToCart(n, S()), a = i.filter((e) => e.ok), o = i.filter((e) => !e.ok);
		N.SFX.buy(), I.confetti();
		let s = H("addedToast", { n: a.length });
		a.some((e) => e.mock) && (s += " " + H("addedMock")), o.length && (s += " · " + H("addFail", { list: o.map((e) => e.product ? ue(e.product) : "?").join(", ") })), r.length && (s += " · " + H("lockedSkip", { list: r.map((e) => ue(O.byId.get(e))).join(", ") })), M(s, 4200), g("buyOutfit", {
			items: n,
			added: a.length,
			failed: o.length
		}), e && (e.textContent = H("added"), setTimeout(() => {
			e.disabled = !1, e.classList.remove("ok"), e.textContent = e.dataset.label || H("buy");
		}, 2200));
	}
	let Ae = E("div", { class: "hud hidden" }), je = E("b", {}, "0"), Ne = E("span", {
		class: "h-loot",
		html: X.shop + "<span>0</span>"
	}), Pe = E("i"), q = E("b", {}, "60"), Le = E("div", { class: "names" }), Re = E("b", {}, "0"), J = E("span"), Y = E("div", { class: "combo idle" }, Le, E("div", { class: "pts" }, Re, J)), Ve = E("b", {}, "0"), He = E("div", {
		class: "speedo",
		role: "img",
		"aria-label": "km/h"
	}, E("div", {}, Ve, E("small", {}, "KM/H"))), qe = E("div", { class: "fx" }), Ye = E("div", { class: "tuto off" });
	Ae.append(E("div", { class: "h-score" }, E("small", {}, H("score").toUpperCase()), je, Ne), E("div", { class: "h-time" }, E("div", { class: "bar" }, Pe), q), Y, He, qe, Ye), T.append(Ae);
	let $e = -1, et = -1, tt = -1, nt = "", rt = 0;
	function it(e) {
		e.score !== et && (et = e.score, je.textContent = U(e.score)), Pe.style.transform = "scaleX(" + (e.left / 60).toFixed(4) + ")";
		let t = Math.ceil(e.left);
		t !== $e && ($e = t, q.textContent = t, q.classList.toggle("low", t <= 10));
		let n = Math.round(e.kmh);
		n !== tt && (tt = n, Ve.textContent = n, He.style.setProperty("--p", Math.min(1, Math.max(0, (n - 20) / 40)).toFixed(3)), He.classList.toggle("hot", n >= 48));
		let r = (e.boost ? "b" : "") + (e.magnet ? "m" : "");
		r !== nt && (nt = r, qe.innerHTML = (e.boost ? "<span>BOOST</span>" : "") + (e.magnet ? "<span class=\"mag\">" + H("magnet").replace(/\s*!$/, "") + "</span>" : "")), rt > 0 && (rt -= 1 / 60, rt <= 0 && Ye.classList.add("off"));
	}
	function at(e, t) {
		if (t && t.banked != null) {
			Y.classList.add("bank"), Re.textContent = "+" + U(t.banked), J.textContent = "", setTimeout(() => {
				Y.classList.remove("bank"), I.G.combo || Y.classList.add("idle");
			}, 650);
			return;
		}
		if (t && t.lost) {
			Y.classList.add("lost"), setTimeout(() => {
				Y.classList.remove("lost"), Y.classList.add("idle");
			}, 700);
			return;
		}
		if (!e) {
			!Y.classList.contains("bank") && !Y.classList.contains("lost") && Y.classList.add("idle");
			return;
		}
		Y.classList.remove("idle", "bank", "lost"), Le.textContent = e.names.slice(-5).join(" + "), Re.textContent = U(e.pts), J.textContent = "× " + e.mult;
	}
	let ot = matchMedia("(pointer:coarse)").matches;
	function st(e) {
		let t = "hint_" + e + (ot && (e === "ollie" || e === "flip") ? "T" : "");
		Ye.innerHTML = H(t), Ye.classList.remove("off"), rt = 4.2;
	}
	function ct(e) {
		let t = Ne.querySelector("span");
		t.textContent = I.G.loot.length, Ne.classList.remove("bump"), Ne.offsetWidth, Ne.classList.add("bump"), g("lootCaught", {
			kind: e.k,
			id: e.id,
			tier: e.tier
		}), e.k === "token" && g("tierReached", {
			tier: e.tier,
			source: "token"
		});
	}
	let Z = "wardrobe", Q = null, lt = 0, ut = null;
	function dt() {
		Q && (Q.remove(), Q = null);
	}
	function ft(e, t) {
		dt(), Q = E("div", {
			class: "modal",
			role: "dialog",
			"aria-modal": "true"
		}, e), t && Q.classList.add(t), T.append(Q);
		let n = e.querySelector("button");
		if (n) try {
			n.focus({ preventScroll: !0 });
		} catch {}
		return Q;
	}
	function pt() {
		if (Z !== "run" || I.G.paused) return;
		I.setPaused(!0), N.SFX.pause(), N.stopMusic(), g("pause", {});
		let e = E("button", {
			class: "btn btn-ghost",
			onClick: () => {
				v.music = !v.music, N.setMusic(v.music), b(), e.textContent = H(v.music ? "musicOn" : "musicOff");
			}
		}, H(v.music ? "musicOn" : "musicOff"));
		ft(E("div", { class: "card small" }, E("h2", {}, H("pause")), E("p", {}, H("controls")), E("div", { class: "stack" }, E("button", {
			class: "btn btn-ride",
			onClick: mt
		}, H("resume")), E("button", {
			class: "btn btn-ghost",
			onClick: () => {
				dt(), _t(!0);
			}
		}, H("restart")), e, E("button", {
			class: "btn btn-ghost",
			onClick: () => {
				dt(), ht();
			}
		}, H("wardrobe")))));
	}
	function mt() {
		dt(), I.setPaused(!1), v.muted || N.startMusic();
	}
	function ht(e) {
		if (Z = "wardrobe", dt(), Ae.classList.add("hidden"), B.classList.add("hidden"), D.classList.remove("hidden"), ve.classList.remove("hidden"), G.classList.remove("hidden"), N.stopMusic(), N.loops(0, 0, 0), e) {
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
		R(), Te(), I.showScene(gt()), g("shopOpen", { context: s });
	}
	function gt() {
		let e = T.getBoundingClientRect(), t = e.width >= e.height;
		if (Z === "vest") return t ? {
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
	async function _t(e) {
		N.unlock();
		let t = T.getBoundingClientRect();
		if (!e && t.height > t.width && t.width < 600 && !v.rotateOk) {
			ft(E("div", { class: "card small" }, E("h2", {}, H("rotateTitle")), E("p", {}, H("rotateText")), E("button", {
				class: "btn btn-ride",
				onClick: () => {
					v.rotateOk = !0, b(), dt(), _t();
				}
			}, H("rotatePlay"))));
			return;
		}
		dt(), N.SFX.go();
		try {
			document.activeElement && T.contains(document.activeElement) && document.activeElement.blur();
		} catch {}
		ut = await te.session({
			referrer: w && w.r,
			challengeSeed: w && w.s,
			player: v.pid,
			lang: V()
		}), I.wipe(() => {
			Z = "run", ve.classList.add("hidden"), G.classList.add("hidden"), D.classList.add("hidden"), Ae.classList.remove("hidden"), B.classList.remove("hidden"), Ne.querySelector("span").textContent = "0", R(), I.startRun(ut.seed), v.muted || N.startMusic(), g("runStart", {
				runId: ut.runId,
				seed: ut.seed,
				demo: !!ut.demo
			});
		});
	}
	function vt(e) {
		Z = "end", lt = performance.now(), N.stopMusic(), B.classList.add("hidden");
		let t = e.score > (v.best || 0) && e.score > 0;
		t && (v.best = e.score), b();
		let n = {
			runId: ut && ut.runId,
			...e.proof
		};
		g("runEnd", {
			score: e.score,
			distance: e.distance,
			topKmh: e.topKmh,
			loot: e.loot.map((e) => ({
				kind: e.k,
				id: e.id,
				tier: e.tier
			})),
			runId: n.runId,
			demo: !!(ut && ut.demo)
		}), setTimeout(() => yt(e, t, n), 700);
	}
	function yt(e, t, n) {
		Ae.classList.add("hidden");
		let r = E("div", { class: "big" }, "0"), i = E("div", { class: "card" }, E("div", {
			class: "kicker",
			style: "margin-top:6px"
		}, H("endKicker")), r, E("div", { style: "font-size:13px;color:var(--craie2)" }, H("points"), t ? E("span", { class: "rec" }, H("record")) : null));
		if (w && w.sc) {
			let t = w.sc - e.score;
			i.append(E("div", {
				class: "challenge",
				style: "margin-top:10px"
			}, t < 0 ? H("challengeBeat") : H("challengeLost", { d: U(t) })));
		}
		i.append(E("div", { class: "stats bd" }, E("div", {}, E("small", {}, H("bdTricks")), E("b", {}, U(e.trickScore))), E("div", {}, E("small", {}, H("bdSpeed")), E("b", {}, U(e.speedPts))), E("div", {}, E("small", {}, H("bdDist")), E("b", {}, U(e.distPts))))), i.append(E("div", { class: "stats" }, E("div", {}, E("small", {}, H("topSpeed")), E("b", {}, e.topKmh + " km/h")), E("div", {}, E("small", {}, H("bestCombo")), E("b", {}, U(e.bestCombo))), E("div", {}, E("small", {}, H("perfects")), E("b", {}, String(e.perfects))))), e.bestNames && i.append(E("div", { class: "note" }, E("b", {}, H("bestChain") + " : "), e.bestNames));
		let a = e.loot.filter((e) => e.k === "token").sort((e, t) => Ze[t.tier] - Ze[e.tier]);
		if (a.length) {
			let e = a[0].tier, t = E("div", {
				class: "reward",
				style: "--tier:" + Xe[e]
			}, E("div", { class: "coin" }, "%"), E("div", { class: "lbl" }, H("codeTitle"), E("small", {}, H("tier_" + e))), E("span", {
				class: "note",
				style: "margin:0"
			}, H("codeWait")));
			i.append(t), te.claim({
				type: "code",
				tier: e,
				runProof: n
			}).then((n) => {
				if (t.lastChild.remove(), !n || !n.ok || !n.code) {
					t.append(E("span", {
						class: "note",
						style: "margin:0"
					}, n && n.message || H("codeFail")));
					return;
				}
				let r = E("code", { tabindex: "0" }, n.code), i = E("button", {
					class: "btn btn-ghost btn-sm",
					onClick: async () => {
						try {
							await navigator.clipboard.writeText(n.code), M(H("codeCopied"));
						} catch {
							let e = document.createRange();
							e.selectNodeContents(r);
							let t = getSelection();
							t.removeAllRanges(), t.addRange(e);
						}
					}
				}, H("codeCopy"));
				t.append(r, i), n.label && (t.querySelector(".lbl small").textContent = H("tier_" + e) + " · " + n.label), n.url && t.append(E("a", {
					class: "btn btn-sm btn-ride",
					href: n.url,
					target: "_top"
				}, V() === "en" ? "Apply" : "Appliquer")), n.demo && t.append(E("div", {
					class: "note",
					style: "flex-basis:100%;margin:0"
				}, H("codeDemo"))), g("codeRevealed", {
					tier: e,
					demo: !!n.demo
				});
			});
		}
		let o = e.loot.filter((e) => e.k === "excl");
		for (let e of o) O.byId.get(e.id) && te.claim({
			type: "exclusive",
			id: e.id,
			runProof: n
		}).then((t) => {
			t && t.ok && (v.unlocked.includes(e.id) || v.unlocked.push(e.id), b(), g("exclusiveUnlocked", {
				id: e.id,
				demo: !!t.demo
			}), g("objectiveUnlocked", {
				id: "exclusive-" + e.id,
				first: !0,
				products: [e.id]
			}));
		});
		let s = e.loot.filter((e) => e.k === "prod" || e.k === "excl"), c = [...new Map(s.map((e) => [e.id, e])).values()];
		if (i.append(E("div", { class: "sect" }, E("h3", {}, H("lootTitle") + " : " + H(c.length > 1 ? "lootNP" : "lootN", { n: c.length })), c.length > 1 ? E("button", {
			class: "btn btn-buy btn-sm",
			onClick: (e) => ke(e.currentTarget, c.map((e) => e.id).filter((e) => !(x(e) && !o.some((t) => t.id === e))))
		}, H("addAll")) : null)), !c.length) i.append(E("div", { class: "note" }, H("lootEmpty")));
		else {
			let e = E("div", { class: "loot" });
			for (let t of c) {
				let n = O.byId.get(t.id);
				if (!n) continue;
				let r = t.k === "excl";
				e.append(E("div", { class: "lootrow" + (r ? " ex" : "") }, ce(t.id, 48), E("div", { class: "nm" }, ue(n), E("small", {}, (r ? H("excl") + " · " : "") + he(n.price_ttc) + " · " + Ce(t.id).text)), E("div", { class: "acts" }, E("button", {
					class: "btn btn-ghost btn-sm",
					onClick: () => {
						dt(), ht(t.id);
					}
				}, H("tryOn")), E("button", {
					class: "btn btn-buy btn-sm",
					onClick: (e) => ke(e.currentTarget, [t.id])
				}, V() === "en" ? "Add" : "Ajouter"))));
			}
			i.append(e), te.claim({
				type: "product",
				ids: c.map((e) => e.id),
				runProof: n
			}).catch(() => {});
		}
		i.append(E("div", { class: "endbtns" }, E("button", {
			class: "btn btn-ride",
			onClick: () => _t(!0),
			html: H("again") + " <kbd>Espace</kbd>"
		}), E("button", {
			class: "btn btn-ghost",
			onClick: () => ht()
		}, H("wardrobe")))), i.append(E("div", { class: "sharebtns" }, E("button", {
			class: "btn btn-ghost btn-sm",
			onClick: () => xt(e)
		}, H("share")), E("button", {
			class: "btn btn-ghost btn-sm",
			onClick: () => St(e)
		}, H("challenge"))));
		let l = xe();
		i.append(E("div", { class: "shopline" }, E("span", {}, H("outfit") + " : ", E("b", {}, H(l.length > 1 ? "articlesP" : "articles", { n: l.length }) + " · " + he(Se(l)))), E("button", {
			class: "btn btn-buy btn-sm",
			onClick: (e) => ke(e.currentTarget)
		}, H("buyShort")))), ft(i);
		let u = performance.now(), d = () => {
			let t = Math.min(1, (performance.now() - u) / 900);
			r.textContent = U(e.score * (1 - (1 - t) * (1 - t))), t < 1 && !f && requestAnimationFrame(d);
		};
		d();
	}
	function bt(n) {
		let a = 1080, o = 1350, s = document.createElement("canvas");
		s.width = a, s.height = o;
		let c = s.getContext("2d"), l = c.createLinearGradient(0, 0, 0, o);
		l.addColorStop(0, "#1F1438"), l.addColorStop(.45, "#9C3460"), l.addColorStop(.75, "#FF9A52"), l.addColorStop(1, "#FFC874"), c.fillStyle = l, c.fillRect(0, 0, a, o), c.fillStyle = "rgba(20,20,22,.9)", c.fillRect(0, o * .72, a, o * .28), c.fillStyle = "#FFE9A8", c.globalAlpha = .85, c.beginPath(), c.arc(a * .72, o * .5, 170, 0, Math.PI * 2), c.fill(), c.globalAlpha = 1, c.fillStyle = "#2A1733";
		for (let e = 0; e < 9; e++) c.fillRect(e * 125 - 20, o * .72 - 120 - e * 97 % 260, 110, 400);
		let u = F(v, 0);
		c.save(), c.translate(a * .42, o * .72), c.scale(3.4, 3.4), c.save(), c.translate(50, -52), c.rotate(-Math.PI / 2 + .1), ne(c, u), c.restore(), y(c, {
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
		let d = U(n.score);
		return c.strokeText(d, 60, 1162), c.fillText(d, 60, 1162), c.font = "700 34px \"Space Grotesk\", system-ui, sans-serif", c.fillStyle = t, c.fillText(`${n.topKmh} km/h · combo ${U(n.bestCombo)} · ${n.loot.length} ${V() === "en" ? "loot" : "butin"}`, 64, 1222), [...new Set(n.loot.filter((e) => e.id).map((e) => e.id))].slice(0, 5).forEach((e, t) => {
			let n = O.byId.get(e);
			n && (c.save(), c.translate(940 - t * 120, 60), c.fillStyle = "#141416", c.fillRect(0, 0, 110, 110), c.translate(5, 5), re(c, n, oe(n), O.byId), c.restore());
		}), c.font = "700 30px \"Space Grotesk\", system-ui, sans-serif", c.fillStyle = r, c.fillText(V() === "en" ? "Beat my score →" : "Bats mon score →", 64, 1300), s;
	}
	async function xt(e) {
		let t = bt(e), n = Fe({
			seed: e.seed,
			score: e.score,
			ref: v.pid,
			shopUrl: o
		});
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
					title: H("shareTitle"),
					text: H("shareText", { score: U(e.score) }) + " " + n
				});
				return;
			}
		} catch (e) {
			if (e && e.name === "AbortError") return;
		}
		let i = document.createElement("a");
		i.href = URL.createObjectURL(r), i.download = "respawn-run.png", i.click(), setTimeout(() => URL.revokeObjectURL(i.href), 4e3), M(H("pngSaved"));
	}
	async function St(e) {
		let t = Fe({
			seed: e.seed,
			score: e.score,
			ref: v.pid,
			shopUrl: o
		});
		g("share", {
			kind: "challenge",
			score: e.score,
			link: t
		});
		try {
			if (ot && navigator.share) {
				await navigator.share({
					url: t,
					text: H("shareText", { score: U(e.score) })
				});
				return;
			}
			await navigator.clipboard.writeText(t), M(H("copied"));
		} catch (e) {
			e && e.name !== "AbortError" && M(t, 6e3);
		}
	}
	function Ct() {
		Z = "vest";
		let e = a.vestiaire && a.vestiaire.items || [], t = se(e);
		le = t.bag.length, I.setLook(F({
			...v,
			wear: t.wear
		}, le)), ve.classList.add("hidden"), G.classList.add("hidden"), I.showScene(gt());
		let n = Object.values(t.wear), r = E("div", { class: "card" }, E("div", {
			class: "kicker",
			style: "margin-top:6px"
		}, H("vestKicker")), E("h2", {}, H("vestTitle")));
		e.length || r.append(E("p", {}, H("vestEmpty"))), r.append(E("div", { class: "sect" }, E("h3", {}, H("vestWorn") + " · " + n.length)), E("div", { class: "vlist" }, ...n.map((e) => E("div", {}, ce(e, 56), ue(O.byId.get(e)))))), r.append(E("div", { class: "sect" }, E("h3", {}, H("vestBag") + " · " + t.bag.length)), t.bag.length ? E("div", { class: "vlist" }, ...t.bag.map((e) => E("div", {}, ce(e, 56), ue(O.byId.get(e))))) : E("div", { class: "note" }, H("vestBagEmpty"))), r.append(E("div", { class: "endbtns" }, E("button", {
			class: "btn btn-ride",
			onClick: () => {
				for (let [e, n] of Object.entries(t.wear)) v.wear[e] = n;
				b(), ht(), _t();
			}
		}, H("vestRide")), E("button", {
			class: "btn btn-ghost",
			onClick: _e
		}, H("exitCart"))));
		let i = ft(r);
		i.style.justifyContent = innerWidth >= innerHeight ? "flex-end" : "center", i.style.alignItems = innerWidth >= innerHeight ? "center" : "flex-end", i.style.background = "transparent", r.style.width = innerWidth >= innerHeight ? "min(520px,48%)" : "100%", r.style.maxHeight = innerWidth >= innerHeight ? "100%" : "56%", g("shopOpen", {
			context: "vestiaire",
			worn: n.length,
			bag: t.bag.length
		});
	}
	function wt(e) {
		if (!f) {
			if (e.code === "KeyM" && !e.target.closest?.("input,select,textarea")) {
				v.muted = !v.muted, N.setMuted(v.muted), b(), ge();
				return;
			}
			if (Z === "run") {
				if (e.code === "Escape" || e.code === "KeyP") {
					e.preventDefault(), I.G.paused ? mt() : pt();
					return;
				}
				if (I.G.paused) return;
				I.onKeyDown(e);
				return;
			}
			if (Z === "end" && I.G.mode === "end" && (e.code === "Space" || e.code === "Enter" || e.code === "KeyR") && performance.now() - lt > 1500) {
				let t = m.activeElement;
				if (e.code !== "KeyR" && t && t.tagName === "BUTTON" && !t.classList.contains("btn-ride")) return;
				e.preventDefault(), _t(!0);
				return;
			}
			Z === "wardrobe" && !Q && e.code === "Enter" && !(m.activeElement && /BUTTON|SELECT|SUMMARY/.test(m.activeElement.tagName)) && (e.preventDefault(), _t());
		}
	}
	let Tt = (e) => I.onKeyUp(e);
	window.addEventListener("keydown", wt), window.addEventListener("keyup", Tt);
	let Et = () => {
		document.hidden ? (I.stop(), N.suspend(), Z === "run" && pt()) : (I.start(), N.resume());
	};
	document.addEventListener("visibilitychange", Et);
	let Dt = new ResizeObserver(() => {
		I.resize(), (Z === "wardrobe" || Z === "vest") && I.setSceneRect(gt());
	});
	Dt.observe(T);
	let Ot = me(() => {
		T.lang = V(), ge(), Z === "wardrobe" && Te();
	});
	document.addEventListener("pointerdown", () => N.unlock(), { once: !0 }), ge(), I.resize(), s === "vestiaire" ? Ct() : s === "tryOn" ? ht(Number(a.tryOn)) : ht(), I.start(), h.then(() => {
		f || (I.rebuild(), Z === "wardrobe" && Te());
	}), g("ready", {
		context: s,
		version: Ue,
		demoRewards: te.demo
	});
	let kt = {
		get engine() {
			return I;
		},
		bridge: () => C,
		pause: () => pt(),
		openWardrobe: (e) => ht(e),
		openShop: (e) => ht(e),
		destroy() {
			f || (f = !0, I.destroy(), N.dispose(), Dt.disconnect(), Ot(), window.removeEventListener("keydown", wt), window.removeEventListener("keyup", Tt), document.removeEventListener("visibilitychange", Et), p.remove(), u && (u.remove(), document.documentElement.style.overflow = d || ""), g("destroy", {}));
		}
	};
	return (l || c.has("debug")) && (window.__r2d = {
		api: kt,
		engine: I,
		profile: v,
		CAT: O
	}), kt;
}
//#endregion
export { He as clearExited, $e as mount, Ue as version, Ve as wasExited };
