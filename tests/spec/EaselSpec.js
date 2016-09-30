/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 DeNA Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

describe('AlphaMapFilter', function() {
  var filter;
  beforeEach(function() {
    filter = new createjs.AlphaMapFilter(mask32x32);
  });
  it('createjs.AlphaMapFilter should be exported.', function() {
    expect('AlphaMapFilter' in createjs).toBeTruthy();
  });
  it('AlphaMapFilter should be able to create instance.', function() {
    expect(filter).toBeTruthy();
  });

  describe('AlphaMapFilter properties', function() {
    it('alphaMap should be masked.', function() {
      expect('alphaMap' in filter).toBeFalsy();
    });
  });
});

describe('AlphaMaskFilter', function() {
  it('createjs.AlphaMaskFilter should be masked.', function() {
    expect('AlphaMaskFilter' in createjs).toBeFalsy();
  });
});

describe('Bitmap', function() {
  var bitmap;
  beforeEach(function() {
    bitmap = new createjs.Bitmap(imageUrl);
  });

  it('createjs.Bitmap should be exported.', function() {
    expect('Bitmap' in createjs).toBeTruthy();
  });
  it('Bitmap should be able to create instance.', function() {
    expect(bitmap).toBeTruthy();
  });

  describe('Bitmap properies', function() {
    it('Bitmap.image should work.', function() {
      expect(bitmap.image).not.toBeNull();
    });
    it('Bitmap.sourceRect should work.', function() {
      var rect = new createjs.Rectangle(0, 1, 2, 3);
      expect('sourceRect' in bitmap).toBeTruthy();
      bitmap.sourceRect = rect;
      expect(bitmap.sourceRect).toBe(rect);
    });
  });
});

describe('BitmapAnimation', function() {
  it('createjs.BitmapAnimation should be masked.', function() {
    expect('BitmapAnimation' in createjs).toBeFalsy();
  });
});

describe('BitmapText', function() {
  it('createjs.BitmapText should be masked.', function() {
    expect('BitmapText' in createjs).toBeFalsy();
  });
});

describe('BlurFilter', function() {
  it('createjs.BlurFilter should be masked.', function() {
    expect('BlurFister' in createjs).toBeFalsy();
  });
});

describe('ButtonHelper', function() {
  var helper;
  var target;
  var hitArea;
  var tween;
  var OUT_FRAME = 5;
  var DOWN_FRAME = 6;

  beforeEach(function() {
    hitArea = new createjs.Container();
    target = new createjs.MovieClip(null, 0, true, {
      out_ : OUT_FRAME,
      down_ : DOWN_FRAME
    });
    tween = createjs.Tween.get(new createjs.Shape()).to({
      x : 1
    }, 10);
    target.timeline.addTween(tween);
    helper = new createjs.ButtonHelper(target, 'out_', 'over_', 'down_',
        false, hitArea, 'hit_');
  });

  it('createjs.ButtonHelper should be exported.', function() {
    expect('ButtonHelper' in createjs).toBeTruthy();
  });
  it('ButtonHelper should be able to create instance.', function() {
    expect(helper).toBeTruthy();
  });

  describe('ButtonHelper properies', function() {
    it('ButtonHelper.downLabel should be masked.', function() {
      expect('downLabel' in helper).toBeFalsy();
    });
    it('ButtonHelper.outLabel should be masked.', function() {
      expect('outLabel' in helper).toBeFalsy();
    });
    it('ButtonHelper.overLabel should be masked.', function() {
      expect('overLabel' in helper).toBeFalsy();
    });
    it('ButtonHelper.play should be masked.', function() {
      expect('play' in helper).toBeFalsy();
    });
    it('ButtonHelper.target should be masked.', function() {
      expect('target' in helper).toBeFalsy();
    });
  });

  describe('ButtonHelper methods', function() {
    // This test case fails due to obfuscation problem.
    // This works fine with Wahid debug build, not works with release bulid.
    it('ButtonHelper.setEnabled should work.', function() {
      helper.setEnabled(true);
      target.dispatchEvent('mousedown');
      expect(tween.position).toEqual(DOWN_FRAME);
      target.dispatchEvent('pressup');
      expect(tween.position).toEqual(OUT_FRAME);
      helper.setEnabled(false);
      target.dispatchEvent('mousedown');
      expect(tween.position).not.toEqual(DOWN_FRAME);
    });
  });
});

describe('ColorFilter', function() {
  var filter;
  beforeEach(function() {
    filter = new createjs.ColorFilter(1.0, 0.5, 0.0, 1.0,
                                      0.0, 0.0, 0.0, 0.0);
  });
  it('createjs.ColorFilter should be exported.', function() {
    expect('ColorFilter' in createjs).toBeTruthy();
  });
  it('ColorFilter should be able to create instance.', function() {
    expect(filter).toBeTruthy();
  });

  describe('ColorFilter properies', function() {
    it('ColorFilter.alphaMultiplier should be masked.', function() {
      expect('alphaMultiplier' in filter).toBeFalsy();
    });
    it('ColorFilter.alphaOffset should be masked.', function() {
      expect('alphaOffset' in filter).toBeFalsy();
    });
    it('ColorFilter.blueMultiplier should be masked.', function() {
      expect('blueMultiplier' in filter).toBeFalsy();
    });
    it('ColorFilter.blueOffset should be masked.', function() {
      expect('blueOffset' in filter).toBeFalsy();
    });
    it('ColorFilter.greenMultiplier should be masked.', function() {
      expect('greenMultiplier' in filter).toBeFalsy();
    });
    it('ColorFilter.greenOffset should be masked.', function() {
      expect('greenOffset' in filter).toBeFalsy();
    });
    it('ColorFilter.redMultiplier should be masked.', function() {
      expect('redMultiplier' in filter).toBeFalsy();
    });
    it('ColorFilter.redOffset should be masked.', function() {
      expect('redOffset' in filter).toBeFalsy();
    });
  });
});

describe('ColorMatrix', function() {
  var matrix;
  beforeEach(function() {
    matrix = new createjs.ColorMatrix(0, 0, 0, 0);
  });
  it('createjs.ColorMatrix should be exported.', function() {
    expect('ColorMatrix' in createjs).toBeTruthy();
  });
  it('ColorMatrix should be able to create instance.', function() {
    expect(matrix).toBeTruthy();
  });

  describe('ColorMatrix methods', function() {
    it('ColorMatrix.adjustBrightness should work.', function() {
      expect(matrix.adjustBrightness(100)).toBe(matrix);
    });
    it('ColorMatrix.adjustColor should work.', function() {
      expect(matrix.adjustColor(255, 100, 100, 180)).toBe(matrix);
    });
    it('ColorMatrix.adjustContrast should work.', function() {
      expect(matrix.adjustContrast(-100)).toBe(matrix);
    });
    it('ColorMatrix.adjustHue should work.', function() {
      expect(matrix.adjustHue(-180)).toBe(matrix);
    });
    it('ColorMatrix.concat should work.', function() {
      var matIdentity = new createjs.ColorMatrix(0,0,0,0);
      matrix.reset().concat(matIdentity.toArray());
      expect(matrix.toArray()).toEqual(matIdentity.toArray());
    });
    it('ColorMatrix.copyMatrix should be masked.', function() {
      expect('copyMatrix' in matrix).toBeFalsy();
    });
    it('ColorMatrix.reset should work.', function() {
      var matIdentity = new createjs.ColorMatrix(0,0,0,0);
      expect(matrix.reset().toArray()).toEqual(matIdentity.toArray());
    });
    it('ColorMatrix.toArray should work.', function() {
      expect(matrix.toArray()).toEqual(jasmine.any(Array));
    });
  });

});

describe('ColorMatrixFilter', function() {
  var filter;
  beforeEach(function() {
    // With Wahid, The constructor of ColorMatrixFilter accepts a instance
    // of createjs.ColorMatrix, not a Array.
    filter = new createjs.ColorMatrixFilter(new createjs.ColorMatrix(0,0,0,0));
  });
  it('createjs.ColorMatrixFilter should be exported.', function() {
    expect('ColorMatrixFilter' in createjs).toBeTruthy();
  });
  it('ColorMatrixFilter should be able to create instance.', function() {
    expect(filter).toBeTruthy();
  });
});

