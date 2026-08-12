(function () {
  const grid = document.getElementById("catalogGrid");
  const chipRow = document.getElementById("colorChips");
  const resultCount = document.getElementById("resultCount");
  const clearFilters = document.getElementById("clearFilters");
  const modalOverlay = document.getElementById("modalOverlay");
  const modalClose = document.getElementById("modalClose");
  const scrollTop = document.getElementById("scrollTop");

  let activeColors = new Set();

  const colors = Array.from(new Set(FURISODE_ITEMS.flatMap((item) => item.colors)));

  function formatPrice(price) {
    return "¥" + price.toLocaleString("ja-JP");
  }

  function buildPriceHTML(item) {
    if (item.price === null || item.memberPrice === null) {
      return '<span class="price-tbd">価格未定</span>';
    }
    return (
      '<span class="price-row"><span class="price-label price-label--regular">通常価格</span>' +
      '<span class="price-value">' + formatPrice(item.price) + "</span></span>" +
      '<span class="price-row"><span class="price-label price-label--member">会員30%OFF</span>' +
      '<span class="price-value">' + formatPrice(item.memberPrice) + "</span></span>"
    );
  }

  function renderChips() {
    chipRow.innerHTML = "";

    const allChip = document.createElement("button");
    allChip.type = "button";
    allChip.className = "chip" + (activeColors.size === 0 ? " is-active" : "");
    allChip.textContent = "すべて";
    allChip.addEventListener("click", () => {
      activeColors.clear();
      renderChips();
      renderGrid();
    });
    chipRow.appendChild(allChip);

    colors.forEach((color) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip" + (activeColors.has(color) ? " is-active" : "");
      chip.textContent = color;
      chip.addEventListener("click", () => {
        if (activeColors.has(color)) {
          activeColors.delete(color);
        } else {
          activeColors.add(color);
        }
        renderChips();
        renderGrid();
      });
      chipRow.appendChild(chip);
    });
  }

  function getFilteredItems() {
    return FURISODE_ITEMS.filter((item) => {
      return activeColors.size === 0 || item.colors.some((color) => activeColors.has(color));
    });
  }

  function onImageError(img) {
    img.onerror = null;
    img.src = "images/placeholder.svg";
  }

  function renderGrid() {
    const items = getFilteredItems();
    resultCount.textContent = items.length + "件の振袖";
    grid.innerHTML = "";

    if (items.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "該当する振袖が見つかりませんでした。";
      grid.appendChild(empty);
      return;
    }

    items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "card";
      card.addEventListener("click", () => openModal(item));

      const badge = item.tags[0]
        ? '<span class="card__tag">' + item.tags[0] + "</span>"
        : "";

      const meta = [item.colors.join("・"), item.pattern].filter(Boolean).join(" ・ ");

      card.innerHTML =
        '<div class="card__image-wrap">' +
        badge +
        '<img src="' + item.image + '" alt="' + item.name + '" loading="lazy">' +
        "</div>" +
        '<div class="card__body">' +
        '<p class="card__name">' + item.name + "</p>" +
        '<p class="card__price">' + buildPriceHTML(item) + "</p>" +
        '<p class="card__meta">' + meta + "</p>" +
        "</div>";

      card.querySelector("img").addEventListener("error", function () {
        onImageError(this);
      });

      grid.appendChild(card);
    });
  }

  function openModal(item) {
    document.getElementById("modalImage").src = item.image;
    document.getElementById("modalImage").alt = item.name;
    document.getElementById("modalImage").onerror = function () {
      onImageError(this);
    };
    document.getElementById("modalName").textContent = item.name;
    document.getElementById("modalPrice").innerHTML = buildPriceHTML(item);
    document.getElementById("modalDescription").textContent = item.description;

    const tagsWrap = document.getElementById("modalTags");
    tagsWrap.innerHTML = "";
    [...item.colors, item.pattern, ...item.tags].filter(Boolean).forEach((tag) => {
      const span = document.createElement("span");
      span.textContent = tag;
      tagsWrap.appendChild(span);
    });

    const contactLink = document.getElementById("modalContact");
    contactLink.href =
      "mailto:info@example.com?subject=" +
      encodeURIComponent("【振袖カタログ】" + item.name + " について問い合わせ");

    modalOverlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modalOverlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  modalClose.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) closeModal();
  });

  clearFilters.addEventListener("click", () => {
    activeColors.clear();
    renderChips();
    renderGrid();
  });

  scrollTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", () => {
    scrollTop.classList.toggle("is-visible", window.scrollY > 400);
  });

  renderChips();
  renderGrid();
})();
