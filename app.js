/* Recura — interactive concept pitch
   No dependencies. Every module guards its own DOM so one missing node can't take the page down. */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var usd = function (n) { return "$" + Math.round(n).toLocaleString("en-US"); };
  var $ = function (id) { return document.getElementById(id); };

  /* ------------------------------------------------------------------ nav */
  var sections = Array.prototype.slice.call(document.querySelectorAll("section.slot"));
  var navList = $("nav");
  if (navList) {
    navList.innerHTML = sections.map(function (s) {
      return '<li data-for="' + s.id + '"><button type="button">' + s.getAttribute("data-nav") + "</button></li>";
    }).join("");
    Array.prototype.forEach.call(navList.children, function (li) {
      li.querySelector("button").addEventListener("click", function () {
        var el = $(li.getAttribute("data-for"));
        if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      });
    });
    if ("IntersectionObserver" in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          Array.prototype.forEach.call(navList.children, function (li) {
            li.classList.toggle("on", li.getAttribute("data-for") === e.target.id);
          });
        });
      }, { rootMargin: "-20% 0px -70% 0px" });
      sections.forEach(function (s) { spy.observe(s); });
    }
  }

  var bar = $("bar");
  if (bar) {
    var onScroll = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* --------------------------------------------------------------- ticker */
  var tick = $("ticker");
  if (tick) {
    var RATE = 900000000 / 31536000; // ≈ $28.5 per second
    var t0 = Date.now();
    if (reduce) {
      tick.textContent = usd(RATE * 60) + " a minute";
    } else {
      setInterval(function () { tick.textContent = usd((Date.now() - t0) / 1000 * RATE); }, 80);
    }
  }

  /* ------------------------------------------------------- count-up stats */
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  var runCount = function (el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var dec = parseInt(el.getAttribute("data-dec") || "0", 10);
    var pre = el.getAttribute("data-prefix") || "";
    var suf = el.getAttribute("data-suffix") || "";
    var fmt = function (v) {
      return pre + v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
    };
    if (reduce) { el.textContent = fmt(target); return; }
    var start = performance.now(), dur = 1100;
    var frame = function (now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };
  if (counters.length) {
    if ("IntersectionObserver" in window) {
      var cObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          runCount(e.target);
          cObs.unobserve(e.target);
        });
      }, { threshold: 0.4 });
      counters.forEach(function (c) { cObs.observe(c); });
    } else {
      counters.forEach(runCount);
    }
  }

  /* ---------------------------------------------------------- flip cards */
  var COMPLAINTS = [
    { s: 2, q: "We are locked in for years", d: "Multi-year terms that renew automatically, with a long written notice period before you can leave.",
      h: "Month to month, from day one", a: "No minimum term and no auto-renewal. Cancel in the app, keep your data, take the export with you." },
    { s: 1, q: "Cancelling took months", d: "Billing continued long after written notice, and requests to stop went unanswered.",
      h: "Self-serve exit, confirmed in writing", a: "One control in the account, effective at the end of the cycle, with an emailed confirmation and a final invoice that matches it." },
    { s: 2, q: "The growth never showed up", d: "Lift promised at onboarding, with no way to tell what the platform added versus what would have happened anyway.",
      h: "A holdout group from day one", a: "8–10% of the patient list receives nothing from Recura. The dashboard reports the difference between the groups — incremental revenue, never total." },
    { s: 2, q: "It doesn’t talk to our records", d: "Memberships, credits and packages get re-keyed by hand at the front desk, so balances drift apart.",
      h: "Two-way sync, one source of truth", a: "The clinic’s existing record system stays the record system. Balances reconcile nightly; nobody types the same thing twice." },
    { s: 1, q: "Support vanished after go-live", d: "Set-up errors, inexperienced reps, and slow replies once the contract was signed.",
      h: "A named launch team for 90 days", a: "Offers, creative, staff scripts and patient migration are done with the clinic, not handed over. Response times are written into the agreement." },
    { s: 2, q: "It only works on patients we already had", d: "No new patients, and no line between what was spent on ads and what was treated in the room.",
      h: "One attributed loop", a: "Ad click to booked chair to repeat visit, measured end to end — so marketing spend and treatment revenue finally sit in one report." }
  ];
  var flips = $("flips");
  if (flips) {
    flips.innerHTML = COMPLAINTS.map(function (c) {
      var stars = "";
      for (var i = 0; i < 5; i++) stars += i < c.s ? "★" : "☆";
      return '<button class="flip" type="button" aria-pressed="false">' +
        '<span class="inner">' +
          '<span class="face front">' +
            '<span class="stars" aria-label="' + c.s + ' out of 5">' + stars + "</span>" +
            "<h3>“" + c.q + "”</h3><p>" + c.d + "</p>" +
            '<span class="turn">Flip →</span>' +
          "</span>" +
          '<span class="face back"><h3>' + c.h + "</h3><p>" + c.a + "</p>" +
            '<span class="turn">← Back</span></span>' +
        "</span></button>";
    }).join("");
    Array.prototype.forEach.call(flips.children, function (b) {
      b.addEventListener("click", function () {
        b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true");
      });
    });
  }

  /* -------------------------------------------------------- expectations */
  var EXPECTS = [
    ["Sell while we sleep.", "A patient should be able to buy a package at 11pm without anyone on staff being awake."],
    ["Stop making my front desk re-type things.", "If it is in the app it is in our records, and the balance matches."],
    ["Tell me what I owe in treatments.", "Pre-paid credit is a real liability — show me what is paid for and not yet delivered."],
    ["Take selling off my nurses.", "The offer should arrive on the patient’s phone, not out of a clinician’s mouth."],
    ["Prove it worked.", "Show me the revenue that would not have happened without you, and charge me on that."]
  ];
  var expects = $("expects");
  if (expects) {
    expects.innerHTML = EXPECTS.map(function (e) {
      return "<li><span><b>" + e[0] + "</b> " + e[1] + "</span></li>";
    }).join("");
  }

  /* ------------------------------------------------------------ the loop */
  var STEPS = [
    { state: "Gap detected", cash: 0,
      cap: "Tuesday 14:00 comes free. On its own that is a $420 hole in the week nobody notices until Friday.",
      rows: [["Tue 14:00 — open", "—", true], ["Tue 15:00 — Dermaplane", "booked", false], ["Tue 16:00 — Consult", "booked", false]],
      phone: "idle" },
    { state: "Matching the clock", cash: 0,
      cap: "Recura looks for a patient whose treatment window is due — not for anyone with a phone. Priya’s last toxin was 15 weeks ago, two weeks past her own cadence.",
      rows: [["Tue 14:00 — matching…", "Priya R.", true], ["Last toxin", "15 weeks ago", false], ["Her cadence", "12–14 weeks", false]],
      phone: "idle" },
    { state: "Offer sent", cash: 0,
      cap: "One message, sized to the gap and to her history. No discount blast to the whole list, and the holdout group is deliberately skipped.",
      rows: [["Offer sent — 14:02", "1 patient", true], ["Channel", "Push + SMS", false], ["Holdout group", "receives nothing", false]],
      phone: "push" },
    { state: "Paid in app", cash: 420,
      cap: "She pays at 21:40 from her sofa, with the clinic closed and no staff involved. The money is in before the treatment is delivered.",
      rows: [["Tue 14:00 — Priya R.", "$420", true], ["Paid", "21:40, in app", false], ["Wallet credit", "applied in full", false]],
      phone: "pay" },
    { state: "Written back", cash: 420,
      cap: "The booking, the payment and the attribution land in the clinic’s CRM as native records — before she walks in, and without anyone typing it.",
      rows: [["Chair filled", "Tue 14:00", true], ["CRM record", "updated", false], ["Attributed to", "lapsed recovery", false]],
      phone: "done" }
  ];
  var PHONES = {
    idle: '<div class="push"><div class="app">Recura · The Skin Room</div><div class="msg">Hi Priya — nothing due right now. We’ll let you know.</div></div>' +
          '<div class="pts"><span class="pt">240 points</span><span class="pt">Member since 2024</span></div>',
    push: '<div class="push"><div class="app">Recura · The Skin Room</div><div class="msg">You’re due, Priya. We held tomorrow 2pm for you — $420, and your 240 points cover the aftercare kit.</div></div>' +
          '<div class="pts"><span class="pt">Tap to book</span><span class="pt">Expires in 24h</span></div>',
    pay:  '<div class="wallet"><div class="lab">Paying now · Tue 2:00pm</div><div class="amt">$420.00</div><div class="lab">Toxin — upper face</div></div>' +
          '<div class="pts"><span class="pt">Apple Pay</span><span class="pt">or 4 × $105</span></div>',
    done: '<div class="wallet"><div class="lab">Booked · Tuesday 2:00pm</div><div class="amt">Paid</div><div class="lab">See you Tuesday, Priya</div></div>' +
          '<div class="pts"><span class="pt">+42 points earned</span><span class="pt">Next due: 12 weeks</span></div>'
  };
  var step = 0, playTimer = null;
  function renderStep() {
    var s = STEPS[step];
    if ($("phone")) $("phone").innerHTML = PHONES[s.phone];
    if ($("rows")) {
      $("rows").innerHTML = s.rows.map(function (r) {
        return '<div class="row' + (r[2] ? " hot" : "") + '"><span>' + r[0] + '</span><span class="v">' + r[1] + "</span></div>";
      }).join("");
    }
    if ($("stepcap")) $("stepcap").textContent = s.cap;
    if ($("cash")) $("cash").textContent = usd(s.cash);
    if ($("conState")) $("conState").textContent = s.state;
    if ($("dots")) $("dots").innerHTML = STEPS.map(function (_, i) { return '<i class="' + (i <= step ? "on" : "") + '"></i>'; }).join("");
    if ($("prev")) $("prev").disabled = step === 0;
    if ($("next")) $("next").disabled = step === STEPS.length - 1;
  }
  function stopPlay() {
    if (playTimer) { clearInterval(playTimer); playTimer = null; }
    if ($("play")) $("play").textContent = "Play the loop";
  }
  if ($("next")) $("next").addEventListener("click", function () { stopPlay(); if (step < STEPS.length - 1) { step++; renderStep(); } });
  if ($("prev")) $("prev").addEventListener("click", function () { stopPlay(); if (step > 0) { step--; renderStep(); } });
  if ($("play")) {
    $("play").addEventListener("click", function () {
      if (playTimer) { stopPlay(); return; }
      step = 0; renderStep();
      $("play").textContent = "Pause";
      playTimer = setInterval(function () {
        if (step >= STEPS.length - 1) { stopPlay(); return; }
        step++; renderStep();
      }, reduce ? 400 : 2100);
    });
  }
  renderStep();

  /* ----------------------------------------------------------- calendar */
  var DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  var TIMES = ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00"];
  var BOOKED = ["Toxin", "Filler", "Laser", "Facial", "Consult", "Peel", "Toxin", "Body", "Filler"];
  var PLAN = [
    [1, 0, 1, 1, 0],
    [1, 1, 0, 1, 1],
    [0, 1, 1, 0, 1],
    [1, 0, 1, 1, 0],
    [1, 1, 0, 1, 1],
    [0, 1, 1, 0, 0]
  ];
  var FILLS = [
    { who: "Priya R.", amt: 420, why: "Toxin due at 15 weeks — 2 weeks past her cadence." },
    { who: "Dana M.", amt: 340, why: "Package with 2 sessions unused, expiring in 6 weeks." },
    { who: "Alex T.", amt: 560, why: "Lapsed 11 months. Opened the last two offers, booked neither." },
    { who: "Kim S.", amt: 380, why: "Membership renews Friday — credit unspent this cycle." },
    { who: "Noor A.", amt: 620, why: "Consult in March, never converted. Same treatment, better price." },
    { who: "Jess W.", amt: 450, why: "Filler at month 10 — inside her usual re-treat window." },
    { who: "Rita P.", amt: 390, why: "Bought skincare twice, no treatment in 7 months." },
    { who: "Lena K.", amt: 520, why: "Two no-shows, both Fridays. Offered a Tuesday instead." }
  ];
  var cal = $("cal"), openCells = [];
  if (cal) {
    var html = '<div class="h"></div>' + DAYS.map(function (d) { return '<div class="h">' + d + "</div>"; }).join("");
    var bi = 0;
    for (var r = 0; r < TIMES.length; r++) {
      html += '<div class="t">' + TIMES[r] + "</div>";
      for (var c = 0; c < DAYS.length; c++) {
        if (PLAN[r][c]) {
          html += '<div class="cell"><span class="who">' + BOOKED[bi % BOOKED.length] + "</span></div>";
          bi++;
        } else {
          html += '<div class="cell open" data-open="1"><span class="who">Open</span></div>';
        }
      }
    }
    cal.innerHTML = html;
    openCells = Array.prototype.slice.call(cal.querySelectorAll("[data-open]"));
  }
  var runBtn = $("runcal"), calout = $("calout");
  if (runBtn && calout) {
    runBtn.addEventListener("click", function () {
      openCells.forEach(function (cell) {
        cell.className = "cell open";
        cell.innerHTML = '<span class="who">Open</span>';
        cell.removeAttribute("data-why");
      });
      runBtn.disabled = true;
      runBtn.textContent = "Running…";
      var total = 0, i = 0;
      (function fill() {
        if (i >= FILLS.length) {
          runBtn.disabled = false;
          runBtn.textContent = "Run it again";
          calout.innerHTML = "8 of 11 slots filled · <b>" + usd(total) + "</b> recovered this week";
          return;
        }
        var cell = openCells[i], f = FILLS[i];
        if (cell) {
          cell.className = "cell filled";
          cell.setAttribute("data-why", f.why);
          cell.innerHTML = '<span class="who">' + f.who + '</span><span class="amt">' + usd(f.amt) + "</span>";
          total += f.amt;
          calout.innerHTML = (i + 1) + " filled · <b>" + usd(total) + "</b> recovered";
        }
        i++;
        setTimeout(fill, reduce ? 0 : 320);
      })();
    });
  }

  /* ---------------------------------------------------------- proof lab */
  var N = 120, HELD = 12, TICKET = 450, BASE_RATE = 0.22;
  var grid = $("dotgrid"), labRunning = false;
  var heldIdx = [];
  if (grid) {
    // spread the holdout evenly so it reads as a random slice, not a block
    for (var k = 0; k < HELD; k++) heldIdx.push(Math.floor(k * (N / HELD)) + 4);
    var cells = [];
    for (var i2 = 0; i2 < N; i2++) {
      cells.push('<i class="' + (heldIdx.indexOf(i2) > -1 ? "held" : "") + '"></i>');
    }
    grid.innerHTML = cells.join("");
  }
  function labNumbers(convT, convH) {
    var treatedN = N - HELD;
    var revTreated = convT * TICKET;
    var perTreated = treatedN ? revTreated / treatedN : 0;
    var perHeld = HELD ? (convH * TICKET) / HELD : 0;
    var incrementalPer = Math.max(perTreated - perHeld, 0);
    return { naive: revTreated, incremental: incrementalPer * N, fee: incrementalPer * N * 0.08 };
  }
  function runLab() {
    if (!grid || labRunning) return;
    labRunning = true;
    var lift = parseInt(($("s-lift") || { value: 18 }).value, 10) / 100;
    var dots = Array.prototype.slice.call(grid.children);
    dots.forEach(function (d) { d.classList.remove("conv"); });
    var order = dots.map(function (_, i) { return i; }).sort(function () { return Math.random() - 0.5; });
    var convT = 0, convH = 0, i = 0;
    var btn = $("runlab");
    if (btn) { btn.disabled = true; btn.textContent = "Running 90 days…"; }
    (function next() {
      if (i >= order.length) {
        var out = labNumbers(convT, convH);
        if ($("o-naive")) $("o-naive").textContent = usd(out.naive);
        if ($("o-incr")) $("o-incr").textContent = usd(out.incremental);
        if ($("o-labfee")) $("o-labfee").textContent = usd(out.fee);
        if (btn) { btn.disabled = false; btn.textContent = "Run it again"; }
        labRunning = false;
        return;
      }
      var idx = order[i], dot = dots[idx];
      var isHeld = dot.classList.contains("held");
      var p = isHeld ? BASE_RATE : BASE_RATE * (1 + lift);
      if (Math.random() < p) {
        dot.classList.add("conv");
        if (isHeld) convH++; else convT++;
      }
      i++;
      if (reduce) { next(); } else { setTimeout(next, 14); }
    })();
  }
  if ($("runlab")) $("runlab").addEventListener("click", runLab);
  if ($("s-lift")) {
    $("s-lift").addEventListener("input", function () {
      if ($("v-lift")) $("v-lift").textContent = this.value;
    });
  }
  // settle the lab into a real result on load, so the section is never empty
  (function seedLab() {
    var convT = Math.round((N - HELD) * BASE_RATE * 1.18), convH = Math.round(HELD * BASE_RATE);
    var out = labNumbers(convT, convH);
    if ($("o-naive")) $("o-naive").textContent = usd(out.naive);
    if ($("o-incr")) $("o-incr").textContent = usd(out.incremental);
    if ($("o-labfee")) $("o-labfee").textContent = usd(out.fee);
    if (grid) {
      var dots = Array.prototype.slice.call(grid.children);
      var picked = 0;
      dots.forEach(function (d) {
        if (picked < convT + convH && Math.random() < 0.3) { d.classList.add("conv"); picked++; }
      });
    }
  })();

  /* ---------------------------------------------------------- simulator */
  function sim() {
    var sPat = $("s-pat"), sTic = $("s-tic"), sLap = $("s-lap");
    if (!sPat || !sTic || !sLap) return;
    var pat = +sPat.value, tic = +sTic.value, lap = +sLap.value / 100;
    var recovered = pat * lap * 0.14 * tic;
    var membership = pat * 0.06 * 79 * 12;
    var product = pat * 0.18 * 180;
    var clinic = recovered + membership + product;

    var inApp = membership + product + recovered * 0.35;
    var base = 3588, take = inApp * 0.015;
    var raw = clinic * 0.08, cap = base * 2, fee = Math.min(raw, cap);

    $("v-pat").textContent = pat.toLocaleString("en-US");
    $("v-tic").textContent = tic.toLocaleString("en-US");
    $("v-lap").textContent = Math.round(lap * 100);
    $("o-clinic").textContent = usd(clinic);
    $("o-rec").textContent = usd(recovered);
    $("o-mem").textContent = usd(membership);
    $("o-prod").textContent = usd(product);
    $("o-us").textContent = usd(base + take + fee);
    $("o-take").textContent = usd(take);
    $("o-fee").textContent = usd(fee);
    if ($("capnote")) $("capnote").textContent = raw > cap ? "— capped" : "";
  }
  ["s-pat", "s-tic", "s-lap"].forEach(function (id) {
    var el = $(id);
    if (el) el.addEventListener("input", sim);
  });
  sim();

  /* ------------------------------------------------------------ revenue */
  var STREAMS = [
    { id: "sub", pct: 52, color: "var(--r2)", name: "Subscription",
      d: "$149 to $599 per location a month, published on the site rather than quoted in a demo. This is the base that makes the business predictable — and the part we deliberately keep small enough that a one-room clinic can say yes without a committee.",
      m: [["$149–$599", "per location, per month"], ["Month to month", "no minimum term"]] },
    { id: "take", pct: 28, color: "var(--r3)", name: "Transaction take rate",
      d: "1.5% of what patients spend inside the app — packages, memberships, gift cards, pre-paid credit. It grows when the clinic grows, with no new sale and no new seat. This is the line that turns a software vendor into a commerce network.",
      m: [["1.5%", "of in-app volume"], ["2–6%", "typical in this category today"]] },
    { id: "fee", pct: 14, color: "var(--r4)", name: "Success fee",
      d: "8% of the incremental revenue the holdout proves we created, capped at twice the subscription. When the holdout says we added nothing, this line is zero — which is the whole reason a sceptical owner signs at all.",
      m: [["8%", "of measured lift"], ["2× base", "hard cap on the invoice"]] },
    { id: "mkt", pct: 6, color: "var(--r1)", name: "Marketplace",
      d: "10% of drop-shipped skincare volume. The clinic earns product margin with no inventory, no shipping and no shelf space; we hold none of it either. Small line, near-zero cost to serve.",
      m: [["10%", "of drop-ship volume"], ["Zero", "inventory held"]] }
  ];
  var revbar = $("revbar"), revdetail = $("revdetail");
  function showStream(id) {
    var s = null;
    STREAMS.forEach(function (x) { if (x.id === id) s = x; });
    if (!s || !revdetail) return;
    Array.prototype.forEach.call(revbar.children, function (b) {
      b.setAttribute("aria-selected", b.getAttribute("data-id") === id ? "true" : "false");
    });
    revdetail.innerHTML = "<h3>" + s.name + " — " + s.pct + "% of revenue at scale</h3><p>" + s.d + "</p>" +
      '<div class="meta">' + s.m.map(function (m) { return "<div><b>" + m[0] + "</b>" + m[1] + "</div>"; }).join("") + "</div>";
  }
  if (revbar) {
    revbar.innerHTML = STREAMS.map(function (s) {
      return '<button type="button" role="tab" data-id="' + s.id + '" aria-selected="false" ' +
        'style="flex:' + s.pct + ';background:' + s.color + '">' + s.name + " · " + s.pct + "%</button>";
    }).join("");
    Array.prototype.forEach.call(revbar.children, function (b) {
      var go = function () { showStream(b.getAttribute("data-id")); };
      b.addEventListener("click", go);
      b.addEventListener("mouseenter", go);
    });
    showStream("sub");
  }

  /* ---------------------------------------------------------------- CRM */
  var CRMS = [
    { id: "sf", name: "Salesforce", type: "Enterprise", objects: "Contact · Opportunity",
      sync: "Contact and Opportunity stay native. Treatment cadence, wallet balance and membership state arrive as a managed custom object on the Contact.",
      where: "A Recura component on the Contact record: next treatment due, credit held, lifetime in-app spend. Revenue events post to the Opportunity timeline.",
      unlock: "Flow triggers on <code>Treatment_Due__c</code>, so automation a clinic already built can act on a clinical clock it could not previously see.",
      ship: "A managed package distributed on AppExchange." },
    { id: "hs", name: "HubSpot", type: "Mid-market", objects: "Contacts · Deals",
      sync: "Contacts and Deals both ways. Purchases, redemptions and lapses land as custom behavioural events rather than as notes nobody reads.",
      where: "A CRM card on the contact record showing the treatment clock and wallet balance, plus a Recura property group for segmentation.",
      unlock: "Workflow enrolment on <code>recura_treatment_due</code> and <code>recura_wallet_topup</code>, so marketing sequences fire off clinical timing.",
      ship: "A certified app in the HubSpot marketplace." },
    { id: "dy", name: "Dynamics 365", type: "Enterprise", objects: "Dataverse tables",
      sync: "Dataverse tables for cadence, wallet and attribution, written alongside the standard Contact and Account tables.",
      where: "An embedded canvas app inside the Sales or Customer Service hub, so the clinic works in one window.",
      unlock: "Power Automate flows on wallet and cadence events; Power BI reads the same tables for group-level reporting.",
      ship: "Published through AppSource." },
    { id: "zh", name: "Zoho CRM", type: "SMB", objects: "Custom modules",
      sync: "Custom modules for treatment plans and wallets, linked to the standard Contacts module.",
      where: "A related list and widget on the contact page, with balances visible to the front desk.",
      unlock: "Blueprint stages driven by treatment state, and Deluge functions for clinics that want their own rules.",
      ship: "Listed on Zoho Marketplace." },
    { id: "gh", name: "GoHighLevel", type: "Agency", objects: "Sub-account contacts",
      sync: "Contacts and opportunities per sub-account, so an agency running forty clinics keeps every one of them separate.",
      where: "A snapshot that installs the Recura pipeline, custom fields and campaigns into any sub-account in minutes.",
      unlock: "Inbound and outbound webhooks on every Recura event — which is how agencies already build here.",
      ship: "A snapshot plus a marketplace app." },
    { id: "kp", name: "Keap", type: "SMB", objects: "Contacts · Tags · Orders",
      sync: "Contacts, tags and orders. Wallet top-ups and package redemptions write back as order records.",
      where: "Tags that mirror treatment state, so campaigns the clinic already runs keep working untouched.",
      unlock: "Campaign Builder goals firing on cadence and wallet tags — no rebuild of what is already live.",
      ship: "A Keap Marketplace listing." },
    { id: "cu", name: "Anything else", type: "Custom", objects: "REST · webhooks",
      sync: "A REST API and signed webhooks over every object Recura holds: patients, cadence, wallet, memberships, attribution.",
      where: "Wherever the clinic already works. Field mapping is configured rather than coded for the common cases.",
      unlock: "A paid integration service for platforms with no public API or a bespoke schema — built, versioned and maintained by us, not left as a one-off script.",
      ship: "Scoped per platform, delivered as a maintained connector." }
  ];
  var hub = $("hub"), detail = $("crmdetail");
  function showCRM(id) {
    var c = null;
    CRMS.forEach(function (x) { if (x.id === id) c = x; });
    if (!c || !detail) return;
    Array.prototype.forEach.call(hub.children, function (b) {
      b.setAttribute("aria-selected", b.getAttribute("data-id") === id ? "true" : "false");
    });
    if ($("pipeTarget")) $("pipeTarget").textContent = c.name;
    if ($("pipeObjects")) $("pipeObjects").textContent = c.objects;
    detail.innerHTML = "<h3>" + c.name + "</h3><div class=\"dgrid\">" +
      '<div><div class="k">What syncs</div><div class="v">' + c.sync + "</div></div>" +
      '<div><div class="k">Where it shows up</div><div class="v">' + c.where + "</div></div>" +
      '<div><div class="k">What it unlocks</div><div class="v">' + c.unlock + "</div></div>" +
      '<div><div class="k">How it ships</div><div class="v">' + c.ship + "</div></div>" +
      "</div>";
  }
  if (hub) {
    hub.innerHTML = CRMS.map(function (c) {
      return '<button class="node" type="button" role="tab" data-id="' + c.id + '" aria-selected="false">' +
        '<span class="nm">' + c.name + '</span><span class="ty">' + c.type + "</span></button>";
    }).join("");
    Array.prototype.forEach.call(hub.children, function (b) {
      b.addEventListener("click", function () { showCRM(b.getAttribute("data-id")); });
    });
    showCRM("sf");
  }

  /* ----------------------------------------------------------------- Q&A */
  var QA = [
    ["Why would we partner rather than build this ourselves?",
     "The hard part is not the app. It is the clinical clock, the pre-paid credit ledger that has to reconcile against a point of sale nightly, and the holdout measurement that makes the claim defensible. That is vertical depth with regulatory weight attached — and it earns a platform a category it does not have to staff."],
    ["Who owns the customer relationship?",
     "The CRM does. Recura writes into it and never becomes the system of record. A clinic that leaves us keeps its contacts, its balances and its history where they already were."],
    ["What happens to patient data?",
     "PHI stays encrypted and inside a BAA from the first clinic onward, with SOC 2 Type 1 on the roadmap before any enterprise rollout. Marketing consent and clinical records are held separately, because they are governed separately."],
    ["Your lift numbers — where are they from?",
     "Category benchmarks and modelled assumptions, and they are labelled as such throughout this page. No clinic has run on Recura yet. The holdout exists precisely so the first real numbers are defensible rather than flattering."],
    ["Does this compete with partners already in our marketplace?",
     "Scheduling, EMR and practice-management vendors are integration targets, not rivals — Recura needs a calendar and a record to be useful at all. The overlap is with point loyalty apps, which sit outside the CRM and cannot prove causation."]
  ];
  var qa = $("qa");
  if (qa) {
    qa.innerHTML = QA.map(function (x, i) {
      return '<div class="qitem" id="q' + i + '"><button type="button" aria-expanded="false" aria-controls="qa' + i + '">' +
        x[0] + '</button><div class="a" id="qa' + i + '" hidden>' + x[1] + "</div></div>";
    }).join("");
    Array.prototype.forEach.call(qa.children, function (item) {
      var btn = item.querySelector("button"), ans = item.querySelector(".a");
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", open ? "false" : "true");
        ans.hidden = open;
        item.toggleAttribute("open", !open);
      });
    });
  }
})();
