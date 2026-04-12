window.ZeroAdminCopy = {
  ja: {
    shell: {
      note: "ZERO の管理機能をここに集約し、公開ページ・活動・日程・ユーザー・クラウド導線を一括で管理します。",
      language: "言語",
      logout: "ログアウト",
      back: "公開ページへ戻る"
    },
    nav: {
      dashboard: "ダッシュボード",
      bugs: "BUG管理",
      schedules: "日程管理",
      activities: "活動管理",
      users: "ユーザー管理",
      cloud: "Nextcloud"
    },
    common: {
      loading: "読み込み中...",
      noData: "まだデータがありません。",
      refresh: "更新",
      create: "新規追加",
      edit: "編集",
      delete: "削除",
      save: "保存",
      cancel: "キャンセル",
      close: "閉じる",
      open: "開く",
      actions: "操作",
      copyLink: "リンクをコピー",
      copied: "リンクをコピーしました。",
      saveSuccess: "保存しました。",
      deleteSuccess: "削除しました。",
      saveFailed: "保存に失敗しました。",
      deleteFailed: "削除に失敗しました。",
      authExpired: "認証が切れました。再度ログインしてください。",
      confirmDelete: "この項目を削除しますか？"
    },
    pages: {
      dashboard: { eyebrow: "Control Center", title: "ZERO 管理ダッシュボード", lead: "公開サイトと接続された管理データをここから確認し、各モジュールへ直接移動できます。" },
      bugs: { eyebrow: "Bug Manager", title: "BUG 管理", lead: "前台から届いた報告を一覧表示し、状態・担当・進捗メモを更新できます。" },
      schedules: { eyebrow: "Schedule Manager", title: "日程管理", lead: "公開予定表と接続されたイベントを追加・編集・削除できます。" },
      activities: { eyebrow: "Activity Manager", title: "活動管理", lead: "公開フロントに接続された活動データを三言語と Markdown で管理します。" },
      users: { eyebrow: "User Manager", title: "ユーザー管理", lead: "管理ユーザーと一般メンバーの追加・編集・削除、表示名変更、パスワード更新に対応します。" },
      cloud: { eyebrow: "Cloud Gateway", title: "Nextcloud 接続", lead: "ZERO の Nextcloud へ素早く移動し、共有ファイルの管理導線をまとめます。" }
    },
    dashboard: {
      summaryTitle: "概要",
      quickTitle: "クイックアクセス",
      recentBugs: "最新 BUG",
      recentSchedules: "今後の日程",
      recentLogs: "最近のログ",
      topPaths: "アクセス上位ページ",
      cardLabels: { bugs: "BUG総数", pending: "未対応 BUG", activities: "公開活動", schedules: "今後の日程", users: "ユーザー数", visits: "本日の訪問" }
    },
    bugs: {
      stats: { total: "総数", pending: "未対応", fixing: "修正中", fixed: "修正済み", p0: "P0" },
      filters: { project: "対象", severity: "優先度", status: "状態", allProjects: "すべての対象", allSeverity: "すべての優先度", allStatus: "すべての状態" },
      table: { id: "ID", title: "タイトル", project: "対象", severity: "優先度", status: "状態", reporter: "報告者", handler: "担当", progress: "進捗", updated: "更新日", source: "来源", actions: "操作" },
      sourceLocal: "ローカル",
      sourceServer: "サーバー",
      modalTitle: "BUG を編集",
      fields: { project: "対象", bugId: "BUG ID", title: "タイトル", severity: "優先度", status: "状態", reporter: "報告者", handler: "担当", solution: "修復進捗 / メモ" },
      status: { Pending: "未対応", Confirmed: "確認済み", Fixing: "修正中", Fixed: "修正済み", Deferred: "保留", Duplicate: "重複" }
    },
    schedules: {
      summary: { total: "登録件数", upcoming: "今後の日程" },
      table: { date: "日付", time: "時間", title: "タイトル", category: "分類", detail: "詳細", updated: "更新日", actions: "操作" },
      fields: { date: "日付", time: "時間", title: "タイトル", detail: "詳細", category: "分類" },
      newButton: "日程を追加",
      modalCreate: "日程を追加",
      modalEdit: "日程を編集",
      categories: { meeting: "打ち合わせ", event: "イベント", other: "その他" }
    },
    activities: {
      summary: { total: "総件数", published: "公開中" },
      table: { slug: "Slug", title: "タイトル", status: "状態", sortOrder: "並び順", updated: "更新日", actions: "操作" },
      fields: { slug: "Slug", coverImage: "カバー画像 URL", status: "状態", sortOrder: "並び順", title: "タイトル", summary: "概要", body: "本文 (Markdown)" },
      locale: { ja: "日本語", zh: "繁體中文", en: "English" },
      status: { draft: "下書き", published: "公開" },
      newButton: "活動を追加",
      modalCreate: "活動を追加",
      modalEdit: "活動を編集",
      preview: "Markdown Preview"
    },
    users: {
      summary: { total: "総ユーザー", admins: "管理者" },
      table: { id: "ID", username: "ユーザー名", displayName: "表示名", role: "役割", createdAt: "作成日", actions: "操作" },
      fields: { username: "ユーザー名", displayName: "表示名", role: "役割", password: "パスワード" },
      roles: { admin: "管理者", member: "メンバー" },
      newButton: "ユーザーを追加",
      modalCreate: "ユーザーを追加",
      modalEdit: "ユーザーを編集",
      passwordHintCreate: "新規作成では必須です。",
      passwordHintEdit: "変更する時だけ入力してください。"
    },
    cloud: {
      titleA: "Nextcloud 接続",
      bodyA: "ZERO の共有クラウドへ移動し、資料・アップロード・共同作業ファイルを管理できます。",
      titleB: "接続先 URL",
      bodyB: "本番 URL をそのまま開きます。ログイン状態は Nextcloud 側の認証に従います。",
      noteAuth: "認証方式は Nextcloud 側の設定を優先してください。",
      noteAcl: "共有範囲や権限管理も Nextcloud 側で運用してください。"
    }
  },
  "zh-TW": {
    shell: {
      note: "ZERO 的後台管理功能集中在這裡，能夠統一管理公開站、活動、行程、使用者與雲端入口。",
      language: "語言",
      logout: "登出",
      back: "返回前台"
    },
    nav: {
      dashboard: "儀表板",
      bugs: "BUG 管理",
      schedules: "行程管理",
      activities: "活動管理",
      users: "使用者管理",
      cloud: "Nextcloud"
    },
    common: {
      loading: "載入中...",
      noData: "目前沒有資料。",
      refresh: "重新整理",
      create: "新增",
      edit: "編輯",
      delete: "刪除",
      save: "儲存",
      cancel: "取消",
      close: "關閉",
      open: "開啟",
      actions: "操作",
      copyLink: "複製連結",
      copied: "連結已複製。",
      saveSuccess: "已儲存。",
      deleteSuccess: "已刪除。",
      saveFailed: "儲存失敗。",
      deleteFailed: "刪除失敗。",
      authExpired: "登入已失效，請重新登入。",
      confirmDelete: "確定要刪除這筆資料嗎？"
    },
    pages: {
      dashboard: { eyebrow: "Control Center", title: "ZERO 後台儀表板", lead: "在這裡查看與前台連動的統計、紀錄與管理入口，快速切換到各個模組。" },
      bugs: { eyebrow: "Bug Manager", title: "BUG 管理", lead: "把前台送出的 BUG 回報集中列表，並可更新狀態、負責人與修復進度。" },
      schedules: { eyebrow: "Schedule Manager", title: "行程管理", lead: "新增、修改、刪除公開行程表對應的活動與日期。" },
      activities: { eyebrow: "Activity Manager", title: "活動管理", lead: "管理會顯示到前台的活動資料，支援三語與 Markdown 內容。" },
      users: { eyebrow: "User Manager", title: "使用者管理", lead: "管理帳號列表、顯示名稱、角色與密碼，支援新增與刪除。" },
      cloud: { eyebrow: "Cloud Gateway", title: "Nextcloud 入口", lead: "集中管理 Nextcloud 雲端入口，快速跳轉到共享檔案空間。" }
    },
    dashboard: {
      summaryTitle: "總覽",
      quickTitle: "快速入口",
      recentBugs: "最新 BUG",
      recentSchedules: "近期行程",
      recentLogs: "最近日誌",
      topPaths: "熱門頁面",
      cardLabels: { bugs: "BUG 總數", pending: "待處理 BUG", activities: "已公開活動", schedules: "即將到來行程", users: "使用者數", visits: "今日訪問" }
    },
    bugs: {
      stats: { total: "總數", pending: "待處理", fixing: "修復中", fixed: "已修復", p0: "P0" },
      filters: { project: "專案", severity: "優先級", status: "狀態", allProjects: "所有專案", allSeverity: "所有優先級", allStatus: "所有狀態" },
      table: { id: "ID", title: "標題", project: "專案", severity: "優先級", status: "狀態", reporter: "回報人", handler: "處理人", progress: "修復進度", updated: "更新日", source: "來源", actions: "操作" },
      sourceLocal: "本機",
      sourceServer: "伺服器",
      modalTitle: "編輯 BUG",
      fields: { project: "專案", bugId: "BUG ID", title: "標題", severity: "優先級", status: "狀態", reporter: "回報人", handler: "處理人", solution: "修復進度 / 備註" },
      status: { Pending: "待處理", Confirmed: "已確認", Fixing: "修復中", Fixed: "已修復", Deferred: "暫緩", Duplicate: "重複" }
    },
    schedules: {
      summary: { total: "總筆數", upcoming: "即將到來" },
      table: { date: "日期", time: "時間", title: "標題", category: "分類", detail: "詳細", updated: "更新日", actions: "操作" },
      fields: { date: "日期", time: "時間", title: "標題", detail: "詳細說明", category: "分類" },
      newButton: "新增行程",
      modalCreate: "新增行程",
      modalEdit: "編輯行程",
      categories: { meeting: "會議", event: "活動", other: "其他" }
    },
    activities: {
      summary: { total: "總數", published: "已公開" },
      table: { slug: "Slug", title: "標題", status: "狀態", sortOrder: "排序", updated: "更新日", actions: "操作" },
      fields: { slug: "Slug", coverImage: "封面圖片 URL", status: "狀態", sortOrder: "排序", title: "標題", summary: "摘要", body: "本文 (Markdown)" },
      locale: { ja: "日文", zh: "繁中", en: "英文" },
      status: { draft: "草稿", published: "公開" },
      newButton: "新增活動",
      modalCreate: "新增活動",
      modalEdit: "編輯活動",
      preview: "Markdown 預覽"
    },
    users: {
      summary: { total: "使用者總數", admins: "管理者" },
      table: { id: "ID", username: "帳號", displayName: "顯示名稱", role: "角色", createdAt: "建立時間", actions: "操作" },
      fields: { username: "帳號", displayName: "顯示名稱", role: "角色", password: "密碼" },
      roles: { admin: "管理者", member: "成員" },
      newButton: "新增使用者",
      modalCreate: "新增使用者",
      modalEdit: "編輯使用者",
      passwordHintCreate: "新增時必填。",
      passwordHintEdit: "只有要變更密碼時才填寫。"
    },
    cloud: {
      titleA: "Nextcloud 雲端入口",
      bodyA: "可直接跳轉到 ZERO 的共享雲端空間，管理檔案、資料夾與共用資源。",
      titleB: "連線位置",
      bodyB: "會直接開啟正式的 Nextcloud 網址，登入狀態由 Nextcloud 自身維護。",
      noteAuth: "登入方式請以 Nextcloud 本身的驗證設定為準。",
      noteAcl: "分享範圍與權限管理也應在 Nextcloud 端維護。"
    }
  },
  en: {
    shell: {
      note: "This backend consolidates the operational tools for the public site, activities, schedules, users, and cloud access in one place.",
      language: "Language",
      logout: "Logout",
      back: "Back to Site"
    },
    nav: {
      dashboard: "Dashboard",
      bugs: "Bug Manager",
      schedules: "Schedule Manager",
      activities: "Activity Manager",
      users: "User Manager",
      cloud: "Nextcloud"
    },
    common: {
      loading: "Loading...",
      noData: "No data available.",
      refresh: "Refresh",
      create: "Create",
      edit: "Edit",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      open: "Open",
      actions: "Actions",
      copyLink: "Copy Link",
      copied: "Link copied.",
      saveSuccess: "Saved successfully.",
      deleteSuccess: "Deleted successfully.",
      saveFailed: "Failed to save.",
      deleteFailed: "Failed to delete.",
      authExpired: "Authentication expired. Please log in again.",
      confirmDelete: "Delete this item?"
    },
    pages: {
      dashboard: { eyebrow: "Control Center", title: "ZERO Admin Dashboard", lead: "Review connected site data, recent activity, and direct entry points into each admin module." },
      bugs: { eyebrow: "Bug Manager", title: "Bug Management", lead: "List reports from the public site and update status, owner, and progress notes from one place." },
      schedules: { eyebrow: "Schedule Manager", title: "Schedule Management", lead: "Create, update, and delete schedule entries that are connected to the public calendar." },
      activities: { eyebrow: "Activity Manager", title: "Activity Management", lead: "Manage activity entries shown on the public site, including localization fields and Markdown content." },
      users: { eyebrow: "User Manager", title: "User Management", lead: "Create, update, and delete accounts, display names, roles, and passwords for backend access." },
      cloud: { eyebrow: "Cloud Gateway", title: "Nextcloud Access", lead: "Keep the Nextcloud entry point visible in the backend and jump into the shared drive quickly." }
    },
    dashboard: {
      summaryTitle: "Overview",
      quickTitle: "Quick Access",
      recentBugs: "Recent Bugs",
      recentSchedules: "Upcoming Schedule",
      recentLogs: "Recent Logs",
      topPaths: "Top Paths",
      cardLabels: { bugs: "Total Bugs", pending: "Pending Bugs", activities: "Published Activities", schedules: "Upcoming Events", users: "Users", visits: "Visits Today" }
    },
    bugs: {
      stats: { total: "Total", pending: "Pending", fixing: "Fixing", fixed: "Fixed", p0: "P0" },
      filters: { project: "Project", severity: "Priority", status: "Status", allProjects: "All Projects", allSeverity: "All Priorities", allStatus: "All Statuses" },
      table: { id: "ID", title: "Title", project: "Project", severity: "Priority", status: "Status", reporter: "Reporter", handler: "Owner", progress: "Progress", updated: "Updated", source: "Source", actions: "Actions" },
      sourceLocal: "Local",
      sourceServer: "Server",
      modalTitle: "Edit Bug",
      fields: { project: "Project", bugId: "Bug ID", title: "Title", severity: "Priority", status: "Status", reporter: "Reporter", handler: "Owner", solution: "Fix Progress / Notes" },
      status: { Pending: "Pending", Confirmed: "Confirmed", Fixing: "Fixing", Fixed: "Fixed", Deferred: "Deferred", Duplicate: "Duplicate" }
    },
    schedules: {
      summary: { total: "Total Records", upcoming: "Upcoming" },
      table: { date: "Date", time: "Time", title: "Title", category: "Category", detail: "Detail", updated: "Updated", actions: "Actions" },
      fields: { date: "Date", time: "Time", title: "Title", detail: "Detail", category: "Category" },
      newButton: "Add Schedule",
      modalCreate: "Create Schedule",
      modalEdit: "Edit Schedule",
      categories: { meeting: "Meeting", event: "Event", other: "Other" }
    },
    activities: {
      summary: { total: "Total", published: "Published" },
      table: { slug: "Slug", title: "Title", status: "Status", sortOrder: "Sort", updated: "Updated", actions: "Actions" },
      fields: { slug: "Slug", coverImage: "Cover Image URL", status: "Status", sortOrder: "Sort Order", title: "Title", summary: "Summary", body: "Body (Markdown)" },
      locale: { ja: "Japanese", zh: "Traditional Chinese", en: "English" },
      status: { draft: "Draft", published: "Published" },
      newButton: "Add Activity",
      modalCreate: "Create Activity",
      modalEdit: "Edit Activity",
      preview: "Markdown Preview"
    },
    users: {
      summary: { total: "Total Users", admins: "Admins" },
      table: { id: "ID", username: "Username", displayName: "Display Name", role: "Role", createdAt: "Created", actions: "Actions" },
      fields: { username: "Username", displayName: "Display Name", role: "Role", password: "Password" },
      roles: { admin: "Admin", member: "Member" },
      newButton: "Add User",
      modalCreate: "Create User",
      modalEdit: "Edit User",
      passwordHintCreate: "Required when creating a user.",
      passwordHintEdit: "Fill this only when changing the password."
    },
    cloud: {
      titleA: "Nextcloud Entry",
      bodyA: "Open the ZERO shared cloud space directly from the backend to manage files and collaboration assets.",
      titleB: "Target URL",
      bodyB: "This opens the production Nextcloud endpoint directly. Authentication is handled by Nextcloud itself.",
      noteAuth: "Use the authentication method configured in Nextcloud itself.",
      noteAcl: "Keep sharing scope and permission control inside Nextcloud."
    }
  }
};
