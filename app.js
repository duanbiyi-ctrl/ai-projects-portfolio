import { projects } from "./data/projects.js";

const grid = document.querySelector("#project-grid");
const search = document.querySelector("#project-search");
const dialog = document.querySelector("#project-dialog");
const content = document.querySelector("#dialog-content");
let activeFilter = "all";
let returnFocus = null;
const homeTitle = document.title;

const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[character]);

function artwork(project) {
  if (project.visual === "aicv") {
    return `<div class="cv-sheet cv-sheet-back"></div><div class="cv-sheet"><div class="cv-sheet-heading"><span class="cv-avatar"></span><div><b></b><i></i></div><span class="cv-mini-mark">↗</span></div><div class="cv-rule"></div><div class="cv-lines"><i></i><i></i><i></i></div><div class="cv-highlight"><span>✓</span> 每一处优化，都有依据</div><div class="cv-lines short"><i></i><i></i></div></div><span class="visual-label label-top">CONTEXT → EVIDENCE</span><span class="visual-label label-bottom">AICV / WORK IN PROGRESS</span><div class="cv-floating">✳ <span>事实优先</span></div>`;
  }
  if (project.visual === "orbit") {
    return `<div class="mini-orbit orbit-a"></div><div class="mini-orbit orbit-b"></div><div class="mini-orbit orbit-c"></div><span class="placeholder-core">+</span><span class="visual-label label-top">OPEN QUESTIONS / NEW POSSIBILITIES</span><span class="visual-label label-bottom">EXPLORATION 002</span>`;
  }
  return `<div class="block-stack"><i></i><i></i><i></i><i></i></div><span class="visual-label label-top">A SPACE FOR WHAT'S NEXT</span><span class="visual-label label-bottom">EXPERIMENT 003</span><span class="grid-cross">+</span>`;
}

function renderProjects() {
  const query = search.value.trim().toLocaleLowerCase();
  const visible = projects.filter((project) =>
    (activeFilter === "all" || project.category === activeFilter) &&
    [project.name, project.subtitle, project.description, ...project.tags].join(" ").toLocaleLowerCase().includes(query)
  );
  grid.innerHTML = visible.map((project) => `
    <article class="project-card">
      <a class="project-visual visual-${project.visual}" href="#project/${project.id}" aria-label="查看 ${escapeHTML(project.name)} 项目详情">
        ${artwork(project)}
        <span class="visual-open" aria-hidden="true">↗</span>
      </a>
      <div class="project-card-body">
        <div class="card-meta"><span class="mono">PROJECT / ${project.number}</span><span class="project-status status-${project.statusType}"><i></i>${project.status}</span></div>
        <h3><a href="#project/${project.id}">${escapeHTML(project.name)}</a></h3>
        <p class="card-subtitle">${escapeHTML(project.subtitle)}</p>
        <p class="card-description">${escapeHTML(project.description)}</p>
        <div class="tags">${project.tags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join("")}</div>
        <a class="card-link" href="#project/${project.id}">${project.demo ? "查看项目与交互示例" : "查看项目占位说明"}<span aria-hidden="true">↗</span></a>
      </div>
    </article>`).join("");
  document.querySelector("#empty-state").hidden = visible.length > 0;
  document.querySelector("#project-count").textContent = String(visible.length).padStart(2, "0");
  document.querySelector("#all-count").textContent = projects.length;
  document.querySelector("#results-announcement").textContent = `显示 ${visible.length} 个项目`;
}

function demoMarkup() {
  return `<section class="demo-section" aria-labelledby="demo-title">
    <div class="detail-section-heading"><h3 id="demo-title">体验一次「有依据的修改」</h3><span class="demo-label">静态交互示例 · 非 AI 实时生成</span></div>
    <p>以下内容均为虚构示例，用于解释产品交互，不代表作者经历或项目效果。无需提交个人信息。</p>
    <div class="demo-context"><span class="mono">示例 JD 要求</span><p>能将用户需求转化为产品流程，并参与功能验证。</p></div>
    <div class="demo-tabs" role="tablist" aria-label="简历优化示例">
      <button type="button" id="tab-original" role="tab" aria-selected="true" aria-controls="panel-original" tabindex="0">01 原始经历</button>
      <button type="button" id="tab-suggestion" role="tab" aria-selected="false" aria-controls="panel-suggestion" tabindex="-1">02 修改建议</button>
      <button type="button" id="tab-evidence" role="tab" aria-selected="false" aria-controls="panel-evidence" tabindex="-1">03 查看依据</button>
    </div>
    <div class="demo-panel" id="panel-original" role="tabpanel" aria-labelledby="tab-original" tabindex="0"><span class="panel-label">用户提供的信息</span><p>参与了一个简历工具项目，整理需求，画了流程图，也参与了功能测试。</p><div class="demo-note">缺少的信息：目标用户、测试范围、实际结果，以及个人职责边界。</div></div>
    <div class="demo-panel" id="panel-suggestion" role="tabpanel" aria-labelledby="tab-suggestion" tabindex="0" hidden><span class="panel-label">保守改写 · 需要用户确认</span><p>参与简历工具项目的需求整理与流程设计，输出流程图，并参与功能测试。</p><div class="demo-note">没有将“参与”升级为“主导”，也没有添加未经提供的用户规模或效果数据。</div></div>
    <div class="demo-panel" id="panel-evidence" role="tabpanel" aria-labelledby="tab-evidence" tabindex="0" hidden><span class="panel-label">原始信息 → 修改依据</span><ul class="evidence-list"><li><span>需求整理与流程设计</span><span>← 整理需求、画流程图</span></li><li><span>参与功能测试</span><span>← 参与了功能测试</span></li><li><span>量化成果</span><span class="pending-text">无证据 · 待补充</span></li></ul><div class="demo-note">下一步追问：你负责哪些测试场景？发现了什么问题？是否有可以核实的结果？</div></div>
  </section>`;
}

