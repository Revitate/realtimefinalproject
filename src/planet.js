const { THREE } = window

const MAX_ACC_SIZE = 5
// 1 x,y,z = 10^9 m
// 1 m = 10^24
class Planet {
    constructor(index, geometry) {
        this.index = index
        this.geometry = geometry
        this.vel = new THREE.Vector3()
        this.acc = new THREE.Vector3()
        this.mass = 0
    }

    init(x, y, z, m) {
        this.vel.set(0, 0, 0)
        this.acc.set(0, 0, 0)
        this.setPos(x, y, z)
        this.mass = m
        this.setActive(true)
    }

    destroy() {
        this.setActive(false)
    }

    needRemove() {
        return false
    }

    isActive() {
        return this.geometry.attributes.active.array[this.index] === 1
    }

    setActive(activeBoolean) {
        this.geometry.attributes.active.array[this.index] = activeBoolean
        this.geometry.attributes.active.needsUpdate = true
    }

    setColor(r, g, b) {
        const index = this.index * 3
        const colorArr = this.geometry.attributes.color.array
        colorArr[index] = r
        colorArr[index + 1] = g
        colorArr[index + 2] = b
        this.geometry.attributes.color.needsUpdate = true
    }

    setPos(x, y, z) {
        const index = this.index * 3
        const posArr = this.geometry.attributes.position.array
        posArr[index] = x
        posArr[index + 1] = y
        posArr[index + 2] = z
        this.geometry.attributes.position.needsUpdate = true
    }

    applyForceFrom(other) {
        const posArr = this.geometry.attributes.position.array
        const index = this.index * 3
        const x = posArr[index]
        const y = posArr[index + 1]
        const z = posArr[index + 2]
        const otherindex = other.index * 3
        const ox = posArr[otherindex]
        const oy = posArr[otherindex + 1]
        const oz = posArr[otherindex + 2]

        const dx = ox - x
        const dy = oy - y
        const dz = oz - z

        const distanceVector = new THREE.Vector3(dx, dy, dz)
        const distanceSqrt = distanceVector.lengthSq() || 0.1
        const direction = distanceVector.normalize()
        const acc = direction.multiplyScalar(
            Math.min((6.67 * other.mass) / 100000 / distanceSqrt, MAX_ACC_SIZE)
        )

        this.acc.add(acc)
    }

    updateVel() {
        this.vel.add(this.acc)
        this.acc.set(0, 0, 0)
    }

    updatePos() {
        // for (let i = 0; i < this.prevPos.length - 1; i++) {
        //     this.prevPos[i].copy(this.prevPos[i + 1])
        // }
        // this.prevPos[this.prevPos.length - 1].copy(this.pos)
        const index = this.index * 3
        const posArr = this.geometry.attributes.position.array
        posArr[index] += this.vel.x
        posArr[index + 1] += this.vel.y
        posArr[index + 2] += this.vel.z
        this.geometry.attributes.position.needsUpdate = true
    }

    update() {
        this.updateVel()
        this.updatePos()
    }
}

export default Planet
