Wahid Test Suite
=============

This test suite needs npm to run commands, so if npm is not installed on your machine, install it first.

To run test suite;

```Shell
# Build Wahid library.
$ cd ../
$ make
$ cd tests

# Install the JavaScript dependencies.
$ npm install

# Run tests.
# This command copies compiled Wahid files and launches a web browser automatically.
$ npm test
```

Notice
_____________
This test suite uses npm, Jasmine testing framework and modified js-image-diff libraries.
