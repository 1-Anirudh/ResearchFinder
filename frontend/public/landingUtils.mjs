import { makeTranslate, translateElements } from './translation.mjs';
// window.recommendations = getRecommendations(window.opportunityData, interests);


const itemsPerPage = 12;
let currentPage = 1;


export function addMode(mode) {
    const button = document.getElementById("work-mode-button");
    button.innerHTML = mode;
    button.classList.add('active');
    const clearButton = document.getElementById("clear-button-id");
    clearButton.classList.add('active');


    const filteredOpportunities_1 = Object.keys(window.filteredOpportunities).reduce((acc, key) => {
    const opportunity = window.filteredOpportunities[key];
    if (mode === 'any') {
    acc[key] = opportunity;
    } else if (opportunity.mode === mode) {
    acc[key] = opportunity;
    }
    return acc;
    }, {});
    window.filteredOpportunities_1 = filteredOpportunities_1;


    filterAllOpportunities();
}

export function addType(type) {
    const button = document.getElementById("work-type-button");
    button.innerHTML = type;
    button.classList.add('active');
    const clearButton = document.getElementById("clear-button-id");
    clearButton.classList.add('active');


    const filteredOpportunities_2 = Object.keys(window.filteredOpportunities).reduce((acc, key) => {
    const opportunity = window.filteredOpportunities[key];
    if (type === 'any') {
    acc[key] = opportunity;
    } else if (opportunity.type === type) {
    acc[key] = opportunity;
    }
    return acc;
    }, {});
    window.filteredOpportunities_2 = filteredOpportunities_2;


    filterAllOpportunities();
}

export function addDuration(duration) {
    const button = document.getElementById("duration-button");
    button.innerHTML = duration;
    button.classList.add('active');
    const clearButton = document.getElementById("clear-button-id");
    clearButton.classList.add('active');

    var minVal = 0;
    var maxVal = 1000000;

    if (duration === '1-3 months') {
    var minVal = 1;
    var maxVal = 3;
    } else if (duration === '3-6 months') {
    var minVal = 3;
    var maxVal = 6;
    } else if (duration === '6-12 months') {
    var minVal = 6;
    var maxVal = 12;
    } else if (duration === '12+ months') {
    var minVal = 12;
    var maxVal = 1000000;
    }

    const filteredOpportunities_3 = Object.keys(window.filteredOpportunities).reduce((acc, key) => {
    const opportunity = window.filteredOpportunities[key];
    if (duration === 'any') {
    acc[key] = opportunity;
    } else if (opportunity.duration >= minVal && opportunity.duration <= maxVal) {
    acc[key] = opportunity;
    }
    return acc;
    }, {});
    window.filteredOpportunities_3 = filteredOpportunities_3;


    filterAllOpportunities();
}

export function addStipend(stipend) {
    const button = document.getElementById("stipend-button");
    button.innerHTML = stipend;
    button.classList.add('active');
    const clearButton = document.getElementById("clear-button-id");
    clearButton.classList.add('active');

    var minVal = 0;
    var maxVal = 1000000;
    if (stipend === '$0-1,000') {
    var minVal = 0;
    var maxVal = 1000;
    } else if (stipend === '$1,000-2,000') {
    var minVal = 1000;
    var maxVal = 2000;
    } else if (stipend === '$2,000-3,000') {
    var minVal = 2000;
    var maxVal = 3000;
    } else if (stipend === '$3,000+') {
    var minVal = 3000;
    var maxVal = 1000000;
    }

    const filteredOpportunities_4 = Object.keys(window.filteredOpportunities).reduce((acc, key) => {
    const opportunity = window.filteredOpportunities[key];
    if (stipend === 'any') {
    acc[key] = opportunity;
    } else if (opportunity.stipend >= minVal && opportunity.stipend <= maxVal) {
    acc[key] = opportunity;
    }
    return acc;
    }, {});
    window.filteredOpportunities_4 = filteredOpportunities_4;


    filterAllOpportunities();
}

export function clearFilters() {
    const buttons = document.querySelectorAll('.filter-button');
    buttons.forEach(button => {
    button.classList.remove('active');
    const lastIndex = button.id.lastIndexOf('-');
    button.innerHTML = button.id.substring(0, lastIndex);
    });
    const clearButton = document.getElementById("clear-button-id");
    clearButton.classList.remove('active');

    window.filteredOpportunities_1 = window.filteredOpportunities;
    window.filteredOpportunities_2 = window.filteredOpportunities;
    window.filteredOpportunities_3 = window.filteredOpportunities;
    window.filteredOpportunities_4 = window.filteredOpportunities;

    createPagination(currentPage, window.filteredOpportunities);
    loadOpportunities(window.filteredOpportunities, currentPage);
}


