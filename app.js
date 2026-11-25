const CATS = [
  "Rent",
  "Food",
  "Groceries",
  "Transport",
  "Utilities",
  "Education",
  "Healthcare",
  "Entertainment",
  "Other"
];

// Suggested budget percentages (20% left for savings)
const PCT = {
  Rent: 25,
  Food: 10,
  Groceries: 10,
  Transport: 8,
  Utilities: 7,
  Education: 5,
  Healthcare: 5,
  Entertainment: 5,
  Other: 5
};

const $ = id => document.getElementById(id);
const fmt = n => "₹" + Math.round(n).toLocaleString("en-IN");

let S = { inc: [], exp: [], goal: { name: "", amt: 0 } };
try {
  const r = localStorage.getItem("pfab");
  if (r) S = Object.assign(S, JSON.parse(r));
} catch (e) {}

const save = () => {
  try {
    localStorage.setItem("pfab", JSON.stringify(S));
  } catch (e) {}
};

const today = new Date().toISOString().slice(0, 10);
$("month").value = today.slice(0, 7);
$("eDay").value = today;
$("eCat").innerHTML = CATS.map(c => `<option>${c}</option>`).join("");
$("gName").value = S.goal.name || "";
$("gAmt").value = S.goal.amt || "";

const esc = s =>
  String(s).replace(/[&<>"]/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
  }[c]));

function data(m) {
  const inc = S.inc.filter(i => i.m === m);
  const exp = S.exp.filter(e => e.d.slice(0, 7) === m);
  const by = {};
  exp.forEach(e => (by[e.c] = (by[e.c] || 0) + e.a));
  const I = inc.reduce((s, i) => s + i.a, 0);
  const E = exp.reduce((s, e) => s + e.a, 0);
  return { inc, exp, by, I, E, sv: I - E };
}

function render() {
  const m = $("month").value;
  const d = data(m);

  $("sInc").textContent = fmt(d.I);
  $("sExp").textContent = fmt(d.E);
  $("sSav").textContent = fmt(d.sv);
  $("sSav").className = "stat " + (d.sv >= 0 ? "ok" : "bad");

  $("cats").innerHTML = Object.keys(d.by).length
    ? Object.entries(d.by)
        .sort((a, b) => b[1] - a[1])
        .map(
          ([c, a]) =>
            `<div>${esc(c)} — ${fmt(a)}</div><div class="bar"><div style="width:${
              d.E ? Math.round((a / d.E) * 100) : 0
            }%"></div></div>`
        )
        .join("")
    : '<div class="mut">No expenses yet.</div>';

  $("tbl").innerHTML =
    "<tr><th>Date</th><th>Category</th><th>Note</th><th>₹</th><th></th></tr>" +
    d.exp
      .sort((a, b) => b.d.localeCompare(a.d))
      .map(
        e =>
          `<tr><td>${e.d}</td><td>${esc(e.c)}</td><td>${esc(e.n)}</td><td>${Math.round(
            e.a
          )}</td><td><button class="x" data-id="${e.id}">✕</button></td></tr>`
      )
      .join("");
}

$("tbl").onclick = e => {
  const id = e.target.dataset && e.target.dataset.id;
  if (id) {
    S.exp = S.exp.filter(x => String(x.id) !== id);
    save();
    render();
  }
};

$("month").onchange = () => {
  $("report").innerHTML = "";
  render();
};

$("addInc").onclick = () => {
  const a = parseFloat($("iAmt").value);
  if (!(a > 0)) return;
  S.inc.push({
    id: Date.now(),
    s: $("iSrc").value || "Income",
    a,
    m: $("month").value
  });
  $("iAmt").value = "";
  $("iSrc").value = "";
  save();
  render();
};

$("addExp").onclick = () => {
  const a = parseFloat($("eAmt").value);
  if (!(a > 0) || !$("eDay").value) return;
  S.exp.push({
    id: Date.now(),
    c: $("eCat").value,
    n: $("eNote").value,
    a,
    d: $("eDay").value
  });
  $("eAmt").value = "";
  $("eNote").value = "";
  $("month").value = $("eDay").value.slice(0, 7);
  save();
  render();
};

