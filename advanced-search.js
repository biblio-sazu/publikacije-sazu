/* =========================================
   BIBLIOTEKA SAZU
   ADVANCED SEARCH
========================================= */

(() => {
    "use strict";

    // =====================================
    // ELEMENTS
    // =====================================

    const advancedSearchToggle =
        document.querySelector("#advancedSearchToggle");

    const advancedSearchPanel =
        document.querySelector("#advancedSearchPanel");

    const advancedSearchClose =
        document.querySelector("#advancedSearchClose");

    const advancedSearchForm =
        document.querySelector("#advancedSearchForm");

    const advancedSearchStatus =
        document.querySelector("#advancedSearchStatus");

    const advancedSearchFields = {
        author: document.querySelector("#advancedAuthor"),
        title: document.querySelector("#advancedTitle"),
        yearFrom: document.querySelector("#advancedYearFrom"),
        yearTo: document.querySelector("#advancedYearTo"),
        otherAuthors: document.querySelector("#advancedOtherAuthors"),
        collection: document.querySelector("#advancedCollection"),
        isbn: document.querySelector("#advancedISBN"),
        cobissId: document.querySelector("#advancedCobiss"),
        keywords: document.querySelector("#advancedKeywords")
    };


    // =====================================
    // CURRENT ADVANCED SEARCH CRITERIA
    // =====================================

    let currentAdvancedSearch = {};


    // =====================================
    // NORMALIZE TEXT
    // Ignore Slovenian diacritics and case.
    // Examples:
    // č -> c, š -> s, ž -> z
    // =====================================

    function normalizeSearchText(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/-/g, "")
        .toLocaleLowerCase("sl")
        .trim();
}


    // =====================================
    // GET MULTIPLE VALUES FROM DATA ATTRIBUTES
    // =====================================

    function getValues(value) {
        if (!value) {
            return [];
        }

        return value
            .split(",")
            .map(value => value.trim())
            .filter(Boolean);
    }


    // =====================================
    // GET BOOK METADATA
    //
    // Prefer data-* attributes.
    // Fall back to visible HTML when the
    // attribute is absent or empty.
    // =====================================

    function getBookMetadata(book, attribute, selector) {
        const storedValue = book.dataset[attribute];

        if (
            storedValue !== undefined &&
            storedValue.trim() !== ""
        ) {
            return storedValue.trim();
        }

        const element = selector
            ? book.querySelector(selector)
            : null;

        return element
            ? element.textContent.trim()
            : "";
    }


    // =====================================
    // MATCH TEXT
    // Partial, case-insensitive matching
    // without diacritics.
    // =====================================

    function matchesText(value, query) {
        if (!query) {
            return true;
        }

        return normalizeSearchText(value)
            .includes(normalizeSearchText(query));
    }


    // =====================================
    // MATCH IDENTIFIERS
    // Exact match, ignoring spaces/hyphens.
    // =====================================

    function normalizeIdentifier(value) {
        return String(value || "")
            .toUpperCase()
            .replace(/[\s-]/g, "");
    }

    function matchesIdentifier(value, query) {
        if (!query) {
            return true;
        }

        return normalizeIdentifier(value) ===
            normalizeIdentifier(query);
    }


    // =====================================
    // CHECK ADVANCED SEARCH CRITERIA
    // =====================================

    function advancedSearchMatches(book) {
        const criteria = currentAdvancedSearch;

        if (Object.keys(criteria).length === 0) {
            return true;
        }

        const author = getBookMetadata(
            book,
            "author",
            ".book-author"
        );

        const title = getBookMetadata(
            book,
            "title",
            ".book-content h3"
        );

        const otherAuthors = getBookMetadata(
            book,
            "otherAuthors",
            null
        );

        const collection = getBookMetadata(
            book,
            "collection",
            ".book-series"
        );

        const isbn = getBookMetadata(
            book,
            "isbn",
            null
        );

        const cobissId = getBookMetadata(
            book,
            "cobissId",
            null
        );

        const keywords = getBookMetadata(
            book,
            "keywords",
            null
        );

        const year = Number(book.dataset.year) || 0;


        // ---------------------------------
        // AUTHOR / EDITOR
        // ---------------------------------

        if (
            criteria.author &&
            !matchesText(author, criteria.author)
        ) {
            return false;
        }


        // ---------------------------------
        // TITLE
        // ---------------------------------

        if (
            criteria.title &&
            !matchesText(title, criteria.title)
        ) {
            return false;
        }


        // ---------------------------------
        // OTHER AUTHORS
        // ---------------------------------

        if (
            criteria.otherAuthors &&
            !matchesText(otherAuthors, criteria.otherAuthors)
        ) {
            return false;
        }


        // ---------------------------------
        // COLLECTION
        // ---------------------------------

        if (
            criteria.collection &&
            !matchesText(collection, criteria.collection)
        ) {
            return false;
        }


        // ---------------------------------
        // ISBN
        // ---------------------------------

        if (
            criteria.isbn &&
            !matchesIdentifier(isbn, criteria.isbn)
        ) {
            return false;
        }


        // ---------------------------------
        // COBISS-ID
        // ---------------------------------

        if (
            criteria.cobissId &&
            !matchesIdentifier(cobissId, criteria.cobissId)
        ) {
            return false;
        }


        // ---------------------------------
        // KEYWORDS
        //
        // Every entered word must be present
        // somewhere in the combined metadata.
        // Word order does not matter.
        // ---------------------------------

        if (criteria.keywords) {
            const words = normalizeSearchText(
                criteria.keywords
            )
                .split(/\s+/)
                .filter(Boolean);

            const bookSearchableText = normalizeSearchText(
                [
                    keywords,
                    title,
                    author,
                    otherAuthors,
                    collection
                ].join(" ")
            );

            const allWordsMatch = words.every(word =>
                bookSearchableText.includes(word)
            );

            if (!allWordsMatch) {
                return false;
            }
        }


        // ---------------------------------
        // PUBLICATION YEAR / YEAR RANGE
        // ---------------------------------

        if (criteria.yearFrom || criteria.yearTo) {
            if (!year) {
                return false;
            }

            if (
                criteria.yearFrom &&
                year < Number(criteria.yearFrom)
            ) {
                return false;
            }

            if (
                criteria.yearTo &&
                year > Number(criteria.yearTo)
            ) {
                return false;
            }
        }

        return true;
    }


    // =====================================
    // READ FORM CRITERIA
    // =====================================

    function readAdvancedSearchForm() {
        const criteria = {};

        Object.entries(advancedSearchFields).forEach(
            ([key, field]) => {
                if (!field) {
                    return;
                }

                const value = field.value.trim();

                if (value !== "") {
                    criteria[key] = value;
                }
            }
        );

        return criteria;
    }


    // =====================================
    // VALIDATE YEAR RANGE
    // =====================================

    function validateYearRange() {
        const yearFrom = advancedSearchFields.yearFrom;
        const yearTo = advancedSearchFields.yearTo;

        if (!yearFrom || !yearTo) {
            return true;
        }

        const from = yearFrom.value.trim();
        const to = yearTo.value.trim();

        if (
            from &&
            to &&
            Number(from) > Number(to)
        ) {
            if (advancedSearchStatus) {
                advancedSearchStatus.textContent =
                    "Začetno leto ne sme biti poznejše od končnega leta.";
            }

            yearFrom.focus();
            return false;
        }

        return true;
    }


    // =====================================
    // UPDATE BOOKS
    //
    // Use the existing global updateBooks()
    // from script.js.
    // =====================================

    function refreshBooks() {
        if (typeof window.updateBooks === "function") {
            window.updateBooks();
        }
    }


    // =====================================
    // FORM SUBMISSION
    // =====================================

    if (advancedSearchForm) {
        advancedSearchForm.addEventListener(
            "submit",
            event => {
                event.preventDefault();

                if (!validateYearRange()) {
                    return;
                }

                currentAdvancedSearch =
                    readAdvancedSearchForm();

                refreshBooks();

            }
        );
    }


    // =====================================
    // RESET ADVANCED SEARCH
    // =====================================

    if (advancedSearchForm) {
        advancedSearchForm.addEventListener(
            "reset",
            () => {
                currentAdvancedSearch = {};

                if (advancedSearchStatus) {
                    advancedSearchStatus.textContent = "";
                }

                // Reset runs after the browser resets
                // the form fields. No timer is needed:
                // the criteria are already cleared.
                refreshBooks();
            }
        );
    }


    // =====================================
    // OPEN / CLOSE PANEL
    // =====================================

    function setAdvancedSearchOpen(open) {
        if (!advancedSearchPanel || !advancedSearchToggle) {
            return;
        }

        advancedSearchPanel.hidden = !open;

        advancedSearchToggle.setAttribute(
            "aria-expanded",
            String(open)
        );

        if (open) {
            advancedSearchPanel.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        } else {
            advancedSearchToggle.focus();
        }
    }


    if (advancedSearchToggle && advancedSearchPanel) {
        advancedSearchToggle.addEventListener(
            "click",
            () => {
                setAdvancedSearchOpen(
                    advancedSearchPanel.hidden
                );
            }
        );
    }


    if (advancedSearchClose) {
        advancedSearchClose.addEventListener(
            "click",
            () => {
                setAdvancedSearchOpen(false);
            }
        );
    }


    // =====================================
    // ESCAPE KEY
    // =====================================

    document.addEventListener("keydown", event => {
        if (
            event.key === "Escape" &&
            advancedSearchPanel &&
            !advancedSearchPanel.hidden
        ) {
            setAdvancedSearchOpen(false);
        }
    });


    // =====================================
    // PUBLIC INTERFACE
    // =====================================

    window.AdvancedSearch = {
        matches: advancedSearchMatches,

        getCriteria() {
            return { ...currentAdvancedSearch };
        },

        reset() {
            currentAdvancedSearch = {};
        }
    };

})();