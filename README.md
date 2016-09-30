# Wahid

A CreateJS-compatible library for games

## Documentation

* [Inside wahid]

## Building Wahid

Wahid consists of lots of JavaScript files and it assumes a game includes a
compiled file instead of including all JavaScript files. This library needs a PC
(or a Mac) having the following tools installed to build it from its source
files:
* [Git](http://www.git-scm.com/);
* [Java Runtime or Java SDK](http://java.sun.com/);
* [GNU make](http://www.gnu.org/software/make/) or
  [Microsoft Make](http://visualstudio.com).

(This repository includes a copy of [Closure Compiler] and you do not have to
install it.)

To build this library from its source files on your PC (or your Mac), clone this
repository and run make on the command line as listed below.

```shell
# git clone https://github.com/DeNADev/wahid.git
# cd wahid
# make
```

## IMPORTANT NOTICE

This library uses __unsecure__ communication between a game page and an
`<iframe>` page to play sounds in the background by default, i.e. malicious
JavaScript code in the game page can also send messages to the `<iframe>` page
to control sounds. If a game has to use this library with __untrusted__
JavaScript libraries, compile this library with a 'USE_FRAME=false' option to
prohibit using the `<iframe>` page as listed below.

```shell
# git clone https://github.com/DeNADev/wahid.git
# cd wahid
# make USE_FRAME=false
```

## Contributing Code

Contributions to this project is welcome. Especially, it is definitely welcome
for you to [Submit bug reports](http://github.com/DeNADev/wahid/issues) or
[Submit pull requests](http://github.com/DeNADev/wahid/pulls).

We appreciate your bug reports and pull requests. On the other hand, this
library is used by games and we __MUST__ fix bugs without regressions for them.
(Changes to this repository will be merged into games sooner or later.) To avoid
regressions, we may mark your bug reports as __WILL NOT FIX__. (As written in
[Inside wahid], we have many compatibility issues that are not so easy to fix
without losing speed or increasing memory consumption.)

We in general follows [Google JavaScript Style] and we would encourage
contributors to follow its rules when making their changes. Nevertheless, we
override some rules and add more.

* Each line should be 80 characters or less.
* Do not use ECMAScript 2015. (This library must work well on Android devices
  that do not have ECMAScript 2015 implemented.)
* Do not use closures. (It is not so easy to use closures without object
  leaks. Games uses tens of thousands of [CreateJS] objects and a small leak
  in this library becomes a huge burden for them.)
* Do not use try-catch statements. Catching exceptions often hides bigger
  problems, including game problems.
* Attach object properties which we do not have to initialize in its constructor
  to its prototypes. Even though overriding a property on its prototype creates
  a new hidden class as written in [V8 Design Elements], less constructor code
  makes it faster to create an object.

We would also encourage contributors to build this library without warning or
errors before submitting their pull requests. (This library uses
[advanced compilation] and contributors may need greater care to build this
library without errors or warnings.)

## License

This code is licensed under the [MIT License].

[advanced compilation]: http://developers.google.com/closure/compiler/docs/api-tutorial3
[Inside wahid]: http://github.com/DeNADev/wahid/blob/master/documents/architecture.md
[Closure Compiler]: http://developers.google.com/closure/compiler
[CreateJS]: http://createjs.com/
[V8 Design Elements]: http://github.com/v8/v8/wiki/Design%20Elements
[Google JavaScript Style]: http://google.github.io/styleguide/javascriptguide.xml
[Google C++ Style]: http://google.github.io/styleguide/cppguide.html#Line_Length
[MIT License]: http://github.com/DeNADev/wahid/blob/master/LICENSE.txt