function openProject(project) {
  if (!dialog.open) returnFocus = document.activeElement;
  document.querySelector("#dialog-index").textContent = project.number;
  content.innerHTML = `
    <div class="detail-header"><span class="project-status status-${project.statusType}"><i></i>${project.status}</span><h2 id="dialog-title">${escapeHTML(project.name)}</h2><p class="detail-subtitle">${escapeHTML(project.subtitle)}</p><p>${escapeHTML(project.description)}</p><div class="tags">${project.tags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join("")}</div></div>
    <div class="stage-notice"><span aria-hidden="true">◉</span><div><strong>当前阶段</strong><p>${escapeHTML(project.stage)}</p></div></div>
    <div class="detail-facts"><section><h3><span>01</span> 问题与目标</h3><p>${escapeHTML(project.problem)}</p></section><section><h3><span>02</span> 当前产出与贡献</h3><p>${escapeHTML(project.contribution)}</p></section></div>
    ${project.demo ? demoMarkup() : ""}
    ${project.decisions.length ? `<section class="decisions"><h3>关键设计取舍</h3>${project.decisions.map(([title, description], index) => `<article><span class="mono">0${index + 1}</span><div><h4>${escapeHTML(title)}</h4><p>${escapeHTML(description)}</p></div></article>`).join("")}</section>` : ""}
    <section class="detail-validation"><h3>验证计划与证据</h3><p>${escapeHTML(project.validation)}</p>${project.source ? `<a class="button button-outline" href="${project.source}" target="_blank" rel="noopener noreferrer">${project.sourceLabel} ↗</a>` : `<span class="pending-pill">${escapeHTML(project.evidenceStatus ?? "证据材料待补充")}</span>`}</section>
    <section class="limitations"><h3>已知边界</h3><p>${escapeHTML(project.limitations)}</p></section>
    <div class="detail-bottom"><button type="button" class="text-link" id="copy-project-link">复制项目链接 ↗</button><span id="copy-feedback" role="status"></span></div>`;
  if (!dialog.open) dialog.showModal();
  document.body.classList.add("dialog-open");
  dialog.scrollTop = 0;
  document.title = `${project.name} — 段必义 · AI Projects`;
  document.querySelector("#close-dialog").focus();
  document.querySelector("#copy-project-link").addEventListener("click", async () => {
    const feedback = document.querySelector("#copy-feedback");
    try {
      await navigator.clipboard.writeText(location.href);
      feedback.textContent = "链接已复制";
    } catch {
      feedback.textContent = "无法自动复制，请复制浏览器地址栏中的链接。";
    }
  });
  const tabs = [...content.querySelectorAll('[role="tab"]')];
  function activateTab(tab) {
    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute("aria-controls")).hidden = !selected;
    });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (event) => {
      let next;
      if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
      if (event.key === "ArrowLeft") next = tabs[(index + tabs.length - 1) % tabs.length];
      if (event.key === "Home") next = tabs[0];
      if (event.key === "End") next = tabs.at(-1);
      if (!next) return;
      event.preventDefault();
      activateTab(next);
      next.focus();
    });
  });
}

function closeProject() {
  if (dialog.open) dialog.close();
  document.body.classList.remove("dialog-open");
  document.title = homeTitle;
  if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  returnFocus = null;
}

function route() {
  const projectId = location.hash.startsWith("#project/") ? location.hash.slice(9) : null;
  const project = projects.find((item) => item.id === projectId);
  if (project) {
    openProject(project);
  } else {
    closeProject();
    if (projectId !== null) {
      history.replaceState(null, "", "#projects");
      document.querySelector("#results-announcement").textContent = "该项目不存在，请从项目列表选择。";
    }
  }
}

function dismissProject() {
  history.replaceState(null, "", "#projects");
  closeProject();
}

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((item) => {
      item.classList.toggle("active", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });
    renderProjects();
  });
});
search.addEventListener("input", renderProjects);
document.querySelector("#reset-filters").addEventListener("click", () => {
  search.value = "";
  document.querySelector('[data-filter="all"]').click();
});
document.querySelector("#close-dialog").addEventListener("click", dismissProject);
dialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  dismissProject();
});
dialog.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    dismissProject();
  }
});
dialog.addEventListener("click", (event) => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dismissProject();
});
document.querySelector("#back-to-top").addEventListener("click", (event) => {
  event.preventDefault();
  history.replaceState(null, "", location.pathname + location.search);
  window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
});
document.addEventListener("keydown", (event) => {
  const editing = event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable]");
  if (event.key === "/" && !editing && !dialog.open && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault();
    search.focus();
  }
});
window.addEventListener("hashchange", route);
renderProjects();
route();
