export default (id = '0', { tag = 'section', title = 'Добавление книги' }, book = {}) => `
<${tag} class="content editor-wrapper" data-form-id='${id}'>
  <form action="#" id="book-editor"  class="editor">
    <fieldset name="bookFields">
      <legend class="editor__title">${title}</legend>
      <div class="editor__item">
        <label class="editor__label" for="book-title"> Наименование </label>
        <input
          class="editor__input"
          type="text"
          name="title" id="book-title"
          value="${book.title || ''}"
        />
      </div>
      <div class="editor__item">
        <label class="editor__label" for="book-author"> Автор </label>
        <input
          class="editor__input"
          type="text" name="author"
          id="book-author"
          value="${book.author || ''}"
        />
      </div>
      <div class="editor__item">
        <label class="editor__label" for="book-year"> Год выпуска </label>
        <input
          class="editor__input"
          type="text" name="year"
          id="book-year"
          value="${book.year || ''}"
        />
      </div>
      <div class="editor__item">
        <div class="file">
          <label class="editor__label" for="book-cover"> Изображение </label>
          <input
            type="file"
            name="fileCover"
            id="file-input"
            accept=".jpg, .png, .gif, .webp"
            class="file-input"
            tabindex="-1"
          />
          <input id="book-cover"
            type="text"
            class="editor__input"
            name="cover"
            value="${book.cover || ''}"
          />
          <div class="file-preview"></div>
        </div>
      </div>
      <div class="editor__controls">
        <input type="submit" class="editor__btn btn" value="Сохранить" name="save" />
        <input type="reset" class="editor__btn btn" value="Отменить" />
      </div>
    </fieldset>
  </form>
</${tag}>
`;