function filterAllOpportunities() {
    const keys_1 = Object.keys(window.filteredOpportunities_1);
    const keys_2 = Object.keys(window.filteredOpportunities_2);
    const keys_3 = Object.keys(window.filteredOpportunities_3);
    const keys_4 = Object.keys(window.filteredOpportunities_4);
    const allKeys = [...keys_1, ...keys_2, ...keys_3, ...keys_4];

    const keys = allKeys.filter(key => keys_1.includes(key) && keys_2.includes(key) && keys_3.includes(key) && keys_4.includes(key));
    const newFilteredOpportunities = keys.reduce((acc, key) => {
    acc[key] = window.filteredOpportunities[key];
    return acc;
    }, {});

    createPagination(currentPage, newFilteredOpportunities);
    loadOpportunities(newFilteredOpportunities, currentPage);
}



function createPagination(page, opportunites) {
    const paginationControls = document.querySelector(".pagination ul");
    paginationControls.innerHTML = ''; // Clear existing pagination controls

    let totalPages = Math.ceil(Object.keys(opportunites).length / itemsPerPage);
    let beforePage = page - 1;
    let afterPage = page + 1;

    if (page > 1) {
        const prevButton = document.createElement('li');
        prevButton.classList.add('btn', 'prev');
        prevButton.innerHTML = '<span><i class="fas fa-angle-left"></i> Prev</span>';
        prevButton.addEventListener('click', function() {
            createPagination(page - 1, opportunites);
            loadOpportunities(opportunites, page - 1);
        });
        paginationControls.appendChild(prevButton);
    }

    if (page > 2) {
        const firstPageButton = document.createElement('li');
        firstPageButton.classList.add('numb');
        firstPageButton.innerHTML = '<span>1</span>';
        firstPageButton.addEventListener('click', function() {
            createPagination(1, opportunites);
            loadOpportunities(opportunites, 1);
        });
        paginationControls.appendChild(firstPageButton);

        if (page > 3) {
            const dots = document.createElement('li');
            dots.classList.add('dots');
            dots.innerHTML = '<span>...</span>';
            paginationControls.appendChild(dots);
        }
    }

    if (page === totalPages) {
        beforePage = page - 1;
    }

    if (page === 1) {
        afterPage = page + 1;
    }

    for (let plength = beforePage; plength <= afterPage; plength++) {
        if (plength > totalPages) {
            continue;
        }
        if (plength === 0) {
            plength = plength + 1;
        }
        const pageButton = document.createElement('li');
        pageButton.classList.add('numb');
        if (page === plength) {
            pageButton.classList.add('active');
        }
        pageButton.innerHTML = `<span>${plength}</span>`;
        pageButton.addEventListener('click', function() {
            createPagination(plength, opportunites);
            loadOpportunities(opportunites, plength);
        });
        paginationControls.appendChild(pageButton);
    }

    if (page < totalPages - 1) {
        if (page < totalPages - 2) {
            const dots = document.createElement('li');
            dots.classList.add('dots');
            dots.innerHTML = '<span>...</span>';
            paginationControls.appendChild(dots);
        }
        const lastPageButton = document.createElement('li');
        lastPageButton.classList.add('numb');
        lastPageButton.innerHTML = `<span>${totalPages}</span>`;
        lastPageButton.addEventListener('click', function() {
            createPagination(totalPages, opportunites);
            loadOpportunities(opportunites, totalPages);
        });
        paginationControls.appendChild(lastPageButton);
    }

    if (page < totalPages) {
        const nextButton = document.createElement('li');
        nextButton.classList.add('btn', 'next');
        nextButton.innerHTML = '<span>Next <i class="fas fa-angle-right"></i></span>';
        nextButton.addEventListener('click', function() {
            createPagination(page + 1, opportunites);
            loadOpportunities(opportunites, page + 1);
        });
        paginationControls.appendChild(nextButton);
    }
}



function loadOpportunities(opportunities, page) {
    let containers = document.querySelector('.containers');
    containers.innerHTML = '';

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const keys = Object.keys(opportunities).slice(start, end);
    // const keys = Object.keys(opportunities);
    keys.forEach(key => {
    const opportunity = opportunities[key];
    let container = document.createElement('div');
    container.classList.add('container');
    container.setAttribute("Opportunity-ID", key);
    container.innerHTML = `
    <div class="product">
        <p class="product-p" data-translate="true"  name="topic">${opportunity.topic}</p>
        <h2 class="product-h1" data-translate="true"  name="title">${opportunity.title}</h2>
        <p class="product-pl" data-translate="true"  name="location">${opportunity.location}</p>
        <p class="product-desc" data-translate="true" name="shortDescription">${opportunity.shortDescription}</p>
        <p class="product-p2" data-translate="true"  name="stipend">stipend:  $${opportunity.stipend} /month</p>
        <p class="product-p2" data-translate="true"  name="duration">duration: ${opportunity.duration} months </p>
        <p class="product-p2" data-translate="true"  name="mode">work-mode: ${opportunity.mode} </p>
        <p class="product-p2" data-translate="true"  name="type">work-type: ${opportunity.type} </p>
        <div class="product-buttons">
        <button data-translate="true" data-link="${opportunity.link}" class="product-button-add" type="button">Apply Now</button>
        <button data-translate="true"  class="product-button-like" type="button"><span>♥</span></button>
        </div>
    </div>
    `;

    if (opportunity.recommend) {
        const img = document.createElement('img');
        img.src = 'images/recommended.png';
        img.className = 'ribbon';
        img.alt = '';
        container.appendChild(img);
    }

    containers.appendChild(container);
    });

    attachEventListeners();

    makeTranslate();
}

