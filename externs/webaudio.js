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

/**
 * @fileoverview Definitions for the Web Audio API.
 * @see http://www.w3.org/TR/webaudio/
 * @externs
 */

 /**
 * @see http://www.w3.org/TR/webaudio/#AudioBuffer
 * @constructor
 * @nosideeffects
 */
function AudioBuffer() {
}

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-AudioBuffer
 * @type {number}
 */
AudioBuffer.prototype.destination;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-AudioBuffer
 * @type {number}
 */
AudioBuffer.prototype.sampleRate;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-AudioBuffer
 * @type {number}
 */
AudioBuffer.prototype.length;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-AudioBuffer
 * @type {number}
 */
AudioBuffer.prototype.duration;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-AudioBuffer
 * @type {number}
 */
AudioBuffer.prototype.numberOfChannels;

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioBuffer
 * @param {number} channel
 * @return {Float32Array}
 */
AudioBuffer.prototype.getChannelData = function(channel) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#AudioParam
 * @constructor
 * @nosideeffects
 */
function AudioParam() {
}

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-AudioParam
 * @type {number}
 */
AudioParam.prototype.value;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-AudioParam
 * @type {number}
 */
AudioParam.prototype.defaultValue;

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioParam
 * @param {number} value
 * @param {number} startTime
 */
AudioParam.prototype.setValueAtTime = function(value, startTime) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioParam
 * @param {number} value
 * @param {number} endTime
 */
AudioParam.prototype.linearRampToValueAtTime = function(value, endTime) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioParam
 * @param {number} value
 * @param {number} endTime
 */
AudioParam.prototype.exponentialRampToValueAtTime = function(value, endTime) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioParam
 * @param {number} target
 * @param {number} startTime
 * @param {number} timeConstant
 */
AudioParam.prototype.setTargetAtTime =
    function(target, startTime, timeConstant) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioParam
 * @param {Float32Array} values
 * @param {number} startTime
 * @param {number} duration
 */
AudioParam.prototype.setValueCurveAtTime =
    function(values, startTime, duration) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioParam
 * @param {number} startTime
 */
AudioParam.prototype.cancelScheduledValues = function(startTime) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#AudioNode-section
 * @constructor
 * @nosideeffects
 */
function AudioNode() {
}

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-AudioNode
 * @type {AudioContext}
 */
AudioNode.prototype.context;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-AudioNode
 * @type {number}
 */
AudioNode.prototype.numberOfInputs;
/**
 * @see http://www.w3.org/TR/webaudio/#attributes-AudioNode
 * @type {number}
 */
AudioNode.prototype.numberOfOutputs;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-AudioNode
 * @type {number}
 */
AudioNode.prototype.channelCount;
/**
 * @see http://www.w3.org/TR/webaudio/#attributes-AudioNode
 * @type {string}
 */
AudioNode.prototype.channelCountMode;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-AudioNode
 * @type {string}
 */
AudioNode.prototype.channelInterpretation;

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioNode
 * @param {AudioParam|AudioNode} destination
 * @param {number=} output
 * @param {number=} input
 */
AudioNode.prototype.connect = function(destination, output, input) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioNode
 * @param {number=} output
 */
AudioNode.prototype.disconnect = function(output) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#AudioDestinationNode
 * @extends {AudioNode}
 * @constructor
 * @nosideeffects
 */
function AudioDestinationNode() {
}

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-AudioDestinationNode
 * @type {number}
 */
AudioDestinationNode.prototype.maxChannelCount;

/**
 * @see http://www.w3.org/TR/webaudio/#AudioBufferSourceNode
 * @extends {AudioNode}
 * @constructor
 * @nosideeffects
 */
function AudioBufferSourceNode() {
}

/**
 * @see http://www.w3.org/TR/2012/WD-webaudio-20121213/#attributes-AudioBufferSourceNode
 * @type {number}
 */
AudioBufferSourceNode.prototype.playbackState;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-AudioBufferSourceNode
 * @type {AudioBuffer}
 */
AudioBufferSourceNode.prototype.buffer;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-AudioBufferSourceNode
 * @type {AudioParam}
 */
AudioBufferSourceNode.prototype.playbackRate;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-AudioBufferSourceNode
 * @type {boolean}
 */
AudioBufferSourceNode.prototype.loop;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-AudioBufferSourceNode
 * @type {number}
 */
AudioBufferSourceNode.prototype.loopStart;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-AudioBufferSourceNode
 * @type {number}
 */
AudioBufferSourceNode.prototype.loopEnd;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-AudioBufferSourceNode
 * @type {Function}
 */
AudioBufferSourceNode.prototype.onended;

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioBufferSourceNode
 * @param {number=} when
 * @param {number=} offset
 * @param {number=} duration
 */
