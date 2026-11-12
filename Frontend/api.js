import axios from "axios";

const api = axios.create({
  baseURL: "/api/library",
  timeout: 10000,
});

export const getBooks = () => {
  console.log("Getting all books...");
  return api.get("");
};

export const createBook = (book) => {
  console.log("Creating a book...");
  return api.post("", book);
};
export const updateBook = (id, book) => {
  console.log("Updating a book...");
  return api.put(`/${id}`, book);
};

export const deleteBook = (id) => {
  console.log("Deleting a book...");
  return api.delete(`/${id}`);
};
