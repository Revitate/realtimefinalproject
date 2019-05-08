const { THREE } = window

// 1 x,y,z = 10^9 m
// 1 m = 10^24
class Planet {
    constructor(x, y, z, m, c) {
        x = x || 0
        y = y || 0
        z = z || 0
        this.pos = new THREE.Vector3(x, y, z)
        this.vel = new THREE.Vector3()
        this.acc = new THREE.Vector3()
        this.mass = m

        const material = new THREE.LineBasicMaterial({
            color: c,
            lineWidth: 20
        })
        this.trailGeometry = new THREE.Geometry()
        this.prevPos = Array(100)
            .fill(0)
            .map(() => this.pos.clone())
        this.trailGeometry.vertices = this.prevPos
        this.line = new THREE.Line(this.trailGeometry, material)
    }

    applyForceFrom(other) {
        const distanceVector = new THREE.Vector3().subVectors(
            other.pos,
            this.pos
        )
        const distanceSqrt = distanceVector.lengthSq()
        const direction = distanceVector.normalize()
        const G = Math.pow(10, -5) * 6.67
        const acc = direction.multiplyScalar((G * other.mass) / distanceSqrt)
        this.acc.add(acc)
    }

    updateVel() {
        this.vel.add(this.acc)
        this.acc.set(0, 0, 0)
    }

    updatePos() {
        for (let i = 0; i < this.prevPos.length - 1; i++) {
            this.prevPos[i].copy(this.prevPos[i + 1])
        }
        this.prevPos[this.prevPos.length - 1].copy(this.pos)
        this.pos.add(this.vel)
    }

    update() {
        this.updateVel()
        this.updatePos()
        this.line.geometry.verticesNeedUpdate = true
    }
}

export default Planet
