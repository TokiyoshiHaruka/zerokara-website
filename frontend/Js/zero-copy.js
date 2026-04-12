window.ZeroCopy = {
  ja: {
    shell: {
      languageLabel: "言語",
      note: "サイト内の移動は単一シェルで処理され、再生状態と言語設定を維持します。"
    },
    nav: [
      { key: "activity", href: "/activity.html", icon: "01", label: "活動内容" },
      { key: "schedule", href: "/schedule.html", icon: "02", label: "予定表" },
      { key: "join", href: "/join.html", icon: "03", label: "加入案内" },
      { key: "bug", href: "/bug.html", icon: "04", label: "BUG報告" },
      { key: "login", href: "/login.html", icon: "05", label: "社員ログイン" }
    ],
    titles: {
      home: "ZERO",
      activity: "活動内容 - ZERO",
      schedule: "予定表 - ZERO",
      join: "加入案内 - ZERO",
      bug: "BUG報告 - ZERO",
      login: "社員ログイン - ZERO"
    },
    home: {
      eyebrow: "Community Introduction",
      title: "ZEROへようこそ",
      lead: "ここは ZERO の公開入口であり、Discord コミュニティの紹介ページです。見学、交流、参加のどれからでも始められます。",
      story: [
        "はじめまして。少し好奇心があり、少し緊張していても大丈夫です。ここは新しい人がゆっくり入ってこられる、あたたかな拠点でありたいと考えています。",
        "見習いとして加わる人も、継続して支える正式メンバーも、それぞれの役割と居場所を持てるようにしています。",
        "制作の話、日常の雑談、小さなひらめきまで、気軽に持ち寄れる場所です。プロジェクトの相談も、少し話したい気分の日も歓迎しています。"
      ],
      guides: [
        { title: "互いを尊重する", text: "見習いでも正式メンバーでも、相手を友人として尊重し、違いがあっても丁寧に言葉を交わします。" },
        { title: "チャンネルを整える", text: "プロジェクトの話は作業用チャンネルへ、日常の会話は雑談へ。読みやすさを保つことも大切にしています。" },
        { title: "まずは参加してみる", text: "自己紹介、ミーティング、ゲーム、アイデア相談など、気になった場面から気軽に入ってきてください。" }
      ],
      noteLabel: "Small Tip",
      note: "#自己紹介 で趣味や好きなゲームを書いておくと、会話のきっかけが生まれやすくなります。",
      primary: "BUGを報告",
      secondary: "加入案内を見る",
      updatesLabel: "Update Log",
      updates: [
        { date: "2026.04.05", title: "公開ページを Vue 3 へ整理", text: "トップ、加入、予定表、BUG、ログインを単一シェルへまとめ、状態保持を安定させました。" },
        { date: "2026.04.05", title: "三言語の文面を再設計", text: "日本語、繁體中文、英語の表現とレイアウトを見直し、ページごとの語調差を減らしました。" },
        { date: "2026.04.05", title: "加入案内と紹介文を更新", text: "社団紹介をより伝わりやすくし、参加の流れと連絡導線を整理しました。" }
      ]
    },
    join: {
      eyebrow: "Join ZERO",
      titleLines: [
        { text: "創作と交流を" },
        { text: "安心して始めるための", accent: true },
        { text: "加入案内" }
      ],
      lead: "ここは単なる参加リンクではなく、ZERO の雰囲気や参加の流れを確認してから入れる正式な案内ページです。",
      pillars: [
        { kicker: "Create", title: "創作を前提にしたコミュニティ", text: "Web、ゲーム、音楽、ツール、実験的な企画まで、実際に形へ変えていく人のための場です。" },
        { kicker: "Collaborate", title: "段階的に関われる参加導線", text: "最初は見学から入り、会話、提案、共同制作へと少しずつ関わりを広げられます。" },
        { kicker: "Operate", title: "参加後の流れも明確", text: "管理担当と連絡を取りながら、権限、担当、利用ルールを確認していきます。" },
        { kicker: "Community", title: "交流だけで終わらない場", text: "雑談だけではなく、共有、改善提案、運営連携まで含めて長く続けられる環境を目指しています。" }
      ],
      processLabel: "Participation Flow",
      steps: [
        { index: "01", title: "Discord に参加する", text: "まずはサーバーに入り、現在の活動内容や空気感を確認してください。" },
        { index: "02", title: "参加したい方向を伝える", text: "興味のある分野や関わり方を共有してもらえれば、必要な案内を返します。" },
        { index: "03", title: "権限と担当を整える", text: "方向が決まったあと、必要な権限や役割を確認して実際の活動へ接続します。" }
      ],
      contactLabel: "Contact Window",
      contactTitle: "少し緊張していても大丈夫です。最初は見学や質問からでも歓迎します。",
      contactText: "活動の雰囲気、参加の仕方、担当の決め方など、気になることがあれば先に連絡してください。",
      contactNote: "新しい人が安心して入れるように、管理側と既存メンバーがゆっくり案内します。",
      primary: "Discord に参加する",
      secondary: "メールで問い合わせる"
    },
    activity: {
      eyebrow: "Activities",
      title: "活動内容",
      lead: "公開中の活動記録と制作内容を一覧で確認できます。表示内容はバックエンドの公開データから取得しています。",
      emptyTitle: "公開中の活動はまだありません",
      emptyBody: "活動データの取得に失敗したため、現在は一覧を表示できません。"
    },
    schedule: {
      eyebrow: "Schedule",
      title: "予定表",
      lead: "今月の予定をカレンダーとタイムラインで確認できます。内容はスケジュール API から読み込みます。",
      legend: { meeting: "打ち合わせ", event: "イベント", other: "その他" },
      monthSection: "今月の予定",
      weekdays: ["月", "火", "水", "木", "金", "土", "日"],
      empty: "今月の予定はまだ登録されていません。"
    },
    bug: {
      eyebrow: "Bug Report",
      title: "BUG報告",
      lead: "不具合の内容、再現条件、報告者情報を入力してください。送信後は管理画面側で処理状況を追跡できます。",
      labels: { project: "対象プロジェクト", priority: "優先度", title: "タイトル", detail: "詳細", reporter: "報告者" },
      placeholders: {
        title: "問題の概要を簡潔に入力してください",
        detail: "再現手順、期待した結果、実際の結果を記入してください",
        reporter: "名前または識別できる ID"
      },
      projectPlaceholder: "選択してください",
      projects: [
        { value: "zerokara-site", label: "ZERO Website" },
        { value: "song-of-self", label: "Song of Self" },
        { value: "other", label: "Other" }
      ],
      submitAction: "報告を送信",
      submitWorking: "送信中...",
      successTitle: "報告を受け付けました",
      successBody: "管理画面で内容を確認できます。API が利用できない場合は一時的にローカル保存へ切り替えます。",
      successReset: "続けて報告する",
      incomplete: "必須項目をすべて入力してください。"
    },
    login: {
      eyebrow: "Member Access",
      title: "ZERO 管理ポータルへのログイン",
      lead: "公開ページとは分離した管理画面へ接続します。運営メンバーが BUG 管理や活動データの確認を行うための入口です。",
      panels: [
        { title: "管理対象", text: "BUG の確認、活動情報の整備、公開前データのチェックなどをここにまとめています。" },
        { title: "公開側との分離", text: "公開サイトは案内に集中させ、編集や管理の作業はログイン後の画面へ切り分けています。" },
        { title: "認証後の動き", text: "認証に成功すると、管理ダッシュボードへ移動し、記録済みデータを確認できます。" }
      ],
      formTitle: "システムログイン",
      fields: { account: "アカウント", password: "パスワード" },
      placeholders: { account: "例: admin", password: "パスワードを入力" },
      submitAction: "ログイン",
      meta: "認証に成功すると、そのまま管理画面へ移動します。",
      loadingTitle: "ZERO / CONTROL PANEL",
      loadingSub: "システムモジュールを初期化しています...",
      missing: "アカウントとパスワードを入力してください。",
      failed: "ログインに失敗しました。",
      connectFailed: "サーバーへ接続できませんでした。"
    },
    player: {
      eyebrow: "BGM",
      ready: "再生待機中",
      playing: "再生中",
      paused: "一時停止中",
      blocked: "再生制限あり",
      unlock: "音声を有効にするには画面を一度操作してください",
      empty: "トラックなし",
      collapse: "収納",
      expand: "展開",
      prev: "前へ",
      play: "再生",
      pause: "停止",
      next: "次へ"
    }
  },
  "zh-TW": {
    shell: {
      languageLabel: "語言",
      note: "站內頁面切換以單一殼層處理，會保留播放狀態與語言設定。"
    },
    nav: [
      { key: "activity", href: "/activity.html", icon: "01", label: "活動內容" },
      { key: "schedule", href: "/schedule.html", icon: "02", label: "行程表" },
      { key: "join", href: "/join.html", icon: "03", label: "加入社團" },
      { key: "bug", href: "/bug.html", icon: "04", label: "BUG 反饋" },
      { key: "login", href: "/login.html", icon: "05", label: "社員登入" }
    ],
    titles: {
      home: "ZERO",
      activity: "活動內容 - ZERO",
      schedule: "行程表 - ZERO",
      join: "加入社團 - ZERO",
      bug: "BUG 反饋 - ZERO",
      login: "社員登入 - ZERO"
    },
    home: {
      eyebrow: "Community Introduction",
      title: "歡迎來到 ZERO",
      lead: "這裡是 ZERO 的公開入口，也是社團 Discord 的介紹頁。你可以從觀察、交流，或準備加入開始。",
      story: [
        "嗨，新朋友。第一次來到這裡，帶著一點好奇和一點緊張，也完全沒有關係。這裡更像一個會慢慢亮起來的小據點，隨時等你靠近。",
        "無論你是剛加入的實習生成員，還是會和我們一起成長的正式社員，在 ZERO 裡都會有屬於自己的位置。",
        "這裡也是大家分享項目、交流日常、討論靈感的地方。想聊創作、吐槽生活，還是提出新的點子，都可以。"
      ],
      guides: [
        { title: "彼此尊重", text: "不論是實習生還是正式社員，我們都希望用朋友的方式交流，帶著理解與耐心回應彼此。" },
        { title: "保持整潔", text: "項目討論回到對應頻道，日常聊天留在閒聊區，讓每段對話都能找到自己的位置。" },
        { title: "一起參與", text: "從自我介紹、討論會到活動提案，只要你願意開口，這裡就會有人接住你的想法。" }
      ],
      noteLabel: "小提示",
      note: "在 #自我介紹 分享興趣、遊戲或擅長的方向，通常會更快認識大家。",
      primary: "提交 BUG",
      secondary: "查看加入方式",
      updatesLabel: "更新日誌",
      updates: [
        { date: "2026.04.05", title: "公開頁切換到 Vue 3", text: "首頁、加入、行程、BUG 與登入頁已統一到同一個前台殼層，切頁時會保留狀態。" },
        { date: "2026.04.05", title: "三語文案重新整理", text: "日文、繁體中文與英文的文字與排版已重新調整，減少頁面之間的語氣落差。" },
        { date: "2026.04.05", title: "社團介紹與加入導線更新", text: "把首頁介紹與加入頁重新整理成更正式、也更容易理解的版本。" }
      ]
    },
    join: {
      eyebrow: "Join ZERO",
      titleLines: [
        { text: "把創作與交流" },
        { text: "放進同一個社團裡", accent: true },
        { text: "從加入開始" }
      ],
      lead: "這不是只有一顆 Discord 按鈕的跳轉頁，而是 ZERO 的正式加入入口。你可以先理解社團方向、參與方式與聯絡窗口，再決定要怎麼加入。",
      pillars: [
        { kicker: "Create", title: "以創作為核心的社群", text: "從網站、遊戲、音樂到工具與實驗性企劃，只要你願意把想法做出來，這裡就有位置。" },
        { kicker: "Collaborate", title: "可以循序漸進地參與", text: "你可以先旁聽、觀察、聊天，再慢慢進入提案、協作與正式分工。" },
        { kicker: "Operate", title: "加入之後的流程也清楚", text: "和管理成員聯繫後，會依照你的參與方向確認權限、分工與後續安排。" },
        { kicker: "Community", title: "不只聊天，也重視持續產出", text: "這裡希望同時容納交流、分享、修正、合作與實際產出，而不是只停留在短暫互動。" }
      ],
      processLabel: "Participation Flow",
      steps: [
        { index: "01", title: "先加入 Discord", text: "進入伺服器後，可以先看目前的活動內容與整體氛圍。" },
        { index: "02", title: "向管理成員說明你的方向", text: "告訴我們你想參與的主題、擅長方向，或想先旁聽都可以。" },
        { index: "03", title: "確認權限與後續安排", text: "方向確定後，我們會協助你接上對應的權限、頻道與後續工作節奏。" }
      ],
      contactLabel: "Contact Window",
      contactTitle: "如果你有點緊張，也沒有關係。先旁聽、先提問、先熟悉環境都可以。",
      contactText: "關於社團內容、參與頻率、工作範圍等疑問，都可以先透過信箱聯絡，再決定要不要加入。",
      contactNote: "我們希望新成員進來的第一步，是被溫柔接住，而不是被急著推進流程裡。",
      primary: "加入 Discord",
      secondary: "寄信聯絡"
    },
    activity: {
      eyebrow: "Activities",
      title: "活動內容",
      lead: "這裡會集中展示目前公開的活動紀錄與作品資訊，內容由後端公開資料載入。",
      emptyTitle: "目前還沒有公開活動",
      emptyBody: "活動資料暫時無法讀取，因此現在無法顯示列表。"
    },
    schedule: {
      eyebrow: "Schedule",
      title: "行程表",
      lead: "本月安排會同步顯示在月曆與時間軸中，資料來源為排程 API。",
      legend: { meeting: "會議", event: "活動", other: "其他" },
      monthSection: "本月安排",
      weekdays: ["一", "二", "三", "四", "五", "六", "日"],
      empty: "本月目前沒有登錄任何行程。"
    },
    bug: {
      eyebrow: "Bug Report",
      title: "BUG 反饋",
      lead: "請填寫問題內容、重現條件與回報者資訊。送出後可由後台持續追蹤處理狀態。",
      labels: { project: "目標專案", priority: "優先級", title: "標題", detail: "詳細描述", reporter: "回報人" },
      placeholders: {
        title: "請簡要描述問題",
        detail: "請寫下重現步驟、預期結果與實際結果",
        reporter: "姓名或可識別的 ID"
      },
      projectPlaceholder: "請選擇",
      projects: [
        { value: "zerokara-site", label: "ZERO Website" },
        { value: "song-of-self", label: "Song of Self" },
        { value: "other", label: "Other" }
      ],
      submitAction: "送出回報",
      submitWorking: "送出中...",
      successTitle: "回報已成功送出",
      successBody: "後台頁面可以查看這筆資料。若 API 暫時不可用，會先改存到本機快取。",
      successReset: "繼續回報下一筆",
      incomplete: "請先完整填寫所有必填欄位。"
    },
    login: {
      eyebrow: "Member Access",
      title: "ZERO 後台入口",
      lead: "這裡連接的是與公開頁分離的管理介面，提供營運成員處理 BUG、查看活動資料與管理紀錄。",
      panels: [
        { title: "管理內容", text: "BUG 清單、活動資料與公開前檢查等項目都會集中在登入後的畫面中。" },
        { title: "公開頁與後台分流", text: "公開站點保持簡潔，資料處理與管理動作則收在登入後，避免前台入口過於混雜。" },
        { title: "登入後流程", text: "驗證成功後，系統會直接帶你進入管理儀表板，查看目前已記錄的內容。" }
      ],
      formTitle: "系統登入",
      fields: { account: "帳號", password: "密碼" },
      placeholders: { account: "例如 admin", password: "輸入密碼" },
      submitAction: "登入",
      meta: "驗證成功後，將自動跳轉到管理頁面。",
      loadingTitle: "ZERO / CONTROL PANEL",
      loadingSub: "正在初始化系統模組...",
      missing: "請輸入帳號與密碼。",
      failed: "登入失敗。",
      connectFailed: "無法連接到伺服器。"
    },
    player: {
      eyebrow: "BGM",
      ready: "待命中",
      playing: "播放中",
      paused: "已暫停",
      blocked: "播放受限制",
      unlock: "如要開啟聲音，請先點一下頁面或按任一鍵",
      empty: "沒有曲目",
      collapse: "收起",
      expand: "展開",
      prev: "上一首",
      play: "播放",
      pause: "暫停",
      next: "下一首"
    }
  },
  en: {
    shell: {
      languageLabel: "Language",
      note: "Internal page switches are handled inside a single shell, so playback state and language choice persist."
    },
    nav: [
      { key: "activity", href: "/activity.html", icon: "01", label: "Activities" },
      { key: "schedule", href: "/schedule.html", icon: "02", label: "Schedule" },
      { key: "join", href: "/join.html", icon: "03", label: "Join ZERO" },
      { key: "bug", href: "/bug.html", icon: "04", label: "Bug Report" },
      { key: "login", href: "/login.html", icon: "05", label: "Member Login" }
    ],
    titles: {
      home: "ZERO",
      activity: "Activities - ZERO",
      schedule: "Schedule - ZERO",
      join: "Join ZERO",
      bug: "Bug Report - ZERO",
      login: "Member Login - ZERO"
    },
    home: {
      eyebrow: "Community Introduction",
      title: "Welcome to ZERO",
      lead: "This is the public entry to ZERO and a short introduction to the Discord community behind it. You can begin by browsing, talking, or preparing to join.",
      story: [
        "Hi, new friend. It is completely fine to arrive here with a little curiosity and a little nervousness. We want this place to feel warm, steady, and easy to approach.",
        "Whether you are just stepping in as a trainee member or planning to grow with us as a long-term member, there should be a place for you inside ZERO.",
        "This is where people share projects, talk about everyday life, and drop small sparks of inspiration. You can bring work, questions, ideas, or simply a conversation."
      ],
      guides: [
        { title: "Respect each other", text: "Trainees and full members are both treated with patience, respect, and the assumption that everyone deserves to be heard well." },
        { title: "Keep channels tidy", text: "Project talk belongs in the right work channels, while daily conversation can stay in casual spaces that are easier for everyone to follow." },
        { title: "Join in gently", text: "Introductions, meetings, games, and small proposals are all good ways to start. Participation does not have to begin at full speed." }
      ],
      noteLabel: "Small Tip",
      note: "A short self-introduction with your interests or favorite games usually makes it much easier for people to talk with you.",
      primary: "Report a Bug",
      secondary: "View Join Guide",
      updatesLabel: "Update Log",
      updates: [
        { date: "2026.04.05", title: "Public pages moved into Vue 3", text: "The homepage, join page, schedule, bug report, and login now share one front-end shell with persistent state." },
        { date: "2026.04.05", title: "Localization rewritten", text: "Japanese, Traditional Chinese, and English were revised together so the site reads more naturally across pages." },
        { date: "2026.04.05", title: "Community intro and join flow refined", text: "The landing content and onboarding guidance were rewritten to feel more welcoming and more official at the same time." }
      ]
    },
    join: {
      eyebrow: "Join ZERO",
      titleLines: [
        { text: "A calmer way" },
        { text: "to join ZERO", accent: true },
        { text: "and stay involved" }
      ],
      lead: "This page is no longer just a Discord jump link. It now serves as the formal onboarding entry where new members can understand the direction, process, and contact points before joining.",
      pillars: [
        { kicker: "Create", title: "Built for people who make things", text: "From websites and games to music, tools, and small experiments, ZERO is meant for people who want to turn ideas into actual work." },
        { kicker: "Collaborate", title: "Participation can start gradually", text: "You can begin by observing, then move into discussion, proposals, and collaborative work when the timing feels right." },
        { kicker: "Operate", title: "The path after joining is defined", text: "Permissions, responsibility, and working channels are clarified with the admins so participation is structured instead of vague." },
        { kicker: "Community", title: "More than chat, built for continuity", text: "The goal is to support conversation, iteration, cooperation, and actual output in the same community space." }
      ],
      processLabel: "Participation Flow",
      steps: [
        { index: "01", title: "Join the Discord server", text: "Start by entering the server and getting a feel for the current projects and atmosphere." },
        { index: "02", title: "Tell the admins how you want to join", text: "You can share what you want to work on, what you are good at, or whether you want to observe first." },
        { index: "03", title: "Confirm roles and access", text: "Once your direction is clear, the team can connect you to the right permissions, channels, and next steps." }
      ],
      contactLabel: "Contact Window",
      contactTitle: "If you feel a little unsure, that is completely fine. Starting with questions or quiet observation is welcome too.",
      contactText: "If you want to understand the atmosphere, scope, or pace before joining, you can contact us by email first and decide afterward.",
      contactNote: "The goal is to help new people arrive with some ease, not to push them into the flow before they are ready.",
      primary: "Join the Discord",
      secondary: "Contact by Email"
    },
    activity: {
      eyebrow: "Activities",
      title: "Activities",
      lead: "Published records and current project updates are shown here through public backend data.",
      emptyTitle: "No public activity is available yet",
      emptyBody: "The activity feed cannot be loaded right now."
    },
    schedule: {
      eyebrow: "Schedule",
      title: "Schedule",
      lead: "The calendar and timeline both reflect current monthly events pulled from the schedule API.",
      legend: { meeting: "Meeting", event: "Event", other: "Other" },
      monthSection: "This Month",
      weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      empty: "No events are registered for this month yet."
    },
    bug: {
      eyebrow: "Bug Report",
      title: "Bug Report",
      lead: "Provide the issue summary, reproduction details, and reporter information. The admin side can track the status after submission.",
      labels: { project: "Project", priority: "Priority", title: "Title", detail: "Details", reporter: "Reporter" },
      placeholders: {
        title: "Write a short summary of the issue",
        detail: "Describe the steps, expected behavior, and actual behavior",
        reporter: "Name or identifiable ID"
      },
      projectPlaceholder: "Select one",
      projects: [
        { value: "zerokara-site", label: "ZERO Website" },
        { value: "song-of-self", label: "Song of Self" },
        { value: "other", label: "Other" }
      ],
      submitAction: "Submit Report",
      submitWorking: "Submitting...",
      successTitle: "Report submitted",
      successBody: "This report can be reviewed from the admin side. If the API is unavailable, it will be cached locally first.",
      successReset: "Submit another report",
      incomplete: "Please complete every required field."
    },
    login: {
      eyebrow: "Member Access",
      title: "Sign in to the ZERO admin portal",
      lead: "This entry connects to the management interface that is kept separate from the public-facing site. It is intended for staff who manage bugs, records, and operational data.",
      panels: [
        { title: "What is managed here", text: "Bug records, activity data, and pre-publication review tasks are centralized after sign-in." },
        { title: "Why it is separated", text: "The public site stays focused on presentation and onboarding, while editing and processing stay inside the private dashboard." },
        { title: "What happens next", text: "After successful authentication, you are sent directly to the admin dashboard to continue management work." }
      ],
      formTitle: "System Login",
      fields: { account: "Account", password: "Password" },
      placeholders: { account: "e.g. admin", password: "Enter password" },
      submitAction: "Login",
      meta: "You will be redirected to the admin dashboard after successful authentication.",
      loadingTitle: "ZERO / CONTROL PANEL",
      loadingSub: "Initializing system modules...",
      missing: "Please enter both account and password.",
      failed: "Login failed.",
      connectFailed: "Failed to connect to the server."
    },
    player: {
      eyebrow: "BGM",
      ready: "Ready",
      playing: "Playing",
      paused: "Paused",
      blocked: "Playback blocked",
      unlock: "Click, tap, or press any key once to enable sound",
      empty: "No track",
      collapse: "Collapse",
      expand: "Expand",
      prev: "Prev",
      play: "Play",
      pause: "Pause",
      next: "Next"
    }
  }
};
