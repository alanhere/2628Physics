/* Reads the plain text files (lessons.txt and so on) and builds the pages.
   You should not need to edit this file. */
(function () {
  "use strict";

  var SITE = window.SITE || {};
  var tabs = SITE.tabs || [];
  var cache = {}, shown = {}, opened = {};
  var FIRST = 8, STEP = 10;

  var view = document.getElementById("view");
  var tabsEl = document.getElementById("tabs");

  var fDay = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });
  var fMonth = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });

  function dt(s) { return new Date(s + "T12:00:00"); }
  function day(s) { return fDay.format(dt(s)).replace(",", ""); }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }

  /* ---------- Reading the text files ---------- */

  function parse(text) {
    var items = [], cur = null, lastKey = null, skipped = 0;
    text.replace(/\r/g, "").split("\n").forEach(function (raw) {
      var line = raw.trim();
      if (!line || line.charAt(0) === "#") return;
      var m = line.match(/^([A-Za-z][A-Za-z0-9-]*)\s*:\s*(.*)$/);
      if (line.indexOf("- ") === 0) {
        if (cur && lastKey) cur[lastKey].push(line.slice(2).trim());
        return;
      }
      if (!m) {
        if (cur && lastKey && cur[lastKey].length) cur[lastKey][cur[lastKey].length - 1] += " " + line;
        return;
      }
      var key = m[1].toLowerCase(), val = m[2];
      if (key === "date") { cur = {}; items.push(cur); }
      if (!cur) return;
      if (!cur[key]) cur[key] = [];
      if (val) cur[key].push(val);
      lastKey = key;
    });
    var good = items.filter(function (it) {
      var ok = it.date && /^\d{4}-\d{2}-\d{2}$/.test(it.date[0]) && !isNaN(dt(it.date[0]).getTime()) && it.title && it.title[0];
      if (!ok) skipped++;
      return ok;
    });
    good.forEach(function (it) { it.date = it.date[0]; });
    good.sort(function (a, b) { return b.date < a.date ? -1 : b.date > a.date ? 1 : 0; });
    return { items: good, skipped: skipped };
  }

  function first(it, k) { return it[k] && it[k][0] ? it[k][0] : ""; }
  function all(it, k) { return it[k] || []; }
  function looksLikeUrl(s) { return /^(https?:\/\/|www\.)/i.test(s); }
  function fixUrl(u) { return /^www\./i.test(u) ? "https://" + u : u; }
  function split2(v) {
    var p = String(v).split("|").map(function (s) { return s.trim(); });
    if (p.length > 1) return { text: p[0], url: fixUrl(p[1]) };
    if (looksLikeUrl(p[0])) return { text: "", url: fixUrl(p[0]) };
    if (/\.(pdf|docx?|pptx?|xlsx?)$/i.test(p[0])) return { text: "", url: p[0] };
    return { text: p[0], url: "" };
  }
  /* A bare file name such as 7.pdf means a file in the given folder of this site. */
  function fileUrl(folder, u) {
    if (!u) return "";
    if (/^(https?:)?\/\//i.test(u) || u.indexOf("/") > -1) return u;
    return folder + "/" + encodeURI(u);
  }
  function csv(it, k) {
    var out = [];
    all(it, k).forEach(function (v) { v.split(",").forEach(function (s) { s = s.trim(); if (s) out.push(s); }); });
    return out;
  }

  /* ---------- Building blocks ---------- */

  /* A Google Drive share link, or just a file name in the photos folder, both work. */
  function driveId(u) {
    var m = String(u).match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^#]*&)?id=|thumbnail\?(?:[^#]*&)?id=)([A-Za-z0-9_-]{10,})/);
    return m ? m[1] : "";
  }
  function photoSrc(n) {
    if (window.photoOverride) { var r = window.photoOverride(n); if (r) return r; }
    var id = driveId(n);
    if (id) return "https://drive.google.com/thumbnail?id=" + id + "&sz=w1600";
    return /^(https?:)?\/\//.test(n) || n.charAt(0) === "/" ? n : "photos/" + n;
  }
  function photosHtml(names, single) {
    var h = '<div class="photos">';
    names.forEach(function (n, i) {
      var cap = single ? "Set-up" : "Photo " + (i + 1) + " of " + names.length;
      var id = driveId(n);
      var alt = id ? ' data-alt="https://lh3.googleusercontent.com/d/' + id + '" referrerpolicy="no-referrer"' : "";
      var miss = id ? "This photo will not load.<br>Check its Google Drive sharing is set to “Anyone with the link”."
                    : "Photo not uploaded yet<br>" + esc(n);
      h += '<button type="button" class="ph" data-src="' + esc(photoSrc(n)) + '" aria-label="Enlarge: ' + cap + '">' +
        '<span class="frame"><img loading="lazy" src="' + esc(photoSrc(n)) + '"' + alt + ' alt="' + esc(cap) + '">' +
        '<span class="miss">' + miss + '</span></span><span class="cap">' + cap + "</span></button>";
    });
    return h + "</div>";
  }

  function ytId(u) {
    var m = String(u).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/);
    return m ? m[1] : "";
  }
  var playSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l14 8-14 8z"/></svg>';
  function videoHtml(v) {
    if (!v) return '<p class="sub">No video yet.</p>';
    var l = split2(v), id = ytId(l.url), title = l.text || "Watch the video";
    if (!l.url) return '<p>' + esc(title) + '</p>';
    if (id) {
      return '<button type="button" class="vthumb" data-yt="' + id + '" style="--thumb:url(https://i.ytimg.com/vi/' + id + '/hqdefault.jpg)" aria-label="Play video: ' + esc(title) + '"><span class="play">' + playSvg + '</span></button>' +
        '<p class="vcap">' + esc(title) + '</p><a class="btn" href="' + esc(l.url) + '" target="_blank" rel="noopener">Open on YouTube</a>';
    }
    return '<p>' + esc(title) + '</p><a class="btn" href="' + esc(l.url) + '" target="_blank" rel="noopener">Watch the video</a>';
  }

  function blk(t, h) { return '<div class="block"><h3>' + esc(t) + "</h3>" + h + "</div>"; }
  function list(tag, arr) { return "<" + tag + (tag === "ul" ? ' class="plain"' : "") + ">" + arr.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</" + tag + ">"; }
  function paras(arr) { return arr.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join(""); }
  var tickSvg = '<svg class="tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 13l6 6L21 5"/></svg>';

  /* ---------- Tables and graphs ---------- */

  function tableHtml(it) {
    var head = first(it, "table"), rows = all(it, "row");
    if (!head) return "";
    var cols = head.split("|").map(function (s) { return s.trim(); });
    var h = '<div class="tablewrap"><table><thead><tr>' + cols.map(function (c) { return '<th scope="col">' + esc(c) + "</th>"; }).join("") + "</tr></thead><tbody>";
    rows.forEach(function (r) { h += "<tr>" + r.split("|").map(function (c) { return "<td>" + esc(c.trim()) + "</td>"; }).join("") + "</tr>"; });
    h += "</tbody></table></div>";
    if (/^(yes|true|on)$/i.test(first(it, "graph")) && cols.length >= 2) {
      var pts = rows.map(function (r) { var c = r.split("|"); return [parseFloat(c[0]), parseFloat(c[1])]; })
        .filter(function (p) { return !isNaN(p[0]) && !isNaN(p[1]); });
      if (pts.length >= 2) h += '<div class="graph">' + graphSvg(cols[0], cols[1], pts, (first(it, "fit") || "none").toLowerCase()) + "</div>";
    }
    return h;
  }

  function nice(max) {
    if (!(max > 0)) return { max: 1, step: 0.2 };
    var k0 = Math.floor(Math.log10(max)) - 1, mults = [1, 2, 5];
    for (var k = k0; k <= k0 + 3; k++) {
      for (var i = 0; i < 3; i++) {
        var step = mults[i] * Math.pow(10, k), n = Math.ceil(max / step - 1e-9);
        if (n >= 4 && n <= 8) return { max: n * step, step: step };
      }
    }
    return { max: max, step: max / 5 };
  }
  function fmt(v) { return String(Math.round(v * 1000) / 1000); }

  function graphSvg(xl, yl, pts, fit) {
    var xs = nice(Math.max.apply(null, pts.map(function (p) { return p[0]; }))),
        ys = nice(Math.max.apply(null, pts.map(function (p) { return p[1]; })));
    var L = 52, B = 44, T = 14, R = 16, W = 400, H = 280, pw = W - L - R, ph = H - T - B, v;
    function X(a) { return L + a / xs.max * pw; }
    function Y(a) { return T + ph - a / ys.max * ph; }
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Graph of ' + esc(yl) + " against " + esc(xl) + '">';
    for (v = 0; v <= xs.max + 1e-9; v += xs.step) s += '<line class="g-grid" x1="' + X(v) + '" y1="' + T + '" x2="' + X(v) + '" y2="' + (T + ph) + '"/><text class="g-text" x="' + X(v) + '" y="' + (T + ph + 18) + '" text-anchor="middle">' + fmt(v) + "</text>";
    for (v = 0; v <= ys.max + 1e-9; v += ys.step) s += '<line class="g-grid" x1="' + L + '" y1="' + Y(v) + '" x2="' + (L + pw) + '" y2="' + Y(v) + '"/><text class="g-text" x="' + (L - 8) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + fmt(v) + "</text>";
    s += '<line class="g-axis" x1="' + L + '" y1="' + T + '" x2="' + L + '" y2="' + (T + ph) + '"/><line class="g-axis" x1="' + L + '" y1="' + (T + ph) + '" x2="' + (L + pw) + '" y2="' + (T + ph) + '"/>';

    if (fit === "origin" || fit === "line") {
      var n = pts.length, sx = 0, sy = 0, sxx = 0, sxy = 0;
      pts.forEach(function (p) { sx += p[0]; sy += p[1]; sxx += p[0] * p[0]; sxy += p[0] * p[1]; });
      var a = 0, b = 0;
      if (fit === "origin") { b = sxy / sxx; }
      else { var d = n * sxx - sx * sx; b = d ? (n * sxy - sx * sy) / d : 0; a = (sy - b * sx) / n; }
      var x1 = 0, y1 = a, x2 = xs.max, y2 = a + b * xs.max;
      if (b > 0) {
        if (y2 > ys.max) { x2 = (ys.max - a) / b; y2 = ys.max; }
        if (y1 < 0) { x1 = -a / b; y1 = 0; }
      }
      s += '<line class="g-fit" x1="' + X(x1) + '" y1="' + Y(y1) + '" x2="' + X(x2) + '" y2="' + Y(y2) + '"/>';
    }
    pts.forEach(function (p) {
      var x = X(p[0]), y = Y(p[1]);
      s += '<path class="g-pt" d="M' + (x - 5) + " " + (y - 5) + "L" + (x + 5) + " " + (y + 5) + "M" + (x - 5) + " " + (y + 5) + "L" + (x + 5) + " " + (y - 5) + '"/>';
    });
    return s + '<text class="g-text" x="' + (L + pw / 2) + '" y="' + (H - 6) + '" text-anchor="middle">' + esc(xl) + '</text>' +
      '<text class="g-text" transform="translate(14 ' + (T + ph / 2) + ') rotate(-90)" text-anchor="middle">' + esc(yl) + "</text></svg>";
  }

  /* ---------- One body per type of page ---------- */

  var BODY = {
    lesson: function (it, prev) {
      var h = "", hw = first(it, "homework");
      if (hw) {
        var l = split2(hw);
        h += blk("Tonight’s homework", (l.text ? '<p class="sub">' + esc(l.text) + "</p>" : "") +
          (l.url ? '<a class="btn main" href="' + esc(l.url) + '" target="_blank" rel="noopener">Open homework</a>' : ""));
      } else {
        h += blk("Tonight’s homework", '<p class="sub">No homework tonight.</p>');
      }
      var ph = csv(it, "photos");
      h += blk("From the board", ph.length ? photosHtml(ph) : '<p class="sub">Photos will be added soon.</p>');

      var sol = first(it, "solutions"), qs = all(it, "q"), s = "";
      if (sol || qs.length) {
        if (prev) s += '<p class="sub">Homework set on ' + esc(day(prev.date)) + ".</p>";
        if (qs.length) {
          s += '<ul class="marks">' + qs.map(function (q) {
            var x = split2(q);
            return "<li>" + (x.url ? '<a class="q" href="' + esc(x.url) + '" target="_blank" rel="noopener" aria-label="Solution to question ' + esc(x.text) + '">' + tickSvg + "Q" + esc(x.text) + "</a>" : "") + "</li>";
          }).join("") + "</ul>";
        }
        if (sol) { var sl = split2(sol); s += '<a class="btn' + (qs.length ? "" : " main") + '" href="' + esc(sl.url || sol) + '" target="_blank" rel="noopener">' + (qs.length ? "Open all solutions" : "Open solutions") + "</a>"; }
      } else {
        s = '<p class="sub">' + (prev ? "Solutions will be added soon." : "No homework was set before this lesson.") + "</p>";
      }
      h += blk("Solutions to last night’s homework", s);
      h += blk("Video help", videoHtml(first(it, "video")));
      var nt = first(it, "notes");
      if (nt) {
        var n = split2(nt);
        h += blk("Guided notes", (n.text ? '<p class="sub">' + esc(n.text) + "</p>" : "") +
          (n.url ? '<a class="btn" href="' + esc(fileUrl("notes", n.url)) + '" target="_blank" rel="noopener">Open notes</a>' : ""));
      }
      return h;
    },
    investigation: function (it) {
      var h = "";
      if (first(it, "aim")) h += blk("Aim", "<p>" + esc(first(it, "aim")) + "</p>");
      var eq = []; all(it, "equipment").forEach(function (v) { v.split(";").forEach(function (x) { x = x.trim(); if (x) eq.push(x); }); });
      if (eq.length) h += blk("Equipment", list("ul", eq));
      if (all(it, "method").length) h += blk("Method", list("ol", all(it, "method")));
      var ph = csv(it, "photos");
      if (ph.length) h += blk("Set-up", photosHtml(ph, ph.length === 1));
      var t = tableHtml(it);
      if (t) h += blk("Results", t);
      if (first(it, "conclusion")) h += blk("Conclusion", paras(all(it, "conclusion")));
      return h || blk("Details", '<p class="sub">Nothing added yet.</p>');
    },
    demo: function (it) {
      var h = blk("Watch", videoHtml(first(it, "video")));
      var ph = csv(it, "photos");
      if (ph.length) h += blk("Photos", photosHtml(ph));
      if (first(it, "notice")) h += blk("What to notice", paras(all(it, "notice")));
      if (first(it, "physics")) h += blk("The physics behind it", paras(all(it, "physics")));
      return h;
    },
    research: function (it) {
      var h = "";
      if (first(it, "question")) h += blk("The question", "<p>" + esc(first(it, "question")) + "</p>");
      if (all(it, "found").length) h += blk("What I found", paras(all(it, "found")));
      if (all(it, "sources").length) {
        h += blk("Sources", '<ul class="plain">' + all(it, "sources").map(function (s) {
          var x = split2(s);
          return "<li>" + (x.url ? '<a href="' + esc(x.url) + '" target="_blank" rel="noopener">' + esc(x.text || x.url) + "</a>" : esc(x.text)) + "</li>";
        }).join("") + "</ul>");
      }
      if (first(it, "further")) h += blk("Go further", "<p>" + esc(first(it, "further")) + "</p>");
      return h || blk("Details", '<p class="sub">Nothing added yet.</p>');
    }
  };

  /* ---------- Page ---------- */

  function route() {
    var h = decodeURIComponent(location.hash.replace(/^#/, "")).split("/");
    var t = tabs.filter(function (x) { return x.id === h[0]; })[0] || tabs[0];
    return { tab: t, item: h[1] || "" };
  }

  function load(tab) {
    if (window.SITE_DATA && window.SITE_DATA[tab.file] != null) return Promise.resolve(window.SITE_DATA[tab.file]);
    return fetch(tab.file, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.text();
    });
  }

  function render() {
    var r = route(), tab = r.tab;
    Array.prototype.forEach.call(tabsEl.children, function (b) { b.setAttribute("aria-selected", b.dataset.tab === tab.id); });

    if (tab.type === "study") { renderStudy(tab, r.item); return; }

    if (!cache[tab.id]) {
      view.innerHTML = '<p class="note">Loading…</p>';
      load(tab).then(function (text) { cache[tab.id] = parse(text); render(); }, function () {
        view.innerHTML = '<p class="note warn">Could not load ' + esc(tab.file) + ". Check that the file is in the site folder and named exactly that.</p>";
      });
      return;
    }

    var data = cache[tab.id], items = data.items;
    if (tab.type === "notes") { view.innerHTML = renderNotes(tab, data); return; }
    if (tab.type === "resources") { view.innerHTML = renderResources(tab, data); return; }
    var openIds = Array.prototype.map.call(view.querySelectorAll("details[open]"), function (d) { return d.id; });
    var limit = shown[tab.id] || FIRST;
    var target = -1;
    if (r.item) {
      items.some(function (it, i) { if (it.date === r.item) { target = i; return true; } });
      if (target >= limit) { limit = target + 1; shown[tab.id] = limit; }
    }

    var h = "";
    if (!items.length) {
      h = '<p class="note">Nothing here yet. Add an entry to ' + esc(tab.file) + " and it will appear.</p>";
    } else {
      h = '<ol class="timeline">';
      var lastMonth = "";
      items.slice(0, limit).forEach(function (it, i) {
        var m = it.date.slice(0, 7);
        if (m !== lastMonth) { h += '<li class="ghead"><h2>' + fMonth.format(dt(it.date)) + "</h2></li>"; lastMonth = m; }
        var id = "item-" + it.date + (it.__n ? "-" + it.__n : "");
        var prev = items[i + 1] || null;
        h += '<li class="lesson"><details id="' + id + '"><summary><span class="date">' + esc(day(it.date)) + "</span>" +
          '<span class="topic">' + esc(first(it, "title")) + "</span>" +
          (i === 0 && tab.type === "lesson" ? '<span class="new">new</span>' : "") +
          '<span class="chev" aria-hidden="true"></span></summary><div class="body">' + BODY[tab.type](it, prev) + "</div></details></li>";
      });
      h += "</ol>";
      if (items.length > limit) h += '<button type="button" class="more" data-more="1">Show earlier ' + esc(tab.noun || "items") + "</button>";
    }
    if (data.skipped) h += '<p class="note warn">' + data.skipped + (data.skipped === 1 ? " entry was" : " entries were") + " skipped. Each one needs a title and a date written like 2026-10-08.</p>";
    view.innerHTML = h;

    var firstTime = !opened[tab.id];
    opened[tab.id] = true;
    if (firstTime && items.length && tab.type === "lesson") openId("item-" + items[0].date);
    openIds.forEach(openId);
    if (target > -1) {
      var el = document.getElementById("item-" + r.item);
      if (el) { el.open = true; el.scrollIntoView({ block: "start" }); }
    }
  }
  function openId(id) { var d = document.getElementById(id); if (d) d.open = true; }

  /* The Study tab: a switch between its sections, such as Revision and Maths skills */
  function renderStudy(tab, secId) {
    var sec = tab.sections.filter(function (x) { return x.id === secId; })[0] || tab.sections[0];
    var key = "study:" + sec.id;
    var bar = '<div class="subtabs" role="group" aria-label="Study sections">' + tab.sections.map(function (x) {
      return '<button type="button" data-sub="' + x.id + '" aria-pressed="' + (x.id === sec.id) + '">' + esc(x.label) + "</button>";
    }).join("") + "</div>";
    if (!cache[key]) {
      view.innerHTML = bar + '<p class="note">Loading…</p>';
      load(sec).then(function (text) { cache[key] = parse(text); render(); }, function () {
        view.innerHTML = bar + '<p class="note warn">Could not load ' + esc(sec.file) + ". Check that the file is in the site folder and named exactly that.</p>";
      });
      return;
    }
    view.innerHTML = bar + (sec.view === "cards" ? renderSites : renderResources)(sec, cache[key]);
  }

  /* Useful sites: grouped by heading, each one a card with a button straight to the site */
  function renderSites(sec, data) {
    var items = data.items.slice().sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    var order = [], groups = {}, h = "";
    items.forEach(function (it) {
      var t = first(it, "topic") || "Other";
      if (!groups[t]) { groups[t] = []; order.push(t); }
      groups[t].push(it);
    });
    if (!items.length) {
      h = '<p class="note">Nothing here yet. Add an entry to ' + esc(sec.file) + " and it will appear.</p>";
    } else {
      h = '<ol class="timeline">';
      order.forEach(function (t) {
        h += '<li class="ghead"><h2>' + esc(t) + "</h2></li>";
        groups[t].forEach(function (it) {
          var links = all(it, "link").map(function (l, i) {
            var x = split2(l);
            if (!x.url) return "";
            return '<a class="btn' + (i === 0 ? " main" : "") + '" href="' + esc(fileUrl(sec.folder || "files", x.url)) + '" target="_blank" rel="noopener">' + esc(x.text || "Visit site") + "</a>";
          }).join("");
          h += '<li class="lesson"><div class="card"><b>' + esc(first(it, "title")) + "</b>" +
            (first(it, "about") ? "<p>" + esc(first(it, "about")) + "</p>" : "") +
            '<div class="actions">' + (links || '<span class="muted">Link coming soon.</span>') + "</div></div></li>";
        });
      });
      h += "</ol>";
    }
    if (data.skipped) h += '<p class="note warn">' + data.skipped + (data.skipped === 1 ? " entry was" : " entries were") + " skipped. Each one needs a title and a date written like 2026-10-08.</p>";
    return h;
  }

  /* Revision and maths skills: grouped by topic, each entry opens to show links, a video and worked examples */
  function renderResources(tab, data) {
    var items = data.items.slice().sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    var order = [], groups = {}, h = "", n = 0;
    items.forEach(function (it) {
      var t = first(it, "topic") || "Other";
      if (!groups[t]) { groups[t] = []; order.push(t); }
      groups[t].push(it);
    });
    if (!items.length) {
      h = '<p class="note">Nothing here yet. Add an entry to ' + esc(tab.file) + " and it will appear.</p>";
    } else {
      h = '<ol class="timeline">';
      order.forEach(function (t) {
        h += '<li class="ghead"><h2>' + esc(t) + "</h2></li>";
        groups[t].forEach(function (it) {
          var body = "";
          if (first(it, "about")) body += '<div class="block"><p>' + esc(first(it, "about")) + "</p></div>";
          if (all(it, "explain").length) body += blk("The idea", paras(all(it, "explain")));
          if (all(it, "example").length) body += blk("Worked example", paras(all(it, "example")));
          if (first(it, "video")) body += blk("Watch", videoHtml(first(it, "video")));
          var links = all(it, "link");
          if (links.length) {
            body += blk(tab.linksHeading || "Resources", '<div class="actions">' + links.map(function (l, i) {
              var x = split2(l);
              if (!x.url) return "";
              return '<a class="btn' + (i === 0 ? " main" : "") + '" href="' + esc(fileUrl(tab.folder || "files", x.url)) + '" target="_blank" rel="noopener">' + esc(x.text || "Open") + "</a>";
            }).join("") + "</div>");
          }
          h += '<li class="lesson"><details id="res-' + tab.id + "-" + (n++) + '"><summary><span class="topic">' + esc(first(it, "title")) +
            '</span><span class="chev" aria-hidden="true"></span></summary><div class="body">' +
            (body || blk("Details", '<p class="sub">Nothing added yet.</p>')) + "</div></details></li>";
        });
      });
      h += "</ol>";
    }
    if (data.skipped) h += '<p class="note warn">' + data.skipped + (data.skipped === 1 ? " entry was" : " entries were") + " skipped. Each one needs a title and a date written like 2026-10-08.</p>";
    return h;
  }

  /* Guided notes: grouped by topic, topics in the order they were first given out */
  function renderNotes(tab, data) {
    var items = data.items.slice().sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    var order = [], groups = {}, h = "";
    items.forEach(function (it) {
      var t = first(it, "topic") || "Other";
      if (!groups[t]) { groups[t] = []; order.push(t); }
      groups[t].push(it);
    });
    if (!items.length) {
      h = '<p class="note">Nothing here yet. Add an entry to ' + esc(tab.file) + " and it will appear.</p>";
    } else {
      h = '<ol class="timeline">';
      order.forEach(function (t) {
        h += '<li class="ghead"><h2>' + esc(t) + "</h2></li>";
        groups[t].forEach(function (it) {
          var n = split2(first(it, "notes")), c = split2(first(it, "completed"));
          h += '<li class="lesson"><div class="card"><b>' + esc(first(it, "title")) + "</b>" +
            (first(it, "about") ? "<p>" + esc(first(it, "about")) + "</p>" : "") + '<div class="actions">' +
            (n.url ? '<a class="btn main" href="' + esc(fileUrl("notes", n.url)) + '" target="_blank" rel="noopener">Open notes</a>' : '<span class="muted">Notes coming soon.</span>') +
            (c.url ? '<a class="btn" href="' + esc(fileUrl("notes", c.url)) + '" target="_blank" rel="noopener">Completed notes</a>' : "") +
            "</div></div></li>";
        });
      });
      h += "</ol>";
    }
    if (data.skipped) h += '<p class="note warn">' + data.skipped + (data.skipped === 1 ? " entry was" : " entries were") + " skipped. Each one needs a title and a date written like 2026-10-08.</p>";
    return h;
  }

  /* ---------- Start up ---------- */

  document.title = SITE.title || "Lessons";
  document.getElementById("siteTitle").textContent = SITE.title || "Lessons";
  document.getElementById("siteIntro").textContent = SITE.intro || "";
  if (SITE.ink) document.documentElement.style.setProperty("--ink-set", SITE.ink);

  if (tabs.length > 1) {
    tabsEl.innerHTML = tabs.map(function (t) { return '<button type="button" role="tab" data-tab="' + t.id + '">' + esc(t.label) + "</button>"; }).join("");
  } else {
    tabsEl.hidden = true;
  }

  document.addEventListener("click", function (e) {
    var t;
    if ((t = e.target.closest("[data-tab]"))) { location.hash = t.dataset.tab; }
    else if ((t = e.target.closest("[data-sub]"))) { location.hash = route().tab.id + "/" + t.dataset.sub; }
    else if ((t = e.target.closest("[data-more]"))) { var id = route().tab.id; shown[id] = (shown[id] || FIRST) + STEP; render(); }
    else if ((t = e.target.closest("button.ph"))) {
      if (t.classList.contains("missing")) return;
      var img = document.getElementById("viewerImg");
      img.src = t.dataset.src;
      document.getElementById("viewer").showModal();
    }
    else if ((t = e.target.closest("[data-yt]"))) {
      var box = document.createElement("div");
      box.className = "vframe";
      box.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + t.dataset.yt + '?autoplay=1&rel=0" title="Video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
      t.replaceWith(box);
    }
  });
  document.addEventListener("error", function (e) {
    var el = e.target;
    if (!el || el.tagName !== "IMG" || !el.closest) return;
    var btn = el.closest("button.ph");
    if (!btn) return;
    if (el.dataset.alt && !el.dataset.tried) {
      el.dataset.tried = "1";
      el.src = el.dataset.alt;
      btn.dataset.src = el.dataset.alt;
      return;
    }
    btn.classList.add("missing");
  }, true);
  document.getElementById("viewer").addEventListener("click", function (e) { if (e.target === this) this.close(); });
  window.addEventListener("hashchange", function () { render(); if (!route().item) window.scrollTo(0, 0); });

  render();
})();