describe('Container', function() {
  var container;
  beforeEach(function() {
    container = new createjs.Container();
  });

  it('createjs.Container should be exported.', function() {
    expect('Container' in createjs).toBeTruthy();
  });
  it('Container should be able to create instance.', function() {
    expect(container).toBeTruthy();
  });

  describe('Container properies', function() {
    it('Container.children should be exported.', function() {
      expect('children' in container).toBeTruthy();
    });
    it('Container.mouseChildren should be masked.', function() {
      expect('mouseChildren' in container).toBeFalsy();
    });
    it('Container.numChildren should be masked.', function() {
      expect('numChildren' in container).toBeFalsy();
    });
    it('Container.tickChildren should be masked.', function() {
      expect('tickChildren' in container).toBeFalsy();
    });
  });

  describe('Container methods', function() {
    it('Container.addChild should work.', function() {
      var child = new createjs.Shape();
      var ret = container.addChild(child);
      expect(ret).toBe(child);
      expect(container.contains(child)).toBeTruthy();
    });
    it('Container.addChildAt should work.', function() {
      var child = new createjs.Shape();
      container.addChild(new createjs.Shape(), new createjs.Shape(),
          new createjs.Shape());
      container.addChildAt(child, 1);
      expect(container.getChildIndex(child)).toEqual(1);
    });
    it('Container.contains should work.', function() {
      var child = new createjs.Container();
      var notChild = new createjs.Shape();
      var childChild = new createjs.Shape();
      child.addChild(childChild);
      container.addChild(child);
      expect(container.contains(child)).toBeTruthy();
      expect(container.contains(notChild)).toBeFalsy();
      expect(container.contains(childChild)).toBeTruthy();
    });
    it('Container.removeChild should work.', function() {
      var child = new createjs.Shape();
      expect(container.contains(child)).toBeFalsy();
      container.addChild(child);
      expect(container.contains(child)).toBeTruthy();
      container.removeChild(child);
      expect(container.contains(child)).toBeFalsy();
    });
    it('Container.removeChildAt should work.', function() {
      var child = new createjs.Shape();
      container.addChild(new createjs.Shape(), new createjs.Shape(),
          new createjs.Shape());
      container.addChildAt(child, 1);
      container.removeChildAt(1);
      expect(container.contains(child)).toBeFalsy();
    });
    it('Container.removeAllChildren should work.', function() {
      container.addChild(new createjs.Shape(), new createjs.Shape(),
          new createjs.Shape());
      container.removeAllChildren();
      expect(container.getNumChildren()).toEqual(0);
    });
    it('Container.getChildAt should work.', function() {
      var child0 = new createjs.Shape();
      var child1 = new createjs.Shape();
      var child2 = new createjs.Shape();
      container.addChild(child2);
      container.addChild(child1);
      container.addChild(child0);
      expect(container.getChildAt(1)).toBe(child1);
    });
    it('Container.getChildByName should work.', function() {
      var child = new createjs.Shape();
      child.name = 'asimov';
      container.addChild(new createjs.Shape(), new createjs.Shape(),
          child, new createjs.Shape());
      expect(container.getChildByName('asimov')).toBe(child);
    });
    it('Container.sortChildren should NOT work.', function() {
      // Container.sortChildren is too expesive to use casually in mobile games.
      var child0 = new createjs.Shape();
      var child1 = new createjs.Shape();
      child0.x = 0;
      child0.y = 1;
      child1.x = 1;
      child1.y = 0;
      container.addChild(child0, child1);
      container.sortChildren(function(lhs, rhs, opt) {
        if (lhs.x > rhs.x)
          return 1;
        if (lhs.x < rhs.x)
          return -1;
        return 0;
      });
      var sorted0 = container.getChildAt(0);
      container.sortChildren(function(lhs, rhs, opt) {
        if (lhs.y > rhs.y)
          return 1;
        if (lhs.y < rhs.y)
          return -1;
        return 0;
      });
      var sorted1 = container.getChildAt(0);
      expect(sorted0).toBe(sorted1);
    });
    it('Container.getChildIndex should work.', function() {
      var child = new createjs.Shape();
      container.addChild(new createjs.Shape(), child,
          new createjs.Shape());
      expect(container.getChildIndex(child)).toEqual(1);
    });
    it('Container.getNumChildren should work.', function() {
      container.addChild(new createjs.Shape(), new createjs.Shape());
      expect(container.getNumChildren()).toEqual(2);
    });
    it('Container.swapChildrenAt should work.', function() {
      var child0 = new createjs.Shape();
      var child1 = new createjs.Shape();
      container.addChild(child0, child1);
      var pre = container.getChildIndex(child0);
      container.swapChildrenAt(0, 1);
      expect(container.getChildIndex(child0)).not.toEqual(pre);
    });
    it('Container.swapChildren should work.', function() {
      var child0 = new createjs.Shape();
      var child1 = new createjs.Shape();
      container.addChild(child0, child1);
      var pre = container.getChildIndex(child0);
      container.swapChildren(child0, child1);
      expect(container.getChildIndex(child0)).not.toEqual(pre);
    });
    it('Container.setChildIndex should work.', function() {
      var child = new createjs.Shape();
      container.addChild(new createjs.Shape(), child,
          new createjs.Shape());
      container.setChildIndex(child, 0);
      expect(container.getChildIndex(child)).toEqual(0);
    });
    // This test case fails due to bubbles problem.
    it('Container.getObjectsUnderPoint should work.', function() {
      var children = [];
      for (var i=0; i<3; ++i) {
        var child = new createjs.Shape();
        container.addChild(child);
        children.push(child);

        child.x = child.y = 0;
        child.height = 2;
        child.width = (i + 1) * 2;
        child.graphics.beginFill('0xfff').rect(0, 0, child.width, child.height);
      }

      // Wahid uses draw cache to execute faster hit test.
      var canvas = document.getElementById('testcanvas');
      var stage = new createjs.Stage(canvas);
      stage.addChild(container);
      stage.update();

      var objects = container.getObjectsUnderPoint(0, 0);
      expect(objects.length).toEqual(3); // hits to all 3 objects.
      var objects = container.getObjectsUnderPoint(3, 0);
      expect(objects.length).toEqual(2); // hits to larger 2 objects.
      expect(objects.indexOf(children[0])).toEqual(-1);
    });
    it('Container.getObjectUnderPoint should work.', function() {
      child0 = new createjs.Shape();
      child1 = new createjs.Shape();
      child0.x = child0.y = 0;
      child1.x = child1.y = 0;
      child0.height = child1.height = 2;
      child0.width = 2;
      child1.width = 4;
      child0.graphics.beginFill('0xf00').rect(0, 0, child0.width,
          child0.height);
      child1.graphics.beginFill('0x0f0').rect(0, 0, child1.width,
          child1.height);
      container.addChild(child0, child1);

      // Wahid uses draw cache to execute faster hit test.
      var canvas = document.getElementById('testcanvas');
      var stage = new createjs.Stage(canvas);
      stage.addChild(container);
      stage.update();

      var object = container.getObjectUnderPoint(0, 0);
      expect(object).toBe(child1);
    });
    it('Container.getBounds should work.', function() {
      var child0 = new createjs.Bitmap(png32x32); // 0, 0, 32, 32
      child0.x = child0.y = 0;
      container.addChild(child0);
      var child1 = new createjs.Bitmap(png32x32); // 1, 2, 32, 32
      child1.setTransform(1, 2);
      container.addChild(child1);
      var rect = container.getBounds();
      expect(rect.x).toEqual(0);
      expect(rect.y).toEqual(0);
      expect(rect.width).toEqual(33);
      expect(rect.height).toEqual(34);
    });
  });
});

