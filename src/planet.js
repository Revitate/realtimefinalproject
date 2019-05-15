const { THREE } = window

// 1 x,y,z = 10^9 m
// 1 m = 10^24 kg
// 1 acc : m/s^2
// 1 vel : m/s
class Planet {
    constructor(index, geometry) {
        this.index = index
        this.geometry = geometry
    }

    init(x, y, z, m) {
        this.setPos(x, y, z)
        this.setVel(0, 0, 0)
        this.setSize(m)
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
    }

    setSize(mass) {
        this.geometry.attributes.size.array[this.index] =
            5 * Math.log(mass) + 10
        this.geometry.attributes.mass.array[this.index] = mass
    }

    getMass() {
        return this.geometry.attributes.mass.array[this.index]
    }

    setColor(r, g, b) {
        const index = this.index * 3
        const colorArr = this.geometry.attributes.color.array
        colorArr[index] = r
        colorArr[index + 1] = g
        colorArr[index + 2] = b
    }

    setPos(x, y, z) {
        const index = this.index * 3
        const posArr = this.geometry.attributes.position.array
        posArr[index] = x
        posArr[index + 1] = y
        posArr[index + 2] = z
    }

    setVel(x, y, z) {
        const index = this.index * 3
        const velArr = this.geometry.attributes.velocity.array
        velArr[index] = x
        velArr[index + 1] = y
        velArr[index + 2] = z
    }

    setVelX(x) {
        const index = this.index * 3
        const velArr = this.geometry.attributes.velocity.array
        velArr[index] = x
    }
    setVelY(y) {
        const index = this.index * 3
        const velArr = this.geometry.attributes.velocity.array
        velArr[index + 1] = y
    }
    setVelZ(z) {
        const index = this.index * 3
        const velArr = this.geometry.attributes.velocity.array
        velArr[index + 2] = z
    }

    getVel() {
        const index = this.index * 3
        const velArr = this.geometry.attributes.velocity.array
        return new THREE.Vector3(
            velArr[index],
            velArr[index + 1],
            velArr[index + 2]
        )
    }
}

export default Planet
