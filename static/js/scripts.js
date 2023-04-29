const addBookModule = (() => {
    //CACHE DOM
    const formBackground = document.getElementById(`formBackground`);
    const formContainer = document.getElementById(`formContainer`);
    const submitButton = document.getElementById(`submitButton`);
    const addBookButton = document.getElementById(`addBookButton`);
    const exitForm = document.getElementById(`closeForm`);

    //LISTENERS
    addBookButton.addEventListener(`click`, showForm);
    exitForm.addEventListener(`click`, closeForm);
    formBackground.addEventListener(`click`, closeForm);
    submitButton.addEventListener(`click`, submitBook);

    //HANDLE FORM
    function showForm() {
        document.getElementById(`bookTitle`).value = ``;
        document.getElementById(`bookAuthor`).value = ``;
        document.getElementById(`coverType`).value = `Paperback`;
        document.getElementById(`price`).value = ``;
        document.getElementById(`availableSwitch`).checked = true;
        formContainer.classList.add(`show`);
        formBackground.classList.add(`show`);
    }

    function closeForm() {
        formContainer.classList.remove(`show`);
        formBackground.classList.remove(`show`);
    }

    function getJsonObject() {
        return JSON.stringify({
            "title": $('#bookTitle')[0].value,
            "price": parseFloat($('#price')[0].value),
            "paperback": ($('#coverType')[0].value == "Paperback"),
            "available": ($('#availableSwitch')[0].value == "on"),
            "authors": $('#bookAuthor')[0].value.replace(/,\s/g, ",").split(',')
        })
    }

    function updateTable(handleData) {
        $.ajax({
            method: "GET",
            url: "/api/books/",
            success: function (data) {
                handleData(data)
            }
        });
    }

    function booksPostAPI() {
        const jsonFormData = getJsonObject();
        return $.ajax({
            type: 'POST',
            url: '/api/books/',
            data: jsonFormData,
            dataType: 'json',
            contentType: 'application/JSON',
            success: function () {
                console.log(jsonFormData);
            }
        })
    }

    async function submitBook() {
        if (invalidForm()) return;
        await booksPostAPI();
        closeForm();
        updateTable(function (data) {
            $("tbody").empty();
            $.each(data, function (key, value) {
                const title = value.title;
                const cover = value.paperback ? "Paperback" : "Hardback";
                const authors = value.authors.map(function (author) {
                    return author['name'];
                }).join(", ");
                const price = value.price;
                $("tbody").append(
                    `<tr><td>` + title + `</td><td>` + authors + `</td><td>` + cover + `</td><td>$` + price + `</td><td><span class="material-icons-outlined edit">edit</span></td><td><span class="material-icons-outlined edit">close</span></td></tr>`
                )
            })
        });
    }

    function invalidForm() {
        let invalid = false;
        const invalidIndicator = document.querySelectorAll(`small`);

        for (let i = 0; i < invalidIndicator.length; i++) {
            invalidIndicator[i].classList.remove(`show`);
        }

        if (addBookForm.elements[`bookTitle`].value === ``) {
            document.getElementById('invalidTitle').classList.add(`show`);
            invalid = true;
        }
        if (addBookForm.elements[`bookAuthor`].value === ``) {
            document.getElementById('invalidAuthor').classList.add(`show`);
            invalid = true;
        }
        if (addBookForm.elements[`price`].value === `` || parseFloat(addBookForm.elements[`price`].value) < 0) {
            document.getElementById('invalidPrice').classList.add(`show`);
            invalid = true;
        }
        return invalid;
    }
})();

// myLibrary = []
const tableModule = (() => {
    // // CACHE DOM
    // const bookTable = document.getElementById(`tableBody`);
    // const table = document.querySelector(`table`);
    // const searchBar = document.getElementById(`searchBar`);

    // //LISTENERS
    // table.addEventListener(`click`, handleTableClick);
    // searchBar.addEventListener('input', updateTable);

    // //TABLE FUNCTIONALITY
    // function handleTableClick(event) {
    //     if (event.target.classList.contains(`remove`)) removeBook(event);
    //     else if (event.target.classList.contains(`edit`)) viewBookInfo(event);
    //     else if (event.target.classList.contains(`checked-out-cell`)) changeBookStatus(event);
    //     else if (event.target.classList.contains(`table-header-text`)) handleSorting(event);
    // }

    // function removeBook(event) {
    //     const targetBook = findBookIndex(event);
    //     myLibrary[targetBook].removeBook();
    //     updateDisplay();
    // }

    // function viewBookInfo(event) {
    //     const targetBook = findBookIndex(event);
    //     myLibrary[targetBook].showBookInfo();
    // }

    // function changeBookStatus(event) {
    //     const targetBook = findBookIndex(event);
    //     myLibrary[targetBook].checkOut();
    //     updateDisplay();
    // }

    // function findBookIndex(event) {
    //     let rowIndexNumber = parseInt(event.target.parentNode.dataset.indexNumber);
    //     if (event.target.tagName.toLowerCase() === `span`) {
    //         rowIndexNumber = parseInt(event.target.parentNode.parentNode.dataset.indexNumber);
    //     }
    //     return myLibrary.findIndex(book => book.bookID === rowIndexNumber);
    // }

    // function handleSorting(event) {
    //     if (event.target.innerText === ``) return;
    //     const sortParam = getSortParameter(event);
    //     const sortDirection = getSortDirection(event);
    //     sortLibrary(sortDirection, sortParam);
    //     updateDisplay();
    // }

    // function getSortParameter(event) {
    //     if (event.target.innerText === `Status`) return `checkedOut`;
    //     else if (event.target.innerText === `Title`) return `title`;
    //     else if (event.target.innerText === `Author`) return `author`;
    //     else if (event.target.innerText === `Cover`) return `coverType`;
    //     else return `BookID`;
    // }

    // function getSortDirection(event) {
    //     const sortArrow = event.target.parentNode.lastElementChild;
    //     const resetArrows = document.querySelectorAll(`.header-arrow`);

    //     for (let i = 0; i < resetArrows.length; i++) {
    //         if (sortArrow !== resetArrows[i]) {
    //             resetArrows[i].innerText = ``;
    //         }
    //     }

    //     if (sortArrow.innerText === `` || sortArrow.innerText === `expand_more`) {
    //         sortArrow.innerText = `expand_less`;
    //         return `ascending`;
    //     } else {
    //         sortArrow.innerText = `expand_more`;
    //         return `descending`;
    //     }
    // }

    // function sortLibrary(sortDirection, sortParam) {
    //     if (sortParam === `bookID`) {
    //         myLibrary = myLibrary.sort((a, b) => (a[sortParam] > b[sortParam]) ? 1 : -1);
    //         return;
    //     }

    //     if (sortDirection === `ascending`) {
    //         myLibrary = myLibrary.sort(function (a, b) {
    //             if (a[sortParam].toString().toLowerCase() > b[sortParam].toString().toLowerCase()) return 1;
    //             else if (a[sortParam].toString().toLowerCase() === b[sortParam].toString().toLowerCase()) return 0;
    //             else return -1;
    //         });
    //     } else if (sortDirection === `descending`) {
    //         myLibrary = myLibrary.sort(function (a, b) {
    //             if (a[sortParam].toString().toLowerCase() > b[sortParam].toString().toLowerCase()) return -1;
    //             else if (a[sortParam].toString().toLowerCase() === b[sortParam].toString().toLowerCase()) return 0;
    //             else return 1;
    //         });
    //     }
    // }
})();