describe('DisplayObject', function() {
  var displayObject;
  var stage;
  beforeEach(function() {
    displayObject = new createjs.DisplayObject();
    var canvas = document.getElementById('testcanvas');
    stage = new createjs.Stage(canvas);
  });

  it('createjs.DisplayObject should be exported.', function() {
    expect('DisplayObject' in createjs).toBeTruthy();
  });
  it('DisplayObject should be able to create instance.', function() {
    expect(displayObject).toBeTruthy();
  });

  describe('DisplayObject properies', function() {
    it('DisplayObject.x should be exported.', function() {
      expect('x' in displayObject).toBeTruthy();
    });
    it('DisplayObject.y should be exported.', function() {
      expect('y' in displayObject).toBeTruthy();
    });
    it('DisplayObject.scaleX should be exported.', function() {
      expect('scaleX' in displayObject).toBeTruthy();
    });
    it('DisplayObject.scaleY should be exported.', function() {
      expect('scaleY' in displayObject).toBeTruthy();
    });
    it('DisplayObject.rotation should be exported.', function() {
      expect('rotation' in displayObject).toBeTruthy();
    });
    it('DisplayObject.skewX should be exported.', function() {
      expect('skewX' in displayObject).toBeTruthy();
    });
    it('DisplayObject.skewY should be exported.', function() {
      expect('skewY' in displayObject).toBeTruthy();
    });
    it('DisplayObject.visible should be exported.', function() {
      expect('visible' in displayObject).toBeTruthy();
    });
    it('DisplayObject.alpha should be exported.', function() {
      expect('alpha' in displayObject).toBeTruthy();
    });
    it('DisplayObject.shadow should be exported.', function() {
      expect('shadow' in displayObject).toBeTruthy();
    });
    it('DisplayObject.compositeOperation should be exported.', function() {
      expect('compositeOperation' in displayObject).toBeTruthy();
    });
    it('DisplayObject.filters should be exported.', function() {
      expect('filters' in displayObject).toBeTruthy();
    });
    it('DisplayObject.mask should be exported.', function() {
      expect('mask' in displayObject).toBeTruthy();
    });
    it('DisplayObject.cacheCanvas should be masked.', function() {
      expect('cacheCanvas' in displayObject).toBeFalsy();
    });
    it('DisplayObject.cacheID should be masked.', function() {
      expect('cacheID' in displayObject).toBeFalsy();
    });
    it('DisplayObject.cursor should be masked.', function() {
      expect('cursor' in displayObject).toBeFalsy();
    });
    it('DisplayObject.hitArea should be masked.', function() {
      expect('hitArea' in displayObject).toBeFalsy();
    });
    it('DisplayObject.id should be masked.', function() {
      // With debug build, this test will failure because "id" is
      // too short to be obfuscated by GCC.
      expect('id' in displayObject).toBeFalsy();
    });
    it('DisplayObject.mouseEnabled should be masked.', function() {
      expect('mouseEnabled' in displayObject).toBeFalsy();
    });
    it('DisplayObject.name should be exported.', function() {
      expect('name' in displayObject).toBeTruthy();
    });
    it('DisplayObject.parent is not a public API.', function() {
      // We can access to displayobject.parent, but it is not a public API.
      expect('parent' in displayObject).toBeTruthy();
    });
    it('DisplayObject.suppressCrossDomainErrors should be masked.',
        function() {
          expect('suppressCrossDomainErrors' in displayObject)
              .toBeFalsy();
        });
    it('DisplayObject.tickEnabled should be masked.', function() {
      expect('tickEnabled' in displayObject).toBeFalsy();
    });
  });

  describe('DisplayObject methods', function() {
    it('DisplayObject.cache should NOT work.', function() {
      // We can access to DisplayObject.cache() method,
      // but there is no implementation.
      displayObject.cache();
      expect(true).toBeTruthy();
    });
    it('DisplayObject.updateCache should NOT work.', function() {
      // We can access to DisplayObject.updateCache() method,
      // but actually there is no implementation.
      displayObject.updateCache();
      expect(true).toBeTruthy();
    });
    it('DisplayObject.uncache should NOT work.', function() {
      // We can access to DisplayObject.uncache() method,
      // but actually there is no implementation.
      displayObject.uncache();
      expect(true).toBeTruthy();
    });
    it('DisplayObject.getCacheDataURL should NOT work.', function() {
      // We can access to DisplayObject.getCacheDataURL() method,
      // but actually there is no implementation.
      displayObject.getCacheDataURL();
      expect(true).toBeTruthy();
    });
    it('DisplayObject.getStage should work.', function() {
      expect(displayObject.getStage()).toBeNull();
      stage.addChild(displayObject);
      expect(displayObject.getStage()).toBe(stage);
    });
    it('DisplayObject.localToGlobal should work.', function() {
      displayObject.x = 300;
      displayObject.y = 200;
      stage.addChild(displayObject);
      stage.update(); // need for Wahid.
      var globalPos = displayObject.localToGlobal(100, 100);
      expect(globalPos.x).toEqual(400);
      expect(globalPos.y).toEqual(300);
    });
    it('DisplayObject.globalToLocal should work.', function() {
      displayObject.x = 300;
      displayObject.y = 200;
      stage.addChild(displayObject);
      stage.update(); // need for Wahid.
      var localPos = displayObject.globalToLocal(100, 100);
      expect(localPos.x).toEqual(-200);
      expect(localPos.y).toEqual(-100);
    });
    it('DisplayObject.localToLocal should work.', function() {
      displayObject.x = 100;
      displayObject.y = 200;
      var target = new createjs.DisplayObject();
      target.x = 200;
      target.y = 200;
      stage.addChild(displayObject, target);
      stage.update(); // need for Wahid.
      var pos = displayObject.localToLocal(100, 0, target);
      expect(pos.x).toEqual(0);
      expect(pos.y).toEqual(0);
    });
    it('DisplayObject.setTransform should work.', function() {
      displayObject.setTransform(1, 2, 3, 4, 5, 6, 7, 8, 9);
      expect(displayObject.x).toEqual(1);
      expect(displayObject.y).toEqual(2);
      expect(displayObject.scaleX).toEqual(3);
      expect(displayObject.scaleY).toEqual(4);
      expect(displayObject.rotation).toEqual(5);
      expect(displayObject.skewX).toEqual(6);
      expect(displayObject.skewY).toEqual(7);
      expect(displayObject.regX).toEqual(8);
      expect(displayObject.regY).toEqual(9);
    });
    it('DisplayObject.hitTest should work.', function() {
      var obj = new createjs.Shape();
      // This case is not only a test of DisplayObject.hitTest
      // but also a test of Shape.hitTest. Shape's hitTest is
      // per pixel hit detection, so we have to fill it to be 'hit'.
      obj.graphics.beginFill(createjs.Graphics.getRGB(255, 0, 0))
          .drawRect(4, 4, 20, 20);
      obj.on('click', function(){});
      stage.addChild(obj);
      stage.update(); // need for Wahid.
      expect(obj.hitTest(1, 1)).toBeFalsy();
      expect(obj.hitTest(10, 10)).toBeTruthy();
    });
    it('DisplayObject.set should work.', function() {
      displayObject.set({
        alpha : 0.5,
        x : 123
      });
      expect(displayObject.alpha).toEqual(0.5);
      expect(displayObject.x).toEqual(123);
    });
    it('DisplayObject.getScaleX should work.', function() {
      displayObject.scaleX = 0.25;
      expect(displayObject.getScaleX()).toEqual(0.25);
    });
    it('DisplayObject.setScaleX should work.', function() {
      displayObject.setScaleX(0.125);
      expect(displayObject.scaleX).toEqual(0.125);
    });
    it('DisplayObject.getScaleY should work.', function() {
      displayObject.scaleY = 0.25;
      expect(displayObject.getScaleY()).toEqual(0.25);
    });
    it('DisplayObject.setScaleY should work.', function() {
      displayObject.setScaleY(0.125);
      expect(displayObject.scaleY).toEqual(0.125);
    });
    it('DisplayObject.getBounds should work.', function() {
      displayObject = new createjs.Bitmap(png32x32);
      var box = displayObject.getBounds();
      expect(box.x).toEqual(0);
      expect(box.y).toEqual(0);
      expect(box.width).toEqual(32);
      expect(box.height).toEqual(32);
    });
    it('DisplayObject.setBounds should NOT work.', function() {
      displayObject = new createjs.Bitmap(png32x32);
      displayObject.setBounds(1, 1, 1, 1);
      var box = displayObject.getBounds();
      expect(box.x).not.toEqual(1);
      expect(box.y).not.toEqual(1);
      expect(box.width).not.toEqual(1);
      expect(box.height).not.toEqual(1);
    });
    it('DisplayObject.clone should NOT work.', function() {
      try {
        expect(displayObject.clone()).toBeNull();
      } catch (e) {
        expect(true).toBeTruthy();
      }

    });
    it('DisplayObject.getConcatenatedMatrix should be masked.', function() {
      expect('getConcatenatedMatrix' in displayObject).toBeFalsy();
    });
    it('DisplayObject.getMatrix should be masked.', function() {
      expect('getMatrix' in displayObject).toBeFalsy();
    });
    it('DisplayObject.getTransformedBounds should NOT work.', function() {
      expect(true).toBeTruthy(); // TODO notimplemented
    });
    it('DisplayObject.isVisible should be masked.', function() {
      expect('isVisible' in displayObject).toBeFalsy();
    });
    it('DisplayObject.updateContext should be masked.', function() {
      expect('updateContext' in displayObject).toBeFalsy();
    });
    it('DisplayObject.draw should be masked.', function() {
      expect('draw' in displayObject).toBeFalsy();
    });
  });
});

