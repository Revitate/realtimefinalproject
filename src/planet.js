const { THREE } = window

// 1 x,y,z = 10^9 m
// 1 m = 10^24 kg
// 1 acc : m/s^2
// 1 vel : m/s
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
        this.setSize(m)
        this.setActive(true)
    }

    destroy() {
        this.setActive(false)
    }

    needRemove(camera) {
        const index = this.index * 3
        const posArr = this.geometry.attributes.position.array
        const posVec = new THREE.Vector3(
            posArr[index],
            posArr[index + 1],
            posArr[index + 2]
        )
        const dist = posVec.sub(camera.position).length()
        if (dist > 300000) {
            return true
        }
        return false
    }

    isActive() {
        return this.geometry.attributes.active.array[this.index] === 1
    }

    setActive(activeBoolean) {
        this.geometry.attributes.active.array[this.index] = activeBoolean
        this.geometry.attributes.active.needsUpdate = true
    }

    setSize(mass) {
        this.geometry.attributes.size.array[this.index] =
            5 * Math.log(mass) + 10
        this.geometry.attributes.size.needsUpdate = true
        this.mass = mass
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
        const distanceSqrt = distanceVector.lengthSq()
        const direction = distanceVector.normalize()
        const acc = direction.multiplyScalar(
            // Math.min(
            (6.67 * other.mass) / Math.pow(10, 5) / distanceSqrt
            //     MAX_ACC_SIZE
            // ).
        )
        this.acc.add(acc)
    }

    updateVel(delta) {
        this.vel.add(this.acc.clone().multiplyScalar(delta))
        this.acc.set(0, 0, 0)
    }

    updatePos(delta) {
        // for (let i = 0; i < this.prevPos.length - 1; i++) {
        //     this.prevPos[i].copy(this.prevPos[i + 1])
        // }
        // this.prevPos[this.prevPos.length - 1].copy(this.pos)
        const vel = this.vel.clone().multiplyScalar(Math.pow(10, -9) * delta)
        const index = this.index * 3
        const posArr = this.geometry.attributes.position.array
        posArr[index] += vel.x
        posArr[index + 1] += vel.y
        posArr[index + 2] += vel.z
        this.geometry.attributes.position.needsUpdate = true
    }

    update(delta) {
        this.updateVel(delta)
        this.updatePos(delta)
    }
}

export default Planet
