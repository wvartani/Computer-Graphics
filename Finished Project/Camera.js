class Camera {
    constructor() {
        this.fov = 60;
        this.eye = new Vector3([0, 0.5, 2.5]);
        this.at = new Vector3([-0.5, 0, -100]);
        this.up = new Vector3([0, 1, 0]);
        this.viewMatrix = new Matrix4().setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        this.projectionMatrix = new Matrix4().setPerspective(this.fov, canvas.width / canvas.height, 0.1, 1000);
        this.speed = 0.5;
        this.alpha = 1;
    }

    moveForward() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(this.speed);
        this.eye.add(f);
        this.at.add(f);
    }

    moveBackwards() {
        let b = new Vector3();
        b.set(this.eye);
        b.sub(this.at);
        b.normalize();
        b.mul(this.speed);
        this.eye.add(b);
        this.at.add(b);
    }

    moveLeft() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        let s = Vector3.cross(this.up, f);
        s.normalize();
        s.mul(this.speed);
        this.eye.add(s);
        this.at.add(s);
    }

    moveRight() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        let s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(this.speed);
        this.eye.add(s);
        this.at.add(s);
    }

    moveUp() {
        let f = new Vector3();
        f.set(this.up);
        f.mul(this.speed);
        this.eye.add(f);
        this.at.add(f);
    }

    moveDown() {
        let f = new Vector3();
        f.set(this.up);
        f.mul(this.speed);
        this.eye.sub(f);
        this.at.sub(f);
    }

    panLeft() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(this.alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = rotationMatrix.multiplyVector3(f);
        this.at.set(f_prime);
        this.at.add(this.eye);
    }

    panRight() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-this.alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = rotationMatrix.multiplyVector3(f);
        this.at.set(this.eye);
        this.at.add(f_prime);
    }
}