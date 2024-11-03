const dropdowns = document.querySelectorAll(".dropdown-container"),
outputLanguageDropdown = document.querySelector("#output-language");

export function makeTranslate() {
    const dropdowns = document.querySelectorAll(".dropdown-container");

    fetch('/get-user-language')
    .then(response => response.json())
    .then(data => {
        console.log('User language:', data.userLanguage);
        
        if (dropdowns) {
            dropdowns.forEach((dropdown) => {
                dropdown.querySelectorAll(".option").forEach((item) => {
                    item.classList.remove("active");
                    if (item.dataset.value === data.userLanguage) {
                        item.classList.add("active");
                        const selected = dropdown.querySelector(".selected");
                        selected.innerHTML = item.innerHTML;
                        selected.dataset.value = data.userLanguage;
                    }
                });
            });
        }

        if (data.userLanguage) {
            translatePage(data.userLanguage);
        }
    })
    .catch(error => console.error('Error getting user language:', error));
}



function populateDropdown(dropdown, options) {
    if (!dropdown) return;
        dropdown.querySelector("ul").innerHTML = "";
        options.forEach((option) => {
        const li = document.createElement("li");
        const title = option.name + " (" + option.native + ")";
        li.innerHTML = title;
        li.dataset.value = option.code;
        li.classList.add("option");
        dropdown.querySelector("ul").appendChild(li);
        });
}

populateDropdown(outputLanguageDropdown, languages);

if (dropdowns) {
    dropdowns.forEach((dropdown) => {
        dropdown.addEventListener("click", (e) => {
        dropdown.classList.toggle("active");
    });

    dropdown.querySelectorAll(".option").forEach((item) => {
        item.addEventListener("click",async (e) => {
        //remove active class from current dropdowns
        dropdown.querySelectorAll(".option").forEach((item) => {
        item.classList.remove("active");
        });
        item.classList.add("active");
        const selected = dropdown.querySelector(".selected");
        selected.innerHTML = item.innerHTML;
        selected.dataset.value = item.dataset.value;

        console.log("Selected language:", selected.dataset.value);

        fetch('set-user-language', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userLanguage: selected.dataset.value,
            }),
        }).then(response => {
            if (response.ok) {
                console.log('User language set successfully');
                translatePage(selected.dataset.value);
            } else {
                console.error('Error setting user language');
            }
        }).catch(error => {
            console.error("Error updating voice navigation status:", error);
        });

        await translatePage(selected.dataset.value);
    });
    });
    });
}


document.addEventListener("click", (e) => {
    if (dropdowns) {
        dropdowns.forEach((dropdown) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove("active");
        }
        });
    }
});

        

document.addEventListener('DOMContentLoaded', () => {
    fetch('/get-user-language')
        .then(response => response.json())
        .then(data => {
            console.log('User language:', data.userLanguage);
            
            if (dropdowns) {
                dropdowns.forEach((dropdown) => {
                    dropdown.querySelectorAll(".option").forEach((item) => {
                        item.classList.remove("active");
                        if (item.dataset.value === data.userLanguage) {
                            item.classList.add("active");
                            const selected = dropdown.querySelector(".selected");
                            selected.innerHTML = item.innerHTML;
                            selected.dataset.value = data.userLanguage;
                        }
                    });
                });
            }

            if (data.userLanguage) {
                translatePage(data.userLanguage);
            }
        })
        .catch(error => console.error('Error getting user language:', error));
});


async function translatePage(targetLang) {
    const elements = document.querySelectorAll('[data-translate="true"]');

    for (const element of elements) {
        const text = element.innerText;

        // Fetch the translation from LibreTranslate API
        const translatedText = await fetchTranslation(text, targetLang, 'en');
        
        if (translatedText) {
            element.innerText = translatedText;
        }

    }
}

async function fetchTranslation(text, outputLanguage, inputLanguage = 'en') {
    const inputText = text;
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${inputLanguage}&tl=${outputLanguage}&dt=t&q=${encodeURI(
        inputText
    )}`;

    try {
        const response = await fetch(url);
        const json = await response.json();
        const outputText = json[0].map((item) => item[0]).join("");
        return outputText; // Return the output text
    } catch (error) {
        console.log(error);
        return null; // Return null in case of error
    }
}

