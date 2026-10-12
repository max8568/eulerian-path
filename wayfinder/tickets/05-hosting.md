---
id: 05
title: 網址放在哪裡
type: grilling
status: closed
assignee: claude
blocked_by: []
---

## Question

遊戲的網址要放在哪裡？要決定：

- 用 GitHub Pages，還是其他免費的靜態網站空間
- 用哪個帳號放（這台機器上有好幾個 gh 帳號）
- 程式碼放在公開還是私人的 repo
- 網址要不要短、好記，方便直接傳給家人

「用什麼技術做」決定要能離線玩、能加入主畫面，負責離線的那個檔案只能在 https 網址上運作，選網站空間時要確認有 https。

## Resolution

2026-10-12 和使用者討論後定案：

- **帳號**：個人帳號 `max8568`，不用公司帳號 `igs-hanhongchen`。這台電腦目前作用中的是公司帳號，第一次推送前要先問使用者，再切換帳號，不能自己換。
- **網站空間**：GitHub Pages，repo 公開。程式碼裡沒有秘密，遊戲也不收集任何資料。
- **網址**：https://max8568.github.io/eulerian-path/
- **repo**：`max8568/eulerian-path`。使用者 2026-10-12 已經建好，公開，目前是空的，預設分支 `main`，Pages 還沒開。本機的專案資料夾還不是 git repo，第一次推送前要先建立並連到這個 repo。
- **上網站的檔案**：遊戲放在 repo 的 `site/` 資料夾。每次推到 `main`，由 GitHub Actions 自動只把 `site/` 發布到 Pages。repo 設定裡 Pages 的來源要選 GitHub Actions。產生關卡的程式、地圖和 `SPEC.md` 留在 repo 裡，不放上網站。
