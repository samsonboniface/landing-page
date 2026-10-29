const accountStorageKey = 'bookshop-demo-account-email';
const protectedPages = new Set([
  'about.html',
  'blog.html',
  'contact.html',
  'feedback.html',
  'gallery.html',
  'products.html',
  'services.html',
  'team.html',
]);
const accountEmail = sessionStorage.getItem(accountStorageKey);
const isSignedIn = Boolean(accountEmail);
const currentPage = window.location.pathname.split('/').pop() || 'index.html';

document.documentElement.classList.toggle('authenticated', isSignedIn);

if (protectedPages.has(currentPage) && !isSignedIn) {
  window.location.replace(`login.html?returnTo=${encodeURIComponent(currentPage)}`);
} else if (document.body.classList.contains('auth-required')) {
  document.body.classList.remove('auth-required');
}

document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  document.querySelectorAll('.back-home').forEach((backLink) => {
    backLink.addEventListener('click', (event) => {
      if (window.history.length > 1) {
        event.preventDefault();
        window.history.back();
      }
    });
  });

  const yearNode = document.querySelector('#year');
  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }

  const updateAccountNavigation = (signedIn) => {
    document.querySelectorAll('.book-nav-actions').forEach((actions) => {
      const accountLink = actions.querySelector('.account-link');
      const loginLink = actions.querySelector('.bag-link');

      if (accountLink) accountLink.hidden = !signedIn;
      if (loginLink) {
        if (accountLink) {
          loginLink.hidden = signedIn;
        } else if (signedIn) {
          loginLink.textContent = 'Account';
        } else {
          loginLink.textContent = 'Login';
        }
      }
    });
  };

  updateAccountNavigation(Boolean(accountEmail));

  const loginForm = document.querySelector('.login-form');
  const accountPanel = document.querySelector('.account-panel');
  const accountEmailNode = document.querySelector('#account-email');
  const signOutButton = document.querySelector('.sign-out-button');
  const showAccount = (email) => {
    if (loginForm) loginForm.hidden = Boolean(email);
    if (accountPanel) accountPanel.hidden = !email;
    if (accountEmailNode && email) accountEmailNode.textContent = email;
  };

  if (accountEmail) showAccount(accountEmail);

  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const emailInput = loginForm.querySelector('#email');
      const passwordInput = loginForm.querySelector('#password');
      if (!emailInput || !passwordInput || !loginForm.reportValidity()) return;

      const email = emailInput.value.trim();
      sessionStorage.setItem(accountStorageKey, email);
      document.documentElement.classList.add('authenticated');
      showAccount(email);
      updateAccountNavigation(true);
      loginForm.reset();
      const returnTo = new URLSearchParams(window.location.search).get('returnTo');
      if (returnTo && protectedPages.has(returnTo)) {
        window.location.replace(returnTo);
      }
    });
  }

  if (signOutButton) {
    signOutButton.addEventListener('click', () => {
      sessionStorage.removeItem(accountStorageKey);
      document.documentElement.classList.remove('authenticated');
      showAccount('');
      updateAccountNavigation(false);
    });
  }

  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    // Show an honest confirmation: no backend receives the submitted message.
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const status = contactForm.querySelector('.form-status');
      if (status) {
        status.textContent = 'Thanks for your note. This demo does not send or store messages.';
      }
      contactForm.reset();
    });
  }

  const feedbackForm = document.querySelector('.feedback-form');
  if (feedbackForm) {
    // Feedback is validated in the browser only and is not saved or transmitted.
    feedbackForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const status = feedbackForm.querySelector('.form-status');
      if (status) {
        status.textContent = 'Thank you for your feedback. This demo does not send or store responses.';
      }
      feedbackForm.reset();
    });
  }

  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const status = newsletterForm.querySelector('.newsletter-status');
      if (status) {
        status.textContent = 'Thanks for your interest! This demo does not send or store email addresses.';
      }
      newsletterForm.reset();
    });
  }

  const bookCards = Array.from(document.querySelectorAll('.book-card'));
  const bookSearch = document.querySelector('#book-search');
  const filterButtons = Array.from(document.querySelectorAll('.filter-chip'));
  const resultsMessage = document.querySelector('#book-results');
  const noBooksMessage = document.querySelector('#no-books');
  let activeBookFilter = 'all';

  if (bookCards.length && bookSearch && filterButtons.length) {
    // Search titles and filter genres locally without a server or database.
    const filterBooks = () => {
      const query = bookSearch.value.trim().toLowerCase();
      let visibleBooks = 0;

      bookCards.forEach((card) => {
        const matchesGenre = activeBookFilter === 'all' || card.dataset.category === activeBookFilter;
        const matchesSearch = (card.dataset.search || '').includes(query);
        const isVisible = matchesGenre && matchesSearch;

        card.hidden = !isVisible;
        if (isVisible) visibleBooks += 1;
      });

      if (resultsMessage) {
        resultsMessage.textContent = `Showing ${visibleBooks} ${visibleBooks === 1 ? 'book' : 'books'}`;
      }
      if (noBooksMessage) {
        noBooksMessage.hidden = visibleBooks > 0;
      }
    };

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        activeBookFilter = button.dataset.filter || 'all';
        filterButtons.forEach((filterButton) => {
          const isActive = filterButton === button;
          filterButton.classList.toggle('active', isActive);
          filterButton.setAttribute('aria-pressed', String(isActive));
        });
        filterBooks();
      });
    });

    bookSearch.addEventListener('input', filterBooks);

    document.querySelectorAll('[data-mood]').forEach((moodLink) => {
      moodLink.addEventListener('click', () => {
        const matchingFilter = filterButtons.find((button) => button.dataset.filter === moodLink.dataset.mood);
        if (matchingFilter) matchingFilter.click();
      });
    });

    filterBooks();
  }

  const bagCount = document.querySelector('#bag-count');
  const addBookButtons = document.querySelectorAll('.add-book');
  if (bagCount && addBookButtons.length) {
    let itemCount = 0;

    addBookButtons.forEach((button) => {
      button.addEventListener('click', () => {
        itemCount += 1;
        bagCount.textContent = String(itemCount);
        bagCount.setAttribute('aria-label', `${itemCount} ${itemCount === 1 ? 'item' : 'items'} in bag`);

        const originalLabel = button.innerHTML;
        button.textContent = 'Added to bag ✓';
        button.disabled = true;
        window.setTimeout(() => {
          button.innerHTML = originalLabel;
          button.disabled = false;
        }, 900);
      });
    });
  }
});
