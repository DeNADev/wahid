---
layout: default
title: Samples
---

## Wahid <span name="i18n" lang="en">Samples</span><span name="i18n" lang="ja">サンプル</span>
<canvas id="canvas" width="512px" height="256px"></canvas>
<script src="assets/createjs-min.js"></script>
<script src="javascripts/breakout.js"></script>
<script>
  canvas = document.getElementById('canvas');
  stage = new createjs.Stage(canvas);
  stage.addChild(breakout.initialize());
  breakout.handleReset = function() {
    stage.addChild(breakout.initialize());
  }
  createjs.Ticker.addEventListener('tick', function() {
    breakout.updateFrame();
    stage.update();
  });
</script>

<div name="i18n" lang="ja">

基本的に Wahid は CreateJS 向けに作成されたコンテンツを再生できます。ですので CreateJS のデモは Wahid のサンプルコードとしても有用です。しかしながらサポートしている機能の違いなどにより、再生するためには手直しが必要な場合もあります。CreateJS のデモを Wahid で動かすための設定などを解説します。

ここで扱う CreateJS のデモは CreateJS 0.7.1 時点のものです。

</div>
<div name="i18n" lang="en">

In general, Wahid can play animations created for CreateJS.  So samples for CreateJS are really good starting point for Wahid beginners.  Unfortunately, Wahid is not only compatibile with CreateJS but also optimized for smartphone games, sometimes you need to fix errors to play those samples.  We will explain how to run those samples on Wahid or why some errors occured.

The demos are as of CreateJS 0.7.1 .

</div>

