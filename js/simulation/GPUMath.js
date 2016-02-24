/**
 * Created by ghassaei on 2/24/16.
 */


define(['glBoilerplate'], function(glBoilerplate){

    var canvas = document.getElementById("gpuMathCanvas");
    var gl = canvas.getContext("webgl", {antialias:false}) || canvas.getContext("experimental-webgl", {antialias:false});
    gl.getExtension('OES_texture_float');
    gl.disable(gl.DEPTH_TEST);


    function GPUMath(){
        this.program = {};
        this.frameBuffers = [this.makeFrameBuffer(), this.makeFrameBuffer()];
        this.states = [null, null];
        this.index = 0;
        this.currentProgram = null;
    }

    GPUMath.prototype.setInitialStateFromData = function(data){
        this.setInitialStateFromTexture(this.makeTexture(data));

        this.state[1] = this.makeTexture(data);//just init another matrix of same size

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffers[1]);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.states[1], 0);

        gl.viewport(0, 0, data.length, 1);
    };

    GPUMath.prototype.setInitialStateFromTexture = function(texture){

        this.state[0] = texture;

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffers[0]);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.states[0], 0);

        this.index = 0;
    };

    GPUMath.prototype.makeTexture = function(data){

        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, data);

        return texture;
    };

    GPUMath.prototype.makeFrameBuffer = function(){
        return gl.createFramebuffer();
    };

    GPUMath.prototype.createProgram = function(programName, vertexShader, fragmentShader){
        var programs = this.programs;
        var program = programs[name].program;
        if (program) {
            console.warn("already a program with the name " + programName);
            return;
        }
        program = glBoilerplate.createProgramFromScripts(gl, vertexShader, fragmentShader);
        gl.useProgram(program);
        this._loadVertexData(program);
        programs[programName] = {
            programs: program,
            uniforms: {}
        };
    };

    GPUMath.prototype._loadVertexData = function(program) {
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -1,-1, 1,-1, -1, 1, 1, 1]), gl.STATIC_DRAW);

        // look up where the vertex data needs to go.
        var positionLocation = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    };


    GPUMath.prototype.setUniformForProgram = function(programName, name, val, type){
        if (!this.programs[programName]){
            console.warn("no program with name " + programName);
            return;
        }
        var uniforms = this.programs[programName].uniforms;
        var location = uniforms[name];
        if (!location) {
            location = gl.getUniformLocation(programs[programName], "name");
            uniforms[name] = location;
        }
        if (type == "f") gl.uniformf(location, val);
        else if (type == "3f") gl.uniformf(location, val.x, val.y, val.z);
    };

    GPUMath.prototype.setCurrentProgram = function(programName){
        this.currentProgram = programName;
    };

    GPUMath.prototype.step = function(){

        gl.useProgram(programs[this.currentProgram].program);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffers[(this.index+1)%2]);
        gl.bindTexture(gl.TEXTURE_2D, this.states[this.index%2]);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);//draw to framebuffer

        this.index++;
    };

    GPUMath.prototype.getCurrentStateTexture = function(){
        return this.states[this.index%2];
    };

    return new GPUMath;

});