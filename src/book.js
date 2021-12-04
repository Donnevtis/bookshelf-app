import coverPlaceholder from './assets/book-cover-placeholder.png';

export default book => {
  const { id, title, author, year, cover } = book;

  if (!id || !title) throw Error('Book data error');

  return `
    <li class="book" id="${id}">
        <picture class="book__cover">
        <img
            src="${cover || coverPlaceholder}"
            alt="book cover"
        />
        </picture>
        <div class="book__body">
        <div class="book__info">
            <h3 class="book__title">${title}</h3>
            <p class="book__author">${author || ''}</p>
            <p class="book__year">${year || ''}<span>г.</span></p>
        </div>
        <div class="book__controls">
            <button data-id="${id}" class="book__controls_edit btn">Редактировать</button>
            <button data-id="${id}" class="book__controls_delete btn">Удалить</button>
        </div>
        </div>
    </li>`;
};