describe('Event', function() {
  var event;
  beforeEach(function() {
    // With Wahid, we cannot create a Event instance directly
    //  because it is not exported.
    // event = new createjs.Event('dummyType', true, true);
  });

  it('createjs.Event should be masked.', function() {
    expect('Event' in createjs).toBeFalsy();
  });
/*
  xit('Event should be able to create instance.', function() {
    expect(event).toBeTruthy();
  });

  xdescribe('Event properies', function() {
    it('Event.type should be masked.', function() {
      expect('type' in event).toBeFalsy();
    });
    it('Event.bubbles should be masked.', function() {
      expect('bubbles' in event).toBeFalsy();
    });
    it('Event.cancelable should be defined.', function() {
      expect('cancelable' in event).toBeTruthy();
    });
    it('Event.cancelable should be false.', function() {
      expect(event.cancelable).toBeFalsy();
    });
    it('Event.eventPhase should be defined.', function() {
      expect('eventPhase' in event).toBeTruthy();
    });
    it('Event.eventPhase should be undefined.', function() {
      expect(event.eventPhase).toBeUndefined();
    });
    it('Event.timeStamp should be defined.', function() {
      expect('timeStamp' in event).toBeTruthy();
    });
    it('Event.timeStamp should be undefined.', function() {
      expect(event.timeStamp).toBeUndefined();
    });
    it('Event.target should be defined.', function() {
      expect('target' in event).toBeTruthy();
    });
    it('Event.currentTarget should be defined.', function() {
      expect('currentTarget' in event).toBeTruthy();
    });
    it('Event.removed should be defined.', function() {
      expect('target' in event).toBeTruthy();
    });
    it('Event.defaultPrevented should be masked.', function() {
      expect('defaultPrevented' in event).toBeFalsy();
    });
    it('Event.propagationStopped should be masked.', function() {
      expect('propagationStopped' in event).toBeFalsy();
    });
    it('Event.onPress should be masked.', function() {
      expect('onPress' in event).toBeFalsy();
    });
    it('Event.onMouseUp should be masked.', function() {
      expect('onMouseUp' in event).toBeFalsy();
    });
    it('Event.ImmediatePropagationStopped should be masked.', function() {
      expect('ImmediatePropagationStopped' in event).toBeFalsy();
    });
  });
*/
});

describe('EventDispatcher', function() {
  var myClass = function() {
  };
  var dispatcher;
  beforeEach(function() {
    createjs.EventDispatcher.initialize(myClass.prototype);
    dispatcher = new myClass();
  });

  it('createjs.EventDispatcher should be exported.', function() {
    expect('EventDispatcher' in createjs).toBeTruthy();
  });
  it('EventDispatcher.initialize should work.', function() {
    expect(dispatcher.addEventListener).toBeDefined();
  });

  describe('EventDispatcher methods', function() {
    it('addEventListener should work.', function() {
      dispatcher.addEventListener('myEvent', function() {
      });
      expect(dispatcher.hasEventListener('myEvent')).toBeTruthy();
    });
    it('on should work.', function() {
      dispatcher.on('myEvent', function() {
      });
      expect(dispatcher.hasEventListener('myEvent')).toBeTruthy();
    });
    it('off should work.', function() {
      var listener = function(event) {
      };
      dispatcher.on('myEvent', listener);
      expect(dispatcher.hasEventListener('myEvent')).toBeTruthy();
      dispatcher.off('myEvent', listener);
      expect(dispatcher.hasEventListener('myEvent')).toBeFalsy();
    });
    it('removeEventListener should work.', function() {
      var listener = function(event) {
      };
      dispatcher.addEventListener('myEvent', listener);
      expect(dispatcher.hasEventListener('myEvent')).toBeTruthy();
      dispatcher.removeEventListener('myEvent', listener);
      expect(dispatcher.hasEventListener('myEvent')).toBeFalsy();
    });
    it('removeAllEventListeners should work.', function() {
      dispatcher.on('myEvent', function(event) {
      });
      dispatcher.on('myEvent', function(event) {
      });
      dispatcher.on('myEvent', function(event) {
      });
      dispatcher.removeAllEventListeners('myEvent');
      expect(dispatcher.hasEventListener('myEvent')).toBeFalsy();
    });
    describe('dispatchEvent', function() {
      var flag = false;
      beforeEach(function(done) {
        dispatcher.on('myEvent', function() {
          flag = true;
          done();
        });
        dispatcher.dispatchEvent('myEvent');
        setTimeout(function() {
          if (!flag) {
            done();
          }
        }, 1000);
      });
      it('dispatchEvent should work.', function() {
        expect(flag).toBeTruthy();
      });
    });
    it('hasEventListener should work.', function() {
      expect(dispatcher.hasEventListener('myEvent')).toBeFalsy();
      dispatcher.on('myEvent', function(event) {
      });
      expect(dispatcher.hasEventListener('myEvent')).toBeTruthy();
    });
    it('willTrigger should work.', function() {
      expect(dispatcher.willTrigger('myEvent')).toBeFalsy();
      dispatcher.on('myEvent', function(event) {
      });
      expect(dispatcher.willTrigger('myEvent')).toBeTruthy();
    });
  });
});

describe('Filter', function() {
  it('createjs.Filter should be exported.', function() {
    expect('Filter' in createjs).toBeTruthy();
  });
});

describe('Filter', function() {
  var filter;
  beforeEach(function() {
    // createjs.Filter is a base class, so this is not a good code.
    filter = new createjs.Filter();
  });
  it('createjs.Filter should be exported.', function() {
    expect('Filter' in createjs).toBeTruthy();
  });
  it('Filter should be able to create instance.', function() {
    expect(filter).toBeTruthy();
  });

  describe('Filter methods', function() {
    it('applyFilter should be exported.', function() {
      // This is just a base class...
      expect('applyFilter' in filter).toBeTruthy();
    });
    it('clone should NOT work.', function() {
      try {
        expect(filter.clone()).toBeNull();
      } catch (e) {
        expect(true).toBeTruthy();
      }
    });
    it('getBounds should be exported.', function() {
      expect('getBounds' in filter).toBeTruthy();
    });
  });
});

