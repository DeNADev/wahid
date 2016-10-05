---
layout: default
title: FAQs
---
<div name="i18n" lang="ja">

## よくある質問
よくある質問と答えです。

#### Q: CreateJS で用意されている API が実装されていません
A: 設計上の都合で公開する API を取捨選択しています。多くの場合、他の API で代用できたり、もしくはより効率的な実装方法に変更することで、求める機能を実装できます。[互換性情報](./compatibilities.html)の項や[サンプル](./samples.html)もご覧ください。

A: また Wahid は CreateJS 0.7.1 を基にして開発されています。それ以前に削除されたり、これ以降に追加された API には対応していません。

#### Q: 必要な attribute が公開されていません
A: Wahid では実行時効率を追求するため、不要なアクセサを削除しています。

#### Q: Ticker の setFPS() 関数で設定した値が無視されます
A: Ticker の setFPS() 関数で 60 の約数以外の値を設定した場合、内部で 60 の約数に切り下げられます。たとえば createjs.Ticker.setFPS(24) と設定した場合 20 FPS で動作します

#### Q: Chrome で表示されません
A: ローカル環境での開発中は Google Chrome のローカルファイルアクセス制限に引っかかっていないかご確認ください。

#### Q: 特定のイベントが発生しません
A: Wahid は CreateJS で実装されているすべてのイベントに対応しているわけではありません。[互換性リスト](./compatibilities.html)の各 API のイベントの項をご確認ください。

#### Q: タッチしても反応しません
A: この1行を追加してください。

```JavaScript
stage.enableMouseOver();
createjs.Touch.enable(stage); // Add this line.
```

#### Q: ダブルクリックに反応しません
A: Wahid は以下の使用頻度が低いイベントをサポートしていません。

pointerenter, pointerleave, mouseenter, mouseleave, dblclick, rollover, rollout

#### Q: Shape がぼやけます
A: Wahid では実行時のメモリ消費量を節約するため、Shape を縮小した後スケーリングして表示しています。そのため Shape の作り方によってはぼやけて表示されます。


[戻る](./index.html)

</div>
<div name="i18n" lang="en">

## FAQ
Frequently Asked Questions.


#### Q: Some APIs are not implemented.
A: Wahid took different design from CreateJS so some APIs are not implemented or exported.  In some case, there are more effective way to implement functions you want.  Please see also [Compalitibily List](./compatibilities.html) and [Samples](./samples.html).

A: Wahid is based on CreateJS 0.7.1 so deprecated APIs on 0.7.1 or below, and added APIs on 0.8.x or above are not implemented in this library.

#### Q: Some attributes are not exported.
A: To optimize runtime performance, Wahid provides limited accessor to CreateJS objects.

#### Q: Ticker.setFPS() ignores parameter value.
A: Ticker.setFPS() rounds down the parameter value to a divisor of 60. (If you order createjs.Ticker.setFPS(24), the library runs at 20 fps.)

#### Q: Cannot see in my PC Chrome.
A: Google Chrome blocks to access local files.

#### Q: Some events do not fire.
A: Wahid is not implements all event type of CreateJS.  Please check the 'event' table of APIs in the [Compatibility List](./compatibilities.html).

#### Q: Cannot handle touch events.
A: Add this line.

```JavaScript
stage.enableMouseOver();
createjs.Touch.enable(stage); // Add this line.
```

#### Q: Cannot handle 'dblclick' event.
A: Wahid does not support some less frequently used events.

pointerenter, pointerleave, mouseenter, mouseleave, dblclick, rollover, rollout

#### Q: Shape looks blurry.
A: To reduce memory consumption, Wahid automatically compress Shape size.

[Home](./index.html)

</div>
