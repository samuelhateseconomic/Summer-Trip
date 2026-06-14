document.addEventListener('DOMContentLoaded', () => {

  // ═══════════════════════════════════════════════
  // STOP DATA
  // ═══════════════════════════════════════════════
  const stopDetails = {
    'node-santa-ana': {
      title: 'Santa Ana, CA',
      badge: 'Departure & Return Base',
      description: 'The loop launches at 00:00 AM Friday, July 3rd — midnight departure bypasses 100% of Southern California Friday morning gridlock. Loop closes here Monday evening after 723 miles.',
      day: 1,
      outboundOffset: 900,
      returnOffset: 600
    },
    'node-sequoia': {
      title: 'Sequoia National Park',
      badge: 'Night 1 · July 3rd',
      description: 'Arrive at dawn (5:00 AM) for an uncrowded misty morning among the world\'s largest trees. Moro Rock sunrise, General Sherman Tree, and Tunnel Log. Sleep Night 1 in the ancient giant forest at 6,200 ft.',
      day: 1,
      outboundOffset: 600,
      returnOffset: 600
    },
    'node-kings-canyon': {
      title: 'Kings Canyon National Park',
      badge: 'Day 2 · Saturday Morning',
      description: 'Drive the historic Generals Highway north (30 mi). Explore the General Grant Grove and stroll the Zumwalt Meadow boardwalk along the glacier-carved canyon floor before pushing north to Lake Tahoe.',
      day: 2,
      outboundOffset: 380,
      returnOffset: 600
    },
    'node-tahoe': {
      title: 'Lake Tahoe, CA/NV',
      badge: 'Nights 2 & 3 · Resort Base',
      description: 'Arrive Saturday evening for 2 nights at the cobalt alpine lake. Sunday is entirely dedicated to Eagle Falls, Emerald Bay, lakeside recreation, and the Cave Rock 180-degree sunset scramble.',
      day: 3,
      outboundOffset: 0,
      returnOffset: 600
    },
    'node-mammoth': {
      title: 'Mammoth Lakes, CA',
      badge: 'Day 4 · Return Stopover',
      description: 'Monday return stopover on US-395 South (165 mi from Tahoe). Lunch in the mountain village, optional Minaret Vista viewpoint, and a scenic walk at Convict Lake before the final descent to Orange County.',
      day: 4,
      outboundOffset: 0,
      returnOffset: 300
    }
  };

  // ═══════════════════════════════════════════════
  // SVG MAP INTERACTIVITY
  // ═══════════════════════════════════════════════
  const mapNodes      = document.querySelectorAll('.map-node');
  const infoPanel     = document.getElementById('map-info-panel');
  const panelTitle    = document.getElementById('panel-stop-title');
  const panelBadge    = document.getElementById('panel-stop-badge');
  const panelDesc     = document.getElementById('panel-stop-description');
  const outboundRoute = document.getElementById('outbound-route');
  const returnRoute   = document.getElementById('return-route');

  // Default selection on load
  updateMapInfo('node-santa-ana');

  mapNodes.forEach(node => {
    node.addEventListener('click', () => {
      const nodeId = node.id;

      // Update active node styling
      mapNodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');

      // Update info panel
      updateMapInfo(nodeId);

      // Sync day tab
      const targetDay = stopDetails[nodeId].day;
      switchDayTab(targetDay);

      // Smooth scroll to itinerary
      document.getElementById('itinerary-section').scrollIntoView({ behavior: 'smooth' });
    });
  });

  function updateMapInfo(nodeId) {
    const data = stopDetails[nodeId];
    if (!data) return;

    panelTitle.textContent = data.title;
    panelBadge.textContent = data.badge;
    panelDesc.textContent  = data.description;

    // Animate the two loop paths
    if (outboundRoute) outboundRoute.style.strokeDashoffset = data.outboundOffset;
    if (returnRoute)   returnRoute.style.strokeDashoffset   = data.returnOffset;

    infoPanel.classList.add('visible');
  }

  // ═══════════════════════════════════════════════
  // DAY-BY-DAY TABS
  // ═══════════════════════════════════════════════
  const dayTabs          = document.querySelectorAll('.day-tab');
  const itineraryPanels  = document.querySelectorAll('.itinerary-panel');

  // Map: day number → which map node to highlight
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
      // Sync the map node
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
    mapNodes.forEach(node => node.classList.remove('active'));
    const target = document.getElementById(nodeId);
    if (target) {
      target.classList.add('active');
      updateMapInfo(nodeId);
    }
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

  // Restore state from localStorage
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
      const checkedCount = list.querySelectorAll('input[type="checkbox"]:checked').length;
      const percent     = all.length > 0 ? Math.round((checkedCount / all.length) * 100) : 0;
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
      } catch (e) {
        console.error('Checklist state parse error:', e);
      }
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
        copyBtnText.textContent        = 'Copied!';
        copyBtn.style.background       = 'linear-gradient(135deg, #225132, #3d8c58)';
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
