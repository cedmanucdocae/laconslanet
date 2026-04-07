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
      // Remove active class from all buttons and tabs
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((t) => t.classList.remove("active"));

      // Add active class to clicked button and corresponding tab
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
  document.getElementById("filterType").addEventListener("change", filterPosts);
  document.getElementById("filterDept").addEventListener("change", filterPosts);
  document
    .getElementById("filterStatus")
    .addEventListener("change", filterPosts);
  document
    .getElementById("filterSearch")
    .addEventListener("input", filterPosts);

  // Checkbox listeners
  document.getElementById("selectAllPosts").addEventListener("change", (e) => {
    const checkboxes = document.querySelectorAll(".post-checkbox");
    checkboxes.forEach((cb) => (cb.checked = e.target.checked));
    updateSelectedCount();
  });

  // Bulk delete
  document
    .getElementById("bulkDeleteBtn")
    .addEventListener("click", bulkDeletePosts);

  // Moderation filters
  document
    .getElementById("moderationFilter")
    .addEventListener("change", filterModeration);
  document
    .getElementById("moderationSearch")
    .addEventListener("input", filterModeration);

  // Users filter
  document
    .getElementById("userStatusFilter")
    .addEventListener("change", filterUsers);
  document.getElementById("userSearch").addEventListener("input", filterUsers);

  // Activity filter
  document
    .getElementById("activityFilter")
    .addEventListener("change", filterActivity);
  document
    .getElementById("activitySearch")
    .addEventListener("input", filterActivity);

  // Sidebar navigation
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.addEventListener("click", () => {
      const link = item.dataset.link;
      if (link) window.location.href = link;
    });
  });

  document.getElementById("goToHome").addEventListener("click", () => {
    window.location.href = "../../index.html";
  });

  document.getElementById("adminLogoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "../../Login/index.html";
  });
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
    const response = await fetch(`${API_BASE_URL}/api/posts/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Failed to load posts");

    allPosts = await response.json();
    displayPosts(allPosts);
    updateQuickStats();
  } catch (error) {
    console.error("Error loading posts:", error);
    document.getElementById("postTableBody").innerHTML =
      '<tr><td colspan="10">Error loading posts</td></tr>';
  }
}

function displayPosts(posts) {
  const tbody = document.getElementById("postTableBody");

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
      <td>${post.firstName} ${post.lastName}</td>
      <td>${post.department || "N/A"}</td>
      <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${post.content || "N/A"}</td>
      <td>${new Date(post.createdAt).toLocaleDateString()}</td>
      <td>${post.likes?.length || 0}</td>
      <td>
        <div class="action-btn-group">
          <button class="action-btn view-btn" onclick="viewPostDetail('${post._id}')">View</button>
          <button class="action-btn hide-btn" onclick="togglePostVisibility('${post._id}')">Hide</button>
          <button class="action-btn delete-small-btn" onclick="deletePost('${post._id}')">Delete</button>
        </div>
      </td>
      <td>${post.reports?.length || 0}</td>
    </tr>
  `,
    )
    .join("");

  // Add checkbox listeners
  document.querySelectorAll(".post-checkbox").forEach((cb) => {
    cb.addEventListener("change", updateSelectedCount);
  });
}

