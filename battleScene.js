const battleBackgroundImage = new Image()
battleBackgroundImage.src = "./img/battleBackground.png"
const battleBackground = new Sprite({
    position: { x: 0, y: 0 },
    image: battleBackgroundImage
})

let draggle
let emby
let renderedSprites
let queue

let battleAnimationId

function finishBattle() {
    queue.push(() => {
        // Fade back to black
        gsap.to("#overlappingDiv", {
            opacity: 1,
            onComplete: () => {
                cancelAnimationFrame(battleAnimationId)
                animate()
                document.getElementById("userInterface").style.display = "none"
                gsap.to("#overlappingDiv", {
                    opacity: 0
                })

                battle.initiated = false
                audio.map.play()
                document.getElementById("arrowButtons").style.display = "grid"
            }
        })
    })
}

function initBattle() {
    document.getElementById("arrowButtons").style.display = "none"
    document.getElementById("userInterface").style.display = ""
    document.getElementById("dialogueBox").style.display = "none"
    document.getElementById("enemyHealthBar").style.width = ""
    document.getElementById("playerHealthBar").style.width = ""
    document.getElementById("attacksBox").replaceChildren()

    draggle = new Monster(monsters.Draggle)
    emby = new Monster(monsters.Emby)
    renderedSprites = [draggle, emby]
    queue = []

    emby.attacks.forEach((attack) => {
        const button = document.createElement("button")
        button.innerHTML = attack.name
        document.getElementById("attacksBox").append(button)
    })

    // our event listeners for our buttons (attack)
    document.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", (e) => {
            const selectedAttack = attacks[e.currentTarget.innerHTML]
            emby.attack({
                attack: selectedAttack,
                recipient: draggle,
                renderedSprites
            })

            if (draggle.health <= 0) {
                queue.push(() => {
                    draggle.faint()
                })

                finishBattle()
                return
            }

            // draggle or enemy attacks
            const randomAttack =
                draggle.attacks[
                    Math.floor(Math.random() * draggle.attacks.length)
                ]

            queue.push(() => {
                draggle.attack({
                    attack: randomAttack,
                    recipient: emby,
                    renderedSprites
                })

                if (emby.health <= 0) {
                    queue.push(() => {
                        emby.faint()
                    })

                    finishBattle()
                    return
                }
            })
        })

        button.addEventListener("mouseenter", (e) => {
            const selectedAttack = attacks[e.currentTarget.innerHTML]
            document.getElementById("attackType").innerHTML =
                selectedAttack.type
            document.getElementById("attackType").style.color =
                selectedAttack.color
        })
    })
}

function animateBattle() {
    battleAnimationId = window.requestAnimationFrame(animateBattle)
    battleBackground.draw()
    renderedSprites.forEach((sprite) => sprite.draw())
}

// initBattle()
// animateBattle()

document.getElementById("dialogueBox").addEventListener("click", (e) => {
    if (queue.length > 0) {
        queue[0]()
        queue.shift()
    } else {
        e.currentTarget.style.display = "none"
    }
})
