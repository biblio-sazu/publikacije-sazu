// =========================================
// BIBLIOTEKA SAZU - BOOK FILTER + SORT
// =========================================


// =========================================
// ELEMENTS
// =========================================

const mainCategoryButtons = document.querySelectorAll(
    ".category-main"
);

const subcategoryButtons = document.querySelectorAll(
    ".subcategory"
);

const books = Array.from(
    document.querySelectorAll(".book-card")
);

const bookGrid = document.querySelector(
    "#bookGrid"
);

const bookCount = document.querySelector(
    ".book-count"
);

const sortButton = document.querySelector(
    "#sortButton"
);

const sortArrow = document.querySelector(
    ".sort-arrow"
);

const sortLabel = document.querySelector(
    ".sort-label"
);

const bookSearch = document.querySelector(
    "#bookSearch"
);

const clearSearch = document.querySelector(
    "#clearSearch"
);


// =========================================
// CURRENT FILTER
// =========================================

let currentCategory = "all";
let currentSubcategory = null;
let currentSearch = "";


// =========================================
// CURRENT SORT
// =========================================

let newestFirst = true;


// =========================================
// SMALL-SCREEN CHECK
// =========================================

function isSmallScreen() {

    return window.matchMedia(
        "(max-width: 750px)"
    ).matches;

}


// =========================================
// HELPER:
// GET MULTIPLE VALUES FROM DATA ATTRIBUTE
// =========================================

function getValues(value) {

    if (!value) {
        return [];
    }

    return value
        .split(",")
        .map(value => value.trim())
        .filter(Boolean);

}


// =========================================
// CLOSE ALL SUBMENUS
// =========================================

