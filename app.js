document.addEventListener('DOMContentLoaded', () => {
  
  // --- DATA DEFINITIONS ---
  
  const stopDetails = {
    'node-santa-ana': {
      title: 'Santa Ana, CA',
      badge: 'Departure Point',
      description: 'The starting basecamp. Rolling out at Thursday midnight (00:00 AM Friday) to bypass 100% of Southern California freeway traffic.',
      day: 1
    },
    'node-sequoia': {
      title: 'Sequoia National Park',
      badge: 'Stop 1 (Day 1)',
      description: 'Home of the General Sherman Tree (the largest living tree on Earth). Activities include climbing Moro Rock at sunrise and driving through the Tunnel Log.',
      day: 1
    },
    'node-kings-canyon': {
      title: 'Kings Canyon National Park',
      badge: 'Stop 2 (Day 1)',
      description: 'Explore the General Grant Tree loop trail. Transit north via Generals Highway, then traverse the crest of the Sierras via Yosemite\'s Tioga Pass.',
      day: 1
    },
    'node-mammoth': {
      title: 'Mammoth Lakes, CA',
      badge: 'Night 1 Basecamp',
      description: 'Arrive at 5:30 PM after a scenic drive over the Sierra crest. Settle in, dine in the village, and soak in hot springs under a clear night sky.',
      day: 1
    },
    'node-tahoe': {
      title: 'Lake Tahoe, CA/NV',
      badge: 'Nights 2 & 3 Basecamp',
      description: 'Enjoy 2 nights by the water. Settle in and enjoy city/lake activities on Day 2, and take a day excursion north to Burney Falls and Eagle Lake on Day 3.',
      day: 2
    }
  };

  // --- SVG MAP INTERACTIVITY ---

  const mapNodes = document.querySelectorAll('.map-node');
  const infoPanel = document.getElementById('map-info-panel');
  const panelTitle = document.getElementById('panel-stop-title');
  const panelBadge = document.getElementById('panel-stop-badge');
  const panelDesc = document.getElementById('panel-stop-description');
  const activeRoute = document.getElementById('active-route');

  // Trigger default selection (Santa Ana)
  updateMapInfo('node-santa-ana');

  mapNodes.forEach(node => {
    node.addEventListener('click', () => {
      const nodeId = node.id;
      
      // Update active styling
      mapNodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');
      
      // Update info panel
      updateMapInfo(nodeId);
      
      // Sync Day Tab based on stop clicked
      const targetDay = stopDetails[nodeId].day;
      switchDayTab(targetDay);
      
      // Scroll to itinerary section smoothly
      document.getElementById('itinerary-section').scrollIntoView({ behavior: 'smooth' });
    });
  });

  function updateMapInfo(nodeId) {
    const data = stopDetails[nodeId];
    if (data) {
      panelTitle.textContent = data.title;
      panelBadge.textContent = data.badge;
      panelDesc.textContent = data.description;
      
      // Highlight SVG route paths depending on selection
      // Adjust stroke dashoffset to animate route line
      if (activeRoute) {
        let offset = 1000;
        if (nodeId === 'node-santa-ana') offset = 1000;
        else if (nodeId === 'node-sequoia') offset = 750;
        else if (nodeId === 'node-kings-canyon') offset = 500;
        else if (nodeId === 'node-mammoth') offset = 250;
        else if (nodeId === 'node-tahoe') offset = 0;
        
        activeRoute.style.strokeDashoffset = offset;
      }
      
      infoPanel.classList.add('visible');
    }
  }

  // --- DAY ITINERARY TABS ---

  const dayTabs = document.querySelectorAll('.day-tab');
  const itineraryPanels = document.querySelectorAll('.itinerary-panel');

  dayTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const dayNum = parseInt(tab.getAttribute('data-day'), 10);
      switchDayTab(dayNum);
      
      // Sync map node active state to major destination of that day
      if (dayNum === 1) {
        syncMapActiveNode('node-sequoia');
      } else if (dayNum === 2 || dayNum === 3) {
        syncMapActiveNode('node-tahoe');
      } else if (dayNum === 4) {
        syncMapActiveNode('node-santa-ana');
      }
    });
  });

  function switchDayTab(dayNumber) {
    // Update active tab buttons
    dayTabs.forEach(t => {
      const isTarget = parseInt(t.getAttribute('data-day'), 10) === dayNumber;
      t.classList.toggle('active', isTarget);
      t.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    // Update active content panels
    itineraryPanels.forEach((panel, index) => {
      const isTarget = (index + 1) === dayNumber;
      panel.classList.toggle('active', isTarget);
    });
  }

  function syncMapActiveNode(nodeId) {
    mapNodes.forEach(node => {
      if (node.id === nodeId) {
        node.classList.add('active');
        updateMapInfo(nodeId);
      } else {
        node.classList.remove('active');
      }
    });
  }

  // --- PACKING DASHBOARD CHECKLISTS ---

  const checklists = document.querySelectorAll('.checklist-items');
  const progressBars = {
    essentials: { fill: document.getElementById('fill-essentials'), text: document.getElementById('text-essentials') },
    food: { fill: document.getElementById('fill-food'), text: document.getElementById('text-food') },
    apparel: { fill: document.getElementById('fill-apparel'), text: document.getElementById('text-apparel') }
  };

  // Restore checked items from LocalStorage
  restoreChecklistState();

  // Listen to changes on all checkboxes
  document.querySelectorAll('.checklist-items input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      saveChecklistState();
      updateAllProgress();
    });
  });

  function updateAllProgress() {
    checklists.forEach(list => {
      const category = list.getAttribute('data-category');
      const checkboxes = list.querySelectorAll('input[type="checkbox"]');
      const checkedCount = list.querySelectorAll('input[type="checkbox"]:checked').length;
      const totalCount = checkboxes.length;
      
      const percent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;
      
      // Update UI
      if (progressBars[category]) {
        progressBars[category].fill.style.width = `${percent}%`;
        progressBars[category].text.textContent = `${percent}%`;
      }
    });
  }

  function saveChecklistState() {
    const state = {};
    document.querySelectorAll('.checklist-items input[type="checkbox"]').forEach(checkbox => {
      state[checkbox.id] = checkbox.checked;
    });
    localStorage.setItem('sierra_ascent_checklist_v1', JSON.stringify(state));
  }

  function restoreChecklistState() {
    const saved = localStorage.getItem('sierra_ascent_checklist_v1');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        Object.keys(state).forEach(id => {
          const checkbox = document.getElementById(id);
          if (checkbox) {
            checkbox.checked = state[id];
          }
        });
      } catch (e) {
        console.error('Error parsing stored checklist state', e);
      }
    }
    // Calculate progress bars initially
    updateAllProgress();
  }

  // --- COPY LOGISTICS SHARE TEXT ---

  const copyBtn = document.getElementById('btn-copy-share');
  const copyBtnText = document.getElementById('copy-btn-text');
  const shareTextBox = document.getElementById('share-text-box');

  if (copyBtn && shareTextBox && copyBtnText) {
    copyBtn.addEventListener('click', () => {
      const text = shareTextBox.textContent || shareTextBox.innerText;
      
      navigator.clipboard.writeText(text).then(() => {
        // Success feedback
        copyBtnText.textContent = 'Copied!';
        copyBtn.style.backgroundColor = 'var(--forest-green)';
        copyBtn.style.color = '#fff';
        
        setTimeout(() => {
          copyBtnText.textContent = 'Copy to Clipboard';
          copyBtn.style.backgroundColor = '';
          copyBtn.style.color = '';
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Could not copy automatically. Please select text manually.');
      });
    });
  }
});
