myLibrary = []
const tableModule = (() => {
    //CACHE DOM
    const bookTable = document.getElementById(`tableBody`);
    const table = document.querySelector(`table`);
    const searchBar = document.getElementById(`searchBar`);

    //LISTENERS
    table.addEventListener(`click`, handleTableClick);
    searchBar.addEventListener('input', updateTable);

    function updateTable() {
        resetTable();
        const displayLibrary = filterBooks(); //if using search bar
        if (!displayLibrary.length) return;
        for (let i = 0; i < displayLibrary.length; i++) {
            createRow(displayLibrary[i]);
        }
    }

    function resetTable() {
        let i = 0
        while (bookTable.firstChild || i > 10000) {
            i++;
            bookTable.removeChild(bookTable.firstChild);
        }
    }

    function filterBooks() {
        const search = searchBar.value.toLowerCase();
        return myLibrary.filter(book => (book.title.toLowerCase().includes(search) || book.author.toLowerCase().includes(search)));
    }

    function createRow(currentBook) {

        const bookRow = document.createElement(`tr`);
        const bookTitle = document.createElement(`td`);
        const bookAuthor = document.createElement(`td`);
        const coverType = document.createElement(`td`);
        const checkedOut = document.createElement(`td`);
        const viewIconCell = document.createElement(`td`);
        const viewIcon = document.createElement(`span`);
        const removeIconCell = document.createElement(`td`);
        const removeIcon = document.createElement(`span`);

        //Matches the book row with the object
        bookRow.dataset.indexNumber = currentBook.bookID;

        bookTitle.innerText = currentBook.title;
        bookAuthor.innerText = currentBook.author;
        coverType.innerText = currentBook.coverType;
        checkedOut.innerText = currentBook.checkedOut ? `Checked Out` : `Available`;
        viewIcon.innerText = `visibility`;
        removeIcon.innerText = `close`;

        viewIconCell.classList.add(`icons-cell`);
        removeIconCell.classList.add(`icons-cell`);
        viewIcon.classList.add(`material-icons-outlined`, `view`);
        removeIcon.classList.add(`material-icons-outlined`, `remove`);
        checkedOut.classList.add(`checked-out-cell`);

        bookTable.appendChild(bookRow);
        bookRow.appendChild(bookTitle);
        bookRow.appendChild(bookAuthor);
        bookRow.appendChild(coverType);
        bookRow.appendChild(checkedOut);
        bookRow.appendChild(viewIconCell);
        bookRow.appendChild(removeIconCell);

        viewIconCell.appendChild(viewIcon);
        removeIconCell.appendChild(removeIcon);
    }

    //TABLE FUNCTIONALITY
    function handleTableClick(event) {
        if (event.target.classList.contains(`remove`)) removeBook(event);
        else if (event.target.classList.contains(`view`)) viewBookInfo(event);
        else if (event.target.classList.contains(`checked-out-cell`)) changeBookStatus(event);
        else if (event.target.classList.contains(`table-header-text`)) handleSorting(event);
    }

    function removeBook(event) {
        const targetBook = findBookIndex(event);
        myLibrary[targetBook].removeBook();
        updateDisplay();
    }

    function viewBookInfo(event) {
        const targetBook = findBookIndex(event);
        myLibrary[targetBook].showBookInfo();
    }

    function changeBookStatus(event) {
        const targetBook = findBookIndex(event);
        myLibrary[targetBook].checkOut();
        updateDisplay();
    }

    function findBookIndex(event) {
        let rowIndexNumber = parseInt(event.target.parentNode.dataset.indexNumber);
        if (event.target.tagName.toLowerCase() === `span`) {
            rowIndexNumber = parseInt(event.target.parentNode.parentNode.dataset.indexNumber);
        }
        return myLibrary.findIndex(book => book.bookID === rowIndexNumber);
    }

    function handleSorting(event) {
        if (event.target.innerText === ``) return;
        const sortParam = getSortParameter(event);
        const sortDirection = getSortDirection(event);
        sortLibrary(sortDirection, sortParam);
        updateDisplay();
    }

    function getSortParameter(event) {
        if (event.target.innerText === `Status`) return `checkedOut`;
        else if (event.target.innerText === `Title`) return `title`;
        else if (event.target.innerText === `Author`) return `author`;
        else if (event.target.innerText === `Cover`) return `coverType`;
        else return `BookID`;
    }

    function getSortDirection(event) {
        const sortArrow = event.target.parentNode.lastElementChild;
        const resetArrows = document.querySelectorAll(`.header-arrow`);

        for (let i = 0; i < resetArrows.length; i++) {
            if (sortArrow !== resetArrows[i]) {
                resetArrows[i].innerText = ``;
            }
        }

        if (sortArrow.innerText === `` || sortArrow.innerText === `expand_more`) {
            sortArrow.innerText = `expand_less`;
            return `ascending`;
        } else {
            sortArrow.innerText = `expand_more`;
            return `descending`;
        }
    }

    function sortLibrary(sortDirection, sortParam) {
        if (sortParam === `bookID`) {
            myLibrary = myLibrary.sort((a, b) => (a[sortParam] > b[sortParam]) ? 1 : -1);
            return;
        }

        if (sortDirection === `ascending`) {
            myLibrary = myLibrary.sort(function (a, b) {
                if (a[sortParam].toString().toLowerCase() > b[sortParam].toString().toLowerCase()) return 1;
                else if (a[sortParam].toString().toLowerCase() === b[sortParam].toString().toLowerCase()) return 0;
                else return -1;
            });
        } else if (sortDirection === `descending`) {
            myLibrary = myLibrary.sort(function (a, b) {
                if (a[sortParam].toString().toLowerCase() > b[sortParam].toString().toLowerCase()) return -1;
                else if (a[sortParam].toString().toLowerCase() === b[sortParam].toString().toLowerCase()) return 0;
                else return 1;
            });
        }
    }
})();