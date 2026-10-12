# 一張圖「難」在哪裡：研究結果

對應題目：[tickets/01-difficulty-research.md](../tickets/01-difficulty-research.md)
查詢日期：2026-10-12

## 先講結論

市面上的一筆畫遊戲大多只說「關卡越後面線越多」，沒有一家公開他們怎麼算難度。學術上也沒有找到任何一篇拿真人（不論大人或小孩）實際玩一筆畫、量哪些圖比較難的研究。所以下面的內容裡，講「數學上一定如此」的部分有出處；講「小孩會覺得比較難」的部分，都是我把其他謎題（數獨、倉庫番、迷宮）的研究方法套過來的推論，還沒有被驗證過。

能直接用、而且有根據的數字有這幾個：

- **線的數量**：所有遊戲都用它來加難度。
- **連著單數條線的點有幾個（0 個或 2 個）**：有 2 個的時候，從其他點出發一定畫不完，這是數學定理。對「起點不限制、不給提示」的這個遊戲，這一項會直接決定小孩第一次嘗試有多大機會成功。
- **「亂畫也會過關」的程度**：數學上有一類圖，從某個點出發，不管怎麼走都一定畫得完（Ore 1951 年提出）。這表示「亂走會不會走進死路」是圖本身的性質，可以用程式算。

我建議的主要難度數字是：**讓程式模擬一個隨便選路的小孩，算他平均要畫幾條線才會過關**（走不下去就重來）。這個數字同時反映圖有多大、起點選錯的機率、走錯路的機率。這個做法是照 Jarušek 和 Pelánek 2011 年預測倉庫番等謎題難度的方法改的，他們發現「模擬一個半隨機的玩家」比「算解法有多長」更能預測真人花多少時間。但套到一筆畫、套到 6–10 歲小孩身上準不準，沒有人驗證過，需要讓自己的小孩玩一批關卡來校正。

線有沒有交叉、兩點之間有沒有好幾條線，這兩項會影響小孩看不看得懂圖，但沒有找到針對一筆畫的研究，只有大人看圖表的研究可以參考。

---

## 市面上的遊戲怎麼做

### 關卡數量從一百到上千，加難度的方式都是「線變多」加上「新規則」

| 遊戲 | 關卡數 | 官方怎麼描述難度 | 提示 | 起點 |
|---|---|---|---|---|
| 1LINE（GAMINCAT） | 15 級、共 850 關（另一版本 10 級、500 關） | 「每升一級，線的數量就增加，越來越複雜」；後面會出現單行道的線、重疊的線 | 有，可付費買 | 任何點都可以 |
| 一筆書きアプリ／One touch Drawing（Ecapyc） | 680 關（早期評測寫 100 關） | 「一開始是簡單的圖，每升一級線就變多」；後面出現要畫兩次的線、單行道的線、會把你傳送到別處的點 | 有 | 未說明 |
| One Line - Connect the dots | 6 級、共 300 關 | 同上：「每升一級，線的數量就增加」 | 有 | 「從哪裡開始都可以」 |
| One touch drawing: IQ Test | 1000 關以上 | 只說「越後面越有挑戰」 | 有，可付費買 | 任何點都可以 |

