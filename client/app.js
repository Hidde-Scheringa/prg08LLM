document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    form.addEventListener("submit", (e) => askQuestion(e));
    console.log("Button event attached");
});

async function askQuestion(e) {
    e.preventDefault();
    const chatfield = document.getElementById("message");
    const resultdiv = document.getElementById("messagediv");
    const button = document.getElementById("formButton");
    button.disabled = true;

    const options = {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: chatfield.value })
    };

    const response = await fetch("http://localhost:3000/", options);
    if (response.ok) {
        const data = await response.json();
        console.log(data);

        const newMessage = document.createElement("div");
        newMessage.classList.add("message");

        newMessage.innerHTML = `<strong>👑 Dungeon Master:</strong> ${chatfield.value} <br><strong>🧙 Party:</strong>`;

        resultdiv.appendChild(newMessage);
        resultdiv.appendChild(document.createElement("br"));

        typeText(newMessage, data.message, 30, () => {
            button.disabled = false;
        });

        chatfield.value = "";
    } else {
        console.error(response.status);
        button.disabled = false;
    }
}




function typeText(element, text, speed, callback) {
    let index = 0;

    function type() {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
            setTimeout(type, speed);
        } else {
            if (callback) callback();
        }
    }

    type();
}