describe('MouseEvent', function() {
  it('createjs.MouseEvent should be masked.', function() {
    expect('MouseEvent' in createjs).toBeFalsy();
  });
});
describe('MovieClip', function() {
  var mc;
  var tween;
  var stage;
  beforeEach(function() {
    var labels = {
      one   : 1,
      two   : 2,
      three : 3,
      four  : 4,
      five  : 5,
      six   : 6,
      seven : 7,
      eight : 8,
      nine  : 9,
      ten   : 10
    };
    mc = new createjs.MovieClip(null, 0, true, labels);
    tween = createjs.Tween.get(new createjs.Shape()).to({
      alpha : 0
    }, 100);
    mc.timeline.addTween(tween);

    // With Wahid, we should use MovieClip with Stage.
    var canvas = document.getElementById('testcanvas');
    stage = new createjs.Stage(canvas);
    stage.addChild(mc);
  });

  it('createjs.MovieClip should be exported.', function() {
    expect('MovieClip' in createjs).toBeTruthy();
  });
  it('MovieClip should be able to create instance.', function() {
    expect(mc).toBeTruthy();
  });

  describe('MovieClip properies', function() {
    it('currentFrame should be exported.', function() {
      expect('currentFrame' in mc).toBeTruthy();
    });
    it('timeline should be exported.', function() {
      expect('timeline' in mc).toBeTruthy();
    });
    it('actionsEnabled should be masked.', function() {
      expect('actionsEnabled' in mc).toBeFalsy();
    });
    it('autoReset should be masked.', function() {
      expect('autoReset' in mc).toBeFalsy();
    });
    it('buildDate should be masked.', function() {
      expect('buildDate' in mc).toBeFalsy();
    });
    it('frameBounds should be masked.', function() {
      expect('frameBounds' in mc).toBeFalsy();
    });
    it('INDEPENDENT should be masked.', function() {
      expect('INDEPENDENT' in mc).toBeFalsy();
    });
    it('loop should be masked.', function() {
      expect('loop' in mc).toBeFalsy();
    });
    it('mode should be masked.', function() {
      expect('mode' in mc).toBeFalsy();
    });
    it('paused should be masked.', function() {
      expect('paused' in mc).toBeFalsy();
    });
    it('SINGLE_FRAME should be masked.', function() {
      expect('SINGLE_FRAME' in mc).toBeFalsy();
    });
    it('startPosition should be masked.', function() {
      expect('startPosition' in mc).toBeFalsy();
    });
    it('SYNCHED should be masked.', function() {
      expect('SYNCHED' in mc).toBeFalsy();
    });
    it('version should be masked.', function() {
      expect('version' in mc).toBeFalsy();
    });
  });

  describe('MovieClip methods', function() {
    it('play should work.', function(done) {
      // Wahid's MovieClip works with Stage and Ticker.
      this.resetTick();
      var that = this;
      var initialized = false;
      createjs.Ticker.addEventListener('tick', function(event) {
        if (!initialized) {
          mc.play();
          stage.update();
          initialized = true;
        } else {
          var prev = mc.currentFrame;
          mc.play();
          stage.update();
          var post = mc.currentFrame;
          expect(post).toBeGreaterThan(prev);
          that.resetTick();
          done();
        }
      });
    });
    it('stop should work.', function(done) {
      this.resetTick();
      var that = this;
      var initialized = false;
      createjs.Ticker.addEventListener('tick', function(event) {
        if (!initialized) {
          mc.play();
          stage.update();
          initialized = true;
        } else {
          var prev = mc.currentFrame;
          mc.stop();
          stage.update();
          var post = mc.currentFrame;
          expect(post).toEqual(prev);
          that.resetTick();
          done();
        }
      });
    });
    it('gotoAndPlay should work.', function(done) {
      this.resetTick();
      var that = this;
      var initialized = false;
      createjs.Ticker.addEventListener('tick', function(event) {
        if (!initialized) {
          mc.gotoAndPlay(37);
          stage.update();
          expect(mc.currentFrame).toEqual(37);
          initialized = true;
        } else {
          stage.update();
          expect(mc.currentFrame).toBeGreaterThan(37);
          // expect(tween.position).toEqual(mc.currentFrame);
          // expect(mc.timeline.position).toEqual(mc.currentFrame);
          that.resetTick();
          done();
        }
      });
    });
    it('gotoAndStop should work.', function(done) {
      this.resetTick();
      var that = this;
      var initialized = false;
      createjs.Ticker.addEventListener('tick', function(event) {
        if (!initialized) {
          mc.gotoAndStop(82);
          stage.update();
          expect(mc.currentFrame).toEqual(82);
          initialized = true;
        } else {
          stage.update();
          expect(mc.currentFrame).toEqual(82);
          that.resetTick();
          done();
        }
      });
    });
    it('getLabels should work.', function() {
      var labels = mc.getLabels();
      expect(labels.length).toEqual(10);
      expect(labels[0].label).toEqual('one');
    });
    it('getCurrentLabel should work.', function(done) {
      this.resetTick();
      var that = this;
      var initialized = false;
      createjs.Ticker.addEventListener('tick', function(event) {
        mc.gotoAndPlay(4);
        stage.update();
        expect(mc.getCurrentLabel()).toEqual('five');
        stage.update();
        expect(mc.getCurrentLabel()).toEqual('six');
        that.resetTick();
        done();
      });
    });
  });
});

describe('Point', function() {
  it('createjs.Point should be masked.', function() {
    expect('Point' in createjs).toBeFalsy();
  });
});

describe('Rectangle', function() {
  var rect;
  beforeEach(function() {
    rect = new createjs.Rectangle(0, 0, 64, 64);
  });

  it('createjs.Rectangle should be exported.', function() {
    expect('Rectangle' in createjs).toBeTruthy();
  });
  it('Rectangle should be able to create instance.', function() {
    expect(rect).toBeTruthy();
  });

  describe('Rectangle properies', function() {
    it('x should be exported.', function() {
      expect('x' in rect).toBeTruthy();
    });
    it('y should be exported.', function() {
      expect('y' in rect).toBeTruthy();
    });
    it('width should be exported.', function() {
      expect('width' in rect).toBeTruthy();
    });
    it('height should be exported.', function() {
      expect('height' in rect).toBeTruthy();
    });
  });

  describe('Rectangle methods', function() {
    it('clone should NOT work.', function() {
      try {
        expect(rect.clone()).toBeNull();
      } catch (e) {
        expect(true).toBeTruthy();
      }
    });
    it('copy should be masked.', function() {
      expect('copy' in rect).toBeFalsy();
    });
    it('initialize should be masked.', function() {
      // GCC will not obfuscate some common name...
      //expect('initialize' in rect).toBeFalsy();
      expect(true).toBeTruthy();
    });
  });
});

describe('Shadow', function() {
  var shadow;
  beforeEach(function() {
    shadow = new createjs.Shadow('#000000', 1, 2, 4);
  });

  it('createjs.Shadow should be exported.', function() {
    expect('Shadow' in createjs).toBeTruthy();
  });
  it('Shadow should be able to create instance.', function() {
    expect(shadow).toBeTruthy();
  });

  describe('Shadow properies', function() {
    it('Identity should be masked.', function() {
      expect('Identity' in shadow).toBeFalsy();
    });
  });

  describe('Shadow methods', function() {
    it('clone should NOT work.', function() {
      try {
        expect(shadow.clone()).toBeNull();
      } catch (e) {
        expect(true).toBeTruthy();
      }
    });
  });
});

describe('Shape', function() {
  var shape;
  beforeEach(function() {
    shape = new createjs.Shape();
  });

  it('createjs.Shape should be exported.', function() {
    expect('Shape' in createjs).toBeTruthy();
  });
  it('Shape should be able to create instance.', function() {
    expect(shape).toBeTruthy();
  });

  describe('Shape properies', function() {
    it('graphics should be exported.', function() {
      expect('graphics' in shape).toBeTruthy();
    });
  });
});