function closeAllSubmenus() {

    document
        .querySelectorAll(".subcategory-wrapper")
        .forEach(submenu => {

            submenu.classList.remove("open");

            submenu.setAttribute(
                "aria-hidden",
                "true"
            );

        });


    mainCategoryButtons.forEach(button => {

        if (button.hasAttribute("aria-controls")) {

            button.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    });

}


// =========================================
// CLOSE ONE BOOK OVERLAY
// =========================================

function closeBookOverlay(book) {

    if (!book) {
        return;
    }


    book.classList.remove("overlay-open");


    const overlay =
        book.querySelector(".book-overlay");

    const bookLink =
        book.querySelector(".book-link");


    if (overlay) {

        overlay.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    if (bookLink) {

        bookLink.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}


// =========================================
// CLOSE ALL BOOK OVERLAYS
// =========================================

function closeAllBookOverlays() {

    books.forEach(book => {

        closeBookOverlay(book);

    });

}


// =========================================
// OPEN ONE BOOK OVERLAY
// =========================================

function openBookOverlay(book) {

    if (!book) {
        return;
    }


    const overlay =
        book.querySelector(".book-overlay");

    const bookLink =
        book.querySelector(".book-link");


    if (!overlay) {
        return;
    }


    // Close any other open overlay.
    books.forEach(otherBook => {

        if (otherBook !== book) {

            closeBookOverlay(otherBook);

        }

    });


    book.classList.add("overlay-open");


    overlay.setAttribute(
        "aria-hidden",
        "false"
    );


    if (bookLink) {

        bookLink.setAttribute(
            "aria-expanded",
            "true"
        );

    }

}


// =========================================
// TOGGLE BOOK OVERLAY
// =========================================

function toggleBookOverlay(book) {

    if (!book) {
        return;
    }


    const isOpen =
        book.classList.contains("overlay-open");


    if (isOpen) {

        closeBookOverlay(book);

    } else {

        openBookOverlay(book);

    }

}


// =========================================
// UPDATE BOOK VISIBILITY
// =========================================

function updateBooks() {

    let visibleBooks = 0;


    // -----------------------------------------
    // PREPARE SEARCH WORDS
    // -----------------------------------------

    const searchWords =
        currentSearch
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean);


    // -----------------------------------------
    // CHECK EVERY BOOK
    // -----------------------------------------

    books.forEach(book => {

        const categories =
            getValues(book.dataset.category);

        const subcategories =
            getValues(book.dataset.subcategory);


        // -------------------------------------
        // CATEGORY
        // -------------------------------------

        const categoryMatches =
            currentCategory === "all" ||
            categories.includes(currentCategory);


        // -------------------------------------
        // SUBCATEGORY
        // -------------------------------------

        const subcategoryMatches =
            currentSubcategory === null ||
            subcategories.includes(currentSubcategory);


        // -------------------------------------
        // SEARCH
        // -------------------------------------

        const bookText =
            book.textContent.toLowerCase();

        const searchMatches =
            searchWords.length === 0 ||
            searchWords.every(word =>
                bookText.includes(word)
            );


        // -------------------------------------
        // FINAL RESULT
        // -------------------------------------

        const shouldShow =
            categoryMatches &&
            subcategoryMatches &&
            searchMatches;


        if (shouldShow) {

            book.classList.remove("hidden");

            visibleBooks++;

        } else {

            book.classList.add("hidden");

            // Close overlay if the book
            // disappears because of filtering.
            closeBookOverlay(book);

        }

    });


    // -----------------------------------------
    // UPDATE BOOK COUNT
    // -----------------------------------------

    if (bookCount) {

        bookCount.textContent =
            visibleBooks === 1
                ? "1 knjiga"
                : `${visibleBooks} knjig`;

    }

}


// =========================================
// SORT BOOKS
// =========================================

function sortBooks() {

    if (!bookGrid) {
        return;
    }


    const bookArray =
        [...books];


    bookArray.sort((a, b) => {

        const yearA =
            Number(a.dataset.year) || 0;

        const yearB =
            Number(b.dataset.year) || 0;

        const orderA =
            Number(a.dataset.order) || 999;

        const orderB =
            Number(b.dataset.order) || 999;


        // -------------------------------------
        // FIRST: YEAR
        // -------------------------------------

        if (yearA !== yearB) {

            return newestFirst
                ? yearB - yearA
                : yearA - yearB;

        }


        // -------------------------------------
        // SECOND: CUSTOM ORDER
        // -------------------------------------

        if (orderA !== orderB) {

            return newestFirst
                ? orderB - orderA
                : orderA - orderB;

        }


        // -------------------------------------
        // FINAL FALLBACK:
        // ORIGINAL DOM ORDER
        // -------------------------------------

        return books.indexOf(a) -
               books.indexOf(b);

    });


    bookArray.forEach(book => {

        bookGrid.appendChild(book);

    });

}


// =========================================
// UPDATE SORT BUTTON
// =========================================

function updateSortButton() {

    if (
        !sortButton ||
        !sortArrow ||
        !sortLabel
    ) {
        return;
    }


    if (newestFirst) {

        sortArrow.textContent = "↓";

        sortLabel.textContent =
            "Najnovejše";

        sortButton.setAttribute(
            "aria-label",
            "Razvrsti publikacije od najstarejših do najnovejših"
        );

        sortButton.setAttribute(
            "title",
            "Razvrsti od najstarejših do najnovejših"
        );

    } else {

        sortArrow.textContent = "↑";

        sortLabel.textContent =
            "Najstarejše";

        sortButton.setAttribute(
            "aria-label",
            "Razvrsti publikacije od najnovejših do najstarejših"
        );

        sortButton.setAttribute(
            "title",
            "Razvrsti od najnovejših do najstarejših"
        );

    }

}


// =========================================
// SORT BUTTON
// =========================================

if (sortButton) {

    sortButton.addEventListener(
        "click",
        () => {

            newestFirst =
                !newestFirst;


            updateSortButton();

            sortBooks();

        }
    );

}


// =========================================
// SET ACTIVE MAIN CATEGORY
// =========================================

function setActiveMainCategory(activeButton) {

    mainCategoryButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button === activeButton
        );

    });

}


// =========================================
// CLEAR ACTIVE SUBCATEGORY
// =========================================

function clearActiveSubcategory() {

    subcategoryButtons.forEach(button => {

        button.classList.remove("active");

    });

}


// =========================================
// MAIN CATEGORY BUTTONS
// =========================================

mainCategoryButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const category =
                button.dataset.category;

            const submenuId =
                button.getAttribute(
                    "aria-controls"
                );


            // ---------------------------------
            // CATEGORY WITH SUBMENU
            // ---------------------------------

            if (submenuId) {

                const submenu =
                    document.getElementById(
                        submenuId
                    );


                if (!submenu) {
                    return;
                }


                const wasOpen =
                    submenu.classList.contains(
                        "open"
                    );


                closeAllSubmenus();

                setActiveMainCategory(
                    button
                );

                clearActiveSubcategory();


                currentCategory =
                    category;

                currentSubcategory =
                    null;


                // Re-open if it was previously closed.
                if (!wasOpen) {

                    submenu.classList.add(
                        "open"
                    );

                    submenu.setAttribute(
                        "aria-hidden",
                        "false"
                    );

                    button.setAttribute(
                        "aria-expanded",
                        "true"
                    );

                }


                updateBooks();

                return;

            }


            // ---------------------------------
            // NORMAL CATEGORY
            // ---------------------------------

            closeAllSubmenus();

            setActiveMainCategory(
                button
            );

            clearActiveSubcategory();


            currentCategory =
                category;

            currentSubcategory =
                null;


            updateBooks();

        }
    );

});


// =========================================
// SUBCATEGORY BUTTONS
// =========================================

subcategoryButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const subcategory =
                button.dataset.subcategory;


            const submenu =
                button.closest(
                    ".subcategory-wrapper"
                );


            if (!submenu) {
                return;
            }


            const mainButton =
                document.querySelector(
                    `[aria-controls="${submenu.id}"]`
                );


            if (!mainButton) {
                return;
            }


            // ---------------------------------
            // ACTIVE MAIN CATEGORY
            // ---------------------------------

            setActiveMainCategory(
                mainButton
            );


            // ---------------------------------
            // ACTIVE SUBCATEGORY
            // ---------------------------------

            clearActiveSubcategory();

            button.classList.add(
                "active"
            );


            // ---------------------------------
            // SET FILTER
            // ---------------------------------

            currentCategory =
                mainButton.dataset.category;

            currentSubcategory =
                subcategory;


            // ---------------------------------
            // KEEP SUBMENU OPEN
            // ---------------------------------

            submenu.classList.add(
                "open"
            );

            submenu.setAttribute(
                "aria-hidden",
                "false"
            );

            mainButton.setAttribute(
                "aria-expanded",
                "true"
            );


            // ---------------------------------
            // UPDATE BOOKS
            // ---------------------------------

            updateBooks();

        }
    );

});


// =========================================
// BOOK SEARCH
// =========================================

if (bookSearch) {

    bookSearch.addEventListener(
        "input",
        () => {

            currentSearch =
                bookSearch.value.trim();


            if (clearSearch) {

                clearSearch.style.display =
                    currentSearch !== ""
                        ? "block"
                        : "none";

            }


            updateBooks();

        }
    );

}


// =========================================
// CLEAR SEARCH
// =========================================

if (clearSearch) {

    clearSearch.addEventListener(
        "click",
        () => {

            if (bookSearch) {

                bookSearch.value = "";

                bookSearch.focus();

            }


            currentSearch = "";

            clearSearch.style.display =
                "none";


            updateBooks();

        }
    );

}


// =========================================
// BOOK OVERLAY INITIALIZATION
// =========================================

function initializeBookOverlay(book) {

    const overlay =
        book.querySelector(".book-overlay");

    const bookLink =
        book.querySelector(".book-link");


    // No overlay = normal book link.
    if (!overlay || !bookLink) {
        return;
    }


    // -----------------------------------------
    // ACCESSIBILITY
    // -----------------------------------------

    overlay.setAttribute(
        "role",
        "dialog"
    );

    overlay.setAttribute(
        "aria-hidden",
        "true"
    );

    bookLink.setAttribute(
        "aria-expanded",
        "false"
    );


    // -----------------------------------------
    // CREATE OVERLAY METADATA
    // -----------------------------------------

    createOverlayMetadata(
        book,
        overlay
    );


    // -----------------------------------------
    // BOOK CLICK
    // -----------------------------------------

    bookLink.addEventListener(
        "click",
        event => {

            // Desktop:
            // Keep normal link behaviour.
            // CSS controls the hover overlay.

            if (!isSmallScreen()) {
                return;
            }


            // Mobile:
            // Open/close the overlay instead
            // of following the link.

            event.preventDefault();
            event.stopPropagation();


            toggleBookOverlay(book);

        }
    );


    // -----------------------------------------
    // KEYBOARD ACCESS
    // -----------------------------------------

    bookLink.addEventListener(
        "keydown",
        event => {

            if (!isSmallScreen()) {
                return;
            }


            if (
                event.key !== "Enter" &&
                event.key !== " "
            ) {
                return;
            }


            event.preventDefault();
            event.stopPropagation();


            toggleBookOverlay(book);

        }
    );

}