AudioBufferSourceNode.prototype.start = function(when, offset, duration) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioBufferSourceNode
 * @param {number=} when
 */
AudioBufferSourceNode.prototype.noteOn = function(when) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioBufferSourceNode
 * @param {number} when
 * @param {number} offset
 * @param {number} duration
 */
AudioBufferSourceNode.prototype.noteGrainOn = function(when, offset, duration) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioBufferSourceNode
 * @param {number=} when
 */
AudioBufferSourceNode.prototype.stop = function(when) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioBufferSourceNode
 * @param {number=} when
 */
AudioBufferSourceNode.prototype.noteOff = function(when) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#MediaElementAudioSourceNode
 * @extends {AudioNode}
 * @constructor
 * @nosideeffects
 */
function MediaElementAudioSourceNode() {
}

/**
 * @see http://www.w3.org/TR/webaudio/#MediaStreamAudioSourceNode
 * @extends {AudioNode}
 * @constructor
 * @nosideeffects
 */
function MediaStreamAudioSourceNode() {
}

/**
 * @see http://www.w3.org/TR/webaudio/#MediaStreamAudioDestinationNode
 * @extends {AudioNode}
 * @constructor
 * @nosideeffects
 */
function MediaStreamAudioDestinationNode() {
}

/**
 * @see http://www.w3.org/TR/webaudio/#MediaStreamAudioDestinationNode
 * @type {MediaStream}
 */
MediaStreamAudioDestinationNode.prototype.stream;

/**
 * @see http://www.w3.org/TR/webaudio/#AnalyserNode
 * @extends {AudioNode}
 * @constructor
 * @nosideeffects
 */
function AnalyserNode() {
}

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-ConvolverNode_2
 * @type {number}
 */
AnalyserNode.prototype.fftSize;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-ConvolverNode_2
 * @type {number}
 */
AnalyserNode.prototype.frequencyBinCount;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-ConvolverNode_2
 * @type {number}
 */
AnalyserNode.prototype.minDecibels;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-ConvolverNode_2
 * @type {number}
 */
AnalyserNode.prototype.maxDecibels;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-ConvolverNode_2
 * @type {number}
 */
AnalyserNode.prototype.smoothingTimeConstant;

/**
 * @see http://www.w3.org/TR/webaudio/#methods-and-parameters
 * @param {Float32Array} array
 */
AnalyserNode.prototype.getFloatFrequencyData = function(array) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methods-and-parameters
 * @param {Uint8Array} array
 */
AnalyserNode.prototype.getByteFrequencyData = function(array) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methods-and-parameters
 * @param {Uint8Array} array
 */
AnalyserNode.prototype.getByteTimeDomainData = function(array) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#GainNode
 * @extends {AudioNode}
 * @constructor
 * @nosideeffects
 */
function GainNode() {
}

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-GainNode
 * @type {AudioParam}
 */
GainNode.prototype.gain;

/**
 * @see http://www.w3.org/TR/webaudio/#DelayNode
 * @extends {AudioNode}
 * @constructor
 * @nosideeffects
 */
function DelayNode() {
}

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-GainNode_2
 * @type {AudioParam}
 */
DelayNode.prototype.delayTime;

/**
 * @see http://www.w3.org/TR/webaudio/#ScriptProcessorNode
 * @extends {AudioNode}
 * @constructor
 * @nosideeffects
 */
function ScriptProcessorNode() {
}

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-ScriptProcessorNode
 * @type {Function}
 */
ScriptProcessorNode.prototype.onaudioprocess;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-ScriptProcessorNode
 * @type {number}
 */
ScriptProcessorNode.prototype.bufferSize;

/**
 * @see http://www.w3.org/TR/webaudio/#BiquadFilterNode
 * @extends {AudioNode}
 * @constructor
 * @nosideeffects
 */
function BiquadFilterNode() {
}

/**
 * @see http://www.w3.org/TR/webaudio/#BiquadFilterNode
 * @type {string}
 */
BiquadFilterNode.prototype.type;

/**
 * @see http://www.w3.org/TR/webaudio/#BiquadFilterNode
 * @type {AudioParam}
 */
BiquadFilterNode.prototype.frequency;

/**
 * @see http://www.w3.org/TR/webaudio/#BiquadFilterNode
 * @type {AudioParam}
 */
BiquadFilterNode.prototype.detune;

/**
 * @see http://www.w3.org/TR/webaudio/#BiquadFilterNode
 * @type {AudioParam}
 */
BiquadFilterNode.prototype.Q;

/**
 * @see http://www.w3.org/TR/webaudio/#BiquadFilterNode
 * @type {AudioParam}
 */
BiquadFilterNode.prototype.gain;

/**
 * @see http://www.w3.org/TR/webaudio/#Methods
 * @param {Float32Array} frequencyHz
 * @param {Float32Array} magResponse
 * @param {Float32Array} phaseResponse
 */