async function searchOpportunities(bysearch = true) {
    const searchInput = document.getElementById('search-input');
    const searchValue = searchInput.value.toLowerCase();
    console.log('searchValue ', searchValue);
    if (!searchValue) {
        return;
    }

    searchOpportunitiesINP(searchValue, bysearch);
}

export async function searchOpportunitiesINP(searchValue, bysearch) {
    if (bysearch) {
    const newUrl = `${window.location.origin}${window.location.pathname}?s=${encodeURIComponent(searchValue)}`;
    history.pushState({ path: newUrl }, '', newUrl);
}

const filteredOpportunities = Object.keys(window.opportunityData).reduce((acc, key) => {
const opportunity = window.opportunityData[key];
if (opportunity.title.toLowerCase().includes(searchValue) || 
    opportunity.topic.toLowerCase().includes(searchValue) || 
    opportunity.location.toLowerCase().includes(searchValue) || 
    opportunity.institution.toLowerCase().includes(searchValue) ||
    opportunity.shortDescription.toLowerCase().includes(searchValue) ||
    opportunity.tags.includes(searchValue)) {
    acc[key] = opportunity;
}
return acc;
}, {});

window.filteredOpportunities = filteredOpportunities;
clearFilters();


createPagination(currentPage, filteredOpportunities);
loadOpportunities(filteredOpportunities, currentPage);
}


let arrow = document.querySelectorAll(".arrow");
for (var i = 0; i < arrow.length; i++) {
    arrow[i].addEventListener("click", (e)=>{
        let arrowParent = e.target.parentElement.parentElement;//selecting main parent of arrow
        arrowParent.classList.toggle("showMenu");
    });
}

let sidebar = document.querySelector(".sidebar");
let sidebarBtn = document.querySelector(".bx-menu");
sidebarBtn.addEventListener("click", ()=>{
    sidebar.classList.toggle("close");
});


const themeToggle = document.getElementById("dark-light");
const body = document.body;

// Load the preferred theme from localStorage (if available)
const savedTheme = localStorage.getItem('theme') || 'dark-theme';
body.classList.add(savedTheme);
themeToggle.checked = savedTheme === 'light-theme';

// Listen for the toggle change event
themeToggle.addEventListener("change", () => {
if (themeToggle.checked) {
body.classList.remove('dark-theme');
body.classList.add('light-theme');
localStorage.setItem('theme', 'light-theme');

const selectedTheme = 'light-theme';

fetch('/set-theme', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ theme: selectedTheme })
})
.then(response => response.json())
.then(data => {
  if (!data.success) {
    console.error('Error setting theme on server');
  }
})
.catch(error => console.error('Error setting theme:', error));

} else {
body.classList.remove('light-theme');
body.classList.add('dark-theme');
localStorage.setItem('theme', 'dark-theme');

const selectedTheme = 'dark-theme';

fetch('/set-theme', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ theme: selectedTheme })
})
.then(response => response.json())
.then(data => {
  if (!data.success) {
    console.error('Error setting theme on server');
  }
})
.catch(error => console.error('Error setting theme:', error));
}
});

window.addEventListener('popstate', function(event) {
const searchParams = new URLSearchParams(window.location.search);
const searchValue = searchParams.get('s');
if (searchValue) {
    document.getElementById('search-input').value = searchValue;
    searchOpportunities(false);
} else {
    document.getElementById('search-input').value = '';
    window.filteredOpportunities = window.opportunityData;
    window.filteredOpportunities_1 = window.opportunityData;
    window.filteredOpportunities_2 = window.opportunityData;
    window.filteredOpportunities_3 = window.opportunityData;
    window.filteredOpportunities_4 = window.opportunityData;

    createPagination(currentPage, window.opportunityData);
    loadOpportunities(window.opportunityData, currentPage);
}
});