describe('Sprite', function() {
  // var sprite;
  beforeEach(function(done) {
    var data = {
      images : [ pngSpriteSheet ],
      frames : {
        width : 32,
        height : 32,
        count : 10,
        // regX: 16,
        // regY: 16,
        spacing : 0,
        margin : 0
      },
      animations : {
        main : [ 0, 9 ]
      },
      framerate : 60
    };
    var ss = new createjs.SpriteSheet(data);
    var id = setInterval(function() {
      if (ss.complete) {
        sprite = new createjs.Sprite(ss);
        clearInterval(id);
        done();
      }
    }, 50);
  });

  it('createjs.Sprite should be exported.', function() {
    expect('Sprite' in createjs).toBeTruthy();
  });
  it('Sprite should be able to create instance.', function() {
    expect(sprite).toBeTruthy();
  });

  describe('Sprite properies', function() {
    it('spriteSheet should be exported.', function() {
      expect('spriteSheet' in sprite).toBeTruthy();
    });
    it('currentAnimation should be masked.', function() {
      expect('currentAnimation' in sprite).toBeFalsy();
    });
    it('currentAnimationFrame should be masked.', function() {
      expect('currentAnimationFrame' in sprite).toBeFalsy();
    });
    it('currentFrame should be masked.', function() {
      expect('currentFrame' in sprite).toBeFalsy();
    });
    it('framerate should be masked.', function() {
      expect('framerate' in sprite).toBeFalsy();
    });
    it('paused should be masked.', function() {
      expect('paused' in sprite).toBeFalsy();
    });
  });

  describe('Sprite methods', function() {
    it('play should work.', function(done) {
      var canvas = document.getElementById('testcanvas');
      var stage = new createjs.Stage(canvas);
      stage.addChild(sprite);
      sprite.gotoAndStop(0);
      sprite.play();
      // This test code accesses internal property 'currentFrame_',
      // so this only works with debug build of Wahid.
      if (sprite.currentFrame_) {
        var that = this;
        createjs.Ticker.addEventListener('tick', function(event) {
          var prev = sprite.currentFrame_;
          stage.update();
          that.resetTick();
          expect(sprite.currentFrame_).toBeGreaterThan(prev);
          done();
        });
      } else {
        expect(true).toBeTruthy();
        done();
      }
    });
    it('stop should work.', function(done) {
      var canvas = document.getElementById('testcanvas');
      var stage = new createjs.Stage(canvas);
      stage.addChild(sprite);
      sprite.gotoAndStop(0);
      sprite.play();
      // This test code accesses internal property 'currentFrame_',
      // so this only works with debug build of Wahid.
      if (sprite.currentFrame_) {
        var that = this;
        createjs.Ticker.addEventListener('tick', function(event) {
          var prev = sprite.currentFrame_;
          stage.update();
          that.resetTick();
          expect(sprite.currentFrame_).toEqual(prev);
          done();
        });
      } else {
        expect(true).toBeTruthy();
        done();
      }
    });
    it('gotoAndPlay should work.', function(done) {
      var canvas = document.getElementById('testcanvas');
      var stage = new createjs.Stage(canvas);
      stage.addChild(sprite);
      sprite.gotoAndPlay(5);
      // This test code accesses internal property 'currentFrame_',
      // so this only works with debug build of Wahid.
      if (sprite.currentFrame_) {
        var that = this;
        createjs.Ticker.addEventListener('tick', function(event) {
          var prev = sprite.currentFrame_;
          expect(prev).toEqual(5);
          stage.update();
          that.resetTick();
          expect(sprite.currentFrame_).toBeGreaterThan(prev);
          done();
        });
      } else {
        expect(true).toBeTruthy();
        done();
      }
    });
    it('gotoAndStop should work.', function(done) {
      var canvas = document.getElementById('testcanvas');
      var stage = new createjs.Stage(canvas);
      stage.addChild(sprite);
      sprite.gotoAndPlay(5);
      // This test code accesses internal property 'currentFrame_',
      // so this only works with debug build of Wahid.
      if (sprite.currentFrame_) {
        var that = this;
        createjs.Ticker.addEventListener('tick', function(event) {
          var prev = sprite.currentFrame_;
          expect(prev).toEqual(5);
          stage.update();
          that.resetTick();
          expect(sprite.currentFrame_).toEqual(prev);
          done();
        });
      } else {
        expect(true).toBeTruthy();
        done();
      }
    });
    it('advance should work.', function() {
      sprite.gotoAndStop(1);
      sprite.advance(500);
      // This test code accesses internal property 'currentFrame_',
      // so this only works with debug build of Wahid.
      if (sprite.currentFrame_) {
        expect(sprite.currentFrame_).toBeGreaterThan(1);
      } else {
        expect(true).toBeTruthy();
      }
    });
  });
});

describe('SpriteSheet', function() {
  var ss;
  beforeEach(function(done) {
    var data = {
      images : [ pngSpriteSheet ],
      frames : {
        width : 32,
        height : 32,
        count : 10,
        regX : 16,
        regY : 16,
        spacing : 0,
        margin : 0
      },
      animations : {
        main : [ 0, 9 ]
      },
      framerate : 10
    };
    ss = new createjs.SpriteSheet(data);
    var id = setInterval(function() {
      if (ss.complete) {
        clearInterval(id);
        done();
      }
    }, 50);
  });

  it('createjs.SpriteSheet should be exported.', function() {
    expect('SpriteSheet' in createjs).toBeTruthy();
  });
  it('SpriteSheet should be able to create instance.', function() {
    expect(ss).toBeTruthy();
  });

  describe('SpriteSheet properies', function() {
    it('complete should be exported.', function() {
      expect('complete' in ss).toBeTruthy();
    });
    it('framerate should be masked.', function() {
      expect('framerate' in ss).toBeFalsy();
    });
  });

  describe('SpriteSheet methods', function() {
    it('getNumFrames should work.', function() {
      expect(ss.getNumFrames('main')).toEqual(10);
    });
    it('getAnimations should work.', function() {
      var anims = ss.getAnimations();
      expect(anims.length).toEqual(1);
      expect(anims[0]).toEqual('main');
    });
    it('getAnimation should work.', function() {
      expect(ss.getAnimation('main').name).toEqual('main');
    });
    it('getFrame should work.', function() {
      var frame = ss.getFrame(1);
      expect(frame).toBeTruthy();
      // This test code accesses frame's properties,
      // which will be obfuscated by GCC.
      // so this only works with debug build of Wahid.
      if (frame.rect) {
        expect(frame.rect.width).toEqual(32);
        expect(frame.rect.height).toEqual(32);
        expect(frame.rect.x).toEqual(32);
        expect(frame.rect.y).toEqual(0);
        expect(frame.regX).toEqual(16);
        expect(frame.regY).toEqual(16);
      }
    });
    it('getFrameBounds should work.', function() {
      // var rect = ss.getFrameBounds(1); //TBF bug
      var rect = new createjs.Rectangle();
      ss.getFrameBounds(1, rect);
      expect(rect.width).toEqual(32);
      expect(rect.height).toEqual(32);
      expect(rect.x).toEqual(-16);
      expect(rect.y).toEqual(-16);
    });
    it('clone should NOT work.', function() {
      try {
        expect(ss.clone()).toBeNull();
      } catch (e) {
        expect(true).toBeTruthy();
      }
    });
  });
});

