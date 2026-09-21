/* Recura - interactive concept pitch
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
    var RATE = 900000000 / 31536000; // about $28.5 a second
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
      el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
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
    { s: 2, q: "We are stuck for years",
      d: "Contracts run up to four years. They renew on their own. You have to give months of notice to get out.",
      h: "Month to month", a: "No lock-in and no auto-renewal. Cancel in the app and take your data with you." },
    { s: 1, q: "Cancelling took months",
      d: "They kept charging after we asked to stop. Emails went unanswered for the better part of a year.",
      h: "Cancel it yourself", a: "One button in the account. It ends with the billing cycle. You get an email and a final bill that matches." },
    { s: 2, q: "We never saw the growth",
      d: "They promised more revenue at the demo. Once we were live there was no way to check whether the software did anything.",
      h: "We hold back a test group", a: "10% of patients get nothing from us. We show you the gap between the two groups, and we only charge on that gap." },
    { s: 2, q: "It does not talk to our system",
      d: "Staff enter memberships and credits twice. The balances stop matching and the front desk stops trusting it.",
      h: "It syncs both ways", a: "Your current system stays in charge. Balances match every night. Nobody types the same thing twice." },
    { s: 1, q: "Support vanished after setup",
      d: "Setup mistakes, a new rep every time, and slow replies once the contract was signed.",
      h: "Same team for 90 days", a: "We build the offers, the messages and the staff training with you. Reply times are written into the contract." },
    { s: 2, q: "It only works on patients we already had",
      d: "It brings in nobody new, and we still cannot tell which ad brought which patient through the door.",
      h: "We follow the whole path", a: "Ad click to booked chair to next visit. Ad spend and treatment money finally sit in one report." },
    { s: 1, q: "Nobody downloaded the app",
      d: "We had to ask every patient to go to the App Store. Most never did, so the thing we pay for sits there unused.",
      h: "No download needed", a: "The first offer opens in a text message and pays on a web page. The app is for regulars who want it, not a wall in front of everyone else." },
    { s: 2, q: "It turned us into a discount shop",
      d: "The tool pushes flash sales. Now our patients wait for the next offer instead of booking at full price.",
      h: "We never cut the price", a: "We fill a slot by offering it to the one patient who is due, at full price. Timing does the work, not a discount." },
    { s: 1, q: "Our patients got sick of the texts",
      d: "Every promotion went to the whole list. People started unsubscribing, and some of them were good patients.",
      h: "A hard limit on messages", a: "Nobody hears from us more than twice a month. That is built in, not a setting someone forgets. We report unsubscribes as a cost." }
  ];
  var flips = $("flips");
  if (flips) {
    flips.innerHTML = COMPLAINTS.map(function (c) {
      var stars = "";
      for (var i = 0; i < 5; i++) stars += i < c.s ? "&#9733;" : "&#9734;";
      return '<button class="flip" type="button" aria-pressed="false"><span class="inner">' +
        '<span class="face front">' +
          '<span class="stars" aria-label="' + c.s + ' out of 5">' + stars + "</span>" +
          "<h3>&ldquo;" + c.q + "&rdquo;</h3><p>" + c.d + "</p>" +
          '<span class="turn">What we do &rarr;</span>' +
        "</span>" +
        '<span class="face back"><h3>' + c.h + "</h3><p>" + c.a + "</p>" +
          '<span class="turn">&larr; Back</span></span>' +
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
    ["Sell when we are closed.", "A patient should be able to buy at 11pm with nobody on staff awake."],
    ["Stop the double entry.", "If it is in the app, it should be in our system, with the same balance."],
    ["Tell me what I owe.", "Pre-paid treatments are money we still owe people. Show me how much is sitting there."],
    ["Keep selling away from my nurses.", "The offer should come from the phone, not from the person holding the needle."],
    ["Prove it worked.", "Show me the money I would not have made without you, and charge me on that."]
  ];
  var expects = $("expects");
  if (expects) {
    expects.innerHTML = EXPECTS.map(function (e) {
      return "<li><span><b>" + e[0] + "</b> " + e[1] + "</span></li>";
    }).join("");
  }

  /* ------------------------------------------------- what we do not do */
  var RULES = [
    ["We do not blast discounts to your whole list.",
     "A sale trains patients to wait for the next one, and the price never recovers. We offer the open slot to the one patient who is due, at full price."],
    ["We do not make patients download an app.",
     "The first offer arrives as a text and opens on a web page where she can pay. Regulars install the app later if they want it. The download is never the thing standing between you and a sale."],
    ["We do not message anyone more than twice a month.",
     "The cap is built into the product, not a setting someone turns off in a slow week. A burnt-out patient list cannot be bought back."],
    ["We do not hold your patients' money.",
     "Payments settle to the clinic. We are never the merchant of record, and pre-paid credit sits on your books, where it legally belongs."],
    ["We do not try to become your record system.",
     "Your CRM and your charting stay in charge. We write into them. A clinic that leaves us keeps its contacts, balances and history exactly where they already were."]
  ];
  var rulesList = $("rules-list");
  if (rulesList) {
    rulesList.innerHTML = RULES.map(function (r) {
      return '<div class="rule"><span class="x" aria-hidden="true">&times;</span>' +
        "<div><h3>" + r[0] + "</h3><p>" + r[1] + "</p></div></div>";
    }).join("");
  }

  /* ------------------------------------------------------ month two */
  var MONTH2 = [
    ["Staff quietly work around it",
     "Injectors earn commission on what they sell. If the app takes the sale and nobody gets the credit, staff start telling patients to book at the desk instead. The product dies without anyone complaining about it.",
     "Every app sale is credited to the provider who does the treatment."],
    ["The clinic is already stuck in a contract",
     "Most clinics worth having are halfway through a multi-year deal with someone else. Telling them to break it is not a plan.",
     "We run alongside the old tool until their renewal date and import their existing credits and memberships. At renewal the owner is comparing two numbers from their own patient list, not two demos."],
    ["Credit does not work at the other branch",
     "Chains of two to ten locations are normal now. Most tools work one location at a time, so a patient's credit is stuck at one address and the owner never sees a combined number.",
     "One wallet across every location, and one report for the group."],
    ["Nobody knows how much treatment is owed",
     "Pre-paid packages are money the clinic has already spent and treatment it still owes. Most owners have no idea how big that number is until someone walks in to redeem.",
     "We show the total, how old it is, and which patients are sitting on credit they have not used."]
  ];
  var m2 = $("month2-list");
  if (m2) {
    m2.innerHTML = MONTH2.map(function (x) {
      return '<div class="card"><h3>' + x[0] + "</h3><p>" + x[1] + "</p>" +
        '<p class="fix"><b>What we do.</b> ' + x[2] + "</p></div>";
    }).join("");
  }

  /* ------------------------------------------------------------ the loop */
  var STEPS = [
    { state: "Empty slot", cash: 0,
      cap: "Tuesday 2pm comes free. That is $420 the clinic will not make, and nobody notices until Friday.",
      rows: [["Tue 2:00pm, empty", "-", true], ["Tue 3:00pm, Dermaplane", "booked", false], ["Tue 4:00pm, Consult", "booked", false]],
      phone: "idle" },
    { state: "Finding a patient", cash: 0,
      cap: "Recura looks for a patient who is due, not just anyone with a phone. Priya had Botox 15 weeks ago. She is two weeks late.",
      rows: [["Tue 2:00pm, matching", "Priya R.", true], ["Last Botox", "15 weeks ago", false], ["Usually comes back at", "12 to 14 weeks", false]],
      phone: "idle" },
    { state: "Offer sent", cash: 0,
      cap: "One message to one patient, at the price that protects the clinic. No discount blast to the whole list. The test group gets nothing.",
      rows: [["Offer sent, 2:02pm", "1 patient", true], ["Sent by", "App and text", false], ["Test group", "gets nothing", false]],
      phone: "push" },
    { state: "Paid in the app", cash: 420,
      cap: "She pays at 9:40pm from her sofa. The clinic is shut and no staff are involved. The money is in before the treatment happens.",
      rows: [["Tue 2:00pm, Priya R.", "$420", true], ["Paid", "9:40pm, in app", false], ["Credit used", "all of it", false]],
      phone: "pay" },
    { state: "Sent to the CRM", cash: 420,
      cap: "The booking, the payment and the reason behind it go into the clinic's CRM on their own, before she walks in. Nobody types anything.",
      rows: [["Slot filled", "Tue 2:00pm", true], ["CRM record", "updated", false], ["Reason logged", "overdue patient", false]],
      phone: "done" }
  ];
  var PHONES = {
    idle: '<div class="push"><div class="app">Recura &middot; The Skin Room</div><div class="msg">Hi Priya, nothing is due right now. We will let you know.</div></div>' +
          '<div class="pts"><span class="pt">240 points</span><span class="pt">Member since 2024</span></div>',
    push: '<div class="push"><div class="app">Recura &middot; The Skin Room</div><div class="msg">You are due, Priya. We held tomorrow 2pm for you. $420, and your 240 points cover the aftercare kit.</div></div>' +
          '<div class="pts"><span class="pt">Tap to book</span><span class="pt">Ends in 24h</span></div>',
    pay:  '<div class="wallet"><div class="lab">Paying now &middot; Tue 2:00pm</div><div class="amt">$420.00</div><div class="lab">Botox, upper face</div></div>' +
          '<div class="pts"><span class="pt">Apple Pay</span><span class="pt">or 4 &times; $105</span></div>',
    done: '<div class="wallet"><div class="lab">Booked &middot; Tuesday 2:00pm</div><div class="amt">Paid</div><div class="lab">See you Tuesday, Priya</div></div>' +
          '<div class="pts"><span class="pt">+42 points</span><span class="pt">Next due in 12 weeks</span></div>'
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
    if ($("play")) $("play").textContent = "Play";
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
  var BOOKED = ["Botox", "Filler", "Laser", "Facial", "Consult", "Peel", "Botox", "Body", "Filler"];
  var PLAN = [
    [1, 0, 1, 1, 0],
    [1, 1, 0, 1, 1],
    [0, 1, 1, 0, 1],
    [1, 0, 1, 1, 0],
    [1, 1, 0, 1, 1],
    [0, 1, 1, 0, 0]
  ];
  var FILLS = [
    { who: "Priya R.", amt: 420, why: "Botox due at 15 weeks. She is 2 weeks late." },
    { who: "Dana M.", amt: 340, why: "Two sessions left on a package that expires in 6 weeks." },
    { who: "Alex T.", amt: 560, why: "Gone 11 months. Opened the last two offers, booked neither." },
    { who: "Kim S.", amt: 380, why: "Membership renews Friday with this month's credit unused." },
    { who: "Noor A.", amt: 620, why: "Came for a consult in March and never booked." },
    { who: "Jess W.", amt: 450, why: "Filler at month 10, right in her usual window." },
    { who: "Rita P.", amt: 390, why: "Bought skincare twice but no treatment in 7 months." },
    { who: "Lena K.", amt: 520, why: "Missed two Friday appointments. Offered a Tuesday instead." }
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
          html += '<div class="cell open" data-open="1"><span class="who">Empty</span></div>';
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
        cell.innerHTML = '<span class="who">Empty</span>';
        cell.removeAttribute("data-why");
      });
      runBtn.disabled = true;
      runBtn.textContent = "Running";
      var total = 0, i = 0;
      (function fill() {
        if (i >= FILLS.length) {
          runBtn.disabled = false;
          runBtn.textContent = "Run it again";
          calout.innerHTML = "8 of 11 slots filled &middot; <b>" + usd(total) + "</b> recovered this week";
          return;
        }
        var cell = openCells[i], f = FILLS[i];
        if (cell) {
          cell.className = "cell filled";
          cell.setAttribute("data-why", f.why);
          cell.innerHTML = '<span class="who">' + f.who + '</span><span class="amt">' + usd(f.amt) + "</span>";
          total += f.amt;
          calout.innerHTML = (i + 1) + " filled &middot; <b>" + usd(total) + "</b> recovered";
        }
        i++;
        setTimeout(fill, reduce ? 0 : 320);
      })();
    });
  }

  /* ---------------------------------------------------------- proof lab */
  var TREATED = 108, HELD = 12, TICKET = 450, BASE_RATE = 0.22;
  var gT = $("grid-treated"), gH = $("grid-held"), labRunning = false;
  function fillGrid(el, n) {
    if (!el) return;
    var s = "";
    for (var i = 0; i < n; i++) s += "<i></i>";
    el.innerHTML = s;
  }
  fillGrid(gT, TREATED);
  fillGrid(gH, HELD);

  function paintLab(convT, convH) {
    var rateT = convT / TREATED, rateH = convH / HELD;
    var gapPerPatient = Math.max(rateT - rateH, 0) * TICKET;
    if ($("res-treated")) $("res-treated").textContent = convT + " booked";
    if ($("res-held")) $("res-held").textContent = convH + " booked";
    if ($("pct-treated")) $("pct-treated").textContent = Math.round(rateT * 100) + "%";
    if ($("pct-held")) $("pct-held").textContent = Math.round(rateH * 100) + "%";
    if ($("o-naive")) $("o-naive").textContent = usd(convT * TICKET);
    if ($("o-incr")) $("o-incr").textContent = usd(gapPerPatient * (TREATED + HELD));
    if ($("o-labfee")) $("o-labfee").textContent = usd(gapPerPatient * (TREATED + HELD) * 0.08);
  }

  function runLab() {
    if (!gT || !gH || labRunning) return;
    labRunning = true;
    var lift = parseInt(($("s-lift") || { value: 18 }).value, 10) / 100;
    var dots = Array.prototype.slice.call(gT.children).map(function (d) { return { el: d, held: false }; })
      .concat(Array.prototype.slice.call(gH.children).map(function (d) { return { el: d, held: true }; }));
    dots.forEach(function (d) { d.el.classList.remove("conv"); });
    var order = dots.slice().sort(function () { return Math.random() - 0.5; });
    var convT = 0, convH = 0, i = 0, btn = $("runlab");
    if (btn) { btn.disabled = true; btn.textContent = "Running 90 days"; }
    (function next() {
      if (i >= order.length) {
        paintLab(convT, convH);
        if (btn) { btn.disabled = false; btn.textContent = "Run it again"; }
        labRunning = false;
        return;
      }
      var d = order[i];
      if (Math.random() < (d.held ? BASE_RATE : BASE_RATE * (1 + lift))) {
        d.el.classList.add("conv");
        if (d.held) convH++; else convT++;
      }
      i++;
      if (reduce) next(); else setTimeout(next, 14);
    })();
  }
  if ($("runlab")) $("runlab").addEventListener("click", runLab);
  if ($("s-lift")) {
    $("s-lift").addEventListener("input", function () {
      if ($("v-lift")) $("v-lift").textContent = this.value;
    });
  }
  // show a finished result on load, so the section is never blank
  (function seedLab() {
    // 12 patients round harshly: 2.64 expected bookings rounds up to 3, which reads as
    // no gap at all. Seed the floor and let Run 90 days show the real spread.
    var convT = Math.round(TREATED * BASE_RATE * 1.18), convH = Math.floor(HELD * BASE_RATE);
    var mark = function (el, n) {
      if (!el) return;
      var kids = Array.prototype.slice.call(el.children).sort(function () { return Math.random() - 0.5; });
      kids.slice(0, n).forEach(function (k) { k.classList.add("conv"); });
    };
    mark(gT, convT);
    mark(gH, convH);
    paintLab(convT, convH);
  })();

  /* ---------------------------------------------------------- simulator */
  var LAPSED_SHARE = 0.45; // share of the list past its due date, held fixed to keep the section simple
  function sim() {
    var sPat = $("s-pat"), sTic = $("s-tic");
    if (!sPat || !sTic) return;
    var pat = +sPat.value, tic = +sTic.value, lap = LAPSED_SHARE;
    var recovered = pat * lap * 0.14 * tic;
    var membership = pat * 0.06 * 79 * 12;
    var product = pat * 0.18 * 180;
    var clinic = recovered + membership + product;

    var inApp = membership + product + recovered * 0.35;
    var base = 3588, take = inApp * 0.015;
    var raw = clinic * 0.08, cap = base * 2, fee = Math.min(raw, cap);

    var us = base + take + fee;
    $("v-pat").textContent = pat.toLocaleString("en-US");
    $("v-tic").textContent = tic.toLocaleString("en-US");
    if ($("o-ratio")) $("o-ratio").textContent = "$" + Math.round(clinic / us);
    $("o-clinic").textContent = usd(clinic);
    $("o-rec").textContent = usd(recovered);
    $("o-mem").textContent = usd(membership);
    $("o-prod").textContent = usd(product);
    $("o-us").textContent = usd(us);
    $("o-take").textContent = usd(take);
    $("o-fee").textContent = usd(fee);
    if ($("capnote")) $("capnote").textContent = raw > cap ? "(at the cap)" : "";
  }
  ["s-pat", "s-tic"].forEach(function (id) {
    var el = $(id);
    if (el) el.addEventListener("input", sim);
  });
  sim();

  /* ------------------------------------------------------------ revenue */
  var STREAMS = [
    { id: "sub", pct: 52, color: "var(--r2)", name: "Monthly fee",
      d: "$149 to $599 per location a month, printed on the website instead of quoted in a demo. This is the steady part of the business. We keep it low enough that a one-room clinic can say yes without asking anyone.",
      m: [["$149 to $599", "per location, per month"], ["Month to month", "no lock-in"]] },
    { id: "take", pct: 28, color: "var(--r3)", name: "Cut of app sales",
      d: "1.5% of what patients spend inside the app: packages, memberships, gift cards, pre-paid credit. It grows when the clinic grows. No new sale, no new seat, no extra work from us.",
      m: [["1.5%", "of what patients spend"], ["2% to 6%", "what this market charges now"]] },
    { id: "fee", pct: 14, color: "var(--r4)", name: "Fee on proven growth",
      d: "8% of the extra revenue the test group proves we created, and never more than twice the monthly fee. If the test group says we added nothing, this is zero. That is the reason a burnt owner signs at all.",
      m: [["8%", "of the proven gap"], ["2&times; the monthly fee", "hard limit on the bill"]] },
    { id: "mkt", pct: 6, color: "var(--r1)", name: "Skincare sales",
      d: "10% of skincare shipped straight from the supplier. The clinic earns the margin without holding stock, and neither do we. Small line, almost no cost to run.",
      m: [["10%", "of product sales"], ["Zero", "stock held"]] }
  ];
  var revbar = $("revbar"), revdetail = $("revdetail");
  function showStream(id) {
    var s = null;
    STREAMS.forEach(function (x) { if (x.id === id) s = x; });
    if (!s || !revdetail) return;
    Array.prototype.forEach.call(revbar.children, function (b) {
      b.setAttribute("aria-selected", b.getAttribute("data-id") === id ? "true" : "false");
    });
    revdetail.innerHTML = "<h3>" + s.name + ", " + s.pct + "% of our revenue</h3><p>" + s.d + "</p>" +
      '<div class="meta">' + s.m.map(function (m) { return "<div><b>" + m[0] + "</b>" + m[1] + "</div>"; }).join("") + "</div>";
  }
  if (revbar) {
    revbar.innerHTML = STREAMS.map(function (s) {
      return '<button type="button" role="tab" data-id="' + s.id + '" aria-selected="false" ' +
        'style="flex:' + s.pct + ';background:' + s.color + '">' + s.name + " &middot; " + s.pct + "%</button>";
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
    { id: "sf", name: "Salesforce", type: "Enterprise", objects: "Contact, Opportunity",
      sync: "Contact and Opportunity stay as they are. Due dates, wallet balance and membership status arrive as a custom object on the Contact.",
      where: "A Recura panel on the Contact record: when the patient is next due, what credit they hold, what they have spent in the app. Sales post to the Opportunity timeline.",
      unlock: "Flows can trigger on <code>Treatment_Due__c</code>, so automation the clinic already built can act on a date it could not see before.",
      ship: "A managed package on AppExchange." },
    { id: "hs", name: "HubSpot", type: "Mid-market", objects: "Contacts, Deals",
      sync: "Contacts and Deals both ways. Purchases, redemptions and missed dates arrive as custom events, not notes nobody reads.",
      where: "A card on the contact record with the due date and the wallet balance, plus a group of Recura properties to segment on.",
      unlock: "Workflows enrol on <code>recura_treatment_due</code> and <code>recura_wallet_topup</code>, so marketing can fire off a clinical date.",
      ship: "A certified app in the HubSpot marketplace." },
    { id: "dy", name: "Dynamics 365", type: "Enterprise", objects: "Dataverse tables",
      sync: "Dataverse tables for due dates, wallet and results, written next to the standard Contact and Account tables.",
      where: "A canvas app embedded in the Sales or Customer Service hub, so the clinic works in one window.",
      unlock: "Power Automate flows on wallet and due-date events. Power BI reads the same tables for group reporting.",
      ship: "Published on AppSource." },
    { id: "zh", name: "Zoho CRM", type: "SMB", objects: "Custom modules",
      sync: "Custom modules for treatment plans and wallets, linked to the standard Contacts module.",
      where: "A related list and a widget on the contact page, so the front desk can see balances.",
      unlock: "Blueprint stages that follow the treatment state, and Deluge functions for clinics that want their own rules.",
      ship: "Listed on Zoho Marketplace." },
    { id: "gh", name: "GoHighLevel", type: "Agency", objects: "Sub-account contacts",
      sync: "Contacts and opportunities per sub-account, so an agency running forty clinics keeps every one separate.",
      where: "A snapshot that drops the Recura pipeline, fields and campaigns into any sub-account in minutes.",
      unlock: "Webhooks in and out on every Recura event, which is how agencies already build here.",
      ship: "A snapshot plus a marketplace app." },
    { id: "kp", name: "Keap", type: "SMB", objects: "Contacts, Tags, Orders",
      sync: "Contacts, tags and orders. Wallet top-ups and package redemptions come back as order records.",
      where: "Tags that mirror the treatment state, so campaigns the clinic already runs keep working.",
      unlock: "Campaign Builder goals firing on those tags. Nothing already live has to be rebuilt.",
      ship: "A Keap Marketplace listing." },
    { id: "cu", name: "Anything else", type: "Custom", objects: "REST, webhooks",
      sync: "A REST API and signed webhooks for everything we hold: patients, due dates, wallet, memberships, results.",
      where: "Wherever the clinic already works. For common cases the field mapping is set up, not coded.",
      unlock: "A paid integration service for platforms with no public API or an odd schema. We build it, version it and keep it working.",
      ship: "Priced per platform, delivered as a connector we maintain." }
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
    detail.innerHTML = "<h3>" + c.name + '</h3><div class="dgrid">' +
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
    ["Why partner with you instead of building it?",
     "The app is the easy part. The hard parts are the treatment due dates, a pre-paid credit ledger that has to match the till every night, and the test group that makes the whole claim believable. That is a lot of clinical detail with money and health rules attached. Partnering gets you the category without staffing for it."],
    ["Who owns the customer?",
     "You do. Recura writes into your CRM and never becomes the main record. A clinic that leaves us keeps its contacts, balances and history exactly where they already were."],
    ["What happens to patient data?",
     "Health data stays encrypted and covered by a signed agreement from the first clinic onward, with SOC 2 before any large rollout. Marketing consent and clinical records are kept apart, because the rules treat them differently."],
    ["Where do your numbers come from?",
     "Market benchmarks and our own assumptions. Every number on this page is labelled that way. No clinic has run on Recura yet. The test group exists so the first real numbers are honest instead of flattering."],
    ["Does this compete with partners you already have?",
     "No. Booking, records and practice-management tools are things we plug into. Recura needs a calendar and a patient record to work at all. The overlap is with standalone loyalty apps, which sit outside the CRM and cannot prove they caused anything."]
  ];
  var qa = $("qa");
  if (qa) {
    qa.innerHTML = QA.map(function (x, i) {
      return '<div class="qitem"><button type="button" aria-expanded="false" aria-controls="qa' + i + '">' +
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