document.addEventListener('DOMContentLoaded', function() {
if (!history.state) {
    const initialUrl = `${window.location.origin}${window.location.pathname}`;
    history.replaceState({ path: initialUrl }, '', initialUrl);
}


attachEventListeners();

const searchParams = new URLSearchParams(window.location.search);
const searchValue = searchParams.get('s');
if (searchValue) {
    document.getElementById('search-input').value = searchValue;
    searchOpportunities();
} else {
  createPagination(currentPage, window.opportunityData);
  loadOpportunities(window.opportunityData, currentPage);
}
});


async function attachEventListeners() {



const containers = document.querySelectorAll('.container');
    const popupContainer = document.querySelector('.popup-container');

    containers.forEach(container => {
            container.addEventListener('click', async function(e) {
            
            if (e.target.classList.contains('product-button-add') || e.target.classList.contains('product-button-like')) {
                return; // Exit the event listener if a button is clicked
            }

            e.stopPropagation(); // Prevent the click from propagating to the window
            const opportunityId = this.getAttribute('Opportunity-ID');
            const opportunity = window.opportunityData[opportunityId];

            let popup = document.createElement('div');
            popup.classList.add('product-selected');
            popup.innerHTML = `
                <p class="product-p" data-translate="true"  name="topic">${opportunity.topic}</p>
                <h2 class="product-h1" data-translate="true"  name="title">${opportunity.title}</h2>
                <p class="product-pl"  data-translate="true" name="location">${opportunity.location}</p>
                <p class="product-pl"  data-translate="true" name="institution">${opportunity.institution}</p>
                <p class="product-desc" data-translate="true"  name="longDescription">${opportunity.longDescription}</p>
                <p class="product-p2"  data-translate="true" name="stipend">reference: ${opportunity.postBy} </p>
                <p class="product-p2" data-translate="true"  name="stipend">stipend: $${opportunity.stipend} /month </p>
                <p class="product-p2"  data-translate="true" name="duration">duration: ${opportunity.duration} months</p>
                <p class="product-p2"  data-translate="true" name="mode">work-mode: ${opportunity.mode} </p>
                <p class="product-p2"  data-translate="true" name="type">work-type: ${opportunity.type} </p>
                <div class="product-buttons">
                    <button  data-translate="true" class="product-button-add" type="button" onclick="window.open('${opportunity.link}', '_blank')">Apply Now</button>
                    <button  data-translate="true" class="product-button-like" type="button"><span>♥</span></button>
                </div>
            `;
            popupContainer.innerHTML = ''; // Clear any existing content
            popupContainer.appendChild(popup);
            popupContainer.style.display = 'flex'; // Show the popup container

            if (opportunity.recommend) {
                const img = document.createElement('img');
                img.src = 'images/recommended.png';
                img.className = 'ribbon';
                img.alt = '';
                popupContainer.appendChild(img);
            }
            
            const popupHeight = popup.offsetHeight + 100; // Add 100px to the natural height
            popup.style.height = `${popupHeight}px`;

            await translateElements(popupContainer);
        });
    });

    window.addEventListener('click', function() {
        popupContainer.style.display = 'none'; // Hide the popup container
        popupContainer.innerHTML = ''; // Clear the popup content
    });

    popupContainer.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent the click from propagating to the window
    });

    const searchInput = document.getElementById("search-input");

    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            searchOpportunities();
        }
    });

    const searchButton = document.getElementById("search");

    searchButton.addEventListener("click", searchOpportunities);


    const workModeButton = document.getElementById("work-mode-button");
    const options = document.querySelectorAll("#work-mode .filter-dropdown .option");
    options.forEach((option) => {
        option.addEventListener("click", () => {
            const mode = option.id; // Get the ID of the clicked option
            addMode(mode); // Pass the ID to the addMode function
        });
    });

    const workTypeButton = document.getElementById("work-type-button");
    const options2 = document.querySelectorAll("#work-type .filter-dropdown .option");
    options2.forEach((option) => {
        option.addEventListener("click", () => {
            const type = option.id; // Get the ID of the clicked option
            addType(type); // Pass the ID to the addType function
        });
    });

    const durationButton = document.getElementById("duration-button");
    const options3 = document.querySelectorAll("#duration .filter-dropdown .option");
    options3.forEach((option) => {
        option.addEventListener("click", () => {
            const duration = option.id; // Get the ID of the clicked option
            addDuration(duration); // Pass the ID to the addDuration function
        });
    });

    const stipendButton = document.getElementById("stipend-button");
    const options4 = document.querySelectorAll("#stipend .filter-dropdown .option");
    options4.forEach((option) => {
        option.addEventListener("click", () => {
            const stipend = option.id; // Get the ID of the clicked option
            addStipend(stipend); // Pass the ID to the addStipend function
        });
    });

    const clearButton = document.getElementById("clear-button-id");
    clearButton.addEventListener("click", clearFilters);
}

document.addEventListener('DOMContentLoaded', function() {
    attachEventListeners();
});