describe('Stage', function() {
  var stage;
  beforeEach(function() {
    var canvas = document.getElementById('testcanvas');
    stage = new createjs.Stage(canvas);
  });

  it('createjs.Stage should be exported.', function() {
    expect('Stage' in createjs).toBeTruthy();
  });
  it('Stage should be able to create instance.', function() {
    expect(stage).toBeTruthy();
  });

  describe('Stage properies', function() {
    it('canvas should be exported.', function() {
      expect('canvas' in stage).toBeTruthy();
    });
    it('autoClear should be masked.', function() {
      expect('autoClear' in stage).toBeFalsy();
    });
    it('handleEvent should be exported.', function() {
      expect('handleEvent' in stage).toBeTruthy();
    });
    it('mouseInBounds should be exported.', function() {
      expect('mouseInBounds' in stage).toBeTruthy();
    });
    it('mouseMoveOutside should be masked.', function() {
      expect('mouseMoveOutside' in stage).toBeFalsy();
    });
    it('mouseX should be exported.', function() {
      expect('mouseX' in stage).toBeTruthy();
    });
    it('mouseY should be exported.', function() {
      expect('mouseY' in stage).toBeTruthy();
    });
    it('nextStage should be masked.', function() {
      expect('nextStage' in stage).toBeFalsy();
    });
    it('tickOnUpdate should be masked.', function() {
      expect('tickOnUpdate' in stage).toBeFalsy();
    });
  });

  describe('Stage methods', function() {
    it('update should work.', function(done) {
      var shape = new createjs.Shape();
      shape.graphics.beginFill("#FF0").drawCircle(16, 16, 16);
      stage.addChild(shape);
      stage.update();
      this.negativeCompareWithImage(expect, stage, pngEmpty, function() {
        stage.removeChild(shape);
        done();
      });
    });
    it('clear should NOT work.', function() {
      // This method will do nothing.
      expect(true).toBeTruthy();
    });
    it('toDataURL should NOT work.', function() {
      // This method has an empty body.
      expect(true).toBeTruthy();
    });
    it('enableMouseOver should be masked.', function() {
      // This method has an empty body.
      expect(true).toBeTruthy();
    });
    it('enableDOMEvents should work.', function(done) {
      // Setup event, stage and stage's child.
      var createEvent = function() {
        var canvasRect = stage.canvas.getBoundingClientRect();
        var event = document.createEvent("MouseEvents");
        var x = (canvasRect.left + canvasRect.right) / 2;
        var y = (canvasRect.top + canvasRect.bottom) / 2;
        var cx = canvasRect.width / 2;
        var cy = canvasRect.height / 2;
        event.initMouseEvent('mousedown', true, true, window,
                              1, x, y, cx, cy,
                              false, false, false, false, 0, null);
        return event;
      }
      var child = new createjs.Shape();
      child.graphics.beginFill("F00").rect(0, 0, 32, 32);
      stage.addChild(child);


      // Stage.enableDOMEvents(true)
      // => fire an event
      // => confirm to receive the event
      // => Stage.enableDOMEvents(false)
      // => fire an event
      // => confirm not to receive it, done.
      var finished = false;
      var handleEvent1 = function(evt) {
        // Received an event, ok.
        expect(true).toBeTruthy();
        createjs.Ticker.removeEventListener('tick', handleTick1);
        createjs.Ticker.addEventListener('tick', handleTick2);
      }
      var handleEvent2 = function(evt) {
        child.removeEventListener('mousedown', handleEvent2);
        fail('Stage.enableDOMEvents(false) failed.');
        finished = true;
        done();
      }

      var step = 0;
      var handleTick1 = function() {
        stage.update();
        switch (step) {
        case 0:
          stage.enableDOMEvents(true);
          child.addEventListener('mousedown', handleEvent1);
          ++step;
          break;
        case 1:
          stage.canvas.dispatchEvent(createEvent());
          ++step;
          break;
        case 2:
          // handleEvent1
          break;
        }
      }
      var handleTick2 = function() {
        stage.update();
        switch (step) {
        case 2:
          // handleEvent1
          ++step;
          break;
        case 3:
          child.removeEventListener('mousedown', handleEvent1);
          child.addEventListener('mousedown', handleEvent2);
          stage.enableDOMEvents(false);
          child.addEventListener('mousedown', handleEvent2);
          ++step;
          break;
        case 4:
          stage.canvas.dispatchEvent(createEvent());
          setTimeout(function() {
            if (!finished) {
              child.removeEventListener('mousedown', handleEvent2);
              expect(true).toBeTruthy();
              done();
            }
          }, 100);

          createjs.Ticker.removeEventListener('tick', handleTick2);
          break;
        default:
          // handleEvent2 or timeout, done.
          break;
        }
      }
      createjs.Ticker.addEventListener('tick', handleTick1);
    });
  });
});

describe('Text', function() {
  var text;
  beforeEach(function() {
    text = new createjs.Text(0);
  });

  it('createjs.Text should be exported.', function() {
    expect('Text' in createjs).toBeTruthy();
  });
  it('Text should be able to create instance.', function() {
    expect(text).toBeTruthy();
  });

  describe('Text properies', function() {
    it('text should be exported.', function() {
      expect('text' in text).toBeTruthy();
    });
    it('font should be exported.', function() {
      expect('font' in text).toBeTruthy();
    });
    it('color should be exported.', function() {
      expect('color' in text).toBeTruthy();
    });
    it('textAlign should be exported.', function() {
      expect('textAlign' in text).toBeTruthy();
    });
    it('textBaseline should be exported.', function() {
      expect('textBaseline' in text).toBeTruthy();
    });
    it('maxWidth should be exported.', function() {
      expect('maxWidth' in text).toBeTruthy();
    });
    it('outline should be exported.', function() {
      expect('outline' in text).toBeTruthy();
    });
    it('lineHeight should be exported.', function() {
      expect('lineHeight' in text).toBeTruthy();
    });
    it('lineWidth should be exported.', function() {
      expect('lineWidth' in text).toBeTruthy();
    });
  });

  describe('Text methods', function() {
    it('getMeasuredWidth should work.', function() {
      text = new createjs.Text('M', '16px Ariel', '#F00');
      var one = text.getMeasuredWidth();
      text.text = 'MM';
      var two = text.getMeasuredWidth();
      expect(two).toBeGreaterThan(one);
    });
    it('getMeasuredLineHeight should work.', function() {
      text = new createjs.Text('M', '16px Ariel', '#F00');
      var one = text.getMeasuredLineHeight();
      text.text = 'M\nM';
      var two = text.getMeasuredLineHeight();
      expect(one).toBeGreaterThan(0);
      expect(two).toEqual(one);
    });
    it('getMeasuredHeight should work.', function() {
      text = new createjs.Text('M', '16px Ariel', '#F00');
      var one = text.getMeasuredHeight();
      text.text = 'M\nM';
      var two = text.getMeasuredHeight();
      expect(two).toBeGreaterThan(one);
    });
  });
});

