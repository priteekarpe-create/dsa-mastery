/* ============================================================
   script.js – NeetCode 150 DSA Mastery
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. CATEGORY REGISTRY
     Each entry maps the data-file's window variable name to
     display metadata used throughout the UI.
  ---------------------------------------------------------- */
  const CATEGORIES = [
    { id: 'arrays-hashing',   label: 'Arrays & Hashing',          dataKey: 'ARRAYS_HASHING_DATA',    total: 9  },
    { id: 'two-pointers',     label: 'Two Pointers',               dataKey: 'TWO_POINTERS_DATA',      total: 5  },
    { id: 'sliding-window',   label: 'Sliding Window',             dataKey: 'SLIDING_WINDOW_DATA',    total: 6  },
    { id: 'stack',            label: 'Stack',                      dataKey: 'STACK_DATA',             total: 7  },
    { id: 'binary-search',    label: 'Binary Search',              dataKey: 'BINARY_SEARCH_DATA',     total: 7  },
    { id: 'linked-list',      label: 'Linked List',                dataKey: 'LINKED_LIST_DATA',       total: 11 },
    { id: 'trees',            label: 'Trees',                      dataKey: 'TREES_DATA',             total: 15 },
    { id: 'tries',            label: 'Tries',                      dataKey: 'TRIES_DATA',             total: 3  },
    { id: 'heap',             label: 'Heap / Priority Queue',      dataKey: 'HEAP_DATA',              total: 7  },
    { id: 'backtracking',     label: 'Backtracking',               dataKey: 'BACKTRACKING_DATA',      total: 9  },
    { id: 'graphs',           label: 'Graphs',                     dataKey: 'GRAPHS_DATA',            total: 13 },
    { id: 'advanced-graphs',  label: 'Advanced Graphs',            dataKey: 'ADVANCED_GRAPHS_DATA',   total: 6  },
    { id: 'dp-1d',            label: '1-D Dynamic Programming',    dataKey: 'DP_1D_DATA',             total: 12 },
    { id: 'dp-2d',            label: '2-D Dynamic Programming',    dataKey: 'DP_2D_DATA',             total: 11 },
    { id: 'greedy',           label: 'Greedy',                     dataKey: 'GREEDY_DATA',            total: 8  },
    { id: 'intervals',        label: 'Intervals',                  dataKey: 'INTERVALS_DATA',         total: 6  },
    { id: 'math-geometry',    label: 'Math & Geometry',            dataKey: 'MATH_GEOMETRY_DATA',     total: 8  },
    { id: 'bit-manipulation', label: 'Bit Manipulation',           dataKey: 'BIT_MANIPULATION_DATA',  total: 7  },
  ];

  /* ----------------------------------------------------------
     2. AGGREGATE ALL PROBLEM DATA
  ---------------------------------------------------------- */
  const PROBLEMS = [];

  CATEGORIES.forEach(function (cat) {
    const data = window[cat.dataKey];
    if (Array.isArray(data)) {
      data.forEach(function (p) {
        PROBLEMS.push(Object.assign({}, p, {
          categoryId: cat.id,
          category:   cat.label,
        }));
      });
    }
  });

  /* ----------------------------------------------------------
     3. STATE
  ---------------------------------------------------------- */
  const state = {
    search:     '',
    difficulty: 'all',
    pattern:    'all',
    completed:  loadCompleted(),
  };

  /* ----------------------------------------------------------
     4. PERSISTENCE
  ---------------------------------------------------------- */
  function loadCompleted() {
    try {
      return JSON.parse(localStorage.getItem('dsa_completed') || '{}');
    } catch (_) { return {}; }
  }

  function saveCompleted() {
    try {
      localStorage.setItem('dsa_completed', JSON.stringify(state.completed));
    } catch (_) {}
  }

  /* ----------------------------------------------------------
     5. RENDER
  ---------------------------------------------------------- */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Build one subsection block */
  function buildSubsection(title, contentHtml, isCode) {
    const inner = isCode
      ? '<pre><code class="language-java">' + escapeHtml(contentHtml) + '</code></pre>'
      : contentHtml;

    return (
      '<div class="subsection">' +
        '<div class="subsection-header">' +
          '<h3>' + title + '</h3>' +
          '<span class="toggle-icon">&#x25BC;</span>' +
        '</div>' +
        '<div class="subsection-content" style="display:none">' +
          inner +
        '</div>' +
      '</div>'
    );
  }

  /** Build one problem card */
  function buildProblemCard(problem) {
    const diffClass = (problem.difficulty || '').toLowerCase();
    const isCompleted = !!state.completed[problem.id];

    const subsections = [
      { title: 'Problem Explanation',         key: 'explanation',            isCode: false },
      { title: 'Brute Force',                 key: 'bruteForce',             isCode: false },
      { title: 'Brute Force Inefficiency',    key: 'bruteForceInefficiency', isCode: false },
      { title: 'Optimal Approach',            key: 'optimalApproach',        isCode: false },
      { title: 'Java Code',                   key: 'javaCode',               isCode: true  },
      { title: 'Dry Run / Trace',             key: 'dryRun',                 isCode: false },
      { title: 'Interview Tips',              key: 'interviewTips',          isCode: false },
      { title: 'Important Points',            key: 'importantPoints',        isCode: false },
    ];

    let subsectionHtml = '';
    subsections.forEach(function (s) {
      const content = problem[s.key];
      if (content) {
        subsectionHtml += buildSubsection(s.title, content, s.isCode);
      }
    });

    return (
      '<div class="problem-card' + (isCompleted ? ' completed' : '') + '" ' +
           'data-id="' + problem.id + '" ' +
           'data-difficulty="' + escapeHtml(problem.difficulty || '') + '" ' +
           'data-category="' + escapeHtml(problem.categoryId || '') + '">' +

        '<div class="problem-header">' +
          '<input type="checkbox" class="problem-checkbox" data-id="' + problem.id + '"' +
                 (isCompleted ? ' checked' : '') + ' />' +
          '<h2 class="problem-name">' + escapeHtml(problem.name || '') + '</h2>' +
          '<span class="difficulty-badge ' + diffClass + '">' + escapeHtml(problem.difficulty || '') + '</span>' +
          '<span class="toggle-icon">&#x25BC;</span>' +
        '</div>' +

        '<div class="problem-content" style="display:none">' +
          subsectionHtml +
        '</div>' +

      '</div>'
    );
  }

  /** Build one category section */
  function buildCategorySection(cat, problems) {
    const total     = cat.total;
    const completed = problems.filter(function (p) { return !!state.completed[p.id]; }).length;
    const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

    let cardsHtml = '';
    problems.forEach(function (p) { cardsHtml += buildProblemCard(p); });

    return (
      '<div class="category-section" id="category-' + cat.id + '">' +
        '<div class="category-header">' +
          '<h2 class="category-title">' + escapeHtml(cat.label) + '</h2>' +
          '<span class="category-progress-label" id="cat-label-' + cat.id + '">' +
            completed + ' / ' + total + ' completed' +
          '</span>' +
          '<div class="category-progress-bar-wrap">' +
            '<div class="category-progress-bar" id="cat-bar-' + cat.id + '" style="width:' + pct + '%"></div>' +
          '</div>' +
        '</div>' +
        '<div class="problems-list">' + cardsHtml + '</div>' +
      '</div>'
    );
  }

  /** Main render – apply all filters and inject HTML */
  function render() {
    const container = document.getElementById('problems-container');
    if (!container) return;

    const searchLc = state.search.trim().toLowerCase();
    let html = '';
    let totalVisible = 0;

    CATEGORIES.forEach(function (cat) {
      if (state.pattern !== 'all' && state.pattern !== cat.id) return;

      const problems = PROBLEMS.filter(function (p) {
        if (p.categoryId !== cat.id) return false;
        if (state.difficulty !== 'all' && p.difficulty !== state.difficulty) return false;
        if (searchLc && !(p.name || '').toLowerCase().includes(searchLc)) return false;
        return true;
      });

      if (problems.length === 0) return;

      totalVisible += problems.length;
      html += buildCategorySection(cat, problems);
    });

    container.innerHTML = html;

    const noResults = document.getElementById('no-results');
    if (totalVisible === 0) {
      noResults.classList.remove('hidden');
      container.classList.add('hidden');
    } else {
      noResults.classList.add('hidden');
      container.classList.remove('hidden');
    }

    attachCardListeners();

    // Re-run Prism on newly injected code blocks
    if (window.Prism) {
      Prism.highlightAllUnder(container);
    }

    updateProgress();
  }

  /* ----------------------------------------------------------
     6. PROGRESS COUNTERS
  ---------------------------------------------------------- */
  function updateProgress() {
    const totalAll = PROBLEMS.length;
    const doneAll  = PROBLEMS.filter(function (p) { return !!state.completed[p.id]; }).length;
    const pctAll   = totalAll > 0 ? Math.round((doneAll / totalAll) * 100) : 0;

    // Top banner
    const countEl   = document.getElementById('progress-count');
    const fillEl    = document.getElementById('progress-bar-fill');
    const percentEl = document.getElementById('progress-percent');
    if (countEl)   countEl.textContent   = doneAll + ' / ' + totalAll + ' completed';
    if (fillEl)    fillEl.style.width    = pctAll + '%';
    if (percentEl) percentEl.textContent = pctAll + '%';

    // Sidebar
    const sbCount = document.getElementById('sidebar-progress-count');
    const sbBar   = document.getElementById('sidebar-progress-bar');
    if (sbCount) sbCount.textContent = doneAll + ' / ' + totalAll;
    if (sbBar)   sbBar.style.width   = pctAll + '%';

    // Per-category
    CATEGORIES.forEach(function (cat) {
      const catProblems = PROBLEMS.filter(function (p) { return p.categoryId === cat.id; });
      const catDone     = catProblems.filter(function (p) { return !!state.completed[p.id]; }).length;
      const catTotal    = cat.total;
      const catPct      = catTotal > 0 ? Math.round((catDone / catTotal) * 100) : 0;

      const labelEl = document.getElementById('cat-label-' + cat.id);
      const barEl   = document.getElementById('cat-bar-'   + cat.id);
      if (labelEl) labelEl.textContent   = catDone + ' / ' + catTotal + ' completed';
      if (barEl)   barEl.style.width     = catPct + '%';
    });
  }

  /* ----------------------------------------------------------
     7. EVENT DELEGATION – CARD INTERACTIONS
  ---------------------------------------------------------- */
  function attachCardListeners() {
    const container = document.getElementById('problems-container');
    if (!container) return;

    // Problem header click → toggle problem-content
    container.querySelectorAll('.problem-header').forEach(function (header) {
      header.addEventListener('click', function (e) {
        // Don't toggle if clicking the checkbox itself
        if (e.target.classList.contains('problem-checkbox')) return;

        const content    = header.nextElementSibling;
        const toggleIcon = header.querySelector('.toggle-icon');
        if (!content) return;

        const isOpen = content.style.display !== 'none';
        content.style.display = isOpen ? 'none' : 'block';
        if (toggleIcon) toggleIcon.classList.toggle('open', !isOpen);

        // If opening, highlight code inside (in case Prism hasn't run yet)
        if (!isOpen && window.Prism) {
          Prism.highlightAllUnder(content);
        }
      });
    });

    // Subsection header click → toggle subsection-content
    container.querySelectorAll('.subsection-header').forEach(function (subHeader) {
      subHeader.addEventListener('click', function (e) {
        e.stopPropagation();
        const content    = subHeader.nextElementSibling;
        const toggleIcon = subHeader.querySelector('.toggle-icon');
        if (!content) return;

        const isOpen = content.style.display !== 'none';
        content.style.display = isOpen ? 'none' : 'block';
        if (toggleIcon) toggleIcon.classList.toggle('open', !isOpen);

        if (!isOpen && window.Prism) {
          Prism.highlightAllUnder(content);
        }
      });
    });

    // Checkbox click → toggle completed state
    container.querySelectorAll('.problem-checkbox').forEach(function (cb) {
      cb.addEventListener('change', function (e) {
        e.stopPropagation();
        const id = cb.dataset.id;
        if (cb.checked) {
          state.completed[id] = true;
        } else {
          delete state.completed[id];
        }
        saveCompleted();

        // Update card styling without full re-render
        const card = cb.closest('.problem-card');
        if (card) card.classList.toggle('completed', cb.checked);

        updateProgress();
      });
    });
  }

  /* ----------------------------------------------------------
     8. FILTERS
  ---------------------------------------------------------- */
  function applyFilters() { render(); }

  function setupFilters() {
    const searchInput      = document.getElementById('search-input');
    const searchClear      = document.getElementById('search-clear');
    const difficultyFilter = document.getElementById('difficulty-filter');
    const patternFilter    = document.getElementById('pattern-filter');
    const clearFiltersBtn  = document.getElementById('clear-filters-btn');

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        state.search = searchInput.value;
        searchClear.classList.toggle('visible', state.search.length > 0);
        applyFilters();
      });
    }

    if (searchClear) {
      searchClear.addEventListener('click', function () {
        searchInput.value = '';
        state.search = '';
        searchClear.classList.remove('visible');
        applyFilters();
      });
    }

    if (difficultyFilter) {
      difficultyFilter.addEventListener('change', function () {
        state.difficulty = difficultyFilter.value;
        applyFilters();
      });
    }

    if (patternFilter) {
      patternFilter.addEventListener('change', function () {
        state.pattern = patternFilter.value;
        applyFilters();
      });
    }

    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', function () {
        state.search = '';
        state.difficulty = 'all';
        state.pattern = 'all';
        if (searchInput)      { searchInput.value = ''; searchClear.classList.remove('visible'); }
        if (difficultyFilter)  difficultyFilter.value = 'all';
        if (patternFilter)     patternFilter.value    = 'all';
        applyFilters();
      });
    }
  }

  /* ----------------------------------------------------------
     9. SIDEBAR NAVIGATION & MOBILE MENU
  ---------------------------------------------------------- */
  function setupSidebar() {
    const sidebar  = document.getElementById('sidebar');
    const overlay  = document.getElementById('sidebar-overlay');
    const hamburger= document.getElementById('hamburger');
    const closeBtn = document.getElementById('sidebar-close');

    function openSidebar()  { sidebar.classList.add('open'); overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
    function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('open'); document.body.style.overflow = ''; }

    if (hamburger) hamburger.addEventListener('click', openSidebar);
    if (closeBtn)  closeBtn.addEventListener('click', closeSidebar);
    if (overlay)   overlay.addEventListener('click', closeSidebar);

    // Sidebar category links → close on mobile, highlight active
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        sidebarLinks.forEach(function (l) { l.classList.remove('active'); });
        link.classList.add('active');
        closeSidebar();
      });
    });

    // Highlight active sidebar link on scroll
    const mainWrapper = document.querySelector('.main-wrapper');
    const scrollRoot  = mainWrapper || window;

    function onScroll() {
      const scrollY = (mainWrapper ? mainWrapper.scrollTop : window.scrollY) + 120;
      let activeId  = null;

      CATEGORIES.forEach(function (cat) {
        const sec = document.getElementById('category-' + cat.id);
        if (sec && sec.offsetTop <= scrollY) activeId = cat.id;
      });

      sidebarLinks.forEach(function (l) {
        l.classList.toggle('active', l.dataset.category === activeId);
      });
    }

    scrollRoot.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ----------------------------------------------------------
     10. SCROLL-TO-TOP BUTTON
  ---------------------------------------------------------- */
  function setupScrollTop() {
    const btn        = document.getElementById('scroll-top-btn');
    const mainWrapper= document.querySelector('.main-wrapper');
    const scrollRoot = mainWrapper || window;

    function onScroll() {
      const scrollY = mainWrapper ? mainWrapper.scrollTop : window.scrollY;
      btn.classList.toggle('visible', scrollY > 400);
    }

    scrollRoot.addEventListener('scroll', onScroll, { passive: true });

    btn.addEventListener('click', function () {
      if (mainWrapper) {
        mainWrapper.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  /* ----------------------------------------------------------
     11. INIT
  ---------------------------------------------------------- */
  function init() {
    render();
    setupFilters();
    setupSidebar();
    setupScrollTop();
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