BiquadFilterNode.prototype.getFrequencyResponse =
    function(frequencyHz, magResponse, phaseResponse) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#WaveShaperNode
 * @extends {AudioNode}
 * @constructor
 * @nosideeffects
 */
function WaveShaperNode() {
}

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-WaveShaperNode
 * @type {Float32Array}
 */
WaveShaperNode.prototype.curve;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-WaveShaperNode
 * @type {string}
 */
WaveShaperNode.prototype.oversample;

/**
 * @see http://www.w3.org/TR/webaudio/#PannerNode
 * @extends {AudioNode}
 * @constructor
 * @nosideeffects
 */
function PannerNode() {
}

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-PannerNode_attributes
 * @type {string}
 */
PannerNode.prototype.panningModel;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-PannerNode_attributes
 * @type {string}
 */
PannerNode.prototype.distanceModel;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-PannerNode_attributes
 * @type {number}
 */
PannerNode.prototype.refDistance;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-PannerNode_attributes
 * @type {number}
 */
PannerNode.prototype.maxDistance;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-PannerNode_attributes
 * @type {number}
 */
PannerNode.prototype.rolloffFactor;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-PannerNode_attributes
 * @type {number}
 */
PannerNode.prototype.coneInnerAngle;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-PannerNode_attributes
 * @type {number}
 */
PannerNode.prototype.coneOuterAngle;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-PannerNode_attributes
 * @type {number}
 */
PannerNode.prototype.coneOuterGain;

/**
 * @see http://www.w3.org/TR/webaudio/#Methods_and_Parameters
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
PannerNode.prototype.setPosition = function(x, y, z) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#Methods_and_Parameters
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
PannerNode.prototype.setOrientation = function(x, y, z) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#Methods_and_Parameters
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
PannerNode.prototype.setVelocity = function(x, y, z) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#ConvolverNode
 * @extends {AudioNode}
 * @constructor
 * @nosideeffects
 */
function ConvolverNode() {
}

/**
 * @see http://www.w3.org/TR/webaudio/#ConvolverNode
 * @type {AudioBuffer}
 */
ConvolverNode.prototype.buffer;

/**
 * @see http://www.w3.org/TR/webaudio/#ConvolverNode
 * @type {boolean}
 */
ConvolverNode.prototypenormalize;

/**
 * @see http://www.w3.org/TR/webaudio/#ChannelSplitterNode
 * @extends {AudioNode}
 * @constructor
 * @nosideeffects
 */
function ChannelSplitterNode() {
}

/**
 * @see http://www.w3.org/TR/webaudio/#ChannelMergerNode
 * @extends {AudioNode}
 * @constructor
 * @nosideeffects
 */
function ChannelMergerNode() {
}

/**
 * @see http://www.w3.org/TR/webaudio/#DynamicsCompressorNode
 * @extends {AudioNode}
 * @constructor
 * @nosideeffects
 */
function DynamicsCompressorNode() {
}

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-DynamicsCompressorNode
 * @type {AudioParam}
 */
DynamicsCompressorNode.prototype.threshold;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-DynamicsCompressorNode
 * @type {AudioParam}
 */
DynamicsCompressorNode.prototype.knee;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-DynamicsCompressorNode
 * @type {AudioParam}
 */
DynamicsCompressorNode.prototype.ratio;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-DynamicsCompressorNode
 * @type {AudioParam}
 */
DynamicsCompressorNode.prototype.reduction;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-DynamicsCompressorNode
 * @type {AudioParam}
 */
DynamicsCompressorNode.prototype.attack;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-DynamicsCompressorNode
 * @type {AudioParam}
 */
DynamicsCompressorNode.prototype.release;

/**
 * @see http://www.w3.org/TR/webaudio/#OscillatorNode
 * @extends {AudioNode}
 * @constructor
 * @nosideeffects
 */
function OscillatorNode() {
}

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-OscillatorNode
 * @type {string}
 */
OscillatorNode.prototype.type;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-OscillatorNode
 * @type {AudioParam}
 */
OscillatorNode.prototype.frequency;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-OscillatorNode
 * @type {AudioParam}
 */
OscillatorNode.prototype.detune;

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-OscillatorNode-section
 * @param {number} when
 */
OscillatorNode.prototype.start = function(when) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-OscillatorNode-section
 * @param {number} when
 */
OscillatorNode.prototype.stop = function(when) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-OscillatorNode-section
 * @param {PeriodicWave} periodicWave
 */
OscillatorNode.prototype.setPeriodicWave = function(periodicWave) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-OscillatorNode-section
 * @type {Function}
 */
OscillatorNode.prototype.onended;

/**
 * @see http://www.w3.org/TR/webaudio/#PeriodicWave
 * @constructor
 * @nosideeffects
 */
function PeriodicWave() {
}