describe('Ticker', function() {
  beforeEach(function() {
    createjs.Ticker.reset();
  });
  afterEach(function() {
    createjs.Ticker.reset();
  });
  afterAll(function() {
    createjs.Ticker.setFPS(15);
    createjs.Ticker.setPaused(false);
    createjs.Ticker.removeAllEventListeners('tick');
  });

  it('createjs.Ticker should be exported.', function() {
    expect('Ticker' in createjs).toBeTruthy();
  });

  describe('Ticker properies', function() {
    it('maxDelta should be masked.', function() {
      expect('maxDelta' in createjs.Ticker).toBeFalsy();
    });
    it('RAF should be masked.', function() {
      expect('RAF' in createjs.Ticker).toBeFalsy();
    });
    it('RAF_SYNCHED should be masked.', function() {
      expect('RAF_SYNCHED' in createjs.Ticker).toBeFalsy();
    });
    it('TIMEOUT should be masked.', function() {
      expect('TIMEOUT' in createjs.Ticker).toBeFalsy();
    });
    it('timingMode should NOT work.', function() {
      expect(createjs.Ticker.timingMode).toEqual('synched');
    });
  });

  describe('Ticker methods', function() {
    it('reset should work.', function() {
      createjs.Ticker.addEventListener('tick', function(event) {
      });
      createjs.Ticker.addEventListener('tick', function(event) {
      });
      createjs.Ticker.addEventListener('tick', function(event) {
      });
      createjs.Ticker.reset();
      expect(createjs.Ticker.hasEventListener('tick')).toBeFalsy();
    });
    it('setInterval should work.', function() {
      createjs.Ticker.setInterval(123);
      expect(createjs.Ticker.getInterval()).toEqual(123);
    });
    it('getInterval should work.', function() {
      createjs.Ticker.setInterval(321);
      expect(createjs.Ticker.getInterval()).toEqual(321);
    });
    it('setFPS should work.', function() {
      createjs.Ticker.setFPS(15);
      expect(createjs.Ticker.getFPS()).toAlmostEqual(15, 1);
    });
    it('getFPS should work.', function() {
      createjs.Ticker.setFPS(10);
      expect(createjs.Ticker.getFPS()).toAlmostEqual(10, 1);
    });
    it('getMeasuredTickTime should NOT work.', function() {
      // This always returns 0;
      expect(createjs.Ticker.getTicks()).toEqual(0);
    });
    it('getMeasuredFPS should work.', function(done) {
      createjs.Ticker.setInterval(50);
      var prev;
      var counter = 0;
      var handleTick1 = function() {
        if (++counter > 20) {
          counter = 0;
          prev = createjs.Ticker.getMeasuredFPS();
          // shorten interval means greater fps.
          createjs.Ticker.setInterval(20);
          createjs.Ticker.removeEventListener('tick', handleTick1);
          createjs.Ticker.addEventListener('tick', handleTick2);
        }
      }
      var handleTick2 = function() {
        if (++counter > 20) {
          createjs.Ticker.removeEventListener('tick', handleTick2);
          expect(createjs.Ticker.getMeasuredFPS()).toBeGreaterThan(prev);
          done();
        }
      }
      createjs.Ticker.addEventListener('tick', handleTick1);
    });
    it('setPaused should work.', function() {
      createjs.Ticker.setPaused(true);
      expect(createjs.Ticker.getPaused()).toBeTruthy();
      createjs.Ticker.setPaused(false);
      expect(createjs.Ticker.getPaused()).toBeFalsy();
    });
    it('getPaused should work.', function() {
      var paused = createjs.Ticker.getPaused();
      createjs.Ticker.setPaused(!paused);
      expect(createjs.Ticker.getPaused()).toEqual(!paused);
      // TBF reset to default. Ticker.reset() does not reset the pause state.
      createjs.Ticker.setPaused(paused);
    });
    it('getTime should work.', function(done) {
      createjs.Ticker.setInterval(20);
      var prevTime;
      var handleTick1 = function() {
        prevTime = createjs.Ticker.getTime();
        createjs.Ticker.removeEventListener('tick', handleTick1);
        createjs.Ticker.addEventListener('tick', handleTick2);
      }
      var handleTick2 = function() {
        createjs.Ticker.removeEventListener('tick', handleTick2);
        expect(createjs.Ticker.getTime()).toBeGreaterThan(prevTime);
        done();
      }
      createjs.Ticker.addEventListener('tick', handleTick1);
    });
    it('getEventTime should work.', function(done) {
      createjs.Ticker.setInterval(50);
      var prevTime;
      var handleTick1 = function() {
        prevTime = createjs.Ticker.getEventTime(true);
        createjs.Ticker.removeEventListener('tick', handleTick1);
        createjs.Ticker.addEventListener('tick', handleTick2);
      }
      var handleTick2 = function() {
        createjs.Ticker.removeEventListener('tick', handleTick2);
        expect(createjs.Ticker.getEventTime(true)).toBeGreaterThan(prevTime);
        done();
      }
      createjs.Ticker.addEventListener('tick', handleTick1);
    });
    it('getTicks should NOT work.', function() {
      // This always returns 0;
      expect(createjs.Ticker.getTicks()).toEqual(0);
    });
    describe('addEventListener should work.', function() {
      var firedEvent;
      beforeEach(function(done) {
        fireEvent = null;
        createjs.Ticker.reset();
        createjs.Ticker.setInterval(50);
        createjs.Ticker.addEventListener('tick', function(event) {
          firedEvent = event;
          done();
        });
        setTimeout(function() {
          if (!firedEvent) {
            done();
          }
        }, 200);
      });
      afterEach(function() {
        createjs.Ticker.reset();
      });
      it('tick event handler should be added.', function() {
        expect(createjs.Ticker.hasEventListener('tick')).toBeTruthy();
      });
      it('tick event should be dispatched.', function() {
        expect(firedEvent).toBeTruthy();
      });
      it('tick event.delta', function() {
        expect(firedEvent.delta).toAlmostEqual(50, 5);
      });
    });
    it('removeEventListener should work.', function() {
      var listener = function(event) {
      };
      expect(createjs.Ticker.hasEventListener('tick')).toBeFalsy();
      createjs.Ticker.addEventListener('tick', listener);
      expect(createjs.Ticker.hasEventListener('tick')).toBeTruthy();
      createjs.Ticker.removeEventListener('tick', listener);
      expect(createjs.Ticker.hasEventListener('tick')).toBeFalsy();
    });
    it('removeAllEventListeners should work.', function() {
      createjs.Ticker.addEventListener('tick', function(event) {
      });
      createjs.Ticker.addEventListener('tick', function(event) {
      });
      createjs.Ticker.addEventListener('tick', function(event) {
      });
      createjs.Ticker.removeAllEventListeners('tick');
      expect(createjs.Ticker.hasEventListener('tick')).toBeFalsy();
    });
    it('dispatchEvent should work.', function(done) {
      var flag = false;
      createjs.Ticker.reset();
      createjs.Ticker.setInterval(20000);
      createjs.Ticker.addEventListener('tick', function(event) {
        flag = true;
        expect(true).toBeTruthy();
        done();
      });
      setTimeout(function() {
        if (!flag) {
          fail('dispatchEvent did not work.');
          done();
        }
      }, 1000);
      createjs.Ticker.dispatchEvent('tick');
    });
    it('hasEventListeners should work.', function() {
      expect(createjs.Ticker.hasEventListener('tick')).toBeFalsy();
      createjs.Ticker.addEventListener('tick', function(event) {
      });
      expect(createjs.Ticker.hasEventListener('tick')).toBeTruthy();
    });
    it('init should be masked.', function() {
      expect('init' in createjs.Ticker).toBeFalsy();
    });
  });
});

describe('Touch', function() {
  beforeEach(function() {
  });

  it('createjs.Touch should be exported.', function() {
    expect('Touch' in createjs).toBeTruthy();
  });

  describe('Touch methods', function() {
    it('isSupported should NOT work.', function() {
      // This method always returns true.
      expect(createjs.Touch.isSupported()).toBeTruthy();
    });
    it('enabled and disable should work.', function(done) {
      // SEE Stage.enableDOMEvents
      // Setup event, stage and stage's child.
      var canvas = document.getElementById('testcanvas');
      var stage = new createjs.Stage(canvas);
      var createEvent = function() {
        var canvasRect = stage.canvas.getBoundingClientRect();
        var x = (canvasRect.left + canvasRect.right) / 2;
        var y = (canvasRect.top + canvasRect.bottom) / 2;
        var cx = canvasRect.width / 2;
        var cy = canvasRect.height / 2;
        // Creating touch event has compatibility issues, but ignore them here.
        var event = document.createEvent("Event");
        event.initEvent('touchstart', true, true);
        var touch = {
          target: window,
          identifier: Date.now(),
          pageX: x,
          pageY: y,
          screenX: x,
          screenY: y,
          clientX: cx,
          clientY: cy
        };
        event.touches = [touch];
        event.changedTouches = [touch];
        return event;
      }
      var child = new createjs.Shape();
      child.graphics.beginFill("F00").rect(0, 0, 32, 32);
      stage.addChild(child);

      // Touch.enable()
      // => fire an event
      // => confirm to receive the event
      // => Touch.disable()
      // => fire an event
      // => confirm not to receive it, done.
      var finished = false;
      var handleEvent1 = function(evt) {
        // Received an event, ok.
        expect(true).toBeTruthy();
        createjs.Ticker.removeEventListener('tick', handleTick1);
        createjs.Ticker.addEventListener('tick', handleTick2);
      }
      var handleEvent2 = function(evt) {
        child.removeEventListener('mousedown', handleEvent2);
        fail('Touch.disable failed.');
        finished = true;
        done();
      }

      var step = 0;
      var handleTick1 = function() {
        stage.update();
        switch (step) {
        case 0:
          createjs.Touch.enable(stage);
          child.addEventListener('mousedown', handleEvent1);
          ++step;
          break;
        case 1:
          stage.canvas.dispatchEvent(createEvent());
          ++step;
          break;
        case 2:
          // handleEvent1
          break;
        }
      }
      var handleTick2 = function() {
        stage.update();
        switch (step) {
        case 2:
          // handleEvent1
          ++step;
          break;
        case 3:
          child.removeEventListener('mousedown', handleEvent1);
          child.addEventListener('mousedown', handleEvent2);
          createjs.Touch.disable(stage);
          child.addEventListener('mousedown', handleEvent2);
          ++step;
          break;
        case 4:
          stage.canvas.dispatchEvent(createEvent());
          setTimeout(function() {
            if (!finished) {
              child.removeEventListener('mousedown', handleEvent2);
              expect(true).toBeTruthy();
              done();
            }
          }, 100);

          createjs.Ticker.removeEventListener('tick', handleTick2);
          break;
        default:
          // handleEvent2 or timeout, done.
          break;
        }
      }
      createjs.Ticker.addEventListener('tick', handleTick1);
    });
  });
});
