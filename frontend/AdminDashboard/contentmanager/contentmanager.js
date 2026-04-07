// Get API base URL
const CONFIG = window.CONFIG || {};
const API_BASE_URL = CONFIG.API_BASE_URL || "http://localhost:5000";

let selectedPostIds = [];
let currentPage = "posts";
let allPosts = [];
let allUsers = [];

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  setupTabNavigation();
  setupEventListeners();
  await loadAllData();
  updateQuickStats();
});

// ==================== TAB NAVIGATION ====================
function setupTabNavigation() {
  const tabBtns = document.querySelectorAll(".tab-btn");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((t) => t.classList.remove("active"));

      btn.classList.add("active");
      const tabId = btn.dataset.tab + "-tab";
      document.getElementById(tabId).classList.add("active");

      currentPage = btn.dataset.tab;
    });
  });
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
  // Filter listeners
  if (document.getElementById("filterType")) {
    document
      .getElementById("filterType")
      .addEventListener("change", filterPosts);
  }
  if (document.getElementById("filterDept")) {
    document
      .getElementById("filterDept")
      .addEventListener("change", filterPosts);
  }
  if (document.getElementById("filterStatus")) {
    document
      .getElementById("filterStatus")
      .addEventListener("change", filterPosts);
  }
  if (document.getElementById("filterSearch")) {
    document
      .getElementById("filterSearch")
      .addEventListener("input", filterPosts);
  }

  // Checkbox listeners
  if (document.getElementById("selectAllPosts")) {
    document
      .getElementById("selectAllPosts")
      .addEventListener("change", (e) => {
        const checkboxes = document.querySelectorAll(".post-checkbox");
        checkboxes.forEach((cb) => (cb.checked = e.target.checked));
        updateSelectedCount();
      });
  }

  // Bulk delete
  if (document.getElementById("bulkDeleteBtn")) {
    document
      .getElementById("bulkDeleteBtn")
      .addEventListener("click", bulkDeletePosts);
  }

  // Moderation filters
  if (document.getElementById("moderationFilter")) {
    document
      .getElementById("moderationFilter")
      .addEventListener("change", filterModeration);
  }

  // Sidebar navigation
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.addEventListener("click", () => {
      const link = item.dataset.link;
      if (link) window.location.href = link;
    });
  });

  if (document.getElementById("goToHome")) {
    document.getElementById("goToHome").addEventListener("click", () => {
      window.location.href = "../../index.html";
    });
  }

  if (document.getElementById("adminLogoutBtn")) {
    document.getElementById("adminLogoutBtn").addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "../../Login/index.html";
    });
  }
}

// ==================== LOAD ALL DATA ====================
async function loadAllData() {
  await loadPosts();
  await loadUsers();
  await loadModerationData();
  await loadStatistics();
  await loadMediaData();
  await loadActivityLog();
}

// ==================== POSTS MANAGEMENT ====================
async function loadPosts() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/admin/posts/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 403) {
        console.log("Admin access required for full post data");
        return;
      }
      throw new Error("Failed to load posts");
    }

    allPosts = await response.json();
    displayPosts(allPosts);
    updateQuickStats();
  } catch (error) {
    console.error("Error loading posts:", error);
    const tbody = document.getElementById("postTableBody");
    if (tbody) {
      tbody.innerHTML =
        '<tr><td colspan="10">Error loading posts. Make sure you have admin access.</td></tr>';
    }
  }
}

function displayPosts(posts) {
  const tbody = document.getElementById("postTableBody");
  if (!tbody) return;

  if (posts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10">No posts found</td></tr>';
    return;
  }

  tbody.innerHTML = posts
    .map(
      (post, index) => `
    <tr>
      <td><input type="checkbox" class="post-checkbox" value="${post._id}" /></td>
      <td>${index + 1}</td>
      <td><span class="badge">${post.contentType || "post"}</span></td>
      <td>${post.firstName || "Unknown"} ${post.lastName || ""}</td>
      <td>${post.department || "N/A"}</td>
      <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${post.content || "N/A"}</td>
      <td>${new Date(post.createdAt).toLocaleDateString()}</td>
      <td>${post.likes?.length || 0}</td>
      <td>
        <div class="action-btn-group">
          <button class="action-btn view-btn" onclick="viewPostDetail('${post._id}')">View</button>
          <button class="action-btn delete-small-btn" onclick="deletePost('${post._id}')">Delete</button>
        </div>
      </td>
      <td>${post.reports?.length || 0}</td>
    </tr>
  `,
    )
    .join("");

  document.querySelectorAll(".post-checkbox").forEach((cb) => {
    cb.addEventListener("change", updateSelectedCount);
  });
}

