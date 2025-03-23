class Cylinder {
    // Constructor
    constructor() {
        this.type = 'cylinder';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.segments = 20;
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
    }

    // Render this shape
    drawCylinder() {
        var rgba = this.color;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

        let angleStep = 360 / this.segments;
        for (var angle = 0; angle < 360; angle = angle + angleStep) {
            let angle1 = angle;
            let angle2 = angle + angleStep;
            let vec1 = [Math.cos(angle1 * Math.PI / 180), Math.sin(angle1 * Math.PI / 180)];
            let vec2 = [Math.cos(angle2 * Math.PI / 180), Math.sin(angle2 * Math.PI / 180)];

            // Front of cylinder
            drawCylinderTriangle3D([0, 1, 0, vec1[0], 1, vec1[1], vec2[0], 1, vec2[1]]);

            gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);

            // Back of cylinder
            drawCylinderTriangle3D([0, 0, 0, vec1[0], 0, vec1[1], vec2[0], 0, vec2[1]]);

            gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);

            // Middle of cylinder
            drawCylinderTriangle3D([vec1[0], 0, vec1[1], vec1[0], 1, vec1[1], vec2[0], 1, vec2[1]]);
            drawCylinderTriangle3D([vec1[0], 0, vec1[1], vec2[0], 0, vec2[1], vec2[0], 1, vec2[1]]);
        }
    }
}