### EaselJS
[https://github.com/CreateJS/EaselJS/tree/0.7.1/examples/](https://github.com/CreateJS/EaselJS/tree/0.7.1/examples/)

#### [APITest](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/APITest.html)

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低い API はサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>

* createjs.Graphics.beginBitmapFill
* createjs.Graphics.beginBitmapStroke
* createjs.Graphics.drawPolyStar
* createjs.Graphics.drawRoundRect
* createjs.Graphics.drawRoundRectComplex

<div name="i18n" lang="ja">
いくつかのフィルターは高負荷でゲームに適していないため、サポートしていません。
</div>
<div name="i18n" lang="en">
Due to high load, Some filters are not supported.
</div>

* createjs.BlurFilter

<div name="i18n" lang="ja">
createjs.ColorMatrixFilter のコンストラクタは Array ではなく createjs.ColorMatrix インスタンスを引数に取ります。
</div>
<div name="i18n" lang="en">
In this library, constructor of createjs.ColorMatrixFilter gets a instance of createjs.ColorMatrix instead Array.
</div>

<div name="i18n" lang="ja">
Wahid の Mask サポートは限定的です。
</div>
<div name="i18n" lang="en">
This library only provides limited mask functions.
</div>

#### [AlphaMaskReveal](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/AlphaMaskReveal.html)

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低い API はサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>

* createjs.Stage.enableMouseOver

<div name="i18n" lang="ja">
いくつかのフィルターは高負荷でゲームに適していないため、サポートしていません。
</div>
<div name="i18n" lang="en">
Due to high load, Some filters are not supported.
</div>

* createjs.AlphaMaskFilter
* createjs.BlurFilter

#### [BarGraph](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/BarGraph.html)

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低い API はサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>

* createjs.Graphics.drawPolyStar
* createjs.Graphics.drawRoundRectComplex

#### [BitmapAnimation](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/BitmapAnimation.html)

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低い API はサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>

* createjs.SpriteSheetUtils


#### [BitmapText](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/BitmapText.html)

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低い API はサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>

* createjs.BitmapText

#### [Cache](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/Cache.html)

<div name="i18n" lang="ja">
Wahid は独自のキャッシュを含む最適化機構を備えているため、明示的な cache API には対応していません。
</div>
<div name="i18n" lang="en">
This library implements custom optimization mechanism includes automatic caching, cache APIs are not supported.
</div>

* createjs.DisplayObject.cache
* createjs.DisplayObject.updateCache

<div name="i18n" lang="ja">
Wahid では createjs.Ticker.tick() が呼び出される前に createjs.Ticker.getMeasuredFPS() が呼ばれると、正しく動作しません。
</div>
<div name="i18n" lang="en">
In this library, createjs.Ticker.tick() should be called before calling createjs.Ticker.getMeasuredFPS().
</div>

#### [Cache_update](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/Cache_update.html)

<div name="i18n" lang="ja">
Wahid は独自のキャッシュを含む最適化機構を備えているため、明示的な cache API には対応していません。
</div>
<div name="i18n" lang="en">
This library implements custom optimization mechanism includes automatic caching, cache APIs are not supported.
</div>

* createjs.DisplayObject.cache
* createjs.DisplayObject.updateCache

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低い API はサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>

* createjs.Graphics.drawPolyStar

#### [Cache_vday](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/Cache_vday.html)

<div name="i18n" lang="ja">
Wahid は独自のキャッシュを含む最適化機構を備えているため、明示的な cache API には対応していません。
</div>
<div name="i18n" lang="en">
This library implements custom optimization mechanism includes automatic caching, cache APIs are not supported.
</div>

* createjs.DisplayObject.cache
* createjs.DisplayObject.updateCache

#### [CurveTo](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/CurveTo.html)

<div name="i18n" lang="ja">
Wahid では主に WebGL レンダリングを使用し、画面を毎フレーム消去することが前提となっていますので、createjs.Stage.clear() API には対応していません。
</div>
<div name="i18n" lang="en">
Wahid mainly uses WebGL rendering, it clears screen every frame.  So createjs.Stage.clear() API is not supported.
</div>

<div name="i18n" lang="ja">
Wahid では createjs.Object.clone() API を提供しません。
</div>
<div name="i18n" lang="en">
This library does not support createjs.Object.clone() API.
</div>

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低い API はサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>

* createjs.Point

#### [DoubleClickTest](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/DoubleClickTest.html)

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低いイベントはサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use events in smartphone games are not supported.
</div>
* dblclick

#### [DragAndDrop](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/DragAndDrop.html)

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低い API はサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>

* createjs.Stage.enableMouseOver

#### [DragAndDrop_hitArea](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/DragAndDrop_hitArea.html)

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低い API はサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>

* createjs.Stage.enableMouseOver
* createjs.DisplayObject.hitArea

#### [EventBubbling](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/EventBubbling.html)

<div name="i18n" lang="ja">
古い Android 端末では Event bubbling は速度低下の原因となります。そのため Wahid ではサポートしていません。
</div>
<div name="i18n" lang="en">
Event bubbling takes long time to dispatch an event from the stage object to this target on Android browser, so this library does not support it.
</div>

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低い API はサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>

* createjs.Stage.enableMouseOver

#### [ExtractFrame](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/ExtractFrame.html)

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低い API はサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>

* createjs.SpriteSheetUtils

#### [Filters](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/Filters.html)

<div name="i18n" lang="ja">
Wahid では createjs.Object.clone() API を提供しません。
</div>
<div name="i18n" lang="en">
This library does not support createjs.Object.clone() API.
</div>

<div name="i18n" lang="ja">
いくつかのフィルターは高負荷でゲームに適していないため、サポートしていません。
</div>
<div name="i18n" lang="en">
Due to high load, Some filters are not supported.
</div>

* createjs.BlurFilter

<div name="i18n" lang="ja">
Wahid は独自のキャッシュを含む最適化機構を備えているため、明示的な cache API には対応していません。
</div>
<div name="i18n" lang="en">
This library implements custom optimization mechanism includes automatic caching, cache APIs are not supported.
</div>

* createjs.DisplayObject.cache

<div name="i18n" lang="ja">
createjs.ColorMatrixFilter のコンストラクタは Array ではなく createjs.ColorMatrix インスタンスを引数に取ります。
</div>
<div name="i18n" lang="en">
In this library, constructor of createjs.ColorMatrixFilter gets a instance of createjs.ColorMatrix instead Array.
</div>

#### [Filters_input](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/Filters_input.html)

<div name="i18n" lang="ja">
Wahid は独自のキャッシュを含む最適化機構を備えているため、明示的な cache API には対応していません。
</div>
<div name="i18n" lang="en">
This library implements custom optimization mechanism includes automatic caching, cache APIs are not supported.
</div>

* createjs.DisplayObject.cache
* createjs.DisplayObject.updateCache

<div name="i18n" lang="ja">
いくつかのフィルターは高負荷でゲームに適していないため、サポートしていません。
</div>
<div name="i18n" lang="en">
Due to high load, Some filters are not supported.
</div>

* createjs.BlurFilter

#### [Filters_simple](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/Filters_simple.html)

<div name="i18n" lang="ja">
Wahid は独自のキャッシュを含む最適化機構を備えているため、明示的な cache API には対応していません。
</div>
<div name="i18n" lang="en">
This library implements custom optimization mechanism includes automatic caching, cache APIs are not supported.
</div>

* createjs.DisplayObject.cache
* createjs.DisplayObject.updateCache

<div name="i18n" lang="ja">
いくつかのフィルターは高負荷でゲームに適していないため、サポートしていません。
</div>
<div name="i18n" lang="en">
Due to high load, Some filters are not supported.
</div>

* createjs.BlurFilter

#### [Game](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/Game.html)

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低い API はサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>

* createjs.Sound.BrowserDetect
* createjs.LoadQueue.installPlugin

<div name="i18n" lang="ja">
Wahid では主に WebGL レンダリングを使用し、画面を毎フレーム消去することが前提となっていますので、createjs.Stage.clear() API には対応していません。
</div>
<div name="i18n" lang="en">
Wahid mainly uses WebGL rendering, it clears screen every frame.  So createjs.Stage.clear() API is not supported.
</div>

<div name="i18n" lang="ja">
このケースでは LoadQueue の current directory が異なります。
</div>
<div name="i18n" lang="en">
In this case, the current directory of LoadQueue is different.
</div>
<div name="i18n" lang="ja">
Shape.handleDetach した後は Shape.graphics が解放されるので描画できません。
</div>
<div name="i18n" lang="en">
After Shape.handleDetach(), Shape.graphics are released so it cannot render anymore.
</div>

#### [GlobalToLocal1](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/GlobalToLocal1.html)

<div name="i18n" lang="ja">
Wahid は独自のキャッシュを含む最適化機構を備えているため、明示的な cache API には対応していません。
</div>
<div name="i18n" lang="en">
This library implements custom optimization mechanism includes automatic caching, cache APIs are not supported.
</div>

* createjs.DisplayObject.cache
* createjs.DisplayObject.updateCache

<div name="i18n" lang="ja">
Wahid では Shape 描画時のメモリ消費量を抑えるため、積極的にスケーリングを使用しています。そのため Shape の形状やサイズによっては大きく画像がぼやけることもあります。
</div>
<div name="i18n" lang="en">
To reduce memory consumption, this library compress shape images so shape looks blurry.
</div>

#### [GlobalToLocal2](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/GlobalToLocal2.html)

<div name="i18n" lang="ja">
Wahid では主に WebGL レンダリングを使用し、画面を毎フレーム消去することが前提となっていますので、createjs.Stage.clear() API には対応していません。createjs.Stage.autoClear 属性も無視します。
</div>
<div name="i18n" lang="en">
Wahid mainly uses WebGL rendering, it clears screen every frame.  So createjs.Stage.clear() API is not supported.
</div>

#### [GraphicsReuse](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/GraphicsReuse.html)

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低い API はサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>

* createjs.Point

#### [GraphicsTest](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/GraphicsTest.html)

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低い API はサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>

* createjs.Graphics.beginBitmapFill
* createjs.Graphics.beginBitmapStroke
* createjs.Graphics.drawPolyStar

#### [GraphicsTestTiny](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/GraphicsTestTiny.html)

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低い API はサポートしていません。
</div>
<div name="i18n" lang="ev">
Some low use APIs in smartphone games are not supported.
</div>

* createjs.Graphics.beginBitmapFill
* createjs.Graphics.beginBitmapStroke
* createjs.Graphics.drawPolyStar

#### [Graphics_inject](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/Graphics_inject.html)

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低い API はサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>

* createjs.Graphics.inject

#### [Graphics_simple](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/Graphics_simple.html)

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低い API はサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>

* createjs.Graphics.drawRoundRect

<div name="i18n" lang="ja">
Wahid では Shape 描画時のメモリ消費量を抑えるため、積極的にスケーリングを使用しています。そのため Shape の形状やサイズによっては大きく画像がぼやけることもあります。
</div>
<div name="i18n" lang="en">
To reduce memory consumption, this library compress shape images so shape looks blurry.
</div>

#### [Graphics_winding](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/Graphics_winding.html)

<div name="i18n" lang="ja">
Wahid では Shape 描画時のメモリ消費量を抑えるため、積極的にスケーリングを使用しています。そのため Shape の形状やサイズによっては大きく画像がぼやけることもあります。
</div>
<div name="i18n" lang="en">
To reduce memory consumption, this library compress shape images so shape looks blurry.
</div>

#### [HelloWorld](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/HelloWorld.html)

<div name="i18n" lang="ja">
特に互換性の問題はありません。
</div>
<div name="i18n" lang="en">
There is no compatibility issues.
</div>

#### [HtmlElements](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/HtmlElements.html)

<div name="i18n" lang="ja">
特に互換性の問題はありません。
</div>
<div name="i18n" lang="en">
There is no compatibility issues.
</div>

#### [Icons](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/Icons.html)

<div name="i18n" lang="ja">
Wahid では createjs.Object.clone() API を提供しません。
</div>
<div name="i18n" lang="en">
This library does not support createjs.Object.clone() API.
</div>

<div name="i18n" lang="ja">
createjs.Sprite.spriteSheet プロパティは読み取り専用です。設定するためにはコンストラクタを使用してください。
</div>
<div name="i18n" lang="en">
createjs.Sprite.spriteSheet property is read-only.  To change it, use the constructor.
</div>

#### [LocalToGlobal](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/LocalToGlobal.html)

<div name="i18n" lang="ja">
特に互換性の問題はありません。
</div>
<div name="i18n" lang="en">
There is no compatibility issues.
</div>

#### [Masks](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/Masks.html)

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低い API はサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>

* createjs.Graphics.drawPolyStar

<div name="i18n" lang="ja">
いくつかのフィルターは高負荷でゲームに適していないため、サポートしていません。
</div>
<div name="i18n" lang="en">
Due to high load, Some filters are not supported.
</div>

* createjs.BlurFilter

<div name="i18n" lang="ja">
Wahid は独自のキャッシュを含む最適化機構を備えているため、明示的な cache API には対応していません。
</div>
<div name="i18n" lang="en">
This library implements custom optimization mechanism includes automatic caching, cache APIs are not supported.
</div>

* createjs.DisplayObject.cache

<div name="i18n" lang="ja">
Wahid での Mask サポートは限定的です。
</div>
<div name="i18n" lang="en">
This library only provides limited mask functions.
</div>

#### [MovieClip](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/MovieClip.html)

<div name="i18n" lang="ja">
特に互換性の問題はありません。
</div>
<div name="i18n" lang="en">
There is no compatibility issues.
</div>

#### [RollOverMouseOver](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/RollOverMouseOver.html)

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低いイベントはサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>

* mouseout
* mouseover
* rollout
* rollover

#### [Segments](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/Segments.html)

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低い API はサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>

* createjs.Graphics.drawRoundRectComplex
* createjs.Point

#### [Sparkles](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/Sparkles.html)

<div name="i18n" lang="ja">
Wahid では createjs.Object.clone() API を提供しません。
</div>
<div name="i18n" lang="en">
This library does not support createjs.Object.clone() API.
</div>

<div name="i18n" lang="ja">
Wahid では createjs.Ticker.tick() が呼び出される前に createjs.Ticker.getMeasuredFPS() が呼ばれると、正しく動作しません。
</div>
<div name="i18n" lang="en">
In this library, createjs.Ticker.tick() should be called before calling createjs.Ticker.getMeasuredFPS().
</div>

#### [SparklesFade](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/SparklesFade.html)

<div name="i18n" lang="ja">
Wahid では createjs.Object.clone() API を提供しません。
</div>
<div name="i18n" lang="en">
This library does not support createjs.Object.clone() API.
</div>

<div name="i18n" lang="ja">
Wahid では主に WebGL レンダリングを使用し、画面を毎フレーム消去することが前提となっていますので、createjs.Stage.clear() API には対応していません。createjs.Stage.autoClear 属性も無視します。
</div>
<div name="i18n" lang="en">
Wahid mainly uses WebGL rendering, it clears screen every frame.  So createjs.Stage.clear() API is not supported.
</div>

#### [SpriteSheet](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/SpriteSheet.html)

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低い API はサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>

* createjs.Graphics.beginBitmapFill

<div name="i18n" lang="ja">
tick event handler の event parameter に delta attribute はありません。
</div>
<div name="i18n" lang="en">
The `event` parameter of `tick` event handler does not have `delta` attribute.
</div>

<div name="i18n" lang="ja">
SpriteSheet に複数の Animation が設定されている箇所で正しく動作していません。
</div>
<div name="i18n" lang="en">
If SpriteSheet has multiple animation, it does not work well.
</div>

#### [SpriteSheetBuilder](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/SpriteSheetBuilder.html)

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低い API はサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>

* createjs.SpriteSheetBuilder

#### [SpriteSheet_simple](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/SpriteSheet_simple.html)

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低い API はサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>

* createjs.Graphics.beginBitmapFill

<div name="i18n" lang="ja">
tick event handler の event parameter に delta attribute はありません。
</div>
<div name="i18n" lang="en">
The `event` parameter of `tick` event handler does not have `delta` attribute.
</div>

<div name="i18n" lang="ja">
SpriteSheet に複数の Animation が設定されている箇所で正しく動作していません。
</div>
<div name="i18n" lang="en">
If SpriteSheet has multiple animation, it does not work well.
</div>

#### [Text_links](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/Text_links.html)

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低い API はサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>
* createjs.Stage.enableMouseOver

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低いイベントはサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>

* rollout
* rollover

#### [Text_multiline](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/Text_multiline.html)

<div name="i18n" lang="ja">
Text.getBounds() は正しい高さを返しません。代わりに Text.getMeasuredWidth() と Text.getMeasuredHeight() を利用できます。
</div>
<div name="i18n" lang="en">
Text.getBounds() does not return correct height.  Use Text.getMeasuredWidth() and Text.getMeasuredHeight() instead.
</div>

#### [Text_simple](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/Text_simple.html)

<div name="i18n" lang="ja">
特に互換性の問題はありません。
</div>
<div name="i18n" lang="en">
There is no compatibility issues.
</div>

#### [Transform](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/Transform.html)

<div name="i18n" lang="ja">
Wahid は独自のキャッシュを含む最適化機構を備えているため、明示的な cache API には対応していません。
</div>
<div name="i18n" lang="en">
This library implements custom optimization mechanism includes automatic caching, cache APIs are not supported.
</div>

* createjs.DisplayObject.cache
* createjs.DisplayObject.updateCache

#### [Transform_simple](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/Transform_simple.html)

<div name="i18n" lang="ja">
特に互換性の問題はありません。
</div>
<div name="i18n" lang="en">
There is no compatibility issues.
</div>

#### [TwoStages](https://github.com/CreateJS/EaselJS/blob/0.7.1/examples/TwoStages.html)

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低い API はサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>

* createjs.Stage.enableMouseOver

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低いイベントはサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use events in smartphone games are not supported.
</div>

* mouseout
* mouseover

<div name="i18n" lang="ja">
Wahid は Stage 外にポインタがある時のイベントを処理しません。
</div>
<div name="i18n" lang="en">
In this case, this library does not prosess pointer events when pointer is out of target Stage.
</div>

### TweenJS
[https://github.com/CreateJS/TweenJS/tree/0.5.1/examples/](https://github.com/CreateJS/TweenJS/tree/0.5.1/examples/)

#### [CssExample](https://github.com/CreateJS/TweenJS/tree/0.5.1/examples/CssExample.html)

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低い API はサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>

* createjs.CSSPlugin

#### [Example](https://github.com/CreateJS/TweenJS/tree/0.5.1/examples/Example.html)

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低い API はサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>

* Ease.bounceOut
* Tween.set

#### [MotionGuideBlitz](https://github.com/CreateJS/TweenJS/tree/0.5.1/examples/MotionGuideBlitz.html)

<div name="i18n" lang="ja">
特に互換性の問題はありません。
</div>
<div name="i18n" lang="en">
There is no compatibility issues.
</div>

#### [MotionGuideDemo](https://github.com/CreateJS/TweenJS/tree/0.5.1/examples/MotionGuideDemo.html)

<div name="i18n" lang="ja">
特に互換性の問題はありません。
</div>
<div name="i18n" lang="en">
There is no compatibility issues.
</div>

#### [MultiMotionDemo](https://github.com/CreateJS/TweenJS/tree/0.5.1/examples/MultiMotionDemo.html)

<div name="i18n" lang="ja">
特に互換性の問題はありません。
</div>
<div name="i18n" lang="en">
There is no compatibility issues.
</div>

#### [SimpleTweenDemo](https://github.com/CreateJS/TweenJS/tree/0.5.1/examples/SimpleTweenDemo.html)

<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低い API はサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>

* Ease.bounceOut

#### [SparkTable](https://github.com/CreateJS/TweenJS/tree/0.5.1/examples/SparkTable.html)


<div name="i18n" lang="ja">
モバイルゲームで使用頻度の低い API はサポートしていません。
</div>
<div name="i18n" lang="en">
Some low use APIs in smartphone games are not supported.
</div>

* Ease.getPowIn
* Ease.quartIn
* Ease.quintIn

<div name="i18n" lang="ja">
CreateJS の Ease.* はFunction を返しますが、Wahid は普通の Object インスタンスを返しますので、このデモのような使い方はできません。
</div>
<div name="i18n" lang="en">
CreateJS Ease.* returns Function object but Wahid returns Object object so this demo does not works well.
</div>

#### [TweenOnlyDemo](https://github.com/CreateJS/TweenJS/tree/0.5.1/examples/TweenOnlyDemo.html)

<div name="i18n" lang="ja">
レガシー機能のサポートはありません。
</div>
<div name="i18n" lang="en">
This library does not support legasy functions.
</div>

#### [Tween_Circles](https://github.com/CreateJS/TweenJS/tree/0.5.1/examples/Tween_Circles.html)

<div name="i18n" lang="ja">
このケースでは、初回クリック時は処理順番の都合で Stage.mouseX と Stage.mouseY が 0 を返しています。
</div>
<div name="i18n" lang="en">
In this case, Stage.mouseX and Stage.mouseY are 0 at first click due to processing order.
</div>

#### [Tween_SparkTable](https://github.com/CreateJS/TweenJS/tree/0.5.1/examples/Tween_SparkTable.html)

<div name="i18n" lang="ja">
CreateJS の Ease.* はFunction を返しますが、Wahid は普通の Object インスタンスを返しますので、このデモのような使い方はできません。
</div>
<div name="i18n" lang="en">
CreateJS Ease.* returns Function object but Wahid returns Object object so this demo does not works well.
</div>

<!--

### PreloadJS
https://github.com/CreateJS/PreloadJS/tree/0.4.1/examples/

#### [MediaGrid](https://github.com/CreateJS/TweenJS/tree/0.4.1/examples/MediaGrid.html)


#### [PluginSample](https://github.com/CreateJS/TweenJS/tree/0.4.1/examples/PluginSample.html)


#### [PreloadImages](https://github.com/CreateJS/TweenJS/tree/0.4.1/examples/PreloadImages.html)


#### [PreloadQueue](https://github.com/CreateJS/TweenJS/tree/0.4.1/examples/PreloadQueue.html)


#### [SpriteSheet](https://github.com/CreateJS/TweenJS/tree/0.4.1/examples/SpriteSheet.html)


### SoundJS
https://github.com/CreateJS/SoundJS/tree/0.5.2/examples/

#### [Game](https://github.com/CreateJS/SoundJS/tree/0.5.2/examples/Game.html)


#### [JustPlay](https://github.com/CreateJS/SoundJS/tree/0.5.2/examples/JustPlay.html)


#### [MediaPlayer](https://github.com/CreateJS/SoundJS/tree/0.5.2/examples/MediaPlayer.html)


#### [MobileSafe](https://github.com/CreateJS/SoundJS/tree/0.5.2/examples/MobileSafe.html)


#### [MusicVisualizer](https://github.com/CreateJS/SoundJS/tree/0.5.2/examples/MusicVisualizer.html)


#### [PreloadAndPlay](https://github.com/CreateJS/SoundJS/tree/0.5.2/examples/PreloadAndPlay.html)


#### [SoundExplosion](https://github.com/CreateJS/SoundJS/tree/0.5.2/examples/SoundExplosion.html)


#### [SoundGrid](https://github.com/CreateJS/SoundJS/tree/0.5.2/examples/SoundGrid.html)


#### [SoundTween](https://github.com/CreateJS/SoundJS/tree/0.5.2/examples/SoundTween.html)


#### [TestSuite](https://github.com/CreateJS/SoundJS/tree/0.5.2/examples/TestSuite.html)

-->

[<span name="i18n" lang="en">Home</span><span name="i18n" lang="ja">戻る</span>](./index.html)
