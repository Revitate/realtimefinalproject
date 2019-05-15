/* eslint-disable */
importScripts('./three.js')
onmessage = e => {
    const { position, mass, velocity, active, delta, st, ed } = e.data
    const output = new Float32Array((ed - st) * 3)
    for (let i = st; i < ed; i++) {
        if (active[i] === 0) continue

        const index = i * 3
        const acc = new THREE.Vector3()
        const pos = new THREE.Vector3(
            position[index],
            position[index + 1],
            position[index + 2]
        )
        for (let j = 0; j < active.length; j++) {
            if (i === j || active[j] === 0) continue
            const index2 = j * 3
            const pos2 = new THREE.Vector3(
                position[index2],
                position[index2 + 1],
                position[index2 + 2]
            )
            const directionVector = new THREE.Vector3().subVectors(pos2, pos)
            const distanceSqrt = Math.max(directionVector.lengthSq(), 1)
            const direction = directionVector.normalize()
            acc.add(
                direction.multiplyScalar(
                    (6.67 * mass[j]) / Math.pow(10, 5) / distanceSqrt
                )
            )
        }
        acc.multiplyScalar(delta)
        output[index - st * 3] = velocity[index] + acc.x
        output[index - st * 3 + 1] = velocity[index + 1] + acc.y
        output[index - st * 3 + 2] = velocity[index + 2] + acc.z
    }
    postMessage({ output, active })
}
