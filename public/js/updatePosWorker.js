/* eslint-disable */
importScripts('./three.js')
onmessage = e => {
    const { position, velocity, active, delta, st, ed } = e.data
    const output = new Float32Array((ed - st) * 3)
    for (let i = st; i < ed; i++) {
        if (active[i] === 0) continue
        const index = i * 3
        const vel = new THREE.Vector3(
            velocity[index],
            velocity[index + 1],
            velocity[index + 2]
        )
        vel.multiplyScalar(Math.pow(10, -9) * delta)
        output[index - st * 3] = position[index] + vel.x
        output[index - st * 3 + 1] = position[index + 1] + vel.y
        output[index - st * 3 + 2] = position[index + 2] + vel.z
    }
    postMessage({ output, active })
}