// =========================================
// CREATE OVERLAY METADATA
// =========================================

function createOverlayMetadata(
    book,
    overlay
) {

    // Prevent duplicate metadata if
    // initialization is ever called again.
    if (
        overlay.querySelector(
            ".book-overlay-header"
        )
    ) {
        return;
    }


    const bookContent =
        book.querySelector(
            ".book-content"
        );


    if (!bookContent) {
        return;
    }


    const title =
        bookContent.querySelector("h3");

    const author =
        bookContent.querySelector(
            ".book-author"
        );


    // Preferred:
    // <p class="book-year">2022</p>
    //
    // Fallback:
    // Find the first paragraph that is
    // neither series nor author.
    let year =
        bookContent.querySelector(
            ".book-year"
        );


    if (!year) {

        const paragraphs =
            bookContent.querySelectorAll("p");


        year =
            Array.from(paragraphs).find(
                paragraph =>
                    !paragraph.classList.contains(
                        "book-series"
                    ) &&
                    !paragraph.classList.contains(
                        "book-author"
                    )
            );

    }


    if (!title) {
        return;
    }


    // -----------------------------------------
    // HEADER
    // -----------------------------------------

    const overlayHeader =
        document.createElement("div");

    overlayHeader.className =
        "book-overlay-header";


    // -----------------------------------------
    // TITLE
    // -----------------------------------------

    const overlayTitle =
        document.createElement("h3");

    overlayTitle.textContent =
        title.textContent.trim();


    overlayHeader.appendChild(
        overlayTitle
    );


    // -----------------------------------------
    // AUTHOR
    // -----------------------------------------

    if (author) {

        const overlayAuthor =
            document.createElement("p");

        overlayAuthor.className =
            "book-overlay-author";

        overlayAuthor.textContent =
            author.textContent.trim();


        overlayHeader.appendChild(
            overlayAuthor
        );

    }


    // -----------------------------------------
    // YEAR
    // -----------------------------------------

    if (year) {

        const overlayYear =
            document.createElement("p");

        overlayYear.className =
            "book-overlay-year";

        overlayYear.textContent =
            year.textContent.trim();


        overlayHeader.appendChild(
            overlayYear
        );

    }


    // -----------------------------------------
    // INSERT HEADER
    // -----------------------------------------

    overlay.prepend(
        overlayHeader
    );

}


// =========================================
// INITIALIZE ALL BOOK OVERLAYS
// =========================================

books.forEach(book => {

    initializeBookOverlay(book);

});


// =========================================
// MOBILE OVERLAY CLICK HANDLING
// =========================================

document.addEventListener(
    "click",
    event => {

        if (!isSmallScreen()) {
            return;
        }


        const clickedBook =
            event.target.closest(
                ".book-card"
            );


        // -------------------------------------
        // CLICK OUTSIDE ANY BOOK
        // -------------------------------------

        if (!clickedBook) {

            closeAllBookOverlays();

            return;

        }


        // -------------------------------------
        // CLICK INSIDE OVERLAY
        // -------------------------------------

        const clickedOverlay =
            event.target.closest(
                ".book-overlay"
            );


        if (clickedOverlay) {

            closeBookOverlay(
                clickedBook
            );

        }

    }
);


// =========================================
// ESCAPE KEY
// =========================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape" ||
            !isSmallScreen()
        ) {
            return;
        }


        closeAllBookOverlays();

    }
);


// =========================================
// CLOSE OVERLAYS WHEN LEAVING MOBILE
// =========================================

window.addEventListener(
    "resize",
    () => {

        if (!isSmallScreen()) {

            closeAllBookOverlays();

        }

    }
);


// =========================================
// INITIALIZE
// =========================================

updateSortButton();

sortBooks();

updateBooks();