function filterPosts() {
  const type = document.getElementById("filterType").value;
  const dept = document.getElementById("filterDept").value;
  const search = document.getElementById("filterSearch").value.toLowerCase();

  let filtered = allPosts.filter((p) => {
    let match = true;

    if (type !== "all") match = match && p.contentType === type;
    if (dept !== "all") match = match && p.department === dept;
    if (search)
      match =
        match &&
        (((p.firstName || "") + " " + (p.lastName || ""))
          .toLowerCase()
          .includes(search) ||
          (p.content || "").toLowerCase().includes(search));

    return match;
  });

  displayPosts(filtered);
}

async function viewPostDetail(postId) {
  const post = allPosts.find((p) => p._id === postId);
  if (!post) return;

  const modal = document.getElementById("viewPostModal");
  const content = document.getElementById("modalContent");

  content.innerHTML = `
    <div style="color: #e5e7eb;">
      <p><strong>User:</strong> ${post.firstName || "Unknown"} ${post.lastName || ""}</p>
      <p><strong>Department:</strong> ${post.department || "N/A"}</p>
      <p><strong>Type:</strong> ${post.contentType || "post"}</p>
      <p><strong>Date:</strong> ${new Date(post.createdAt).toLocaleString()}</p>
      <p><strong>Likes:</strong> ${post.likes?.length || 0}</p>
      <p><strong>Comments:</strong> ${post.comments?.length || 0}</p>
      <p><strong>Reports:</strong> ${post.reports?.length || 0}</p>
      <hr style="border-color: #4b5563; margin: 15px 0;">
      <p><strong>Content:</strong></p>
      <p>${post.content || "No content"}</p>
      ${post.image ? `<img src="${post.image}" style="max-width: 100%; border-radius: 8px; margin-top: 10px;">` : ""}
    </div>
  `;

  modal.style.display = "flex";
}

async function deletePost(postId) {
  if (!confirm("Delete this post?")) return;

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      alert("Post deleted");
      await loadPosts();
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    alert("Error deleting post");
  }
}

function updateSelectedCount() {
  const checked = document.querySelectorAll(".post-checkbox:checked").length;
  selectedPostIds = Array.from(
    document.querySelectorAll(".post-checkbox:checked"),
  ).map((cb) => cb.value);

  const btn = document.getElementById("bulkDeleteBtn");
  const count = document.getElementById("selectedCount");

  if (btn && count) {
    if (checked > 0) {
      btn.style.display = "block";
      count.textContent = checked;
    } else {
      btn.style.display = "none";
    }
  }
}

async function bulkDeletePosts() {
  if (selectedPostIds.length === 0) return;
  if (!confirm(`Delete ${selectedPostIds.length} posts?`)) return;

  try {
    const token = localStorage.getItem("token");

    for (const postId of selectedPostIds) {
      await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    alert("Posts deleted successfully");
    await loadPosts();
  } catch (error) {
    console.error("Error bulk deleting:", error);
    alert("Error deleting posts");
  }
}

// ==================== MODERATION ====================
async function loadModerationData() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/admin/posts/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return;

    const posts = await response.json();
    const flagged = posts.filter((p) => p.reports && p.reports.length > 0);
    displayModerationTable(flagged);
  } catch (error) {
    console.error("Error loading moderation data:", error);
  }
}

function displayModerationTable(posts) {
  const tbody = document.getElementById("moderationTableBody");
  if (!tbody) return;

  if (posts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8">No flagged posts</td></tr>';
    return;
  }

  tbody.innerHTML = posts
    .map(
      (post) => `
    <tr>
      <td>${posts.indexOf(post) + 1}</td>
      <td><span class="badge">${post.contentType || "post"}</span></td>
      <td>${post.firstName || "Unknown"} ${post.lastName || ""}</td>
      <td style="max-width: 150px; overflow: hidden;">${post.content || "N/A"}</td>
      <td>${post.reports?.length || 0}</td>
      <td>${post.reports?.[0]?.reason || "N/A"}</td>
      <td><span class="badge" style="background: #fee2e2; color: #b91c1c;">Flagged</span></td>
      <td>
        <button class="approve-btn" onclick="approvePost('${post._id}')">Approve</button>
        <button class="reject-btn" onclick="rejectPost('${post._id}')">Reject</button>
      </td>
    </tr>
  `,
    )
    .join("");
}

