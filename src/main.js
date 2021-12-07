import './scss/style.scss';
import editorTemplate from './editor';
import bookTemplate from './book';
import initBooks from './assets/books.json';
import { nanoid } from 'nanoid';

const coverPlaceholder = new URL('./assets/book-cover-placeholder.png', import.meta.url).href;
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
  scrollTo(el, timout = 300) {
    setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), timout);
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
    // start animation and scroll
    setTimeout(() => elem.classList.add('editor-wrapper_show'), 0);
    this.scrollTo(elem);

    const fieldset = elem.querySelector('fieldset');
    const { title, author, year, cover, save } = fieldset.elements;
    this.HTMLnode = elem;
    this.fields = { title, author, year, cover };
    this.submit = save;
  }
  get node() {
    return this.HTMLnode;
  }
  //get values from HTML elements
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
    const maxYear = n => v => +v > n;
    const onlyNumber = v => !/^\d+$/.test(v);

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
      const validators = [];

      switch (field.name) {
        case 'year':
          validators.push(maxYear(2017), onlyNumber);
          break;
        case 'title':
        case 'author':
          validators.push(isEmpty);
          break;
      }

      validate(field, validators);
      field.addEventListener('input', e => validate(e.target, validators));
    });
  }
  closeEditor() {
    this.node.classList.remove('editor-wrapper_show');
    setTimeout(() => {
      this.node.remove();
    }, 400);
  }
}

class List extends UI {
  editors = {};
  bookList = document.getElementById('book-list');
  stub = document.querySelector('.book-wrapper').firstChild;

  constructor(books) {
    super();
    this.books = books;
  }
  createBook(b) {
    return this.createHTML(bookTemplate(b));
  }
  createBooklist(books) {
    books.forEach(book => {
      this.addBookToList(book);
    });
  }
  addBookToList(bookData, scroll = false) {
    const bookNode = this.createBook(bookData);
    this.bookList.append(bookNode);
    const newBook = this.bookList.lastChild;
    const cover = newBook.querySelector('img');
    scroll && this.scrollTo(newBook);

    //set placeholder in case of an invalid link
    List.setCoverPlaceholder(cover);
  }
  addNewBook(bookData) {
    this.books.addBook(bookData);
    this.addBookToList(bookData, true);
  }
  editBook(id, book, bookItem) {
    const cover = bookItem.querySelector('.book__cover img');
    const title = bookItem.querySelector('.book__title');
    const author = bookItem.querySelector('.book__author');
    const year = bookItem.querySelector('.book__year');

    title.textContent = book.title;
    author.textContent = book.author;
    year.textContent = book.year ? book.year + 'г.' : '';
    cover.src = book.cover;

    //set placeholder in case of an invalid link
    List.setCoverPlaceholder(cover);
    this.scrollTo(bookItem, 500);
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

    bookEditor.node.addEventListener('click', e => {
      e.preventDefault();

      if (e.target.type === 'reset') {
        this.closeEditor(id);
      }
      if (e.target.type === 'submit') {
        if (!bookEditor.valideChanges()) return;
        this.closeEditor(id);
        if (id === '0') this.addNewBook({ id: nanoid(10), ...bookEditor.bookData });
        else this.editBook(id, bookEditor.bookData, prevElem);
      }
    });

    this.editors[id] = bookEditor;
  }
  openCreator() {
    const id = '0';
    console.log(this.stub);
    this.inject(id, new BookEditor(id, CREATOR), this.stub);
  }
  openEditor(id, book) {
    this.inject(id, new BookEditor(id, EDITOR, book), document.getElementById(id));
  }
  closeEditor(id) {
    this.editors[id].closeEditor();
    delete this.editors[id];
  }
  static setCoverPlaceholder = e => {
    e.onerror = () => {
      e.src = coverPlaceholder;
      e.onerror = () => {};
    };
  };
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
