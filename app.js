(() => {
  const storageKey = "campus-stores.shift.v2";
  const root = document.getElementById("campus-stores");
  const q = (selector) => root.querySelector(selector);
  const requests = [
    {
      id: "RQ-214",
      club: "Film Society",
      event: "Courtyard screening",
      owner: "Isha Rao",
      due: "Fri 8 pm",
      items: ["HDMI projector", "Portable speaker", "USB-C → HDMI adapter"],
      note: "Playback is from a USB-C-only laptop. The host will collect at 4 pm.",
    },
    {
      id: "RQ-209",
      club: "Debate Union",
      event: "Finals rehearsal",
      owner: "Tara Shah",
      due: "Sat 10 am",
      items: ["Wireless microphone"],
      note: "Rehearsal runs into the evening.",
    },
    {
      id: "RQ-217",
      club: "Photo Circle",
      event: "Street portrait walk",
      owner: "Dev Menon",
      due: "Sat noon",
      items: ["Digital camera"],
      note: "Collection on Saturday morning.",
    },
  ];
  const assets = [
    { id: "PR-04", type: "HDMI projector", model: "BenQ MH550", bin: "A2" },
    {
      id: "PR-06",
      type: "HDMI projector",
      model: "Epson EB-X49",
      bin: "Workshop",
      repair: true,
    },
    { id: "SP-02", type: "Portable speaker", model: "JBL Eon One", bin: "B1" },
    { id: "SP-05", type: "Portable speaker", model: "Bose S1", bin: "B2" },
    {
      id: "AD-12",
      type: "USB-C → HDMI adapter",
      model: "Belkin AVC002",
      bin: "C4",
    },
    {
      id: "AD-15",
      type: "USB-C → HDMI adapter",
      model: "Anker A8312",
      bin: "C4",
    },
    { id: "MI-09", type: "Wireless microphone", model: "Shure BLX", bin: "B3" },
    { id: "CA-03", type: "Digital camera", model: "Sony A6400", bin: "D2" },
  ];
  const people = [
    "Isha Rao",
    "Kabir Sen",
    "Leela Das",
    "Tara Shah",
    "Dev Menon",
  ];
  const shifts = [
    {
      time: "Friday · 3:45 pm",
      at: 945,
      title: "Pickup at the counter",
      text: "Kabir is here for the Film Society screening. The film starts at four. Can he leave with everything he needs?",
      next: "Move to return time",
    },
    {
      time: "Friday · 7:30 pm",
      at: 1170,
      title: "The kit comes back in pieces",
      text: "Kabir has brought back the projector and speaker. “Leela still has the adapter. She’ll drop it off tomorrow at nine.” Take the return and hand over to the morning shift.",
      next: "Move to next morning",
    },
    {
      time: "Saturday · 9:00 am",
      at: 1980,
      title: "Morning shift",
      text: "You’ve just taken over. Leela walks in with an adapter. Work out what was outstanding from the screening and close the loan for the right item.",
    },
  ];
  // Club messages. Each also names the record change it implies, so the
  // counter can offer it on the right ticket instead of leaving it in chat.
  const messages = [
    {
      phase: 0,
      time: "Friday · 3:20 pm",
      from: "Isha Rao · Film Society",
      req: "RQ-214",
      collector: "Kabir Sen",
      text: "Kabir Sen is picking up our whole screening kit. Please issue it in his name. I’m setting up in the courtyard.",
    },
    {
      phase: 0,
      time: "Friday · 3:30 pm",
      from: "Tara Shah · Debate Union",
      req: "RQ-209",
      text: "Our microphone stays with me overnight. I’ll return it by 10 am Saturday.",
    },
    {
      phase: 1,
      time: "Friday · 7:30 pm",
      from: "Kabir Sen · Film Society",
      req: "RQ-214",
      hold: { type: "USB-C → HDMI adapter", holder: "Leela Das", due: "Sat 9 am" },
      text: "I brought the projector and speaker. Leela Das has our adapter. She’ll be at the counter at 9 am tomorrow.",
    },
  ];
  const heard = () => messages.filter((m) => m.phase <= s.phase);
  const dueAt = {
    "Fri 8 pm": 1200,
    "Sat 9 am": 1980,
    "Sat 10 am": 2040,
    "Sat noon": 2160,
  };
  const pages = [
    ["Counter", "ticket"],
    ["Requests", "clipboard-list"],
    ["Inventory", "package"],
    ["Loan register", "book-open"],
    ["Desk book", "messages-square"],
  ];
  const original = () => ({
    version: 2,
    tab: "Counter",
    phase: 0,
    selected: "",
    filter: "All items",
    loans: [
      {
        num: 401,
        req: "RQ-209",
        asset: "MI-09",
        who: "Tara Shah",
        due: "Sat 10 am",
        back: false,
      },
    ],
    notes: [],
    editing: false,
    open: 0,
    onlyOpen: true,
    notice: "Sample shift · All records are fictional.",
  });
  let s = original();
  const getAsset = (id) => assets.find((x) => x.id === id);
  const getReq = (id) => requests.find((x) => x.id === id);
  const out = (id) => s.loans.find((l) => l.asset === id && !l.back);
  const esc = (x) =>
    String(x).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const opts = (list, cur) =>
    list
      .map(
        ([v, t]) =>
          '<option value="' +
          esc(v) +
          '"' +
          (v === cur ? " selected" : "") +
          ">" +
          esc(t) +
          "</option>",
      )
      .join("");
  const holder = (l) => l.holder || l.who;
  const timing = (l) => {
    const d = dueAt[l.due] - shifts[s.phase].at;
    return d < 0 ? "late" : d === 0 ? "now" : "";
  };
  const btn = (label, act, val = "", style = "") =>
    '<button type="button" data-action="' +
    act +
    '" data-val="' +
    esc(val) +
    '" class="' +
    style +
    '">' +
    esc(label) +
    "</button>";
  const head = (title, sub, control = "") =>
    '<div class="sectionhead"><div><h2>' +
    title +
    "</h2><small>" +
    sub +
    "</small></div>" +
    control +
    "</div>";
  const row = (label, sub, right) =>
    '<div class="row"><div><strong>' +
    esc(label) +
    "</strong><small>" +
    esc(sub) +
    "</small></div><div>" +
    right +
    "</div></div>";
  const badge = (t, good = false) =>
    '<span class="tag' + (good ? " good" : "") + '">' + esc(t) + "</span>";
  function requestPage() {
    let html = head(
      "Approved requests",
      "Student Activities Office · 3 approved forms",
    );
    if (s.selected) {
      const r = getReq(s.selected);
      html +=
        btn("Back to list", "close") +
        '<div class="record"><small>' +
        r.id +
        " · Approved</small><h3>" +
        r.event +
        "</h3><p>" +
        r.club +
        " · Filed by " +
        r.owner +
        "</p><p><b>Return by</b> " +
        r.due +
        "</p><p><b>Approved equipment</b></p><ul>" +
        r.items.map((x) => "<li>" + x + "</li>").join("") +
        "</ul><p>" +
        r.note +
        "</p></div>";
    } else
      html += requests
        .map((r) =>
          row(
            r.event,
            r.id + " · " + r.club,
            btn("View form", "request", r.id),
          ),
        )
        .join("");
    return html;
  }
  function inventory() {
    let html = head(
      "Inventory",
      "Physical units · home shelf and current availability",
    );
    html +=
      '<div class="buttons"><label>Show <select data-filter>' +
      opts(
        ["All items", "On shelf", "On loan", "In repair"].map((f) => [f, f]),
      ) +
      "</select></label></div>";
    for (const a of assets) {
      const l = out(a.id);
      const status = a.repair ? "In repair" : l ? "On loan" : "On shelf";
      if (s.filter !== "All items" && s.filter !== status) continue;
      html += row(
        a.id + " · " + a.type,
        a.model + " · " + a.bin + (l ? " · with " + holder(l) + ", due " + l.due : ""),
        badge(status, status === "On shelf"),
      );
    }
    return html;
  }
  function register() {
    let html = head(
      "Loan register",
      "One slip per physical unit",
      s.editing
        ? btn("Cancel", "cancel")
        : btn("New issue slip", "new", "", "primary"),
    );
    if (s.editing) {
      const available = assets.filter((a) => !a.repair && !out(a.id));
      const select = (label, key, options) =>
        "<label><span>" +
        label +
        '</span><select name="' +
        key +
        '" required><option value="">Select…</option>' +
        opts(options) +
        "</select></label>";
      return (
        html +
        '<form data-issue><div class="form">' +
        select(
          "Approved request",
          "req",
          requests.map((r) => [r.id, r.id + " · " + r.club]),
        ) +
        '<label><span>Units leaving the desk · one slip each</span><select name="asset" multiple required size="' +
        available.length +
        '">' +
        opts(available.map((a) => [a.id, a.id + " · " + a.type + " · " + a.model])) +
        "</select><small>Ctrl/Cmd-click to pick several</small></label>" +
        select(
          "Collected by",
          "who",
          people.map((p) => [p, p]),
        ) +
        select(
          "Return by",
          "due",
          Object.keys(dueAt).map((d) => [d, d]),
        ) +
        '</div><button type="submit" class="primary">Save issue slip</button></form>'
      );
    }
    html +=
      '<div class="buttons">' +
      ["Outstanding", "All slips"]
        .map(
          (v, i) =>
            '<button type="button" data-action="scope" data-val="' +
            i +
            '" aria-pressed="' +
            (s.onlyOpen === (i === 0)) +
            '">' +
            v +
            "</button>",
        )
        .join("") +
      "</div>";
    const shown = s.loans
      .filter((l) => !s.onlyOpen || !l.back)
      .slice()
      .reverse();
    if (!shown.length) html += "<p>No outstanding slips.</p>";
    for (const l of shown)
      html += row(
        "L-" + l.num + " · " + l.asset + " " + getAsset(l.asset).type,
        l.req + " · " + holder(l) + " · Due " + l.due,
        l.back
          ? badge("Returned")
          : btn("Record return", "return", String(l.num)),
      );
    return html;
  }
  function deskbook() {
    let html = head(
      "Desk book",
      "Messages from clubs and notes for the next shift",
    );
    const entries = heard().map((m) => [m.time, m.from, m.text]);
    for (const n of s.notes)
      entries.push([shifts[n.phase].time, "Counter handover", n.text]);
    for (const [t, author, body] of entries.slice().reverse())
      html +=
        '<article class="record"><small>' +
        esc(t) +
        "</small><h3>" +
        esc(author) +
        "</h3><p>" +
        esc(body) +
        "</p></article>";
    return (
      html +
      '<form data-note><div class="form"><label class="full"><span>Note for the next shift</span><textarea name="note" rows="2" maxlength="400" required></textarea></label></div><button type="submit">Add handover note</button></form>'
    );
  }
  // Counter: each approved request is a ticket that stays on the rail
  // until every approved unit is back, like an order ticket in a kitchen.
  const lines = (r) =>
    r.items.map((type) => ({
      type,
      l: s.loans
        .filter((l) => l.req === r.id && getAsset(l.asset).type === type)
        .pop(),
    }));
  function line({ type, l }, i, r) {
    if (!l) {
      const free = assets.filter((a) => a.type === type && !a.repair && !out(a.id));
      return (
        '<li class="todo"><span>' +
        esc(type) +
        "<small>To hand out</small></span><select name=\"u" +
        i +
        '" form="hand-' +
        r.id +
        '" aria-label="Unit for ' +
        esc(type) +
        '">' +
        (free.length
          ? opts(free.map((a) => [a.id, a.id + " · " + a.model]))
          : '<option value="">None on shelf</option>') +
        "</select></li>"
      );
    }
    const a = getAsset(l.asset);
    const tag = '<b class="tagid">' + a.id + "</b> " + esc(type);
    if (l.back)
      return (
        '<li class="back"><span>' +
        tag +
        "<small>Back" +
        (l.backAt ? " " + esc(l.backAt) + " from " + esc(l.backBy) : "") +
        "</small></span></li>"
      );
    const t = timing(l);
    let html =
      '<li class="out ' +
      t +
      '"><span>' +
      tag +
      "<small>With " +
      esc(holder(l)) +
      (l.holder && l.holder !== l.who ? " (collected by " + esc(l.who) + ")" : "") +
      " · " +
      (t === "late" ? "late, was due " : t === "now" ? "due now, " : "due ") +
      esc(l.due) +
      "</small></span>";
    if (s.open !== l.num) return html + btn("Check in", "open", l.num) + "</li>";
    const pick = (name, cur) =>
      '<select name="' + name + '">' + opts(people.map((p) => [p, p]), cur) + "</select>";
    return (
      html +
      '</li><li class="check"><form data-check="' +
      l.num +
      '"><p>Match the tag on the unit: <b class="tagid">' +
      a.id +
      "</b> · " +
      esc(a.model) +
      " · bin " +
      a.bin +
      "</p><label><span>Handed back by</span>" +
      pick("by", holder(l)) +
      '</label><div class="buttons"><button class="primary" name="act" value="in">Check in ' +
      a.id +
      "</button>" +
      btn("Cancel", "shut") +
      "</div><details><summary>Not here? Note who has it</summary><label><span>With</span>" +
      pick("holder", holder(l)) +
      "</label><label><span>Back by</span><select name=\"due\">" +
      opts(Object.keys(dueAt).map((d) => [d, d]), l.due) +
      '</select></label><button name="act" value="hold">Update ticket</button></details></form></li>'
    );
  }
  // The open loan a club message is about, and whether the record already says it.
  const target = (m) =>
    m.hold &&
    s.loans.find(
      (l) => l.req === m.req && !l.back && getAsset(l.asset).type === m.hold.type,
    );
  const behind = (m) => {
    const l = target(m);
    return l && (holder(l) !== m.hold.holder || l.due !== m.hold.due);
  };
  function word(m) {
    const l = target(m);
    return (
      (behind(m) ? "<blockquote>" : '<blockquote class="quiet" title="' + esc(m.text) + '">') +
      "<small>" +
      esc(m.time.split(" · ")[1] + " · " + m.from.split(" · ")[0]) +
      "</small>" +
      esc(m.text) +
      (behind(m)
        ? btn(
            "Put on record: " + l.asset + " with " + m.hold.holder + ", back " + m.hold.due,
            "apply",
            messages.indexOf(m),
            "primary",
          )
        : "") +
      "</blockquote>"
    );
  }
  function ticket(r) {
    const ls = lines(r);
    const n = (f) => ls.filter(f).length;
    const said = heard().filter((m) => m.req === r.id);
    const collector = (said.find((m) => m.collector) || {}).collector;
    const todo = n((x) => !x.l),
      back = n((x) => x.l && x.l.back),
      hot =
        ls.some((x) => x.l && !x.l.back && timing(x.l)) || said.some(behind);
    const status =
      todo === ls.length
        ? "Not handed out"
        : back === ls.length
          ? "All back"
          : back
            ? back + " of " + ls.length + " back"
            : "Out · " + (ls.length - todo) + " of " + ls.length;
    const rank = hot ? 0 : todo === ls.length ? 2 : back === ls.length ? 3 : 1;
    const html =
      '<article class="ticket' +
      (hot ? " hot" : "") +
      (rank === 3 ? " done" : "") +
      '"><header><small class="tagid">' +
      r.id +
      "</small>" +
      badge(status, rank === 3) +
      "<h3>" +
      esc(r.event) +
      "</h3><small>" +
      esc(r.club) +
      " · responsible: " +
      esc(r.owner) +
      " · return by " +
      esc(r.due) +
      "</small></header>" +
      (rank === 3
        ? ""
        : '<p class="reqnote">' + esc(r.note) + "</p>" + said.map(word).join("")) +
      "<ol>" +
      ls.map((x, i) => line(x, i, r)).join("") +
      "</ol>" +
      (todo
        ? '<form class="handout" id="hand-' +
          r.id +
          '" data-hand="' +
          r.id +
          '"><label><span>Collected by' +
          (collector ? " · as the club asked" : "") +
          '</span><select name="who" required><option value="">Select…</option>' +
          opts(
            people.map((p) => [p, p]),
            collector,
          ) +
          '</select></label><button class="primary">Hand out ' +
          todo +
          (todo > 1 ? " items" : " item") +
          "</button></form>"
        : "") +
      "</article>";
    return [rank, html];
  }
  function counter() {
    return (
      head(
        "Counter",
        "Open tickets are the handover · a ticket stays here until every unit is back",
      ) +
      '<div class="rail">' +
      requests
        .map(ticket)
        .sort((a, b) => a[0] - b[0])
        .map((t) => t[1])
        .join("") +
      "</div>"
    );
  }
  const screens = {
    Counter: counter,
    Requests: requestPage,
    Inventory: inventory,
    "Loan register": register,
    "Desk book": deskbook,
  };
  function paint() {
    const phase = shifts[s.phase];
    q("[data-clock]").textContent = phase.time;
    q("[data-shift-title]").textContent = phase.title;
    q("[data-shift]").textContent = phase.text;
    const advance = q('[data-action="advance"]');
    advance.hidden = !phase.next;
    advance.textContent = phase.next || "";
    q("[data-nav]").innerHTML = pages
      .map(
        ([n, icon]) =>
          '<button type="button" data-action="tab" data-val="' +
          n +
          '" aria-pressed="' +
          (s.tab === n) +
          '"><svg aria-hidden="true" class="store-icon"><use href="#icon-' +
          icon +
          '"></use></svg>' +
          n +
          "</button>",
      )
      .join("");
    q("[data-page]").innerHTML = screens[s.tab]();
    if (q("[data-filter]")) q("[data-filter]").value = s.filter;
    q("[data-status]").textContent = s.notice;
  }
  function commit(msg) {
    if (msg) s.notice = msg;
    paint();
    try {
      localStorage.setItem(storageKey, JSON.stringify(s));
    } catch {
      q("[data-status]").textContent +=
        " Browser storage is unavailable. Progress lasts for this visit.";
    }
  }
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-action]");
    if (!b) return;
    const v = b.dataset.val;
    switch (b.dataset.action) {
      case "restart":
        s = original();
        break;
      case "advance":
        if (s.phase < 2) s.phase++;
        s.notice = "Shift time updated.";
        break;
      case "tab":
        s.tab = v;
        s.editing = false;
        s.open = 0;
        break;
      case "open":
        s.open = Number(v);
        break;
      case "shut":
        s.open = 0;
        break;
      case "apply": {
        const m = messages[Number(v)],
          l = m && target(m);
        if (!l) return;
        l.holder = m.hold.holder;
        l.due = m.hold.due;
        s.notice =
          "Slip L-" + l.num + ": " + l.asset + " is with " + l.holder + ", back by " + l.due + ".";
        break;
      }
      case "close":
        s.selected = "";
        break;
      case "request":
        s.selected = v;
        break;
      case "new":
        s.editing = true;
        break;
      case "cancel":
        s.editing = false;
        break;
      case "scope":
        s.onlyOpen = v === "0";
        break;
      case "return": {
        const l = s.loans.find((l) => l.num === Number(v));
        if (!l || l.back) return;
        l.back = true;
        l.backAt = shifts[s.phase].time;
        l.backBy = holder(l);
        s.notice = l.asset + " returned to stock. Slip L-" + l.num + " closed.";
        break;
      }
    }
    commit();
  });
  root.addEventListener("change", (e) => {
    if (e.target.matches("[data-filter]")) {
      s.filter = e.target.value;
      commit();
    }
  });
  root.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const form = new FormData(f);
    if (f.matches("[data-note]")) {
      const text = String(form.get("note")).trim();
      if (!text) return;
      s.notes.push({ phase: s.phase, text });
      commit("Handover note saved.");
      return;
    }
    if (f.matches("[data-hand]")) {
      const r = getReq(f.dataset.hand),
        who = form.get("who");
      if (!r || !people.includes(who)) return;
      const issued = [];
      lines(r).forEach(({ type, l }, i) => {
        const unit = getAsset(form.get("u" + i));
        if (l || !unit || unit.type !== type || unit.repair || out(unit.id)) return;
        const num = Math.max(...s.loans.map((l) => l.num)) + 1;
        s.loans.push({ num, req: r.id, asset: unit.id, who, due: r.due, back: false });
        issued.push(unit.id);
      });
      if (issued.length)
        commit("Handed out " + issued.join(", ") + " to " + who + ", due " + r.due + ".");
      return;
    }
    if (f.matches("[data-check]")) {
      const l = s.loans.find((l) => l.num === Number(f.dataset.check));
      if (!l || l.back) return;
      if (e.submitter?.value === "hold") {
        if (!people.includes(form.get("holder")) || !dueAt[form.get("due")]) return;
        l.holder = form.get("holder");
        l.due = form.get("due");
        s.open = 0;
        commit("Slip L-" + l.num + ": " + l.asset + " is with " + l.holder + ", back by " + l.due + ".");
        return;
      }
      l.back = true;
      l.backAt = shifts[s.phase].time;
      l.backBy = form.get("by");
      s.open = 0;
      commit(l.asset + " checked in from " + l.backBy + ". Slip L-" + l.num + " closed.");
      return;
    }
    if (!f.matches("[data-issue]")) return;
    const [req, who, due] = ["req", "who", "due"].map((k) => form.get(k));
    const units = form.getAll("asset").map(getAsset),
      r = getReq(req);
    if (!r || !units.length || !people.includes(who)) return;
    // Check every unit first, so a kit is issued whole or not at all.
    const types = units.map((u) => u.type);
    const bad = units.find(
      (u, i) =>
        !u ||
        u.repair ||
        out(u.id) ||
        !r.items.includes(u.type) ||
        types.indexOf(u.type) !== i ||
        s.loans.some((l) => l.req === req && !l.back && getAsset(l.asset).type === u.type),
    );
    if (bad) {
      q("[data-status]").textContent = !r.items.includes(bad.type)
        ? bad.id + " is outside the approved request. Choose approved units."
        : "The approved quantity of " + bad.type + " is already on loan or picked twice.";
      return;
    }
    const nums = units.map((u) => {
      const num = Math.max(...s.loans.map((l) => l.num)) + 1;
      s.loans.push({ num, req, asset: u.id, who, due, back: false });
      return "L-" + num;
    });
    s.editing = false;
    commit(
      "Issued " + units.map((u) => u.id).join(", ") + " to " + who + " on slips " + nums.join(", ") + ".",
    );
  });
  function restore(d) {
    if (
      !d ||
      d.version !== 2 ||
      !Object.hasOwn(screens, d.tab) ||
      !shifts[d.phase] ||
      (d.selected && !getReq(d.selected)) ||
      !Array.isArray(d.notes) ||
      !d.notes.every(
        (n) => n && shifts[n.phase] && typeof n.text === "string",
      ) ||
      !Array.isArray(d.loans) ||
      !d.loans.length ||
      !d.loans.every(
        (l) =>
          l && getReq(l.req) && getAsset(l.asset) && Number.isInteger(l.num),
      )
    )
      return;
    s = {
      ...original(),
      ...d,
      loans: d.loans.map((l) => ({ ...l })),
      notes: d.notes.map((n) => ({ ...n })),
    };
    paint();
  }
  paint();
  try {
    restore(JSON.parse(localStorage.getItem(storageKey)));
  } catch {
    // Keep the fresh shift when storage is unavailable or the saved data is invalid.
  }
})();