function filterModeration() {
  loadModerationData();
}

async function approvePost(postId) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_BASE_URL}/api/admin/posts/${postId}/approve`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.ok) {
      alert("Post approved");
      await loadModerationData();
    }
  } catch (error) {
    console.error("Error approving:", error);
  }
}

async function rejectPost(postId) {
  try {
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE_URL}/api/admin/posts/${postId}/reject`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    alert("Post rejected and deleted");
    await loadModerationData();
  } catch (error) {
    console.error("Error rejecting:", error);
  }
}

// ==================== STATISTICS ====================
async function loadStatistics() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/admin/posts/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return;

    const posts = await response.json();

    const totalLikes = posts.reduce(
      (sum, p) => sum + (p.likes?.length || 0),
      0,
    );
    const totalComments = posts.reduce(
      (sum, p) => sum + (p.comments?.length || 0),
      0,
    );
    const totalReports = posts.reduce(
      (sum, p) => sum + (p.reports?.length || 0),
      0,
    );
    const flaggedContent = posts.filter(
      (p) => p.reports && p.reports.length > 0,
    ).length;

    document.getElementById("totalPosts").textContent = posts.length;
    document.getElementById("totalUsers").textContent = new Set(
      posts.map((p) => p.userId),
    ).size;
    document.getElementById("totalReports").textContent = totalReports;
    document.getElementById("flaggedContent").textContent = flaggedContent;
    document.getElementById("totalLikes").textContent = totalLikes;
    document.getElementById("totalComments").textContent = totalComments;

    const typeStats = {};
    posts.forEach((p) => {
      const type = p.contentType || "post";
      typeStats[type] = (typeStats[type] || 0) + 1;
    });

    const typeBody = document.getElementById("typeStatsBody");
    if (typeBody) {
      typeBody.innerHTML = Object.entries(typeStats)
        .map(
          ([type, count]) => `
        <tr>
          <td>${type}</td>
          <td>${count}</td>
          <td>${((count / posts.length) * 100).toFixed(1)}%</td>
        </tr>
      `,
        )
        .join("");
    }

    const topPosts = posts
      .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
      .slice(0, 5);
    const topBody = document.getElementById("topPostsBody");
    if (topBody) {
      topBody.innerHTML = topPosts
        .map(
          (p) => `
        <tr>
          <td>${p.firstName || "Unknown"} ${p.lastName || ""}</td>
          <td style="max-width: 150px; overflow: hidden;">${p.content || "N/A"}</td>
          <td>${p.likes?.length || 0}</td>
          <td>${p.comments?.length || 0}</td>
          <td>${new Date(p.createdAt).toLocaleDateString()}</td>
        </tr>
      `,
        )
        .join("");
    }
  } catch (error) {
    console.error("Error loading statistics:", error);
  }
}

// ==================== USERS MANAGEMENT ====================
async function loadUsers() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/admin/users/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return;

    allUsers = await response.json();
    displayUsersTable(allUsers);
  } catch (error) {
    console.error("Error loading users:", error);
  }
}

function displayUsersTable(users) {
  const tbody = document.getElementById("usersTableBody");
  if (!tbody) return;

  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7">No users found</td></tr>';
    return;
  }

  tbody.innerHTML = users
    .map((user, index) => {
      const warnings = user.warnings || 0;
      const violations = user.violations || 0;
      let status = "active";
      if (user.isBanned) status = "banned";
      else if (warnings > 0) status = "warned";

      return `
      <tr>
        <td>${index + 1}</td>
        <td>${user.firstName || ""} ${user.lastName || ""}</td>
        <td>${user.department || "N/A"}</td>
        <td><span class="badge">${status}</span></td>
        <td>${warnings}</td>
        <td>${violations}</td>
        <td>
          <button class="warn-btn" onclick="openSuspendModal('${user._id}', '${user.firstName} ${user.lastName}')">Manage</button>
        </td>
      </tr>
    `;
    })
    .join("");
}

function openSuspendModal(userId, userName) {
  document.getElementById("suspendUserName").textContent = userName;
  document.getElementById("suspendUserModal").dataset.userId = userId;
  document.getElementById("suspendUserModal").style.display = "flex";
}

