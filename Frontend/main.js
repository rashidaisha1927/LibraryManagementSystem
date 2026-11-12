import { createBook, deleteBook, getBooks, updateBook } from "./api.js";
import "./style.css";

const form = document.querySelector("#book-form");
const booksBody = document.querySelector("#books-body");
const bookCount = document.querySelector("#book-count");
const statusMessage = document.querySelector("#status-message");
const submitButton = document.querySelector("#submit-button");
const cancelEditButton = document.querySelector("#cancel-edit");
const refreshButton = document.querySelector("#refresh-button");
const fields = {
  bookName: document.querySelector("#book-name"),
  bookBorrower: document.querySelector("#book-borrower"),
  price: document.querySelector("#book-price"),
};

let books = [];
let editingId = null;

function showStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
}

function formatPrice(price) {
  const value = Number(price);
  return Number.isFinite(value) ? `Rs. ${value.toFixed(2)}` : "—";
}

function bookValue(book, camelCase, snakeCase) {
  return book[camelCase] ?? book[snakeCase] ?? "";
}

function renderBooks() {
  bookCount.textContent = `${books.length} book${books.length === 1 ? "" : "s"} on loan`;
  if (!books.length) {
    booksBody.innerHTML = '<tr><td class="empty-state" colspan="5">No borrowed books yet. Add the first one above.</td></tr>';
    return;
  }

  booksBody.innerHTML = books.map((book) => `
    <tr>
      <td>${escapeHtml(bookValue(book, "bookName", "book_name"))}</td>
      <td>${escapeHtml(bookValue(book, "bookBorrower", "borrowed_by"))}</td>
      <td>${formatPrice(book.price)}</td>
      <td class="actions">
        <button class="edit-button" type="button" data-edit-id="${book.id}">Edit</button>
        <button class="delete-button" type="button" data-delete-id="${book.id}">Delete</button>
      </td>
    </tr>
  `).join("");
}

function escapeHtml(value) {
  const node = document.createElement("span");
  node.textContent = value;
  return node.innerHTML;
}

async function loadBooks() {
  refreshButton.disabled = true;
  try {
    const { data } = await getBooks();
    books = Array.isArray(data) ? data : [];
    renderBooks();
    showStatus("");
  } catch (error) {
    books = [];
    renderBooks();
    showStatus(error.response?.data?.error || "Could not reach the backend. Start it on port 6777 and try again.", "error");
  } finally {
    refreshButton.disabled = false;
  }
}

function resetForm() {
  editingId = null;
  form.reset();
  submitButton.textContent = "Add book";
  cancelEditButton.classList.add("hidden");
}

function startEdit(id) {
  const book = books.find((item) => String(item.id) === String(id));
  if (!book) return;
  editingId = id;
  fields.bookName.value = bookValue(book, "bookName", "book_name");
  fields.bookBorrower.value = bookValue(book, "bookBorrower", "borrowed_by");
  fields.price.value = book.price ?? "";
  submitButton.textContent = "Save changes";
  cancelEditButton.classList.remove("hidden");
  fields.bookName.focus();
  showStatus(`Editing “${fields.bookName.value}”.`);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = {
    bookName: fields.bookName.value.trim(),
    bookBorrower: fields.bookBorrower.value.trim(),
    price: Number(fields.price.value),
  };

  if (!payload.bookName || !payload.bookBorrower || Number.isNaN(payload.price)) return;
  submitButton.disabled = true;
  try {
    if (editingId !== null) {
      await updateBook(editingId, payload);
      showStatus("Book updated successfully.", "success");

    } else {
    await createBook(payload);
    showStatus("Book added successfully.", "success");
  }


    resetForm();
    await loadBooks();
  } catch (error) {
    showStatus(error.response?.data?.error || "Unable to save the book. Please try again.", "error");
  } finally {
    submitButton.disabled = false;
  }
});

booksBody.addEventListener("click", async (event) => {
  const { editId, deleteId } = event.target.dataset;
  if (editId) startEdit(editId);
  if (!deleteId || !window.confirm("Delete this borrowed-book record?")) return;

  try {
    await deleteBook(deleteId);
    if (String(editingId) === String(deleteId)) resetForm();
    showStatus("Book deleted successfully.", "success");
    await loadBooks();
  } catch (error) {
    showStatus(error.response?.data?.error || "Unable to delete the book. Please try again.", "error");
  }
});

cancelEditButton.addEventListener("click", resetForm);
refreshButton.addEventListener("click", loadBooks);

loadBooks();