/**
 * @see http://www.w3.org/TR/webaudio/#AudioListener
 * @constructor
 * @nosideeffects
 */
function AudioListener() {
}

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-AudioListener
 * @type {number}
 */
AudioListener.prototype.dopplerFactor;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-AudioListener
 * @type {number}
 */
AudioListener.prototype.speedOfSound;

/**
 * @see http://www.w3.org/TR/webaudio/#L15842
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
AudioListener.prototype.setPosition = function(x, y, z) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#L15842
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} xUp
 * @param {number} yUp
 * @param {number} zUp
 */
AudioListener.prototype.setOrientation = function(x, y, z, xUp, yUp, zUp) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#L15842
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
AudioListener.prototype.setVelocity = function(x, y, z) {
};

/**
 * @see http://url.spec.whatwg.org/#api
 * @constructor
 * @nosideeffects
 */
function AudioContext() {
}

/**
 * @see http://www.w3.org/TR/webaudio/#AudioContext-section
 * @type {AudioDestinationNode}
 */
AudioContext.prototype.destination;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-AudioContext
 * @type {number}
 */
AudioContext.prototype.sampleRate;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-AudioContext
 * @type {number}
 */
AudioContext.prototype.currentTime;

/**
 * @see http://www.w3.org/TR/webaudio/#attributes-AudioContext
 * @type {AudioListener}
 */
AudioContext.prototype.listener;

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioContext
 * @param {number} numberOfChannels
 * @param {number} length
 * @param {number} sampleRate
 * @return {AudioBuffer}
 */
AudioContext.prototype.createBuffer =
    function(numberOfChannels, length, sampleRate) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioContext
 * @param {ArrayBuffer} audioData
 * @param {function(AudioBuffer): void} successCallback
 * @param {function(): void=} errorCallback
 */
AudioContext.prototype.decodeAudioData =
    function(audioData, successCallback, errorCallback) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioContext
 * @return {AudioBufferSourceNode}
 */
AudioContext.prototype.createBufferSource = function() {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioContext
 * @param {HTMLMediaElement} mediaElement
 * @return {MediaElementAudioSourceNode}
 */
AudioContext.prototype.createMediaElementSource = function(mediaElement) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioContext
 * @param {MediaStream} mediaStream
 * @return {MediaStreamAudioSourceNode}
 */
AudioContext.prototype.createMediaStreamSource = function(mediaStream) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioContext
 * @return {MediaStreamAudioDestinationNode}
 */
AudioContext.prototype.createMediaStreamDestination = function() {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioContext
 * @param {number=} bufferSize
 * @param {number=} numberOfInputChannels
 * @param {number=} numberOfOutputChannels
 * @return {ScriptProcessorNode}
 */
AudioContext.prototype.createScriptProcessor =
    function(bufferSize, numberOfInputChannels, numberOfOutputChannels) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioContext
 * @return {AnalyserNode}
 */
AudioContext.prototype.createAnalyser = function() {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioContext
 * @return {GainNode}
 */
AudioContext.prototype.createGain = function() {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioContext
 * @return {GainNode}
 */
AudioContext.prototype.createGainNode = function() {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioContext
 * @param {number=} maxDelayTime
 * @return {DelayNode}
 */
AudioContext.prototype.createDelay = function(maxDelayTime) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioContext
 * @return {BiquadFilterNode}
 */
AudioContext.prototype.createBiquadFilter = function() {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioContext
 * @return {WaveShaperNode}
 */
AudioContext.prototype.createWaveShaper = function() {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioContext
 * @return {PannerNode}
 */
AudioContext.prototype.createPanner = function() {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioContext
 * @return {ConvolverNode}
 */
AudioContext.prototype.createConvolver = function() {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioContext
 * @param {number=} numberOfOutputs
 * @return {ChannelSplitterNode}
 */
AudioContext.prototype.createChannelSplitter = function(numberOfOutputs) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioContext
 * @param {number=} numberOfInputs
 * @return {ChannelMergerNode}
 */
AudioContext.prototype.createChannelMerger = function(numberOfInputs) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioContext
 * @return {DynamicsCompressorNode}
 */
AudioContext.prototype.createDynamicsCompressor = function() {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioContext
 * @return {OscillatorNode}
 */
AudioContext.prototype.createOscillator = function() {
};

/**
 * @see http://www.w3.org/TR/webaudio/#methodsandparams-AudioContext
 * @param {Float32Array} real
 * @param {Float32Array} imag
 * @return {PeriodicWave}
 */
AudioContext.prototype.createPeriodicWave = function(real, imag) {
};

/**
 * @see http://www.w3.org/TR/webaudio/#AudioContext-section
 * @extends {AudioContext}
 * @constructor
 * @nosideeffects
 */
function webkitAudioContext() {
}