function closeSuspendModal() {
  document.getElementById("suspendUserModal").style.display = "none";
}

async function submitSuspend() {
  const modal = document.getElementById("suspendUserModal");
  const userId = modal.dataset.userId;
  const action = document.getElementById("suspendAction").value;
  const reason = document.getElementById("suspendReason").value;

  if (!reason.trim()) {
    alert("Please provide a reason");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const endpoint = action === "ban" ? "ban" : "warn";

    const response = await fetch(
      `${API_BASE_URL}/api/admin/users/${userId}/${endpoint}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      },
    );

    if (response.ok) {
      alert(`User ${action === "ban" ? "banned" : "warned"} successfully`);
      closeSuspendModal();
      await loadUsers();
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error completing action");
  }
}

// ==================== MEDIA MANAGEMENT ====================
async function loadMediaData() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/admin/posts/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return;

    const posts = await response.json();
    const media = posts.filter((p) => p.image || p.video);

    const grid = document.getElementById("mediaGrid");
    if (!grid) return;

    if (media.length === 0) {
      grid.innerHTML =
        '<div style="text-align: center; width: 100%;">No media found</div>';
      return;
    }

    grid.innerHTML = media
      .map(
        (m) => `
      <div class="media-item">
        ${m.image ? `<img src="${m.image}" alt="media">` : `<video controls><source src="${m.video}"></video>`}
        <button class="media-delete-btn" onclick="deleteMedia('${m._id}')">✖</button>
        <div class="media-item-info">${(m.firstName + " " + m.lastName).substring(0, 15)}</div>
      </div>
    `,
      )
      .join("");
  } catch (error) {
    console.error("Error loading media:", error);
  }
}

async function deleteMedia(postId) {
  if (confirm("Delete this media?")) {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      await loadMediaData();
    } catch (error) {
      console.error("Error deleting media:", error);
    }
  }
}

// ==================== ACTIVITY LOG ====================
async function loadActivityLog() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/admin/activitylog/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const tbody = document.getElementById("activityTableBody");
      if (tbody)
        tbody.innerHTML =
          '<tr><td colspan="5">Activity log not available</td></tr>';
      return;
    }

    const logs = await response.json();
    displayActivityLog(logs);
  } catch (error) {
    console.error("Error loading activity log:", error);
  }
}

function displayActivityLog(logs) {
  const tbody = document.getElementById("activityTableBody");
  if (!tbody) return;

  if (logs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">No activity logs</td></tr>';
    return;
  }

  tbody.innerHTML = logs
    .slice(0, 50)
    .map(
      (log) => `
    <tr>
      <td>${new Date(log.createdAt).toLocaleString()}</td>
      <td>${log.userId || "System"}</td>
      <td><span class="badge">${log.action || "unknown"}</span></td>
      <td>${log.contentType || "N/A"}</td>
      <td style="max-width: 200px; overflow: hidden;">${log.details || "N/A"}</td>
    </tr>
  `,
    )
    .join("");
}

// ==================== QUICK STATS UPDATE ====================
async function updateQuickStats() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/admin/posts/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return;

    const posts = await response.json();
    const today = new Date().toDateString();
    const todayPosts = posts.filter(
      (p) => new Date(p.createdAt).toDateString() === today,
    );
    const reports = posts.reduce((sum, p) => sum + (p.reports?.length || 0), 0);
    const flagged = posts.filter(
      (p) => p.reports && p.reports.length > 0,
    ).length;

    const todayEl = document.getElementById("todayPosts");
    const reportsEl = document.getElementById("newReports");
    const pendingEl = document.getElementById("pendingMod");
    const usersEl = document.getElementById("usersOnline");

    if (todayEl) todayEl.textContent = todayPosts.length;
    if (reportsEl) reportsEl.textContent = reports;
    if (pendingEl) pendingEl.textContent = flagged;
    if (usersEl) usersEl.textContent = new Set(allUsers.map((u) => u._id)).size;
  } catch (error) {
    console.error("Error updating quick stats:", error);
  }
}

function closeViewModal() {
  document.getElementById("viewPostModal").style.display = "none";
}

// ======================================================
// LOAD POSTS + REPORT SUMMARY
// ======================================================
async function loadAllPosts() {
  const tbody = document.getElementById("postTableBody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="8">Loading posts...</td></tr>`;

  try {
    const postReqs = await Promise.all([
      fetch(`${API_BASE}/api/homeposts`, { headers: adminHeaders() }),
      fetch(`${API_BASE}/api/birthdays`, { headers: adminHeaders() }),
      fetch(`${API_BASE}/api/announcements`, { headers: adminHeaders() }),
      fetch(`${API_BASE}/api/news`, { headers: adminHeaders() }),
      fetch(`${API_BASE}/api/lostfound`, { headers: adminHeaders() }),
    ]);

    const [home, birthdays, announcements, news, lostfound] = await Promise.all(
      postReqs.map((r) => r.json()),
    );

    // Load report summary
    const reportRes = await fetch(`${API_BASE}/api/admin/reports/summary`, {
      headers: adminHeaders(),
    });
    const reportData = await reportRes.json();

    reportMap = {};
    reportData.forEach((r) => {
      reportMap[`${r.postType}_${r.postId}`] = r;
    });

    allPosts = [
      ...home.map((p) => normalizePost(p, "homepost")),
      ...birthdays.map((p) => normalizePost(p, "birthday")),
      ...announcements.map((p) => normalizePost(p, "announcement")),
      ...news.map((p) => normalizePost(p, "news")),
      ...lostfound.map((p) => normalizePost(p, "lostfound")),
    ];

    allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    renderPosts(allPosts);
  } catch (err) {
    console.error("loadAllPosts error:", err);
    tbody.innerHTML = `<tr><td colspan="8">Failed to load posts.</td></tr>`;
  }
}

// ======================================================
// NORMALIZE POST DATA (DATA ONLY)
// ======================================================
function normalizePost(p, type) {
  const user = p.user || p.createdBy || p.recipient || {};
  const reportKey = `${type}_${p._id}`;
  const reportInfo = reportMap[reportKey];

  let contentText = "";
  switch (type) {
    case "homepost":
      contentText = p.content || "";
      break;
    case "birthday":
      contentText = p.message || "";
      break;
    case "announcement":
    case "news":
      contentText = `${p.title || ""} – ${p.content || ""}`;
      break;
    case "lostfound":
      contentText = `${p.title || ""} – ${p.description || ""}`;
      break;
  }

  return {
    _id: p._id,
    postType: type,
    username: user.username || "unknown",
    fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    department: (user.department || "").toUpperCase(),
    contentText,
    hidden: !!p.hidden,
    createdAt: p.createdAt || new Date().toISOString(),
    reportCount: reportInfo ? reportInfo.count : 0,
    reporters: reportInfo ? reportInfo.users : [],
  };
}

// ======================================================
// RENDER TABLE
// ======================================================
function renderPosts(posts) {
  const tbody = document.getElementById("postTableBody");
  if (!tbody) return;

  if (!posts.length) {
    tbody.innerHTML = `<tr><td colspan="9">No posts found.</td></tr>`;
    return;
  }

  tbody.innerHTML = posts
    .map(
      (p, i) => `
    <tr>
      <td>${i + 1}</td>

      <td>${p.postType.toUpperCase()}</td>

      <td>
        <strong>${p.fullName || "(No name)"}</strong>
        <div class="user-username">@${p.username}</div>
      </td>

      <td>${p.department || "N/A"}</td>

      <td>
        <button class="btn-small btn-view"
                data-id="${p._id}" data-type="${p.postType}">
          View Post
        </button>
      </td>

      <td>${new Date(p.createdAt).toLocaleString()}</td>

      <td>
        <button class="btn-small btn-toggle-hide"
          data-id="${p._id}" data-type="${p.postType}"
          data-hidden="${p.hidden}">
          ${p.hidden ? "Unhide" : "Hide"}
        </button>

        <button class="btn-small btn-delete"
          data-id="${p._id}" data-type="${p.postType}">
          Delete
        </button>
      </td>

      <!-- ✅ REPORTS COLUMN -->
      <td>
        ${
          p.reportCount > 0
            ? `<button class="btn-small btn-report"
                        data-id="${p._id}"
                        data-type="${p.postType}">
                 ${p.reportCount}
               </button>`
            : `<span class="muted">0</span>`
        }
      </td>
    </tr>
  `,
    )
    .join("");

  attachActionHandlers();
  attachReportHandlers();
}
function attachReportHandlers() {
  document.querySelectorAll(".btn-report").forEach((btn) => {
    btn.onclick = () => {
      const key = `${btn.dataset.type}_${btn.dataset.id}`;
      const report = reportMap[key];

      if (!report || !report.users?.length) {
        alert("No report details found.");
        return;
      }

      const listHTML = report.users
        .map(
          (u) => `
        <li>
          <strong>${u.firstName} ${u.lastName}</strong><br>
          @${u.username}<br>
          <small>${u.email}</small>
        </li>
      `,
        )
        .join("");

      document.getElementById("reportList").innerHTML = listHTML;
      document.getElementById("reportModal").style.display = "flex";
    };
  });
}

// ======================================================
// ACTION HANDLERS
// ======================================================
function attachActionHandlers() {
  document.querySelectorAll(".btn-view").forEach((btn) => {
    btn.onclick = () => openViewPost(btn.dataset.id, btn.dataset.type);
  });

  document.querySelectorAll(".btn-toggle-hide").forEach((btn) => {
    btn.onclick = async () => {
      const hidden = btn.dataset.hidden === "true";
      await handleHideToggle(btn.dataset.id, btn.dataset.type, !hidden);
    };
  });

  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.onclick = () => handleDeletePost(btn.dataset.id, btn.dataset.type);
  });
}

