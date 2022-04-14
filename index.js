const canvas = document.querySelector("canvas")
const c = canvas.getContext("2d")

canvas.width = 1024
canvas.height = 576

const collisionsMap = []
for (let i = 0; i < collisions.length; i += 70) {
    collisionsMap.push(collisions.slice(i, 70 + i))
}

const battleZonesMap = []
for (let i = 0; i < battleZonesData.length; i += 70) {
    battleZonesMap.push(battleZonesData.slice(i, 70 + i))
}

const boundaries = []
const offset = {
    x: -735,
    y: -650
}

collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025) {
            boundaries.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            )
        }
    })
})

const battleZones = []

battleZonesMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025) {
            battleZones.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            )
        }
    })
})

const image = new Image()
image.src = "./img/Pellet Town.png"

const foregroundImage = new Image()
foregroundImage.src = "./img/foregroundObjects.png"

const playerDownImage = new Image()
playerDownImage.src = "./img/Benas down.png"

const playerUpImage = new Image()
playerUpImage.src = "./img/Benas up.png"

const playerLeftImage = new Image()
playerLeftImage.src = "./img/Benas left.png"

const playerRightImage = new Image()
playerRightImage.src = "./img/Benas right.png"

const player = new Sprite({
    position: {
        x: canvas.width / 2 - 192 / 4 / 2,
        y: canvas.height / 2 - 68 / 2
    },
    image: playerDownImage,
    frames: { max: 4, hold: 10 },
    sprites: {
        up: playerUpImage,
        down: playerDownImage,
        left: playerLeftImage,
        right: playerRightImage
    }
})

const background = new Sprite({
    position: { x: offset.x, y: offset.y },
    image: image
})

const foreground = new Sprite({
    position: { x: offset.x, y: offset.y },
    image: foregroundImage
})

const keys = {
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false }
}

const movables = [background, ...boundaries, foreground, ...battleZones]

function rectangularCollision({ reactangle1, reactangle2 }) {
    return (
        reactangle1.position.x + reactangle1.width >= reactangle2.position.x &&
        reactangle1.position.x <= reactangle2.position.x + reactangle2.width &&
        reactangle1.position.y <= reactangle2.position.y + reactangle2.height &&
        reactangle1.position.y + reactangle1.height >= reactangle2.position.y
    )
}

const battle = {
    initiated: false
}

function animate() {
    const animationId = window.requestAnimationFrame(animate)
    background.draw()
    boundaries.forEach((boundary) => boundary.draw())
    battleZones.forEach((battleZone) => battleZone.draw())
    player.draw()
    foreground.draw()

    let moving = true
    player.animate = false

    if (battle.initiated) return

    // activate a battle
    if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
        for (let i = 0; i < battleZones.length; i++) {
            const battleZone = battleZones[i]
            const overlappingArea =
                (Math.min(
                    player.position.x + player.width,
                    battleZone.position.x + battleZone.width
                ) -
                    Math.max(player.position.x, battleZone.position.x)) *
                (Math.min(
                    player.position.y + player.height,
                    battleZone.position.y + battleZone.height
                ) -
                    Math.max(player.position.y, battleZone.position.y))

            if (
                rectangularCollision({
                    reactangle1: player,
                    reactangle2: battleZone
                }) &&
                overlappingArea > (player.width * player.height) / 2 &&
                Math.random() < 0.01
            ) {
                // deactivate current animation loop
                window.cancelAnimationFrame(animationId)

                audio.map.stop()
                audio.initBattle.play()
                audio.battle.play()

                battle.initiated = true
                gsap.to("#overlappingDiv", {
                    opacity: 1,
                    repeat: 3,
                    yoyo: true,
                    duration: 0.4,
                    onComplete: () => {
                        gsap.to("#overlappingDiv", {
                            opacity: 1,
                            duration: 0.4,
                            onComplete: () => {
                                // activate a new animation loop
                                initBattle()
                                animateBattle()
                                gsap.to("#overlappingDiv", {
                                    opacity: 0,
                                    duration: 0.4
                                })
                            }
                        })
                    }
                })

                break
            }
        }
    }

    if (keys.w.pressed && lastKey === "w") {
        player.animate = true
        player.image = player.sprites.up

        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    reactangle1: player,
                    reactangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x,
                            y: boundary.position.y + 3
                        }
                    }
                })
            ) {
                moving = false
                break
            }
        }

        if (moving) {
            movables.forEach((movable) => (movable.position.y += 3))
        }
    } else if (keys.a.pressed && lastKey === "a") {
        player.animate = true
        player.image = player.sprites.left

        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    reactangle1: player,
                    reactangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x + 3,
                            y: boundary.position.y
                        }
                    }
                })
            ) {
                moving = false
                break
            }
        }
        if (moving) {
            movables.forEach((movable) => (movable.position.x += 3))
        }
    } else if (keys.s.pressed && lastKey === "s") {
        player.animate = true
        player.image = player.sprites.down

        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    reactangle1: player,
                    reactangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x,
                            y: boundary.position.y - 3
                        }
                    }
                })
            ) {
                moving = false
                break
            }
        }
        if (moving) {
            movables.forEach((movable) => (movable.position.y -= 3))
        }
    } else if (keys.d.pressed && lastKey === "d") {
        player.animate = true
        player.image = player.sprites.right

        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    reactangle1: player,
                    reactangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x - 3,
                            y: boundary.position.y
                        }
                    }
                })
            ) {
                moving = false
                break
            }
        }
        if (moving) {
            movables.forEach((movable) => (movable.position.x -= 3))
        }
    }
}

animate()

let lastKey = ""

window.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "w":
            keys.w.pressed = true
            lastKey = "w"
            break
        case "a":
            keys.a.pressed = true
            lastKey = "a"
            break
        case "s":
            keys.s.pressed = true
            lastKey = "s"
            break
        case "d":
            keys.d.pressed = true
            lastKey = "d"
            break
    }
})

window.addEventListener("keyup", (e) => {
    switch (e.key) {
        case "w":
            keys.w.pressed = false
            break
        case "a":
            keys.a.pressed = false
            break
        case "s":
            keys.s.pressed = false
            break
        case "d":
            keys.d.pressed = false
            break
    }
})

document.getElementById("pressUp").addEventListener("touchstart", (e) => {
    e.preventDefault()
    keys.w.pressed = true
    lastKey = "w"
})
document.getElementById("pressLeft").addEventListener("touchstart", (e) => {
    e.preventDefault()
    keys.a.pressed = true
    lastKey = "a"
})
document.getElementById("pressDown").addEventListener("touchstart", (e) => {
    e.preventDefault()
    keys.s.pressed = true
    lastKey = "s"
})
document.getElementById("pressRight").addEventListener("touchstart", (e) => {
    e.preventDefault()
    keys.d.pressed = true
    lastKey = "d"
})

document.getElementById("pressUp").addEventListener("touchend", (e) => {
    e.preventDefault()
    keys.w.pressed = false
})
document.getElementById("pressLeft").addEventListener("touchend", (e) => {
    e.preventDefault()
    keys.a.pressed = false
})
document.getElementById("pressDown").addEventListener("touchend", (e) => {
    e.preventDefault()
    keys.s.pressed = false
})
document.getElementById("pressRight").addEventListener("touchend", (e) => {
    e.preventDefault()
    keys.d.pressed = false
})

let clicked = false
addEventListener("click", () => {
    if (!clicked) {
        clicked = true
        audio.map.play()
    }
})
