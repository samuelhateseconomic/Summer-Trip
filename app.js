document.addEventListener('DOMContentLoaded', () => {

  // ═══════════════════════════════════════════════
  // STOP DATA (for info panel text)
  // ═══════════════════════════════════════════════
  const stopDetails = {
    'node-santa-ana': {
      title: 'Santa Ana, CA',
      badge: 'Departure & Return Base',
      description: 'The loop launches at 12:00 AM Friday, July 4th — midnight departure bypasses 100% of Southern California holiday gridlock. Loop closes here Monday evening (Jul 7) after ~700 miles.',
      day: 1
    },
    'node-tahoe': {
      title: 'West Shore Lake Tahoe',
      badge: 'Day 1 · Morning Stop',
      description: 'First stop of the loop after a 7–7.5h direct drive up I-5. Emerald Bay overlook at 7 AM — the largest alpine lake in North America, second-deepest in the U.S. Optional: Vikingsholm mansion (steep 1-mile trail down). Eagle Falls hike right after from the same parking area. Lunch in South Lake Tahoe at noon before crossing to Reno.',
      day: 1
    },
    'node-reno': {
      title: 'Reno, NV',
      badge: 'Nights 1 & 2 · Airbnb Base',
      description: 'Arrive Friday ~2 PM after West Shore Tahoe and a 1-hour drive via US-50 East over Spooner Summit. Base for both nights. Saturday (Day 2) is a full East Shore loop: Sand Harbor (reservation required before 10:30 AM), Secret Cove, Skunk Harbor hike (pack it out), and Cave Rock sunset scramble — back to Reno by 9 PM.',
      day: 1
    },
    'node-sequoia': {
      title: 'Sequoia National Park',
      badge: 'Night 3 · Sunday July 6th',
      description: 'Depart Reno Sunday at 8:30 AM (~5h south via US-395/CA-168). Cool off in the Kaweah River, conquer Moro Rock\'s 350-step staircase, and stand beneath the General Sherman Tree — the largest living thing on Earth. Layer up after swimming; temperatures drop fast at 6,200 ft after dark.',
      day: 3
    },
    'node-kings-canyon': {
      title: 'Kings Canyon National Park',
      badge: 'Day 4 · Monday Morning',
      description: 'The final morning of the loop. Drive the Generals Highway north 30 mi from Sequoia. Visit the General Grant Tree — the "Nation\'s Christmas Tree" — and stroll the Zumwalt Meadow boardwalk before heading home via CA-99/I-5 (~5h, ~290 mi).',
      day: 4
    }
  };

  // ═══════════════════════════════════════════════
  // SVG PATH ELEMENTS
  // ═══════════════════════════════════════════════
  const seg1Path   = document.getElementById('outbound-sa-tahoe');     // SA → West Shore Tahoe
  const seg2Path   = document.getElementById('outbound-tahoe-reno');   // West Shore → Reno
  const seg3Path   = document.getElementById('outbound-reno-seq');     // Reno → Sequoia
  const seg4Path   = document.getElementById('outbound-seq-kc');       // Sequoia → KC
  const returnPath = document.getElementById('return-route');           // KC → Home

  // ── Get actual path lengths via browser rendering ──
  let seg1Len = 0, seg2Len = 0, seg3Len = 0, seg4Len = 0, retLen = 0;

  if (seg1Path)   { seg1Len = seg1Path.getTotalLength();   seg1Path.style.strokeDasharray   = seg1Len;   seg1Path.style.strokeDashoffset   = seg1Len; }
  if (seg2Path)   { seg2Len = seg2Path.getTotalLength();   seg2Path.style.strokeDasharray   = seg2Len;   seg2Path.style.strokeDashoffset   = seg2Len; }
  if (seg3Path)   { seg3Len = seg3Path.getTotalLength();   seg3Path.style.strokeDasharray   = seg3Len;   seg3Path.style.strokeDashoffset   = seg3Len; }
  if (seg4Path)   { seg4Len = seg4Path.getTotalLength();   seg4Path.style.strokeDasharray   = seg4Len;   seg4Path.style.strokeDashoffset   = seg4Len; }
  if (returnPath) { retLen  = returnPath.getTotalLength(); returnPath.style.strokeDasharray  = retLen;   returnPath.style.strokeDashoffset  = retLen; }

  // ═══════════════════════════════════════════════
  // ANIMATE ROUTE TO A GIVEN NODE
  // ═══════════════════════════════════════════════
  let currentNode = 'node-santa-ana';

  function animateToNode(nodeId) {
    currentNode = nodeId;

    // Default: all hidden
    let o1 = seg1Len, o2 = seg2Len, o3 = seg3Len, o4 = seg4Len, ret = retLen;

    switch (nodeId) {
      case 'node-santa-ana':
        // Nothing drawn
        break;

      case 'node-tahoe':
        // Fill seg1 (SA → West Shore Tahoe)
        o1 = 0;
        break;

      case 'node-reno':
        // Fill seg1 + seg2 (SA → West Shore → Reno)
        o1 = 0; o2 = 0;
        break;

      case 'node-sequoia':
        // Fill seg1 + seg2 + seg3 (→ Sequoia)
        o1 = 0; o2 = 0; o3 = 0;
        break;

      case 'node-kings-canyon':
        // Fill all outbound segments (→ Kings Canyon)
        o1 = 0; o2 = 0; o3 = 0; o4 = 0;
        break;
    }

    // Apply offsets
    if (seg1Path)   seg1Path.style.strokeDashoffset   = o1;
    if (seg2Path)   seg2Path.style.strokeDashoffset   = o2;
    if (seg3Path)   seg3Path.style.strokeDashoffset   = o3;
    if (seg4Path)   seg4Path.style.strokeDashoffset   = o4;
    if (returnPath) returnPath.style.strokeDashoffset = ret;
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
    1: 'node-reno',
    2: 'node-reno',
    3: 'node-sequoia',
    4: 'node-kings-canyon'
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
  // AUTHENTICATION & LOGIN MODAL
  // ═══════════════════════════════════════════════
  let isAuthenticated = sessionStorage.getItem('authenticated') === 'true';
  const loginModal = document.getElementById('login-modal');
  const btnShowLogin = document.getElementById('btn-show-login');
  const btnLoginSubmit = document.getElementById('btn-login-submit');
  const btnLoginCancel = document.getElementById('btn-login-cancel');
  const loginUser = document.getElementById('login-username');
  const loginPass = document.getElementById('login-password');
  const loginError = document.getElementById('login-error');
  const addItemForms = document.querySelectorAll('.add-item-form');

  function applyAuthState() {
    if (isAuthenticated) {
      if (btnShowLogin) btnShowLogin.style.display = 'none';
      addItemForms.forEach(form => form.style.display = 'flex');
      document.querySelectorAll('.checklist-items input[type="checkbox"]').forEach(cb => {
        cb.disabled = false;
      });
      document.querySelectorAll('.btn-edit-item').forEach(b => b.style.display = 'inline-block');
    } else {
      if (btnShowLogin) btnShowLogin.style.display = 'inline';
      addItemForms.forEach(form => form.style.display = 'none');
      document.querySelectorAll('.checklist-items input[type="checkbox"]').forEach(cb => {
        cb.disabled = true;
      });
      document.querySelectorAll('.btn-edit-item').forEach(b => b.style.display = 'none');
    }
  }

  if (btnShowLogin) {
    btnShowLogin.addEventListener('click', () => {
      loginModal.style.display = 'flex';
      loginError.style.display = 'none';
    });
  }

  if (btnLoginCancel) {
    btnLoginCancel.addEventListener('click', () => {
      loginModal.style.display = 'none';
    });
  }

  if (btnLoginSubmit) {
    btnLoginSubmit.addEventListener('click', () => {
      // Hardcoded auth as requested
      if (loginUser.value.trim() === 'northcalsummertrip2026' && loginPass.value === 'YouAreGei17') {
        isAuthenticated = true;
        sessionStorage.setItem('authenticated', 'true');
        loginModal.style.display = 'none';
        applyAuthState();
      } else {
        loginError.style.display = 'block';
      }
    });
  }

  // ═══════════════════════════════════════════════
  // FIREBASE CONFIGURATION
  // ═══════════════════════════════════════════════
  const firebaseConfig = {
    apiKey: "AIzaSyB55d2f1DgS2QHKz-wUwI1eb4HsMWOGiAA",
    authDomain: "summertrip2026-97be2.firebaseapp.com",
    databaseURL: "https://summertrip2026-97be2-default-rtdb.firebaseio.com",
    projectId: "summertrip2026-97be2",
    storageBucket: "summertrip2026-97be2.firebasestorage.app",
    messagingSenderId: "937428860714",
    appId: "1:937428860714:web:0093c19878ff6e9c056853",
    measurementId: "G-6RPBM53YJ9"
  };

  let db = null;
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
  } catch (e) {
    console.warn('Firebase init failed, falling back to localStorage:', e);
  }

  // ═══════════════════════════════════════════════
  // PACKING CHECKLIST + PROGRESS BARS + CUSTOM ITEMS
  // ═══════════════════════════════════════════════
  const checklists = document.querySelectorAll('.checklist-items');
  const progressBars = {
    essentials: { fill: document.getElementById('fill-essentials'), text: document.getElementById('text-essentials') },
    food:       { fill: document.getElementById('fill-food'),       text: document.getElementById('text-food') },
    apparel:    { fill: document.getElementById('fill-apparel'),    text: document.getElementById('text-apparel') }
  };

  applyAuthState();

  function attachCheckboxListener(cb) {
    cb.addEventListener('change', () => {
      if (!isAuthenticated) {
        cb.checked = !cb.checked; // revert
        loginModal.style.display = 'flex';
        return;
      }
      saveChecklistState();
      updateAllProgress();
    });
  }

  document.querySelectorAll('.checklist-items input[type="checkbox"]').forEach(attachCheckboxListener);

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
    // Save to Firebase if available, always save to localStorage as backup
    localStorage.setItem('sierra_ascent_loop_v2', JSON.stringify(state));
    if (db) {
      try { db.ref('checklist_state').set(state); } catch(e) { /* fallback */ }
    }
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

  // Restore from localStorage immediately
  restoreChecklistState();

  // Then listen for Firebase updates (overrides localStorage if available)
  if (db) {
    db.ref('checklist_state').on('value', (snapshot) => {
      const state = snapshot.val();
      if (state) {
        Object.keys(state).forEach(id => {
          const cb = document.getElementById(id);
          if (cb) cb.checked = state[id];
        });
        updateAllProgress();
      }
    });
  }

  // ── Edit Modal (shared singleton) ──
  let editModalEl = null;
  let editingItemId = null;
  let editingIsCustom = false;
  let editingFirebaseKey = null;

  function getOrCreateEditModal() {
    if (editModalEl) return editModalEl;
    editModalEl = document.createElement('div');
    editModalEl.className = 'edit-modal-overlay';
    editModalEl.style.display = 'none';
    editModalEl.innerHTML = `
      <div class="edit-modal-box">
        <h3>Edit Item</h3>
        <p class="edit-modal-sub">Modify the task details below.</p>
        <label class="edit-label">Task Description</label>
        <input type="text" class="edit-input" id="edit-task-text" placeholder="Task description...">
        <label class="edit-label">Assigned To</label>
        <input type="text" class="edit-input" id="edit-name-tag" placeholder="Name (leave blank for none)" maxlength="25">
        <div class="edit-modal-actions">
          <button class="btn-save-edit" id="btn-save-edit">Save</button>
          <button class="btn-cancel-edit" id="btn-cancel-edit">Cancel</button>
        </div>
        <button class="btn-delete-edit" id="btn-delete-edit">Delete This Item</button>
      </div>
    `;
    document.body.appendChild(editModalEl);

    // Cancel
    editModalEl.querySelector('#btn-cancel-edit').addEventListener('click', () => {
      editModalEl.style.display = 'none';
    });

    // Save
    editModalEl.querySelector('#btn-save-edit').addEventListener('click', () => {
      if (!editingItemId) return;
      const newText = editModalEl.querySelector('#edit-task-text').value.trim();
      const newName = editModalEl.querySelector('#edit-name-tag').value.trim();

      const cb = document.getElementById(editingItemId);
      if (!cb) return;
      const itemTextSpan = cb.closest('label').querySelector('.item-text');
      if (!itemTextSpan) return;

      // Update task text + badge inline
      if (newName) {
        itemTextSpan.innerHTML = (newText || '') + ' <span class="item-badge info">' + newName + '</span>';
      } else {
        itemTextSpan.innerHTML = (newText || '');
      }

      // Save name to Firebase
      if (db) {
        if (newName) {
          db.ref('name_assignments/' + editingItemId).set(newName);
        } else {
          db.ref('name_assignments/' + editingItemId).remove();
        }
      }

      // Save task text to Firebase (for custom items)
      if (db && editingIsCustom && editingFirebaseKey && newText) {
        db.ref('custom_items/' + editingFirebaseKey + '/text').set(newText);
      }

      editModalEl.style.display = 'none';
    });

    // Delete
    editModalEl.querySelector('#btn-delete-edit').addEventListener('click', () => {
      if (!editingItemId) return;
      const cb = document.getElementById(editingItemId);
      if (cb) {
        const li = cb.closest('li');
        if (li) li.remove();
      }
      // Remove from Firebase
      if (db && editingIsCustom && editingFirebaseKey) {
        db.ref('custom_items/' + editingFirebaseKey).remove();
      }
      if (db) {
        db.ref('name_assignments/' + editingItemId).remove();
        db.ref('checklist_state/' + editingItemId).remove();
      }
      updateAllProgress();
      editModalEl.style.display = 'none';
    });

    // Close on overlay click
    editModalEl.addEventListener('click', (e) => {
      if (e.target === editModalEl) editModalEl.style.display = 'none';
    });

    return editModalEl;
  }

  function openEditModal(itemId, isCustom, firebaseKey) {
    const modal = getOrCreateEditModal();
    editingItemId = itemId;
    editingIsCustom = isCustom;
    editingFirebaseKey = firebaseKey;

    const cb = document.getElementById(itemId);

    // Populate task text (text content without the badge)
    const itemTextSpan = cb ? cb.closest('label').querySelector('.item-text') : null;
    let currentText = '';
    if (itemTextSpan) {
      // Clone and remove badge to get pure text
      const clone = itemTextSpan.cloneNode(true);
      const badge = clone.querySelector('.item-badge');
      if (badge) badge.remove();
      currentText = clone.textContent.trim();
    }
    modal.querySelector('#edit-task-text').value = currentText;

    // Populate assigned name from the existing inline badge
    let currentName = '';
    if (itemTextSpan) {
      const badge = itemTextSpan.querySelector('.item-badge');
      if (badge) currentName = badge.textContent.trim();
    }
    modal.querySelector('#edit-name-tag').value = currentName;

    // Delete is available for ALL items
    modal.querySelector('#btn-delete-edit').style.display = 'block';

    modal.style.display = 'flex';
    modal.querySelector('#edit-task-text').focus();
  }

  // ── Build item UI: edit icon on right ──
  function setupItemUI(li, itemId, isCustom, firebaseKey) {
    const label = li.querySelector('label');

    // Wrap label in a row div
    const row = document.createElement('div');
    row.className = 'checklist-item-row';
    li.insertBefore(row, label);
    row.appendChild(label);

    // Edit button (pencil icon) on the right
    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit-item';
    editBtn.innerHTML = '&#9998;'; // ✎ pencil
    editBtn.title = 'Edit item';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!isAuthenticated) {
        loginModal.style.display = 'flex';
        return;
      }
      openEditModal(itemId, isCustom, firebaseKey);
    });
    row.appendChild(editBtn);
  }

  // Add UI to all existing (static) checklist items
  document.querySelectorAll('.checklist-items li').forEach(li => {
    const cb = li.querySelector('input[type="checkbox"]');
    if (cb) setupItemUI(li, cb.id, false, null);
  });

  // ── Custom Items Logic ──
  const customItemKeys = {};

  function appendCustomItemDOM(targetListId, itemId, text, firebaseKey) {
    const list = document.getElementById(targetListId);
    if (!list) return;

    // Prevent duplicates
    if (document.getElementById(itemId)) return;

    const li = document.createElement('li');
    li.setAttribute('data-custom', 'true');
    li.innerHTML = `
      <label class="checkbox-container">
        <input type="checkbox" id="${itemId}">
        <span class="checkmark"></span>
        <span class="item-text">${text} <span class="item-badge info">Added</span></span>
      </label>
    `;
    list.appendChild(li);
    const cb = li.querySelector('input[type="checkbox"]');
    attachCheckboxListener(cb);

    // Add edit icon
    setupItemUI(li, itemId, true, firebaseKey);
    if (firebaseKey) customItemKeys[itemId] = firebaseKey;

    applyAuthState();
  }

  // Load custom items from Firebase in real-time
  if (db) {
    db.ref('custom_items').on('child_added', (snapshot) => {
      const item = snapshot.val();
      appendCustomItemDOM(item.targetList, item.id, item.text, snapshot.key);
      updateAllProgress();
    });

    // Handle remote deletions
    db.ref('custom_items').on('child_removed', (snapshot) => {
      const item = snapshot.val();
      const el = document.getElementById(item.id);
      if (el) {
        const li = el.closest('li');
        if (li) li.remove();
        updateAllProgress();
      }
    });
  }

  document.querySelectorAll('.btn-add-item').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!isAuthenticated) return;
      const form = btn.parentElement;
      const input = form.querySelector('.add-item-input');
      const targetListId = form.getAttribute('data-target');
      const text = input.value.trim();
      
      if (text) {
        const itemId = 'custom_' + Date.now();
        if (db) {
          db.ref('custom_items').push({
            id: itemId,
            text: text,
            targetList: targetListId
          });
        } else {
          appendCustomItemDOM(targetListId, itemId, text, null);
        }
        input.value = '';
      }
    });
  });

  // ── Load Name Assignments from Firebase ──
  if (db) {
    db.ref('name_assignments').on('value', (snapshot) => {
      const names = snapshot.val() || {};
      // Update inline badges for all items that have a name assignment
      document.querySelectorAll('.checklist-items input[type="checkbox"]').forEach(cb => {
        const itemId = cb.id;
        const itemTextSpan = cb.closest('label').querySelector('.item-text');
        if (!itemTextSpan) return;

        if (names[itemId]) {
          // Get pure text (remove existing badge)
          const clone = itemTextSpan.cloneNode(true);
          const oldBadge = clone.querySelector('.item-badge');
          if (oldBadge) oldBadge.remove();
          const pureText = clone.textContent.trim();
          itemTextSpan.innerHTML = pureText + ' <span class="item-badge info">' + names[itemId] + '</span>';
        }
      });
    });
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