$("saveGoal").onclick = () => {
  S.goal = {
    name: $("gName").value,
    amt: parseFloat($("gAmt").value) || 0
  };
  save();
  $("saveGoal").textContent = "Saved ✓";
  setTimeout(() => ($("saveGoal").textContent = "Save goal"), 1200);
};

$("gen").onclick = () => {
  const m = $("month").value;
  const d = data(m);
  const tips = [];

  if (!d.I) {
    $("report").innerHTML = '<p class="bad">Add your income for this month first.</p>';
    return;
  }

  const rows = CATS.map(c => {
    const lim = (d.I * PCT[c]) / 100;
    const sp = d.by[c] || 0;
    return { c, lim, sp, over: sp > lim };
  });

  rows
    .filter(r => r.over)
    .sort((a, b) => b.sp - b.lim - (a.sp - a.lim))
    .slice(0, 3)
    .forEach(r =>
      tips.push(
        `${r.c} is ${fmt(r.sp - r.lim)} over its suggested limit of ${fmt(
          r.lim
        )}. Cutting it back would lift your savings by the same amount.`
      )
    );

  const rate = (d.sv / d.I) * 100;
  tips.push(
    rate >= 20
      ? `Great — you saved ${rate.toFixed(
          0
        )}% of income. Consider moving the surplus into an emergency fund or investments.`
      : `You saved ${rate.toFixed(0)}% of income; aim for 20% (${fmt(
          d.I * 0.2
        )}). Set an automatic transfer on payday.`
  );

  const prev = [...new Set(S.inc.map(i => i.m))].filter(x => x !== m);
  if (prev.length) {
    const avg = prev.reduce((s, x) => s + data(x).I, 0) / prev.length;
    if (d.I < avg * 0.8) {
      tips.push(
        `Income is below your usual ${fmt(
          avg
        )}. Trim discretionary spending and protect your emergency fund this month.`
      );
    }
  }

  if (!Object.keys(d.by).length) {
    tips.push("Log your daily expenses to get category-specific advice.");
  }

  const wants = (d.by.Entertainment || 0) + (d.by.Other || 0);
  if (wants > d.I * 0.3) {
    tips.push(
      "Discretionary spending (entertainment + other) is over 30% of income — the easiest place to cut."
    );
  }

  const g = S.goal;
  if (g.amt > 0) {
    if (d.sv > 0) {
      tips.push(
        `Goal “${esc(g.name || "Savings")}”: at ${fmt(
          d.sv
        )}/month you would reach ${fmt(g.amt)} in about ${Math.ceil(
          g.amt / d.sv
        )} month(s).`
      );
    } else {
      tips.push(
        `Goal “${esc(g.name || "Savings")}” needs ${fmt(
          g.amt
        )}, but this month had no surplus — start by fixing the over-limit categories.`
      );
    }
  }

  const cushion = d.E * 3;
  $("report").innerHTML = `<h4>Monthly summary — ${m}</h4>
  <p>Income ${fmt(d.I)}, spent ${fmt(d.E)}, saved <b class="${
    d.sv >= 0 ? "ok" : "bad"
  }">${fmt(d.sv)}</b> (${rate.toFixed(0)}%). ${
    d.sv < 0 ? "You overspent this month." : "You stayed within income."
  } A 3-month emergency fund for your spending level is about ${fmt(cushion)}.</p>
  <h4>Budget plan (50/30/20 style)</h4><div class="scroll"><table><tr><th>Category</th><th>Limit</th><th>Spent</th><th>Status</th></tr>
  ${rows
    .map(
      r =>
        `<tr><td>${r.c}</td><td>${fmt(r.lim)}</td><td>${fmt(r.sp)}</td><td class="${
          r.over ? "bad" : "ok"
        }">${r.over ? "Over" : "OK"}</td></tr>`
    )
    .join("")}
  <tr><td><b>Savings</b></td><td><b>${fmt(d.I * 0.2)}</b></td><td>${fmt(
    Math.max(d.sv, 0)
  )}</td><td class="${d.sv >= d.I * 0.2 ? "ok" : "bad"}">${
    d.sv >= d.I * 0.2 ? "On track" : "Below"
  }</td></tr></table></div>
  <h4>Saving suggestions</h4><ul>${tips.map(t => `<li>${t}</li>`).join("")}</ul>`;
};

render();
