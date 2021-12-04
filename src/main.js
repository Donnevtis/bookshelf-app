import './scss/style.scss';
import editorTemplate from './editor';
import bookTemplate from './book';
import initBooks from './books.json';
import { nanoid } from 'nanoid';
import coverPlaceholder from './assets/book-cover-placeholder.png';

const EDITOR = {
  title: 'Редактивание книги',
  tag: 'li',
};
const CREATOR = {
  title: 'Добавление книги',
  tag: 'section',
};

class Books {
  constructor() {
    this.books = this.#getBooksFromStorage() || initBooks;
    this.#updateStorage();
  }
  addBook(book) {
    this.books[book.id] = book;
    this.#updateStorage();
  }
  editBook(id, book) {
    if (!this.books[id]) return;
    this.books[id] = { id, ...book };
    this.#updateStorage();
  }
  removeBook(id) {
    console.log(this.books[id], id);
    if (this.books[id]) delete this.books[id];
    this.#updateStorage();
  }
  getBook(id) {
    return this.books[id] || null;
  }
  #getBooksFromStorage() {
    return JSON.parse(localStorage.getItem('booksDataList'));
  }
  #updateStorage() {
    localStorage.setItem('booksDataList', JSON.stringify(this.books));
    // clear the localStorage if there are no more books
    if (!Object.keys(this.#getBooksFromStorage()).length) localStorage.clear();
  }
}

class UI {
  createHTML(str) {
    const template = document.createElement('template');
    template.innerHTML = str;
    return template.content;
  }
}

class BookEditor extends UI {
  constructor(
    id,
    kind,
    book = {
      title: '',
      author: '',
      year: '',
      cover: '',
    },
  ) {
    super();
    this.book = book;
    this.form = this.createHTML(editorTemplate(id, kind, book));
  }
  set node(elem) {
    const fieldset = elem.querySelector('fieldset');
    const { title, author, year, cover, save } = fieldset.elements;
    this.HTMLnode = elem;
    this.fields = { title, author, year, cover };
    this.submit = save;
  }
  get node() {
    return this.HTMLnode;
  }
  //get clear values from HTML elements
  get bookData() {
    return Object.fromEntries(Object.entries(this.fields).map(([_, { value }]) => [_, value]));
  }

  valideChanges() {
    //init fields validation
    if (this.valide === void 0) this.validation();
    return this.valide;
  }
  validation() {
    const invalid = new Set();
    const isEmpty = v => !v.length;
    const maxLength = n => v => v.length > n;
    const maxYear = n => v => +v > n;

    const validate = (target, validators) => {
      if (validators.find(v => v(target.value))) {
        invalid.add(target);
        target.classList.add('editor__input_warn');
      } else {
        invalid.delete(target);
        target.classList.remove('editor__input_warn');
      }
      this.valide = !invalid.size;
      this.submit.disabled = invalid.size;
    };

    Object.values(this.fields).forEach(field => {
      const validators = [isEmpty];
      if (field.name === 'year')
        validators.push(maxLength(4), maxYear(new Date().getFullYear() + 2));
      validate(field, validators);
      field.addEventListener('input', e => validate(e.target, validators));
    });
  }
}

class List extends UI {
  constructor(books) {
    super();
    this.books = books;
  }
  editors = {};
  bookList = document.getElementById('book-list');
  stub = document.getElementById('stub');
  createBook(b) {
    return this.createHTML(bookTemplate(b));
  }

  createBooklist(books) {
    books.forEach(book => {
      this.addBookToList(book);
    });
  }
  addBookToList(book) {
    const bookNode = this.createBook(book);
    this.bookList.append(bookNode);
    const cover = this.bookList.lastChild.querySelector('img');
    cover.onerror = () => (cover.src = coverPlaceholder);
  }
  addNewBook(...args) {
    this.books.addBook(...args);
    this.addBookToList(...args);
  }
  editBook(id, book, bookItem) {
    const cover = bookItem.querySelector('.book__cover img');
    const title = bookItem.querySelector('.book__title');
    const author = bookItem.querySelector('.book__author');
    const year = bookItem.querySelector('.book__year');

    title.innerHTML = book.title;
    author.innerHTML = book.author;
    year.firstChild.data = book.year;
    cover.src = book.cover;

    this.books.editBook(id, book);
  }
  removeBook(id) {
    if (this.editors[id]) this.closeEditor(id);
    document.getElementById(id).remove();
    this.books.removeBook(id);
  }
  // add form to list
  inject(id, bookEditor, prevElem) {
    if (!id || !prevElem) return;
    if (this.editors[id]) {
      // this.closeEditor(id);
      return;
    }

    // inject form to list
    prevElem.after(bookEditor.form);
    bookEditor.node = document.querySelector(`[data-form-id="${id}"]`);
    // start animation
    setTimeout(() => bookEditor.node.classList.add('editor-wrapper_show'), 0);

    bookEditor.node.addEventListener('click', e => {
      e.preventDefault();
      if (e.target.type === 'reset') this.closeEditor(id);
      if (e.target.type === 'submit') {
        if (!bookEditor.valideChanges()) return;
        this.closeEditor(id);
        if (id === '0') this.addNewBook({ id: nanoid(10), ...bookEditor.bookData });
        else this.editBook(id, bookEditor.bookData, prevElem);
      }
    });

    this.editors[id] = bookEditor.node;
  }
  closeEditor(id) {
    this.editors[id].classList.remove('editor-wrapper_show');
    setTimeout(() => {
      this.editors[id].remove();
      delete this.editors[id];
    }, 500);
  }
  openCreator() {
    const id = '0';
    this.inject(id, new BookEditor(id, CREATOR), this.stub);
  }
  openEditor(id, book) {
    this.inject(id, new BookEditor(id, EDITOR, book), document.getElementById(id));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const books = new Books();
  const list = new List(books);

  list.createBooklist(Object.values(books.books));
  //handle booklist evenst
  list.bookList.addEventListener('click', ({ target }) => {
    const id = target.dataset?.id;
    if (target.classList.contains('book__controls_delete')) {
      list.removeBook(id);
    }
    if (target.classList.contains('book__controls_edit')) {
      list.openEditor(id, books.getBook(id));
    }
  });
  //add new book
  document.querySelector('.add-btn').addEventListener('click', () => list.openCreator());
});