出處：[1LINE App Store](https://apps.apple.com/app/1179975506)、[1LINE TapTap](https://www.taptap.io/tw/app/53087)、[Ecapyc 日本 App Store](https://apps.apple.com/jp/app/id494856551)、[Ecapyc 英文說明（AppGoblin 轉錄）](https://appgoblin.info/apps/494856551)、[AddictiveTips 評測](https://www.addictivetips.com/mobile/one-touch-drawing-draw-unique-shapes-in-a-single-swipe-android-game)、[One Line App Store](https://apps.apple.com/vc/app/one-line-connect-the-dots/id1569827269)、[One touch drawing: IQ Test](https://apps.apple.com/in/app/id1403251654)

從這些說明可以看出幾件事：

1. **分級是一大段一大段的**，每級幾十關，同一級裡的圖線數差不多。沒有任何一家公開他們在同一級裡怎麼排先後。
2. **兩點之間有好幾條線，在這些遊戲裡被當成後期才出現的新規則**。1LINE 叫「重疊的線」，Ecapyc 叫「要畫兩次的線」。也就是說，遊戲設計者認為這種線需要另外教，不是一般的圖。
3. **1LINE 的說明提到，後面難關的解法線索都藏在前面簡單的關卡裡**（"The hints to clearing the later, more complicated stages can all be found scattered through the simple stages"，[TapTap 頁面](https://www.taptap.io/tw/app/53087)）。意思是前面的關卡同時在教玩家技巧。對我們不給提示的設計，這點很重要：小孩只能從前面的關卡自己學會「要從哪種點出發」。
4. **這些遊戲全部都有提示**，而且多半是收費項目。我們的遊戲不給提示，所以難度曲線要比它們更平緩，這點沒有現成的參考。

### 要小心名字相同但規則不同的遊戲

微信「一筆畫完」、日本的「Fill」這類遊戲，規則是「把每一個格子走過一次」，不是「把每一條線畫過一次」。Fill 的說明就是「一筆畫把所有格子塗滿」（[Fill App Store](https://apps.apple.com/JP/app/id1091456207)）。這是另一種數學問題，難度的道理也不同，參考別人的關卡時不要混在一起。

### 開源專案：只找到小型練習作品，沒有找到會排難度的產生器

在 GitHub 搜「one stroke puzzle」「one touch drawing」「一笔画」「hitofude」「eulerian puzzle generator」，找到的都是幾關到幾十關的手工關卡（例如 [handson-matsu/one-stroke-puzzle](https://github.com/handson-matsu/one-stroke-puzzle) 5 關、[pndshch/hitofudegaki](https://github.com/pndshch/hitofudegaki) 給 5–10 歲小孩的 8 關、[leeenx/OneStroke](https://github.com/leeenx/OneStroke)），或是破解別人遊戲的解題器。沒有找到任何一個會自動產生一筆畫的圖、再依難度排序的開源程式。

其中 handson-matsu 的說明特別寫了「線交叉的地方沒有點，只有編號的點可以轉彎」「有些關卡從某些點出發就畫不完」，可見做這種遊戲的人自己也注意到這兩件事會讓玩家困惑。

---

## 研究怎麼說

### 數學上已經確定的事

這幾件事有定理保證，可以直接放心用。先說明兩個用語：

- 一個點**連著幾條線**，就叫這個點的「度數」。連著單數條線的點，下面簡稱「單數點」。
- 一條線如果拿掉之後，剩下的圖會斷成兩塊，這條線叫做「**橋**」。

**1. 單數點只能是 0 個或 2 個，而且 2 個的時候只能從單數點出發。**
一張連在一起的圖，單數點是 0 個時可以從任何點出發畫完（而且會回到原點）；是 2 個時，只能從其中一個單數點出發，在另一個結束；超過 2 個就畫不完。（[Wikipedia: Eulerian path](https://en.wikipedia.org/wiki/Eulerian_path)；[labuladong 一筆畫說明](https://labuladong.online/en/algo/data-structure-basic/eulerian-graph/)）

對我們的遊戲，這表示：一張有 2 個單數點、總共 10 個點的圖，小孩如果隨便挑起點，有 8 成的機會從一開始就註定畫不完，而他不會知道原因。

**2. 隨便走、不重複畫線，走到沒路的地方一定是「終點該在的點」。**
如果所有點都是雙數，隨便走下去，最後一定是回到出發點才停；如果有 2 個單數點、從其中一個出發，一定是停在另一個單數點。走不下去的時候，問題不是「停錯地方」，而是「有一部分線被留在沒走到的地方」。這是 Hierholzer 找一筆畫路線的方法的基礎（[Trinity College Dublin 講義](https://www.maths.tcd.ie/~stalker/22C00/lecture_21.pdf)）。

**3. 有些圖，從某個點出發怎麼走都會成功。**
Ore 在 1951 年研究過這種圖（當時叫 arbitrarily traceable，後來叫 randomly Eulerian）：從點 v 出發，任何一條不重複畫線的走法都能延伸成完整的一筆畫（[Chartrand、Oellermann、Ruiz 1986 的文獻回顧](https://dml.cz/bitstream/handle/10338.dmlcz/130913/MathSlov_36-1986-2_5.pdf)）。判斷方法很簡單：**把點 v 和連著它的線全部拿掉之後，剩下的圖裡沒有任何一個圈**，從 v 出發就怎麼走都會成功（[Princeton 課程習題](https://www.cs.princeton.edu/courses/archive/fall02/cs341/ps7.pdf)）。例如兩個三角形共用一個點（像蝴蝶結），從中間那個點出發就不可能走錯。

這說明了「亂走會不會走進死路」不是運氣，是圖本身的形狀決定的，可以算出來。

**4. 走錯路的典型原因是「太早走過橋」。**
Fleury 找一筆畫的方法是：每一步，只要還有別的選擇，就不要走那條會讓剩下的圖斷成兩塊的線（[Wikipedia: Eulerian path，Fleury's algorithm 一節](https://en.wikipedia.org/wiki/Eulerian_path)）。反過來說，小孩走進死路，通常就是在還有別的線沒畫的時候，先走過了一條橋，結果橋另一邊的線再也回不去了。

**5. 「這張圖有幾種畫法」在大圖上很難算，但我們的圖夠小。**
一般的圖，算一筆畫的畫法總數在理論上是很難的問題（屬於 #P-complete，[Brightwell 與 Winkler 2004](https://arxiv.org/abs/cs/0405067v1)）。但給 6–10 歲小孩的圖大概只有幾條到二、三十條線，用電腦一條一條試或抽樣模擬都算得完。

### 跟「人覺得難不難」有關的研究

**直接研究一筆畫的：沒有找到。**
我用英文、中文、日文搜尋「人解一筆畫謎題的實驗」，找到的都是教學講義和數學說明。唯一沾上邊的是 Blanco 與 García-Moya 2021 年的研究：讓數學資優的小學生上圖論課，其中包含一筆畫，觀察到他們會用找規律、數數、畫圖等方法（[Crossref 摘要](https://api.crossref.org/works/10.3390/math9131567)，[MDPI 原文](https://www.mdpi.com/2227-7390/9/13/1567)）。這是教學觀察，沒有比較哪些圖比較難。

**別的謎題怎麼預測難度：有，而且方法可以照著做。**

- Pelánek 2011 年用兩千多題數獨、上千小時的真人解題時間，比較各種難度算法。結果最準的不是「題目給了幾個數字」（和真人時間的相關只有 0.22–0.34），而是「讓程式模仿人一步一步解，看要花多少步」（相關 0.88，加上其他數獨專用算法可到 0.95）。他的結論是難度來自兩件事：每一步本身難不難，以及步驟之間怎麼互相牽連（[Pelánek 2011 技術報告](https://www.fi.muni.cz/~xpelanek/publications/sudoku-tr.pdf)）。
- Jarušek 與 Pelánek 2011 年研究倉庫番、Rush Hour 等搬東西的謎題，發現「解法要幾步」「可能的局面總共有多少」這些靜態數字預測不準，難度主要來自局面之間怎麼連接。他們做了一個很簡單的模型：每一步隨機選一個走法，但往正確方向的走法有比較高的機率被選到，然後重複跑很多次，算平均要走幾步才解開。在「走錯了就回不去」的謎題（倉庫番、Replacement puzzle）上，這個模型比「最短解法幾步」準很多（例如 Replacement puzzle 的相關從 0.28 提高到 0.57）；在每一步都能走回頭的 Rush Hour 上，兩者差不多（[Jarušek 與 Pelánek 2011, FLAIRS](https://cdn.aaai.org/ocs/2518/2518-11200-1-PB.pdf)）。

一筆畫屬於「畫過的線不能再畫」的謎題，跟倉庫番那類比較像：走錯一步之後，剩下的圖可能已經註定畫不完，只是小孩還沒發現。這是我認為模擬玩家的方法適合拿來用的主要理由（這是推論，不是他們的研究結論）。

**迷宮的研究：死路有多長會影響難度，但沒有大型實驗數據。**
Bellot 等人整理迷宮難度的算法時指出，只看解法長度不夠：一條很長但沒有岔路的迷宮反而無聊，因為玩家沒有選擇；死路越長，玩家越會猶豫（[Bellot 等人，How to Generate Perfect Mazes?](https://perso.limos.fr/~palafour/PAPERS/PDF/labyrinthe.pdf)）。他們也提到有人用「隨機走的程式平均要走幾步」來量迷宮難度。這支持「走錯之後多久才會發現」是一個值得算的數字，但證據是設計者的分析，不是真人實驗。

**線交叉對看圖的影響：有，但研究對象是大人看圖表，不是玩謎題。**

- Purchase 1997 年讓受試者在電腦上回答關於圖的問題，比較五種畫圖方式，發現**減少線的交叉是影響最大的一項**，對稱、少轉折的影響小得多（[Purchase 1997 摘要](https://research.monash.edu/en/publications/which-aesthetic-has-the-greatest-effect-on-human-understanding/)）。
- Huang 2008 年用眼動儀追蹤受試者找路線，發現**兩條線交叉的角度很小時，眼睛會在交叉點來回看**，速度明顯變慢；而且人會先沿著「看起來比較直、比較近」的線走，即使那不是對的路（[Huang 2008, arXiv](https://ar5iv.labs.arxiv.org/html/0810.4431)）。

對一筆畫來說，這表示：兩條線交叉但交叉處沒有點時，小孩可能以為可以在那裡轉彎；交叉角度越小越容易看錯。這是從看圖研究推過來的，沒有一筆畫的直接數據。

**單數點 0 個和 2 個哪個比較難：沒有找到任何真人數據。**
數學上，2 個單數點的圖起點選錯一定失敗；但小孩可能在幾十關之後自己發現「要從那種點開始」（1LINE 的說明暗示他們期待玩家這樣學會）。學會之前和學會之後，同一張圖的難度會差很多。

---

## 自動產生和排難度的做法

### 產生「一定畫得完」的圖：先畫路線再變成圖、把幾個圈合起來、或在亂畫的圖上補線

這三種做法都是從數學性質直接推出來的，不需要別人的程式。

1. **先畫一條路線，再把路線變成圖。** 在一組點上隨機走一段、不重複走同一條線，走過的線就是一張圖。這張圖一定畫得完，因為產生它的那條路線就是解法。缺點是單數點一定是 0 或 2 個，但圖的樣子不好控制。
2. **把好幾個封閉的圈合成一張圖。** Veblen 1912 年證明，所有點都是雙數，等於這張圖可以拆成好幾個沒有共用線的圈（[Wikipedia: Veblen's theorem](https://en.wikipedia.org/wiki/Veblen%27s_theorem)）。反過來，把幾個不共用線的圈畫在同一張圖上，只要彼此有相接的點，就是一張可以從任何點出發的一筆畫圖。想要 2 個單數點，就再拿掉一條線或加一段路。
3. **先隨便畫一張圖，再補線。** NetworkX 的 `eulerize` 會在一張圖上補最少的線，讓它變成可以一筆畫的圖（[NetworkX 文件](https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.euler.eulerize.html)）。要注意它補的是「重複的線」，也就是讓同兩點之間多一條線，這正是市面遊戲當成後期規則的那種線。

不管用哪種做法，產生之後都要用程式檢查：圖有沒有連在一起、單數點是 0 或 2 個。

### 依難度排序：沒有找到公開的做法

市面遊戲都沒有公開。開源專案都是手工排的。學術上也沒有找到針對一筆畫的。下一節的建議是我的推論。

### 我自己算的幾個小例子

為了確認「亂走成功率」真的能把圖分開，我在暫存區寫了一個一次性的小程式，算了幾張簡單的圖（這不是遊戲程式，數字是我自己算的，沒有外部出處）。模型是：小孩從一個點出發，每一步在還沒畫的線裡**平均隨機**選一條，走到沒路就停。

| 圖 | 線數 | 單數點 | 隨機挑起點的成功率 | 從對的起點出發的成功率 | 失敗時，走錯那一步之後還畫了幾條線才發現 |
|---|---|---|---|---|---|
| 兩個三角形共用一點（蝴蝶結） | 6 | 0 | 73% | 中間點 100%；其他點 67% | 0.5 |
| 兩個正方形並排（日字形） | 7 | 2 | 33% | 100% | 不會失敗 |
| 一筆畫房子（正方形加兩條對角線加屋頂） | 8 | 2 | 33% | 81% | 0.2 |
| 五角星加外框五邊形 | 10 | 0 | 81% | 81% | 0.2 |
| 三角形的一個角外面多接一條線 | 4 | 2 | 42% | 67%／100% | 0（馬上就發現） |
| 兩個三角形中間用一條線連起來（啞鈴） | 7 | 2 | 22% | 67% | 3 |

幾件從這張表看得出來的事：

- **線多不等於難。** 五角星加五邊形有 10 條線，隨機成功率 81%；只有 7 條線的啞鈴，隨機成功率只有 22%。
- **有 2 個單數點的圖，隨機挑起點的成功率一定不超過「2 ÷ 點的數量」**，日字形 6 個點，最多就是 33%。這一項在「小孩還不知道要從單數點出發」的階段影響最大。
- **「三角形外接一條線」和「啞鈴」從對的起點出發，成功率都是 67%，但難度應該不一樣。** 這張圖走錯（先走外面那條線）會馬上停住，小孩立刻知道錯在哪；啞鈴走錯（先過中間那條橋）之後，還能順順地把另一個三角形畫完，畫了 3 條線才發現剩一個三角形回不去。錯誤和發現之間隔得越遠，小孩越難自己找出原因。
- **「有幾種畫法」不適合直接當難度。** 五角星加五邊形有 2640 種畫法，房子只有 88 種，但兩者從對的起點出發的成功率一樣都是 81%。畫法數量主要跟著線數一起變大，看不出走錯的機率。

---

## 建議用來估難度的數字

### 每個數字的來源

| 數字 | 怎麼算 | 為什麼可能有用 | 依據 |
|---|---|---|---|
| 線數 | 直接數 | 每次失敗要重畫多少；所有遊戲都用它加難度 | **有出處**（各遊戲說明）。但它單獨用不準，是推論（上面例子，以及數獨研究中「給幾個數字」只有 0.22–0.34 的相關） |
| 單數點個數（0 或 2） | 數每個點連幾條線 | 2 個時，起點選錯一定失敗 | 數學事實**有出處**；對小孩的影響有多大是**推論** |
| 能成功的起點佔幾成 | 對每個點，用程式檢查從它出發畫不畫得完 | 單數點 0 個時通常是 100%；2 個時是「2 ÷ 點數」 | 數學事實**有出處** |
| 隨機成功率（隨機挑起點） | 模擬隨便選路的小孩，算成功比例；圖小可以精確算，圖大就跑一萬次抽樣 | 同時反映起點和中途走錯的機率 | 模擬玩家的方法**有出處**（Jarušek 與 Pelánek）；套到一筆畫是**推論** |
| 隨機成功率（從對的起點出發） | 同上，但只從能成功的點出發 | 小孩學會挑起點之後，剩下的難度 | **推論** |
| 有沒有「怎麼走都會成功」的起點 | 拿掉該點後，剩下的圖有沒有圈 | 有的話，這張圖對知道起點的小孩幾乎沒有難度 | 判斷方法**有出處**（Ore 1951） |
| 走錯到發現之間隔幾條線 | 模擬時，每畫一條線就檢查剩下的圖還畫不畫得完；記下第一次變成畫不完的那一步，到真的沒路之間畫了幾條 | 隔越遠，小孩越難自己找出哪一步錯 | **推論**；迷宮的「死路越長越難」是類似的觀察，但證據薄弱 |
| 平均要畫幾條線才過關 | 模擬小孩：走到沒路就重來，重新隨機挑起點，一直到成功，算總共畫了幾條線 | 把線數、起點、走錯合成一個數字，代表「要花多少力氣」 | 做法照 Jarušek 與 Pelánek 改的，**套用是推論** |
| 沒有點的交叉有幾處、最小交叉角度 | 用點的座標算線段交叉 | 小孩可能以為交叉處可以轉彎；角度小容易看錯 | 大人看圖表的研究**有出處**（Purchase、Huang）；套到一筆畫是**推論** |
| 同兩點之間有幾組重複的線 | 直接數 | 市面遊戲把它當成後期的新規則 | 遊戲做法**有出處**；對小孩難度的影響**沒有數據** |

### 一個可以先試的難度算法（這整段是我的提議，沒有出處）

基本想法：主要排序用「平均要畫幾條線才過關」，交叉和重複線不加進分數，改成「這關之後才能出現」的條件，避免用一堆權重湊出一個沒人驗證過的分數。

```
對每一張候選的圖：
  先檢查：連在一起、單數點是 0 或 2 個。不符合就丟掉。

  模擬一萬次（圖夠小就精確算）：
    一個小孩，隨機挑一個點出發
    每一步在目前這個點還沒畫的線裡，平均隨機挑一條
    每畫一條，就檢查剩下的圖還畫不畫得完（剩下的線連在一起、
      而且剩下的單數點符合從目前位置畫完的條件）；
      第一次變成畫不完時，記下這是第幾條
    走到沒路：
      記錄「走錯之後又畫了幾條才停」
      如果還有線沒畫，算一次失敗，清掉重來，重新隨機挑起點
    全部畫完：記錄總共畫了幾條線

  得到：
    平均畫線數 = 平均總共畫了幾條線才過關    ← 主要排序用
    起點成功率 = 隨機挑起點就能成功的比例
    走錯後延遲 = 失敗時，走錯後平均又畫了幾條
    交叉數、重複線組數                         ← 用來決定從第幾關開始出現，不加分

關卡排序：
  依平均畫線數由小到大排
  前面一段只放：單數點 0 個、沒有交叉、沒有重複線
  2 個單數點的圖，從某一關開始才出現，出現後先放「從對的起點出發幾乎不會錯」的
  交叉、重複線，各自從某一關開始才出現，出現後的前幾關，平均畫線數要比前面低一點
  走錯後延遲大的圖，放在平均畫線數差不多的圖的後面
```

這個算法有幾個已知的問題：

- **真的小孩不會平均隨機選線。** Huang 的研究顯示人會先沿著看起來直的、近的線走；Jarušek 與 Pelánek 的模型也加了「往對的方向走的機率比較高」。可以加一個「優先直走」的偏好再算一次，看排序會不會大變。
- **小孩有「退一步」可以用，不會每次都整個重來。** 用重來算出來的數字會把大圖算得比實際難。也可以改成「沒路時退回最近一個有岔路的點」來模擬，兩種都算，看排序差多少。
- **起點那一項在小孩學會「從單數點出發」之後就不重要了。** 前期用「隨機挑起點」算，後期可以改用「從對的起點出發」算。什麼時候切換，要看自己的小孩什麼時候學會。

### 怎麼校正

Pelánek 的研究方法是拿真人解題時間，跟每個難度算法的排序比相關係數。我們可以照做，規模小很多（這段也是推論）：

1. 挑 20–30 張圖，平均畫線數從低到高平均分布，混入幾張有交叉、有重複線、走錯後延遲大的圖。
2. 讓小孩玩，記下每關花幾秒、重來幾次、退一步幾次、有沒有跳過。
3. 看「平均畫線數」排出來的順序，和小孩實際花的時間排出來的順序像不像。如果交叉或重複線的關卡明顯比算出來的難，就把它們開始出現的關卡往後移。

---

## 查不到或證據薄弱的地方

- **沒有任何人用真人玩一筆畫、量哪些圖比較難的研究。** 英文、中文、日文都查過。下面所有關於「人覺得難」的說法，都是從其他謎題或看圖研究推過來的。
- **沒有任何針對 6–10 歲小孩的資料。** 引用的研究對象是大人（數獨玩家、網路受試者、大學生）或數學資優的小學生。
- **市面遊戲都不公開難度算法和關卡排序方式。** 只能從官方說明看到「線變多」和「新規則」兩件事。
- **單數點 0 個和 2 個對小孩的實際難度差多少，沒有數據。**
- **線交叉的影響只有大人看圖表的研究**，任務是找最短路線，不是一筆畫。交叉處沒有點、小孩會不會以為能轉彎，沒有找到研究。
- **迷宮「死路越長越難」的說法**，我只找到設計者的分析和二手轉述，沒有讀到原始的真人實驗。
- **Ore 1951 年的原文沒有讀到**，「拿掉該點後沒有圈」這個判斷方法來自後人的文獻回顧和課程習題，兩處說法一致。
- **Blanco 與 García-Moya 2021 的全文**被網站擋住，只讀到摘要。
- 上面的小例子是我自己算的，只有六張圖，用來說明數字之間的差別，不能當成證據。

---

## 出處列表

### 市面遊戲與開源專案
- 1LINE（GAMINCAT）App Store：https://apps.apple.com/app/1179975506
- 1LINE TapTap 頁面（10 級 500 關版本、「線索藏在前面的關卡」）：https://www.taptap.io/tw/app/53087
- 一筆書きアプリ（Ecapyc）日本 App Store（680 關、特殊線）：https://apps.apple.com/jp/app/id494856551
- One touch Drawing（Ecapyc）英文說明，AppGoblin 轉錄：https://appgoblin.info/apps/494856551
- One Touch Drawing 評測（100 關）：https://www.addictivetips.com/mobile/one-touch-drawing-draw-unique-shapes-in-a-single-swipe-android-game
- One Line - Connect the dots App Store：https://apps.apple.com/vc/app/one-line-connect-the-dots/id1569827269
- One touch drawing: IQ Test App Store：https://apps.apple.com/in/app/id1403251654
- Fill（走格子的一筆畫，規則不同）App Store：https://apps.apple.com/JP/app/id1091456207
- handson-matsu/one-stroke-puzzle：https://github.com/handson-matsu/one-stroke-puzzle
- pndshch/hitofudegaki：https://github.com/pndshch/hitofudegaki
- leeenx/OneStroke：https://github.com/leeenx/OneStroke

### 數學
- Wikipedia: Eulerian path（存在條件、Fleury、計數是 #P-complete）：https://en.wikipedia.org/wiki/Eulerian_path
- labuladong：歐拉圖與一筆畫：https://labuladong.online/en/algo/data-structure-basic/eulerian-graph/
- Trinity College Dublin 講義（隨便走、不重複畫線的找法）：https://www.maths.tcd.ie/~stalker/22C00/lecture_21.pdf
- Chartrand、Oellermann、Ruiz, *Randomly H graphs*, Mathematica Slovaca 36 (1986)，含 Ore 1951 的回顧：https://dml.cz/bitstream/handle/10338.dmlcz/130913/MathSlov_36-1986-2_5.pdf
- Princeton COS 341 習題（randomly Eulerian 的判斷條件）：https://www.cs.princeton.edu/courses/archive/fall02/cs341/ps7.pdf
- Brightwell 與 Winkler, *Note on Counting Eulerian Circuits* (2004)：https://arxiv.org/abs/cs/0405067v1
- Wikipedia: Veblen's theorem：https://en.wikipedia.org/wiki/Veblen%27s_theorem
- NetworkX `eulerize` 文件：https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.euler.eulerize.html

### 人怎麼解謎題、怎麼看圖
- Pelánek, *Human Problem Solving: Sudoku Case Study* (2011)：https://www.fi.muni.cz/~xpelanek/publications/sudoku-tr.pdf
- Jarušek 與 Pelánek, *What Determines Difficulty of Transport Puzzles?* (FLAIRS 2011)：https://cdn.aaai.org/ocs/2518/2518-11200-1-PB.pdf
- Bellot 等人, *How to Generate Perfect Mazes?*：https://perso.limos.fr/~palafour/PAPERS/PDF/labyrinthe.pdf
- Purchase, *Which aesthetic has the greatest effect on human understanding?* (Graph Drawing 1997)：https://research.monash.edu/en/publications/which-aesthetic-has-the-greatest-effect-on-human-understanding/
- Huang, *An Eye Tracking Study into the Effects of Graph Layout* (2008)：https://ar5iv.labs.arxiv.org/html/0810.4431
- Blanco 與 García-Moya, *Graph Theory for Primary School Students with High Skills in Mathematics* (Mathematics, 2021)：https://www.mdpi.com/2227-7390/9/13/1567（摘要：https://api.crossref.org/works/10.3390/math9131567）
