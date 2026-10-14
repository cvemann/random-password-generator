// theme switch: dark is the default. the choice is saved, so the lab
// and every project open in the same theme
const themeButton = document.querySelector(".theme-toggle")
const themeLabel = document.querySelector(".theme-label")

function showTheme() {
    if (document.documentElement.dataset.theme === "light") {
        themeLabel.textContent = "dark"
        themeButton.setAttribute("aria-label", "Switch to dark mode")
    } else {
        themeLabel.textContent = "light"
        themeButton.setAttribute("aria-label", "Switch to light mode")
    }
}

themeButton.addEventListener("click", function () {
    if (document.documentElement.dataset.theme === "light") {
        delete document.documentElement.dataset.theme
        localStorage.setItem("theme", "dark")
    } else {
        document.documentElement.dataset.theme = "light"
        localStorage.setItem("theme", "light")
    }
    showTheme()
})

showTheme()


const characters = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9","~","`","!","@","#","$","%","^","&","*","(",")","_","-","+","=","{","[","}","]",",","|",":",";","<",">",".","?",
"/"];


// let password = " "

// function generatePassword() { 
    
//         for (let i = 0; 1 < 16; i++) {
//             let randomCharacter = Math.floor ((Math.random() * characters.length));
//             let passwordCharacter = characters[randomCharacter];
//             password += passwordCharacter
//         }
// }

// generatePassword()

// let password = " "

// for (let i = 0; i < 16; i++) {
//     let randomCharacter = Math.floor ((Math.random() * characters.length))
//     let passwordCharacter = characters[randomCharacter]
//     password += passwordCharacter
// }


// the options on the page
const lengthSlider = document.querySelector("#length")
const lengthNumber = document.querySelector("#length-number")
const numbersBox = document.querySelector("#numbers")
const symbolsBox = document.querySelector("#symbols")

// letters are always in; numbers and symbols only if their box is ticked
// (in the characters array: 52 letters, then 10 numbers, then the symbols)
function pickCharacters() {
    let chosen = characters.slice(0, 52)
    if (numbersBox.checked) {
        chosen = chosen.concat(characters.slice(52, 62))
    }
    if (symbolsBox.checked) {
        chosen = chosen.concat(characters.slice(62))
    }
    return chosen
}

function generatePassword() {
        let passwordOne = " "
        let passwordTwo = " "
        let length = lengthSlider.value
        let chosenCharacters = pickCharacters()

        for (let i = 0; i < length; i++) {
        passwordOne += chosenCharacters[Math.floor ((Math.random() * chosenCharacters.length))]
        passwordTwo += chosenCharacters[Math.floor ((Math.random() * chosenCharacters.length))]
        }

        showPassword(document.querySelector(".password-one"), passwordOne);
        showPassword(document.querySelector(".password-two"), passwordTwo);
        showStrength(length, chosenCharacters.length);

        // the button shows it's working while the characters drop in
        genPassword.classList.add("is-working")
        setTimeout(function () {
            genPassword.classList.remove("is-working")
        }, 600)
}

// each character gets its own span, so they can drop in one after another
function showPassword(box, password) {
    password = password.trim()
    box.dataset.password = password

    const text = box.querySelector(".password-text")
    text.textContent = ""
    for (let i = 0; i < password.length; i++) {
        const letter = document.createElement("span")
        letter.textContent = password[i]
        letter.style.animationDelay = i * 25 + "ms"
        text.append(letter)
    }
    text.classList.remove("is-empty")
    box.querySelector(".password-sr").textContent = password
}

// how hard the password is to guess, in bits: length x log2(characters to pick from)
function showStrength(length, poolSize) {
    const bits = Math.round(length * Math.log2(poolSize))
    let word = "very strong"
    if (bits < 100) word = "strong"
    if (bits < 80) word = "fair"
    if (bits < 60) word = "weak"

    document.querySelector("#bits").textContent = bits
    document.querySelector("#strength-word").textContent = word
    document.querySelector(".strength-fill").style.width = Math.min(100, bits / 128 * 100) + "%"
}

// tap a password to copy it
function copyPassword() {
    const box = this
    const label = box.querySelector(".copy-label")
    if (!box.dataset.password) return

    navigator.clipboard.writeText(box.dataset.password).then(function () {
        label.textContent = "copied"
        box.classList.add("is-copied")
        setTimeout(function () {
            label.textContent = "copy"
            box.classList.remove("is-copied")
        }, 1400)
    })
}

let genPassword = document.querySelector(".generate-password")

genPassword.addEventListener("click", generatePassword)

lengthSlider.addEventListener("input", function () {
    lengthNumber.textContent = lengthSlider.value
    showStrength(lengthSlider.value, pickCharacters().length)
})
numbersBox.addEventListener("change", function () {
    showStrength(lengthSlider.value, pickCharacters().length)
})
symbolsBox.addEventListener("change", function () {
    showStrength(lengthSlider.value, pickCharacters().length)
})

document.querySelector(".password-one").addEventListener("click", copyPassword)
document.querySelector(".password-two").addEventListener("click", copyPassword)

showStrength(lengthSlider.value, pickCharacters().length)