function filterPosts() {
  const type = document.getElementById("filterType").value;
  const dept = document.getElementById("filterDept").value;
  const status = document.getElementById("filterStatus").value;
  const search = document.getElementById("filterSearch").value.toLowerCase();

  let filtered = allPosts.filter((p) => {
    let match = true;

    if (type !== "all") match = match && p.contentType === type;
    if (dept !== "all") match = match && p.department === dept;
    if (search)
      match =
        match &&
        ((p.firstName + " " + p.lastName).toLowerCase().includes(search) ||
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
      <p><strong>User:</strong> ${post.firstName} ${post.lastName}</p>
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

async function togglePostVisibility(postId) {
  alert("Toggle visibility feature coming soon");
}

function updateSelectedCount() {
  const checked = document.querySelectorAll(".post-checkbox:checked").length;
  selectedPostIds = Array.from(
    document.querySelectorAll(".post-checkbox:checked"),
  ).map((cb) => cb.value);

  const btn = document.getElementById("bulkDeleteBtn");
  const count = document.getElementById("selectedCount");

  if (checked > 0) {
    btn.style.display = "block";
    count.textContent = checked;
  } else {
    btn.style.display = "none";
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
    const response = await fetch(`${API_BASE_URL}/api/posts/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Failed to load moderation data");

    const posts = await response.json();
    const flagged = posts.filter((p) => p.reports && p.reports.length > 0);
    displayModerationTable(flagged);
  } catch (error) {
    console.error("Error loading moderation data:", error);
  }
}

function displayModerationTable(posts) {
  const tbody = document.getElementById("moderationTableBody");

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
      <td>${post.firstName} ${post.lastName}</td>
      <td style="max-width: 150px; overflow: hidden;">${post.content || "N/A"}</td>
      <td>${post.reports?.length || 0}</td>
      <td>${post.reports?.[0]?.reason || "N/A"}</td>
      <td><span class="badge badge-flagged">Flagged</span></td>
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
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "approved", reports: [] }),
    });

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
    await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
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
    const response = await fetch(`${API_BASE_URL}/api/posts/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Failed to load stats");

    const posts = await response.json();

    // Calculate stats
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

    // Posts by type
    const typeStats = {};
    posts.forEach((p) => {
      const type = p.contentType || "post";
      typeStats[type] = (typeStats[type] || 0) + 1;
    });

    const typeBody = document.getElementById("typeStatsBody");
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

    // Top posts
    const topPosts = posts
      .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
      .slice(0, 5);
    const topBody = document.getElementById("topPostsBody");
    topBody.innerHTML = topPosts
      .map(
        (p) => `
      <tr>
        <td>${p.firstName} ${p.lastName}</td>
        <td style="max-width: 150px; overflow: hidden;">${p.content || "N/A"}</td>
        <td>${p.likes?.length || 0}</td>
        <td>${p.comments?.length || 0}</td>
        <td>${new Date(p.createdAt).toLocaleDateString()}</td>
      </tr>
    `,
      )
      .join("");
  } catch (error) {
    console.error("Error loading statistics:", error);
  }
}

// ==================== USERS MANAGEMENT ====================
async function loadUsers() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/users/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Failed to load users");

    allUsers = await response.json();
    displayUsersTable(allUsers);
  } catch (error) {
    console.error("Error loading users:", error);
    document.getElementById("usersTableBody").innerHTML =
      '<tr><td colspan="7">Error loading users</td></tr>';
  }
}

function displayUsersTable(users) {
  const tbody = document.getElementById("usersTableBody");

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
        <td>${user.firstName} ${user.lastName}</td>
        <td>${user.department || "N/A"}</td>
        <td><span class="badge badge-${status}">${status}</span></td>
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

function filterUsers() {
  const status = document.getElementById("userStatusFilter").value;
  const search = document.getElementById("userSearch").value.toLowerCase();

  let filtered = allUsers.filter((u) => {
    let match = true;

    if (status === "warned") match = match && u.warnings > 0 && !u.isBanned;
    if (status === "banned") match = match && u.isBanned;

    if (search)
      match =
        match &&
        ((u.firstName + " " + u.lastName).toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search));

    return match;
  });

  displayUsersTable(filtered);
}

function openSuspendModal(userId, userName) {
  document.getElementById("suspendUserName").textContent = userName;
  document.getElementById("suspendModal").dataset.userId = userId;
  document.getElementById("suspendUserModal").style.display = "flex";
}

function closeSuspendModal() {
  document.getElementById("suspendUserModal").style.display = "none";
}

async function submitSuspend() {
  const userId = document.getElementById("suspendUserModal").dataset.userId;
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
      `${API_BASE_URL}/api/users/${userId}/${endpoint}`,
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
    alert("Erro completing action");
  }
}

// ==================== MEDIA MANAGEMENT ====================
async function loadMediaData() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/posts/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Failed to load media");

    const posts = await response.json();
    const media = posts.filter((p) => p.image || p.video);

    const grid = document.getElementById("mediaGrid");

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
    const response = await fetch(`${API_BASE_URL}/api/activitylog/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      document.getElementById("activityTableBody").innerHTML =
        '<tr><td colspan="5">Activity log not available</td></tr>';
      return;
    }

    const logs = await response.json();
    displayActivityLog(logs);
  } catch (error) {
    console.error("Error loading activity log:", error);
    document.getElementById("activityTableBody").innerHTML =
      '<tr><td colspan="5">Error loading activity log</td></tr>';
  }
}

function displayActivityLog(logs) {
  const tbody = document.getElementById("activityTableBody");

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

function filterActivity() {
  loadActivityLog();
}

// ==================== QUICK STATS UPDATE ====================
async function updateQuickStats() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/posts/all`, {
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

    document.getElementById("todayPosts").textContent = todayPosts.length;
    document.getElementById("newReports").textContent = reports;
    document.getElementById("pendingMod").textContent = flagged;
    document.getElementById("usersOnline").textContent = new Set(
      allUsers.map((u) => u._id),
    ).size;
  } catch (error) {
    console.error("Error updating quick stats:", error);
  }
}

function closeViewModal() {
  document.getElementById("viewPostModal").style.display = "none";
}
