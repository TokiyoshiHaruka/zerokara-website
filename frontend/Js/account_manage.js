// Js/account_manage.js
(function () {
  const TOKEN_KEY = "zero_token";
  const LOGIN_PAGE = "login.html";

  function log(...args) {
    console.log("[ZERO-ADMIN-USER]", ...args);
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || "";
  }

  // 通用 API 请求
  async function apiRequest(path, options = {}) {
    const token = getToken();
    if (!token) {
      window.location.href = LOGIN_PAGE;
      return;
    }

    const headers = Object.assign(
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      options.headers || {}
    );

    const res = await fetch(path, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    log("API", options.method || "GET", path, "→", res.status);

    if (res.status === 401) {
      alert("登录状态已过期，请重新登录。");
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = LOGIN_PAGE;
      return;
    }

    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const data = await res.json();
        if (data && data.error) msg = data.error;
      } catch {}
      throw new Error(msg);
    }

    return res.json();
  }

  // 用户列表
  async function loadUserList() {
    try {
      log("读取用户列表...");
      // ★ 修复路径：去掉 /api
      const data = await apiRequest("/admin-users");

      const items = data.items || data.users || [];
      renderUserTable(items);
    } catch (err) {
      console.error("[USER] loadUserList error", err);
      alert("用户列表读取失败：" + err.message);
    }
  }

  function renderUserTable(items) {
    const tbody = document.querySelector("#user-table tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!items.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.textContent = "没有用户。";
      td.colSpan = 4;
      td.style.textAlign = "center";
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    items.forEach((user) => {
      const tr = document.createElement("tr");

      const tdId = document.createElement("td");
      tdId.textContent = user.username;

      const tdRole = document.createElement("td");
      tdRole.textContent = user.role === "admin" ? "管理者" : "一般";

      const tdActions = document.createElement("td");

      const btnEdit = document.createElement("button");
      btnEdit.className = "admin-table-btn";
      btnEdit.textContent = "编辑";
      btnEdit.onclick = () => {
        document.getElementById("user-id-input").value = user.username;
        document.getElementById("user-role-input").value = user.role;
        document.getElementById("user-password-input").value = "";
      };

      const btnDelete = document.createElement("button");
      btnDelete.className = "admin-table-btn danger";
      btnDelete.textContent = "删除";
      btnDelete.onclick = async () => {
        if (!confirm("确定删除这个用户？")) return;

        try {
          // ★ 修复路径
          const data = await apiRequest(`/admin-users/${user.username}`, {
            method: "DELETE",
          });
          const items = data.items || data.users || [];
          renderUserTable(items);
        } catch (err) {
          alert("删除失败：" + err.message);
        }
      };

      tdActions.appendChild(btnEdit);
      tdActions.appendChild(btnDelete);

      tr.appendChild(tdId);
      tr.appendChild(tdRole);
      tr.appendChild(tdActions);

      tbody.appendChild(tr);
    });
  }

  function setupUserForm() {
    const btn = document.getElementById("user-add-btn");
    if (!btn) return;

    btn.onclick = async () => {
      const username = document.getElementById("user-id-input").value.trim();
      const role = document.getElementById("user-role-input").value;
      const password = document
        .getElementById("user-password-input")
        .value.trim();

      if (!username || !role) {
        alert("用户ID 和 权限 必填。");
        return;
      }

      try {
        // ★ 修复路径
        const data = await apiRequest("/admin-users", {
          method: "POST",
          body: { username, role, password },
        });

        alert("保存成功。");
        const items = data.items || data.users || [];
        renderUserTable(items);
      } catch (err) {
        alert("保存失败：" + err.message);
      }
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    log("account_manage.js Loaded");
    loadUserList();
    setupUserForm();
  });
})();
