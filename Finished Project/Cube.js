class Cube {
    // Constructor
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.textureNum = -2;
        this.cubeVerts = [
            0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0,
            0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0,
            0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0,
            0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0,
            1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0,
        ];
        this.UV = [
            0, 0, 1, 1, 1, 0,
            0, 0, 1, 1, 0, 1,
            0, 0, 1, 1, 1, 0,
            0, 0, 1, 1, 0, 1,
            0, 0, 1, 1, 1, 0,
            0, 0, 1, 1, 0, 1,
            0, 0, 1, 1, 1, 0,
            0, 0, 1, 1, 0, 1,
            0, 1, 1, 0, 0, 0,
            0, 1, 1, 0, 1, 1,
            0, 0, 1, 1, 0, 1,
            0, 0, 1, 1, 1, 0,

        ];
    }

    // Render this shape
    drawCube() {
        var rgba = this.color;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Pass the normalMatrix to u_NormalMatrix attribute
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

        // Front of cube
        drawTriangle3DUVNormal([0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0], [0, 0, 1, 1, 1, 0], [0, 0, -1, 0, 0, -1, 0, 0, -1]);
        drawTriangle3DUVNormal([0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0], [0, 0, 1, 1, 0, 1], [0, 0, -1, 0, 0, -1, 0, 0, -1]);

        // Pass the color of a point to u_FragColor unifrom variable
        // gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);

        // Back of cube
        drawTriangle3DUVNormal([0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0], [0, 0, 1, 1, 1, 0], [0, 0, 1, 0, 0, 1, 0, 0, 1]);
        drawTriangle3DUVNormal([0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0], [0, 0, 1, 1, 0, 1], [0, 0, 1, 0, 0, 1, 0, 0, 1]);

        // gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);

        // Top of cube
        drawTriangle3DUVNormal([0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0], [0, 0, 1, 1, 1, 0], [0, 1, 0, 0, 1, 0, 0, 1, 0]);
        drawTriangle3DUVNormal([0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0], [0, 0, 1, 1, 0, 1], [0, 1, 0, 0, 1, 0, 0, 1, 0]);

        // gl.uniform4f(u_FragColor, rgba[0] * 0.7, rgba[1] * 0.7, rgba[2] * 0.7, rgba[3]);

        // Bottom of cube
        drawTriangle3DUVNormal([0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0], [0, 0, 1, 1, 1, 0], [0, -1, 0, 0, -1, 0, 0, -1, 0]);
        drawTriangle3DUVNormal([0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0], [0, 0, 1, 1, 0, 1], [0, -1, 0, 0, -1, 0, 0, -1, 0]);

        // gl.uniform4f(u_FragColor, rgba[0] * 0.6, rgba[1] * 0.6, rgba[2] * 0.6, rgba[3]);

        // left side of cube
        drawTriangle3DUVNormal([0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0], [1, 0, 0, 1, 1, 1], [-1, 0, 0, -1, 0, 0, -1, 0, 0]);
        drawTriangle3DUVNormal([0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0], [1, 0, 0, 1, 0, 0], [-1, 0, 0, -1, 0, 0, -1, 0, 0]);

        // gl.uniform4f(u_FragColor, rgba[0] * 0.5, rgba[1] * 0.5, rgba[2] * 0.5, rgba[3]);

        // Right side of cube
        drawTriangle3DUVNormal([1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0], [0, 0, 1, 1, 1, 0], [1, 0, 0, 1, 0, 0, 1, 0, 0]);
        drawTriangle3DUVNormal([1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0], [0, 0, 1, 1, 0, 1], [1, 0, 0, 1, 0, 0, 1, 0, 0]);
    }

    drawCubeFaster() {
        var rgba = this.color;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        drawTriangle3DUV(this.cubeVerts, this.UV);
    }
}