---
layout: default
title: DevIndex
---
<div name="i18n" lang="ja">

## Wahid 開発者向け情報

Wahid の開発に興味を持っていただいてありがとうございます。開発者向けの情報はこちらに集約しています。

### ドキュメント

[Wahid のアーキテクチャ](http://github.com/DeNADev/wahid/blob/master/documents/architecture.md)について詳説しています。開発コンセプト、設計指針とトレードオフ、具体的な各機能の実装と制限について詳しく説明していますので、Wahid の開発に関心をもっていただいた方はご一読ください。

* [Architecture](http://github.com/DeNADev/wahid/blob/master/documents/architecture.md)
* [Closure Compiler](http://developers.google.com/closure/compiler)
* [CreateJS](http://createjs.com/)
* [V8 Design Elements](http://github.com/v8/v8/wiki/Design%20Elements)
* [Google JavaScript Style](http://google.github.io/styleguide/javascriptguide.xml)
* [MIT License](http://github.com/DeNADev/wahid/blob/master/LICENSE.txt)

### Wahid のビルド手順

Wahid は多数の JavaScript ファイルから構築されていますが、ゲームからはそれらをコンパイルした単一ファイルを読み込むことを想定しています。Wahid をビルドするためには以下のツールが必要です。

* [Git](http://www.git-scm.com/)
* [Java Runtime or Java SDK](http://java.sun.com/)
* [GNU make](http://www.gnu.org/software/make/) or
  [Microsoft Make](http://visualstudio.com)

ソースコードをコンパイルするために、Wahid のリポジトリには [Google Closure Compiler](http://developers.google.com/closure/compiler) が含まれています。

Wahid をコンパイルするために、お手元の PC（もしくは Mac）にこのリポジトリを clone して make してください。
コマンドは次のようになります。

```shell
# git clone https://github.com/DeNADev/wahid.git
# cd wahid
# make release
```

### 重要事項

このライブラリは、デフォルトではゲームのページとサウンド再生用の`<iframe>`の間で**安全ではない**通信をしています。たとえば悪意のある JavaScript コードがゲームのページに含まれている場合、それらも`<iframe>`へサウンド再生のメッセージを送ることができます。もしゲームが**検証されていない** JavaScript ライブラリを使用しているなら、Wahid ライブラリをビルドする際に 'USE_FRAME=false' オプションを使用してください。このオプションを指定するとサウンド再生用の`<iframe>`ページの使用を禁止することができます。

```shell
# git clone https://github.com/DeNADev/wahid.git
# cd wahid
# make release USE_FRAME=false
```

### プロジェクトへの貢献について

プロジェクトへの貢献は歓迎されています。たとえば

* [バグレポートを投稿していただいたり](http://github.com/DeNADev/wahid/issues)
* [プルリクエストを送っていただく](http://github.com/DeNADev/wahid/pulls)

ことができます。

送ってくださるすぺてのバグレポートやプルリクエストに感謝しています。しかしながらこのライブラリは数々のゲームに利用されており、我々はそれらのゲームへの悪影響なしにバグを修正する義務があります（このリポジトリへの変更は遅かれ早かれそれらゲームへマージされます）。手戻りや悪影響を避けるため、我々は送っていただいたバグレポートを **WILL_NOT_FIX** とし、プルリクエストをマージすることができないこともあります（Architecture に書かれている通り、CreateJS との互換性の問題は多数あります。それらは速度やメモリ消費量の問題で修正することは難しいものです）。

我々は概ね Google JavaScript Style に従っており、貢献者の皆さんにも従っていただくことをお勧めします。一方我々のユースケースに合うようにそのルールを変えている部分もあります。

* ECMAScript 2015 は使用しないでください（このライブラリは ECMAScript 2015 の実装がない Android デバイスでも動作する必要があります）
* クロージャは使用しないでください（オブジェクトのリーク無しにクロージャを使うことは簡単ではありません。ゲームは大量のCreateJSオブジェクトを生成するので、小さなリークが致命傷になります）
* try-catch 文は使用しないでください。例外をキャッチしてしまうと、しばしばゲーム側の問題を含む、より大きな問題を隠してしまうことに繋がります
* コンストラクタで初期化する必要のないプロパティはプロトタイプに加えてください。プロパティをプロトタイプにおいてオーバーライドすることでV8 Design Elementsに書かれているように新しいhidden classが作られることになったとしても、オブジェクトの生成は高速化されます（ゲームではCreateJSオブジェクトから派生したオブジェクトを何千個も生成しますが、その際にゲームがフリーズしてしまっては意味はありません。ゲームはJavaScriptのベンチマークではないので、ベンチマークで遅いJavaScriptコードがゲームではより望ましいコードになることもあります）

## ライセンス

MIT License でライセンスされています。

[戻る](./index.html)

</div>
<div name="i18n" lang="en">

## Wahid Developer's Portal
Thanks for your interest in contributing Wahid project!  This page covers contributing this project.

### Documentation

We hope that [The WahidJS Inside](http://github.com/DeNADev/wahid/blob/master/documents/architecture.md) to be helpful for you to understand the design and code of this project.  It describes the architecture of this library, design principals and features details.

* [Architecture](http://github.com/DeNADev/wahid/blob/master/documents/architecture.md)
* [Closure Compiler](http://developers.google.com/closure/compiler)
* [CreateJS](http://createjs.com/)
* [V8 Design Elements](http://github.com/v8/v8/wiki/Design%20Elements)
* [Google JavaScript Style](http://google.github.io/styleguide/javascriptguide.xml)
* [MIT License](http://github.com/DeNADev/wahid/blob/master/LICENSE.txt)

### Building Wahid

Wahid consists of lots of JavaScript files and it assumes a game includes a
compiled file instead of including all JavaScript files. Wahid needs a PC (or a
Mac) having the following tools installed to build it from source files:

* [Git](http://www.git-scm.com/)
* [Java Runtime or Java SDK](http://java.sun.com/)
* [GNU make](http://www.gnu.org/software/make/) or
  [Microsoft Make](http://visualstudio.com)

(This repository includes Closure Compiler used for compiling source files.)

To compile wahid on your PC (or your Mac), clone this repository and run make
on the command line as listed blow:

```shell
# git clone https://github.com/DeNADev/wahid.git
# cd wahid
# make release
```

### IMPORTANT NOTICE

This library uses __unsecure__ communication between a game page and an
`<iframe>` page to play sounds in the background by default, i.e. malicious
JavaScript code in the game page can also send a message to the `<iframe>` page
to play sounds. If a game has to use this library with __unverified__
JavaScript libraries, compile this library with a 'USE_FRAME=false' option to
prohibit using `<iframe>` pages.

```shell
# git clone https://github.com/DeNADev/wahid.git
# cd wahid
# make release USE_FRAME=false
```

### Contributing Code

Contributions to this project is welcome, e.g.:

* [Submitting bug reports](http://github.com/DeNADev/wahid/issues), or;
* [Submitting pull requests](http://github.com/DeNADev/wahid/pulls).

We appreciate all your bug reports and pull requests. On the other hand, this
library is used by games and we __MUST__ fix bugs without regressions for them.
(Changes to this repository will be merged into games sooner or later.) To avoid
regressions, we does not only mark your bug reports as __WILL NOT FIX__ but
also we may not be able to merge your pull requests. (As written in
[Architecture], we have many compatibility issues that are hard to fix without
losing speed or increasing memory consumption.)

We in general follows Google JavaScript Style and we encourage contributors to
follow them when making their changes. On the other hand, we change some of its
rules to optimize them for our use cases:

* Do not use ECMAScript 2015. (This library must work well on Android devices
  that do not have ECMAScript 2015 implemented.)
* Do not use closures. (It is not so easy to use closures without object
  leaks. Games uses tens of thousands of [CreateJS] objects and a small leak
  in this library becomes a huge burden for them.)
* Do not use try-catch statements. Catching exceptions often hides bigger
  problems, including game problems.
* Attach object properties which we do not have to initialize in its constructor
  to its prototypes. Even though overriding a property on its prototype creates
  a new hidden class as written in [V8 Design Elements], it accelerates the
  speed of object creation. (Games create tens of thousands of objects derived
  from [CreateJS] ones at once and it does not make any sense to freeze them
  while creating them. That is, a game is not a JavaScript benchmark and slower
  JavaScript code sometimes becomes better game code.)

## License

This code is licensed under the [MIT License].

[Home](./index.html)

</div>
