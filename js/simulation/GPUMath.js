/**
 * Created by ghassaei on 2/24/16.
 */


define(['glBoilerplate'], function(glBoilerplate){

    var canvas = document.getElementById("gpuMathCanvas");
    var gl = canvas.getContext("webgl", {antialias:false}) || canvas.getContext("experimental-webgl", {antialias:false});
    gl.getExtension('OES_texture_float');
    gl.disable(gl.DEPTH_TEST);


    function GPUMath(){
        this.reset();
    }

    GPUMath.prototype.createProgram = function(programName, vertexShader, fragmentShader){
        var programs = this.programs;
        var program = programs[name];
        if (program) {
            console.warn("already a program with the name " + programName);
            return;
        }
        program = glBoilerplate.createProgramFromSource(gl, vertexShader, fragmentShader);
        gl.useProgram(program);
        glBoilerplate.loadVertexData(gl, program);
        programs[programName] = {
            program: program,
            uniforms: {}
        };
    };

    GPUMath.prototype.initTextureFromData = function(name, width, height, typeName, data){
        var texture = this.textures[name];
        if (texture) {
            console.warn("already a texture with the name " + name);
            return;
        }
        texture = glBoilerplate.makeTexture(gl, width, height, gl[typeName], data);
        this.textures[name] = texture;
    };



    GPUMath.prototype.initFrameBufferForTexture = function(textureName){
        var framebuffer = this.frameBuffers[textureName];
        if (framebuffer) {
            console.warn("framebuffer already exists for texture " + textureName);
            return;
        }
        var texture = this.textures[textureName];
        if (!texture){
            console.warn("texture " + textureName + " does not exist");
            return;
        }

        framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        this.frameBuffers[textureName] = framebuffer;
    };


    GPUMath.prototype.setUniformForProgram = function(programName, name, val, type){
        if (!this.programs[programName]){
            console.warn("no program with name " + programName);
            return;
        }
        var uniforms = this.programs[programName].uniforms;
        var location = uniforms[name];
        if (!location) {
            location = gl.getUniformLocation(this.programs[programName].program, name);
            uniforms[name] = location;
        }
        if (type == "f") gl.uniform1f(location, val);
        else if (type == "2f") gl.uniform2f(location, val[0], val[1]);
        else if (type == "3f") gl.uniform3f(location, val[0], val[1], val[2]);
    };

    GPUMath.prototype.setSize = function(width, height){
        gl.viewport(0, 0, width, height);
        canvas.clientWidth = width;
        canvas.clientHeight = height;
    };

    GPUMath.prototype.step = function(programName, inputTextures, outputTexture){

        gl.useProgram(this.programs[programName].program);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffers[outputTexture]);
        var self = this;
        _.each(inputTextures, function(textureName){
            gl.bindTexture(gl.TEXTURE_2D, self.textures[textureName]);
        });

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);//draw to framebuffer
    };

    GPUMath.prototype.readPixels = function(xMin, yMin, width, height, array){
        gl.readPixels(xMin, yMin, width, height, gl.RGBA, gl.UNSIGNED_BYTE, array);
    };

    GPUMath.prototype.reset = function(){
        this.programs = {};
        this.frameBuffers = {};
        this.textures = {};
        this.index = 0;
    };

    return new GPUMath;

});