// ======================================================
// HIDE / UNHIDE
// ======================================================
async function handleHideToggle(id, type, hide) {
  const action = hide ? "hide" : "unhide";
  await fetch(`${API_BASE}/api/admin/${action}/${type}/${id}`, {
    method: "PUT",
    headers: adminHeaders(),
  });
  loadAllPosts();
}
function closeViewModal() {
  document.getElementById("viewPostModal").style.display = "none";
}

// ======================================================
// DELETE
// ======================================================
async function handleDeletePost(id, type) {
  if (!confirm("Delete this post permanently?")) return;
  await fetch(`${API_BASE}/api/admin/delete/${type}/${id}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
  loadAllPosts();
}

// ======================================================
// VIEW POST MODAL (UNCHANGED LOGIC)
// ======================================================
// ======================================================
// VIEW POST MODAL — FULL HOMEFEED STYLE (RESTORED)
// ======================================================
// ======================================================
// VIEW POST — USE HOMEPAGE RENDERER (FIXED)
// ======================================================
async function openViewPost(id, type) {
  const endpointMap = {
    homepost: "homeposts",
    birthday: "birthdays",
    announcement: "announcements",
    news: "news",
    lostfound: "lostfound",
  };

  const endpoint = endpointMap[type];
  if (!endpoint) {
    alert("Unsupported post type");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/${endpoint}/${id}`, {
      headers: adminHeaders(),
    });

    const post = await res.json();
    if (!res.ok) throw new Error("Failed to load post");

    // 🔑 CRITICAL FIXES
    post.type = type; // so renderPostHTML switch works
    post.inModal = true; // disable homepage click overlays

    // Render EXACT homepage post
    const html = renderPostHTML(post);

    const modal = document.getElementById("viewPostModal");
    const content = document.getElementById("modalContent");

    content.innerHTML = html;
    modal.style.display = "flex";

    // Close modal when clicking outside post
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
        modal.onclick = null;
      }
    };
  } catch (err) {
    console.error("View post error:", err);
    alert("Unable to render post");
  }
}

// ======================================================
// FILTERS
// ======================================================
function setupFilters() {
  ["filterType", "filterDept", "filterSearch"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", applyFilters);
  });
}

function applyFilters() {
  const type = filterType.value;
  const dept = filterDept.value.toLowerCase();
  const search = filterSearch.value.toLowerCase();

  renderPosts(
    allPosts.filter((p) => {
      if (type !== "all" && p.postType !== type) return false;
      if (dept !== "all" && p.department.toLowerCase() !== dept) return false;
      return (
        !search ||
        `${p.username} ${p.fullName} ${p.contentText}`
          .toLowerCase()
          .includes(search)
      );
    }),
  );
}

// ======================================================
// LOGOUT + HOME
// ======================================================
function setupLogoutButton() {
  document
    .getElementById("adminLogoutBtn")
    ?.addEventListener("click", adminLogout);
}

function setupGoHomeButton() {
  document.getElementById("goToHome")?.addEventListener("click", () => {
    window.location.href = "../../Webpage/Homepage/Homepage.html";
  });
}
