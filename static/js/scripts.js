const formModule = (() => {
    let formMode = 'add';
    //CACHE DOM
    const formBackground = $(`#formBackground`)[0];
    const formContainer = $(`#formContainer`)[0];
    const exitForm = $(`#closeForm`)[0];
    const submitButton = $(`#submitButton`)[0];

    // LISTENERS
    exitForm.addEventListener(`click`, closeForm);
    formBackground.addEventListener(`click`, closeForm);

    async function showForm(mode, bookID = '') {
        submitButton.addEventListener(`click`, submitBook);
        submitButton.param = bookID;
        formMode = mode;

        if (formMode === 'add') {
            $(`#bookTitle`)[0].value = ``;
            $(`#bookAuthor`)[0].value = ``;
            $(`#coverType`)[0].value = `Paperback`;
            $(`#price`)[0].value = ``;
            $(`#availableSwitch`)[0].checked = true;
        }
        if (formMode === 'edit') {
            data = await ajaxModule.booksGETdetail(bookID);
            $(`#bookTitle`)[0].value = data.title;
            $(`#bookAuthor`)[0].value = data.authors.map(function (author) {
                return author['name'];
            }).join(", ");;
            $(`#coverType`)[0].value = data.paperback ? 'Paperback' : 'Hardback';
            $(`#price`)[0].value = data.price;
            $(`#availableSwitch`)[0].checked = data.available ? true : false;
        }
        formContainer.classList.add(`show`);
        formBackground.classList.add(`show`);
    }

    function closeForm() {
        formContainer.classList.remove(`show`);
        formBackground.classList.remove(`show`);
    }

    async function submitBook(event) {
        submitButton.removeEventListener(`click`, submitBook);
        const bookID = event.target.param;
        if (formMode === 'add') {
            if (addBookModule.invalidForm()) return;
            await ajaxModule.booksPOST();
        }
        if (formMode === 'edit') {
            await ajaxModule.booksPUT(bookID);
        }
        closeForm();
        ajaxModule.updateDisplay();
    }

    return { showForm, closeForm }
})();

const ajaxModule = (() => {

    function getJsonObject() {
        return JSON.stringify({
            "title": $('#bookTitle')[0].value,
            "price": parseFloat($('#price')[0].value),
            "paperback": ($('#coverType')[0].value == "Paperback"),
            "available": ($('#availableSwitch')[0].checked),
            "authors": $('#bookAuthor')[0].value.replace(/,\s/g, ",").split(',')
        })
    }

    async function booksPOST() {
        const jsonFormData = getJsonObject();
        return $.ajax({
            type: 'POST',
            url: '/api/books/',
            data: jsonFormData,
            dataType: 'json',
            contentType: 'application/JSON',
            success: function () {
                console.log('Book added')
                console.log(jsonFormData);
            }
        })
    }

    async function booksPUT(bookID) {
        const jsonFormData = getJsonObject();
        return $.ajax({
            type: 'PUT',
            url: `/api/books/${bookID}/`,
            data: jsonFormData,
            dataType: 'json',
            contentType: 'application/JSON',
            success: function () {
                console.log(`Book ${bookID} edited`)
                console.log(jsonFormData);
            }
        })
    }

    async function booksDEL(row, bookID) {
        return $.ajax({
            type: 'DELETE',
            url: `/api/books/${bookID}/`,
            success: function () {
                $(row).remove();
                console.log(`Book ${bookID} was deleted successfully`);
            }
        })
    }

    async function booksGETdetail(bookID) {
        return $.ajax({
            method: "GET",
            url: `/api/books/${bookID}/`,
            success: function () {
                console.log(`Book ${bookID} retrieved`);
            }
        });
    }

    async function booksGET(callback) {
        $.ajax({
            method: "GET",
            url: "/api/books/",
            success: function (data) {
                callback(data)
            }
        });
    }

    function createRows(data) {
        $("tbody").empty();
        $.each(data, function (key, value) {
            const id = value.id;
            const title = value.title;
            const cover = value.paperback ? "Paperback" : "Hardback";
            const authors = value.authors.map(function (author) {
                return author['name'];
            }).join(", ");
            const price = parseFloat(value.price).toFixed(2);
            $("tbody").append(
                `<tr><td class="book-id">` + id + `</td><td>` + title + `</td><td>` + authors + `</td><td>` + cover + `</td><td>$` + price + `</td><td class="icons-cell"><span class="material-icons-outlined edit">edit</span></td><td class="icons-cell"><span class="material-icons-outlined remove">close</span></td></tr>`
            )
        })
    }

    function updateDisplay() {
        booksGET(createRows);
    }


    return { booksPOST, booksDEL, booksPUT, booksGETdetail, updateDisplay }
})();

const addBookModule = (() => {
    //CACHE DOM
    const addBookButton = $(`#addBookButton`)[0];

    //LISTENERS
    addBookButton.addEventListener(`click`, () => { formModule.showForm('add') });

    // Add Book Form Validation
    function invalidForm() {
        let invalid = false;
        const invalidIndicator = document.querySelectorAll(`small`);

        for (let i = 0; i < invalidIndicator.length; i++) {
            invalidIndicator[i].classList.remove(`show`);
        }

        if (addBookForm.elements[`bookTitle`].value === ``) {
            $('#invalidTitle')[0].classList.add(`show`);
            invalid = true;
        }
        if (addBookForm.elements[`bookAuthor`].value === ``) {
            $('#invalidAuthor')[0].classList.add(`show`);
            invalid = true;
        }
        if (addBookForm.elements[`price`].value === `` || parseFloat(addBookForm.elements[`price`].value) < 0) {
            $('#invalidPrice')[0].classList.add(`show`);
            invalid = true;
        }
        return invalid;
    }

    return { invalidForm }
})();

const tableModule = (() => {
    // CACHE DOM
    const bookTable = $(`#tableBody`)[0];
    const table = $(`table`)[0];
    const searchBar = $(`#searchBar`)[0];

    //LISTENERS
    table.addEventListener(`click`, handleTableClick);
    // searchBar.addEventListener('input', updateTable);

    //TABLE FUNCTIONALITY
    function handleTableClick(event) {
        if (event.target.classList.contains(`remove`)) removeBook(event);
        else if (event.target.classList.contains(`edit`)) editBookInfo(event);
        // else if (event.target.classList.contains(`checked-out-cell`)) changeBookStatus(event);
        // else if (event.target.classList.contains(`table-header-text`)) handleSorting(event);
    }

    function findTableRow(event) {
        return event.target.parentNode.parentNode;
    }

    function findBookID(tableRow) {
        return tableRow.querySelector('.book-id').innerText;
    }

    async function removeBook(event) {
        const tableRow = findTableRow(event);
        const bookID = findBookID(tableRow);
        await ajaxModule.booksDEL(tableRow, bookID);
    }

    async function editBookInfo(event) {
        const tableRow = findTableRow(event);
        const bookID = findBookID(tableRow);
        formModule.showForm('edit', bookID);
    }

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



})();
