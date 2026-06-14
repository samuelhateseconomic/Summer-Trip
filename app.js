document.addEventListener('DOMContentLoaded', () => {

  // ═══════════════════════════════════════════════
  // STOP DATA (for info panel text)
  // ═══════════════════════════════════════════════
  const stopDetails = {
    'node-santa-ana': {
      title: 'Santa Ana, CA',
      badge: 'Departure & Return Base',
      description: 'The loop launches at 00:00 AM Friday, July 3rd — midnight departure bypasses 100% of Southern California Friday morning gridlock. Loop closes here Monday evening after 723 miles.',
      day: 1
    },
    'node-sequoia': {
      title: 'Sequoia National Park',
      badge: 'Night 1 · Friday July 3rd',
      description: 'Arrive at dawn (5:00 AM) for an uncrowded misty morning among the world\'s largest trees. Moro Rock sunrise, General Sherman Tree, and Tunnel Log. Sleep Night 1 in the ancient giant forest at 6,200 ft.',
      day: 1
    },
    'node-kings-canyon': {
      title: 'Kings Canyon National Park',
      badge: 'Day 2 · Saturday Morning',
      description: 'Drive the historic Generals Highway north (30 mi, ~1.2h). Explore the General Grant Grove and stroll the Zumwalt Meadow boardwalk along the glacier-carved canyon floor before pushing north to Lake Tahoe.',
      day: 2
    },
    'node-burney': {
      title: 'Burney Falls',
      badge: 'Optional Saturday Detour',
      description: '129-ft spring-fed basalt cascade — 100 million gallons per day. Located ~2h north of Kings Canyon. Day-use fee: $11. Adds ~4 hours of driving vs. the direct Tahoe route.',
      day: 2
    },
    'node-tahoe': {
      title: 'Lake Tahoe, CA/NV',
      badge: 'Nights 2 & 3 · Resort Base',
      description: 'Arrive Saturday evening for 2 nights at the cobalt alpine lake. Sunday is entirely dedicated to the optional Eagle Falls hike (~2h extra drive), Emerald Bay, lakeside recreation, and the Cave Rock 180-degree sunset scramble.',
      day: 3
    },
    'node-mammoth': {
      title: 'Mammoth Lakes, CA',
      badge: 'Day 4 · Return Stopover',
      description: 'Monday return stopover on US-395 South (165 mi from Tahoe). Lunch in the mountain village, optional Minaret Vista viewpoint, and a scenic walk at Convict Lake before the final descent to Orange County.',
      day: 4
    }
  };

  // ═══════════════════════════════════════════════
  // SVG PATH ELEMENTS
  // ═══════════════════════════════════════════════
  const seg1Path      = document.getElementById('outbound-sa-kc');     // SA → KC
  const seg2Direct    = document.getElementById('outbound-kc-tahoe');  // KC → Tahoe (direct)
  const seg2Burney    = document.getElementById('outbound-kc-burney'); // KC → Burney → Tahoe
  const returnPath    = document.getElementById('return-route');       // Tahoe → Mammoth

  // Burney toggle SVG elements
  const shadowDirect  = document.getElementById('shadow-kc-tahoe');
  const shadowBurney  = document.getElementById('shadow-kc-burney');
  const labelDirect   = document.getElementById('label-kc-tahoe-direct');
  const labelKcBurney = document.getElementById('label-kc-burney');
  const labelBurneyTahoe = document.getElementById('label-burney-tahoe');
  const nodeBurney    = document.getElementById('node-burney');

  // ── Get actual path lengths via browser rendering ──
  let seg1Len = 0, seg2DirLen = 0, seg2BurLen = 0, retLen = 0;
  let burneyFraction = 0.52; // fraction along KC→Burney→Tahoe path where Burney node sits
  let seqFraction    = 0.50; // fraction along SA→KC path where Sequoia sits

  if (seg1Path) {
    seg1Len    = seg1Path.getTotalLength();
    seg1Path.style.strokeDasharray  = seg1Len;
    seg1Path.style.strokeDashoffset = seg1Len; // hidden initially
  }
  if (seg2Direct) {
    seg2DirLen = seg2Direct.getTotalLength();
    seg2Direct.style.strokeDasharray  = seg2DirLen;
    seg2Direct.style.strokeDashoffset = seg2DirLen; // hidden initially
  }
  if (seg2Burney) {
    seg2BurLen = seg2Burney.getTotalLength();
    seg2Burney.style.strokeDasharray  = seg2BurLen;
    seg2Burney.style.strokeDashoffset = seg2BurLen; // hidden initially
  }
  if (returnPath) {
    retLen = returnPath.getTotalLength();
    returnPath.style.strokeDasharray  = retLen;
    returnPath.style.strokeDashoffset = retLen; // hidden initially
  }

  // ─── Burney toggle state ───
  let burneyActive = false;
  const toggleBurney = document.getElementById('toggle-burney');
  const burneyRouteLabel = document.getElementById('burney-route-label');

  function applyBurneyMode(active) {
    burneyActive = active;

    // Swap shadows
    if (shadowDirect) shadowDirect.style.display = active ? 'none' : '';
    if (shadowBurney) shadowBurney.style.display = active ? '' : 'none';

    // Swap active paths
    if (seg2Direct) seg2Direct.style.display = active ? 'none' : '';
    if (seg2Burney) seg2Burney.style.display = active ? '' : 'none';

    // Swap distance labels
    if (labelDirect)    labelDirect.style.display    = active ? 'none' : '';
    if (labelKcBurney)  labelKcBurney.style.display  = active ? '' : 'none';
    if (labelBurneyTahoe) labelBurneyTahoe.style.display = active ? '' : 'none';

    // Show/hide Burney Falls node
    if (nodeBurney) nodeBurney.style.display = active ? '' : 'none';

    // Update label text
    if (burneyRouteLabel) {
      burneyRouteLabel.textContent = active
        ? 'Via Burney Falls ↑'
        : 'Direct KC → Tahoe';
    }

    // Re-animate to current node so the correct path fills
    replayCurrentAnimation();
  }

  if (toggleBurney) {
    toggleBurney.addEventListener('change', () => {
      applyBurneyMode(toggleBurney.checked);
    });
  }

  // ═══════════════════════════════════════════════
  // ANIMATE ROUTE TO A GIVEN NODE
  // ═══════════════════════════════════════════════
  let currentNode = 'node-santa-ana';

  function animateToNode(nodeId) {
    currentNode = nodeId;

    // Default: hide all segments
    let s1Offset  = seg1Len;    // seg1 hidden
    let s2Offset  = burneyActive ? seg2BurLen : seg2DirLen; // seg2 hidden
    let retOffset = retLen;     // return hidden

    switch (nodeId) {
      case 'node-santa-ana':
        // Nothing drawn — loop not yet started
        s1Offset  = seg1Len;
        s2Offset  = burneyActive ? seg2BurLen : seg2DirLen;
        retOffset = retLen;
        break;

      case 'node-sequoia':
        // Fill seg1 up to ~50% (Sequoia is roughly halfway from SA to KC)
        s1Offset  = seg1Len * (1 - seqFraction);
        s2Offset  = burneyActive ? seg2BurLen : seg2DirLen;
        retOffset = retLen;
        break;

      case 'node-kings-canyon':
        // Day 2 driving continues to Tahoe, so fill seg2 completely
        s1Offset  = 0;
        s2Offset  = 0;
        retOffset = retLen;
        break;

      case 'node-burney':
        // Fill seg1 completely, fill seg2 up to Burney (~52%)
        s1Offset  = 0;
        s2Offset  = burneyActive
          ? seg2BurLen * (1 - burneyFraction)
          : seg2DirLen; // if not in burney mode, don't fill seg2
        retOffset = retLen;
        break;

      case 'node-tahoe':
        // Fill seg1 + seg2 completely, return hidden
        s1Offset  = 0;
        s2Offset  = 0;
        retOffset = retLen;
        break;

      case 'node-mammoth':
        // All outbound done, fill return to ~55%
        s1Offset  = 0;
        s2Offset  = 0;
        retOffset = retLen * (1 - 0.55);
        break;
    }

    // Apply offsets
    if (seg1Path)   seg1Path.style.strokeDashoffset   = s1Offset;

    if (burneyActive) {
      if (seg2Burney) seg2Burney.style.strokeDashoffset = s2Offset;
    } else {
      if (seg2Direct) seg2Direct.style.strokeDashoffset = s2Offset;
    }

    if (returnPath) returnPath.style.strokeDashoffset = retOffset;
  }

  function replayCurrentAnimation() {
    animateToNode(currentNode);
  }

  // ═══════════════════════════════════════════════
  // SVG MAP NODE CLICK INTERACTIVITY
  // ═══════════════════════════════════════════════
  const mapNodes   = document.querySelectorAll('.map-node');
  const infoPanel  = document.getElementById('map-info-panel');
  const panelTitle = document.getElementById('panel-stop-title');
  const panelBadge = document.getElementById('panel-stop-badge');
  const panelDesc  = document.getElementById('panel-stop-description');

  // Default state on load
  updateMapInfo('node-santa-ana');
  animateToNode('node-santa-ana');

  mapNodes.forEach(node => {
    node.addEventListener('click', () => {
      const nodeId = node.id;

      // Update active styling
      mapNodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');

      // Update info panel
      updateMapInfo(nodeId);

      // Animate route
      animateToNode(nodeId);

      // Sync day tab
      const data = stopDetails[nodeId];
      if (data) switchDayTab(data.day);

      // Scroll to itinerary
      document.getElementById('itinerary-section').scrollIntoView({ behavior: 'smooth' });
    });
  });

  function updateMapInfo(nodeId) {
    const data = stopDetails[nodeId];
    if (!data) return;
    panelTitle.textContent = data.title;
    panelBadge.textContent = data.badge;
    panelDesc.textContent  = data.description;
    infoPanel.classList.add('visible');
  }

  // ═══════════════════════════════════════════════
  // DAY-BY-DAY TABS
  // ═══════════════════════════════════════════════
  const dayTabs         = document.querySelectorAll('.day-tab');
  const itineraryPanels = document.querySelectorAll('.itinerary-panel');

  // Day → which node to highlight on the map
  const dayToNode = {
    1: 'node-sequoia',
    2: 'node-kings-canyon',
    3: 'node-tahoe',
    4: 'node-mammoth'
  };

  dayTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const dayNum = parseInt(tab.getAttribute('data-day'), 10);
      switchDayTab(dayNum);
      const targetNode = dayToNode[dayNum];
      if (targetNode) syncMapActiveNode(targetNode);
    });
  });

  function switchDayTab(dayNumber) {
    dayTabs.forEach(t => {
      const isTarget = parseInt(t.getAttribute('data-day'), 10) === dayNumber;
      t.classList.toggle('active', isTarget);
      t.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });
    itineraryPanels.forEach((panel, idx) => {
      panel.classList.toggle('active', (idx + 1) === dayNumber);
    });
  }

  function syncMapActiveNode(nodeId) {
    mapNodes.forEach(n => n.classList.remove('active'));
    const target = document.getElementById(nodeId);
    if (target) target.classList.add('active');
    updateMapInfo(nodeId);
    animateToNode(nodeId);
  }

  // ═══════════════════════════════════════════════
  // PACKING CHECKLIST + PROGRESS BARS
  // ═══════════════════════════════════════════════
  const checklists = document.querySelectorAll('.checklist-items');
  const progressBars = {
    essentials: { fill: document.getElementById('fill-essentials'), text: document.getElementById('text-essentials') },
    food:       { fill: document.getElementById('fill-food'),       text: document.getElementById('text-food') },
    apparel:    { fill: document.getElementById('fill-apparel'),    text: document.getElementById('text-apparel') }
  };

  restoreChecklistState();

  document.querySelectorAll('.checklist-items input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      saveChecklistState();
      updateAllProgress();
    });
  });

  function updateAllProgress() {
    checklists.forEach(list => {
      const category    = list.getAttribute('data-category');
      const all         = list.querySelectorAll('input[type="checkbox"]');
      const checked     = list.querySelectorAll('input[type="checkbox"]:checked').length;
      const percent     = all.length > 0 ? Math.round((checked / all.length) * 100) : 0;
      if (progressBars[category]) {
        progressBars[category].fill.style.width = `${percent}%`;
        progressBars[category].text.textContent = `${percent}%`;
      }
    });
  }

  function saveChecklistState() {
    const state = {};
    document.querySelectorAll('.checklist-items input[type="checkbox"]').forEach(cb => {
      state[cb.id] = cb.checked;
    });
    localStorage.setItem('sierra_ascent_loop_v2', JSON.stringify(state));
  }

  function restoreChecklistState() {
    const saved = localStorage.getItem('sierra_ascent_loop_v2');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        Object.keys(state).forEach(id => {
          const cb = document.getElementById(id);
          if (cb) cb.checked = state[id];
        });
      } catch (e) { /* ignore parse errors */ }
    }
    updateAllProgress();
  }

  // ═══════════════════════════════════════════════
  // CLIPBOARD SHARE COPY
  // ═══════════════════════════════════════════════
  const copyBtn     = document.getElementById('btn-copy-share');
  const copyBtnText = document.getElementById('copy-btn-text');
  const shareBox    = document.getElementById('share-text-box');

  if (copyBtn && shareBox && copyBtnText) {
    copyBtn.addEventListener('click', () => {
      const text = shareBox.textContent || shareBox.innerText;
      navigator.clipboard.writeText(text).then(() => {
        copyBtnText.textContent  = 'Copied!';
        copyBtn.style.background = 'linear-gradient(135deg, #225132, #3d8c58)';
        setTimeout(() => {
          copyBtnText.textContent  = 'Copy to Clipboard';
          copyBtn.style.background = '';
        }, 2200);
      }).catch(() => {
        alert('Could not copy automatically. Please select the text manually.');
      });
    });
  }

});
