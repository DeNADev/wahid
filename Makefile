# The MIT License (MIT)
#
# Copyright (c) 2016 DeNA Co., Ltd.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

# The path to java
JAVA = java

# The path to the Closure compiler, which is included in this repository.
CLOSURE_COMPIER = tools/closure_compiler/compiler.jar

# The common source files, the files used by all modules.
COMMON_SOURCES = createjs/base.js \
                 createjs/object.js \
                 createjs/config.js \
                 createjs/counter.js \
                 createjs/event.js \
                 createjs/event_dispatcher.js \
                 createjs/user_agent.js \
                 createjs/location.js \
                 createjs/image_factory.js \
                 createjs/script_factory.js \
                 createjs/base64.js

# The source files of our object renderer.
EASELJS_SOURCES = createjs/point.js \
                  createjs/region.js \
                  createjs/rectangle.js \
                  createjs/shadow.js \
                  createjs/color.js \
                  createjs/renderer.js \
                  createjs/canvas_renderer.js \
                  createjs/webgl_renderer.js \
                  createjs/filter.js \
                  createjs/alpha_map_filter.js \
                  createjs/color_filter.js \
                  createjs/color_matrix.js \
                  createjs/color_matrix_filter.js \
                  createjs/composer.js \
                  createjs/mouse_event.js \
                  createjs/bounding_box.js \
                  createjs/transform.js \
                  createjs/graphics.js \
                  createjs/tween_property.js \
                  createjs/tween_motion.js \
                  createjs/tween_state.js \
                  createjs/display_object.js \
                  createjs/container.js \
                  createjs/shape.js \
                  createjs/tick_listener.js \
                  createjs/stage.js \
                  createjs/word_breaker.js \
                  createjs/text.js \
                  createjs/sprite_sheet.js \
                  createjs/animation_event.js \
                  createjs/sprite.js \
                  createjs/bitmap.js \
                  createjs/dom_element.js \
                  createjs/video.js \
                  createjs/tick_event.js \
                  createjs/ticker.js \
                  createjs/touch.js \
                  createjs/button_helper.js \
                  createjs/sprite_sheet_builder.js

# The source file of our sound player.
SOUNDJS_SOURCES = createjs/sound.js

# The source file of our <iframe> decoder.
FRAME_DECODER_SOURCES = createjs/frame_decoder.js

# The source files of our resource loader.
PRELOADJS_SOURCES = createjs/error_event.js \
                    createjs/progress_event.js \
                    createjs/file_event.js \
                    createjs/loader.js \
                    createjs/load_queue.js

# The source files of our animation player.
TWEENJS_SOURCES = createjs/ease.js \
                  createjs/tween.js \
                  createjs/timeline.js \
                  createjs/movie_clip.js

# The source file that exports global symbols.
EXPORT_SOURCES = createjs/exports.js

# The source files.
SOURCES = $(COMMON_SOURCES) \
          $(EASELJS_SOURCES) \
          $(SOUNDJS_SOURCES) \
          $(PRELOADJS_SOURCES) \
          $(TWEENJS_SOURCES) \
          $(EXPORT_SOURCES)

# External symbols used by this library.
EXTERNS = externs/webaudio.js \
          externs/require.js

# The license header.
WRAPPER_FILE = LICENSE.js

# The build number set by Jenkins.
BUILD_NUMBER = 0

# Whether this library uses the <iframe> player.
USE_FRAME = true

all: createjs-min.js createjs-dbg.js

createjs-min.js: $(SOURCES) $(WRAPPER_FILE)
	$(JAVA) -jar $(CLOSURE_COMPIER) \
		--define='createjs.COMPILED=true' \
		--define='createjs.DEBUG=false' \
		--define='createjs.DENA_BUILD_NUMBER=$(BUILD_NUMBER)' \
		--compilation_level=ADVANCED_OPTIMIZATIONS \
		--use_types_for_optimization \
		--warning_level=VERBOSE \
		--output_wrapper_file=$(WRAPPER_FILE) \
		--js_output_file $@ \
		--externs $(EXTERNS) \
		--js $(SOURCES)

createjs-dbg.js: $(SOURCES) $(WRAPPER_FILE)
	$(JAVA) -jar $(CLOSURE_COMPIER) \
		--define='createjs.COMPILED=true' \
		--define='createjs.DEBUG=true' \
		--define='createjs.DENA_BUILD_NUMBER=$(BUILD_NUMBER)' \
		--compilation_level=WHITESPACE_ONLY \
		--warning_level=VERBOSE \
		--output_wrapper_file=$(WRAPPER_FILE) \
		--js_output_file $@ \
		--externs $(EXTERNS) \
		--js $(SOURCES)

frame-decoder-min.js: $(FRAME_DECODER_SOURCES)
	$(JAVA) -jar $(CLOSURE_COMPIER) \
		--define='createjs.COMPILED=true' \
		--define='createjs.DEBUG=false' \
		--compilation_level=ADVANCED_OPTIMIZATIONS \
		--use_types_for_optimization \
		--warning_level=VERBOSE \
		--js_output_file $@ \
		--externs $(EXTERNS) \
		--js $(FRAME_PLAYER_SOURCES)

frame-decoder-dbg.js: $(FRAME_DECODER_SOURCES)
	$(JAVA) -jar $(CLOSURE_COMPIER) \
		--define='createjs.COMPILED=true' \
		--define='createjs.DEBUG=true' \
		--compilation_level=ADVANCED_OPTIMIZATIONS \
		--use_types_for_optimization \
		--warning_level=VERBOSE \
		--js_output_file $@ \
		--externs $(EXTERNS) \
		--js $(FRAME_PLAYER_SOURCES)
