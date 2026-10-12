---
label: wayfinder:map
title: 一筆畫網頁遊戲
---

## Destination

一份規格文件 `SPEC.md`，寫清楚這幾件事：玩法規則、1000 關怎麼產生、怎麼確認每關都畫得完、難度怎麼一路往上加、畫線怎麼操作、進度怎麼存、選關畫面長什麼樣、用什麼技術做、網址放在哪裡。另一個人或 AI 拿到這份文件就能開始做，中途不用再回來問。

## Notes

- 給家裡 6–10 歲小朋友玩的網頁遊戲，不是公司專案，也不公開推廣。
- 用語以 `CONTEXT.md` 為準，討論時發現新用語或用語衝突，就順手更新它。
- 每次處理 grilling 票，都要用 /grilling 和 /domain-modeling。prototype 票要做出可以在手機上實際摸的東西。
- 給人看的文字一律寫白話中文，規則見使用者的 CLAUDE.md 第 5 節。
- 所有票都關掉以後，把各張票的定案整理成 `SPEC.md`，地圖到這裡結束。
- **Tracker 規則**：這個資料夾還不是 git repo，所以地圖和票都放在本機的 markdown 檔。
  - 地圖：`wayfinder/map.md`
  - 票：`wayfinder/tickets/NN-slug.md`，開頭的 frontmatter 有 `title`、`type`（research / prototype / grilling / task）、`status`（open / closed）、`assignee`（認領的人，空白代表還沒有人認領）、`blocked_by`（要等哪幾張票關掉，填票號）
  - 可以接的票：`status: open`、`assignee` 空白，而且 `blocked_by` 列的票全部是 closed
  - 結案：在票的最後加一段 `## Resolution` 寫答案，把 `status` 改成 closed，再到下面的 Decisions so far 加一行
  - 研究結果放在 `wayfinder/research/`，從票上加連結

## Decisions so far

- [終點與玩法前提](tickets/00-destination.md)：給 6–10 歲小孩玩，起點不限制，手離開畫面可以接著畫；有提示按鈕，一次給一步，走錯了會自動退回走錯之前；進度存在瀏覽器，關卡逐關解鎖，跳過不限次數
- [一張圖「難」在哪裡](tickets/01-difficulty-research.md)：沒有現成研究，線多不等於難；建議用「模擬亂畫的小孩平均要畫幾條線才過關」排序，但一定要讓自己的小孩試玩校正
- [小朋友用手指畫線，怎麼操作最順](tickets/02-drawing-input-prototype.md)：手指沿著線拖過去，點的觸控範圍 34 px、線的範圍 68 px，偏離時不清掉已經畫好的部分；三個按鈕放下方
- [選關畫面怎麼排 1000 關](tickets/03-level-select.md)：20 章 × 50 關，打開網址直接進最新一關；跳過要按兩下；最多 3 個頭像各有自己的進度，家長設定點齒輪就能進
- [用什麼技術做](tickets/04-tech-stack.md)：純 HTML/JS 不打包、SVG、localStorage、關卡放一個 JSON；可離線、加入主畫面；iPad 直橫都排好；產生關卡的程式用 Node，和遊戲共用一筆畫的判斷
- [網址放在哪裡](tickets/05-hosting.md)：個人帳號 max8568 的公開 repo，GitHub Pages 只發布 `site/` 資料夾，網址 max8568.github.io/eulerian-path
- [1000 張圖怎麼產生](tickets/06-figure-generation.md)：900 關由程式在格子上產生（前面疊形狀、後面隨機路線，格子 3×3→5×5），100 關是每 10 關一張的手畫形狀關；不用補線法，程式產生的圖沒有重複的線
- [100 張手畫的形狀關長什麼樣](tickets/09-shape-levels.md)：每章一個主題（形狀、動物……遊樂園、綜合），第一批 25 張定案；後面靠加內部細節變難，剩下 75 張等難度排好再照目標畫
- [1000 關的難度怎麼排](tickets/08-difficulty-curve.md)：用平均畫線數排，章末目標從 10 升到 400；格子 3×3→4×4→5×5；2 個單數點的圖從第 2 章、交叉從第 4 章開始；形狀關是難度表的 1.5 倍、最多 2.5 倍；全部數字在 `curve.json`，可以重新調整
- [畫面長什麼樣、有什麼聲音](tickets/10-look-and-sound.md)：糖果色畫面，畫過的線跟著章節變色；20 章各一個顏色和 emoji；12 隻動物頭像；木琴音效；過關是大星星加彩帶

## 終點已到

2026-10-12 所有票都結案，定案整理成 [`SPEC.md`](../SPEC.md)。

## Not yet specified

（沒有了。）

## Out of scope

- 帳號登入、排行榜、廣告、內購、多語系：家裡自己玩用不到，見[終點與玩法前提](tickets/00-destination.md)
- 實際把遊戲做出來：這張地圖只做到 `SPEC.md`
- [讓小朋友試玩 20–30 關，記下實際花多久](tickets/07-kid-playtest.md)：小朋友目前沒辦法試玩，改到遊戲做好以後用正式版玩，`SPEC.md` 要寫怎麼依紀錄調整難度
