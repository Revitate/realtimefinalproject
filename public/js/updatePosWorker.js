/* eslint-disable */
importScripts('./three.js')
onmessage = e => {
    const { position, velocity, active, delta, st, ed } = e.data
    const output = new Float32Array((ed - st) * 3)
    let k = 0
    for (let i = st; i < ed; i++) {
        if (active[i] === 0) continue
        const index = i * 3
        const vel = new THREE.Vector3(
            velocity[index],
            velocity[index + 1],
            velocity[index + 2]
        )
        vel.multiplyScalar(Math.pow(10, -9) * delta)
        output[k++] = position[index] + vel.x
        output[k++] = position[index + 1] + vel.y
        output[k++] = position[index + 2] + vel.z
    }
    postMessage(output)
}
